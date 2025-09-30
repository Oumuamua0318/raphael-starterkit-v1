import { createClient } from "@supabase/supabase-js";

export const createServiceRoleClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  // Check if Supabase credentials are configured
  if (!supabaseUrl || !supabaseKey || supabaseUrl.includes('your_supabase')) {
    console.warn('⚠️ Supabase service role not configured. Running in demo mode.');
    // Return a mock client for demo purposes
    return {
      auth: {
        admin: {
          createUser: async () => ({ data: null, error: null }),
          deleteUser: async () => ({ data: null, error: null }),
        },
      },
      from: () => ({
        select: () => ({
          eq: () => ({
            single: async () => ({ data: null, error: null }),
          }),
        }),
        insert: async () => ({ data: null, error: null }),
        update: () => ({
          eq: async () => ({ data: null, error: null }),
        }),
      }),
    } as any;
  }

  return createClient(
    supabaseUrl,
    supabaseKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
};
