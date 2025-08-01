'use client';

import dynamic from "next/dynamic";
import { useState, useEffect } from 'react';
import { Waves, Wind, AlertTriangle, Clock, ChevronDown, Bot, AlertCircle } from 'lucide-react';
import { auth } from "@/firebase/config";

import LayoutNavbar from '@/components/LayoutNavbar';
import Footer from '@/components/Footer';

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

type RecommendationData = {
  coordinates: {
    latitude: number;
    longitude: number;
  };
  location_string: string;
  boat_type: string;
  parameters: {
    forecast_hours: number;
    timezone: string;
  };
  forecast_data: {
    location: {
      latitude: number;
      longitude: number;
    };
    forecast_hours: number;
    forecast: Array<{
      time: string;
      wave_height: number;
      wave_direction: number;
      wave_period: number;
      wind_wave_height: number;
      wind_wave_direction: number;
      wind_wave_period: number;
      swell_wave_height: number;
      swell_wave_direction: number;
      swell_wave_period: number;
      wind_speed: number;
      wind_direction: number;
      wind_gusts: number;
      temperature: number;
      pressure: number;
    }>;
    retrieved_at: string;
    data_source: string;
  };
  ai_recommendations: {
    boat_type: string;
    safe_windows: Array<{
      start_time: string;
      end_time: string;
      confidence: string;
      reason: string;
      wave_condition: string;
      wind_condition: string;
    }>;
    avoid_times: Array<any>;
    best_recommendation: string;
    general_advice: string;
  };
  generated_at: string;
};

type AnomalyData = {
  coordinates: {
    latitude: number;
    longitude: number;
  };
  location_string: string;
  parameters: {
    historical_days: number;
    timezone: string;
    sensitivity: string;
  };
  current_data: any;
  historical_data: {
    period_days: number;
    data_source: string;
    data_points: number;
  };
  anomaly_analysis: {
    alert_level: string;
    detected_anomalies: any[];
    prediction: {
      event_type: string;
      probability: string;
      estimated_time: string;
      impact_area: string;
    };
    recommendations: string[];
  };
  analyzed_at: string;
};

const BOAT_TYPES = [
  { value: 'perahu_kecil', label: 'Perahu Kecil' },
  { value: 'kapal_nelayan', label: 'Kapal Nelayan' },
  { value: 'kapal_besar', label: 'Kapal Besar' }
];

