"use client";

import React, { useState } from 'react';
import { 
  Search, 
  Calendar, 
  User, 
  MapPin, 
  TreePine, 
  Heart, 
  Globe, 
  Leaf,
  ArrowRight,
  Filter,
  BookOpen
} from 'lucide-react';

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  publishDate: string;
  readTime: string;
  category: string;
  image: string;
  tags: string[];
}

const blogPosts: BlogPost[] = [
  {
    id: '1',
    title: 'Le Glamping au Maroc : Luxe et Nature en Harmonie',
    excerpt: 'Découvrez l\'expérience unique du glamping marocain, où le confort moderne rencontre la beauté sauvage du désert et des montagnes de l\'Atlas.',
    content: 'Le glamping au Maroc représente l\'évolution moderne du camping traditionnel, offrant une expérience de luxe en pleine nature. Contrairement au camping classique, le glamping combine le confort d\'un hôtel avec l\'immersion totale dans la nature. Les tentes de luxe, souvent inspirées des traditions berbères, sont équipées de lits confortables, de salles de bain privées et parfois même de terrasses privées avec vue sur les dunes du Sahara ou les sommets enneigés de l\'Atlas. Cette tendance touristique, popularisée par des sites comme Glamping.com et des expériences comme celles proposées par Merzouga Luxury Camp, permet aux voyageurs de vivre une aventure authentique sans renoncer au confort moderne.',
    author: 'Sarah Benali',
    publishDate: '2024-01-15',
    readTime: '6 min',
    category: 'Glamping & Luxe Nature',
    image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
    tags: ['glamping', 'Maroc', 'luxe', 'nature', 'désert']
  },
  {
    id: '2',
    title: 'Les Cabanes dans les Arbres : Une Expérience Magique en France',
    excerpt: 'Explorez les plus belles cabanes perchées de France, de la Provence aux Alpes, et découvrez comment ces hébergements insolites reconnectent avec la nature.',
    content: 'Les cabanes dans les arbres en France offrent une expérience de séjour unique, permettant aux voyageurs de dormir littéralement dans la canopée. Ces constructions écologiques, souvent construites en bois local et respectant les normes environnementales, proposent des vues imprenables sur la nature environnante. Des sites comme La Cabane des Cimes en Provence ou Les Cabanes du Lac Léman dans les Alpes françaises proposent des expériences variées, de la cabane romantique pour deux personnes aux grandes cabanes familiales. L\'architecture de ces cabanes s\'inspire souvent des techniques traditionnelles de construction, utilisant des matériaux durables et des techniques respectueuses de l\'environnement. Cette tendance, documentée par des spécialistes comme Treehouse Life et des architectes spécialisés, répond à une demande croissante d\'expériences touristiques authentiques et durables.',
    author: 'Pierre Dubois',
    publishDate: '2024-01-10',
    readTime: '7 min',
    category: 'Cabanes & Hébergements Insolites',
    image: 'https://images.unsplash.com/photo-1540520372776-d95dc8d21610?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1yZWxhdGVkfDJ8fHxlbnwwfHx8fHw%3D',
    tags: ['cabanes', 'arbres', 'France', 'nature', 'écologie']
  },
  {
    id: '3',
    title: 'Les Yourtes : Entre Tradition Nomade et Tourisme Moderne',
    excerpt: 'Découvrez l\'histoire fascinante des yourtes et comment ces habitations traditionnelles s\'adaptent au tourisme contemporain en Europe.',
    content: 'Les yourtes, habitations traditionnelles des nomades d\'Asie centrale, ont traversé les siècles pour devenir un choix d\'hébergement prisé des voyageurs en quête d\'authenticité. Ces structures circulaires, construites avec des matériaux naturels comme le bois, la laine et le feutre, offrent une isolation thermique exceptionnelle et une résistance aux conditions climatiques extrêmes. En Europe, des entreprises comme Yourte & Co en France et Yurt Holidays au Royaume-Uni ont adapté ces constructions traditionnelles aux standards modernes de confort, ajoutant l\'électricité, le chauffage et les sanitaires tout en préservant l\'esprit nomade. L\'architecture de la yourte, étudiée par des ethnologues et des architectes spécialisés dans les constructions nomades, représente un exemple parfait de design bioclimatique, utilisant les ressources locales et respectant l\'environnement.',
    author: 'Marie Laurent',
    publishDate: '2024-01-05',
    readTime: '8 min',
    category: 'Culture & Traditions',
    image: 'https://plus.unsplash.com/premium_photo-1686090450592-aca413579d36?q=80&w=870&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    tags: ['yourtes', 'nomades', 'tradition', 'Asie centrale', 'authenticité']
  },
  {
    id: '4',
    title: 'Éco-tourisme : Comment Voyager Responsable en 2024',
    excerpt: 'Découvrez nos conseils pour réduire votre impact environnemental tout en explorant des destinations extraordinaires et des hébergements durables.',
    content: 'L\'éco-tourisme n\'est plus une tendance, c\'est une nécessité face aux défis environnementaux actuels. Cette forme de tourisme responsable, définie par l\'Organisation Mondiale du Tourisme (OMT), vise à minimiser l\'impact environnemental tout en contribuant au développement local. Des plateformes comme Ecobnb et Green Pearls spécialisées dans l\'hébergement durable, proposent des hébergements certifiés respectant des critères stricts : énergies renouvelables, alimentation locale, gestion des déchets, et préservation de la biodiversité. Les voyageurs éco-responsables privilégient les transports doux, les hébergements locaux, et les activités respectueuses de l\'environnement. Des destinations comme la Slovénie, pionnière en matière de tourisme vert, ou les parcs naturels français, offrent des exemples concrets de développement touristique durable.',
    author: 'Thomas Martin',
    publishDate: '2024-01-01',
    readTime: '9 min',
    category: 'Éco-tourisme & Durabilité',
    image: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2074&q=80',
    tags: ['éco-tourisme', 'durabilité', 'environnement', 'responsable', 'OMT']
  },
  {
    id: '5',
    title: 'Les Cabanes Flottantes : Une Expérience Aquatique Unique',
    excerpt: 'Découvrez le charme unique des cabanes flottantes et laissez-vous porter par la tranquillité des eaux dans des hébergements insolites.',
    content: 'Les cabanes flottantes offrent une expérience de séjour véritablement unique, permettant aux voyageurs de flotter doucement sur l\'eau tout en profitant du confort moderne. Ces constructions innovantes, inspirées des maisons flottantes traditionnelles d\'Asie du Sud-Est et des péniches européennes, sont conçues pour s\'adapter aux mouvements de l\'eau tout en offrant une stabilité maximale. Des entreprises comme Floating Homes en France et Water Cabins aux Pays-Bas ont développé des concepts modernes de cabanes flottantes, utilisant des matériaux durables et des technologies respectueuses de l\'environnement. Ces hébergements, souvent situés sur des lacs, des rivières ou des fjords, offrent une perspective unique sur l\'environnement aquatique et permettent une immersion totale dans la nature, tout en respectant les écosystèmes fragiles.',
    author: 'Sophie Moreau',
    publishDate: '2023-12-28',
    readTime: '5 min',
    category: 'Hébergements Insolites',
    image: 'https://images.unsplash.com/photo-1618396755206-ff25b5737b8a?q=80&w=1032&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    tags: ['cabanes flottantes', 'eau', 'tranquillité', 'nature', 'innovation']
  },
  {
    id: '6',
    title: 'L\'Avenir du Tourisme : Vers des Expériences Authentiques et Durables',
    excerpt: 'Découvrez comment le secteur touristique évolue vers des expériences plus authentiques, durables et respectueuses des communautés locales.',
    content: 'Le secteur touristique connaît une transformation profonde, poussé par une demande croissante d\'expériences authentiques et durables. Les voyageurs modernes, particulièrement les milléniaux et la génération Z, privilégient les expériences locales, les hébergements insolites et les activités respectueuses de l\'environnement. Des plateformes comme Airbnb Experiences et des spécialistes du tourisme durable comme Responsible Travel documentent cette évolution. Les hébergements alternatifs - yourtes, cabanes, maisons flottantes - répondent à cette demande en offrant des expériences uniques tout en préservant l\'authenticité des destinations. Les communautés locales jouent un rôle central dans cette transformation, proposant des expériences culturelles authentiques et bénéficiant directement du développement touristique. Cette approche, soutenue par des organisations comme l\'UNESCO et l\'OMT, représente l\'avenir d\'un tourisme plus responsable et inclusif.',
    author: 'Équipe AtypikHouse',
    publishDate: '2023-12-20',
    readTime: '10 min',
    category: 'Tendances & Avenir',
    image: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
    tags: ['tendances', 'authenticité', 'durabilité', 'communautés', 'avenir']
  },
  {
    id: '7',
    title: 'Glamping en Scandinavie : Luxe Minimaliste au Cœur de la Nature',
    excerpt: 'Explorez les expériences de glamping nordique, où le design scandinave rencontre la beauté sauvage des fjords et des forêts boréales.',
    content: 'Le glamping scandinave représente l\'essence du luxe minimaliste en pleine nature. En Norvège, en Suède et au Danemark, des entreprises comme Under Canvas Scandinavia et Nordic Glamping proposent des expériences uniques alliant confort moderne et respect de l\'environnement. Les tentes de luxe, souvent inspirées du design nordique avec des matériaux naturels comme le bois de bouleau et la laine, offrent une vue imprenable sur les fjords norvégiens ou les forêts suédoises. Ces hébergements, certifiés par des organisations comme Green Key et Nordic Swan, respectent les plus hauts standards de durabilité. Les activités proposées incluent l\'observation des aurores boréales, la randonnée dans les parcs nationaux, et la découverte de la culture sami. Cette approche touristique, documentée par des spécialistes comme Visit Scandinavia et des architectes spécialisés dans l\'écotourisme nordique, répond à une demande croissante d\'expériences authentiques et respectueuses de l\'environnement.',
    author: 'Erik Johansson',
    publishDate: '2023-12-15',
    readTime: '8 min',
    category: 'Glamping & Luxe Nature',
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
    tags: ['glamping', 'Scandinavie', 'luxe', 'nature', 'durabilité']
  },
  {
    id: '8',
    title: 'Les Yourtes Modernes : Innovation et Tradition en Harmonie',
    excerpt: 'Découvrez comment les yourtes contemporaines allient technologies modernes et savoir-faire traditionnel pour créer des hébergements uniques.',
    content: 'Les yourtes modernes représentent une fusion parfaite entre innovation technologique et respect des traditions ancestrales. Des entreprises comme YurtCo en Californie et Modern Yurts au Royaume-Uni ont révolutionné ce concept en intégrant des technologies durables : panneaux solaires, systèmes de chauffage écologiques, et matériaux isolants innovants. Ces structures, étudiées par des architectes spécialisés comme Yurt Architecture Studio et des chercheurs en construction durable, offrent une efficacité énergétique exceptionnelle tout en préservant l\'esthétique traditionnelle. Les yourtes modernes sont équipées de wifi, de cuisines fonctionnelles, et de salles de bain luxueuses, sans perdre leur caractère authentique. Cette évolution, documentée par des publications spécialisées comme Yurt Life Magazine et des experts en hébergement alternatif, répond aux besoins des voyageurs modernes tout en respectant l\'héritage culturel des nomades d\'Asie centrale.',
    author: 'Alexandra Petrov',
    publishDate: '2023-12-10',
    readTime: '9 min',
    category: 'Culture & Traditions',
    image: 'https://images.unsplash.com/photo-1639232974699-d9110f0a803a?q=80&w=329&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    tags: ['yourtes', 'innovation', 'technologie', 'tradition', 'durabilité']
  },
  {
    id: '9',
    title: 'Glamping en Afrique : Safari de Luxe et Aventure Authentique',
    excerpt: 'Explorez les expériences de glamping africain, du désert du Sahara aux savanes du Kenya, pour des aventures inoubliables.',
    content: 'Le glamping en Afrique offre une expérience de safari de luxe unique, combinant aventure authentique et confort moderne. Des entreprises comme &Beyond et Wilderness Safaris proposent des camps de tentes luxueuses dans les parcs nationaux du Kenya, de la Tanzanie et de l\'Afrique du Sud. Ces hébergements, souvent situés dans des concessions privées, offrent une intimité totale avec la nature sauvage tout en garantissant le confort d\'un hôtel 5 étoiles. Les tentes de safari, inspirées des expéditions coloniales mais modernisées, sont équipées de terrasses privées, de salles de bain en plein air, et parfois même de piscines avec vue sur la savane. Les activités incluent des safaris guidés, des rencontres avec les communautés locales, et des expériences culinaires authentiques. Cette approche touristique, soutenue par des organisations de conservation comme African Parks et des spécialistes du tourisme responsable, contribue à la préservation de la biodiversité africaine tout en soutenant les communautés locales.',
    author: 'Kwame Osei',
    publishDate: '2023-12-05',
    readTime: '11 min',
    category: 'Glamping & Luxe Nature',
    image: 'https://images.unsplash.com/photo-1570742544137-3a469196c32b?q=80&w=869&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    tags: ['glamping', 'Afrique', 'safari', 'luxe', 'aventure']
  }
];

