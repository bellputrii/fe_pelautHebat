"use client";

import { useState, useEffect, Suspense, JSX } from "react";
import LayoutNavbar from "@/components/LayoutNavbar";
import Footer from "@/components/Footer";
import Image from "next/image";
import { useSearchParams, useRouter } from 'next/navigation';
import { Check, ChevronLeft, PlayCircle, AlertTriangle, Info, X, MapPin, Clock, Users, Navigation, Waves, Calendar, Cloud, Route, Shield, FileText, Target, Ship, Gauge, Package, Palmtree, Loader2 } from 'lucide-react';
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
  category: string;
  priority: number;
  estimated_time_minutes: number;
  is_mandatory: boolean;
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
  mandatory_items: number;
  completed_mandatory: number;
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

  // Enhanced Trip Information Card matching the checklist page structure
  const TripInfoCard = () => {
    if (!summary?.trip_info) return null;

    const tripPurposeMap: Record<string, { label: string, icon: JSX.Element, color: string }> = {
      fishing: { 
        label: "Memancing", 
        icon: <Navigation className="w-4 h-4" />,
        color: "from-blue-500 to-blue-600"
      },
      transport: { 
        label: "Pengiriman Barang", 
        icon: <Package className="w-4 h-4" />,
        color: "from-green-500 to-green-600"
      },
      recreation: { 
        label: "Wisata & Rekreasi", 
        icon: <PalmTree className="w-4 h-4" />,
        color: "from-purple-500 to-purple-600"
      },
      emergency: { 
        label: "Situasi Darurat", 
        icon: <AlertTriangle className="w-4 h-4" />,
        color: "from-red-500 to-red-600"
      }
    };
    
    const boatTypeMap: Record<string, string> = {
      perahu_kecil: "Perahu Motor Kecil",
      kapal_nelayan: "Kapal Nelayan / Layar",
      kapal_besar: "Kapal Besar"
    };
    
    const weatherMap: Record<string, { label: string, color: string }> = {
      calm: { label: "Tenang", color: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300" },
      moderate: { label: "Sedang", color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300" },
      rough: { label: "Buruk", color: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300" }
    };
    
    const urgencyMap: Record<string, { label: string, color: string }> = {
      normal: { label: "Normal", color: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300" },
      urgent: { label: "Penting", color: "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300" },
      critical: { label: "Kritis", color: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300" }
    };

    const durationHours = Math.floor(summary.trip_info.duration_minutes / 60);
    const durationMinutes = summary.trip_info.duration_minutes % 60;
    const durationText = durationHours > 0 
      ? `${durationHours} jam ${durationMinutes} menit` 
      : `${durationMinutes} menit`;

    const tripPurpose = tripPurposeMap[summary.trip_info.trip_purpose] || { 
      label: summary.trip_info.trip_purpose, 
      icon: <Navigation className="w-4 h-4" />,
      color: "from-gray-500 to-gray-600"
    };

    const formatDateTime = (dateString: string) => {
      const date = new Date(dateString);
      return date.toLocaleDateString('id-ID', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    };

    const infoItems = [
      {
        icon: <Target className="w-4 h-4" />,
        label: "Tujuan Perjalanan",
        value: tripPurpose.label,
        badge: (
          <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${tripPurpose.color} text-white`}>
            {tripPurpose.icon}
            {tripPurpose.label}
          </span>
        )
      },
      {
        icon: <Clock className="w-4 h-4" />,
        label: "Durasi Perjalanan",
        value: durationText,
        description: "Perjalanan pulang pergi"
      },
      {
        icon: <Users className="w-4 h-4" />,
        label: "Jumlah Penumpang",
        value: `${summary.trip_info.passenger_count} orang`
      },
      {
        icon: <Ship className="w-4 h-4" />,
        label: "Jenis Kapal",
        value: boatTypeMap[summary.trip_info.boat_type] || summary.trip_info.boat_type
      },
      {
        icon: <Route className="w-4 h-4" />,
        label: "Jarak Tempuh",
        value: `${summary.trip_info.distance_km} km`
      },
      {
        icon: <Cloud className="w-4 h-4" />,
        label: "Kondisi Cuaca",
        value: weatherMap[summary.trip_info.weather_condition]?.label || summary.trip_info.weather_condition,
        badge: (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${weatherMap[summary.trip_info.weather_condition]?.color || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'}`}>
            {weatherMap[summary.trip_info.weather_condition]?.label || summary.trip_info.weather_condition}
          </span>
        )
      },
      {
        icon: <Gauge className="w-4 h-4" />,
        label: "Tingkat Urgensi",
        value: urgencyMap[summary.trip_info.urgency_level]?.label || summary.trip_info.urgency_level,
        badge: (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${urgencyMap[summary.trip_info.urgency_level]?.color || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'}`}>
            {urgencyMap[summary.trip_info.urgency_level]?.label || summary.trip_info.urgency_level}
          </span>
        )
      },
      {
        icon: <Calendar className="w-4 h-4" />,
        label: "Waktu Keberangkatan",
        value: formatDateTime(summary.trip_info.planned_departure_time)
      }
    ];

    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#053040] to-[#2C5B6B] px-6 py-4 text-white">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
              <Ship className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Informasi Perjalanan</h2>
              <p className="text-blue-100 text-sm">Detail rencana pelayaran Anda</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Route Information */}
          <div className="flex items-center justify-between mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
            <div className="flex items-center gap-3 flex-1">
              <div className="flex flex-col items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <div className="w-0.5 h-8 bg-gray-300 my-1"></div>
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="w-4 h-4 text-green-600" />
                  <span className="font-semibold text-gray-900 dark:text-white">Keberangkatan</span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300 ml-6">{summary.trip_info.departure_location}</p>
                
                <div className="flex items-center gap-2 mt-3">
                  <MapPin className="w-4 h-4 text-red-600" />
                  <span className="font-semibold text-gray-900 dark:text-white">Tujuan</span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300 ml-6">{summary.trip_info.destination_location}</p>
              </div>
            </div>
          </div>

          {/* Grid Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {infoItems.map((item, index) => (
              <div key={index} className="flex items-start gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg transition-colors">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                  {item.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {item.label}
                    </span>
                    {item.badge}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {item.value}
                  </p>
                  {item.description && (
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                      {item.description}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // Custom icons
  const Package = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
    </svg>
  );

  const PalmTree = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800 px-4 py-16">
        <div className="max-w-6xl mx-auto text-center">
          <div className="flex flex-col items-center justify-center gap-4 py-20">
            <Loader2 className="w-10 h-10 text-blue-600 dark:text-blue-400 animate-spin" />
            <p className="text-lg text-blue-800 dark:text-blue-200">Memuat rangkuman perjalanan...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800 px-4 py-16">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4 rounded-r">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
              <h3 className="text-red-800 dark:text-red-200 font-medium">{error}</h3>
            </div>
          </div>
          <button
            onClick={() => router.push('/checklist')}
            className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 text-white px-6 py-2 rounded-lg transition-colors shadow-sm flex items-center gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
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
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800 px-4 py-8">
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

      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center mb-8 mt-12">
          <div className="inline-flex items-center justify-center bg-green-100 dark:bg-green-900/30 p-3 rounded-full mb-4">
            <Shield className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-blue-900 dark:text-white mb-3">
            Persiapan Perjalanan Anda Lengkap!
          </h1>
          <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto text-lg">
            Semua panduan keselamatan telah disiapkan untuk perjalanan Anda yang aman dan nyaman
          </p>
        </div>

        {/* Trip Information Card */}
        <TripInfoCard />

        {/* Progress Section */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-blue-900 dark:text-white mb-6 flex items-center gap-2">
            <div className="w-2 h-6 bg-gradient-to-b from-blue-500 to-blue-700 rounded-full"></div>
            Progress Penyelesaian
          </h2>
          
          <div className="space-y-6">
            {/* Main Progress Bar */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-gray-900 dark:text-white text-lg">
                  {summary.summary.progress.completion_percentage}% Selesai
                </span>
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {summary.summary.progress.completed_items}/{summary.summary.progress.total_items} item
                </span>
              </div>
              
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-blue-700 h-4 rounded-full transition-all duration-500 ease-out shadow-inner" 
                  style={{ width: `${summary.summary.progress.completion_percentage}%` }}
                ></div>
              </div>
            </div>
            
            {/* Mandatory Items Status */}
            {summary.summary.progress.mandatory_items > 0 && (
              <div className={`p-4 rounded-xl border-2 transition-all ${
                summary.summary.progress.completed_mandatory < summary.summary.progress.mandatory_items 
                  ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800' 
                  : 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
              }`}>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${
                      summary.summary.progress.completed_mandatory < summary.summary.progress.mandatory_items 
                        ? 'bg-red-100 dark:bg-red-800 text-red-600 dark:text-red-300' 
                        : 'bg-green-100 dark:bg-green-800 text-green-600 dark:text-green-300'
                    }`}>
                      {summary.summary.progress.completed_mandatory < summary.summary.progress.mandatory_items ? (
                        <AlertTriangle className="w-5 h-5" />
                      ) : (
                        <Check className="w-5 h-5" />
                      )}
                    </div>
                    <div>
                      <span className="font-semibold text-gray-900 dark:text-white block">
                        Item Wajib
                      </span>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Persyaratan keselamatan utama
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      summary.summary.progress.completed_mandatory < summary.summary.progress.mandatory_items 
                        ? 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-200' 
                        : 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-200'
                    }`}>
                      {summary.summary.progress.completed_mandatory}/{summary.summary.progress.mandatory_items}
                    </span>
                    {summary.summary.progress.completed_mandatory < summary.summary.progress.mandatory_items ? (
                      <span className="text-red-600 dark:text-red-400 font-medium flex items-center gap-1 text-sm">
                        <AlertTriangle className="w-4 h-4" />
                        Perlu dilengkapi!
                      </span>
                    ) : (
                      <span className="text-green-600 dark:text-green-400 font-medium flex items-center gap-1 text-sm">
                        <Check className="w-4 h-4" />
                        Semua selesai
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Guides Section */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-blue-900 dark:text-white mb-2 flex items-center gap-2">
            <div className="w-2 h-6 bg-gradient-to-b from-blue-500 to-blue-700 rounded-full"></div>
            Panduan yang Telah Diselesaikan
          </h2>
          
          {summary.items?.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 text-center border border-gray-200 dark:border-gray-700">
              <div className="flex flex-col items-center justify-center gap-3 text-gray-500 dark:text-gray-400">
                <Info className="w-12 h-12" />
                <p className="text-lg">Tidak ada panduan yang diselesaikan</p>
                <p className="text-sm">Semua persiapan sudah tercakup dalam informasi perjalanan</p>
              </div>
            </div>
          ) : (
            <div className="grid gap-4">
              {summary.items?.map((guide) => (
                <div
                  key={guide.id}
                  className={`bg-white dark:bg-gray-800 rounded-xl shadow-md p-5 border-l-4 transition-all duration-300 hover:shadow-lg ${
                    guide.is_mandatory 
                      ? 'border-red-500 dark:border-red-400' 
                      : 'border-blue-400 dark:border-blue-500'
                  } ${guide.is_completed ? 'opacity-80' : ''}`}
                >
                  <div className="flex flex-col sm:flex-row gap-4">
                    {/* Image */}
                    <div className="relative w-full sm:w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-600">
                      {guide.video_url ? (
                        <>
                          <ImageWrapper 
                            src={guide.image_url} 
                            alt={guide.title}
                            className="object-cover"
                          />
                          <button
                            onClick={() => guide.video_url && setSelectedVideo(guide.video_url)}
                            className="absolute inset-0 flex items-center justify-center bg-black/10 hover:bg-black/20 transition-colors"
                          >
                            <PlayCircle className="w-8 h-8 text-white bg-[#2C5B6B] rounded-full p-1.5 bg-opacity-80 hover:bg-opacity-100 transition" />
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
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-3">
                        <div className="flex items-start gap-2">
                          <h3 className="font-bold text-gray-900 dark:text-white text-lg leading-tight">
                            {guide.title}
                          </h3>
                          {guide.is_mandatory && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 text-xs font-bold rounded-full flex-shrink-0 mt-0.5">
                              <AlertTriangle className="w-3 h-3" />
                              WAJIB
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-sm rounded-full font-medium flex-shrink-0">
                            {guide.category}
                          </span>
                          {guide.is_completed && (
                            <span className="flex items-center gap-1 text-sm bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 px-3 py-1 rounded-full flex-shrink-0">
                              <Check className="w-4 h-4" /> Selesai
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed mb-4">
                        {guide.description}
                      </p>
                      
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div className="flex flex-wrap gap-2">
                          <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm rounded-full">
                            <Clock className="w-3 h-3" />
                            {guide.estimated_time_minutes} menit
                          </span>
                          {guide.priority > 0 && (
                            <span className="inline-flex items-center gap-1 px-3 py-1 bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200 text-sm rounded-full">
                              Prioritas {guide.priority}
                            </span>
                          )}
                          {!guide.is_completed && (
                            <span className="text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-2 py-1 rounded">
                              Belum diselesaikan
                            </span>
                          )}
                        </div>
                        
                        <button 
                          onClick={() => guide.video_url && setSelectedVideo(guide.video_url)}
                          disabled={!guide.video_url}
                          className={`px-5 py-2.5 rounded-lg flex items-center gap-2 text-sm font-medium transition-all duration-200 min-w-[140px] justify-center ${
                            guide.video_url
                              ? "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-md" 
                              : "bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed shadow-sm"
                          }`}
                        >
                          <PlayCircle className="w-4 h-4" />
                          <span>Lihat Tutorial</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex flex-col-reverse sm:flex-row justify-between items-center gap-4 pt-8 pb-4">
          <button
            onClick={() => router.push(`/checklist/hasil-panduan?sessionId=${sessionId}`)}
            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium flex items-center gap-2 transition-colors px-4 py-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20"
          >
            <ChevronLeft className="w-4 h-4" />
            Kembali ke Checklist
          </button>
          
          <button 
            onClick={handleCompleteSession}
            disabled={isCompleting}
            className={`px-8 py-3 rounded-lg flex items-center gap-3 transition-all duration-200 font-semibold ${
              isCompleting
                ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed shadow-sm'
                : 'bg-gradient-to-r from-[#053040] to-[#2C5B6B] hover:from-[#2C5B6B] hover:to-[#3A6D7E] text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
            } disabled:transform-none`}
          >
            {isCompleting ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <Check className="w-5 h-5" />
                <span>Selesaikan dan Kembali ke Menu Utama</span>
              </>
            )}
          </button>
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
          <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800 px-4 py-16">
            <div className="max-w-6xl mx-auto text-center">
              <div className="flex flex-col items-center justify-center gap-4 py-20">
                <Loader2 className="w-10 h-10 text-blue-600 dark:text-blue-400 animate-spin" />
                <p className="text-lg text-blue-800 dark:text-blue-200">Memuat halaman...</p>
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