export default function KondisiLautPage() {
  const [location, setLocation] = useState({
    lat: -6.8,
    lng: 106.8,
  });
  const [conditionData, setConditionData] = useState<ConditionData | null>(null);
  const [recommendationData, setRecommendationData] = useState<RecommendationData | null>(null);
  const [anomalyData, setAnomalyData] = useState<AnomalyData | null>(null);
  const [loading, setLoading] = useState({
    conditions: false,
    recommendations: false,
    submit: false,
    anomalies: false
  });
  const [manualInput, setManualInput] = useState({
    lat: '-6.8',
    lng: '106.8'
  });
  const [authError, setAuthError] = useState('');
  const [mapReady, setMapReady] = useState(false);
  const [selectedBoatType, setSelectedBoatType] = useState(BOAT_TYPES[0].value);
  const [showRecommendations, setShowRecommendations] = useState(false);

  const fetchConditions = async () => {
    setLoading(prev => ({...prev, conditions: true}));
    setAuthError('');

    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        setAuthError("Anda perlu login terlebih dahulu.");
        setLoading(prev => ({...prev, conditions: false}));
        return;
      }

      const idToken = await currentUser.getIdToken();

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
      setLoading(prev => ({...prev, conditions: false}));
    }
  };

  const fetchAnomalies = async () => {
    setLoading(prev => ({...prev, anomalies: true}));
    setAuthError('');

    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        setAuthError("Anda perlu login terlebih dahulu.");
        setLoading(prev => ({...prev, anomalies: false}));
        return;
      }

      const idToken = await currentUser.getIdToken();

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/ai/detect-anomalies`, {
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
        setAnomalyData(data.data);
      } else {
        setAuthError(data.message || 'Gagal memuat data anomali');
      }
    } catch (error) {
      console.error('Error fetching anomalies:', error);
      setAuthError('Terjadi kesalahan saat menghubungi server');
    } finally {
      setLoading(prev => ({...prev, anomalies: false}));
    }
  };

  const fetchAllData = async () => {
    await Promise.all([
      fetchConditions(),
      fetchAnomalies()
    ]);
  };

  const fetchTimeRecommendations = async () => {
    setLoading(prev => ({...prev, recommendations: true}));
    setAuthError('');

    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        setAuthError("Anda perlu login terlebih dahulu.");
        setLoading(prev => ({...prev, recommendations: false}));
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
          latitude: location.lat,
          longitude: location.lng,
          boat_type: selectedBoatType
        })
      });

      if (response.status === 401) {
        setAuthError('Sesi Anda telah habis, silakan login kembali');
        return;
      }

      const data = await response.json();
      if (data.success) {
        setRecommendationData(data.data);
        setShowRecommendations(true);
      } else {
        setAuthError(data.message || 'Gagal memuat rekomendasi');
      }
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      setAuthError('Terjadi kesalahan saat menghubungi server');
    } finally {
      setLoading(prev => ({...prev, recommendations: false}));
    }
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(prev => ({...prev, submit: true}));
    
    const lat = parseFloat(manualInput.lat);
    const lng = parseFloat(manualInput.lng);
    
    if (!isNaN(lat) && !isNaN(lng)) {
      setLocation({ lat, lng });
      await fetchAllData();
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

  useEffect(() => {
    if (mapReady) {
      fetchAllData();
    }
  }, [mapReady]);

  const getSafetyColor = (level: string) => {
    switch (level) {
      case 'AMAN': return 'bg-green-100 text-green-800';
      case 'WASPADA': return 'bg-yellow-100 text-yellow-800';
      case 'BAHAYA': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatTime = (timeString: string) => {
    return new Date(timeString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <>
      <LayoutNavbar>
        <div className="min-h-screen pt-20 p-4 md:p-6 bg-white max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl md:text-3xl font-bold text-[#053040]">Cek Kondisi Laut</h1>
            <p className="text-sm text-[#5c7893] mt-1">
              Masukkan koordinat atau klik pada peta untuk mendapatkan analisis kondisi laut
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
              {/* Coordinate Input Card */}
              <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
                <h2 className="text-lg font-semibold text-[#053040] mb-3">Koordinat</h2>
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
                    {loading.submit ? 'Memuat...' : 'Cek Kondisi'}
                  </button>
                </form>
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
                    onClick={fetchTimeRecommendations}
                    className="flex items-center justify-center gap-2 bg-[#053040] text-white w-full py-2 rounded-lg font-medium hover:bg-[#064261] transition-colors disabled:opacity-50"
                    disabled={loading.recommendations}
                  >
                    <Clock size={16} />
                    {loading.recommendations ? 'Memuat...' : 'Rekomendasi Waktu'}
                  </button>
                </div>
              </div>

              {/* Quick Status Card */}
              {conditionData && (
                <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
                  <h2 className="text-lg font-semibold text-[#053040] mb-3 flex items-center gap-2">
                    <Bot size={18} />
                    Status Cepat
                  </h2>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-[#5c7893]">Keamanan</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSafetyColor(conditionData.ai_explanation.safety_level)}`}>
                        {conditionData.ai_explanation.safety_level}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-[#eaf9fd] p-2 rounded-lg">
                        <div className="flex items-center gap-2">
                          <Waves size={14} className="text-[#00698f]" />
                          <span className="text-xs text-[#5c7893]">Gelombang</span>
                        </div>
                        <p className="font-medium text-[#053040] text-sm">
                          {conditionData.weather_data.hourly.wave_height[0]} {conditionData.weather_data.units.wave_height}
                        </p>
                      </div>
                      <div className="bg-[#eaf9fd] p-2 rounded-lg">
                        <div className="flex items-center gap-2">
                          <Wind size={14} className="text-[#00698f]" />
                          <span className="text-xs text-[#5c7893]">Arah</span>
                        </div>
                        <p className="font-medium text-[#053040] text-sm">
                          {conditionData.weather_data.hourly.wave_direction[0]}°
                        </p>
                      </div>
                    </div>
                    
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <p className="text-sm text-blue-800">
                        {conditionData.ai_explanation.simple_advice}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Main Content Area */}
            <div className="lg:col-span-3 space-y-4">
              {/* Map Section */}
              <div className="h-[300px] md:h-[350px] w-full rounded-lg overflow-hidden shadow-md bg-white border border-gray-100">
                <LeafletMap 
                  center={[location.lat, location.lng]} 
                  zoom={11}
                  onClick={handleMapClick}
                  // onMapReady={() => setMapReady(true)}
                />
              </div>

              {/* Data Sections */}
              {conditionData && (
                <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="bg-[#053040] p-2 rounded-lg">
                      <Waves size={18} className="text-white" />
                    </div>
                    <h2 className="text-lg font-semibold text-[#053040]">Analisis Kondisi Laut</h2>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-sm font-medium text-[#053040] mb-2">Penjelasan Kondisi</h3>
                      <p className="text-sm text-gray-700 leading-relaxed">
                        {conditionData.ai_explanation.explanation}
                      </p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-[#053040] mb-2">Konteks Lokal</h3>
                      <p className="text-sm text-gray-700 leading-relaxed">
                        {conditionData.ai_explanation.local_context}
                      </p>
                    </div>
                  </div>
                  
                  <div className="mt-4 bg-[#f8fafc] p-3 rounded-lg">
                    <h3 className="text-sm font-medium text-[#053040] mb-2">Ringkasan Teknis</h3>
                    <p className="text-sm text-gray-700">
                      {conditionData.ai_explanation.technical_summary}
                    </p>
                  </div>
                </div>
              )}

              {/* Anomalies Section */}
              {anomalyData && (
                <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`p-2 rounded-lg ${
                      anomalyData.anomaly_analysis.alert_level === 'TINGGI' ? 'bg-red-500' :
                      anomalyData.anomaly_analysis.alert_level === 'SEDANG' ? 'bg-yellow-500' :
                      'bg-green-500'
                    }`}>
                      <AlertCircle size={18} className="text-white" />
                    </div>
                    <h2 className="text-lg font-semibold text-[#053040]">
                      Deteksi Anomali - Level {anomalyData.anomaly_analysis.alert_level}
                    </h2>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-sm font-medium text-[#053040] mb-2">Prediksi</h3>
                      <div className="bg-[#f8fafc] p-3 rounded-lg">
                        <p className="text-sm font-medium text-[#053040]">
                          {anomalyData.anomaly_analysis.prediction.event_type}
                        </p>
                        <div className="grid grid-cols-2 gap-2 mt-2">
                          <div>
                            <span className="text-xs text-[#5c7893]">Probabilitas:</span>
                            <p className="text-sm font-medium text-[#053040]">
                              {anomalyData.anomaly_analysis.prediction.probability}
                            </p>
                          </div>
                          <div>
                            <span className="text-xs text-[#5c7893]">Area Dampak:</span>
                            <p className="text-sm font-medium text-[#053040]">
                              {anomalyData.anomaly_analysis.prediction.impact_area}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-[#053040] mb-2">Rekomendasi</h3>
                      <div className="bg-[#f8fafc] p-3 rounded-lg">
                        <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                          {anomalyData.anomaly_analysis.recommendations.map((rec, i) => (
                            <li key={i}>{rec}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                  
                  {anomalyData.anomaly_analysis.detected_anomalies.length > 0 && (
                    <div className="mt-4">
                      <h3 className="text-sm font-medium text-[#053040] mb-2">Anomali Terdeteksi</h3>
                      <div className="bg-red-50 border border-red-100 p-3 rounded-lg">
                        <ul className="list-disc list-inside text-sm text-red-700 space-y-1">
                          {anomalyData.anomaly_analysis.detected_anomalies.map((anomaly, i) => (
                            <li key={i}>{anomaly.description}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Recommendations Section */}
              {showRecommendations && recommendationData && (
                <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="bg-[#053040] p-2 rounded-lg">
                      <Clock size={18} className="text-white" />
                    </div>
                    <h2 className="text-lg font-semibold text-[#053040]">
                      Rekomendasi Waktu Berlayar
                    </h2>
                  </div>

                  <div className="flex items-center justify-between">
                        <h3 className="font-medium text-[#053040]"></h3>
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {BOAT_TYPES.find(t => t.value === recommendationData.boat_type)?.label}
                        </span>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-sm font-medium text-[#053040] mb-2">Rekomendasi Terbaik</h3>
                      <div className="bg-green-50 border border-green-100 p-3 rounded-lg">
                        <p className="text-sm text-green-800">
                          {recommendationData.ai_recommendations.best_recommendation}
                        </p>
                      </div>
                      
                      <h3 className="text-sm font-medium text-[#053040] mt-4 mb-2">Waktu Aman</h3>
                      <div className="space-y-2">
                        {recommendationData.ai_recommendations.safe_windows.map((window, i) => (
                          <div key={i} className="bg-blue-50 border border-blue-100 p-3 rounded-lg">
                            <div className="flex justify-between items-center">
                              <span className="font-medium text-blue-800 text-sm">
                                {window.start_time} - {window.end_time}
                              </span>
                              <span className={`text-xs px-2 py-1 rounded-full ${
                                window.confidence === 'TINGGI' ? 'bg-green-100 text-green-800' :
                                window.confidence === 'SEDANG' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-blue-100 text-blue-800'
                              }`}>
                                {window.confidence}
                              </span>
                            </div>
                            <p className="text-xs text-blue-700 mt-1">{window.reason}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-[#053040] mb-2">Saran Umum</h3>
                      <div className="bg-yellow-50 border border-yellow-100 p-3 rounded-lg">
                        <p className="text-sm text-yellow-800">
                          {recommendationData.ai_recommendations.general_advice}
                        </p>
                      </div>
                      
                      {recommendationData.ai_recommendations.avoid_times.length > 0 && (
                        <>
                          <h3 className="text-sm font-medium text-[#053040] mt-4 mb-2">Waktu Berbahaya</h3>
                          <div className="bg-red-50 border border-red-100 p-3 rounded-lg">
                            <ul className="list-disc list-inside text-sm text-red-700 space-y-1">
                              {recommendationData.ai_recommendations.avoid_times.map((time, i) => (
                                <li key={i}>{time}</li>
                              ))}
                            </ul>
                          </div>
                        </>
                      )}
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