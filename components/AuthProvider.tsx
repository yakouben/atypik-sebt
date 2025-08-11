"use client";

import { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter, usePathname } from 'next/navigation';

interface AuthContextType {
  user: any;
  session: any;
  loading: boolean;
  userProfile: any;
  signIn: (email: string, password: string) => Promise<{ data: any; error: any }>;
  signUp: (email: string, password: string, userData: any) => Promise<{ data: any; error: any }>;
  signOut: () => Promise<{ error: any }>;
  resetPassword: (email: string) => Promise<{ error: any }>;
  getUserProfile: (userId: string) => Promise<{ data: any; error: any }>;
  getOwnerProperties: (ownerId: string) => Promise<{ data: any; error: any }>;
  getOwnerBookings: (ownerId: string) => Promise<{ data: any; error: any }>;
  getClientBookings: (clientId: string) => Promise<{ data: any; error: any }>;
  getPublishedProperties: () => Promise<{ data: any; error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const auth = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isInitialized, setIsInitialized] = useState(false);
  const [lastRedirect, setLastRedirect] = useState<string>('');

  useEffect(() => {
    if (!auth.loading) {
      setIsInitialized(true);
      
      // Handle authentication state changes with optimized redirects
      if (auth.user && auth.userProfile) {
        // User is authenticated and has a profile
        const userType = auth.userProfile.user_type;
        
        // Don't redirect if already on dashboard pages or auth pages
        const isOnDashboard = pathname.includes('/dashboard');
        const isOnAuthPage = pathname.includes('/auth');
        const isOnConfirmPage = pathname.includes('/auth/confirm');
        const isOnPropertyPage = pathname.includes('/properties/');
        
        if (!isOnDashboard && !isOnAuthPage && !isOnConfirmPage && !isOnPropertyPage) {
          // Prevent rapid redirects
          const redirectPath = userType === 'owner' ? '/dashboard/owner' : '/dashboard/client';
          if (lastRedirect !== redirectPath) {
            setLastRedirect(redirectPath);
            router.push(redirectPath);
          }
        }
      } else if (auth.user && !auth.userProfile) {
        // User is authenticated but no profile - wait for profile to load
        // Don't redirect yet
      } else {
        // User is not authenticated - only redirect if necessary
        const isOnAuthPage = pathname.includes('/auth');
        const isOnHomePage = pathname === '/';
        const isOnBlogPage = pathname === '/blog';
        
        if (!isOnAuthPage && !isOnHomePage && !isOnBlogPage) {
          const redirectPath = '/';
          if (lastRedirect !== redirectPath) {
            setLastRedirect(redirectPath);
            router.push(redirectPath);
          }
        }
      }
    }
  }, [auth.user, auth.userProfile, auth.loading, router, pathname, lastRedirect]);

  const value = {
    user: auth.user,
    session: auth.session,
    loading: auth.loading,
    userProfile: auth.userProfile,
    signIn: auth.signIn,
    signUp: auth.signUp,
    signOut: auth.signOut,
    resetPassword: auth.resetPassword,
    getUserProfile: auth.getUserProfile,
    getOwnerProperties: auth.getOwnerProperties,
    getOwnerBookings: auth.getOwnerBookings,
    getClientBookings: auth.getClientBookings,
    getPublishedProperties: auth.getPublishedProperties
  };

  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
} 