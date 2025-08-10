import { createClient } from '@supabase/supabase-js'
import { createBrowserClient } from '@supabase/ssr'
import { createServerClient as createSSRServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Client-side Supabase client
export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey)

// Server-side Supabase client with cookies
export const createServerClient = (cookieStore: ReturnType<typeof cookies>) => {
  return createSSRServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        } catch {
          // The `setAll` method was called from a Server Component.
          // This can be ignored if you have middleware refreshing
          // user sessions.
        }
      },
    },
  })
}

// Legacy server client (for backward compatibility)
export const createLegacyServerClient = () => {
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}

// Database types
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string
          user_type: 'owner' | 'client'
          address?: string
          what_you_own?: string
          reservation_type?: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name: string
          user_type: 'owner' | 'client'
          address?: string
          what_you_own?: string
          reservation_type?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string
          user_type?: 'owner' | 'client'
          address?: string
          what_you_own?: string
          reservation_type?: string
          created_at?: string
          updated_at?: string
        }
      }
      properties: {
        Row: {
          id: string
          owner_id: string
          name: string
          type: string
          description: string
          price_per_night: number
          location: string
          images: string[]
          amenities: string[]
          max_guests: number
          rating: number
          is_available: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          owner_id: string
          name: string
          type: string
          description: string
          price_per_night: number
          location: string
          images?: string[]
          amenities?: string[]
          max_guests: number
          rating?: number
          is_available?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          owner_id?: string
          name?: string
          type?: string
          description?: string
          price_per_night?: number
          location?: string
          images?: string[]
          amenities?: string[]
          max_guests?: number
          rating?: number
          is_available?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      bookings: {
        Row: {
          id: string
          property_id: string
          client_id: string
          check_in_date: string
          check_out_date: string
          total_price: number
          status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
          guest_count: number
          special_requests?: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          property_id: string
          client_id: string
          check_in_date: string
          check_out_date: string
          total_price: number
          status?: 'pending' | 'confirmed' | 'cancelled' | 'completed'
          guest_count: number
          special_requests?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          property_id?: string
          client_id?: string
          check_in_date?: string
          check_out_date?: string
          total_price?: number
          status?: 'pending' | 'confirmed' | 'cancelled' | 'completed'
          guest_count?: number
          special_requests?: string
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
} 