"use client";

import Link from 'next/link';

export default function CGUPage() {
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
              <span className="text-lg font-bold text-[#2C3E37]">CGU</span>
            </div>
            <div className="w-10"></div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Page Title */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-[#2C3E37] mb-4">
            Conditions Générales d'Utilisation
          </h1>
          <p className="text-gray-600">
            Site web : https://www.dsp4-ddm-023dis3-4-g9.fr/
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
              <span className="text-indigo-700 font-medium">Hala Islem</span>
            </div>
          </div>
        </div>

        {/* Warning Banner */}
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-8">
          <h2 className="text-lg font-semibold text-red-800 mb-2">
            ⚠️ ATTENTION : Ce site internet est un projet étudiant
          </h2>
          <p className="text-red-700">
            Aucune réservation ne sera donc honorée car les annonces sont factices.
          </p>
        </div>

        {/* CGU Content */}
        <div className="prose max-w-none space-y-8">
          <section>
            <h2 className="text-xl font-semibold text-[#2C3E37] mb-4">Conditions d'utilisation</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              L'utilisation du site https://www.dsp4-ddm-023dis3-4-g9.fr/ implique l'acceptation pleine et entière des conditions générales d'utilisation ci-après décrites. Ces conditions d'utilisation sont susceptibles d'être modifiées ou complétées à tout moment.
            </p>
            <p className="text-gray-700 leading-relaxed mb-4">
              Ce site (https://www.dsp4-ddm-023dis3-4-g9.fr/) est proposé en différents langages web (HTML, HTML5, Javascript, CSS, etc…) pour un meilleur confort d'utilisation et un graphisme plus agréable.
            </p>
            <p className="text-gray-700 leading-relaxed mb-4">
              Nous vous recommandons de recourir à des navigateurs modernes comme Internet explorer, Safari, Firefox, Google Chrome, etc…
            </p>
            <p className="text-gray-700 leading-relaxed mb-4">
              L'agence Com'Une met en œuvre tous les moyens dont elle dispose, pour assurer une information fiable et une mise à jour fiable de ses sites internet.
            </p>
            <p className="text-gray-700 leading-relaxed mb-4">
              Toutefois, des erreurs ou omissions peuvent survenir. L'internaute devra donc s'assurer de l'exactitude des informations auprès d'Atypik House, et signaler toutes modifications du site qu'il jugerait utile. Atypik House n'est en aucun cas responsable de l'utilisation faite de ces informations, et de tout préjudice direct ou indirect pouvant en découler.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#2C3E37] mb-4">Cookies</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Nous pouvons être amené à vous demander l'acceptation des cookies pour des besoins de statistiques et d'affichage. Un cookie est une information déposée sur votre disque dur par le serveur du site que vous visitez.
            </p>
            <p className="text-gray-700 leading-relaxed mb-4">
              Il contient plusieurs données qui sont stockées sur votre ordinateur dans un simple fichier texte auquel un serveur accède pour lire et enregistrer des informations. Certaines parties de ce site ne peuvent être fonctionnelles sans l'acceptation de cookies.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#2C3E37] mb-4">Liens hypertextes</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Les sites internets peuvent offrir des liens vers d'autres sites internet ou d'autres ressources disponibles sur Internet. SARL ATYPIKHOUSE ne dispose d'aucun moyen pour contrôler les sites en connexion avec ses sites internet.
            </p>
            <p className="text-gray-700 leading-relaxed mb-4">
              Nous ne répondons pas de la disponibilité de tels sites et sources externes, ni ne la garantit. Elle ne peut être tenue pour responsable de tout dommage, résultant du contenu de ces sites ou sources externes, et notamment des informations, produits ou services qu'ils proposent, ou de tout usage qui peut être fait de ces éléments. Les risques liés à cette utilisation incombent pleinement à l'internaute, qui doit se conformer à leurs conditions d'utilisation.
            </p>
            <p className="text-gray-700 leading-relaxed mb-4">
              Les utilisateurs, les abonnés et les visiteurs des sites internet ne peuvent pas mettre en place un hyperlien en direction de ce site sans notre autorisation expresse et préalable.
            </p>
            <p className="text-gray-700 leading-relaxed mb-4">
              Dans l'hypothèse où un utilisateur ou visiteur souhaiterait mettre en place un hyperlien en direction d'un des sites internet de SARL ATYPIKHOUSE, il lui appartiendra d'adresser un email accessible sur le site afin de formuler sa demande de mise en place d'un hyperlien.
            </p>
            <p className="text-gray-700 leading-relaxed mb-4">
              La SARL ATYPIKHOUSE se réserve le droit d'accepter ou de refuser un hyperlien sans avoir à en justifier sa décision.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#2C3E37] mb-4">Services fournis</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              La Plateforme Atypik House est un site en ligne qui permet aux utilisateurs (les « Voyageurs») de réserver des logements en ligne (services) et à certains tiers de proposer des services (les « Hôtes ») en publiant des annonces sur la Plateforme Atypik House et de communiquer et traiter directement avec des voyageurs qui souhaitent réserver ces Services.
            </p>
            <p className="text-gray-700 leading-relaxed mb-4">
              Atypik House n'est pas propriétaire et ne crée pas ni ne vend, revend, fournit, contrôle, gère ou propose de quelconques Annonces ou Services proposés par l'Hôte. Les Hôtes sont seuls responsables de leurs Annonces et Services Hôte.
            </p>
            <p className="text-gray-700 leading-relaxed mb-4">
              L'ensemble des activités de la société ainsi que ses informations sont présentés sur notre site https://www.dsp4-ddm-023dis3-4-g9.fr/
            </p>
            <p className="text-gray-700 leading-relaxed mb-4">
              Nous nous efforçons de fournir sur https://www.dsp4-ddm-023dis3-4-g9.fr/ des informations aussi précises que possible. Les renseignements figurant sur ce site ne sont pas exhaustifs et les photos non contractuelles.
            </p>
            <p className="text-gray-700 leading-relaxed mb-4">
              Ils sont donnés sous réserve de modifications ayant été apportées depuis leur mise en ligne. Par ailleurs, tous les informations indiquées sur le site https://www.dsp4-ddm-023dis3-4-g9.fr/ sont données à titre indicatif, et sont susceptibles de changer ou d'évoluer sans préavis.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#2C3E37] mb-4">Propriété intellectuelle</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Tout contenu publié et mis à disposition sur ce site est la propriété de Atypik House et de ses créateurs.
            </p>
            <p className="text-gray-700 leading-relaxed mb-4">
              Cela comprend, mais n'est pas limité aux images(à l'exception des images provenant de banques d'images libre de droit), textes, logos, documents, fichiers téléchargeables et tout ce qui contribue à la composition de ce site.
            </p>
            <p className="text-gray-700 leading-relaxed mb-4">
              Toute exploitation non autorisée du site ou de l'un quelconque des éléments qu'il contient sera considérée comme constitutive d'une contrefaçon et poursuivie conformément aux dispositions des articles L.335-2 et suivants du Code de Propriété Intellectuelle.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#2C3E37] mb-4">Litiges</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Les présentes conditions du site https://www.dsp4-ddm-023dis3-4-g9.fr/ sont régies par les lois françaises et toute contestation ou litiges qui pourraient naître de l'interprétation ou de l'exécution de celles-ci seront de la compétence exclusive des tribunaux dont dépend le siège social de la société. La langue de référence, pour le règlement de contentieux éventuels, est le français.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#2C3E37] mb-4">Données personnelles</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              De manière générale, vous n'êtes pas tenu de nous communiquer vos données personnelles lorsque vous visitez le site Atypik House.
            </p>
            <p className="text-gray-700 leading-relaxed mb-4">
              Cependant, ce principe comporte certaines exceptions. En effet, pour certains services proposés par notre site, vous pouvez être amenés à nous communiquer certaines données telles que : votre nom, votre fonction, le nom de votre société, votre adresse électronique, et votre numéro de téléphone. Tel est le cas lorsque vous remplissez le formulaire qui vous est proposé en ligne, dans la rubrique « contact ».
            </p>
            <p className="text-gray-700 leading-relaxed mb-4">
              Dans tous les cas, vous pouvez refuser de fournir vos données personnelles. Dans ce cas, vous ne pourrez pas utiliser les services du site, notamment celui de solliciter des renseignements sur notre société, ou de recevoir les lettres d'information.
            </p>
            <p className="text-gray-700 leading-relaxed mb-4">
              Enfin, nous pouvons collecter de manière automatique certaines informations vous concernant lors d'une simple navigation sur notre site internet, notamment : des informations concernant l'utilisation de notre site, comme les zones que vous visitez et les services auxquels vous accédez, votre adresse IP, le type de votre navigateur, vos temps d'accès.
            </p>
            <p className="text-gray-700 leading-relaxed mb-4">
              De telles informations sont utilisées exclusivement à des fins de statistiques internes, de manière à améliorer la qualité des services qui vous sont proposés. Les bases de données sont protégées par les dispositions de la loi du 1er juillet 1998 transposant la directive 96/9 du 11 mars 1996 relative à la protection juridique des bases de données.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#2C3E37] mb-4">Conditions générales de vente (CGV)</h2>
            <h3 className="text-lg font-medium text-[#2C3E37] mb-3">Objet</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              Les présentes conditions générales définissent les droits et obligations des parties dans le cadre de la réservation à distance de services proposés par notre établissement dont les coordonnées sont précisées dans le présent document de confirmation de réservation. Elles régissent toutes les étapes nécessaires à la réservation et au suivi de la réservation entre les parties contractantes. Le client reconnaît avoir pris connaissance et accepté les présentes conditions générales de vente et les conditions de vente du tarif réservé accessibles sur notre plateforme de réservation. Les présentes conditions générales de vente s'appliquent à toutes les réservations conclues par internet, via notre plateforme de réservation.
            </p>
            <h3 className="text-lg font-medium text-[#2C3E37] mb-3">Vente des biens et services</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              Les services que nous offrons comprennent : Location d'hébergement insolite et Prestation de services événementiels
            </p>
            <p className="text-gray-700 leading-relaxed mb-4">
              Les services liés à ce document sont les services qui sont affichés sur notre site au moment où vous y accédez. Toutes les informations, descriptions ou images que nous fournissons sur nos services sont décrites et présentées avec précision. Cependant, nous ne sommes pas légalement tenus par ces informations, descriptions ou images car nous ne pouvons pas garantir l'exactitude de chaque produit ou service que nous fournissons.
            </p>
            <h3 className="text-lg font-medium text-[#2C3E37] mb-3">Modalités de paiements</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              Nous acceptons les modes de paiement suivants sur ce site : Virement bancaire, carte bancaire
            </p>
            <p className="text-gray-700 leading-relaxed mb-4">
              En fournissant vos informations de paiement, vous confirmez que vous nous autorisez à facturer le montant dû lors de votre réservation. Si nous estimons que votre paiement a violé une loi ou l'une de nos conditions d'utilisation, nous nous réservons le droit d'annuler votre transaction.
            </p>
            <h3 className="text-lg font-medium text-[#2C3E37] mb-3">Modalités d'annulation et de remboursement</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              Pour chaque bien proposé en location, il y a un délai d'annulation fixé par le propriétaire. Pendant ce délai, vous pouvez annuler votre réservation à tout moment sans frais supplémentaires. Passé ce délai, en cas d'annulation vous ne serez pas remboursé.
            </p>
            <h3 className="text-lg font-medium text-[#2C3E37] mb-3">Respect de la vie privée</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              Le client est informé, sur chacun des formulaires de collecte de données à caractère personnel, du caractère obligatoire ou facultatif des réponses par la présence d'un astérisque. Les informations traitées sont destinées à l'établissements, Atypik House, à ses entités, à ses partenaires, à ses prestataires (et notamment aux prestataires de paiement en ligne). Le client autorise Atypik House à communiquer ses données personnelles à des tiers à la condition qu'une telle communication se révèle compatible avec la réalisation des opérations incombant à Atypik House au titre des présentes conditions générales et en lien avec la Charte clients de protection des données personnelles.
            </p>
            <h3 className="text-lg font-medium text-[#2C3E37] mb-3">Limitation de responsabilités</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              En cas de problème survenu lors de l'utilisation de notre site, la responsabilité reviendra à Atypik House, à condition que cela ne relève pas d'une utilisation inappropriée, illégale ou contraire à nos conditions d'utilisation. En cas de violation de nos conditions d'utilisation, Atypik House ne sera pas tenu pour responsable.
            </p>
            <p className="text-gray-700 leading-relaxed mb-4">
              La société Atypik House ne pourra être tenue responsable des dommages directs et indirects causés au matériel du visiteur, lors de l'accès au site, ou résultant de l'utilisation d'un matériel défectueux ou encore de l'apparition d'un bug ou d'une incompatibilité.
            </p>
            <p className="text-gray-700 leading-relaxed mb-4">
              En tant qu'utilisateur, en acceptant nos conditions générales d'utilisation et de vente, en connaissance de cause et sans aucune réserve, vous déchargez la société Atypik House de toute responsabilité, cause d'action, dommage ou dépense découlant de votre utilisation de ce site ou de votre violation de l'une des dispositions énoncées ci-dessus.
            </p>
          </section>
        </div>

        {/* Back to Home Button */}
        <div className="text-center mt-12">
          <Link
            href="/"
            className="bg-[#4A7C59] text-white px-8 py-3 rounded-lg font-medium hover:bg-[#2C3E37] transition-colors"
          >
            Retour à l'Accueil
          </Link>
        </div>
      </div>
    </div>
  );
} 