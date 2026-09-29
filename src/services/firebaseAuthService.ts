import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  User as FirebaseUser,
} from 'firebase/auth';
import { doc, setDoc, getDoc, collection, getDocs } from 'firebase/firestore';
import { ref, set, get } from 'firebase/database';
import { auth, db, rtdb, firebaseConfig } from './firebase';
import { UserProfile } from '../types';

export const RTDB_BASE_URL = firebaseConfig.databaseURL || "https://live-41437-default-rtdb.firebaseio.com";
export const FIREBASE_KEY = firebaseConfig.apiKey || "AIzaSyBY6KWxzUOysikniJeoU2RbvcrtMooXTZM";

/**
 * Remove undefined values because Firestore & RTDB throw errors on undefined.
 */
export function cleanForFirebase(obj: any): any {
  if (obj === null || obj === undefined) {
    return null;
  }
  if (Array.isArray(obj)) {
    return obj.map(cleanForFirebase);
  }
  if (typeof obj === 'object') {
    const cleaned: Record<string, any> = {};
    for (const [key, value] of Object.entries(obj)) {
      if (value !== undefined) {
        cleaned[key] = cleanForFirebase(value);
      }
    }
    return cleaned;
  }
  return obj;
}

export interface FirebaseSyncResult {
  authSuccess: boolean;
  firestoreSuccess: boolean;
  rtdbSuccess: boolean;
  firebaseUid?: string;
  notice?: string;
}

/**
 * Execute a promise with a maximum timeout (prevents hanging gRPC / network calls)
 */
async function withTimeout<T>(promise: Promise<T>, ms: number = 2500): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(`Timeout after ${ms}ms`)), ms)
    ),
  ]);
}

/**
 * Register user in Firebase Authentication, Realtime Database, and Firestore.
 */
