'use client';

import dynamic from "next/dynamic";
import { useState, useEffect } from 'react';
import { Waves, Wind, AlertTriangle, Clock, Bot, AlertCircle, MapPin, Map, Navigation, Compass, Zap, Shield, Droplets, Thermometer, ChevronRight } from 'lucide-react';
import { auth } from "@/firebase/config";
import { useRouter } from 'next/navigation';
import LayoutNavbar from '@/components/LayoutNavbar';
import Footer from '@/components/Footer';
import { useTokenRefresh } from '@/app/hooks/useAuth';
import { authFetch } from '@/app/lib/api';

const LeafletMap = dynamic(
  () => import('@/components/LeafLetMap').then((mod) => mod.default),
  { 
    ssr: false,
    loading: () => (
      <div className="h-full w-full flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#053040] border-t-transparent dark:border-white dark:border-t-transparent"></div>
      </div>
    )
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
    lat: -5.728351302091711,
    lng: 132.55887920875085,
  });
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [city, setCity] = useState<string>('Manyeuw, Maluku');
  const [locationError, setLocationError] = useState<string | null>(null);
  const [conditionData, setConditionData] = useState<ConditionData | null>(null);
  const [loading, setLoading] = useState({
    conditions: false,
    submit: false,
    location: false
  });
  const [manualInput, setManualInput] = useState({
    lat: '-5.728351302091711',
    lng: '132.55887920875085',
  });
  const [authError, setAuthError] = useState('');
  const [activeTab, setActiveTab] = useState<'overview' | 'analysis'>('overview');
  const router = useRouter();

  // Initialize token refresh mechanism
  useTokenRefresh();

  // Get user's current location
  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation tidak didukung browser ini.');
      return;
    }

    setLoading(prev => ({...prev, location: true}));

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        setUserLocation({ lat: latitude, lng: longitude });
        
        setLocation({ lat: latitude, lng: longitude });
        setManualInput({
          lat: latitude.toString(),
          lng: longitude.toString()
        });

        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          const data = await response.json();
          if (data && data.address) {
            const { city, town, village, state } = data.address;
            setCity(city || town || village || state || 'Lokasi Tidak Diketahui');
          }
        } catch (err) {
          console.error('Error fetching location name:', err);
          setCity('Lokasi Tidak Diketahui');
        }

        setLoading(prev => ({...prev, location: false}));
      },
      (err) => {
        setLocationError(err.message);
        setLoading(prev => ({...prev, location: false}));
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  // Use current location button handler
  const handleUseCurrentLocation = () => {
    if (userLocation) {
      setLocation(userLocation);
      setManualInput({
        lat: userLocation.lat.toString(),
        lng: userLocation.lng.toString()
      });
      fetchConditions();
    }
  };

  const fetchConditions = async () => {
    setLoading(prev => ({...prev, conditions: true}));
    setAuthError('');

    try {
      const response = await authFetch(`${process.env.NEXT_PUBLIC_API_URL}/ai/explain-conditions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          latitude: location.lat,
          longitude: location.lng
        })
      });

      if (!response.ok) {
        if (response.status === 401) {
          setAuthError('Sesi Anda telah habis, silakan login kembali');
        } else {
          throw new Error('Gagal memuat data kondisi');
        }
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
      if (error instanceof Error) {
        setAuthError(error.message || 'Terjadi kesalahan saat menghubungi server');
      }
    } finally {
      setLoading(prev => ({...prev, conditions: false}));
    }
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(prev => ({...prev, submit: true}));
    
    const lat = parseFloat(manualInput.lat);
    const lng = parseFloat(manualInput.lng);
    
    if (!isNaN(lat) && !isNaN(lng)) {
      setLocation({ lat, lng });
      await fetchConditions();
    } else {
      setAuthError('Masukkan koordinat yang valid');
    }
    
    setLoading(prev => ({...prev, submit: false}));
  };

  const handleMapClick = (lat: number, lng: number) => {
    setLocation({ lat, lng });
    setManualInput({
      lat: lat.toString(),
      lng: lng.toString()
    });
  };

  const getSafetyColor = (level: string) => {
    switch (level) {
      case 'AMAN': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300 border-green-200 dark:border-green-800';
      case 'WASPADA': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800';
      case 'BAHAYA': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300 border-red-200 dark:border-red-800';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-700';
    }
  };

  const getSafetyIcon = (level: string) => {
    switch (level) {
      case 'AMAN': return '🟢';
      case 'WASPADA': return '🟡';
      case 'BAHAYA': return '🔴';
      default: return '⚪';
    }
  };

  return (
    <>
      <LayoutNavbar>
        <div className="min-h-screen pt-20 px-4 sm:px-6 lg:px-8 py-6 bg-white dark:bg-gray-900 transition-colors">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-6 md:mb-8">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-[#053040] rounded-lg">
                  <Waves className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-[#053040] dark:text-white">Cek Kondisi Laut</h1>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Analisis real-time kondisi perairan berdasarkan lokasi Anda
                  </p>
                </div>
              </div>
            </div>

            {authError && (
              <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 text-red-700 dark:text-red-300 p-4 mb-6 rounded-lg">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-5 h-5" />
                  <p>{authError}</p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 xl:grid-cols-4 gap-4 sm:gap-6">
              {/* Left Sidebar - Controls */}
              <div className="xl:col-span-1 space-y-4 sm:space-y-6">
                {/* Current Location Card */}
                <div className="bg-gradient-to-br from-[#053040] to-[#2C5B6B] rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-5 text-white">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                      <Navigation className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                    <h2 className="text-lg font-semibold">Lokasi Terkini</h2>
                  </div>
                  
                  {loading.location ? (
                    <div className="flex items-center justify-center py-6">
                      <div className="animate-spin rounded-full h-8 w-8 border-2 border-white border-t-transparent"></div>
                    </div>
                  ) : userLocation ? (
                    <div className="space-y-4">
                      <div className="bg-white/10 rounded-lg sm:rounded-xl p-3 sm:p-4 backdrop-blur-sm border border-white/10">
                        <div className="text-center">
                          <div className="text-lg sm:text-xl font-bold mb-1 sm:mb-2">{city}</div>
                          <div className="text-xs opacity-80 flex items-center justify-center gap-2">
                            <MapPin className="w-3 h-3" />
                            <span>Lokasi Terdeteksi</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="bg-white/10 rounded-lg p-2 sm:p-3 backdrop-blur-sm border border-white/10">
                          <div className="text-xs opacity-80 mb-1">Latitude</div>
                          <div className="font-mono font-bold text-sm sm:text-base">{userLocation.lat.toFixed(6)}</div>
                        </div>
                        <div className="bg-white/10 rounded-lg p-2 sm:p-3 backdrop-blur-sm border border-white/10">
                          <div className="text-xs opacity-80 mb-1">Longitude</div>
                          <div className="font-mono font-bold text-sm sm:text-base">{userLocation.lng.toFixed(6)}</div>
                        </div>
                      </div>

                      <button
                        onClick={handleUseCurrentLocation}
                        className="bg-white/20 hover:bg-white/30 w-full py-2 sm:py-3 rounded-lg sm:rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-2 sm:gap-3 text-sm sm:text-base hover:scale-[1.02] active:scale-[0.98]"
                      >
                        <MapPin className="w-4 h-4 sm:w-5 sm:h-5" />
                        Gunakan Lokasi Ini
                      </button>
                    </div>
                  ) : (
                    <div className="text-center py-4 sm:py-6">
                      <div className="bg-white/10 rounded-full p-3 inline-flex mb-3">
                        <AlertCircle className="w-5 h-5 sm:w-6 sm:h-6" />
                      </div>
                      <p className="text-sm opacity-80 mb-3 sm:mb-4">{locationError || 'Mengambil lokasi...'}</p>
                      <button
                        onClick={() => window.location.reload()}
                        className="bg-white/20 hover:bg-white/30 px-4 sm:px-6 py-2 rounded-lg text-sm transition-colors"
                      >
                        Coba Lagi
                      </button>
                    </div>
                  )}
                </div>

                {/* Coordinate Input Card */}
                <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-5 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-[#053040] rounded-lg">
                      <Compass className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                    </div>
                    <h2 className="text-lg font-semibold text-[#053040] dark:text-white">Koordinat Manual</h2>
                  </div>
                  <form onSubmit={handleManualSubmit} className="space-y-3 sm:space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-[#053040] dark:text-gray-300 mb-1 sm:mb-2">Latitude</label>
                      <input
                        type="text"
                        value={manualInput.lat}
                        onChange={(e) => setManualInput({...manualInput, lat: e.target.value})}
                        className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white p-2 sm:p-3 rounded-lg sm:rounded-xl text-sm focus:ring-2 focus:ring-[#053040] focus:border-transparent transition-all"
                        placeholder="-5.728351302091711"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#053040] dark:text-gray-300 mb-1 sm:mb-2">Longitude</label>
                      <input
                        type="text"
                        value={manualInput.lng}
                        onChange={(e) => setManualInput({...manualInput, lng: e.target.value})}
                        className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white p-2 sm:p-3 rounded-lg sm:rounded-xl text-sm focus:ring-2 focus:ring-[#053040] focus:border-transparent transition-all"
                        placeholder="132.55887920875085"
                      />
                    </div>
                    <button
                      type="submit"
                      className="bg-gradient-to-r from-[#053040] to-[#2C5B6B] text-white w-full py-2 sm:py-3 rounded-lg sm:rounded-xl font-semibold hover:from-[#2C5B6B] hover:to-[#3A6D7E] transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2 text-sm sm:text-base hover:scale-[1.02] active:scale-[0.98] shadow-lg"
                      disabled={loading.submit}
                    >
                      {loading.submit ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                          Memuat...
                        </>
                      ) : (
                        <>
                          <Zap className="w-4 h-4 sm:w-5 sm:h-5" />
                          Cek Kondisi
                        </>
                      )}
                    </button>
                  </form>
                </div>

                {/* Navigation to Forecast Page */}
                <button
                  onClick={() => router.push('/kondisi-laut/prakiraan')}
                  className="flex items-center justify-center gap-2 sm:gap-3 bg-gradient-to-r from-[#053040] to-[#2C5B6B] text-white w-full py-2 sm:py-3 rounded-lg sm:rounded-xl font-semibold hover:from-[#2C5B6B] hover:to-[#3A6D7E] transition-all duration-200 shadow-lg hover:scale-[1.02] active:scale-[0.98] text-sm sm:text-base"
                >
                  <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
                  Lihat Prakiraan Cuaca
                </button>

                {/* Quick Status Card */}
                {conditionData && (
                  <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-5 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-[#053040] rounded-lg">
                        <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                      </div>
                      <h2 className="text-lg font-semibold text-[#053040] dark:text-white">Status Cepat</h2>
                    </div>
                    <div className="space-y-3 sm:space-y-4">
                      <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 p-2 sm:p-3 rounded-lg sm:rounded-xl">
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Tingkat Keamanan</span>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getSafetyColor(conditionData.ai_explanation.safety_level)}`}>
                          {getSafetyIcon(conditionData.ai_explanation.safety_level)} {conditionData.ai_explanation.safety_level}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2">
                        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 p-2 sm:p-3 rounded-lg sm:rounded-xl border border-blue-100 dark:border-blue-800">
                          <div className="flex items-center gap-2 mb-1 sm:mb-2">
                            <Waves className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600 dark:text-blue-400" />
                            <span className="text-xs font-medium text-blue-600 dark:text-blue-400">Tinggi Gelombang</span>
                          </div>
                          <p className="font-bold text-[#053040] dark:text-white text-base sm:text-lg">
                            {conditionData.weather_data.hourly.wave_height[0]} {conditionData.weather_data.units.wave_height}
                          </p>
                        </div>
                        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 p-2 sm:p-3 rounded-lg sm:rounded-xl border border-blue-100 dark:border-blue-800">
                          <div className="flex items-center gap-2 mb-1 sm:mb-2">
                            <Wind className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600 dark:text-blue-400" />
                            <span className="text-xs font-medium text-blue-600 dark:text-blue-400">Arah Gelombang</span>
                          </div>
                          <p className="font-bold text-[#053040] dark:text-white text-base sm:text-lg">
                            {conditionData.weather_data.hourly.wave_direction[0]}°
                          </p>
                        </div>
                      </div>
                      
                      <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 p-3 sm:p-4 rounded-lg sm:rounded-xl border border-blue-200 dark:border-blue-700">
                        <h3 className="text-xs font-bold text-blue-800 dark:text-blue-300 uppercase tracking-wide mb-1 sm:mb-2 flex items-center gap-2">
                          <Bot className="w-3 h-3 sm:w-4 sm:h-4" />
                          Rekomendasi AI
                        </h3>
                        <p className="text-sm text-blue-800 dark:text-blue-200 font-medium leading-relaxed">
                          {conditionData.ai_explanation.simple_advice}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Main Content Area */}
              <div className="xl:col-span-3 space-y-4 sm:space-y-6">
                {/* Map Section */}
                <div className="h-64 sm:h-80 md:h-96 w-full rounded-xl sm:rounded-2xl overflow-hidden shadow-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                  <LeafletMap 
                    center={[location.lat, location.lng]} 
                    zoom={11}
                    onClick={handleMapClick}
                  />
                </div>

                {/* Tab Navigation */}
                <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                  <div className="flex border-b border-gray-200 dark:border-gray-700">
                    <button
                      onClick={() => setActiveTab('overview')}
                      className={`flex-1 py-3 sm:py-4 px-4 text-sm sm:text-base font-medium transition-colors ${
                        activeTab === 'overview'
                          ? 'bg-[#053040] text-white'
                          : 'text-gray-600 dark:text-gray-400 hover:text-[#053040] dark:hover:text-white'
                      }`}
                    >
                      <div className="flex items-center justify-center gap-2">
                        <Waves className="w-4 h-4" />
                        <span className="hidden xs:inline">Overview</span>
                      </div>
                    </button>
                    <button
                      onClick={() => setActiveTab('analysis')}
                      className={`flex-1 py-3 sm:py-4 px-4 text-sm sm:text-base font-medium transition-colors ${
                        activeTab === 'analysis'
                          ? 'bg-[#053040] text-white'
                          : 'text-gray-600 dark:text-gray-400 hover:text-[#053040] dark:hover:text-white'
                      }`}
                    >
                      <div className="flex items-center justify-center gap-2">
                        <Thermometer className="w-4 h-4" />
                        <span className="hidden xs:inline">Analisis Detail</span>
                      </div>
                    </button>
                  </div>

                  {/* Tab Content */}
                  <div className="p-4 sm:p-6">
                    {activeTab === 'overview' && conditionData && (
                      <div className="space-y-4 sm:space-y-6">
                        <div className="grid md:grid-cols-2 gap-4 sm:gap-6">
                          <div className="space-y-3 sm:space-y-4">
                            <h3 className="text-lg font-bold text-[#053040] dark:text-white border-b border-gray-200 dark:border-gray-600 pb-2">
                              Penjelasan Kondisi
                            </h3>
                            <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-sm sm:text-base">
                              {conditionData.ai_explanation.explanation}
                            </p>
                          </div>
                          <div className="space-y-3 sm:space-y-4">
                            <h3 className="text-lg font-bold text-[#053040] dark:text-white border-b border-gray-200 dark:border-gray-600 pb-2">
                              Konteks Lokal
                            </h3>
                            <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-sm sm:text-base">
                              {conditionData.ai_explanation.local_context}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {activeTab === 'analysis' && conditionData && (
                      <div className="space-y-4 sm:space-y-6">
                        {/* Data Teknis */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 p-3 sm:p-4 rounded-xl border border-blue-200 dark:border-blue-700">
                            <div className="flex items-center gap-2 mb-2 sm:mb-3">
                              <Waves className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 dark:text-blue-400" />
                              <h4 className="font-semibold text-[#053040] dark:text-white text-sm sm:text-base">Tinggi Gelombang</h4>
                            </div>
                            <p className="text-xl sm:text-2xl font-bold text-[#053040] dark:text-white">
                              {conditionData.weather_data.hourly.wave_height[0]} {conditionData.weather_data.units.wave_height}
                            </p>
                            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">Saat ini</p>
                          </div>
                          
                          <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-3 sm:p-4 rounded-xl border border-green-200 dark:border-green-700">
                            <div className="flex items-center gap-2 mb-2 sm:mb-3">
                              <Wind className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 dark:text-green-400" />
                              <h4 className="font-semibold text-[#053040] dark:text-white text-sm sm:text-base">Arah Gelombang</h4>
                            </div>
                            <p className="text-xl sm:text-2xl font-bold text-[#053040] dark:text-white">
                              {conditionData.weather_data.hourly.wave_direction[0]}°
                            </p>
                            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">Derajat</p>
                          </div>
                          
                          <div className="bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20 p-3 sm:p-4 rounded-xl border border-purple-200 dark:border-purple-700">
                            <div className="flex items-center gap-2 mb-2 sm:mb-3">
                              <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 dark:text-purple-400" />
                              <h4 className="font-semibold text-[#053040] dark:text-white text-sm sm:text-base">Periode Gelombang</h4>
                            </div>
                            <p className="text-xl sm:text-2xl font-bold text-[#053040] dark:text-white">
                              {conditionData.weather_data.hourly.wave_period[0]} {conditionData.weather_data.units.wave_period}
                            </p>
                            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">Detik</p>
                          </div>
                        </div>

                        {/* Ringkasan Teknis */}
                        <div className="bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-700 dark:to-blue-900/20 p-4 sm:p-6 rounded-xl border border-gray-200 dark:border-gray-600">
                          <h3 className="text-lg font-bold text-[#053040] dark:text-white mb-3 sm:mb-4 flex items-center gap-2">
                            <Droplets className="w-5 h-5" />
                            Ringkasan Teknis
                          </h3>
                          <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-sm sm:text-base">
                            {conditionData.ai_explanation.technical_summary}
                          </p>
                        </div>
                      </div>
                    )}

                    {!conditionData && loading.conditions && (
                      <div className="flex flex-col items-center justify-center gap-3 sm:gap-4 py-6 sm:py-8">
                        <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-2 border-[#053040] border-t-transparent dark:border-white dark:border-t-transparent"></div>
                        <p className="text-[#053040] dark:text-white font-medium text-sm sm:text-base">Memuat analisis kondisi laut...</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </LayoutNavbar>
      <Footer />
    </>
  );
}