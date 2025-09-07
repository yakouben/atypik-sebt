"use client";

import { useState, useRef, useEffect } from 'react';
import { LogOut, User, Settings, Trash2, ChevronDown, X, Edit3, Save, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthContext } from './AuthProvider';
import { supabase } from '@/lib/supabase';

interface UserMenuProps {
  userName: string;
}

export default function UserMenu({ userName }: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [editForm, setEditForm] = useState({
    full_name: '',
    email: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const { signOut, userProfile, getUserProfile } = useAuthContext();
  const menuRef = useRef<HTMLDivElement>(null);
  
  // Debug userProfile when it changes
  useEffect(() => {
    console.log('🔍 ===== USERPROFILE CHANGED =====');
    console.log('🔍 userProfile:', userProfile);
    if (userProfile) {
      console.log('🔍 Type:', typeof userProfile);
      console.log('🔍 Keys:', Object.keys(userProfile));
      console.log('🔍 user_id:', userProfile.user_id);
      console.log('🔍 id:', userProfile.id);
      console.log('🔍 email:', userProfile.email);
      console.log('🔍 full_name:', userProfile.full_name);
    } else {
      console.log('🔍 userProfile is null/undefined');
    }
    console.log('🔍 ===== FIN USERPROFILE DEBUG =====');
  }, [userProfile]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Initialize edit form when entering edit mode
  useEffect(() => {
    if (isEditing && userProfile) {
      setEditForm({
        full_name: userProfile.full_name || '',
        email: userProfile.email || ''
      });
    }
  }, [isEditing, userProfile]);

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  };

    const handleEditProfile = async () => {
    if (!userProfile || !userProfile.id) {
      setError('Profil utilisateur non disponible');
      return;
    }
    
    // Validate form data
    if (!editForm.full_name.trim() || !editForm.email.trim()) {
      setError('Veuillez remplir tous les champs');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // SIMPLE: Call the simple API that updates both profile AND auth
      const response = await fetch('/api/profiles/edit-simple', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userProfile.id,
          full_name: editForm.full_name.trim(),
          email: editForm.email.trim()
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setSuccess('Profil, email ET nom d\'affichage mis à jour complètement !');
        setIsEditing(false);
        
        // Refresh the profile immediately
        if (getUserProfile) {
          await getUserProfile(userProfile.id);
        }
        
        setTimeout(() => setSuccess(null), 3000);
      } else {
        console.error('❌ Erreur de l\'API:', result);
        setError(result.error || 'Erreur lors de la mise à jour du profil');
      }
    } catch (error) {
      console.error('❌ Erreur:', error);
      setError('Erreur de connexion lors de la mise à jour');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteProfile = async () => {
    if (!userProfile) return;
    
    // Show the beautiful confirmation modal
    setShowDeleteConfirm(true);
  };
  
  const confirmDelete = async () => {
    if (!userProfile) return;
    
    setIsLoading(true);
    setError(null);
    setShowDeleteConfirm(false);
    
    try {
      // SIMPLE: Call the simple API that deletes both profile AND auth
      const response = await fetch('/api/profiles/delete-simple', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userProfile.id
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setSuccess('Compte supprimé complètement ! Redirection...');
        
        // Simple logout and redirect
        setTimeout(() => {
          signOut();
          window.location.href = '/';
        }, 2000);
      } else {
        console.error('❌ Erreur de l\'API:', result);
        setError(result.error || 'Erreur lors de la suppression du compte');
      }
    } catch (error) {
      console.error('❌ Erreur:', error);
      setError('Erreur de connexion lors de la suppression');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <div className="relative" ref={menuRef}>
      {/* Main Menu Button */}
      <Button
        onClick={toggleMenu}
        className="bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 px-4 py-2 rounded-full font-medium transition-all duration-300 hover:shadow-lg flex items-center space-x-2"
      >
        <User className="w-4 h-4" />
        <span className="hidden sm:inline">{userName}</span>
        <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </Button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-gray-200 z-50 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#4A7C59] to-[#2C3E37] text-white p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold">Menu utilisateur</h3>
                  <p className="text-sm text-white/80">{userName}</p>
                </div>
              </div>
              <button
                onClick={toggleMenu}
                className="text-white/80 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Menu Items */}
          <div className="p-4 space-y-3">
            {/* Edit Profile Section */}
            {isEditing ? (
              <div className="space-y-3 p-4 bg-gray-50 rounded-xl border border-gray-200">
                <h4 className="font-semibold text-gray-800 flex items-center space-x-2">
                  <Edit3 className="w-4 h-4 text-[#4A7C59]" />
                  <span>Modifier le profil</span>
                </h4>
                
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nom complet
                    </label>
                    <input
                      type="text"
                      value={editForm.full_name}
                      onChange={(e) => setEditForm(prev => ({ ...prev, full_name: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4A7C59] focus:border-[#4A7C59] transition-colors"
                      placeholder="Votre nom complet"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      value={editForm.email}
                      onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4A7C59] focus:border-[#4A7C59] transition-colors"
                      placeholder="votre@email.com"
                    />
                  </div>
                </div>

                <div className="flex space-x-2">
                  <Button
                    onClick={handleEditProfile}
                    disabled={isLoading}
                    className="flex-1 bg-[#4A7C59] hover:bg-[#2C3E37] text-white py-2 px-4 rounded-lg font-medium transition-colors disabled:opacity-50"
                  >
                    {isLoading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Sauvegarder
                      </>
                    )}
                  </Button>
                  
                  <Button
                    onClick={() => setIsEditing(false)}
                    variant="outline"
                    className="px-4 py-2 border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg font-medium transition-colors"
                  >
                    Annuler
                  </Button>
                </div>
              </div>
            ) : (
              <Button
                onClick={() => setIsEditing(true)}
                variant="outline"
                className="w-full justify-start border-gray-200 text-gray-700 hover:bg-gray-50 py-3 px-4 rounded-xl font-medium transition-all duration-300 hover:shadow-md"
              >
                <Edit3 className="w-4 h-4 mr-3 text-[#4A7C59]" />
                Modifier le profil
              </Button>
            )}

            {/* Logout Button */}
            <Button
              onClick={handleLogout}
              variant="outline"
              className="w-full justify-start border-gray-200 text-gray-700 hover:bg-gray-50 py-3 px-4 rounded-xl font-medium transition-all duration-300 hover:shadow-md"
            >
              <LogOut className="w-4 h-4 mr-3 text-red-500" />
              Déconnexion
            </Button>

            {/* Delete Account Button */}
            <Button
              onClick={handleDeleteProfile}
              disabled={isLoading}
              variant="outline"
              className="w-full justify-start border-red-200 text-red-600 hover:bg-red-50 py-3 px-4 rounded-xl font-medium transition-all duration-300 hover:shadow-md hover:border-red-300"
            >
              <Trash2 className="w-4 h-4 mr-3" />
              Supprimer le compte
            </Button>
          </div>

          {/* Status Messages */}
          {error && (
            <div className="mx-4 mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center space-x-2 text-red-800">
                <AlertTriangle className="w-4 h-4" />
                <span className="text-sm font-medium">{error}</span>
              </div>
            </div>
          )}

                     {success && (
             <div className="mx-4 mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
               <div className="flex items-center space-x-2 text-green-800">
                 <Settings className="w-4 h-4" />
                 <span className="text-sm font-medium">{success}</span>
               </div>
             </div>
           )}
         </div>
       )}
       
       {/* Beautiful Delete Confirmation Modal */}
       {showDeleteConfirm && (
         <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
           <div className="bg-white rounded-2xl p-6 max-w-md mx-4 shadow-2xl">
             {/* Header */}
             <div className="flex items-center space-x-3 mb-4">
               <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                 <Trash2 className="w-6 h-6 text-red-600" />
               </div>
               <div>
                 <h3 className="text-lg font-semibold text-gray-900">Supprimer le compte</h3>
                 <p className="text-sm text-gray-500">Action irréversible</p>
               </div>
             </div>
             
             {/* Warning Message */}
             <div className="mb-6">
               <p className="text-gray-700 mb-3">
                 Êtes-vous sûr de vouloir supprimer votre compte <strong>définitivement</strong> ?
               </p>
               <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                 <p className="text-sm text-red-800 font-medium mb-2">Cette action supprimera :</p>
                 <ul className="text-sm text-red-700 space-y-1">
                   <li>• Votre profil et toutes vos données</li>
                   <li>• Vos réservations et propriétés</li>
                   <li>• Votre compte d'authentification (email réutilisable)</li>
                 </ul>
               </div>
               <p className="text-sm text-gray-600 mt-3">
                 <strong>Note :</strong> Vous pourrez créer un nouveau compte avec la même adresse email.
               </p>
             </div>
             
             {/* Action Buttons */}
             <div className="flex space-x-3">
               <Button
                 onClick={() => setShowDeleteConfirm(false)}
                 variant="outline"
                 className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50"
               >
                 Annuler
               </Button>
               <Button
                 onClick={confirmDelete}
                 disabled={isLoading}
                 className="flex-1 bg-red-600 hover:bg-red-700 text-white border-red-600"
               >
                 {isLoading ? (
                   <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                 ) : (
                   <>
                     <Trash2 className="w-4 h-4 mr-2" />
                     Supprimer définitivement
                   </>
                 )}
               </Button>
             </div>
           </div>
         </div>
       )}
     </div>
   );
 }
