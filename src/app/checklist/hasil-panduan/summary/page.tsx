"use client";

import { useState, useEffect, Suspense } from "react";
import LayoutNavbar from "@/components/LayoutNavbar";
import Footer from "@/components/Footer";
import Image from "next/image";
import { useSearchParams, useRouter } from 'next/navigation';
import { Check, ChevronLeft, PlayCircle, AlertTriangle, Info, X } from 'lucide-react';
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
      <div className={`w-full h-full flex items-center justify-center bg-gray-100 rounded-lg ${className}`}>
        <Info className="w-8 h-8 text-gray-400" />
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#f0f7f9] to-white px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex flex-col items-center justify-center gap-4 py-20">
            <div className="w-10 h-10 border-4 border-[#2C5B6B] border-t-transparent rounded-full animate-spin"></div>
            <p className="text-lg text-[#2C5B6B]">Memuat rangkuman perjalanan...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#f0f7f9] to-white px-4 py-16">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <h3 className="text-red-800 font-medium">{error}</h3>
            </div>
          </div>
          <button
            onClick={() => router.push('/checklist')}
            className="bg-[#2C5B6B] text-white px-6 py-2 rounded-lg hover:bg-[#1e4755] transition-colors shadow-sm flex items-center gap-2"
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
    <div className="min-h-screen pt-20 pb-12 bg-gradient-to-b from-[#f0f7f9] to-white">
      {selectedVideo && (
        <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
          <div className="relative w-full max-w-4xl">
            <button
              onClick={() => setSelectedVideo(null)}
              className="absolute -top-10 right-0 text-white hover:text-gray-300 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
            <div className="aspect-w-16 aspect-h-9 w-full">
              {convertToEmbedUrl(selectedVideo) ? (
                <iframe
                  src={convertToEmbedUrl(selectedVideo) || ''}
                  className="w-full h-full rounded-lg shadow-xl"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-800 text-white rounded-lg">
                  <p>URL video tidak valid</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header Section */}
        <div className="text-center pt-6 pb-2">
          <h1 className="text-3xl font-bold text-[#2C5B6B] mb-3">
            Selamat! Persiapan Perjalanan Anda Lengkap
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Berikut rangkuman panduan penting untuk perjalanan Anda yang aman dan nyaman
          </p>
        </div>

        {/* Trip Information Card */}
        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-6 rounded-2xl border border-blue-100 shadow-sm">
          <div className="flex items-center gap-3 mb-5">
            <div className="p-2 bg-blue-100 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-[#2C5B6B]">Informasi Perjalanan</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="mt-1">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Tujuan Perjalanan</p>
                  <p className="text-gray-800 font-medium">{summary.trip_info.trip_purpose}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="mt-1">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Durasi</p>
                  <p className="text-gray-800 font-medium">{summary.trip_info.duration_minutes} menit</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="mt-1">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Jumlah Penumpang</p>
                  <p className="text-gray-800 font-medium">{summary.trip_info.passenger_count} orang</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="mt-1">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Jenis Kapal</p>
                  <p className="text-gray-800 font-medium">{summary.trip_info.boat_type}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="mt-1">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Kondisi Cuaca</p>
                  <p className="text-gray-800 font-medium">{summary.trip_info.weather_condition}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="mt-1">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Jarak Tempuh</p>
                  <p className="text-gray-800 font-medium">{summary.trip_info.distance_km} km</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Card */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-2xl border border-green-100 shadow-sm">
          <div className="flex items-center gap-3 mb-5">
            <div className="p-2 bg-green-100 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-[#2C5B6B]">Progress Pengecekan</h2>
          </div>
          
          <div className="flex flex-col md:flex-row items-center gap-6">
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
                <span className="text-xl font-bold text-[#2C5B6B]">
                  {summary.summary.progress.completion_percentage}%
                </span>
              </div>
            </div>
            
            <div className="space-y-3 flex-1">
              <div className="flex items-start gap-3">
                <div className={`mt-1 w-3 h-3 rounded-full ${
                  summary.summary.progress.completed_items === summary.summary.progress.total_items 
                    ? 'bg-green-500' 
                    : 'bg-amber-500'
                }`}></div>
                <div>
                  <p className="text-gray-700 font-medium">
                    {summary.summary.progress.completed_items} dari {summary.summary.progress.total_items} item selesai
                  </p>
                  <p className="text-sm text-gray-500">
                    {summary.summary.progress.completed_items === summary.summary.progress.total_items 
                      ? "Semua item telah diselesaikan" 
                      : "Beberapa item belum diselesaikan"}
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className={`mt-1 w-3 h-3 rounded-full ${
                  summary.summary.progress.mandatory_completed 
                    ? 'bg-green-500' 
                    : 'bg-red-500'
                }`}></div>
                <div>
                  <p className="text-gray-700 font-medium">
                    {summary.summary.progress.mandatory_completed 
                      ? "Semua item wajib selesai" 
                      : "Item wajib belum lengkap"}
                  </p>
                  <p className="text-sm text-gray-500">
                    {summary.summary.progress.mandatory_completed 
                      ? "Anda telah menyelesaikan semua persyaratan wajib" 
                      : "Harap selesaikan semua item wajib sebelum berangkat"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Guides Section */}
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-[#2C5B6B]">Panduan yang Telah Diselesaikan</h2>
          </div>
          
          <div className="space-y-6">
          {summary.items?.map((guide) => (
            <div 
              key={guide.id} 
              className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col md:flex-row gap-6">
                <div className="relative w-full md:w-1/3 aspect-video rounded-lg overflow-hidden bg-gray-100">
                  {guide.video_url ? (
                    <>
                      <ImageWrapper 
                        src={guide.image_url} 
                        alt={guide.title}
                        className="object-cover"
                      />
                      <button
                        onClick={() => guide.video_url && setSelectedVideo(guide.video_url)}
                        className="absolute inset-0 flex items-center justify-center"
                      >
                        <PlayCircle className="w-12 h-12 text-white bg-[#2C5B6B] rounded-full p-2 bg-opacity-80 hover:bg-opacity-100 transition" />
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
                
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-xl font-bold text-[#2C5B6B]">
                      {guide.title}
                    </h3>
                    {guide.is_completed && (
                      <span className="flex items-center gap-1 text-sm bg-green-100 text-green-800 px-2 py-1 rounded-full">
                        <Check className="w-4 h-4" /> Selesai
                      </span>
                    )}
                  </div>
                  
                  <p className="text-gray-600 mt-3">
                    {guide.description}
                  </p>
                  
                  <div className="mt-6">
                    <button 
                      onClick={() => guide.video_url && setSelectedVideo(guide.video_url)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                        guide.video_url 
                          ? 'bg-[#2C5B6B] text-white hover:bg-[#1e4755]' 
                          : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      }`}
                      disabled={!guide.video_url}
                    >
                      <PlayCircle className="w-5 h-5" />
                      Lihat Tutorial
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        </div>

        {/* Completion Button */}
        <div className="flex justify-center pt-8">
          <button
            onClick={handleCompleteSession}
            disabled={isCompleting}
            className="bg-gradient-to-r from-[#2C5B6B] to-[#1e4755] text-white px-8 py-3 rounded-lg hover:opacity-90 transition-all shadow-md flex items-center gap-2 disabled:opacity-70"
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
  );
}

export default function SummaryPage() {
  return (
    <>
      <LayoutNavbar>
        <Suspense fallback={
          <div className="min-h-screen bg-gradient-to-b from-[#f0f7f9] to-white px-4 py-16">
            <div className="max-w-4xl mx-auto text-center">
              <div className="flex flex-col items-center justify-center gap-4 py-20">
                <div className="w-10 h-10 border-4 border-[#2C5B6B] border-t-transparent rounded-full animate-spin"></div>
                <p className="text-lg text-[#2C5B6B]">Memuat halaman...</p>
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