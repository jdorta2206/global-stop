// src/lib/supabase/server.ts
import { createPagesServerClient } from '@supabase/auth-helpers-nextjs';
import { NextApiRequest, NextApiResponse } from 'next';

export const crearClienteSupabaseServidor = (req: NextApiRequest, res: NextApiResponse) => {
  return createPagesServerClient(
    { req, res },
    {
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL!,
      supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    }
  );
};