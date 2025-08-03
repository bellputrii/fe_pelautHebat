"use client";

import { useState, useEffect } from "react";
import LayoutNavbar from "@/components/LayoutNavbar";
import Footer from "@/components/Footer";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { auth } from "@/firebase/config";
import { Shield, AlertTriangle, Clock, PlayCircle, X } from "lucide-react";

type Conditions = {
  trip_purposes: string[];
  boat_types: string[];
  duration_ranges: string[];
  passenger_ranges: string[];
  weather_conditions: string[];
  distance_ranges: string[];
};

type Guide = {
  id: string;
  title: string;
  description: string;
  image_url: string;
  video_url?: string;
  category: string;
  priority: number;
  estimated_time_minutes: number;
  conditions: Conditions;
  is_mandatory: boolean;
  is_active: boolean;
  tags: string[];
  created_at: string;
  updated_at: string;
};

type LoadingState = {
  guides: boolean;
  filters: boolean;
};

// Helper function to convert YouTube URLs to embed format
const getYouTubeEmbedUrl = (url: string) => {
  if (!url) return '';
  
  // Handle regular YouTube links
  if (url.includes('youtube.com/watch?v=')) {
    return url.replace('youtube.com/watch?v=', 'youtube.com/embed/');
  }
  
  // Handle youtu.be short links
  if (url.includes('youtu.be/')) {
    return url.replace('youtu.be/', 'youtube.com/embed/');
  }
  
  // Return as-is if already embed URL
  if (url.includes('youtube.com/embed/')) {
    return url;
  }
  
  return url;
};

