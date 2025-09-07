"use client";

import { useState } from 'react';
import { Cookie, Shield, Settings, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCookieConsent } from '@/hooks/useCookieConsent';

interface CookieSettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CookieSettings({ isOpen, onClose }: CookieSettingsProps) {
  const { consent, acceptCookies, rejectCookies, clearConsent } = useCookieConsent();
  const [isAnimating, setIsAnimating] = useState(false);

  const handleAccept = () => {
    acceptCookies();
    handleClose();
  };

  const handleReject = () => {
    rejectCookies();
    handleClose();
  };

  const handleClose = () => {
    setIsAnimating(true);
    setTimeout(() => {
      onClose();
      setIsAnimating(false);
    }, 300);
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-50 transition-opacity duration-300 ${
          isAnimating ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div 
        className={`fixed inset-4 md:inset-8 lg:inset-16 xl:inset-32 z-50 transition-all duration-300 ${
          isAnimating 
            ? 'translate-y-0 opacity-100 scale-100' 
            : 'translate-y-8 opacity-0 scale-95'
        }`}
      >
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 h-full overflow-y-auto">
          <div className="p-6 md:p-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-[#4A7C59] to-[#2C3E37] rounded-xl flex items-center justify-center">
                  <Cookie className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    Paramètres des cookies
                  </h2>
                  <p className="text-sm text-gray-600">
                    Gérez vos préférences de confidentialité
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

            {/* Current Status */}
            <div className="mb-6 p-4 bg-gray-50 rounded-xl">
              <h3 className="font-semibold text-gray-900 mb-2">Statut actuel</h3>
              <div className="flex items-center space-x-2">
                {consent === 'accepted' ? (
                  <>
                    <Check className="w-5 h-5 text-green-600" />
                    <span className="text-green-700 font-medium">Cookies acceptés</span>
                  </>
                ) : consent === 'rejected' ? (
                  <>
                    <X className="w-5 h-5 text-red-600" />
                    <span className="text-red-700 font-medium">Cookies refusés</span>
                  </>
                ) : (
                  <>
                    <Settings className="w-5 h-5 text-gray-600" />
                    <span className="text-gray-700 font-medium">Aucune préférence définie</span>
                  </>
                )}
              </div>
            </div>

            {/* Cookie Types */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Types de cookies utilisés
              </h3>
              
              <div className="space-y-4">
                {/* Essential Cookies */}
                <div className="p-4 border border-gray-200 rounded-xl">
                  <div className="flex items-center space-x-3 mb-2">
                    <Shield className="w-5 h-5 text-[#4A7C59]" />
                    <h4 className="font-semibold text-gray-900">Cookies essentiels</h4>
                    <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                      Toujours actifs
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    Ces cookies sont nécessaires au fonctionnement du site web. Ils incluent les cookies de session, 
                    de sécurité et de préférences de base. Ils ne peuvent pas être désactivés.
                  </p>
                </div>

                {/* Analytics Cookies */}
                <div className="p-4 border border-gray-200 rounded-xl">
                  <div className="flex items-center space-x-3 mb-2">
                    <Settings className="w-5 h-5 text-[#4A7C59]" />
                    <h4 className="font-semibold text-gray-900">Cookies analytiques</h4>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      consent === 'accepted' 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {consent === 'accepted' ? 'Actifs' : 'Inactifs'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    Ces cookies nous aident à comprendre comment les visiteurs interagissent avec notre site web 
                    en collectant et rapportant des informations de manière anonyme.
                  </p>
                </div>
              </div>
            </div>

            {/* Project Notice */}
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
              <h4 className="font-semibold text-blue-900 mb-2">📚 Projet étudiant</h4>
              <p className="text-sm text-blue-700">
                Ce site est un projet d'étude fictif. Aucune donnée personnelle réelle n'est collectée ou stockée. 
                Les cookies sont utilisés uniquement à des fins de démonstration.
              </p>
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
                Refuser les cookies non essentiels
              </Button>
            </div>

            {/* Footer */}
            <div className="mt-6 pt-4 border-t border-gray-200">
              <p className="text-xs text-gray-500 text-center">
                Pour plus d'informations, consultez notre{' '}
                <a href="/qui-sommes-nous" className="text-[#4A7C59] hover:underline">
                  politique de confidentialité
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
