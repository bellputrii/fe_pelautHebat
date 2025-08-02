"use client";

import { useState, useEffect } from "react";
import LayoutNavbar from "@/components/LayoutNavbar";
import Footer from "@/components/Footer";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { auth } from "@/firebase/config";

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
        return "bg-red-100 text-red-800";
      case "navigation":
        return "bg-blue-100 text-blue-800";
      case "emergency":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const translateCondition = (value: string) => {
    const translations: Record<string, string> = {
      "fishing": "Memancing",
      "transport": "Transportasi",
      "recreation": "Rekreasi",
      "emergency": "Darurat",
      "perahu_kecil": "Perahu Kecil",
      "kapal_nelayan": "Kapal Nelayan",
      "kapal_besar": "Kapal Besar",
      "short": "Pendek",
      "medium": "Menengah",
      "long": "Panjang",
      "solo": "Sendiri",
      "small": "Kecil",
      "large": "Besar",
      "calm": "Tenang",
      "moderate": "Sedang",
      "rough": "Kasar",
      "far": "Jauh"
    };
    return translations[value] || value;
  };

  return (
    <>
      <LayoutNavbar>
        <main className="min-h-screen bg-[#f2f9fa] px-4 py-16">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-[#053040]">
                  Panduan Keselamatan Berlayar
                </h1>
                <p className="text-gray-600">
                  {totalGuides} panduan tersedia untuk berbagai kondisi berlayar
                </p>
              </div>
              <button
                onClick={handleStartAnalysis}
                className="bg-[#053040] text-white px-6 py-2 rounded hover:bg-[#07475f] transition whitespace-nowrap"
                disabled={loading.guides}
              >
                {loading.guides ? "Memuat..." : "Analisis Panduan Anda!"}
              </button>
            </div>

            {/* Error Messages */}
            {authError && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
                {authError}
              </div>
            )}
            {apiError && (
              <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-6">
                {apiError}
              </div>
            )}

            {/* Filter Section */}
            <div className="bg-white rounded-lg shadow-md p-4 mb-8">
              <h2 className="font-semibold text-lg mb-3">Filter Panduan</h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Kategori
                  </label>
                  <select
                    value={filters.category}
                    onChange={(e) => setFilters({...filters, category: e.target.value})}
                    className="w-full border rounded px-3 py-2 text-sm"
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Urutkan Berdasarkan
                  </label>
                  <select
                    value={filters.sort_by}
                    onChange={(e) => setFilters({...filters, sort_by: e.target.value})}
                    className="w-full border rounded px-3 py-2 text-sm"
                    disabled={loading.filters}
                  >
                    <option value="priority">Prioritas</option>
                    <option value="created_at">Tanggal Dibuat</option>
                    <option value="title">Judul</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Urutan
                  </label>
                  <select
                    value={filters.sort_order}
                    onChange={(e) => setFilters({...filters, sort_order: e.target.value})}
                    className="w-full border rounded px-3 py-2 text-sm"
                    disabled={loading.filters}
                  >
                    <option value="asc">A-Z / Terkecil</option>
                    <option value="desc">Z-A / Terbesar</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Jumlah Tampil
                  </label>
                  <select
                    value={filters.limit}
                    onChange={(e) => setFilters({...filters, limit: Number(e.target.value)})}
                    className="w-full border rounded px-3 py-2 text-sm"
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
                    className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                  >
                    <div className="relative h-48">
                      {guide.image_url ? (
                        <Image
                          src={guide.image_url}
                          alt={guide.title}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                          <span className="text-gray-500">No Image</span>
                        </div>
                      )}
                      {guide.is_mandatory && (
                        <div className="absolute top-2 right-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded">
                          WAJIB
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-bold text-lg">{guide.title}</h3>
                        <span className={`text-xs px-2 py-1 rounded ${getCategoryColor(guide.category)}`}>
                          {guide.category === "safety" ? "Keselamatan" : 
                           guide.category === "navigation" ? "Navigasi" : 
                           guide.category === "emergency" ? "Darurat" : "Umum"}
                        </span>
                      </div>
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                        {guide.description}
                      </p>
                      
                      {/* Conditions */}
                      <div className="mb-3">
                        <h4 className="text-xs font-semibold text-gray-500 mb-1">KONDISI BERLAKU:</h4>
                        <div className="space-y-1">
                          {Object.entries(guide.conditions)
                            .filter(([_, value]) => value.length > 0)
                            .map(([key, values]) => (
                              <div key={key} className="flex items-start">
                                <span className="text-xs font-medium text-gray-700 mr-1">
                                  {key.replace('_', ' ')}:
                                </span>
                                <div className="flex flex-wrap gap-1">
                                  {(values as string[]).map((value) => (
                                    <span key={value} className="text-xs bg-gray-100 text-gray-800 px-1 py-0.5 rounded">
                                      {translateCondition(value)}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            ))}
                        </div>
                      </div>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-1 mb-3">
                        {guide.tags.map((tag) => (
                          <span
                            key={tag}
                            className="text-xs bg-gray-100 text-gray-800 px-2 py-0.5 rounded"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                      
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-500">
                          {guide.estimated_time_minutes} menit
                        </span>
                        {guide.video_url && (
                          <a
                            href={guide.video_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline flex items-center"
                          >
                            Lihat Video
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Empty State */}
            {!loading.guides && guides.length === 0 && (
              <div className="bg-white rounded-xl shadow-md p-8 text-center">
                <p className="text-gray-500">Tidak ada panduan yang ditemukan</p>
                <button
                  onClick={() => setFilters({
                    category: "",
                    is_active: true,
                    sort_by: "priority",
                    sort_order: "asc",
                    limit: 10
                  })}
                  className="mt-4 text-blue-600 hover:underline"
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