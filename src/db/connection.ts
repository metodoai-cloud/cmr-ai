// ============================================================================
// Supabase Connection Module
// Single source of truth for database access
// ============================================================================

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import ws from 'ws';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error(
    'Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env file'
  );
}

// Service role client — full access, used by backend services only
export const supabase: SupabaseClient = createClient(
  supabaseUrl,
  supabaseServiceKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
    realtime: {
      transport: ws as any,
    },
  }
);

// Anon client — respects RLS, used for frontend-proxied requests
export const supabaseAnon: SupabaseClient = createClient(
  supabaseUrl,
  supabaseAnonKey || supabaseServiceKey,
  {
    realtime: {
      transport: ws as any,
    },
  }
);

export { supabaseUrl, supabaseAnonKey, supabaseServiceKey };
