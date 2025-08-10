"use client";

import { useState, useEffect } from 'react';
import { 
  X, 
  Plus, 
  Upload, 
  MapPin, 
  Users, 
  Euro, 
  FileText,
  Home,
  Tent,
  Castle,
  Caravan,
  TreePine
} from 'lucide-react';
import { useAuthContext } from './AuthProvider';

interface PropertyFormData {
  name: string;
  category: string;
  price_per_night: number;
  description: string;
  location: string;
  maps_link: string;
  max_guests: number;
  images: string[];
}

interface PropertyFormProps {
  isOpen: boolean;
  onClose: () => void;
  property?: any; // For editing existing property
  onSuccess: () => void;
}

const propertyCategories = [
  { 
    value: 'cabane_arbre', 
    label: 'Cabanes dans les arbres', 
    icon: TreePine 
  },
  { 
    value: 'yourte', 
    label: 'Yourtes', 
    icon: Castle 
  },
  { 
    value: 'cabane_flottante', 
    label: 'Cabanes flottantes', 
    icon: Caravan 
  },
  { 
    value: 'autre', 
    label: 'Autre hébergement', 
    icon: Home 
  }
];

export default function PropertyForm({ isOpen, onClose, property, onSuccess }: PropertyFormProps) {
  const { userProfile } = useAuthContext();
  const [loading, setLoading] = useState(false);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [formData, setFormData] = useState<PropertyFormData>({
    name: '',
    category: '',
    price_per_night: 0,
    description: '',
    location: '',
    maps_link: '',
    max_guests: 1,
    images: []
  });

  useEffect(() => {
    if (property) {
      // Editing existing property
      setFormData({
        name: property.name || '',
        category: property.category || '',
        price_per_night: property.price_per_night || 0,
        description: property.description || '',
        location: property.location || '',
        maps_link: property.maps_link || '',
        max_guests: property.max_guests || 1,
        images: property.images || []
      });
      setImageUrls(property.images || []);
    } else {
      // Adding new property
      setFormData({
        name: '',
        category: '',
        price_per_night: 0,
        description: '',
        location: '',
        maps_link: '',
        max_guests: 1,
        images: []
      });
      setImageUrls([]);
    }
  }, [property]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'price_per_night' || name === 'max_guests' ? Number(value) : value
    }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter(file => file.type.startsWith('image/'));
    
    if (imageFiles.length + validFiles.length > 5) {
      alert('Maximum 5 images autorisées');
      return;
    }

    // Accept any size images initially
    setImageFiles(prev => [...prev, ...validFiles]);

    // Create preview URLs
    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setImageUrls(prev => [...prev, result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const compressImageTo100KB = (file: File): Promise<File> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;
      const img = new Image();
      
      img.onload = () => {
        let quality = 0.9;
        let width = img.width;
        let height = img.height;
        
        const compressAndCheck = () => {
          // Calculate new dimensions
          const maxWidth = 1200;
          const maxHeight = 800;
          
          if (width > height) {
            if (width > maxWidth) {
              height = (height * maxWidth) / width;
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width = (width * maxHeight) / height;
              height = maxHeight;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          
          // Draw image
          ctx.drawImage(img, 0, 0, width, height);
          
          // Convert to blob with current quality
          canvas.toBlob((blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name, {
                type: 'image/jpeg',
                lastModified: Date.now()
              });
              
              // Check if size is under 100KB
              if (compressedFile.size <= 100 * 1024) {
                resolve(compressedFile);
              } else if (quality > 0.1) {
                // Reduce quality and try again
                quality -= 0.1;
                compressAndCheck();
              } else {
                // If still too large, reduce dimensions and try again
                width = Math.floor(width * 0.8);
                height = Math.floor(height * 0.8);
                quality = 0.9;
                compressAndCheck();
              }
            } else {
              resolve(file);
            }
          }, 'image/jpeg', quality);
        };
        
        compressAndCheck();
      };
      
      img.src = URL.createObjectURL(file);
    });
  };

  const uploadImages = async (): Promise<string[]> => {
    if (imageFiles.length === 0) return [];

    const formData = new FormData();
    
    // Compress all images to 100KB before uploading
    for (let i = 0; i < imageFiles.length; i++) {
      const file = imageFiles[i];
      const compressedFile = await compressImageTo100KB(file);
      formData.append(`image-${i}`, compressedFile);
    }

    try {
      console.log('Uploading compressed images...');
      const response = await fetch('/api/properties/upload-images', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Upload response error:', errorData);
        throw new Error(errorData.error || 'Failed to upload images');
      }

      const result = await response.json();
      console.log('Upload successful:', result);
      return result.imageUrls;
    } catch (error) {
      console.error('Error uploading images:', error);
      throw error;
    }
  };

  const removeImage = (index: number) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
    setImageUrls(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Upload images first
      const uploadedImageUrls = await uploadImages();
      
      const propertyData = {
        ...formData,
        images: uploadedImageUrls,
        owner_id: userProfile?.id,
        is_published: true,
        is_available: true
      };

      const url = property ? `/api/properties/${property.id}` : '/api/properties';
      const method = property ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(propertyData)
      });

      if (!response.ok) {
        throw new Error('Failed to save property');
      }

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error saving property:', error);
      alert('Erreur lors de la sauvegarde de la propriété');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-[#2C3E37]">
            {property ? 'Modifier la propriété' : 'Ajouter une propriété'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Property Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nom de la propriété *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#4A7C59] focus:border-transparent"
              placeholder="Ex: Cabane des Étoiles"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Catégorie *
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#4A7C59] focus:border-transparent"
            >
              <option value="">Sélectionner une catégorie</option>
              {propertyCategories.map((category) => {
                const IconComponent = category.icon;
                return (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                );
              })}
            </select>
          </div>

          {/* Price and Capacity */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Prix par nuit (€) *
              </label>
              <div className="relative">
                <Euro className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="number"
                  name="price_per_night"
                  value={formData.price_per_night}
                  onChange={handleInputChange}
                  required
                  min="0"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#4A7C59] focus:border-transparent"
                  placeholder="0"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Capacité max (personnes) *
              </label>
              <div className="relative">
                <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="number"
                  name="max_guests"
                  value={formData.max_guests}
                  onChange={handleInputChange}
                  required
                  min="1"
                  max="20"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#4A7C59] focus:border-transparent"
                  placeholder="1"
                />
              </div>
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Localisation *
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                required
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#4A7C59] focus:border-transparent"
                placeholder="Ex: Montpellier, France"
              />
            </div>
          </div>

          {/* Maps Link */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Lien Google Maps
            </label>
            <input
              type="url"
              name="maps_link"
              value={formData.maps_link}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#4A7C59] focus:border-transparent"
              placeholder="https://maps.google.com/..."
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              required
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#4A7C59] focus:border-transparent"
              placeholder="Décrivez votre hébergement, ses équipements, l'expérience proposée..."
            />
          </div>

          {/* Images Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Images (max 5) *
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                id="image-upload"
              />
              <label htmlFor="image-upload" className="cursor-pointer">
                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600">Cliquez pour sélectionner des images</p>
                <p className="text-sm text-gray-500">PNG, JPG jusqu'à 5 images (compression automatique à 100KB)</p>
              </label>
            </div>
          </div>

          {/* Image Previews */}
          {imageUrls.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Images sélectionnées ({imageUrls.length}/5)
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {imageUrls.map((url, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={url}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex items-center justify-end space-x-4 pt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-gradient-to-r from-[#4A7C59] to-[#2C3E37] text-white rounded-xl font-medium transition-all hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Sauvegarde...</span>
                </>
              ) : (
                <>
                  <span>{property ? 'Modifier' : 'Ajouter'}</span>
                  <Plus className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 