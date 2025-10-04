"use client";

import { useState, useEffect } from "react";
import LayoutNavbar from "@/components/LayoutNavbar";
import Footer from "@/components/Footer";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { auth } from "@/firebase/config";
import { Shield, AlertTriangle, Clock, PlayCircle, X, Filter, Loader2 } from "lucide-react";

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
  const [showFilters, setShowFilters] = useState(false);

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
        return "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800";
      case "navigation":
        return "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800";
      case "emergency":
        return "bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/20 dark:text-orange-300 dark:border-orange-800";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700";
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "safety":
        return <Shield className="w-3 h-3 md:w-4 md:h-4" />;
      case "emergency":
        return <AlertTriangle className="w-3 h-3 md:w-4 md:h-4" />;
      default:
        return null;
    }
  };

  const resetFilters = () => {
    setFilters({
      category: "",
      is_active: true,
      sort_by: "priority",
      sort_order: "asc",
      limit: 10
    });
  };

  // Format description to be consistent
  const formatDescription = (description: string) => {
    if (!description) return "Tidak ada deskripsi tersedia";
    
    // Remove extra spaces and newlines, trim to reasonable length
    const cleanDescription = description.replace(/\s+/g, ' ').trim();
    
    // Capitalize first letter
    return cleanDescription.charAt(0).toUpperCase() + cleanDescription.slice(1);
  };

  return (
    <>
      <LayoutNavbar>
        {/* Video Modal */}
        {selectedVideo && (
          <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
            <div className="relative w-full max-w-4xl bg-transparent">
              <button
                onClick={() => setSelectedVideo(null)}
                className="absolute -top-10 right-0 text-white hover:text-gray-300 z-10"
              >
                <X className="w-6 h-6" />
              </button>
              <div className="aspect-w-16 aspect-h-9 w-full">
                <iframe
                  src={getYouTubeEmbedUrl(selectedVideo)}
                  className="w-full h-64 sm:h-80 md:h-96 lg:h-[500px] rounded-lg"
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

        <main className="min-h-screen pt-20 px-4 sm:px-6 lg:px-8 py-6 bg-white dark:bg-gray-900 transition-colors">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
              <div className="w-full">
                <h1 className="text-2xl sm:text-3xl font-bold text-[#053040] dark:text-white">
                  Panduan Keselamatan Berlayar
                </h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm sm:text-base">
                  {totalGuides} panduan tersedia untuk berbagai kondisi berlayar
                </p>
              </div>
              <div className="flex gap-3 w-full md:w-auto">
                {/* Mobile Filter Toggle */}
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="md:hidden bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 px-4 py-3 rounded-lg transition flex items-center gap-2 flex-1 justify-center"
                >
                  <Filter className="w-4 h-4" />
                  <span>Filter</span>
                </button>
                
                <button
                  onClick={handleStartAnalysis}
                  className="bg-[#053040] hover:bg-[#07475f] dark:bg-[#0e4a63] dark:hover:bg-[#0c5a7a] text-white px-4 sm:px-6 py-3 rounded-lg transition whitespace-nowrap flex items-center gap-2 shadow-md flex-1 md:flex-none justify-center"
                  disabled={loading.guides}
                >
                  {loading.guides ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <span className="text-sm sm:text-base">Analisis Panduan</span>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 hidden sm:block" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Error Messages */}
            {authError && (
              <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded mb-6 dark:bg-red-900/20 dark:border-red-800 dark:text-red-300">
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9z" clipRule="evenodd" />
                  </svg>
                  <span>{authError}</span>
                </div>
              </div>
            )}
            {apiError && (
              <div className="bg-yellow-50 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded mb-6 dark:bg-yellow-900/20 dark:border-yellow-800 dark:text-yellow-300">
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <span>{apiError}</span>
                </div>
              </div>
            )}

            {/* Filter Section */}
            <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 sm:p-6 mb-6 border border-gray-100 dark:border-gray-700 transition-all ${showFilters ? 'block' : 'hidden md:block'}`}>
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-semibold text-lg text-gray-800 dark:text-white">Filter Panduan</h2>
                <button
                  onClick={() => setShowFilters(false)}
                  className="md:hidden text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Kategori
                  </label>
                  <select
                    value={filters.category}
                    onChange={(e) => setFilters({...filters, category: e.target.value})}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#053040] focus:border-[#053040] outline-none transition bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
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
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Urutkan Berdasarkan
                  </label>
                  <select
                    value={filters.sort_by}
                    onChange={(e) => setFilters({...filters, sort_by: e.target.value})}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#053040] focus:border-[#053040] outline-none transition bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    disabled={loading.filters}
                  >
                    <option value="priority">Prioritas</option>
                    <option value="created_at">Tanggal Dibuat</option>
                    <option value="title">Judul</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Urutan
                  </label>
                  <select
                    value={filters.sort_order}
                    onChange={(e) => setFilters({...filters, sort_order: e.target.value})}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#053040] focus:border-[#053040] outline-none transition bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    disabled={loading.filters}
                  >
                    <option value="asc">A-Z / Terkecil</option>
                    <option value="desc">Z-A / Terbesar</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Jumlah Tampil
                  </label>
                  <select
                    value={filters.limit}
                    onChange={(e) => setFilters({...filters, limit: Number(e.target.value)})}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#053040] focus:border-[#053040] outline-none transition bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    disabled={loading.filters}
                  >
                    <option value="5">5</option>
                    <option value="10">10</option>
                    <option value="20">20</option>
                    <option value="50">50</option>
                  </select>
                </div>
              </div>
              
              {/* Reset Filters Button */}
              <div className="flex justify-end mt-4">
                <button
                  onClick={resetFilters}
                  className="text-sm text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 underline"
                >
                  Reset filter
                </button>
              </div>
            </div>

            {/* Loading State */}
            {loading.guides && (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#053040] dark:border-white"></div>
              </div>
            )}

            {/* Guides List */}
            {!loading.guides && guides.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {guides.map((guide) => (
                  <div
                    key={guide.id}
                    className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow border border-gray-100 dark:border-gray-700 flex flex-col h-full"
                  >
                    {/* Image */}
                    <div className="relative h-40 sm:h-48">
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
                              className="absolute inset-0 flex items-center justify-center bg-black/10 hover:bg-black/20 transition-colors"
                            >
                              <PlayCircle className="w-10 h-10 sm:w-12 sm:h-12 text-white bg-[#2C5B6B] rounded-full p-2 bg-opacity-80 hover:bg-opacity-100 transition" />
                            </button>
                          )}
                        </>
                      ) : (
                        <div className="w-full h-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                          <span className="text-gray-400 dark:text-gray-500 text-sm">Tidak ada gambar</span>
                        </div>
                      )}
                      {guide.is_mandatory && (
                        <div className="absolute top-2 right-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-full shadow-md">
                          WAJIB
                        </div>
                      )}
                    </div>
                    
                    {/* Content */}
                    <div className="p-4 sm:p-5 flex-1 flex flex-col">
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
                        <h3 className="font-bold text-base sm:text-lg mt-2 text-gray-800 dark:text-white line-clamp-2">
                          {guide.title}
                        </h3>
                      </div>
                    
                      {/* Description - Consistent Height with Smooth Ellipsis */}
                      <div className="mb-4 flex-1 min-h-[4.5rem]">
                        <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed line-clamp-3 overflow-hidden text-ellipsis">
                          {formatDescription(guide.description)}
                        </p>
                      </div>
                      
                      {/* Tags */}
                      {guide.tags.length > 0 && (
                        <div className="mt-auto mb-3">
                          <div className="flex flex-wrap gap-1">
                            {guide.tags.slice(0, 3).map((tag) => (
                              <span
                                key={tag}
                                className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-2 py-1 rounded-full capitalize"
                              >
                                {tag.split('_').map(word => 
                                  word.charAt(0).toUpperCase() + word.slice(1)
                                ).join(' ')}
                              </span>
                            ))}
                            {guide.tags.length > 3 && (
                              <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-2 py-1 rounded-full">
                                +{guide.tags.length - 3}
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                      
                      {/* Footer */}
                      <div className="flex justify-between items-center pt-3 border-t border-gray-100 dark:border-gray-700 mt-auto">
                        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                          <Clock className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                          <span>{guide.estimated_time_minutes} menit</span>
                        </div>
                        {guide.video_url && (
                          <button
                            onClick={() => setSelectedVideo(guide.video_url || null)}
                            className="text-sm text-[#053040] hover:text-[#07475f] dark:text-blue-400 dark:hover:text-blue-300 font-medium flex items-center"
                          >
                            <PlayCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
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
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 sm:p-8 text-center border border-gray-100 dark:border-gray-700">
                <svg className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-white">Tidak ada panduan yang ditemukan</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Coba ubah filter pencarian Anda</p>
                <button
                  onClick={resetFilters}
                  className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[#053040] hover:bg-[#07475f] dark:bg-[#0e4a63] dark:hover:bg-[#0c5a7a] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#053040] dark:focus:ring-offset-gray-900"
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