export default function SitemapLoading() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4A7C59] mx-auto mb-4"></div>
        <p className="text-gray-600 font-medium">Chargement du plan du site...</p>
      </div>
    </div>
  );
}
