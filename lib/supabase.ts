// lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

let supabaseClient: ReturnType<typeof createClient> | null = null

export const supabase = {
  get client() {
    if (!supabaseClient) {
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL
      const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

      if (!url || !key) {
        // Build vaqtida xato bermaydi, faqat runtime’da null qaytaradi
        return null
      }

      supabaseClient = createClient(url, key)
    }
    return supabaseClient
  },
}