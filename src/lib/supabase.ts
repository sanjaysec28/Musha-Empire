import { createClient } from '@supabase/supabase-js';

export const isSupabaseConfigured: boolean = Boolean(
  import.meta.env.VITE_SUPABASE_URL &&
  import.meta.env.VITE_SUPABASE_ANON_KEY &&
  !import.meta.env.VITE_SUPABASE_URL.includes('placeholder-project') &&
  import.meta.env.VITE_SUPABASE_URL.startsWith('http')
);

const supabaseUrl = isSupabaseConfigured
  ? import.meta.env.VITE_SUPABASE_URL
  : 'https://placeholder-project.supabase.co';

const supabaseAnonKey = isSupabaseConfigured
  ? import.meta.env.VITE_SUPABASE_ANON_KEY
  : 'placeholder-anon-key';

// Approved backend for Musha Empire is Firebase Authentication and Cloud Firestore.
// Supabase remains in dormant standby mode without emitting unconfigured warnings.


// Custom safe fetch that intercepts network calls if Supabase is unconfigured,
// avoiding "TypeError: Failed to fetch" browser errors.
const safeFetch: typeof fetch = async (input, init) => {
  if (!isSupabaseConfigured) {
    const urlStr = typeof input === 'string' ? input : input instanceof URL ? input.toString() : (input as Request)?.url || '';
    if (urlStr.includes('/auth/v1/')) {
      return new Response(JSON.stringify({ user: null, session: null }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    return new Response(JSON.stringify([]), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Range': '0-0/0',
      },
    });
  }
  return fetch(input, init);
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  global: {
    fetch: safeFetch,
  },
  auth: {
    persistSession: true,
    autoRefreshToken: isSupabaseConfigured,
    detectSessionInUrl: isSupabaseConfigured,
  },
});

