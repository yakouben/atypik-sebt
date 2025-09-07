"use client";

import { useState, useEffect } from 'react';
import { X, Shield, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ReCaptchaModalProps {
  isOpen: boolean;
  onSuccess: () => void;
  onClose: () => void;
}

declare global {
  interface Window {
    grecaptcha: any;
    onRecaptchaLoad: () => void;
  }
}

export default function ReCaptchaModal({ isOpen, onSuccess, onClose }: ReCaptchaModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recaptchaWidgetId, setRecaptchaWidgetId] = useState<number | null>(null);

  // Load reCAPTCHA script
  useEffect(() => {
    if (!isOpen) return;

    console.log('🔍 Modal ReCaptcha - Ouvert, chargement de reCAPTCHA...');

    // Vérifier si reCAPTCHA est déjà chargé
    if (window.grecaptcha && window.grecaptcha.ready) {
      console.log('✅ ReCAPTCHA déjà chargé, initialisation...');
      window.grecaptcha.ready(() => {
        initializeRecaptcha();
      });
      return;
    }

    console.log('📥 Chargement du script reCAPTCHA...');
    
    // Load reCAPTCHA script with better error handling
    const script = document.createElement('script');
    script.src = 'https://www.google.com/recaptcha/api.js?hl=fr&render=explicit';
    script.async = true;
    script.defer = true;
    
          script.onload = () => {
        console.log('✅ Script reCAPTCHA chargé');
        // Attendre que reCAPTCHA soit complètement prêt
        setTimeout(() => {
          if (window.grecaptcha && window.grecaptcha.ready) {
            console.log('✅ Objet grecaptcha prêt, initialisation...');
            window.grecaptcha.ready(() => {
              initializeRecaptcha();
            });
          } else {
            console.log('❌ Objet grecaptcha non prêt après chargement du script');
            setError('Erreur: reCAPTCHA non prêt après chargement du script');
          }
        }, 500);
      };

      script.onerror = () => {
        console.log('❌ Échec du chargement du script reCAPTCHA');
        setError('Erreur lors du chargement de reCAPTCHA');
      };

    // Ajouter le script à la tête
    document.head.appendChild(script);

    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, [isOpen]);

  // Initialiser le widget reCAPTCHA
  const initializeRecaptcha = () => {
    console.log('🔍 initializeRecaptcha appelé');
    
    if (!window.grecaptcha) {
      console.log('❌ grecaptcha non disponible');
      return;
    }

    // Essayer d'obtenir la clé du site depuis l'environnement ou utiliser la clé de secours
    // Note: C'est une clé de test - remplacez par votre vraie clé reCAPTCHA
    const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || '6LcKILUrAAAAANVIqyzw9QvwVV2fRvosVSz6BA_k';
    
    // Si la clé semble invalide, afficher un message d'erreur utile
    if (siteKey === '6LcKILUrAAAAANVIqyzw9QvwVV2fRvosVSz6BA_k') {
      console.log('⚠️ Utilisation de la clé de secours - cela peut ne pas fonctionner en production');
    }
    
    console.log('🔍 Clé du site:', siteKey);
    console.log('🔍 Variable d\'environnement:', process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY);
    
    if (!siteKey) {
      console.log('❌ Aucune clé trouvée');
      setError('Clé reCAPTCHA manquante');
      return;
    }

        try {
      console.log('🔍 Tentative de rendu du widget reCAPTCHA v2...');
      
      // Vider le conteneur d'abord
      const container = document.getElementById('recaptcha-container');
      if (container) {
        container.innerHTML = '';
      }
      
      // Valider le format de la clé du site
      if (siteKey.length < 20) {
        throw new Error('Clé du site trop courte - format invalide');
      }
      
      // Vérifier si grecaptcha.render existe
      if (typeof window.grecaptcha.render !== 'function') {
        throw new Error('grecaptcha.render n\'est pas une fonction - API non prête');
      }
      
      const widgetId = window.grecaptcha.render('recaptcha-container', {
        sitekey: siteKey,
        callback: onRecaptchaSuccess,
        'expired-callback': onRecaptchaExpired,
        'error-callback': onRecaptchaError,
        theme: 'light',
        size: 'normal',
        tabindex: 0
      });
      
      console.log('✅ Widget rendu avec l\'ID:', widgetId);
      setRecaptchaWidgetId(widgetId);
    } catch (err) {
      console.log('❌ Erreur lors du rendu du widget v2:', err);
      
      // Solution de secours: Afficher un message d'erreur
      const container = document.getElementById('recaptcha-container');
      if (container) {
        container.innerHTML = `
          <div class="text-center p-4 border-2 border-dashed border-red-300 rounded-lg">
            <p class="text-red-600 mb-3">Erreur reCAPTCHA</p>
            <p class="text-sm text-red-500">Veuillez réessayer ou contacter le support</p>
          </div>
        `;
      }
      
      setError(`Erreur reCAPTCHA: ${err instanceof Error ? err.message : 'Erreur inconnue'}`);
    }
  };

  // Gérer la vérification réussie
  const onRecaptchaSuccess = (token: string) => {
    setIsVerified(true);
    setError(null);
    setIsLoading(true);
    
    // Stocker la vérification dans localStorage
    localStorage.setItem('atypikhouse-recaptcha-verified', 'true');
    localStorage.setItem('atypikhouse-recaptcha-timestamp', new Date().toISOString());
    
    // Simuler le chargement et la redirection
    setTimeout(() => {
      setIsLoading(false);
      onSuccess();
    }, 1000);
  };

  // Gérer la vérification expirée
  const onRecaptchaExpired = () => {
    setIsVerified(false);
    setError('La vérification a expiré. Veuillez réessayer.');
    if (recaptchaWidgetId !== null) {
      window.grecaptcha.reset(recaptchaWidgetId);
    }
  };

  // Gérer l'erreur de vérification
  const onRecaptchaError = () => {
    setIsVerified(false);
    setError('Erreur lors de la vérification. Veuillez réessayer.');
    if (recaptchaWidgetId !== null) {
      window.grecaptcha.reset(recaptchaWidgetId);
    }
  };

  // Réinitialiser reCAPTCHA
  const handleReset = () => {
    setIsVerified(false);
    setError(null);
    if (recaptchaWidgetId !== null && window.grecaptcha) {
      window.grecaptcha.reset(recaptchaWidgetId);
    }
  };

  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X size={24} />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="bg-[#4A7C59] bg-opacity-10 p-3 rounded-full w-fit mx-auto mb-4">
            <Shield className="text-[#4A7C59]" size={32} />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Vérification de sécurité
          </h2>
          <p className="text-gray-600">
            Veuillez confirmer que vous n'êtes pas un robot pour accéder à notre formulaire de contact.
          </p>
        </div>

        {/* reCAPTCHA Container */}
        <div className="mb-6">
          <div id="recaptcha-container" className="flex justify-center"></div>
          
          
        </div>

        {/* Status Messages */}
        {isVerified && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2 text-green-800">
              <CheckCircle size={20} />
              <span className="font-medium">Vérification réussie !</span>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2 text-red-800">
              <AlertCircle size={20} />
              <span className="font-medium">{error}</span>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-2 text-blue-800">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-800"></div>
              <span>Redirection en cours...</span>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button
            onClick={handleReset}
            variant="outline"
            className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50"
            disabled={isLoading}
          >
            Réinitialiser
          </Button>
          
          <Button
            onClick={onClose}
            variant="outline"
            className="flex-1 border-[#4A7C59] text-[#4A7C59] hover:bg-[#4A7C59] hover:text-white"
            disabled={isLoading}
          >
            Annuler
          </Button>
        </div>



        {/* Footer Info */}
        <div className="mt-4 text-center">
          <p className="text-xs text-gray-500">
            Cette vérification protège notre site contre les abus automatisés.
          </p>
        </div>
      </div>
    </div>
  );
}
