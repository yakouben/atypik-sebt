"use client";

import { useState } from 'react';
import SignInModal from '@/components/SignInModal';

export default function RegisterPage() {
  const [isOpen, setIsOpen] = useState(true);

  const handleClose = () => {
    setIsOpen(false);
    // Redirect to home page when modal is closed
    window.location.href = '/';
  };

  return (
    <SignInModal 
      isOpen={isOpen} 
      onClose={handleClose}
      initialStep="userType"
    />
  );
} 