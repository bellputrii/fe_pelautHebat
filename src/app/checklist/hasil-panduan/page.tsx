"use client";

import { useState, useEffect, Suspense } from "react";
import LayoutNavbar from '@/components/LayoutNavbar';
import Footer from '@/components/Footer';
import Image from 'next/image';
import { useSearchParams, useRouter } from 'next/navigation';
import { Check, ChevronRight, Info, Loader2, AlertTriangle } from 'lucide-react';
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

  const getTripDescription = () => {
    if (!tripInfo) return "Memuat informasi perjalanan...";
    
    const tripPurposeMap: Record<string, string> = {
      fishing: "Memancing",
      transport: "Pengiriman Barang",
      recreation: "Wisata",
      emergency: "Situasi Darurat"
    };
    
    const boatTypeMap: Record<string, string> = {
      perahu_kecil: "Perahu Kecil",
      kapal_nelayan: "Kapal Nelayan",
      kapal_besar: "Kapal Besar"
    };
    
    const weatherMap: Record<string, string> = {
      calm: "Tenang",
      moderate: "Sedang",
      rough: "Buruk"
    };
    
    const durationHours = Math.floor(tripInfo.duration_minutes / 60);
    const durationMinutes = tripInfo.duration_minutes % 60;
    const durationText = durationHours > 0 
      ? `${durationHours} jam ${durationMinutes} menit` 
      : `${durationMinutes} menit`;
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1">
          <p className="flex items-start">
            <span className="font-semibold w-28 flex-shrink-0">Tujuan:</span> 
            <span>{tripPurposeMap[tripInfo.trip_purpose] || tripInfo.trip_purpose}</span>
          </p>
          <p className="flex items-start">
            <span className="font-semibold w-28 flex-shrink-0">Durasi:</span> 
            <span>{durationText} (PP)</span>
          </p>
        </div>
        <div className="space-y-1">
          <p className="flex items-start">
            <span className="font-semibold w-28 flex-shrink-0">Jarak:</span> 
            <span>{tripInfo.distance_km} km</span>
          </p>
          <p className="flex items-start">
            <span className="font-semibold w-28 flex-shrink-0">Kapal:</span> 
            <span>{boatTypeMap[tripInfo.boat_type] || tripInfo.boat_type}</span>
          </p>
          <p className="flex items-start">
            <span className="font-semibold w-28 flex-shrink-0">Cuaca:</span> 
            <span>{weatherMap[tripInfo.weather_condition] || tripInfo.weather_condition}</span>
          </p>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex flex-col items-center justify-center gap-4 py-20">
            <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
            <p className="text-lg text-blue-800">Memuat persiapan berlayar...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white px-4 py-16">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <h3 className="text-red-800 font-medium">{error}</h3>
            </div>
          </div>
          <button
            onClick={() => router.push('/checklist')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
          >
            Kembali ke Form
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white px-4 py-16">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <h1 className="text-2xl md:text-3xl font-bold text-blue-900">
              Persiapan Aman Berlayar
            </h1>
          </div>
          <div className="text-gray-700">
            {getTripDescription()}
          </div>
        </div>

        {/* Progress Section */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h2 className="text-xl font-semibold text-blue-900 mb-6">
            Progress Persiapan
          </h2>
          
          <div className="space-y-6">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium text-blue-900">
                  {progress.completion_percentage}% Selesai
                </span>
                <span className="text-sm font-medium text-gray-600">
                  {progress.completed_items}/{progress.total_items} item
                </span>
              </div>
              
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-blue-700 h-3 rounded-full transition-all duration-500 ease-out" 
                  style={{ width: `${progress.completion_percentage}%` }}
                ></div>
              </div>
            </div>
            
            {progress.mandatory_items > 0 && (
              <div className={`p-4 rounded-lg ${
                progress.completed_mandatory < progress.mandatory_items 
                  ? 'bg-red-50 border border-red-200' 
                  : 'bg-green-50 border border-green-200'
              }`}>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-800">
                      Item Wajib
                    </span>
                    <span className="text-xs bg-red-100 text-red-800 px-2 py-0.5 rounded-full">
                      {progress.completed_mandatory}/{progress.mandatory_items}
                    </span>
                  </div>
                  {progress.completed_mandatory < progress.mandatory_items ? (
                    <span className="text-sm font-medium text-red-600 flex items-center gap-1">
                      <AlertTriangle className="w-4 h-4" />
                      Lengkapi item wajib!
                    </span>
                  ) : (
                    <span className="text-sm font-medium text-green-600 flex items-center gap-1">
                      <Check className="w-4 h-4" />
                      Semua item wajib selesai
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Checklist Section */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-blue-900">
            Checklist Persiapan
          </h2>
          
          {checklist.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm p-8 text-center border border-gray-100">
              <div className="flex flex-col items-center justify-center gap-3 text-gray-500">
                <Info className="w-8 h-8" />
                <p>Tidak ada item checklist yang perlu dipersiapkan</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {checklist.map((item) => (
                <div
                  key={item.id}
                  className={`bg-white rounded-xl shadow-sm p-5 border-l-4 transition-all ${
                    item.is_mandatory ? 'border-red-500' : 'border-blue-400'
                  } ${item.is_completed ? 'opacity-90' : ''} hover:shadow-md`}
                >
                  <div className="flex items-start gap-4">
                    <div className="relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden border border-gray-200">
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
                          <Info className="w-6 h-6 text-gray-400" />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <h3 className="font-bold text-blue-900 truncate">
                          {item.title}
                          {item.is_mandatory && (
                            <span className="ml-2 text-xs bg-red-100 text-red-800 px-2 py-0.5 rounded-full">
                              WAJIB
                            </span>
                          )}
                        </h3>
                        <span className="text-xs bg-blue-100 text-blue-800 px-3 py-1 rounded-full flex-shrink-0">
                          {item.category}
                        </span>
                      </div>
                      
                      <p className="text-sm text-gray-600 mt-2 line-clamp-2">{item.description}</p>
                      
                      <div className="flex flex-wrap justify-between items-center mt-4 gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs bg-gray-100 text-gray-800 px-3 py-1 rounded-full">
                            {item.estimated_time_minutes} menit
                          </span>
                          {item.priority > 0 && (
                            <span className="text-xs bg-amber-100 text-amber-800 px-3 py-1 rounded-full">
                              Prioritas {item.priority}
                            </span>
                          )}
                        </div>
                        
                        <button 
                          onClick={() => handleCheckItem(item.id, !item.is_completed)}
                          disabled={currentlyUpdating === item.id}
                          className={`px-4 py-2 rounded-lg flex items-center gap-2 text-sm transition-colors ${
                            item.is_completed 
                              ? "bg-green-100 text-green-800 hover:bg-green-200" 
                              : "bg-blue-600 text-white hover:bg-blue-700"
                          }`}
                        >
                          {currentlyUpdating === item.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : item.is_completed ? (
                            <>
                              <Check className="w-4 h-4" /> Selesai
                            </>
                          ) : (
                            "Tandai Selesai"
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
        <div className="flex flex-col-reverse sm:flex-row justify-between items-center gap-4 pt-8">
          <button
            onClick={() => router.push('/checklist')}
            className="text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1 transition-colors"
          >
            ← Kembali ke Form
          </button>
          
          <button 
            onClick={handleNavigateToSummary}
            disabled={progress.completed_items < progress.total_items || isLoading}
            className={`px-6 py-3 rounded-lg flex items-center gap-2 transition-all ${
              progress.completed_items < progress.total_items
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-[#053040] hover:bg-[#2C5B6B] text-white shadow-md'
            }`}
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <span>Lanjut ke Rangkuman</span>
                <ChevronRight className="w-5 h-5" />
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
          <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white px-4 py-16">
            <div className="max-w-4xl mx-auto text-center">
              <div className="flex flex-col items-center justify-center gap-4 py-20">
                <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
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