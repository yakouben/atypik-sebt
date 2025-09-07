"use client";

import { useState } from 'react';
import { X, Eye, EyeOff, Mail, Lock, User, MapPin, TreePine, Users, Home, Building } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { trackFormSubmit } from '@/components/GoogleAnalytics';
import { useAuthContext } from './AuthProvider';
import Breadcrumb, { generateBreadcrumbs } from '@/components/Breadcrumb';

interface SignInModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialStep?: 'login' | 'signup' | 'userType';
  initialUserType?: 'owner' | 'client' | null;
}

export default function SignInModal({ isOpen, onClose, initialStep = 'login', initialUserType = null }: SignInModalProps) {
  const { signIn, signUp } = useAuthContext();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [currentStep, setCurrentStep] = useState<'login' | 'signup' | 'userType'>(initialStep);
  const [userType, setUserType] = useState<'owner' | 'client' | null>(initialUserType);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    address: '',
    whatYouOwn: '',
    reservationType: '',
  });

  if (!isOpen) return null;

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError(null); // Clear error when user starts typing
  };

  const validateForm = () => {
    if (currentStep === 'login') {
      if (!formData.email || !formData.password) {
        setError('Veuillez remplir tous les champs');
        return false;
      }
    } else if (currentStep === 'signup') {
      if (!formData.email || !formData.password || !formData.confirmPassword || !formData.fullName) {
        setError('Veuillez remplir tous les champs obligatoires');
        return false;
      }
      if (formData.password !== formData.confirmPassword) {
        setError('Les mots de passe ne correspondent pas');
        return false;
      }
      if (formData.password.length < 6) {
        setError('Le mot de passe doit contenir au moins 6 caractères');
        return false;
      }
      if (userType === 'owner' && !formData.address) {
        setError('Veuillez remplir votre adresse');
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      if (currentStep === 'login') {
        // Track form submission
        trackFormSubmit('login_form');
        
        const { error } = await signIn(formData.email, formData.password);
        if (error) {
          setError(error.message);
        } else {
          setSuccess('Connexion réussie !');
          setTimeout(() => {
            onClose();
            setFormData({
              email: '',
              password: '',
              confirmPassword: '',
              fullName: '',
              address: '',
              whatYouOwn: '',
              reservationType: '',
            });
          }, 1500);
        }
      } else if (currentStep === 'signup' && userType) {
        // Track form submission
        trackFormSubmit('signup_form');
        
        const userData = {
          full_name: formData.fullName,
          user_type: userType,
          address: userType === 'owner' ? formData.address : undefined,
          what_you_own: userType === 'owner' ? formData.whatYouOwn : undefined,
          reservation_type: userType === 'client' ? formData.reservationType : undefined,
        };

        const { error } = await signUp(formData.email, formData.password, userData);
        if (error) {
          setError(error.message);
        } else {
          setSuccess('Compte créé avec succès ! Vérifiez votre email pour confirmer votre compte.');
          setTimeout(() => {
            onClose();
            setFormData({
              email: '',
              password: '',
              confirmPassword: '',
              fullName: '',
              address: '',
              whatYouOwn: '',
              reservationType: '',
            });
          }, 2000);
        }
      }
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUpClick = () => {
    setCurrentStep('userType');
    setError(null);
  };

  const handleUserTypeSelect = (type: 'owner' | 'client') => {
    setUserType(type);
    setCurrentStep('signup');
    setError(null);
  };

  const handleBackToLogin = () => {
    setCurrentStep('login');
    setUserType(null);
    setError(null);
    setFormData({
      email: '',
      password: '',
      confirmPassword: '',
      fullName: '',
      address: '',
      whatYouOwn: '',
      reservationType: '',
    });
  };

  const handleForgotPassword = async () => {
    if (!formData.email) {
      setError('Veuillez entrer votre email');
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await useAuthContext().resetPassword(formData.email);
      if (error) {
        setError(error.message);
      } else {
        setSuccess('Un email de réinitialisation a été envoyé à votre adresse email');
      }
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-white z-50 flex items-center justify-center p-2 sm:p-4">
      <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-6xl overflow-hidden border border-gray-100 h-[calc(100vh-2rem)] sm:h-[600px]">
        <div className="flex flex-col lg:flex-row h-full">
          {/* Left Column - Login/Signup Form */}
          <div className="flex-1 bg-gradient-to-br from-gray-50 to-white p-4 sm:p-6 lg:p-8 flex flex-col justify-center overflow-y-auto">
            <div className="max-w-md mx-auto w-full">
              {/* Header */}
              <div className="text-center mb-6 sm:mb-8">
                {/* Breadcrumb Navigation */}
                <div className="mb-4 sm:mb-6">
                  <Breadcrumb items={generateBreadcrumbs(currentStep === 'login' ? 'login' : 'register')} />
                </div>
                
                <div className="flex items-center justify-center  sm:space-x-2 mb-4 sm:mb-6">
                  <img 
                    src="/logo-svg.png" 
                    alt="AtypikHouse Logo" 
                    className="w-20 h-20 sm:w-20 sm:h-20 object-contain"
                  />
                  <span className="text-lg sm:text-2xl font-bold text-gray-900">AtypikHouse</span>
                </div>
                
                {currentStep === 'login' && (
                  <>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Bienvenue !</h1>
                    <p className="text-gray-600 text-sm sm:text-base">Veuillez entrer vos informations de connexion ci-dessous</p>
                  </>
                )}
                
                {currentStep === 'userType' && (
                  <>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Créer un compte</h1>
                    <p className="text-gray-600 text-sm sm:text-base">Choisissez votre type de compte</p>
                  </>
                )}
                
                {currentStep === 'signup' && (
                  <>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                      {userType === 'owner' ? '' : 'Créer un compte'}
                    </h1>
                    <p className="text-gray-600 text-sm sm:text-base">
                      {userType === 'owner' 
                        ? ' ' 
                        : 'Réservez vos prochaines vacances'
                      }
                    </p>
                  </>
                )}
              </div>

              {/* Error/Success Messages */}
              {(error || success) && (
                <div className={`p-4 rounded-xl text-sm font-medium ${
                  error ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'
                }`}>
                  {error || success}
                </div>
              )}

              {/* User Type Selection */}
              {currentStep === 'userType' && (
                <div className="space-y-3 sm:space-y-4">
                  <button
                    onClick={() => handleUserTypeSelect('owner')}
                    className="w-full p-4 sm:p-6 border-2 border-gray-200 rounded-xl hover:border-[#4A7C59] hover:bg-[#4A7C59]/5 transition-all duration-300 text-left group"
                  >
                    <div className="flex items-center space-x-3 sm:space-x-4">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#4A7C59]/10 rounded-full flex items-center justify-center group-hover:bg-[#4A7C59]/20 transition-colors">
                        <Building className="w-5 h-5 sm:w-6 sm:h-6 text-[#4A7C59]" />
                      </div>
                      <div>
                        <h3 className="text-base sm:text-lg font-semibold text-gray-900">Propriétaire</h3>
                        <p className="text-gray-600 text-xs sm:text-sm">Je veux louer ma propriété</p>
                      </div>
                    </div>
                  </button>
                  
                  <button
                    onClick={() => handleUserTypeSelect('client')}
                    className="w-full p-4 sm:p-6 border-2 border-gray-200 rounded-xl hover:border-[#4A7C59] hover:bg-[#4A7C59]/5 transition-all duration-300 text-left group"
                  >
                    <div className="flex items-center space-x-3 sm:space-x-4">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#4A7C59]/10 rounded-full flex items-center justify-center group-hover:bg-[#4A7C59]/20 transition-colors">
                        <Users className="w-5 h-5 sm:w-6 sm:h-6 text-[#4A7C59]" />
                      </div>
                      <div>
                        <h3 className="text-base sm:text-lg font-semibold text-gray-900">Client</h3>
                        <p className="text-gray-600 text-xs sm:text-sm">Je veux réserver un hébergement</p>
                      </div>
                    </div>
                  </button>
                </div>
              )}

              {/* Login Form */}
              {currentStep === 'login' && (
                <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                  <div className="relative">
                    <Mail className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      type="email"
                      placeholder="Email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="pl-10 sm:pl-12 py-3 sm:py-4 border-gray-200 rounded-xl focus:border-[#4A7C59] focus:ring-[#4A7C59] text-sm sm:text-base"
                      disabled={isLoading}
                    />
                  </div>

                  <div className="relative">
                    <Lock className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Mot de passe"
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      className="pl-10 sm:pl-12 pr-12 sm:pr-14 py-3 sm:py-4 border-gray-200 rounded-xl focus:border-[#4A7C59] focus:ring-[#4A7C59] text-sm sm:text-base"
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      disabled={isLoading}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                 
                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-[#4A7C59] to-[#2C3E37] hover:from-[#2C3E37] hover:to-[#4A7C59] text-white py-3 sm:py-4 rounded-xl font-semibold text-sm sm:text-base transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-[#4A7C59]/25"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Connexion en cours...' : 'Se connecter'}
                  </Button>
                </form>
              )}

              {/* Signup Form */}
              {currentStep === 'signup' && (
                <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                  {/* Full Name */}
                  <div className="relative">
                    <User className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      type="text"
                      placeholder="Nom complet"
                      value={formData.fullName}
                      onChange={(e) => handleInputChange('fullName', e.target.value)}
                      className="pl-10 sm:pl-12 py-3 sm:py-4 border-gray-200 rounded-xl focus:border-[#4A7C59] focus:ring-[#4A7C59] text-sm sm:text-base"
                      disabled={isLoading}
                    />
                  </div>

                  {/* Email */}
                  <div className="relative">
                    <Mail className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      type="email"
                      placeholder="Email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="pl-10 sm:pl-12 py-3 sm:py-4 border-gray-200 rounded-xl focus:border-[#4A7C59] focus:ring-[#4A7C59] text-sm sm:text-base"
                      disabled={isLoading}
                    />
                  </div>

                  {/* Owner-specific fields */}
                  {userType === 'owner' && (
                    <>
                      <div className="relative">
                        <MapPin className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                          type="text"
                          placeholder="Adresse"
                          value={formData.address}
                          onChange={(e) => handleInputChange('address', e.target.value)}
                          className="pl-10 sm:pl-12 py-3 sm:py-4 border-gray-200 rounded-xl focus:border-[#4A7C59] focus:ring-[#4A7C59] text-sm sm:text-base"
                          disabled={isLoading}
                        />
                      </div>
                      
                      <div className="relative">
                        <Home className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                          type="text"
                          placeholder="Que possédez-vous ? (cabanes, yourtes, etc.)"
                          value={formData.whatYouOwn}
                          onChange={(e) => handleInputChange('whatYouOwn', e.target.value)}
                          className="pl-10 sm:pl-12 py-3 sm:py-4 border-gray-200 rounded-xl focus:border-[#4A7C59] focus:ring-[#4A7C59] text-sm sm:text-base"
                          disabled={isLoading}
                        />
                      </div>
                    </>
                  )}

                  {/* Client-specific fields */}
                  {userType === 'client' && (
                    <div className="relative">
                      <Users className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        type="text"
                        placeholder="Avec qui voulez-vous réserver ? (famille, amis, etc.)"
                        value={formData.reservationType}
                        onChange={(e) => handleInputChange('reservationType', e.target.value)}
                        className="pl-10 sm:pl-12 py-3 sm:py-4 border-gray-200 rounded-xl focus:border-[#4A7C59] focus:ring-[#4A7C59] text-sm sm:text-base"
                        disabled={isLoading}
                      />
                    </div>
                  )}

                  {/* Password */}
                  <div className="relative">
                    <Lock className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Mot de passe"
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      className="pl-10 sm:pl-12 pr-12 sm:pr-14 py-3 sm:py-4 border-gray-200 rounded-xl focus:border-[#4A7C59] focus:ring-[#4A7C59] text-sm sm:text-base"
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      disabled={isLoading}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Confirm Password */}
                  <div className="relative">
                    <Lock className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="Confirmer le mot de passe"
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                      className="pl-10 sm:pl-12 pr-12 sm:pr-14 py-3 sm:py-4 border-gray-200 rounded-xl focus:border-[#4A7C59] focus:ring-[#4A7C59] text-sm sm:text-base"
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      disabled={isLoading}
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-[#4A7C59] to-[#2C3E37] hover:from-[#2C3E37] hover:to-[#4A7C59] text-white py-3 sm:py-4 rounded-xl font-semibold text-sm sm:text-base transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-[#4A7C59]/25"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Création du compte...' : 'Créer mon compte'}
                  </Button>
                </form>
              )}

              {/* Footer Links */}
              <div className="mt-6 sm:mt-8 text-center">
                {currentStep === 'login' && (
                  <p className="text-gray-600 text-xs sm:text-sm">
                    Vous n'avez pas de compte ?{' '}
                    <button
                      onClick={handleSignUpClick}
                      className="text-[#4A7C59] hover:text-[#2C3E37] font-medium"
                    >
                      Créer un compte
                    </button>
                  </p>
                )}
                
                {(currentStep === 'signup' || currentStep === 'userType') && (
                  <p className="text-gray-600 text-xs sm:text-sm">
                    Vous avez déjà un compte ?{' '}
                    <button
                      onClick={handleBackToLogin}
                      className="text-[#4A7C59] hover:text-[#2C3E37] font-medium"
                    >
                      Se connecter
                    </button>
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Promotional Content */}
          <div className="hidden lg:flex flex-1 bg-gradient-to-br from-gray-900 to-black relative overflow-hidden">
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-6 right-6 w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors z-10"
            >
              <X className="w-5 h-5 text-white" />
            </button>

            {/* Background Image */}
            <div className="absolute inset-0">
              <img
                src="/hero2.png"
                alt="AtypikHouse Hero"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Mobile Close Button */}
          <button
            onClick={onClose}
            className="lg:hidden absolute top-4 right-4 w-8 h-8 bg-gray-900/10 rounded-full flex items-center justify-center hover:bg-gray-900/20 transition-colors z-10"
          >
            <X className="w-4 h-4 text-gray-900" />
          </button>
        </div>
      </div>
    </div>
  );
} 
