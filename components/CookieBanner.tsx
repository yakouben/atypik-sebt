"use client";

import { useState, useEffect } from 'react';
import { X, Cookie, Shield, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCookieConsent } from '@/hooks/useCookieConsent';

interface CookieBannerProps {
  onAccept?: () => void;
  onReject?: () => void;
}

export default function CookieBanner({ onAccept, onReject }: CookieBannerProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const { hasConsent, acceptCookies, rejectCookies } = useCookieConsent();

  useEffect(() => {
    // Show banner if no consent has been given
    if (!hasConsent) {
      // Show banner after a short delay for better UX
      const timer = setTimeout(() => {
        setIsVisible(true);
        setIsAnimating(true);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [hasConsent]);

  const handleAccept = () => {
    acceptCookies();
    
    setIsAnimating(false);
    setTimeout(() => {
      setIsVisible(false);
      onAccept?.();
    }, 300);
  };

  const handleReject = () => {
    rejectCookies();
    
    setIsAnimating(false);
    setTimeout(() => {
      setIsVisible(false);
      onReject?.();
    }, 300);
  };

  const handleClose = () => {
    setIsAnimating(false);
    setTimeout(() => {
      setIsVisible(false);
    }, 300);
  };

  if (!isVisible) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-black/20 backdrop-blur-sm z-40 transition-opacity duration-300 ${
          isAnimating ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={handleClose}
      />
      
      {/* Cookie Banner */}
      <div 
        className={`fixed bottom-4 left-4 right-4 md:left-8 md:right-8 lg:left-1/2 lg:right-auto lg:-translate-x-1/2 lg:max-w-2xl z-50 transition-all duration-500 ease-out ${
          isAnimating 
            ? 'translate-y-0 opacity-100 scale-100' 
            : 'translate-y-full opacity-0 scale-95'
        }`}
      >
        <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-6 md:p-8">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-[#4A7C59] to-[#2C3E37] rounded-xl flex items-center justify-center">
                <Cookie className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  Cookies et confidentialité
                </h3>
                <p className="text-sm text-gray-600">
                  AtypikHouse respecte votre vie privée
                </p>
              </div>
            </div>
            
            <button
              onClick={handleClose}
              className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors duration-200"
            >
              <X className="w-4 h-4 text-gray-600" />
            </button>
          </div>

          {/* Content */}
          <div className="mb-6">
            <p className="text-gray-700 leading-relaxed mb-4">
              Nous utilisons des cookies pour améliorer votre expérience sur notre site, 
              analyser le trafic et personnaliser le contenu. Ceci est un projet étudiant 
              fictif - aucune donnée réelle n'est collectée.
            </p>
            
            {/* Cookie Types */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
              <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                <Shield className="w-4 h-4 text-[#4A7C59]" />
                <span className="text-sm text-gray-700">Cookies essentiels</span>
              </div>
              <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                <Settings className="w-4 h-4 text-[#4A7C59]" />
                <span className="text-sm text-gray-700">Cookies analytiques</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={handleAccept}
              className="flex-1 bg-gradient-to-r from-[#4A7C59] to-[#2C3E37] hover:from-[#2C3E37] hover:to-[#4A7C59] text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-[#4A7C59]/25"
            >
              Accepter tous les cookies
            </Button>
            
            <Button
              onClick={handleReject}
              variant="outline"
              className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50 px-6 py-3 rounded-xl font-medium transition-all duration-300 hover:scale-105"
            >
              Refuser
            </Button>
          </div>

          {/* Footer */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-500 text-center">
              En continuant à naviguer, vous acceptez notre utilisation des cookies. 
              <a href="/qui-sommes-nous" className="text-[#4A7C59] hover:underline ml-1">
                En savoir plus
              </a>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
