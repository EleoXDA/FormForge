import { createClient, type SupabaseClient } from '@supabase/supabase-js'

/**
 * Environment variables for Supabase connection.
 * These are validated at runtime to provide helpful error messages.
 */
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Validate that environment variables are configured
if (!supabaseUrl || !supabaseAnonKey) {
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
  supabaseAnonKey || 'placeholder-key',
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
  return Boolean(supabaseUrl && supabaseAnonKey && !supabaseUrl.includes('placeholder'))
}