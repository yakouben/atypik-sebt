"use client";

import { useState, useEffect } from 'react';
import { X, Heart, Star, Shield } from 'lucide-react';
import { trackReservation } from '@/components/GoogleAnalytics';

interface AuthPromptWidgetProps {
  isOpen: boolean;
  onClose: () => void;
  propertyName?: string;
}

export default function AuthPromptWidget({ isOpen, onClose, propertyName }: AuthPromptWidgetProps) {
  const [isClosing, setIsClosing] = useState(false);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      setIsClosing(false);
    }, 200);
  };

  // Track reservation confirmation when widget opens
  useEffect(() => {
    if (isOpen && propertyName) {
      trackReservation(propertyName);
    }
  }, [isOpen, propertyName]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity duration-200 ${
          isClosing ? 'opacity-0' : 'opacity-100'
        }`}
        onClick={handleClose}
      />
      
      {/* Auth Widget */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div 
          className={`bg-white rounded-3xl shadow-2xl w-full max-w-md transform transition-all duration-200 ${
            isClosing ? 'scale-95 opacity-0' : 'scale-100 opacity-100'
          }`}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-[#4A7C59] to-[#2C3E37] p-6 text-white rounded-t-3xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Shield className="w-6 h-6" />
                <h2 className="text-xl font-bold"> Réservation Confirmée</h2>
              </div>
              <button
                onClick={handleClose}
                className="p-2 hover:bg-white/20 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Property Info */}
            {propertyName && (
              <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
                <div className="flex items-center space-x-3">
                  <Heart className="w-5 h-5 text-[#4A7C59]" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Réservation en cours</h3>
                    <p className="text-sm text-gray-600">{propertyName}</p>
                  </div>
                </div>
              </div>
            )}

             {/* Simple Message */}
             <div className="text-center mb-6">
               <div className="w-16 h-16 bg-gradient-to-r from-[#4A7C59] to-[#2C3E37] rounded-2xl flex items-center justify-center mx-auto mb-4">
                 <Star className="w-8 h-8 text-white" />
               </div>
               <h3 className="text-lg font-semibold text-gray-900 mb-3">
                 Merci d'avoir choisi AtypikHouse
               </h3>
               <p className="text-gray-600 text-sm leading-relaxed">
                 Votre sélection a été enregistrée avec succès.
               </p>
             </div>

            {/* Footer */}
            <div className="mt-4 text-center">
              <p className="text-xs text-gray-500">
                Vous pouvez maintenant fermer cette fenêtre
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
