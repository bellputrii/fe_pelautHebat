'use client';

import { useState, useEffect } from 'react';
import { Waves, Wind, Clock, ChevronDown, Bot, MapPin, Thermometer, Gauge, Compass, Lightbulb, Map, Navigation, AlertTriangle, Zap, Shield, Droplets, ChevronRight } from 'lucide-react';
import { auth } from "@/firebase/config";
import { useRouter } from 'next/navigation';
import LayoutNavbar from '@/components/LayoutNavbar';
import Footer from '@/components/Footer';
import { useTokenRefresh } from '@/app/hooks/useAuth';
import { authFetch } from '@/app/lib/api';

type ForecastData = {
  time: string;
  wave_height?: number;
  wave_direction?: number;
  wave_period?: number;
  wind_wave_height?: number;
  wind_wave_direction?: number;
  wind_wave_period?: number;
  swell_wave_height?: number;
  swell_wave_direction?: number;
  swell_wave_period?: number;
  wind_speed?: number;
  wind_direction?: number;
  wind_gusts?: number;
  temperature?: number;
  pressure?: number;
};

type SafeWindow = {
  start_time: string;
  end_time: string;
  confidence: string;
  reason: string;
  wave_condition: string;
  wind_condition: string;
};

type RecommendationData = {
  coordinates: {
    latitude: number;
    longitude: number;
  };
  location_string: string;
  boat_type: string;
  parameters?: {
    forecast_hours?: number;
    timezone?: string;
  };
  forecast_data: {
    location?: {
      latitude: number;
      longitude: number;
    };
    forecast_hours?: number;
    forecast: ForecastData[];
    retrieved_at?: string;
    data_source?: string;
  };
  ai_recommendations: {
    boat_type: string;
    safe_windows: SafeWindow[];
    best_recommendation: string;
    general_advice: string;
    avoid_times?: any[];
  };
  generated_at?: string;
};

const BOAT_TYPES = [
  { value: 'perahu_kecil', label: 'Perahu Kecil' },
  { value: 'kapal_nelayan', label: 'Kapal Nelayan' },
  { value: 'kapal_besar', label: 'Kapal Besar' }
];

const initialRecommendationData: RecommendationData = {
  coordinates: { latitude: 0, longitude: 0 },
  location_string: '',
  boat_type: '',
  forecast_data: { forecast: [] },
  ai_recommendations: {
    boat_type: '',
    safe_windows: [],
    best_recommendation: '',
    general_advice: ''
  }
};

