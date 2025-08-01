'use client';

import dynamic from "next/dynamic";
import { useState, useEffect } from 'react';
import { Waves, Wind, AlertTriangle } from 'lucide-react';
import { auth } from "@/firebase/config";


// Import komponen lain seperti biasa
import LayoutNavbar from '@/components/LayoutNavbar';
import Footer from '@/components/Footer';

// Import LeafletMap tanpa SSR
const LeafletMap = dynamic(
  () => import('@/components/LeafLetMap').then((mod) => mod.default),
  { 
    ssr: false,
    loading: () => <div className="h-full w-full flex items-center justify-center bg-gray-100">
      <img src="/logo.png" alt="Loading" className="w-8 h-8 animate-spin" />
    </div>
  }
);

type ConditionData = {
  coordinates: {
    latitude: number;
    longitude: number;
  };
  location_string: string;
  weather_data: {
    location: {
      latitude: number;
      longitude: number;
      timezone: string;
    };
    current_time: string;
    hourly: {
      wave_height: number[];
      wave_direction: number[];
      wave_period: number[];
    };
    daily: {
      wave_height_max: number[];
      wave_direction_dominant: number[];
      wave_period_max: number[];
    };
    units: {
      wave_height: string;
      wave_direction: string;
      wave_period: string;
    };
  };
  ai_explanation: {
    explanation: string;
    safety_level: string;
    simple_advice: string;
    local_context: string;
    technical_summary: string;
  };
};

