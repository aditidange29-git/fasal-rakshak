import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    '[Fasal-Rakshak] Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env — ' +
    'database features will not work until these are filled in.'
  )
}

// createClient is called even without keys so the module loads cleanly;
// actual DB calls will fail with an auth error until the .env is filled in.
export const supabase = createClient(supabaseUrl ?? '', supabaseAnonKey ?? '')
