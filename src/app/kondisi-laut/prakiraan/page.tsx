'use client';

import { useState, useEffect } from 'react';
import { Waves, Wind, Clock, ChevronDown, Bot, MapPin } from 'lucide-react';
import { auth } from "@/firebase/config";
import { useRouter } from 'next/navigation';
import LayoutNavbar from '@/components/LayoutNavbar';
import Footer from '@/components/Footer';

type ForecastData = {
  time: string;
  wave_height: number;
  wind_speed: number;
  wind_direction: number;
  temperature: number;
  pressure: number;
};

type RecommendationData = {
  coordinates: {
    latitude: number;
    longitude: number;
  };
  location_string: string;
  boat_type: string;
  forecast_data: {
    forecast: ForecastData[];
  };
  ai_recommendations: {
    safe_windows: Array<{
      start_time: string;
      end_time: string;
      confidence: string;
      reason: string;
      wave_condition: string;
      wind_condition: string;
    }>;
    best_recommendation: string;
    general_advice: string;
  };
};

const BOAT_TYPES = [
  { value: 'perahu_kecil', label: 'Perahu Kecil' },
  { value: 'kapal_nelayan', label: 'Kapal Nelayan' },
  { value: 'kapal_besar', label: 'Kapal Besar' }
];

export default function PrakiraanPage() {
  const [location, setLocation] = useState({
    lat: -6.8,
    lng: 106.8,
  });
  const [manualInput, setManualInput] = useState({
    lat: '-6.8',
    lng: '106.8'
  });
  const [recommendationData, setRecommendationData] = useState<RecommendationData | null>(null);
  const [loading, setLoading] = useState({
    fetch: false,
    submit: false
  });
  const [selectedBoatType, setSelectedBoatType] = useState(BOAT_TYPES[0].value);
  const [authError, setAuthError] = useState('');
  const router = useRouter();

  const fetchTimeRecommendations = async (lat: number, lng: number) => {
    setLoading(prev => ({...prev, fetch: true}));
    setAuthError('');

    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        setAuthError("Anda perlu login terlebih dahulu.");
        setLoading(prev => ({...prev, fetch: false}));
        return;
      }

      const idToken = await currentUser.getIdToken();

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/ai/recommend-times`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          latitude: lat,
          longitude: lng,
          boat_type: selectedBoatType
        })
      });

      if (response.status === 401) {
        setAuthError('Sesi Anda telah habis, silakan login kembali');
        return;
      }

      const textResponse = await response.text();
      let cleanJson = textResponse.replace(/^```json|```$/g, '').trim();
      
      const data = JSON.parse(cleanJson);
      if (data.success) {
        setRecommendationData(data.data);
        setLocation({ lat: data.data.coordinates.latitude, lng: data.data.coordinates.longitude });
        setManualInput({
          lat: data.data.coordinates.latitude.toString(),
          lng: data.data.coordinates.longitude.toString()
        });
      } else {
        setAuthError(data.message || 'Gagal memuat rekomendasi');
      }
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      setAuthError('Terjadi kesalahan saat menghubungi server');
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

  useEffect(() => {
    fetchTimeRecommendations(location.lat, location.lng);
  }, []);

  const formatTime = (timeString: string) => {
    return new Date(timeString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <>
      <LayoutNavbar>
        <div className="min-h-screen pt-20 p-8 bg-white max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl md:text-3xl font-bold text-[#053040]">Prakiraan Cuaca Laut</h1>
            <p className="text-sm text-[#5c7893] mt-1">
              Analisis kondisi laut dan rekomendasi waktu berlayar berdasarkan jenis kapal Anda
            </p>
          </div>

          {authError && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded">
              <p>{authError}</p>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Left Sidebar - Controls */}
            <div className="lg:col-span-1 space-y-4">
              {/* Location Card */}
              <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
                <h2 className="text-lg font-semibold text-[#053040] mb-3 flex items-center gap-2">
                  <MapPin size={18} />
                  Lokasi
                </h2>
                <form onSubmit={handleManualSubmit} className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-[#053040] mb-1">Latitude</label>
                    <input
                      type="text"
                      value={manualInput.lat}
                      onChange={(e) => setManualInput({...manualInput, lat: e.target.value})}
                      className="w-full border border-gray-200 p-2 rounded-lg text-sm focus:ring-2 focus:ring-[#053040] focus:border-transparent"
                      placeholder="-6.8"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#053040] mb-1">Longitude</label>
                    <input
                      type="text"
                      value={manualInput.lng}
                      onChange={(e) => setManualInput({...manualInput, lng: e.target.value})}
                      className="w-full border border-gray-200 p-2 rounded-lg text-sm focus:ring-2 focus:ring-[#053040] focus:border-transparent"
                      placeholder="106.8"
                    />
                  </div>
                  <button
                    type="submit"
                    className="bg-[#053040] text-white w-full py-2 rounded-lg font-medium hover:bg-[#064261] transition-colors disabled:opacity-50"
                    disabled={loading.submit}
                  >
                    {loading.submit ? 'Memuat...' : 'Atur Lokasi'}
                  </button>
                </form>
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <span className="text-sm text-[#5c7893]">Koordinat saat ini:</span>
                  <p className="font-medium text-[#053040]">
                    {location.lat}, {location.lng}
                  </p>
                </div>
              </div>

              {/* Boat Type Card */}
              <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
                <h2 className="text-lg font-semibold text-[#053040] mb-3">Jenis Kapal</h2>
                <div className="space-y-3">
                  <div className="relative">
                    <select
                      value={selectedBoatType}
                      onChange={(e) => setSelectedBoatType(e.target.value)}
                      className="appearance-none w-full border border-gray-200 p-2 rounded-lg text-sm focus:ring-2 focus:ring-[#053040] focus:border-transparent pr-8"
                    >
                      {BOAT_TYPES.map((type) => (
                        <option key={type.value} value={type.value}>{type.label}</option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                      <ChevronDown size={16} className="text-gray-500" />
                    </div>
                  </div>
                  <button
                    onClick={() => fetchTimeRecommendations(location.lat, location.lng)}
                    className="flex items-center justify-center gap-2 bg-[#053040] text-white w-full py-2 rounded-lg font-medium hover:bg-[#064261] transition-colors disabled:opacity-50"
                    disabled={loading.fetch}
                  >
                    <Clock size={16} />
                    {loading.fetch ? 'Memuat...' : 'Perbarui Rekomendasi'}
                  </button>
                </div>
              </div>

              {/* Quick Summary Card */}
              {recommendationData?.ai_recommendations && (
                <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
                  <h2 className="text-lg font-semibold text-[#053040] mb-3 flex items-center gap-2">
                    <Bot size={18} />
                    Rekomendasi Singkat
                  </h2>
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <p className="text-sm text-blue-800">
                      {recommendationData.ai_recommendations.best_recommendation}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Main Content Area */}
            <div className="lg:col-span-3 space-y-4">
              {/* Current Conditions */}
              <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
                <h2 className="text-lg font-semibold text-[#053040] mb-4">Kondisi Saat Ini</h2>
                
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="bg-[#f8fafc] p-3 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Wind size={16} className="text-[#00698f]" />
                      <span className="text-sm font-medium text-[#053040]">Kecepatan Angin</span>
                    </div>
                    <p className="text-2xl font-bold mt-2 text-[#053040]">
                      {recommendationData?.forecast_data?.forecast[0]?.wind_speed?.toFixed(1) || '-'} knots
                    </p>
                  </div>
                  
                  <div className="bg-[#f8fafc] p-3 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Waves size={16} className="text-[#00698f]" />
                      <span className="text-sm font-medium text-[#053040]">Tinggi Gelombang</span>
                    </div>
                    <p className="text-2xl font-bold mt-2 text-[#053040]">
                      {recommendationData?.forecast_data?.forecast[0]?.wave_height?.toFixed(1) || '-'} m
                    </p>
                  </div>
                  
                  <div className="bg-[#f8fafc] p-3 rounded-lg">
                    <span className="text-sm font-medium text-[#053040]">Suhu</span>
                    <p className="text-2xl font-bold mt-2 text-[#053040]">
                      {recommendationData?.forecast_data?.forecast[0]?.temperature?.toFixed(1) || '-'} °C
                    </p>
                  </div>
                  
                  <div className="bg-[#f8fafc] p-3 rounded-lg">
                    <span className="text-sm font-medium text-[#053040]">Tekanan Atmosfer</span>
                    <p className="text-2xl font-bold mt-2 text-[#053040]">
                      {recommendationData?.forecast_data?.forecast[0]?.pressure?.toFixed(1) || '-'} hPa
                    </p>
                  </div>
                  
                  <div className="bg-[#f8fafc] p-3 rounded-lg">
                    <span className="text-sm font-medium text-[#053040]">Arah Angin</span>
                    <p className="text-2xl font-bold mt-2 text-[#053040]">
                      {recommendationData?.forecast_data?.forecast[0]?.wind_direction?.toFixed(0) || '-'}°
                    </p>
                  </div>
                </div>
              </div>

              {/* Forecast Table */}
              {recommendationData?.forecast_data && (
                <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
                  <h2 className="text-lg font-semibold text-[#053040] mb-4">Detail Prakiraan</h2>
                  
                  <div className="overflow-x-auto">
                    <table className="min-w-full bg-white border border-gray-200">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Waktu</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Kecepatan Angin (knots)</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Tinggi Gelombang (m)</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Arah Angin (°)</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Suhu (°C)</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Tekanan (hPa)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {recommendationData.forecast_data.forecast.slice(0, 12).map((item, i) => (
                          <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                            <td className="px-4 py-2 text-sm text-gray-700">
                              {formatTime(item.time)}
                            </td>
                            <td className="px-4 py-2 text-sm text-gray-700">{item.wind_speed.toFixed(1)}</td>
                            <td className="px-4 py-2 text-sm text-gray-700">{item.wave_height.toFixed(1)}</td>
                            <td className="px-4 py-2 text-sm text-gray-700">{item.wind_direction.toFixed(0)}</td>
                            <td className="px-4 py-2 text-sm text-gray-700">{item.temperature.toFixed(1)}</td>
                            <td className="px-4 py-2 text-sm text-gray-700">{item.pressure.toFixed(1)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Safe Windows */}
              {recommendationData?.ai_recommendations?.safe_windows && (
                <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
                  <h2 className="text-lg font-semibold text-[#053040] mb-4">Waktu Berlayar yang Aman</h2>
                  
                  <div className="space-y-3">
                    {recommendationData.ai_recommendations.safe_windows.map((window, i) => (
                      <div key={i} className="bg-blue-50 border border-blue-100 p-4 rounded-lg">
                        <div className="flex justify-between items-center">
                          <h3 className="font-medium text-blue-800">
                            {window.start_time} - {window.end_time}
                          </h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            window.confidence === 'TINGGI' ? 'bg-green-100 text-green-800' :
                            window.confidence === 'SEDANG' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {window.confidence}
                          </span>
                        </div>
                        <p className="text-sm text-blue-700 mt-2">{window.reason}</p>
                        <div className="grid grid-cols-2 gap-4 mt-3">
                          <div className="bg-blue-100 p-2 rounded">
                            <span className="text-xs text-blue-600">Kondisi Gelombang:</span>
                            <p className="font-medium text-blue-800">{window.wave_condition}</p>
                          </div>
                          <div className="bg-blue-100 p-2 rounded">
                            <span className="text-xs text-blue-600">Kondisi Angin:</span>
                            <p className="font-medium text-blue-800">{window.wind_condition}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* General Advice */}
              {recommendationData?.ai_recommendations?.general_advice && (
                <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
                  <h2 className="text-lg font-semibold text-[#053040] mb-4">Saran untuk Nelayan</h2>
                  <div className="bg-yellow-50 border border-yellow-100 p-4 rounded-lg">
                    <p className="text-sm text-yellow-800">
                      {recommendationData.ai_recommendations.general_advice}
                    </p>
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