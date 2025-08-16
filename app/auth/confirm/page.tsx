"use client";

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthContext } from '@/components/AuthProvider';
import { 
  TreePine, 
  CheckCircle, 
  AlertCircle, 
  Loader2,
  Home,
  LogIn,
  X
} from 'lucide-react';

export default function EmailConfirmationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, userProfile, loading } = useAuthContext();
  const [confirmationStatus, setConfirmationStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const handleEmailConfirmation = async () => {
      try {
        // Check if user is already authenticated
        if (user && userProfile) {
          console.log('User is already authenticated, redirecting to dashboard...');
          setConfirmationStatus('success');
          setMessage('Vous êtes déjà connecté. Redirection vers votre tableau de bord...');
          
          setTimeout(() => {
            if (userProfile.user_type === 'owner') {
              router.push('/dashboard/owner');
            } else if (userProfile.user_type === 'client') {
              router.push('/dashboard/client');
            } else {
              router.push('/');
            }
          }, 2000);
          return;
        }

        // Supabase sends 'code' parameter, not 'token'
        const code = searchParams.get('code');
        const type = searchParams.get('type');

        console.log('Email confirmation parameters:', { code: code ? 'present' : 'missing', type });

        if (!code) {
          setConfirmationStatus('error');
          setMessage('Code de confirmation manquant. Veuillez vérifier votre email.');
          return;
        }

        const response = await fetch('/api/auth/confirm', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: code, type }), // Send as 'token' to API
        });

        const result = await response.json();

        if (result.error) {
          console.error('Email confirmation API error:', result.error);
          setConfirmationStatus('error');
          setMessage('Erreur lors de la confirmation. Veuillez réessayer.');
          return;
        }

        setConfirmationStatus('success');
        setMessage(result.message || 'Email confirmé avec succès ! Redirection en cours...');

        // Redirect after 2 seconds
        setTimeout(() => {
          if (result.user_type === 'owner') {
            router.push('/dashboard/owner');
          } else if (result.user_type === 'client') {
            router.push('/dashboard/client');
          } else {
            router.push('/');
          }
        }, 2000);

      } catch (error) {
        console.error('Email confirmation error:', error);
        setConfirmationStatus('error');
        setMessage('Une erreur est survenue. Veuillez réessayer.');
      }
    };

    if (!loading) {
      handleEmailConfirmation();
    }
  }, [searchParams, user, userProfile, loading, router]);

  const handleReturnHome = () => {
    router.push('/');
  };

  const handleLogin = () => {
    router.push('/auth/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-green-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <img 
              src="/logo-white.png" 
              alt="AtypikHouse Logo" 
              className="w-20 h-20 object-contain"
            />
            <span className="text-xl font-bold text-[#2C3E37]">AtypikHouse</span>
          </div>
          <button 
            onClick={handleReturnHome}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="text-center">
          {/* Icons */}
          <div className="flex flex-col items-center space-y-4 mb-6">
            <img 
              src="/logo-svg.png" 
              alt="AtypikHouse Logo" 
              className="w-20 h-20 object-contain"
            />
            {confirmationStatus === 'loading' && (
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
              </div>
            )}
            {confirmationStatus === 'success' && (
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            )}
            {confirmationStatus === 'error' && (
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
            )}
          </div>

          {/* Status Message */}
          <div className="mb-8">
            {confirmationStatus === 'loading' && (
              <>
                <h1 className="text-2xl font-bold text-[#2C3E37] mb-2">
                  Confirmation en cours...
                </h1>
                <p className="text-gray-600">
                  Vérification de votre email
                </p>
              </>
            )}
            {confirmationStatus === 'success' && (
              <>
                <h1 className="text-2xl font-bold text-[#2C3E37] mb-2">
                  Email confirmé !
                </h1>
                <p className="text-gray-600">
                  {message}
                </p>
              </>
            )}
            {confirmationStatus === 'error' && (
              <>
                <h1 className="text-2xl font-bold text-[#2C3E37] mb-2">
                  Erreur de confirmation
                </h1>
                <p className="text-gray-600">
                  {message}
                </p>
              </>
            )}
          </div>

          {/* Action Buttons */}
          {confirmationStatus === 'error' && (
            <div className="space-y-4">
              <button
                onClick={handleReturnHome}
                className="w-full bg-[#4A7C59] hover:bg-[#2C3E37] text-white py-4 rounded-xl font-medium transition-all duration-200 flex items-center justify-center space-x-2"
              >
                <Home className="w-5 h-5" />
                <span>Retour à l'accueil</span>
              </button>
              <button
                onClick={handleLogin}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-4 rounded-xl font-medium transition-all duration-200 flex items-center justify-center space-x-2"
              >
                <LogIn className="w-5 h-5" />
                <span>Se connecter</span>
              </button>
            </div>
          )}

          {confirmationStatus === 'success' && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
              <p className="text-green-700 text-sm">
                Redirection automatique vers votre tableau de bord...
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 