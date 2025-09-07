"use client";

import { useState } from 'react';
import { Eye, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

// Color contrast testing widget for development
export default function ContrastTestWidget() {
  const [isVisible, setIsVisible] = useState(false);

  const colorTests = [
    {
      name: 'Vert Principal (Amélioré)',
      foreground: '#3D6B4A',
      background: '#FFFFFF',
      originalFg: '#4A7C59',
      usage: 'Boutons, liens principaux'
    },
    {
      name: 'Texte Gris (Amélioré)', 
      foreground: '#374151',
      background: '#FFFFFF',
      originalFg: '#6B7280',
      usage: 'Texte secondaire'
    },
    {
      name: 'Badge Confirmé (Amélioré)',
      foreground: '#14532D',
      background: '#F0FDF4',
      originalFg: '#166534',
      usage: 'Statut confirmé'
    },
    {
      name: 'Badge En Attente (Amélioré)',
      foreground: '#92400E',
      background: '#FFFBEB',
      originalFg: '#D97706',
      usage: 'Statut en attente'
    },
    {
      name: 'Badge Annulé (Amélioré)',
      foreground: '#991B1B',
      background: '#FEF2F2',
      originalFg: '#DC2626',
      usage: 'Statut annulé'
    }
  ];

  // Calculate contrast ratio
  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  };

  const getLuminance = (r: number, g: number, b: number) => {
    const [rs, gs, bs] = [r, g, b].map(c => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  };

  const getContrastRatio = (color1: string, color2: string) => {
    const rgb1 = hexToRgb(color1);
    const rgb2 = hexToRgb(color2);
    
    if (!rgb1 || !rgb2) return 0;
    
    const lum1 = getLuminance(rgb1.r, rgb1.g, rgb1.b);
    const lum2 = getLuminance(rgb2.r, rgb2.g, rgb2.b);
    
    const brightest = Math.max(lum1, lum2);
    const darkest = Math.min(lum1, lum2);
    
    return (brightest + 0.05) / (darkest + 0.05);
  };

  const getContrastStatus = (ratio: number) => {
    if (ratio >= 7) return { level: 'AAA', color: 'text-green-700', icon: CheckCircle };
    if (ratio >= 4.5) return { level: 'AA', color: 'text-green-600', icon: CheckCircle };
    if (ratio >= 3) return { level: 'AA Large', color: 'text-yellow-600', icon: AlertTriangle };
    return { level: 'Échec', color: 'text-red-600', icon: XCircle };
  };

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-colors z-50"
        title="Test de contraste"
      >
        <Eye className="w-5 h-5" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white border border-gray-200 rounded-xl shadow-2xl p-6 max-w-md z-50 max-h-96 overflow-y-auto">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-gray-900">Test de Contraste</h3>
        <button
          onClick={() => setIsVisible(false)}
          className="text-gray-400 hover:text-gray-600"
        >
          <XCircle className="w-5 h-5" />
        </button>
      </div>

      <div className="space-y-4">
        {colorTests.map((test, index) => {
          const ratio = getContrastRatio(test.foreground, test.background);
          const originalRatio = getContrastRatio(test.originalFg, test.background);
          const status = getContrastStatus(ratio);
          const StatusIcon = status.icon;

          return (
            <div key={index} className="border border-gray-100 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-sm">{test.name}</h4>
                <div className={`flex items-center space-x-1 ${status.color}`}>
                  <StatusIcon className="w-4 h-4" />
                  <span className="text-xs font-medium">{status.level}</span>
                </div>
              </div>

              {/* Color Preview */}
              <div 
                className="p-2 rounded text-sm font-medium mb-2"
                style={{ 
                  backgroundColor: test.background,
                  color: test.foreground,
                  border: '1px solid #E5E7EB'
                }}
              >
                Exemple de texte
              </div>

              <div className="text-xs text-gray-600 space-y-1">
                <div>Ratio: <span className="font-mono">{ratio.toFixed(1)}:1</span></div>
                <div>Ancien: <span className="font-mono">{originalRatio.toFixed(1)}:1</span></div>
                <div>Usage: {test.usage}</div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
        <h4 className="font-medium text-blue-900 mb-2">Standards WCAG 2.1</h4>
        <div className="text-xs text-blue-800 space-y-1">
          <div>• AA Normal: 4.5:1 minimum</div>
          <div>• AA Large: 3:1 minimum</div>
          <div>• AAA Normal: 7:1 idéal</div>
        </div>
      </div>
    </div>
  );
}
