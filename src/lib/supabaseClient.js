import { createClient } from '@supabase/supabase-js';

// In a real Phase 3 environment, these come from .env
const supabaseUrl = (typeof import.meta.env !== 'undefined' ? import.meta.env.VITE_SUPABASE_URL : process.env.VITE_SUPABASE_URL) || 'https://mock-project.supabase.co';
const supabaseAnonKey = (typeof import.meta.env !== 'undefined' ? import.meta.env.VITE_SUPABASE_KEY : process.env.VITE_SUPABASE_KEY) || 'mock-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
