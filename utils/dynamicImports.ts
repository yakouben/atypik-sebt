import dynamic from 'next/dynamic';
import React from 'react';

// Dynamic imports for heavy components
export const DynamicPropertyForm = dynamic(
  () => import('@/components/PropertyForm'),
  {
    loading: () => React.createElement('div', { className: "animate-pulse bg-gray-200 h-64 rounded-lg" }),
    ssr: false,
  }
);

export const DynamicReservationModal = dynamic(
  () => import('@/components/ReservationModal'),
  {
    loading: () => React.createElement('div', { className: "animate-pulse bg-gray-200 h-96 rounded-lg" }),
    ssr: false,
  }
);

export const DynamicSEOTester = dynamic(
  () => import('@/components/SEOTester'),
  {
    loading: () => null,
    ssr: false,
  }
);

export const DynamicPerformanceMonitor = dynamic(
  () => import('@/components/PerformanceMonitor'),
  {
    loading: () => null,
    ssr: false,
  }
);

// Dynamic imports for icons (only load when needed)
export const DynamicIcons = {
  Calendar: dynamic(() => import('lucide-react').then(mod => ({ default: mod.Calendar }))),
  Users: dynamic(() => import('lucide-react').then(mod => ({ default: mod.Users }))),
  Euro: dynamic(() => import('lucide-react').then(mod => ({ default: mod.Euro }))),
  MapPin: dynamic(() => import('lucide-react').then(mod => ({ default: mod.MapPin }))),
  Star: dynamic(() => import('lucide-react').then(mod => ({ default: mod.Star }))),
  Edit: dynamic(() => import('lucide-react').then(mod => ({ default: mod.Edit }))),
  Trash2: dynamic(() => import('lucide-react').then(mod => ({ default: mod.Trash2 }))),
  Plus: dynamic(() => import('lucide-react').then(mod => ({ default: mod.Plus }))),
  Search: dynamic(() => import('lucide-react').then(mod => ({ default: mod.Search }))),
  Filter: dynamic(() => import('lucide-react').then(mod => ({ default: mod.Filter }))),
  ChevronDown: dynamic(() => import('lucide-react').then(mod => ({ default: mod.ChevronDown }))),
};

// Dynamic imports for form components
export const DynamicFormComponents = {
  DatePicker: dynamic(() => import('react-day-picker').then(mod => ({ default: mod.DayPicker }))),
  Select: dynamic(() => import('@radix-ui/react-select').then(mod => ({ default: mod.Select }))),
  Dialog: dynamic(() => import('@radix-ui/react-dialog').then(mod => ({ default: mod.Dialog }))),
  Toast: dynamic(() => import('@radix-ui/react-toast').then(mod => ({ default: mod.Toast }))),
}; 