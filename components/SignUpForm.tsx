"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthContext } from './AuthProvider';
import { 
  User, 
  Mail, 
  Users, 
  Lock, 
  Eye, 
  EyeOff, 
  TreePine,
  X,
  ArrowRight
} from 'lucide-react';

interface UserData {
  full_name: string;
  email: string;
  user_type: 'owner' | 'client';
  password: string;
  confirmPassword: string;
}

export default function SignUpForm() {
  const router = useRouter();
  const { signUp } = useAuthContext();
  const [userData, setUserData] = useState<UserData>({
    full_name: '',
    email: '',
    user_type: 'client',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (field: keyof UserData, value: string) => {
    setUserData(prev => ({ ...prev, [field]: value }));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (userData.password !== userData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    if (userData.password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    setLoading(true);

    try {
      console.log('Starting signup process...');
      const result = await signUp(userData.email, userData.password, {
        full_name: userData.full_name,
        user_type: userData.user_type
      });

      console.log('Signup result:', result);

      if (result.error) {
        console.error('Signup error:', result.error);
        setError(result.error.message || result.error);
      } else {
        // Success - user will be redirected after email confirmation
        console.log('Account created successfully');
        // Show success message
        setError(''); // Clear any previous errors
        // You could add a success state here
      }
    } catch (error) {
      console.error('Signup exception:', error);
      setError('Une erreur est survenue lors de la création du compte. Vérifiez votre connexion internet et réessayez.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-green-50 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden">
        <div className="flex">
          {/* Left Panel - Form */}
          <div className="w-full lg:w-2/3 p-8 lg:p-12">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-[#2C3E37] to-[#4A7C59] rounded-xl flex items-center justify-center">
                  <TreePine className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-bold text-[#2C3E37]">AtypikHouse</span>
              </div>
              <button 
                onClick={() => router.push('/')}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="mb-8">
              <h1 className="text-3xl font-bold text-[#2C3E37] mb-2">
                Créer un compte
              </h1>
              <p className="text-gray-600">
                Réservez vos prochaines vacances
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Full Name */}
              <div className="relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  <User className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  placeholder="Nom complet"
                  value={userData.full_name}
                  onChange={(e) => handleInputChange('full_name', e.target.value)}
                  className="w-full pl-10 pr-4 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#4A7C59] focus:border-transparent transition-all"
                  required
                />
              </div>

              {/* Email */}
              <div className="relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  <Mail className="w-5 h-5" />
                </div>
                <input
                  type="email"
                  placeholder="Adresse email"
                  value={userData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="w-full pl-10 pr-4 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#4A7C59] focus:border-transparent transition-all"
                  required
                />
              </div>

              {/* User Type */}
              <div className="relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  <Users className="w-5 h-5" />
                </div>
                <select
                  value={userData.user_type}
                  onChange={(e) => handleInputChange('user_type', e.target.value as 'owner' | 'client')}
                  className="w-full pl-10 pr-4 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#4A7C59] focus:border-transparent transition-all appearance-none bg-white"
                  required
                >
                  <option value="client">Client</option>
                  <option value="owner">Propriétaire</option>
                </select>
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>

              {/* Password */}
              <div className="relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Mot de passe"
                  value={userData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className="w-full pl-10 pr-12 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#4A7C59] focus:border-transparent transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>

              {/* Confirm Password */}
              <div className="relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Confirmer le mot de passe"
                  value={userData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  className="w-full pl-10 pr-12 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#4A7C59] focus:border-transparent transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400 text-white py-4 rounded-xl font-medium transition-all duration-200 flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Création du compte...</span>
                  </>
                ) : (
                  <>
                    <span>Créer mon compte</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>

            {/* Footer Link */}
            <div className="mt-8 text-center">
              <p className="text-gray-600">
                Vous avez déjà un compte ?{' '}
                <button
                  onClick={() => router.push('/auth/login')}
                  className="text-[#4A7C59] hover:text-[#2C3E37] font-medium transition-colors"
                >
                  Se connecter
                </button>
              </p>
            </div>
          </div>

          {/* Right Panel - Background Image */}
          <div className="hidden lg:block lg:w-1/3 relative">
            <div className="absolute inset-0 bg-gradient-to-br from-[#2C3E37]/20 to-[#4A7C59]/20 z-10"></div>
            <div 
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage: `url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600"><defs><linearGradient id="a" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:%232C3E37;stop-opacity:1" /><stop offset="100%" style="stop-color:%234A7C59;stop-opacity:1" /></linearGradient></defs><rect width="800" height="600" fill="url(%23a)"/><circle cx="200" cy="150" r="50" fill="%23FFFFFF" opacity="0.1"/><circle cx="600" cy="450" r="80" fill="%23FFFFFF" opacity="0.1"/><polygon points="400,100 450,200 350,200" fill="%23FFFFFF" opacity="0.2"/><rect x="300" y="300" width="200" height="150" fill="%23FFFFFF" opacity="0.1"/></svg>')`
              }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
} 