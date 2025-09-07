"use client";

import Link from 'next/link';
import Breadcrumb, { generateBreadcrumbs } from '@/components/Breadcrumb';
import { Euro, CreditCard, Calendar, Shield, AlertTriangle, FileText, Clock, CheckCircle } from 'lucide-react';

export default function CGVPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link
              href="/"
              className="flex items-center justify-center w-10 h-10 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full"
            >
              ←
            </Link>
            <div className="flex items-center space-x-3">
              <img 
                src="/logo-svg.png" 
                alt="AtypikHouse Logo" 
                className="w-8 h-8 object-contain"
              />
              <span className="text-lg font-bold text-[#2C3E37]">CGV</span>
            </div>
            <div className="w-10"></div>
          </div>
        </div>
      </div>

      {/* Breadcrumb Navigation */}
      <div className="bg-gray-50 border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Breadcrumb items={generateBreadcrumbs('cgv')} />
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Page Title */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-[#2C3E37] mb-4">
            Conditions Générales de Vente
          </h1>
          <p className="text-gray-600">
            AtypikHouse - Hébergements insolites en Europe
          </p>
        </div>

        {/* Project Team Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <h2 className="text-lg font-semibold text-blue-800 mb-3">
            Projet Étudiant Réalisé Par
          </h2>
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-8">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">LS</span>
              </div>
              <span className="text-blue-700 font-medium">Larkem Sami</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">HI</span>
              </div>
              <span className="text-indigo-700 font-medium">Hala Mohamed Islem</span>
            </div>
          </div>
        </div>

        {/* CGV Content */}
        <div className="prose max-w-none space-y-8">
          
          {/* Article 1 - Objet */}
          <section className="bg-gray-50 rounded-xl p-6">
            <div className="flex items-center space-x-3 mb-4">
              <FileText className="w-6 h-6 text-[#4A7C59]" />
              <h2 className="text-xl font-semibold text-[#2C3E37]">Article 1 - Objet</h2>
            </div>
            <p className="text-gray-700 leading-relaxed mb-4">
              Les présentes conditions générales de vente (CGV) régissent les relations contractuelles entre 
              AtypikHouse et ses clients pour la réservation d'hébergements insolites en Europe.
            </p>
            <p className="text-gray-700 leading-relaxed">
              AtypikHouse propose des hébergements insolites incluant : cabanes dans les arbres, yourtes traditionnelles, 
              cabanes flottantes et autres hébergements atypiques en France et en Europe.
            </p>
          </section>

          {/* Article 2 - Prix */}
          <section className="bg-gray-50 rounded-xl p-6">
            <div className="flex items-center space-x-3 mb-4">
              <Euro className="w-6 h-6 text-[#4A7C59]" />
              <h2 className="text-xl font-semibold text-[#2C3E37]">Article 2 - Prix et Tarification</h2>
            </div>
            
            <div className="space-y-4">
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-2">Tarifs des hébergements</h3>
                <ul className="text-gray-700 space-y-2">
                  <li>• <strong>Cabanes dans les arbres :</strong> 80€ - 150€ par nuit</li>
                  <li>• <strong>Yourtes traditionnelles :</strong> 60€ - 120€ par nuit</li>
                  <li>• <strong>Cabanes flottantes :</strong> 100€ - 200€ par nuit</li>
                  <li>• <strong>Autres hébergements insolites :</strong> 70€ - 180€ par nuit</li>
                </ul>
              </div>
              
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-2">Frais supplémentaires</h3>
                <ul className="text-gray-700 space-y-2">
                  <li>• <strong>Frais de service :</strong> 5% du montant total</li>
                  <li>• <strong>Taxe de séjour :</strong> Variable selon la destination (0,50€ - 2,50€ par personne et par nuit)</li>
                  <li>• <strong>Caution :</strong> 100€ - 300€ selon l'hébergement (remboursable)</li>
                </ul>
              </div>
              
              <p className="text-gray-700 leading-relaxed">
                Tous les prix sont exprimés en euros TTC. Les tarifs peuvent varier selon la saison, 
                la durée du séjour et les équipements disponibles.
              </p>
            </div>
          </section>

          {/* Article 3 - Modalités de paiement */}
          <section className="bg-gray-50 rounded-xl p-6">
            <div className="flex items-center space-x-3 mb-4">
              <CreditCard className="w-6 h-6 text-[#4A7C59]" />
              <h2 className="text-xl font-semibold text-[#2C3E37]">Article 3 - Modalités de paiement</h2>
            </div>
            
            <div className="space-y-4">
             
              
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200">
                <h3 className="font-semibold text-green-800 mb-2">💳 Paiement principal lors de l'allocation</h3>
                <p className="text-green-700 mb-3">
                  Le paiement principal s'effectue au moment de l'allocation de l'hébergement, 
                  garantissant ainsi la disponibilité et la confirmation de votre réservation.
                </p>
                <ul className="text-green-700 space-y-2">
                  <li>• <strong>Allocation immédiate :</strong> Paiement intégral requis pour confirmer</li>
                  <li>• <strong>Sécurisation :</strong> L'hébergement vous est réservé instantanément</li>
                  <li>• <strong>Confirmation :</strong> Reçu de paiement envoyé par email</li>
                </ul>
              </div>
              
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-2">Échéances de paiement</h3>
                <ul className="text-gray-700 space-y-2">
                  <li>• <strong>Allocation :</strong> 100% du montant total lors de l'attribution</li>
                  <li>• <strong>Caution :</strong> À l'arrivée sur place (si applicable)</li>
                  <li>• <strong>Frais supplémentaires :</strong> Selon les services utilisés</li>
                </ul>
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-800 mb-2">ℹ️ Information importante</h3>
                <p className="text-blue-700">
                  Le système d'allocation garantit que votre hébergement est immédiatement réservé 
                  dès le paiement effectué. Aucun risque de double réservation.
                </p>
              </div>
              
              <p className="text-gray-700 leading-relaxed">
                En cas de non-paiement lors de l'allocation, l'hébergement sera automatiquement 
                remis à disposition pour d'autres clients.
              </p>
            </div>
          </section>

          {/* Article 4 - Annulations et remboursements */}
          <section className="bg-gray-50 rounded-xl p-6">
            <div className="flex items-center space-x-3 mb-4">
              <Calendar className="w-6 h-6 text-[#4A7C59]" />
              <h2 className="text-xl font-semibold text-[#2C3E37]">Article 4 - Annulations et Remboursements</h2>
            </div>
            
            <div className="space-y-4">
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-2">Délais d'annulation</h3>
                <ul className="text-gray-700 space-y-2">
                  <li>• <strong>Plus de 30 jours :</strong> Remboursement intégral</li>
                  <li>• <strong>15 à 30 jours :</strong> Remboursement de 70%</li>
                  <li>• <strong>7 à 14 jours :</strong> Remboursement de 50%</li>
                  <li>• <strong>Moins de 7 jours :</strong> Aucun remboursement</li>
                </ul>
              </div>
              
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-2">Cas particuliers</h3>
                <ul className="text-gray-700 space-y-2">
                  <li>• <strong>Force majeure :</strong> Remboursement intégral ou report gratuit</li>
                  <li>• <strong>Annulation par AtypikHouse :</strong> Remboursement intégral + 10% de compensation</li>
                  <li>• <strong>Problème technique :</strong> Remboursement ou relocalisation gratuite</li>
                </ul>
              </div>
              
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h3 className="font-semibold text-yellow-800 mb-2">Modalités de remboursement</h3>
                <p className="text-yellow-700">
                  Les remboursements sont effectués sous 5 à 10 jours ouvrés sur le moyen de paiement utilisé. 
                  Les frais bancaires éventuels restent à la charge du client.
                </p>
              </div>
            </div>
          </section>

          {/* Article 5 - Responsabilités */}
          <section className="bg-gray-50 rounded-xl p-6">
            <div className="flex items-center space-x-3 mb-4">
              <Shield className="w-6 h-6 text-[#4A7C59]" />
              <h2 className="text-xl font-semibold text-[#2C3E37]">Article 5 - Responsabilités</h2>
            </div>
            
            <div className="space-y-4">
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-2">Responsabilités d'AtypikHouse</h3>
                <ul className="text-gray-700 space-y-2">
                  <li>• Garantir la conformité de l'hébergement à la description</li>
                  <li>• Assurer la sécurité des installations</li>
                  <li>• Fournir un service client 24h/7j</li>
                  <li>• Respecter les normes d'hygiène et de sécurité</li>
                </ul>
              </div>
              
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-2">Responsabilités du client</h3>
                <ul className="text-gray-700 space-y-2">
                  <li>• Respecter les lieux et les équipements</li>
                  <li>• Informer de tout dommage dans les 24h</li>
                  <li>• Respecter les règles de vie en communauté</li>
                  <li>• Assurer la sécurité des mineurs</li>
                </ul>
              </div>
              
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h3 className="font-semibold text-red-800 mb-2">Limitation de responsabilité</h3>
                <p className="text-red-700">
                  AtypikHouse ne peut être tenu responsable des dommages indirects, perte de profits, 
                  ou incidents liés aux conditions météorologiques ou aux activités extérieures.
                </p>
              </div>
            </div>
          </section>

          {/* Article 6 - Assurance */}
          <section className="bg-gray-50 rounded-xl p-6">
            <div className="flex items-center space-x-3 mb-4">
              <CheckCircle className="w-6 h-6 text-[#4A7C59]" />
              <h2 className="text-xl font-semibold text-[#2C3E37]">Article 6 - Assurance et Sécurité</h2>
            </div>
            
            <div className="space-y-4">
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-2">Assurance obligatoire</h3>
                <p className="text-gray-700 mb-3">
                  Chaque client doit être couvert par une assurance responsabilité civile et rapatriement 
                  valide pour la durée du séjour.
                </p>
                <ul className="text-gray-700 space-y-2">
                  <li>• Assurance responsabilité civile : minimum 1,5M€</li>
                  <li>• Assurance rapatriement : couvrant l'Europe</li>
                  <li>• Justificatif à fournir avant l'arrivée</li>
                </ul>
              </div>
              
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-2">Sécurité des hébergements</h3>
                <ul className="text-gray-700 space-y-2">
                  <li>• Tous les hébergements sont conformes aux normes de sécurité</li>
                  <li>• Équipements de sécurité : extincteurs, détecteurs de fumée</li>
                  <li>• Accès sécurisé et surveillance 24h/24</li>
                  <li>• Procédures d'évacuation affichées</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Article 7 - Litiges */}
          <section className="bg-gray-50 rounded-xl p-6">
            <div className="flex items-center space-x-3 mb-4">
              <Clock className="w-6 h-6 text-[#4A7C59]" />
              <h2 className="text-xl font-semibold text-[#2C3E37]">Article 7 - Litiges et Droit applicable</h2>
            </div>
            
            <div className="space-y-4">
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-2">Résolution des litiges</h3>
                <p className="text-gray-700 mb-3">
                  En cas de litige, les parties s'efforceront de trouver une solution amiable. 
                  À défaut, le litige sera porté devant les tribunaux compétents.
                </p>
                <ul className="text-gray-700 space-y-2">
                  <li>• <strong>Médiation :</strong> Tentative obligatoire avant procédure</li>
                  <li>• <strong>Juridiction :</strong> Tribunaux de Compiègne (France)</li>
                  <li>• <strong>Droit applicable :</strong> Droit français</li>
                  <li>• <strong>Langue :</strong> Français</li>
                </ul>
              </div>
            </div>
          </section>
        </div>

        {/* Back to Home Button */}
        <div className="text-center mt-12 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/"
              className="bg-[#4A7C59] text-white px-8 py-3 rounded-lg font-medium hover:bg-[#2C3E37] transition-colors"
            >
              Retour à l'Accueil
            </Link>
            <Link
              href="/qui-sommes-nous"
              className="bg-gray-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-gray-700 transition-colors"
            >
              Voir les CGU
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
