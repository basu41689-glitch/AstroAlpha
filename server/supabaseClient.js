import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with service role key (server-side only)
export function initSupabaseClient() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('SUPABASE_URL and SUPABASE_SERVICE_KEY must be set in .env');
  }

  return createClient(supabaseUrl, supabaseServiceKey);
}

export const supabase = initSupabaseClient();
