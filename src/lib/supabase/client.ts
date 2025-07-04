// src/lib/supabase/client.ts
import { createPagesBrowserClient } from '@supabase/auth-helpers-nextjs';

export const createClient = () => {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    throw new Error(
      'Supabase URL and Anon Key must be defined in environment variables'
    );
  }

  return createPagesBrowserClient({
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
    supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  });
};

export type SupabaseClient = ReturnType<typeof createClient>;