import { createClient } from "@supabase/supabase-js";

import logger from './logger.js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// basic sanity check so we fail early during development
if (!supabaseUrl || !supabaseKey) {
  logger.error("Supabase env vars missing:", { supabaseUrl, supabaseKey });
  throw new Error(
    "Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY. " +
      "Make sure you have a .env file at the project root with the correct values."
  );
}

// validate URL format
try {
  new URL(supabaseUrl);
} catch (err) {
  logger.error("Malformed Supabase URL:", supabaseUrl);
  throw new Error(
    "VITE_SUPABASE_URL is not a valid URL. " +
      "It should look like https://abcd1234.supabase.co"
  );
}

// do not log in production
if (import.meta.env.MODE === 'development') {
  logger.debug("Supabase URL:", supabaseUrl);
}

const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;