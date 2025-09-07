"use client";

import { Mail, Phone, MapPin, Clock, ArrowLeft, Facebook, Instagram } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Breadcrumb, { generateBreadcrumbs } from '@/components/Breadcrumb';

export default function ContactPage() {
  const router = useRouter();
  const [isVerifying, setIsVerifying] = useState(true);

  // Check if user has completed reCAPTCHA verification
  useEffect(() => {
    console.log('🔍 Contact page - Checking reCAPTCHA verification...');
    
    const isVerified = localStorage.getItem('atypikhouse-recaptcha-verified');
    const verificationTime = localStorage.getItem('atypikhouse-recaptcha-timestamp');
    
    console.log('🔍 Verification status:', { isVerified, verificationTime });
    
    if (!isVerified || !verificationTime) {
      console.log('❌ No verification found, redirecting to home');
      router.push('/');
      return;
    }

    // Check if verification is still valid (24 hours)
    const verificationDate = new Date(verificationTime);
    const now = new Date();
    const hoursDiff = (now.getTime() - verificationDate.getTime()) / (1000 * 60 * 60);
    
    console.log('🔍 Verification age:', hoursDiff, 'hours');
    
    if (hoursDiff > 24) {
      console.log('❌ Verification expired, redirecting to home');
      localStorage.removeItem('atypikhouse-recaptcha-verified');
      localStorage.removeItem('atypikhouse-recaptcha-timestamp');
      router.push('/');
      return;
    }

    console.log('✅ Verification valid, showing contact page');
    setIsVerifying(false);
  }, [router]);

  if (isVerifying) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4A7C59] mx-auto mb-4"></div>
          <p className="text-gray-600">Vérification en cours...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white">
     
      {/* Breadcrumb Navigation */}
      <div className="bg-gray-50 border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Breadcrumb items={generateBreadcrumbs('contact')} />
        </div>
      </div>

      {/* Contact Information */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        

        {/* Google Form Section */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-[#4A7C59] to-[#2C3E37] text-white p-6">
            <div className="flex items-center gap-3 mb-2">
              <Link 
                href="/" 
                className="text-white hover:text-green-100 transition-colors"
              >
                <ArrowLeft size={24} />
              </Link>
              <h1 className="text-2xl font-bold">Formulaire de contact</h1>
            </div>
            <p className="text-green-100">
              Remplissez le formulaire ci-dessous et nous vous répondrons dans les plus brefs délais.
            </p>
          </div>
          
          <div className="p-6">
            <iframe 
              src="https://docs.google.com/forms/d/e/1FAIpQLSes0YbzH7kQEFWmkltoP2zqJTod6S8hURd9sOi80EJqtmRbXQ/viewform?embedded=true" 
              width="100%" 
              height="824" 
              frameBorder="0" 
              marginHeight="0" 
              marginWidth="0"
              className="w-full min-h-[600px] rounded-lg border border-gray-200"
              title="Formulaire de contact AtypikHouse"
            >
              Chargement du formulaire...
            </iframe>
          </div>
        </div>

        

        {/* Back to Home Button */}
        <div className="text-center mt-8">
          <Link href="/">
            <Button 
              className="bg-gradient-to-r from-[#4A7C59] to-[#2C3E37] text-white px-8 py-3 rounded-full font-medium hover:scale-105 transition-all duration-300 shadow-lg"
            >
              Retour à l'accueil
            </Button>
          </Link>
        </div>

       
      </div>
    </div>
  );
}
