import { createClient } from '@supabase/supabase-js'

// NOTE: replace these environment variables in your .env or hosting provider
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.warn('Supabase credentials are not set. Please configure REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_ANON_KEY');
}

export const supabase = createClient(supabaseUrl, supabaseKey);