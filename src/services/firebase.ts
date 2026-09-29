import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getDatabase } from "firebase/database";

// Configuration imported from google-services.json (project_id: live-41437)
export const firebaseConfig = {
  apiKey: "AIzaSyBY6KWxzUOysikniJeoU2RbvcrtMooXTZM",
  authDomain: "live-41437.firebaseapp.com",
  databaseURL: "https://live-41437-default-rtdb.firebaseio.com",
  projectId: "live-41437",
  storageBucket: "live-41437.firebasestorage.app",
  messagingSenderId: "13791129869",
  appId: "1:13791129869:android:a177355e050761baf94044"
};

// Initialize Firebase App
export const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const rtdb = getDatabase(app);

export default app;
