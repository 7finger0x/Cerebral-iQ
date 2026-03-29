import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('[CiQ.Auth] Critical: Supabase credentials missing from Environment.');
}

export const supabase = createClient(
  supabaseUrl || 'https://missing-credentials.supabase.co', 
  supabaseAnonKey || 'missing-key'
);
