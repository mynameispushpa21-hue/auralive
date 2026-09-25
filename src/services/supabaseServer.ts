import { createSupabaseContext, withSupabase, unauthorizedResponse } from '@supabase/server';

/**
 * Server-side Supabase Context and Utilities using @supabase/server
 * Used in server handlers, API routes, or Edge Functions.
 */
export const supabaseServerConfig = {
  supabaseUrl: process.env.SUPABASE_URL || 'https://rfkigpyehwcogmdnauik.supabase.co',
  publishableKey: process.env.SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_8O9V72MbNlgyRxLq9kGI7w_AScupRT2',
  secretKey: process.env.SUPABASE_SECRET_KEY,
  jwksUrl: process.env.SUPABASE_JWKS_URL || 'https://rfkigpyehwcogmdnauik.supabase.co/auth/v1/.well-known/jwks.json',
};

export { createSupabaseContext, withSupabase, unauthorizedResponse };