export default function PrakiraanPage() {
  const [location, setLocation] = useState({
    lat: -5.728351302091711,
    lng: 132.55887920875085,
  });
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [city, setCity] = useState<string>('Manyeuw, Maluku');
  const [locationError, setLocationError] = useState<string | null>(null);
  const [manualInput, setManualInput] = useState({
    lat: '-5.728351302091711',
    lng: '132.55887920875085',
  });
  const [recommendationData, setRecommendationData] = useState<RecommendationData>(initialRecommendationData);
  const [loading, setLoading] = useState({
    fetch: false,
    submit: false,
    location: false
  });
  const [selectedBoatType, setSelectedBoatType] = useState(BOAT_TYPES[0].value);
  const [authError, setAuthError] = useState('');
  const [activeTab, setActiveTab] = useState<'forecast' | 'recommendations'>('forecast');
  const router = useRouter();

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
        
        // Update location state and manual input
        setLocation({ lat: latitude, lng: longitude });
        setManualInput({
          lat: latitude.toString(),
          lng: longitude.toString()
        });

        // Fetch location name
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
        
        // Fetch recommendations after getting location
        fetchTimeRecommendations(latitude, longitude);
      },
      (err) => {
        setLocationError(err.message);
        setLoading(prev => ({...prev, location: false}));
        // Fallback to default location
        fetchTimeRecommendations(location.lat, location.lng);
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
      fetchTimeRecommendations(userLocation.lat, userLocation.lng);
    }
  };

  const fetchTimeRecommendations = async (lat: number, lng: number) => {
    setLoading(prev => ({...prev, fetch: true}));
    setAuthError('');

    try {
      const response = await authFetch(`${process.env.NEXT_PUBLIC_API_URL}/ai/recommend-times`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          latitude: lat,
          longitude: lng,
          boat_type: selectedBoatType,
          forecast_data: {
            forecast_hours: 24,
            forecast: []
          }
        })
      });

      if (!response.ok) {
        if (response.status === 401) {
          setAuthError('Sesi Anda telah habis, silakan login kembali');
          return;
        }
        throw new Error('Gagal memuat rekomendasi');
      }

      const result = await response.json();
      
      if (result?.success && result?.data) {
        const data = result.data;
        setRecommendationData({
          coordinates: data.coordinates || initialRecommendationData.coordinates,
          location_string: data.location_string || `${data.coordinates?.latitude}, ${data.coordinates?.longitude}`,
          boat_type: data.boat_type || selectedBoatType,
          parameters: data.parameters,
          forecast_data: {
            location: data.forecast_data?.location,
            forecast_hours: data.forecast_data?.forecast_hours,
            forecast: data.forecast_data?.forecast || [],
            retrieved_at: data.forecast_data?.retrieved_at,
            data_source: data.forecast_data?.data_source || 'tidak diketahui'
          },
          ai_recommendations: {
            boat_type: data.ai_recommendations?.boat_type || selectedBoatType,
            safe_windows: data.ai_recommendations?.safe_windows || [],
            best_recommendation: data.ai_recommendations?.best_recommendation || '',
            general_advice: data.ai_recommendations?.general_advice || '',
            avoid_times: data.ai_recommendations?.avoid_times || []
          },
          generated_at: data.generated_at
        });
        
        setLocation({ 
          lat: data.coordinates?.latitude || lat, 
          lng: data.coordinates?.longitude || lng 
        });
        setManualInput({
          lat: (data.coordinates?.latitude || lat).toString(),
          lng: (data.coordinates?.longitude || lng).toString()
        });
      } else {
        setAuthError(result?.message || 'Data forecast tidak valid');
        setRecommendationData(initialRecommendationData);
      }
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      if (error instanceof Error) {
        setAuthError(error.message || 'Terjadi kesalahan saat menghubungi server');
      }
      setRecommendationData(initialRecommendationData);
    } finally {
      setLoading(prev => ({...prev, fetch: false}));
    }
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(prev => ({...prev, submit: true}));
    
    const lat = parseFloat(manualInput.lat);
    const lng = parseFloat(manualInput.lng);
    
    if (!isNaN(lat) && !isNaN(lng)) {
      await fetchTimeRecommendations(lat, lng);
    } else {
      setAuthError('Masukkan koordinat yang valid');
    }
    
    setLoading(prev => ({...prev, submit: false}));
  };

  const formatTime = (timeString: string) => {
    try {
      const date = new Date(timeString);
      if (isNaN(date.getTime())) {
        // If parsing fails, try to format as simple time (HH:MM)
        const timeParts = timeString.split(':');
        if (timeParts.length >= 2) {
          return `${timeParts[0]}:${timeParts[1]}`;
        }
        return timeString;
      }
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return timeString;
    }
  };

  const formatNumber = (value?: number, decimals: number = 1) => {
    if (value === undefined || value === null) return '-';
    return Number(value).toFixed(decimals);
  };

  const getFirstForecast = () => {
    return recommendationData.forecast_data?.forecast?.[0] || {};
  };

  const getConfidenceColor = (confidence: string) => {
    switch (confidence) {
      case 'TINGGI': return 'bg-green-100 text-green-800 border-green-200';
      case 'SEDANG': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'RENDAH': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <>
      <LayoutNavbar>
        <div className="min-h-screen pt-20 px-4 sm:px-6 lg:px-8 py-6 bg-white transition-colors">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-6 md:mb-8">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-[#053040] rounded-lg">
                  <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-[#053040]">Prakiraan Cuaca Laut</h1>
                  <p className="text-sm text-gray-700 mt-1">
                    Analisis kondisi laut dan rekomendasi waktu berlayar berdasarkan jenis kapal Anda
                  </p>
                </div>
              </div>
            </div>

            {authError && (
              <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-lg">
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
                <div className="bg-[#053040] rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-5 text-white">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-[#2C5B6B] rounded-lg">
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
                      <div className="bg-[#2C5B6B] rounded-lg sm:rounded-xl p-3 sm:p-4 border border-[#3A6D7E]">
                        <div className="text-center">
                          <div className="text-lg sm:text-xl font-bold mb-1 sm:mb-2">{city}</div>
                          <div className="text-xs opacity-90 flex items-center justify-center gap-2">
                            <MapPin className="w-3 h-3" />
                            <span>Lokasi Terdeteksi</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="bg-[#2C5B6B] rounded-lg p-2 sm:p-3 border border-[#3A6D7E]">
                          <div className="text-xs opacity-90 mb-1">Latitude</div>
                          <div className="font-mono font-bold text-sm sm:text-base">{userLocation.lat.toFixed(6)}</div>
                        </div>
                        <div className="bg-[#2C5B6B] rounded-lg p-2 sm:p-3 border border-[#3A6D7E]">
                          <div className="text-xs opacity-90 mb-1">Longitude</div>
                          <div className="font-mono font-bold text-sm sm:text-base">{userLocation.lng.toFixed(6)}</div>
                        </div>
                      </div>

                      <button
                        onClick={handleUseCurrentLocation}
                        className="bg-[#2C5B6B] hover:bg-[#3A6D7E] w-full py-2 sm:py-3 rounded-lg sm:rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-2 sm:gap-3 text-sm sm:text-base hover:scale-[1.02] active:scale-[0.98] border border-[#3A6D7E]"
                      >
                        <MapPin className="w-4 h-4 sm:w-5 sm:h-5" />
                        Gunakan Lokasi Ini
                      </button>
                    </div>
                  ) : (
                    <div className="text-center py-4 sm:py-6">
                      <div className="bg-[#2C5B6B] rounded-full p-3 inline-flex mb-3">
                        <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6" />
                      </div>
                      <p className="text-sm opacity-90 mb-3 sm:mb-4">{locationError || 'Mengambil lokasi...'}</p>
                      <button
                        onClick={() => window.location.reload()}
                        className="bg-[#2C5B6B] hover:bg-[#3A6D7E] px-4 sm:px-6 py-2 rounded-lg text-sm transition-colors border border-[#3A6D7E]"
                      >
                        Coba Lagi
                      </button>
                    </div>
                  )}
                </div>

                {/* Coordinate Input Card */}
                <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-5 border border-gray-200">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-[#053040] rounded-lg">
                      <Compass className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                    </div>
                    <h2 className="text-lg font-semibold text-[#053040]">Koordinat Manual</h2>
                  </div>
                  <form onSubmit={handleManualSubmit} className="space-y-3 sm:space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-[#053040] mb-1 sm:mb-2">Latitude</label>
                      <input
                        type="text"
                        value={manualInput.lat}
                        onChange={(e) => setManualInput({...manualInput, lat: e.target.value})}
                        className="w-full border border-gray-300 bg-white text-gray-900 p-2 sm:p-3 rounded-lg sm:rounded-xl text-sm focus:ring-2 focus:ring-[#053040] focus:border-transparent transition-all"
                        placeholder="-5.728351302091711"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#053040] mb-1 sm:mb-2">Longitude</label>
                      <input
                        type="text"
                        value={manualInput.lng}
                        onChange={(e) => setManualInput({...manualInput, lng: e.target.value})}
                        className="w-full border border-gray-300 bg-white text-gray-900 p-2 sm:p-3 rounded-lg sm:rounded-xl text-sm focus:ring-2 focus:ring-[#053040] focus:border-transparent transition-all"
                        placeholder="132.55887920875085"
                      />
                    </div>
                    <button
                      type="submit"
                      className="bg-[#053040] hover:bg-[#2C5B6B] text-white w-full py-2 sm:py-3 rounded-lg sm:rounded-xl font-semibold transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2 text-sm sm:text-base hover:scale-[1.02] active:scale-[0.98] shadow-lg"
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
                          Perbarui Prakiraan
                        </>
                      )}
                    </button>
                  </form>
                </div>

                {/* Boat Type Card */}
                <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-5 border border-gray-200">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-[#053040] rounded-lg">
                      <Waves className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                    </div>
                    <h2 className="text-lg font-semibold text-[#053040]">Jenis Kapal</h2>
                  </div>
                  <div className="space-y-3 sm:space-y-4">
                    <div className="relative">
                      <select
                        value={selectedBoatType}
                        onChange={(e) => setSelectedBoatType(e.target.value)}
                        className="appearance-none w-full border border-gray-300 bg-white text-gray-900 p-2 sm:p-3 rounded-lg sm:rounded-xl text-sm focus:ring-2 focus:ring-[#053040] focus:border-transparent transition-all pr-8"
                      >
                        {BOAT_TYPES.map((type) => (
                          <option key={type.value} value={type.value}>{type.label}</option>
                        ))}
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:pr-3 pointer-events-none">
                        <ChevronDown size={16} className="text-gray-500" />
                      </div>
                    </div>
                    <button
                      onClick={() => fetchTimeRecommendations(location.lat, location.lng)}
                      className="flex items-center justify-center gap-2 sm:gap-3 bg-[#053040] hover:bg-[#2C5B6B] text-white w-full py-2 sm:py-3 rounded-lg sm:rounded-xl font-semibold transition-all duration-200 disabled:opacity-50 shadow-lg hover:scale-[1.02] active:scale-[0.98] text-sm sm:text-base"
                      disabled={loading.fetch}
                    >
                      <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
                      {loading.fetch ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                          Memuat...
                        </>
                      ) : (
                        'Perbarui Rekomendasi'
                      )}
                    </button>
                  </div>
                </div>

                {/* Quick Recommendation Card */}
                {recommendationData.ai_recommendations?.best_recommendation && (
                  <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-5 border border-gray-200">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-[#053040] rounded-lg">
                        <Bot className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                      </div>
                      <h2 className="text-lg font-semibold text-[#053040]">Rekomendasi Cepat</h2>
                    </div>
                    <div className="bg-blue-50 p-3 sm:p-4 rounded-lg sm:rounded-xl border border-blue-200">
                      <p className="text-sm text-blue-800 font-medium leading-relaxed">
                        {recommendationData.ai_recommendations.best_recommendation}
                      </p>
                    </div>
                  </div>
                )}

                {/* Navigation to Conditions Page */}
                <button
                  onClick={() => router.push('/kondisi-laut')}
                  className="flex items-center justify-center gap-2 sm:gap-3 bg-[#053040] hover:bg-[#2C5B6B] text-white w-full py-2 sm:py-3 rounded-lg sm:rounded-xl font-semibold transition-all duration-200 shadow-lg hover:scale-[1.02] active:scale-[0.98] text-sm sm:text-base"
                >
                  <Waves className="w-4 h-4 sm:w-5 sm:h-5" />
                  Cek Kondisi Laut Saat Ini
                </button>
              </div>

              {/* Main Content Area */}
              <div className="xl:col-span-3 space-y-4 sm:space-y-6">
                {/* Current Conditions Summary */}
                <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-5 border border-gray-200">
                  <h2 className="text-lg font-semibold text-[#053040] mb-4 sm:mb-6 flex items-center gap-3">
                    <Shield className="w-5 h-5 sm:w-6 sm:h-6" />
                    Ringkasan Kondisi Saat Ini
                  </h2>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
                    <div className="bg-blue-50 p-3 sm:p-4 rounded-xl border border-blue-200">
                      <div className="flex items-center gap-2 mb-2 sm:mb-3">
                        <Wind className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                        <span className="text-xs font-medium text-blue-700">Kecepatan Angin</span>
                      </div>
                      <p className="text-xl sm:text-2xl font-bold text-[#053040]">
                        {formatNumber(getFirstForecast().wind_speed)} knots
                      </p>
                    </div>
                    
                    <div className="bg-green-50 p-3 sm:p-4 rounded-xl border border-green-200">
                      <div className="flex items-center gap-2 mb-2 sm:mb-3">
                        <Waves className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                        <span className="text-xs font-medium text-green-700">Tinggi Gelombang</span>
                      </div>
                      <p className="text-xl sm:text-2xl font-bold text-[#053040]">
                        {formatNumber(getFirstForecast().wave_height)} m
                      </p>
                    </div>
                    
                    <div className="bg-purple-50 p-3 sm:p-4 rounded-xl border border-purple-200">
                      <div className="flex items-center gap-2 mb-2 sm:mb-3">
                        <Thermometer className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
                        <span className="text-xs font-medium text-purple-700">Suhu</span>
                      </div>
                      <p className="text-xl sm:text-2xl font-bold text-[#053040]">
                        {formatNumber(getFirstForecast().temperature)} °C
                      </p>
                    </div>
                    
                    <div className="bg-orange-50 p-3 sm:p-4 rounded-xl border border-orange-200">
                      <div className="flex items-center gap-2 mb-2 sm:mb-3">
                        <Gauge className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600" />
                        <span className="text-xs font-medium text-orange-700">Tekanan</span>
                      </div>
                      <p className="text-xl sm:text-2xl font-bold text-[#053040]">
                        {formatNumber(getFirstForecast().pressure)} hPa
                      </p>
                    </div>
                    
                    <div className="bg-red-50 p-3 sm:p-4 rounded-xl border border-red-200">
                      <div className="flex items-center gap-2 mb-2 sm:mb-3">
                        <Compass className="w-4 h-4 sm:w-5 sm:h-5 text-red-600" />
                        <span className="text-xs font-medium text-red-700">Arah Angin</span>
                      </div>
                      <p className="text-xl sm:text-2xl font-bold text-[#053040]">
                        {formatNumber(getFirstForecast().wind_direction, 0)}°
                      </p>
                    </div>

                    <div className="bg-cyan-50 p-3 sm:p-4 rounded-xl border border-cyan-200">
                      <div className="flex items-center gap-2 mb-2 sm:mb-3">
                        <Droplets className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-600" />
                        <span className="text-xs font-medium text-cyan-700">Periode Gelombang</span>
                      </div>
                      <p className="text-xl sm:text-2xl font-bold text-[#053040]">
                        {formatNumber(getFirstForecast().wave_period, 1)} s
                      </p>
                    </div>
                  </div>
                </div>

                {/* Tab Navigation */}
                <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                  <div className="flex border-b border-gray-200">
                    <button
                      onClick={() => setActiveTab('forecast')}
                      className={`flex-1 py-3 sm:py-4 px-4 text-sm sm:text-base font-medium transition-colors ${
                        activeTab === 'forecast'
                          ? 'bg-[#053040] text-white'
                          : 'text-gray-600 hover:text-[#053040]'
                      }`}
                    >
                      <div className="flex items-center justify-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span className="hidden xs:inline">Prakiraan Cuaca</span>
                      </div>
                    </button>
                    <button
                      onClick={() => setActiveTab('recommendations')}
                      className={`flex-1 py-3 sm:py-4 px-4 text-sm sm:text-base font-medium transition-colors ${
                        activeTab === 'recommendations'
                          ? 'bg-[#053040] text-white'
                          : 'text-gray-600 hover:text-[#053040]'
                      }`}
                    >
                      <div className="flex items-center justify-center gap-2">
                        <Bot className="w-4 h-4" />
                        <span className="hidden xs:inline">Rekomendasi AI</span>
                      </div>
                    </button>
                  </div>

                  {/* Tab Content */}
                  <div className="p-4 sm:p-6">
                    {activeTab === 'forecast' && (
                      <>
                        {loading.fetch ? (
                          <div className="flex flex-col items-center justify-center gap-3 sm:gap-4 py-6 sm:py-8">
                            <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-2 border-[#053040] border-t-transparent"></div>
                            <p className="text-[#053040] font-medium text-sm sm:text-base">Memuat data prakiraan...</p>
                          </div>
                        ) : recommendationData.forecast_data?.forecast?.length ? (
                          <div className="space-y-4 sm:space-y-6">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
                              <h3 className="text-lg font-bold text-[#053040]">Detail Prakiraan 24 Jam</h3>
                              <div className="text-sm text-gray-600">
                                <p>Sumber data: {recommendationData.forecast_data.data_source || 'tidak diketahui'} | 
                                Diperbarui: {recommendationData.forecast_data.retrieved_at ? 
                                  new Date(recommendationData.forecast_data.retrieved_at).toLocaleString() : 'tidak diketahui'}
                                </p>
                              </div>
                            </div>
                            
                            <div className="overflow-x-auto">
                              <table className="min-w-full bg-white border border-gray-200 rounded-lg overflow-hidden">
                                <thead>
                                  <tr className="bg-gray-50">
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Waktu</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Tinggi Gelombang (m)</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Arah Gelombang (°)</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Kecepatan Angin (knots)</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Arah Angin (°)</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Suhu (°C)</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {recommendationData.forecast_data.forecast.slice(0, 12).map((item, i) => (
                                    <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                      <td className="px-4 py-3 text-sm text-gray-700 font-medium">
                                        {formatTime(item.time)}
                                      </td>
                                      <td className="px-4 py-3 text-sm text-gray-700">{formatNumber(item.wave_height)}</td>
                                      <td className="px-4 py-3 text-sm text-gray-700">{formatNumber(item.wave_direction, 0)}</td>
                                      <td className="px-4 py-3 text-sm text-gray-700">{formatNumber(item.wind_speed)}</td>
                                      <td className="px-4 py-3 text-sm text-gray-700">{formatNumber(item.wind_direction, 0)}</td>
                                      <td className="px-4 py-3 text-sm text-gray-700">{formatNumber(item.temperature)}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        ) : (
                          <div className="text-center py-8">
                            <p className="text-gray-500">Tidak ada data forecast yang tersedia</p>
                          </div>
                        )}
                      </>
                    )}

                    {activeTab === 'recommendations' && (
                      <div className="space-y-4 sm:space-y-6">
                        {/* Safe Windows */}
                        {recommendationData.ai_recommendations?.safe_windows?.length ? (
                          <div>
                            <h3 className="text-lg font-bold text-[#053040] mb-4 flex items-center gap-2">
                              <Clock className="w-5 h-5" />
                              Waktu Berlayar yang Aman
                            </h3>
                            
                            <div className="grid gap-3 sm:gap-4">
                              {recommendationData.ai_recommendations.safe_windows.map((window, i) => (
                                <div key={i} className="bg-blue-50 border border-blue-200 p-4 sm:p-5 rounded-xl">
                                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
                                    <h4 className="font-semibold text-blue-800 text-lg">
                                      {window.start_time} - {window.end_time}
                                    </h4>
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getConfidenceColor(window.confidence)}`}>
                                      {window.confidence}
                                    </span>
                                  </div>
                                  <p className="text-sm text-blue-700 mb-3">{window.reason}</p>
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div className="bg-blue-100 p-3 rounded-lg">
                                      <span className="text-xs font-medium text-blue-600">Kondisi Gelombang:</span>
                                      <p className="font-medium text-blue-800 mt-1">{window.wave_condition}</p>
                                    </div>
                                    <div className="bg-blue-100 p-3 rounded-lg">
                                      <span className="text-xs font-medium text-blue-600">Kondisi Angin:</span>
                                      <p className="font-medium text-blue-800 mt-1">{window.wind_condition}</p>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <div className="text-center py-8">
                            <p className="text-gray-500">Tidak ada rekomendasi waktu aman yang tersedia</p>
                          </div>
                        )}

                        {/* General Advice */}
                        {recommendationData.ai_recommendations?.general_advice && (
                          <div className="bg-yellow-50 border border-yellow-200 p-4 sm:p-5 rounded-xl">
                            <h3 className="text-lg font-bold text-[#053040] mb-3 flex items-center gap-2">
                              <Lightbulb className="w-5 h-5" />
                              Saran untuk Nelayan
                            </h3>
                            <p className="text-sm text-yellow-800 leading-relaxed">
                              {recommendationData.ai_recommendations.general_advice}
                            </p>
                          </div>
                        )}
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