import { createClient } from '@supabase/supabase-js'

// Guard client creation so Next's build/prerender doesn't require envs at build time.
// In the browser, envs (NEXT_PUBLIC_*) will be inlined and available.
let supabase = null;
if (typeof window !== 'undefined') {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  if (!supabaseUrl || !supabaseAnonKey) {
    // Soft-fail in client if somehow missing; avoids build-time crash.
    // eslint-disable-next-line no-console
    console.warn('Supabase client missing NEXT_PUBLIC envs');
  } else {
    supabase = createClient(supabaseUrl, supabaseAnonKey)
  }
}

export { supabase }