const categories = [
  { name: 'Tous', count: blogPosts.length },
  { name: 'Glamping & Luxe Nature', count: blogPosts.filter(post => post.category === 'Glamping & Luxe Nature').length },
  { name: 'Cabanes & Hébergements Insolites', count: blogPosts.filter(post => post.category === 'Cabanes & Hébergements Insolites').length },
  { name: 'Culture & Traditions', count: blogPosts.filter(post => post.category === 'Culture & Traditions').length },
  { name: 'Éco-tourisme & Durabilité', count: blogPosts.filter(post => post.category === 'Éco-tourisme & Durabilité').length },
  { name: 'Tendances & Avenir', count: blogPosts.filter(post => post.category === 'Tendances & Avenir').length }
];

export default function BlogPage(): React.JSX.Element {
  const [selectedCategory, setSelectedCategory] = useState('Tous');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [showFullArticle, setShowFullArticle] = useState(false);
  const postsPerPage = 6;

  const filteredPosts = blogPosts.filter(post => {
    const matchesCategory = selectedCategory === 'Tous' || post.category === selectedCategory;
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const totalPages = Math.ceil(filteredPosts.length / postsPerPage);
  const currentPosts = filteredPosts.slice((currentPage - 1) * postsPerPage, currentPage * postsPerPage);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleReadMore = (post: BlogPost) => {
    setSelectedPost(post);
    setShowFullArticle(true);
  };

  const handleCloseArticle = () => {
    setShowFullArticle(false);
    setSelectedPost(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-[#4A7C59] to-[#2C3E37] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <TreePine className="w-8 h-8" />
              <h1 className="text-4xl font-bold">Blog AtypikHouse</h1>
            </div>
            <p className="text-xl text-green-100 max-w-3xl mx-auto">
              Découvrez nos articles sur l'hébergement insolite, l'éco-tourisme et la vie en harmonie avec la nature
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Search and Filters */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            {/* Search Bar */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher un article..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#4A7C59] focus:border-[#4A7C59] transition-all duration-300"
              />
            </div>

            {/* Category Filters */}
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category.name}
                  onClick={() => setSelectedCategory(category.name)}
                  className={`px-4 py-2 rounded-xl font-medium transition-all duration-300 ${
                    selectedCategory === category.name
                      ? 'bg-[#4A7C59] text-white shadow-lg'
                      : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  {category.name} ({category.count})
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Featured Post */}
        {currentPosts.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Article en Vedette</h2>
            <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
              <div className="grid grid-cols-1 lg:grid-cols-2">
                <div className="relative h-64 lg:h-full">
                  <img
                    src={currentPosts[0].image}
                    alt={currentPosts[0].title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                </div>
                <div className="p-8 flex flex-col justify-center">
                  <div className="flex items-center gap-4 mb-4">
                    <span className="bg-[#4A7C59]/10 text-[#4A7C59] px-3 py-1 rounded-full text-sm font-medium">
                      {currentPosts[0].category}
                    </span>
                    <div className="flex items-center gap-2 text-gray-500 text-sm">
                      <Calendar className="w-4 h-4" />
                      {formatDate(currentPosts[0].publishDate)}
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">
                    {currentPosts[0].title}
                  </h3>
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    {currentPosts[0].excerpt}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        {currentPosts[0].author}
                      </div>
                      <div className="flex items-center gap-1">
                        <BookOpen className="w-4 h-4" />
                        {currentPosts[0].readTime}
                      </div>
                    </div>
                    <button className="bg-gradient-to-r from-[#4A7C59] to-[#2C3E37] hover:from-[#2C3E37] hover:to-[#4A7C59] text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-[#4A7C59]/25 flex items-center gap-2" onClick={() => handleReadMore(currentPosts[0])}>
                      Lire l'article
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Blog Posts Grid */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            {selectedCategory === 'Tous' ? 'Tous les Articles' : `Articles - ${selectedCategory}`}
          </h2>
          
          {currentPosts.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-gray-900 mb-2">
                Aucun article trouvé
              </h3>
              <p className="text-gray-500">
                Aucun article ne correspond à vos critères de recherche.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {currentPosts.slice(1).map((post) => (
                <article key={post.id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300">
                  <div className="relative h-48">
                    <img
                      src={post.image}
                      alt={post.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                    <div className="absolute top-4 left-4">
                      <span className="bg-[#4A7C59]/90 text-white px-3 py-1 rounded-full text-sm font-medium">
                        {post.category}
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <div className="flex items-center gap-4 mb-3 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {formatDate(post.publishDate)}
                      </div>
                      <div className="flex items-center gap-1">
                        <BookOpen className="w-4 h-4" />
                        {post.readTime}
                      </div>
                    </div>
                    
                    <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2">
                      {post.title}
                    </h3>
                    
                    <p className="text-gray-600 mb-4 line-clamp-3">
                      {post.excerpt}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <User className="w-4 h-4" />
                        {post.author}
                      </div>
                      <button className="text-[#4A7C59] hover:text-[#2C3E37] font-medium transition-colors flex items-center gap-1" onClick={() => handleReadMore(post)}>
                        Lire plus
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center">
            <div className="flex gap-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                    currentPage === page
                      ? 'bg-[#4A7C59] text-white shadow-lg'
                      : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Full Article Modal */}
      {showFullArticle && selectedPost && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="relative">
              {/* Header */}
              <div className="relative h-64 lg:h-80">
                <img
                  src={selectedPost.image}
                  alt={selectedPost.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                <button
                  onClick={handleCloseArticle}
                  className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm text-white p-2 rounded-full hover:bg-white/30 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Content */}
              <div className="p-8">
                <div className="flex items-center gap-4 mb-6">
                  <span className="bg-[#4A7C59]/10 text-[#4A7C59] px-3 py-1 rounded-full text-sm font-medium">
                    {selectedPost.category}
                  </span>
                  <div className="flex items-center gap-2 text-gray-500 text-sm">
                    <Calendar className="w-4 h-4" />
                    {formatDate(selectedPost.publishDate)}
                  </div>
                  <div className="flex items-center gap-2 text-gray-500 text-sm">
                    <BookOpen className="w-4 h-4" />
                    {selectedPost.readTime}
                  </div>
                </div>

                <h1 className="text-3xl font-bold text-gray-900 mb-6">
                  {selectedPost.title}
                </h1>

                <div className="flex items-center gap-4 mb-8 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <User className="w-4 h-4" />
                    {selectedPost.author}
                  </div>
                </div>

                <div className="prose prose-lg max-w-none">
                  <p className="text-gray-700 leading-relaxed mb-6">
                    {selectedPost.content}
                  </p>
                </div>

                {/* Tags */}
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <h3 className="text-sm font-medium text-gray-900 mb-3">Tags :</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedPost.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 