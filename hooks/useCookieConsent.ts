"use client";

import { useState, useEffect } from 'react';

export type CookieConsent = 'accepted' | 'rejected' | null;

export function useCookieConsent() {
  const [consent, setConsent] = useState<CookieConsent>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check localStorage for existing consent
    const storedConsent = localStorage.getItem('atypikhouse-cookie-consent') as CookieConsent;
    setConsent(storedConsent);
    setIsLoading(false);
  }, []);

  const acceptCookies = () => {
    localStorage.setItem('atypikhouse-cookie-consent', 'accepted');
    localStorage.setItem('atypikhouse-cookie-timestamp', new Date().toISOString());
    setConsent('accepted');
  };

  const rejectCookies = () => {
    localStorage.setItem('atypikhouse-cookie-consent', 'rejected');
    localStorage.setItem('atypikhouse-cookie-timestamp', new Date().toISOString());
    setConsent('rejected');
  };

  const clearConsent = () => {
    localStorage.removeItem('atypikhouse-cookie-consent');
    localStorage.removeItem('atypikhouse-cookie-timestamp');
    setConsent(null);
  };

  const hasConsent = consent !== null;
  const hasAccepted = consent === 'accepted';
  const hasRejected = consent === 'rejected';

  return {
    consent,
    isLoading,
    hasConsent,
    hasAccepted,
    hasRejected,
    acceptCookies,
    rejectCookies,
    clearConsent,
  };
}
