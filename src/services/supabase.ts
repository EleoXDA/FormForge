import { createClient, type SupabaseClient } from '@supabase/supabase-js'

/**
 * Environment variables for Supabase connection.
 * These are validated at runtime to provide helpful error messages.
 */
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
// alert(`URL=${String(supabaseUrl)} KEY=${String(supabaseKey).slice(0, 14)}`)

// Validate that environment variables are configured
if (!supabaseUrl || !supabaseKey) {
  console.error(
    'Missing Supabase environment variables. ' +
    'Please copy .env.example to .env.local and fill in your Supabase credentials.'
  )
}

/**
 * Singleton Supabase client instance.
 * 
 * Usage:
 * ```ts
 * import { supabase } from '@/services/supabase'
 * const { data, error } = await supabase.from('forms').select()
 * ```
 */
export const supabase: SupabaseClient = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseKey || 'placeholder-key',
  {
    auth: {
      // Persist session in localStorage
      persistSession: true,
      // Automatically refresh the session
      autoRefreshToken: true
    }
  }
)

/**
 * Check if Supabase is properly configured.
 * Useful for showing setup instructions in development.
 */
export function isSupabaseConfigured(): boolean {
  return Boolean(supabaseUrl && supabaseKey && !supabaseUrl.includes('placeholder'))
}