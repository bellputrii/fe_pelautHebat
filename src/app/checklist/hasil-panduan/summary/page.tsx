"use client";

import { useState, useEffect, Suspense } from "react";
import LayoutNavbar from "@/components/LayoutNavbar";
import Footer from "@/components/Footer";
import Image from "next/image";
import { useSearchParams, useRouter } from 'next/navigation';
import { Check, ChevronLeft, PlayCircle, AlertTriangle, Info, X, MapPin, Clock, Users, Navigation, Waves, Calendar, Cloud, Route, Shield, FileText } from 'lucide-react';
import { auth } from "@/firebase/config";
import { useTokenRefresh } from "@/app/hooks/useAuth";
import { authFetch } from "@/app/lib/api";

type Guide = {
  id: string;
  title: string;
  description: string;
  image_url: string | null;
  video_url: string | null;
  is_completed: boolean;
};

type TripInfo = {
  trip_purpose: string;
  duration_minutes: number;
  passenger_count: number;
  boat_type: string;
  weather_condition: string;
  distance_km: number;
  departure_location: string;
  destination_location: string;
  planned_departure_time: string;
  urgency_level: string;
};

type Progress = {
  total_items: number;
  completed_items: number;
  completion_percentage: number;
  mandatory_completed: boolean;
};

type SummaryData = {
  session_id: string;
  trip_info: TripInfo;
  summary: {
    trip_info: TripInfo;
    progress: Progress;
    status: string;
    duration_spent: number;
    created_at: string;
    completed_at: string | null;
  };
  items: Guide[];
};

function ImageWrapper({ src, alt, className = "" }: { src: string | null, alt: string, className?: string }) {
  if (!src) {
    return (
      <div className={`w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded-lg ${className}`}>
        <FileText className="w-8 h-8 text-gray-400 dark:text-gray-500" />
      </div>
    );
  }

  try {
    const url = new URL(src);
    const allowedHosts = ['your-allowed-domain.com', 'localhost'];
    const isAllowed = allowedHosts.some(host => url.hostname.includes(host));
    
    return isAllowed ? (
      <Image
        src={src}
        alt={alt}
        fill
        className={`object-cover ${className}`}
      />
    ) : (
      <img 
        src={src} 
        alt={alt}
        className={`object-cover w-full h-full ${className}`}
      />
    );
  } catch {
    return (
      <img 
        src={src} 
        alt={alt}
        className={`object-cover w-full h-full ${className}`}
      />
    );
  }
}

function SummaryContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('sessionId');
  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const [isCompleting, setIsCompleting] = useState(false);

  useTokenRefresh();

  useEffect(() => {
    if (!sessionId) {
      setError("Session ID tidak valid");
      setIsLoading(false);
      return;
    }

    const fetchSummary = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await authFetch(
          `${process.env.NEXT_PUBLIC_API_URL}/guide/session/${sessionId}/summary`
        );

        if (!response.ok) {
          if (response.status === 401) {
            setError('Sesi Anda telah habis, silakan login kembali');
            return;
          }
          const errorData = await response.json();
          throw new Error(errorData.message || "Gagal memuat rangkuman");
        }

        const result = await response.json();
        setSummary(result.data);
      } catch (err) {
        console.error("Error fetching summary:", err);
        setError(err instanceof Error ? err.message : "Terjadi kesalahan");
      } finally {
        setIsLoading(false);
      }
    };

    fetchSummary();
  }, [sessionId]);

  const handleCompleteSession = async () => {
    if (!sessionId) return;

    try {
      setIsCompleting(true);
      
      const completeResponse = await authFetch(
        `${process.env.NEXT_PUBLIC_API_URL}/guide/session/${sessionId}/complete`,
        {
          method: 'POST'
        }
      );

      if (!completeResponse.ok) {
        throw new Error("Gagal menyelesaikan sesi");
      }

      router.push('/checklist');
    } catch (err) {
      console.error("Error completing session:", err);
      setError(err instanceof Error ? err.message : "Gagal menyelesaikan sesi");
    } finally {
      setIsCompleting(false);
    }
  };

  const convertToEmbedUrl = (url: string | null): string | null => {
    if (!url) return null;
    
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      const regExp = /^(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
      const match = url.match(regExp);
      
      if (match && match[1]) {
        return `https://www.youtube.com/embed/${match[1]}?autoplay=1&rel=0`;
      }
    }
    
    return url;
  };

  const getTripPurposeLabel = (purpose: string) => {
    const purposes: Record<string, string> = {
      'fishing': 'Memancing',
      'transport': 'Pengiriman Barang',
      'recreation': 'Wisata & Rekreasi',
      'emergency': 'Situasi Darurat'
    };
    return purposes[purpose] || purpose;
  };

  const getBoatTypeLabel = (boatType: string) => {
    const boatTypes: Record<string, string> = {
      'perahu_kecil': 'Perahu Motor Kecil',
      'kapal_nelayan': 'Kapal Layar / Nelayan',
      'kapal_besar': 'Kapal Besar'
    };
    return boatTypes[boatType] || boatType;
  };

  const getWeatherLabel = (weather: string) => {
    const weatherTypes: Record<string, string> = {
      'calm': 'Tenang (gelombang kecil)',
      'moderate': 'Sedang (gelombang sedang)',
      'rough': 'Buruk (gelombang besar)'
    };
    return weatherTypes[weather] || weather;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 px-4 py-16">
        <div className="max-w-6xl mx-auto text-center">
          <div className="flex flex-col items-center justify-center gap-4 py-20">
            <div className="w-12 h-12 border-4 border-[#2C5B6B] border-t-transparent rounded-full animate-spin"></div>
            <p className="text-lg text-[#2C5B6B] dark:text-white">Memuat rangkuman perjalanan...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 px-4 py-16">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4 rounded-r-lg">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
              <h3 className="text-red-800 dark:text-red-200 font-medium">{error}</h3>
            </div>
          </div>
          <button
            onClick={() => router.push('/checklist')}
            className="bg-[#2C5B6B] text-white px-6 py-3 rounded-lg hover:bg-[#1e4755] transition-colors shadow-sm flex items-center gap-2"
          >
            <ChevronLeft className="w-5 h-5" />
            Kembali ke Checklist
          </button>
        </div>
      </div>
    );
  }

  if (!summary) {
    return null;
  }

  return (
    <div className="min-h-screen pt-20 pb-12 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      {selectedVideo && (
        <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
          <div className="relative w-full max-w-4xl">
            <button
              onClick={() => setSelectedVideo(null)}
              className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors z-10"
            >
              <X className="w-6 h-6" />
            </button>
            <div className="aspect-w-16 aspect-h-9 w-full">
              {convertToEmbedUrl(selectedVideo) ? (
                <iframe
                  src={convertToEmbedUrl(selectedVideo) || ''}
                  className="w-full h-64 sm:h-80 md:h-96 lg:h-[500px] rounded-lg shadow-xl"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              ) : (
                <div className="w-full h-64 sm:h-80 md:h-96 lg:h-[500px] flex items-center justify-center bg-gray-800 text-white rounded-lg">
                  <p>URL video tidak valid</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 md:space-y-8">
        {/* Header Section */}
        <div className="text-center pt-6 pb-2">
          <div className="inline-flex items-center justify-center bg-green-100 dark:bg-green-900/30 p-3 rounded-full mb-4">
            <Shield className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-3">
            Persiapan Perjalanan Anda Lengkap!
          </h1>
          <p className="text-base text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Semua panduan keselamatan telah disiapkan untuk perjalanan Anda yang aman dan nyaman
          </p>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
          {/* Left Column - Trip Info & Progress */}
          <div className="lg:col-span-1 space-y-6">
            {/* Trip Information Card */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <Navigation className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Informasi Perjalanan</h2>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-blue-500 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Rute Perjalanan</p>
                    <p className="text-gray-900 dark:text-white font-medium">
                      {summary.trip_info.departure_location} → {summary.trip_info.destination_location}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Waves className="w-5 h-5 text-blue-500 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Tujuan</p>
                    <p className="text-gray-900 dark:text-white font-medium">
                      {getTripPurposeLabel(summary.trip_info.trip_purpose)}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-blue-500 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Waktu Keberangkatan</p>
                    <p className="text-gray-900 dark:text-white font-medium">
                      {new Date(summary.trip_info.planned_departure_time).toLocaleString('id-ID')}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      Durasi
                    </p>
                    <p className="text-gray-900 dark:text-white font-medium">
                      {summary.trip_info.duration_minutes} menit
                    </p>
                  </div>
                  
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      Penumpang
                    </p>
                    <p className="text-gray-900 dark:text-white font-medium">
                      {summary.trip_info.passenger_count} orang
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center gap-1">
                      <Waves className="w-4 h-4" />
                      Jenis Kapal
                    </p>
                    <p className="text-gray-900 dark:text-white font-medium">
                      {getBoatTypeLabel(summary.trip_info.boat_type)}
                    </p>
                  </div>
                  
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center gap-1">
                      <Route className="w-4 h-4" />
                      Jarak
                    </p>
                    <p className="text-gray-900 dark:text-white font-medium">
                      {summary.trip_info.distance_km} km
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Cloud className="w-5 h-5 text-blue-500 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Kondisi Cuaca</p>
                    <p className="text-gray-900 dark:text-white font-medium">
                      {getWeatherLabel(summary.trip_info.weather_condition)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Progress Card */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <Check className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Progress Pengecekan</h2>
              </div>
              
              <div className="flex flex-col items-center gap-6">
                <div className="relative w-32 h-32">
                  <svg className="w-full h-full" viewBox="0 0 36 36">
                    <path
                      d="M18 2.0845
                        a 15.9155 15.9155 0 0 1 0 31.831
                        a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="#e6e6e6"
                      strokeWidth="3"
                    />
                    <path
                      d="M18 2.0845
                        a 15.9155 15.9155 0 0 1 0 31.831
                        a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="#2C5B6B"
                      strokeWidth="3"
                      strokeDasharray={`${summary.summary.progress.completion_percentage}, 100`}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl font-bold text-[#2C5B6B] dark:text-white">
                      {summary.summary.progress.completion_percentage}%
                    </span>
                  </div>
                </div>
                
                <div className="space-y-4 w-full">
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Item Diselesaikan</span>
                    <span className="text-lg font-bold text-[#2C5B6B] dark:text-white">
                      {summary.summary.progress.completed_items}/{summary.summary.progress.total_items}
                    </span>
                  </div>
                  
                  <div className={`flex items-center gap-3 p-3 rounded-lg ${
                    summary.summary.progress.mandatory_completed 
                      ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' 
                      : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
                  }`}>
                    <div className={`w-3 h-3 rounded-full ${
                      summary.summary.progress.mandatory_completed ? 'bg-green-500' : 'bg-red-500'
                    }`}></div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {summary.summary.progress.mandatory_completed 
                          ? "Semua item wajib selesai" 
                          : "Item wajib belum lengkap"}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {summary.summary.progress.mandatory_completed 
                          ? "Siap untuk berangkat!" 
                          : "Harap selesaikan item wajib"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Guides List */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                  <FileText className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Panduan yang Telah Diselesaikan</h2>
              </div>
              
              <div className="space-y-6">
                {summary.items?.map((guide) => (
                  <div 
                    key={guide.id} 
                    className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 border border-gray-200 dark:border-gray-600 hover:shadow-md transition-all"
                  >
                    <div className="flex flex-col md:flex-row gap-4">
                      <div className="relative w-full md:w-48 h-32 rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-600 flex-shrink-0">
                        {guide.video_url ? (
                          <>
                            <ImageWrapper 
                              src={guide.image_url} 
                              alt={guide.title}
                              className="object-cover"
                            />
                            <button
                              onClick={() => guide.video_url && setSelectedVideo(guide.video_url)}
                              className="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/30 transition-colors"
                            >
                              <PlayCircle className="w-10 h-10 text-white bg-[#2C5B6B] rounded-full p-2 bg-opacity-80 hover:bg-opacity-100 transition" />
                            </button>
                          </>
                        ) : (
                          <ImageWrapper 
                            src={guide.image_url} 
                            alt={guide.title}
                            className="object-cover"
                          />
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-3">
                          <h3 className="text-lg font-bold text-gray-900 dark:text-white line-clamp-2">
                            {guide.title}
                          </h3>
                          {guide.is_completed && (
                            <span className="flex items-center gap-1 text-sm bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 px-3 py-1 rounded-full flex-shrink-0">
                              <Check className="w-4 h-4" /> Selesai
                            </span>
                          )}
                        </div>
                        
                        <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-4">
                          {guide.description}
                        </p>
                        
                        <div className="flex items-center gap-3">
                          <button 
                            onClick={() => guide.video_url && setSelectedVideo(guide.video_url)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                              guide.video_url 
                                ? 'bg-[#2C5B6B] text-white hover:bg-[#1e4755] shadow-sm' 
                                : 'bg-gray-200 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                            }`}
                            disabled={!guide.video_url}
                          >
                            <PlayCircle className="w-4 h-4" />
                            Lihat Tutorial
                          </button>
                          
                          {!guide.is_completed && (
                            <span className="text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-2 py-1 rounded">
                              Belum diselesaikan
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Completion Button */}
              <div className="flex justify-center pt-8 mt-6 border-t border-gray-200 dark:border-gray-600">
                <button
                  onClick={handleCompleteSession}
                  disabled={isCompleting}
                  className="bg-gradient-to-r from-[#2C5B6B] to-[#1e4755] text-white px-8 py-3 rounded-lg hover:opacity-90 transition-all shadow-md flex items-center gap-2 disabled:opacity-70 font-medium"
                >
                  {isCompleting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Menyelesaikan...
                    </>
                  ) : (
                    <>
                      <Check className="w-5 h-5" />
                      Selesaikan dan Kembali ke Menu Utama
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SummaryPage() {
  return (
    <>
      <LayoutNavbar>
        <Suspense fallback={
          <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 px-4 py-16">
            <div className="max-w-6xl mx-auto text-center">
              <div className="flex flex-col items-center justify-center gap-4 py-20">
                <div className="w-12 h-12 border-4 border-[#2C5B6B] border-t-transparent rounded-full animate-spin"></div>
                <p className="text-lg text-[#2C5B6B] dark:text-white">Memuat halaman...</p>
              </div>
            </div>
          </div>
        }>
          <SummaryContent />
        </Suspense>
      </LayoutNavbar>
      <Footer />
    </>
  );
}