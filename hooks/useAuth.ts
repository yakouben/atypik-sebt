import { useState, useEffect } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

interface AuthState {
  user: User | null
  session: Session | null
  loading: boolean
}

interface UserProfile {
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

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    loading: true
  })
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [profileCache, setProfileCache] = useState<Map<string, UserProfile>>(new Map())

  // Optimized profile loading with caching
  const loadUserProfile = async (userId: string, forceRefresh = false) => {
    try {
      // Check cache first (unless forcing refresh)
      if (!forceRefresh && profileCache.has(userId)) {
        const cachedProfile = profileCache.get(userId)
        if (cachedProfile) {
          setUserProfile(cachedProfile)
          return { data: cachedProfile, error: null }
        }
      }

      const { data: profile, error } = await getUserProfile(userId)
      if (profile) {
        // Cache the profile
        setProfileCache(prev => new Map(prev).set(userId, profile))
        setUserProfile(profile)
        return { data: profile, error: null }
      }
      return { data: null, error }
    } catch (error) {
      console.error('Error loading user profile:', error)
      return { data: null, error }
    }
  }

  // Optimized profile creation/update
  const ensureUserProfile = async (user: User) => {
    try {
      // Try to get existing profile first
      const { data: existingProfile } = await getUserProfile(user.id)
      
      if (existingProfile) {
        // Profile exists, update if needed
        const needsUpdate = !existingProfile.email && user.email
        if (needsUpdate) {
          await updateProfileWithUserData(existingProfile.id, user)
          const { data: updatedProfile } = await getUserProfile(user.id)
          if (updatedProfile) {
            setUserProfile(updatedProfile)
            setProfileCache(prev => new Map(prev).set(user.id, updatedProfile))
            return updatedProfile
          }
        }
        setUserProfile(existingProfile)
        setProfileCache(prev => new Map(prev).set(user.id, existingProfile))
        return existingProfile
      } else {
        // Create new profile
        const { data: newProfile } = await createDefaultProfile(user)
        if (newProfile) {
          setUserProfile(newProfile)
          setProfileCache(prev => new Map(prev).set(user.id, newProfile))
          return newProfile
        }
      }
      return null
    } catch (error) {
      console.error('Error ensuring user profile:', error)
      return null
    }
  }

  useEffect(() => {
    // Get initial session with optimized loading
    const getInitialSession = async () => {
      try {
      const { data: { session } } = await supabase.auth.getSession()
        
      setAuthState({
        user: session?.user ?? null,
        session,
        loading: false
      })

        // Load user profile if authenticated (parallel operation)
      if (session?.user) {
          ensureUserProfile(session.user)
        }
      } catch (error) {
        console.error('Error getting initial session:', error)
        setAuthState(prev => ({ ...prev, loading: false }))
      }
    }

    getInitialSession()

    // Optimized auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setAuthState({
          user: session?.user ?? null,
          session,
          loading: false
        })

        // Handle auth events efficiently
        if (event === 'SIGNED_IN' && session?.user) {
          // Load profile in background without blocking UI
          ensureUserProfile(session.user)
        } else if (event === 'SIGNED_OUT') {
          setUserProfile(null)
          setProfileCache(new Map())
        } else if (event === 'TOKEN_REFRESHED' && session?.user) {
          // Only refresh profile if not cached
          if (!profileCache.has(session.user.id)) {
            ensureUserProfile(session.user)
          }
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const updateProfileWithUserData = async (profileId: string, user: User) => {
    try {
      console.log('Updating profile with user data:', user.email)
      
      // Get user metadata from auth
      const userMetadata = user.user_metadata || {}
      const fullName = userMetadata.full_name || user.email?.split('@')[0] || 'Utilisateur'
      const userType = userMetadata.user_type || 'client'

      const { error } = await supabase
        .from('profiles')
        .update({
          email: user.email || '',
          full_name: fullName,
          user_type: userType,
          updated_at: new Date().toISOString()
        })
        .eq('id', profileId)

      if (error) {
        console.error('Error updating profile with user data:', error)
      } else {
        console.log('Profile updated successfully with user data')
      }
    } catch (error) {
      console.error('Exception updating profile with user data:', error)
    }
  }

  const createDefaultProfile = async (user: User): Promise<{ data: UserProfile | null; error: any }> => {
    try {
      console.log('Creating default profile for user:', user.email)
      
      // Get user metadata from auth
      const userMetadata = user.user_metadata || {}
      const fullName = userMetadata.full_name || user.email?.split('@')[0] || 'Utilisateur'
      const userType = userMetadata.user_type || 'client'

      const { data, error } = await supabase
        .from('profiles')
        .insert({
          id: user.id,
          email: user.email || '',
          full_name: fullName,
          user_type: userType,
          address: '',
          what_you_own: '',
          reservation_type: ''
        })
        .select()
        .single()

      if (error) {
        console.error('Error creating default profile:', error)
        return { data: null, error }
      }

      console.log('Default profile created successfully:', data)
      return { data, error: null }
    } catch (error) {
      console.error('Exception creating default profile:', error)
      return { data: null, error }
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      // Set loading state immediately for better UX
      setAuthState(prev => ({ ...prev, loading: true }))
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      
      if (error) {
        setAuthState(prev => ({ ...prev, loading: false }))
        throw error
      }
      
      // Don't wait for profile loading - let it happen in background
      // This makes the login feel much faster
      if (data.user) {
        // Profile will be loaded by the auth state change listener
        setAuthState(prev => ({ ...prev, loading: false }))
      }
      
      return { data, error: null }
    } catch (error) {
      setAuthState(prev => ({ ...prev, loading: false }))
      return { data: null, error }
    }
  }

  const signUp = async (email: string, password: string, userData: {
    full_name: string
    user_type: 'owner' | 'client'
    address?: string
    what_you_own?: string
    reservation_type?: string
  }) => {
    try {
      console.log('Starting signup with data:', { email, full_name: userData.full_name, user_type: userData.user_type });
      
      // Check if Supabase is configured
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        console.error('Supabase environment variables not configured');
        return { 
          data: null, 
          error: { 
            message: 'Configuration error: Supabase credentials not found. Please check your environment variables.' 
          } 
        };
      }

      // Create the auth user first
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: userData.full_name,
            user_type: userData.user_type
          },
          emailRedirectTo: `${window.location.origin}/auth/confirm`
        }
      })
      
      console.log('Auth signup response:', { authData, authError });
      
      if (authError) {
        console.error('Auth signup error:', authError);
        throw authError;
      }

      if (authData.user) {
        console.log('User created successfully:', authData.user.id);
        
        // Wait a moment for the auth user to be fully created
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        // Try to create profile in profiles table
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: authData.user.id,
            email,
            full_name: userData.full_name,
            user_type: userData.user_type,
            address: userData.address || '',
            what_you_own: userData.what_you_own || '',
            reservation_type: userData.reservation_type || ''
          })

        if (profileError) {
          console.error('Profile creation error:', profileError)
          // If profile creation fails, we should still return success for auth
          // The profile can be created later when the user logs in
          // This is a common issue with RLS policies during signup
          return { data: authData, error: null }
        }
        
        console.log('Profile created successfully');
      }

      return { data: authData, error: null }
    } catch (error) {
      console.error('SignUp error:', error)
      return { data: null, error }
    }
  }

  const signOut = async () => {
    try {
      console.log('Starting sign out process...');
      
      // Clear local state first
      setAuthState({
        user: null,
        session: null,
        loading: false
      });
      setUserProfile(null);
      
      // Call Supabase signOut
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Supabase signOut error:', error);
        throw error;
      }
      
      // Clear any stored data in localStorage/sessionStorage
      if (typeof window !== 'undefined') {
        // Clear Supabase auth tokens
        localStorage.removeItem('supabase.auth.token');
        localStorage.removeItem('sb-access-token');
        localStorage.removeItem('sb-refresh-token');
        
        // Clear any other auth-related data
        sessionStorage.clear();
        
        // Clear any cookies that might be set
        document.cookie.split(";").forEach(function(c) { 
          document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
        });
      }
      
      console.log('Sign out successful, redirecting to landing page...');
      
      // Redirect to landing page
      if (typeof window !== 'undefined') {
        window.location.href = '/';
      }
      
      return { error: null };
    } catch (error) {
      console.error('SignOut error:', error);
      return { error };
    }
  }

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`
      })
      if (error) throw error
      return { error: null }
    } catch (error) {
      return { error }
    }
  }

  const getUserProfile = async (userId: string) => {
    try {
      console.log('Fetching profile for user ID:', userId)
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        console.log('Profile fetch error:', error)
        if (error.code === 'PGRST116') {
          console.log('Profile not found, will create default')
          return { data: null, error: null }
        }
        throw error
      }
      
      console.log('Profile fetched successfully:', data)
      return { data, error: null }
    } catch (error) {
      console.error('Exception in getUserProfile:', error)
      return { data: null, error }
    }
  }

  // Owner-specific functions
  const getOwnerProperties = async (ownerId: string) => {
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('owner_id', ownerId)
        .order('created_at', { ascending: false })

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }

  const getOwnerBookings = async (ownerId: string) => {
    try {
      console.log('🔄 AUTH HOOK: Fetching owner bookings for:', ownerId);
      
      // Use our new API endpoint instead of direct Supabase query
      const response = await fetch(`/api/bookings/owner?ownerId=${ownerId}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ AUTH HOOK: API response error:', errorData);
        throw new Error(errorData.error || 'Failed to fetch bookings');
      }
      
      const result = await response.json();
      console.log('✅ AUTH HOOK: API response received:', result);
      console.log('📊 AUTH HOOK: Bookings count:', result.data?.length || 0);
      
      if (result.data) {
        console.log('🏠 AUTH HOOK: Property names in response:', result.data.map(b => ({
          bookingId: b.id,
          propertyName: b.property?.name,
          propertyLocation: b.property?.location,
          hasImages: b.property?.images?.length > 0
        })));
      }
      
      return { data: result.data, error: null };
    } catch (error) {
      console.error('❌ AUTH HOOK: Exception in getOwnerBookings:', error);
      return { data: null, error };
    }
  }

  // Client-specific functions
  const getClientBookings = async (clientId: string) => {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          properties(name, location, images),
          profiles!bookings_property_id_fkey(full_name)
        `)
        .eq('client_id', clientId)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching client bookings:', error)
        throw error
      }
      return { data, error: null }
    } catch (error) {
      console.error('Exception in getClientBookings:', error)
      return { data: null, error }
    }
  }

  const getPublishedProperties = async () => {
    try {
      const { data, error } = await supabase
        .from('properties')
        .select(`
          *,
          profiles!properties_owner_id_fkey(full_name)
        `)
        .eq('is_published', true)
        .eq('is_available', true)
        .order('created_at', { ascending: false })

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }

  return {
    user: authState.user,
    session: authState.session,
    loading: authState.loading,
    userProfile,
    signIn,
    signUp,
    signOut,
    resetPassword,
    getUserProfile,
    getOwnerProperties,
    getOwnerBookings,
    getClientBookings,
    getPublishedProperties
  }
} 