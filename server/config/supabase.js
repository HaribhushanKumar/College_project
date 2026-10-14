import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

// Supabase Project Credentials (Project: college-fund-mgmt, ID: gkbrcbmwmdrsywfjinfp, Region: ap-northeast-2)
export const SUPABASE_PROJECT_ID = process.env.SUPABASE_PROJECT_ID || 'gkbrcbmwmdrsywfjinfp';
export const SUPABASE_URL = process.env.SUPABASE_URL || `https://${SUPABASE_PROJECT_ID}.supabase.co`;
export const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || '';

if (!SUPABASE_SERVICE_ROLE_KEY) {
  console.warn('⚠️  [Supabase Warning]: SUPABASE_SERVICE_ROLE_KEY is not set in .env.');
  console.warn('👉 Get your key from: https://supabase.com/dashboard/project/gkbrcbmwmdrsywfjinfp/settings/api');
}

// Create administrative backend Supabase client
export const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY || 'dummy_key_for_init', {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

/**
 * Health check helper to test active connection to your Supabase project
 */
export async function testSupabaseConnection() {
  try {
    const { data, error } = await supabase.from('universities').select('university_id, name').limit(1);
    if (error) {
      return { connected: false, message: error.message };
    }
    return { connected: true, data };
  } catch (err) {
    return { connected: false, message: err.message };
  }
}

export default supabase;