export default function KondisiLautPage() {
  const [location, setLocation] = useState({
    lat: -6.8,
    lng: 106.8,
  });
  const [conditionData, setConditionData] = useState<ConditionData | null>(null);
  const [loading, setLoading] = useState(false);
  const [manualInput, setManualInput] = useState({
    lat: '-6.8',
    lng: '106.8'
  });
  const [authError, setAuthError] = useState('');
  
  const [shouldFetch, setShouldFetch] = useState(false);
  const [mapReady, setMapReady] = useState(false);

  // Fetch condition data
  const fetchConditions = async () => {
    setLoading(true);
    setAuthError('');

    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        setAuthError("Anda perlu login terlebih dahulu.");
        setLoading(false);
        return;
      }

      // ✅ Ambil token valid dari user login Firebase
      const idToken = localStorage.getItem("idToken");

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/ai/explain-conditions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          latitude: location.lat,
          longitude: location.lng
        })
      });

      if (response.status === 401) {
        setAuthError('Sesi Anda telah habis, silakan login kembali');
        return;
      }

      const data = await response.json();
      if (data.success) {
        setConditionData(data.data);
      } else {
        setAuthError(data.message || 'Gagal memuat data');
      }
    } catch (error) {
      console.error('Error fetching conditions:', error);
      setAuthError('Terjadi kesalahan saat menghubungi server');
    } finally {
      setLoading(false);
    }
  };

  // Fetch data when location changes
  useEffect(() => {
    fetchConditions();
  }, [location]);

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const lat = parseFloat(manualInput.lat);
    const lng = parseFloat(manualInput.lng);
    
    if (!isNaN(lat) && !isNaN(lng)) {
      setLocation({
        lat,
        lng
      } 
    );
    setShouldFetch(true);
    }
    else {
      setAuthError('Masukkan koordinat yang valid');}
  };


  // Handle map click
  const handleMapClick = (lat: number, lng: number) => {
    setLocation({ lat, lng });
    setManualInput({
      lat: lat.toString(),
      lng: lng.toString()
    });
    // setShouldFetch(true);
  };

  // Fetch data when location changes and shouldFetch is true
  useEffect(() => {
    if (mapReady && shouldFetch) {
      fetchConditions();
    }
  }, [location]);

  // Initial fetch when map is ready
  useEffect(() => {
    if (mapReady) {
      setShouldFetch(true);
    }
  }, [mapReady]);

  const getSafetyColor = () => {
    if (!conditionData) return 'bg-gray-500';
    switch (conditionData.ai_explanation.safety_level) {
      case 'AMAN': return 'bg-green-500';
      case 'WASPADA': return 'bg-yellow-500';
      case 'BAHAYA': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <>
      <LayoutNavbar>
        <div className="min-h-screen pt-20 p-8 bg-white max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-[#053040]">Cek Kondisi Laut</h1>
            <p className="text-sm md:text-base text-[#5c7893] mt-2">
              Masukkan koordinat atau klik pada peta untuk mendapatkan analisis kondisi laut
            </p>
          </div>

          {authError && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded">
              <p>{authError}</p>
            </div>
          )}

          <div className="grid md:grid-cols-3 gap-6">
            {/* Input Section */}
            <div className="md:col-span-1 space-y-6">
              {/* Coordinate Input */}
              <div className="bg-white rounded-xl shadow-sm p-4">
                <h2 className="text-lg font-semibold text-[#053040] border-b pb-2">Koordinat</h2>
                <form onSubmit={handleManualSubmit} className="mt-4 space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-[#053040] mb-1">Latitude</label>
                    <input
                      type="text"
                      value={manualInput.lat}
                      onChange={(e) => setManualInput({...manualInput, lat: e.target.value})}
                      className="w-full border border-gray-200 p-2 rounded-lg text-sm"
                      placeholder="-6.8"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#053040] mb-1">Longitude</label>
                    <input
                      type="text"
                      value={manualInput.lng}
                      onChange={(e) => setManualInput({...manualInput, lng: e.target.value})}
                      className="w-full border border-gray-200 p-2 rounded-lg text-sm"
                      placeholder="106.8"
                    />
                  </div>
                  <button
                    type="submit"
                    className="bg-[#053040] text-white w-full py-2 rounded-lg font-medium hover:bg-[#6491a3] transition-colors"
                    disabled={loading}
                  >
                    {loading ? 'Memuat...' : 'Cek Kondisi'}
                  </button>
                </form>
              </div>

              {/* Current Location Info */}
              <div className="bg-white rounded-xl shadow-sm p-4">
                <h2 className="text-lg font-semibold text-[#053040] border-b pb-2">Lokasi Saat Ini</h2>
                {loading ? (
                  // <div className="mt-4 text-center py-4">
                  //   <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#053040] mx-auto"></div>
                  // </div>
                  <div className="h-full w-full flex items-center justify-center bg-gray-100">
                    <img src="/logo.png" className="w-5 h-5 animate-spin" />
                  </div>
                ) : conditionData ? (
                  <div className="mt-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-[#053040]">Status Keselamatan</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        conditionData.ai_explanation.safety_level === 'AMAN' ? 'bg-green-100 text-green-800' :
                        conditionData.ai_explanation.safety_level === 'WASPADA' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {conditionData.ai_explanation.safety_level}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-[#eaf9fd] p-2 rounded-lg">
                        <div className="flex items-center gap-2">
                          <Waves size={16} className="text-[#00698f]" />
                          <span className="text-xs text-[#5c7893]">Gelombang</span>
                        </div>
                        <p className="font-medium text-[#053040]">
                          {conditionData.weather_data.hourly.wave_height[0]} {conditionData.weather_data.units.wave_height}
                        </p>
                      </div>
                      <div className="bg-[#eaf9fd] p-2 rounded-lg">
                        <div className="flex items-center gap-2">
                          <Wind size={16} className="text-[#00698f]" />
                          <span className="text-xs text-[#5c7893]">Arah</span>
                        </div>
                        <p className="font-medium text-[#053040]">
                          {conditionData.weather_data.hourly.wave_direction[0]}°
                        </p>
                      </div>
                    </div>

                    <div className="pt-2">
                      <h4 className="text-sm font-medium text-[#053040]">Saran Singkat</h4>
                      <p className="text-sm text-[#5c7893] mt-1">
                        {conditionData.ai_explanation.simple_advice}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4 text-sm text-[#5c7893]">
                    Pilih lokasi untuk melihat kondisi
                  </div>
                )}
              </div>
            </div>

            {/* Map and AI Explanation */}
            <div className="md:col-span-2 space-y-6">
              {/* Map */}
              <div className="h-[400px] w-full rounded-xl overflow-hidden shadow-md bg-white border border-gray-100">
                <LeafletMap 
                  center={[location.lat, location.lng]} 
                  zoom={11}
                  onClick={handleMapClick} 
                />
              </div>

              {/* AI Explanation */}
              {conditionData && (
                <div className="bg-white p-5 rounded-xl shadow-sm border border-[#eaf9fd]">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="bg-[#053040] p-2 rounded-lg">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 8V4H8" />
                        <rect width="16" height="12" x="4" y="8" rx="2" />
                        <path d="M2 14h2" />
                        <path d="M20 14h2" />
                        <path d="M15 13v2" />
                        <path d="M9 13v2" />
                      </svg>
                    </div>
                    <h2 className="text-lg font-semibold text-[#053040]">Analisis AI</h2>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium text-[#053040]">Penjelasan Kondisi</h4>
                      <p className="text-sm text-gray-700 leading-relaxed mt-1">
                        {conditionData.ai_explanation.explanation}
                      </p>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-[#053040]">Konteks Lokal</h4>
                      <p className="text-sm text-gray-700 leading-relaxed mt-1">
                        {conditionData.ai_explanation.local_context}
                      </p>
                    </div>

                    <div className="bg-[#f8fafc] p-3 rounded-lg">
                      <div className="flex items-start gap-2">
                        <AlertTriangle size={18} className="text-[#00698f] mt-0.5" />
                        <div>
                          <h4 className="text-sm font-medium text-[#053040]">Ringkasan Teknis</h4>
                          <p className="text-sm text-gray-700 mt-1">
                            {conditionData.ai_explanation.technical_summary}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </LayoutNavbar>
      <Footer />
    </>
  );
}