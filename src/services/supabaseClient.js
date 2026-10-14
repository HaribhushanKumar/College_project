import { createClient } from '@supabase/supabase-js';

// Supabase Project Credentials (Project: college-fund-mgmt, ID: gkbrcbmwmdrsywfjinfp, Region: ap-northeast-2)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://gkbrcbmwmdrsywfjinfp.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey || 'dummy_anon_key');

export default supabase;