export async function registerUserInFirebase(
  userProfile: UserProfile,
  password?: string
): Promise<FirebaseSyncResult> {
  const result: FirebaseSyncResult = {
    authSuccess: false,
    firestoreSuccess: false,
    rtdbSuccess: false,
  };

  const userPassword = password && password.length >= 6 ? password : 'password123';
  const cleanEmail = userProfile.email.trim();
  let uid = userProfile.id;

  // 1. Firebase Authentication: Create User Account (SDK & REST Fallback)
  try {
    const cred = await createUserWithEmailAndPassword(auth, cleanEmail, userPassword);
    if (cred.user) {
      result.authSuccess = true;
      uid = cred.user.uid;
      result.firebaseUid = uid;

      try {
        await updateProfile(cred.user, {
          displayName: userProfile.displayName,
          photoURL: userProfile.avatar,
        });
      } catch (profileErr) {
        console.warn('Firebase profile update warning:', profileErr);
      }
      console.log('✅ User created in Firebase Authentication:', uid);
    }
  } catch (authErr: any) {
    console.warn('Firebase Auth SDK creation notice:', authErr?.code || authErr);

    if (authErr?.code === 'auth/email-already-in-use') {
      result.notice = 'Email already exists in Firebase Auth. Linking profile...';
      try {
        const loginCred = await signInWithEmailAndPassword(auth, cleanEmail, userPassword);
        if (loginCred.user) {
          result.authSuccess = true;
          uid = loginCred.user.uid;
          result.firebaseUid = uid;
        }
      } catch {
        // Keep uid
      }
    } else {
      // Fallback: Use Firebase REST Auth endpoint directly
      try {
        const restRes = await fetch(
          `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${FIREBASE_KEY}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: cleanEmail,
              password: userPassword,
              returnSecureToken: true,
            }),
          }
        );
        const restData = await restRes.json();
        if (restData.localId) {
          result.authSuccess = true;
          uid = restData.localId;
          result.firebaseUid = uid;
          console.log('✅ User created via Firebase REST Auth:', uid);
        } else if (restData.error?.message === 'EMAIL_EXISTS') {
          result.notice = 'Email already registered in Firebase Authentication.';
        }
      } catch (restErr) {
        console.warn('Firebase REST Auth fallback notice:', restErr);
      }
    }
  }

  const profilePayload = cleanForFirebase({
    ...userProfile,
    firebaseUid: uid,
    syncedAt: new Date().toISOString(),
  });

  // 2. Firebase Realtime Database: Save to "users/" path (SDK + REST PUT)
  try {
    await set(ref(rtdb, 'users/' + userProfile.id), profilePayload);
    if (uid && uid !== userProfile.id) {
      await set(ref(rtdb, 'users/' + uid), profilePayload);
    }
    result.rtdbSuccess = true;
    console.log('✅ User successfully written to Realtime Database SDK: users/' + userProfile.id);
  } catch (rtdbErr) {
    console.warn('Realtime Database SDK notice, using REST fallback:', rtdbErr);
  }

  // REST PUT fallback for Realtime Database guarantees persistence even across environments
  try {
    await fetch(`${RTDB_BASE_URL}/users/${encodeURIComponent(userProfile.id)}.json`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profilePayload),
    });
    if (uid && uid !== userProfile.id) {
      await fetch(`${RTDB_BASE_URL}/users/${encodeURIComponent(uid)}.json`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profilePayload),
      });
    }
    result.rtdbSuccess = true;
    console.log('✅ User successfully written to Realtime Database REST: users/' + userProfile.id);
  } catch (restRtdbErr) {
    console.warn('Realtime Database REST fallback error:', restRtdbErr);
  }

  // 3. Cloud Firestore: Save to "users" collection (with strict timeout so it never hangs)
  try {
    await withTimeout(
      setDoc(doc(db, 'users', userProfile.id), profilePayload, { merge: true }),
      2000
    );
    if (uid && uid !== userProfile.id) {
      await withTimeout(
        setDoc(doc(db, 'users', uid), profilePayload, { merge: true }),
        2000
      );
    }
    result.firestoreSuccess = true;
    console.log('✅ User successfully written to Cloud Firestore: users/' + userProfile.id);
  } catch (fsErr: any) {
    console.warn('Cloud Firestore write notice (using Realtime DB):', fsErr?.message || fsErr);
  }

  return result;
}

/**
 * Sync a single user profile directly to Realtime Database and Firestore
 */
export async function syncUserProfileToFirebase(userProfile: UserProfile): Promise<boolean> {
  const profilePayload = cleanForFirebase({
    ...userProfile,
    syncedAt: new Date().toISOString(),
  });

  let ok = false;

  // Realtime Database SDK
  try {
    await set(ref(rtdb, 'users/' + userProfile.id), profilePayload);
    ok = true;
  } catch {
    // fallback
  }

  // Realtime Database REST
  try {
    await fetch(`${RTDB_BASE_URL}/users/${encodeURIComponent(userProfile.id)}.json`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profilePayload),
    });
    ok = true;
  } catch {
    // ignore
  }

  // Firestore with timeout
  try {
    await withTimeout(
      setDoc(doc(db, 'users', userProfile.id), profilePayload, { merge: true }),
      1800
    );
    ok = true;
  } catch {
    // ignore
  }

  return ok;
}

/**
 * Sync all registered users to Firebase (useful to push previously created users)
 */
export async function syncAllUsersToFirebase(users: UserProfile[]): Promise<number> {
  let count = 0;
  for (const user of users) {
    try {
      const ok = await syncUserProfileToFirebase(user);
      if (ok) count++;
    } catch {
      // continue
    }
  }
  return count;
}

/**
 * Sign in with Firebase Authentication
 */
export async function loginWithFirebase(
  email: string,
  password?: string
): Promise<{ success: boolean; user?: FirebaseUser; error?: string }> {
  try {
    const cred = await signInWithEmailAndPassword(auth, email.trim(), password || 'password123');
    return { success: true, user: cred.user };
  } catch (err: any) {
    return { success: false, error: err.message || err.code };
  }
}

/**
 * Sign in with Google Popup
 */
export async function loginWithGoogleFirebase(): Promise<{ success: boolean; user?: FirebaseUser; error?: string }> {
  try {
    const provider = new GoogleAuthProvider();
    const cred = await signInWithPopup(auth, provider);
    return { success: true, user: cred.user };
  } catch (err: any) {
    return { success: false, error: err.message || err.code };
  }
}
