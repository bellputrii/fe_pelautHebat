"use client";

import { useState, useEffect, Suspense, JSX } from "react";
import LayoutNavbar from '@/components/LayoutNavbar';
import Footer from '@/components/Footer';
import Image from 'next/image';
import { useSearchParams, useRouter } from 'next/navigation';
import { Check, ChevronRight, Info, Loader2, AlertTriangle, MapPin, Clock, Users, Navigation, Cloud, Gauge, Route, Calendar, Ship, Target } from 'lucide-react';
import { auth } from "@/firebase/config";
import { useTokenRefresh } from '@/app/hooks/useAuth';
import { authFetch } from '@/app/lib/api';

type ChecklistItem = {
  id: string;
  title: string;
  description: string;
  image_url: string;
  category: string;
  priority: number;
  estimated_time_minutes: number;
  is_mandatory: boolean;
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

type ProgressData = {
  total_items: number;
  completed_items: number;
  mandatory_items: number;
  completed_mandatory: number;
  completion_percentage: number;
};

// Custom icons dengan support untuk className
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

function HasilPanduanContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('sessionId');
  
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const [tripInfo, setTripInfo] = useState<TripInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<ProgressData>({
    total_items: 0,
    completed_items: 0,
    mandatory_items: 0,
    completed_mandatory: 0,
    completion_percentage: 0
  });
  const [currentlyUpdating, setCurrentlyUpdating] = useState<string | null>(null);

  // Initialize token refresh mechanism
  useTokenRefresh();

  useEffect(() => {
    if (!sessionId) {
      setError("Session ID tidak valid");
      setIsLoading(false);
      return;
    }

    const fetchChecklist = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await authFetch(
          `${process.env.NEXT_PUBLIC_API_URL}/guide/session/${sessionId}/checklist`,
          {
            method: 'POST'
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Gagal memuat checklist");
        }

        const result = await response.json();
        
        setChecklist(result.data.checklist);
        setTripInfo(result.data.trip_info);
        setProgress(result.data.progress || {
          total_items: result.data.checklist.length,
          completed_items: result.data.checklist.filter((item: ChecklistItem) => item.is_completed).length,
          mandatory_items: result.data.checklist.filter((item: ChecklistItem) => item.is_mandatory).length,
          completed_mandatory: result.data.checklist.filter((item: ChecklistItem) => item.is_mandatory && item.is_completed).length,
          completion_percentage: Math.round(
            (result.data.checklist.filter((item: ChecklistItem) => item.is_completed).length / 
             result.data.checklist.length) * 100
          )
        });

      } catch (err) {
        console.error("Error fetching checklist:", err);
        setError(err instanceof Error ? err.message : "Terjadi kesalahan");
      } finally {
        setIsLoading(false);
      }
    };

    fetchChecklist();
  }, [sessionId]);

  const handleCheckItem = async (itemId: string, isCompleted: boolean) => {
    try {
      setCurrentlyUpdating(itemId);
      setError(null);

      const response = await authFetch(
        `${process.env.NEXT_PUBLIC_API_URL}/guide/session/${sessionId}/checklist/${itemId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ is_completed: isCompleted })
        }
      );
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Gagal mengupdate checklist");
      }

      // Update local state optimistically
      setChecklist(prev => prev.map(item => 
        item.id === itemId ? { ...item, is_completed: isCompleted } : item
      ));
      
      // Calculate new progress
      const updatedChecklist = checklist.map(item => 
        item.id === itemId ? { ...item, is_completed: isCompleted } : item
      );
      
      const newCompletedItems = updatedChecklist.filter(item => item.is_completed).length;
      const newCompletedMandatory = updatedChecklist.filter(item => item.is_mandatory && item.is_completed).length;
      
      setProgress({
        total_items: checklist.length,
        completed_items: newCompletedItems,
        mandatory_items: checklist.filter(item => item.is_mandatory).length,
        completed_mandatory: newCompletedMandatory,
        completion_percentage: Math.round((newCompletedItems / checklist.length) * 100)
      });

    } catch (err) {
      console.error("Error updating checklist item:", err);
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
      
      // Revert optimistic update
      setChecklist(prev => prev.map(item => 
        item.id === itemId ? { ...item, is_completed: !isCompleted } : item
      ));
    } finally {
      setCurrentlyUpdating(null);
    }
  };

  const handleNavigateToSummary = async () => {
    try {
      setIsLoading(true);
      
      // First complete the session
      const completeResponse = await authFetch(
        `${process.env.NEXT_PUBLIC_API_URL}/guide/session/${sessionId}/complete`,
        {
          method: 'POST'
        }
      );

      if (!completeResponse.ok) {
        throw new Error("Gagal menyelesaikan sesi");
      }

      // Then navigate to summary
      router.push(`/checklist/hasil-panduan/summary?sessionId=${sessionId}`);
      
    } catch (err) {
      console.error("Error completing session:", err);
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setIsLoading(false);
    }
  };

  // Enhanced trip information display
  const TripInfoCard = () => {
    if (!tripInfo) return null;

    const tripPurposeMap: Record<string, { label: string, icon: JSX.Element, color: string }> = {
      fishing: { 
        label: "Memancing", 
        icon: <Navigation className="w-4 h-4 text-white" />,
        color: "bg-blue-600"
      },
      transport: { 
        label: "Pengiriman Barang", 
        icon: <Package className="w-4 h-4 text-white" />,
        color: "bg-green-600"
      },
      recreation: { 
        label: "Wisata & Rekreasi", 
        icon: <PalmTree className="w-4 h-4 text-white" />,
        color: "bg-purple-600"
      },
      emergency: { 
        label: "Situasi Darurat", 
        icon: <AlertTriangle className="w-4 h-4 text-white" />,
        color: "bg-red-600"
      }
    };
    
    const boatTypeMap: Record<string, string> = {
      perahu_kecil: "Perahu Motor Kecil",
      kapal_nelayan: "Kapal Nelayan / Layar",
      kapal_besar: "Kapal Besar"
    };
    
    const weatherMap: Record<string, { label: string, color: string }> = {
      calm: { label: "Tenang", color: "bg-green-100 text-green-800" },
      moderate: { label: "Sedang", color: "bg-yellow-100 text-yellow-800" },
      rough: { label: "Buruk", color: "bg-red-100 text-red-800" }
    };
    
    const urgencyMap: Record<string, { label: string, color: string }> = {
      normal: { label: "Normal", color: "bg-gray-100 text-gray-800" },
      urgent: { label: "Penting", color: "bg-orange-100 text-orange-800" },
      critical: { label: "Kritis", color: "bg-red-100 text-red-800" }
    };

    const durationHours = Math.floor(tripInfo.duration_minutes / 60);
    const durationMinutes = tripInfo.duration_minutes % 60;
    const durationText = durationHours > 0 
      ? `${durationHours} jam ${durationMinutes} menit` 
      : `${durationMinutes} menit`;

    const tripPurpose = tripPurposeMap[tripInfo.trip_purpose] || { 
      label: tripInfo.trip_purpose, 
      icon: <Navigation className="w-4 h-4 text-white" />,
      color: "bg-gray-600"
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
        icon: <Target className="w-4 h-4 text-gray-700" />,
        label: "Tujuan Perjalanan",
        value: tripPurpose.label,
        badge: (
          <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${tripPurpose.color} text-white`}>
            {tripPurpose.icon}
            {tripPurpose.label}
          </span>
        )
      },
      {
        icon: <Clock className="w-4 h-4 text-gray-700" />,
        label: "Durasi Perjalanan",
        value: durationText,
        description: "Perjalanan pulang pergi"
      },
      {
        icon: <Users className="w-4 h-4 text-gray-700" />,
        label: "Jumlah Penumpang",
        value: `${tripInfo.passenger_count} orang`
      },
      {
        icon: <Ship className="w-4 h-4 text-gray-700" />,
        label: "Jenis Kapal",
        value: boatTypeMap[tripInfo.boat_type] || tripInfo.boat_type
      },
      {
        icon: <Route className="w-4 h-4 text-gray-700" />,
        label: "Jarak Tempuh",
        value: `${tripInfo.distance_km} km`
      },
      {
        icon: <Cloud className="w-4 h-4 text-gray-700" />,
        label: "Kondisi Cuaca",
        value: weatherMap[tripInfo.weather_condition]?.label || tripInfo.weather_condition,
        badge: (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${weatherMap[tripInfo.weather_condition]?.color || 'bg-gray-100 text-gray-800'}`}>
            {weatherMap[tripInfo.weather_condition]?.label || tripInfo.weather_condition}
          </span>
        )
      },
      {
        icon: <Gauge className="w-4 h-4 text-gray-700" />,
        label: "Tingkat Urgensi",
        value: urgencyMap[tripInfo.urgency_level]?.label || tripInfo.urgency_level,
        badge: (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${urgencyMap[tripInfo.urgency_level]?.color || 'bg-gray-100 text-gray-800'}`}>
            {urgencyMap[tripInfo.urgency_level]?.label || tripInfo.urgency_level}
          </span>
        )
      },
      {
        icon: <Calendar className="w-4 h-4 text-gray-700" />,
        label: "Waktu Keberangkatan",
        value: formatDateTime(tripInfo.planned_departure_time)
      }
    ];

    return (
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="bg-[#2C5B6B] px-6 py-4 text-white">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
              <Ship className="w-6 h-6 text-white" />
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
          <div className="flex items-center justify-between mb-6 p-4 bg-blue-50 rounded-xl">
            <div className="flex items-center gap-3 flex-1">
              <div className="flex flex-col items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <div className="w-0.5 h-8 bg-gray-300 my-1"></div>
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="w-4 h-4 text-green-700" />
                  <span className="font-semibold text-gray-900">Keberangkatan</span>
                </div>
                <p className="text-sm text-gray-600 ml-6">{tripInfo.departure_location}</p>
                
                <div className="flex items-center gap-2 mt-3">
                  <MapPin className="w-4 h-4 text-red-700" />
                  <span className="font-semibold text-gray-900">Tujuan</span>
                </div>
                <p className="text-sm text-gray-600 ml-6">{tripInfo.destination_location}</p>
              </div>
            </div>
          </div>

          {/* Grid Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {infoItems.map((item, index) => (
              <div key={index} className="flex items-start gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  {item.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="text-sm font-medium text-gray-700">
                      {item.label}
                    </span>
                    {item.badge}
                  </div>
                  <p className="text-sm text-gray-600">
                    {item.value}
                  </p>
                  {item.description && (
                    <p className="text-xs text-gray-500 mt-1">
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-blue-50 px-4 py-16">
        <div className="max-w-6xl mx-auto text-center">
          <div className="flex flex-col items-center justify-center gap-4 py-20">
            <Loader2 className="w-10 h-10 text-blue-700 animate-spin" />
            <p className="text-lg text-blue-800">Memuat persiapan berlayar...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-blue-50 px-4 py-16">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-red-700" />
              <h3 className="text-red-800 font-medium">{error}</h3>
            </div>
          </div>
          <button
            onClick={() => router.push('/checklist')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors shadow-sm"
          >
            Kembali ke Form
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-blue-50 px-4 py-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center mb-8 mt-12">
          <h1 className="text-3xl md:text-4xl font-bold text-blue-900 mb-3">
            Persiapan Aman Berlayar
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg">
            Lengkapi checklist berikut untuk memastikan keselamatan perjalanan Anda
          </p>
        </div>

        {/* Trip Information Card */}
        <TripInfoCard />

        {/* Progress Section */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
          <h2 className="text-xl font-semibold text-blue-900 mb-6 flex items-center gap-2">
            <div className="w-2 h-6 bg-blue-600 rounded-full"></div>
            Progress Persiapan
          </h2>
          
          <div className="space-y-6">
            {/* Main Progress Bar */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-gray-900 text-lg">
                  {progress.completion_percentage}% Selesai
                </span>
                <span className="text-sm font-medium text-gray-600">
                  {progress.completed_items}/{progress.total_items} item
                </span>
              </div>
              
              <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                <div 
                  className="bg-blue-600 h-4 rounded-full transition-all duration-500 ease-out shadow-inner" 
                  style={{ width: `${progress.completion_percentage}%` }}
                ></div>
              </div>
            </div>
            
            {/* Mandatory Items Status */}
            {progress.mandatory_items > 0 && (
              <div className={`p-4 rounded-xl border-2 transition-all ${
                progress.completed_mandatory < progress.mandatory_items 
                  ? 'bg-red-50 border-red-200' 
                  : 'bg-green-50 border-green-200'
              }`}>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${
                      progress.completed_mandatory < progress.mandatory_items 
                        ? 'bg-red-100 text-red-600' 
                        : 'bg-green-100 text-green-600'
                    }`}>
                      {progress.completed_mandatory < progress.mandatory_items ? (
                        <AlertTriangle className="w-5 h-5 text-red-600" />
                      ) : (
                        <Check className="w-5 h-5 text-green-600" />
                      )}
                    </div>
                    <div>
                      <span className="font-semibold text-gray-900 block">
                        Item Wajib
                      </span>
                      <span className="text-sm text-gray-600">
                        Persyaratan keselamatan utama
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      progress.completed_mandatory < progress.mandatory_items 
                        ? 'bg-red-100 text-red-800' 
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {progress.completed_mandatory}/{progress.mandatory_items}
                    </span>
                    {progress.completed_mandatory < progress.mandatory_items ? (
                      <span className="text-red-600 font-medium flex items-center gap-1 text-sm">
                        <AlertTriangle className="w-4 h-4 text-red-600" />
                        Perlu dilengkapi!
                      </span>
                    ) : (
                      <span className="text-green-600 font-medium flex items-center gap-1 text-sm">
                        <Check className="w-4 h-4 text-green-600" />
                        Semua selesai
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Checklist Section */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-blue-900 mb-2 flex items-center gap-2">
            <div className="w-2 h-6 bg-blue-600 rounded-full"></div>
            Checklist Persiapan
          </h2>
          
          {checklist.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-lg p-8 text-center border border-gray-200">
              <div className="flex flex-col items-center justify-center gap-3 text-gray-500">
                <Info className="w-12 h-12 text-gray-500" />
                <p className="text-lg">Tidak ada item checklist yang perlu dipersiapkan</p>
                <p className="text-sm">Semua persiapan sudah tercakup dalam informasi perjalanan</p>
              </div>
            </div>
          ) : (
            <div className="grid gap-4">
              {checklist.map((item) => (
                <div
                  key={item.id}
                  className={`bg-white rounded-xl shadow-md p-5 border-l-4 transition-all duration-300 hover:shadow-lg ${
                    item.is_mandatory 
                      ? 'border-red-500' 
                      : 'border-blue-400'
                  } ${item.is_completed ? 'opacity-80' : ''}`}
                >
                  <div className="flex flex-col sm:flex-row gap-4">
                    {/* Image */}
                    <div className="relative w-full sm:w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden border border-gray-200">
                      {item.image_url ? (
                        <Image
                          src={item.image_url}
                          alt={item.title}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-50 flex items-center justify-center">
                          <Info className="w-8 h-8 text-gray-500" />
                        </div>
                      )}
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-3">
                        <div className="flex items-start gap-2">
                          <h3 className="font-bold text-gray-900 text-lg leading-tight">
                            {item.title}
                          </h3>
                          {item.is_mandatory && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-800 text-xs font-bold rounded-full flex-shrink-0 mt-0.5">
                              <AlertTriangle className="w-3 h-3 text-red-600" />
                              WAJIB
                            </span>
                          )}
                        </div>
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full font-medium flex-shrink-0">
                          {item.category}
                        </span>
                      </div>
                      
                      <p className="text-gray-600 text-sm leading-relaxed mb-4">
                        {item.description}
                      </p>
                      
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div className="flex flex-wrap gap-2">
                          <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full">
                            <Clock className="w-3 h-3 text-gray-600" />
                            {item.estimated_time_minutes} menit
                          </span>
                          {item.priority > 0 && (
                            <span className="inline-flex items-center gap-1 px-3 py-1 bg-amber-100 text-amber-800 text-sm rounded-full">
                              Prioritas {item.priority}
                            </span>
                          )}
                        </div>
                        
                        <button 
                          onClick={() => handleCheckItem(item.id, !item.is_completed)}
                          disabled={currentlyUpdating === item.id}
                          className={`px-5 py-2.5 rounded-lg flex items-center gap-2 text-sm font-medium transition-all duration-200 min-w-[140px] justify-center ${
                            item.is_completed 
                              ? "bg-green-100 hover:bg-green-200 text-green-800 shadow-sm" 
                              : "bg-blue-600 hover:bg-blue-700 text-white shadow-md"
                          } disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                          {currentlyUpdating === item.id ? (
                            <Loader2 className="w-4 h-4 text-blue-700 animate-spin" />
                          ) : item.is_completed ? (
                            <>
                              <Check className="w-4 h-4 text-green-600" />
                              <span>Selesai</span>
                            </>
                          ) : (
                            <span>Tandai Selesai</span>
                          )}
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
            onClick={() => router.push('/checklist')}
            className="text-blue-600 hover:text-blue-800 font-medium flex items-center gap-2 transition-colors px-4 py-2 rounded-lg hover:bg-blue-50"
          >
            <ChevronRight className="w-4 h-4 text-blue-600 rotate-180" />
            Kembali ke Form
          </button>
          
          <button 
            onClick={handleNavigateToSummary}
            disabled={progress.completed_items < progress.total_items || isLoading}
            className={`px-8 py-3 rounded-lg flex items-center gap-3 transition-all duration-200 font-semibold ${
              progress.completed_items < progress.total_items
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed shadow-sm'
                : 'bg-[#2C5B6B] hover:bg-[#3A6D7E] text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
            } disabled:transform-none`}
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 text-white animate-spin" />
            ) : (
              <>
                <span>Lanjut ke Rangkuman</span>
                <ChevronRight className="w-5 h-5 text-white" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function HasilPanduanPage() {
  return (
    <>
      <LayoutNavbar>
        <Suspense fallback={
          <div className="min-h-screen bg-blue-50 px-4 py-16">
            <div className="max-w-6xl mx-auto text-center">
              <div className="flex flex-col items-center justify-center gap-4 py-20">
                <Loader2 className="w-10 h-10 text-blue-700 animate-spin" />
                <p className="text-lg text-blue-800">Memuat halaman...</p>
              </div>
            </div>
          </div>
        }>
          <HasilPanduanContent />
        </Suspense>
      </LayoutNavbar>
      <Footer />
    </>
  );
}