export default function PanduanPage() {
  const router = useRouter();
  const [guides, setGuides] = useState<Guide[]>([]);
  const [totalGuides, setTotalGuides] = useState<number>(0);
  const [loading, setLoading] = useState<LoadingState>({
    guides: false,
    filters: false
  });
  const [authError, setAuthError] = useState<string>("");
  const [apiError, setApiError] = useState<string>("");
  const [filters, setFilters] = useState({
    category: "",
    is_active: true,
    sort_by: "priority",
    sort_order: "asc",
    limit: 10
  });
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);

  const fetchGuides = async () => {
    setLoading(prev => ({...prev, guides: true}));
    setAuthError("");
    setApiError("");

    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        setAuthError("Anda perlu login terlebih dahulu.");
        setLoading(prev => ({...prev, guides: false}));
        return;
      }

      const idToken = await currentUser.getIdToken();

      // Build query string from filters
      const queryParams = new URLSearchParams();
      if (filters.category) queryParams.append("category", filters.category);
      queryParams.append("is_active", String(filters.is_active));
      queryParams.append("sort_by", filters.sort_by);
      queryParams.append("sort_order", filters.sort_order);
      queryParams.append("limit", String(filters.limit));

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/guide?${queryParams.toString()}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${idToken}`,
        }
      });

      if (response.status === 401) {
        setAuthError('Sesi Anda telah habis, silakan login kembali');
        return;
      }

      const data = await response.json();
      if (data.success) {
        setGuides(data.data.guides);
        setTotalGuides(data.data.total);
      } else {
        setApiError(data.message || 'Gagal memuat panduan');
      }
    } catch (error) {
      console.error('Error fetching guides:', error);
      setApiError('Terjadi kesalahan saat menghubungi server');
    } finally {
      setLoading(prev => ({...prev, guides: false}));
    }
  };

  useEffect(() => {
    fetchGuides();
  }, [filters]);

  const handleStartAnalysis = () => {
    router.push("/checklist/form-panduan");
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "safety":
        return "bg-red-50 text-red-600 border-red-200";
      case "navigation":
        return "bg-blue-50 text-blue-600 border-blue-200";
      case "emergency":
        return "bg-orange-50 text-orange-600 border-orange-200";
      default:
        return "bg-gray-50 text-gray-600 border-gray-200";
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "safety":
        return <Shield className="w-4 h-4" />;
      case "emergency":
        return <AlertTriangle className="w-4 h-4" />;
      default:
        return null;
    }
  };

  return (
    <>
      <LayoutNavbar>
        {/* Video Modal */}
        {selectedVideo && (
          <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
            <div className="relative w-full max-w-4xl">
              <button
                onClick={() => setSelectedVideo(null)}
                className="absolute -top-10 right-0 text-white hover:text-gray-300"
              >
                <X className="w-6 h-6" />
              </button>
              <div className="aspect-w-16 aspect-h-9 w-full">
                <iframe
                  src={getYouTubeEmbedUrl(selectedVideo)}
                  className="w-full h-full rounded-lg"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  onError={() => {
                    console.error("Video tidak dapat dimuat");
                    setSelectedVideo(null);
                  }}
                ></iframe>
              </div>
            </div>
          </div>
        )}

        <main className="min-h-screen pt-20 p-8 bg-white max-w-7xl mx-auto">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-[#053040]">
                  Panduan Keselamatan Berlayar
                </h1>
                <p className="text-gray-500 mt-1">
                  {totalGuides} panduan tersedia untuk berbagai kondisi berlayar
                </p>
              </div>
              <button
                onClick={handleStartAnalysis}
                className="bg-[#053040] hover:bg-[#07475f] text-white px-6 py-3 rounded-lg transition whitespace-nowrap flex items-center gap-2 shadow-md"
                disabled={loading.guides}
              >
                {loading.guides ? (
                  "Memuat..."
                ) : (
                  <>
                    <span>Analisis Panduan Anda</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </>
                )}
              </button>
            </div>

            {/* Error Messages */}
            {authError && (
              <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded mb-6">
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9z" clipRule="evenodd" />
                  </svg>
                  <span>{authError}</span>
                </div>
              </div>
            )}
            {apiError && (
              <div className="bg-yellow-50 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded mb-6">
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <span>{apiError}</span>
                </div>
              </div>
            )}

            {/* Filter Section */}
            <div className="bg-white rounded-xl shadow-sm p-6 mb-8 border border-gray-100">
              <h2 className="font-semibold text-lg mb-4 text-gray-800">Filter Panduan</h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Kategori
                  </label>
                  <select
                    value={filters.category}
                    onChange={(e) => setFilters({...filters, category: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-[#053040] focus:border-[#053040] outline-none transition"
                    disabled={loading.filters}
                  >
                    <option value="">Semua Kategori</option>
                    <option value="safety">Keselamatan</option>
                    <option value="navigation">Navigasi</option>
                    <option value="emergency">Darurat</option>
                    <option value="general">Umum</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Urutkan Berdasarkan
                  </label>
                  <select
                    value={filters.sort_by}
                    onChange={(e) => setFilters({...filters, sort_by: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-[#053040] focus:border-[#053040] outline-none transition"
                    disabled={loading.filters}
                  >
                    <option value="priority">Prioritas</option>
                    <option value="created_at">Tanggal Dibuat</option>
                    <option value="title">Judul</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Urutan
                  </label>
                  <select
                    value={filters.sort_order}
                    onChange={(e) => setFilters({...filters, sort_order: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-[#053040] focus:border-[#053040] outline-none transition"
                    disabled={loading.filters}
                  >
                    <option value="asc">A-Z / Terkecil</option>
                    <option value="desc">Z-A / Terbesar</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Jumlah Tampil
                  </label>
                  <select
                    value={filters.limit}
                    onChange={(e) => setFilters({...filters, limit: Number(e.target.value)})}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-[#053040] focus:border-[#053040] outline-none transition"
                    disabled={loading.filters}
                  >
                    <option value="5">5</option>
                    <option value="10">10</option>
                    <option value="20">20</option>
                    <option value="50">50</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Loading State */}
            {loading.guides && (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#053040]"></div>
              </div>
            )}

            {/* Guides List */}
            {!loading.guides && guides.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {guides.map((guide) => (
                  <div
                    key={guide.id}
                    className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow border border-gray-100 flex flex-col"
                  >
                    {/* Image */}
                    <div className="relative h-48">
                      {guide.image_url ? (
                        <>
                          <Image
                            src={guide.image_url}
                            alt={guide.title}
                            fill
                            className="object-cover"
                            unoptimized
                          />
                          {guide.video_url && (
                            <button
                              onClick={() => setSelectedVideo(guide.video_url || null)}
                              className="absolute inset-0 flex items-center justify-center"
                            >
                              <PlayCircle className="w-12 h-12 text-white bg-[#2C5B6B] rounded-full p-2 bg-opacity-80 hover:bg-opacity-100 transition" />
                            </button>
                          )}
                        </>
                      ) : (
                        <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                          <span className="text-gray-400">Tidak ada gambar</span>
                        </div>
                      )}
                      {guide.is_mandatory && (
                        <div className="absolute top-3 right-3 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-full shadow-md">
                          WAJIB
                        </div>
                      )}
                    </div>
                    
                    {/* Content */}
                    <div className="p-5 flex-1 flex flex-col">
                      {/* Category and Title */}
                      <div className="mb-3">
                        <span className={`inline-flex items-center text-xs font-medium px-2.5 py-0.5 rounded-full border ${getCategoryColor(guide.category)}`}>
                          {getCategoryIcon(guide.category)}
                          <span className="ml-1">
                            {guide.category === "safety" ? "Keselamatan" : 
                             guide.category === "navigation" ? "Navigasi" : 
                             guide.category === "emergency" ? "Darurat" : "Umum"}
                          </span>
                        </span>
                        <h3 className="font-bold text-lg mt-2 text-gray-800">{guide.title}</h3>
                      </div>
                      
                      {/* Description */}
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                        {guide.description}
                      </p>
                      
                      {/* Tags */}
                      {guide.tags.length > 0 && (
                        <div className="mt-auto mb-3">
                          <div className="flex flex-wrap gap-1">
                            {guide.tags.slice(0, 3).map((tag) => (
                              <span
                                key={tag}
                                className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full"
                              >
                                {tag}
                              </span>
                            ))}
                            {guide.tags.length > 3 && (
                              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                                +{guide.tags.length - 3}
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                      
                      {/* Footer */}
                      <div className="flex justify-between items-center pt-3 border-t border-gray-100 mt-auto">
                        <div className="flex items-center text-sm text-gray-500">
                          <Clock className="w-4 h-4 mr-1" />
                          <span>{guide.estimated_time_minutes} menit</span>
                        </div>
                        {guide.video_url && (
                          <button
                            onClick={() => setSelectedVideo(guide.video_url || null)}
                            className="text-sm text-[#053040] hover:text-[#07475f] font-medium flex items-center"
                          >
                            <PlayCircle className="w-4 h-4 mr-1" />
                            Video
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Empty State */}
            {!loading.guides && guides.length === 0 && (
              <div className="bg-white rounded-xl shadow-sm p-8 text-center border border-gray-100">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="mt-2 text-lg font-medium text-gray-900">Tidak ada panduan yang ditemukan</h3>
                <p className="mt-1 text-sm text-gray-500">Coba ubah filter pencarian Anda</p>
                <button
                  onClick={() => setFilters({
                    category: "",
                    is_active: true,
                    sort_by: "priority",
                    sort_order: "asc",
                    limit: 10
                  })}
                  className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[#053040] hover:bg-[#07475f] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#053040]"
                >
                  Reset filter
                </button>
              </div>
            )}
          </div>
        </main>
      </LayoutNavbar>
      <Footer />
    </>
  );
}