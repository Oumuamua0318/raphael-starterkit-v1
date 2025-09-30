import { createBrowserClient } from "@supabase/ssr";

export const createClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Check if Supabase credentials are configured
  if (!supabaseUrl || !supabaseKey || supabaseUrl.includes('your_supabase')) {
    console.warn('⚠️ Supabase not configured. Running in demo mode.');
    // Return a mock client for demo purposes
    return {
      auth: {
        getUser: async () => ({ data: { user: null }, error: null }),
        getSession: async () => ({ data: { session: null }, error: null }),
        signOut: async () => ({ error: null }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      },
      from: () => ({
        select: () => ({
          eq: () => ({
            single: async () => ({ data: null, error: null }),
            limit: () => ({ single: async () => ({ data: null, error: null }) }),
          }),
          order: () => ({
            limit: () => ({ single: async () => ({ data: null, error: null }) }),
          }),
        }),
        insert: async () => ({ data: null, error: null }),
        update: () => ({
          eq: async () => ({ data: null, error: null }),
        }),
        delete: () => ({
          eq: async () => ({ data: null, error: null }),
        }),
      }),
      rpc: async () => ({ data: true, error: null }),
    } as any;
  }

  return createBrowserClient(supabaseUrl, supabaseKey);
};
