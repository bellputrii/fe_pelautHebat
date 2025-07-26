'use client';

import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import { useState, useEffect } from 'react';
import { Wind, Waves, Gauge, Thermometer, Compass, AlertTriangle, Clock, Ship, Calendar } from 'lucide-react';
import LayoutNavbar from '@/components/LayoutNavbar';
import Footer from '@/components/Footer';
import 'leaflet/dist/leaflet.css';

// Types for API responses
type ConditionData = {
  location: {
    latitude: number;
    longitude: number;
    area_name: string;
  };
  weather_summary: {
    wave_height: number;
    wind_speed: number;
    weather_condition: string;
    overall_safety: string;
  };
  ai_explanation: {
    condition_summary: string;
    safety_advice: string;
    best_practices: string[];
    risk_factors: string[];
  };
};

type RecommendationData = {
  recommendations: {
    date: string;
    time_slots: {
      start_time: string;
      end_time: string;
      safety_score: number;
      weather_conditions: {
        wave_height: number;
        wind_speed: number;
        weather_description: string;
      };
      ai_reasoning: string;
    }[];
  }[];
};

type AnomalyData = {
  anomalies_detected: {
    type: string;
    severity: string;
    date: string;
    time: string;
    description: string;
  }[];
};

export default function KondisiLautPage() {
  const [location, setLocation] = useState({
    lat: -7.801194,
    lng: 110.364917,
    name: "Perairan Manyeuw"
  });
  const [boatType, setBoatType] = useState('kapal_nelayan');
  const [forecastDays, setForecastDays] = useState(1);
  const [conditionData, setConditionData] = useState<ConditionData | null>(null);
  const [recommendationData, setRecommendationData] = useState<RecommendationData | null>(null);
  const [anomalyData, setAnomalyData] = useState<AnomalyData | null>(null);
  const [loading, setLoading] = useState({
    conditions: false,
    recommendations: false,
    anomalies: false
  });
  const [activeTab, setActiveTab] = useState('conditions');
  const [showRecommendationDetail, setShowRecommendationDetail] = useState<{
    date: string;
    timeSlot: any;
  } | null>(null);

  // Map click handler component
  function MapClickHandler() {
    useMapEvents({
      click(e) {
        setLocation({
          lat: e.latlng.lat,
          lng: e.latlng.lng,
          name: "Lokasi yang dipilih"
        });
      }
    });
    return null;
  }

  // Fetch condition data
  const fetchConditions = async () => {
    setLoading(prev => ({ ...prev, conditions: true }));
    try {
      // Simulate API call
      const mockData: ConditionData = {
        location: {
          latitude: location.lat,
          longitude: location.lng,
          area_name: location.name
        },
        weather_summary: {
          wave_height: Math.random() * 3,
          wind_speed: 5 + Math.random() * 15,
          weather_condition: ['Cerah', 'Berawan', 'Hujan Ringan'][Math.floor(Math.random() * 3)],
          overall_safety: ['Aman', 'Waspada', 'Berbahaya'][Math.floor(Math.random() * 3)]
        },
        ai_explanation: {
          condition_summary: `Kondisi laut di ${location.name} saat ini ${['cukup tenang', 'sedang', 'berombak'][Math.floor(Math.random() * 3)]}.`,
          safety_advice: 'Tetap waspada terhadap perubahan cuaca yang cepat.',
          best_practices: [
            'Gunakan pelampung keselamatan',
            'Pantau prakiraan cuaca setiap 2 jam',
            'Hindari area dengan arus kuat'
          ],
          risk_factors: [
            'Kemungkinan hujan sore hari',
            'Angin dapat meningkat hingga 20 km/jam'
          ]
        }
      };
      setConditionData(mockData);
    } catch (error) {
      console.error('Error fetching conditions:', error);
    } finally {
      setLoading(prev => ({ ...prev, conditions: false }));
    }
  };

  // Fetch recommendations
  const fetchRecommendations = async () => {
    setLoading(prev => ({ ...prev, recommendations: true }));
    try {
      // Simulate API call
      const mockData: RecommendationData = {
        recommendations: Array.from({ length: forecastDays }, (_, i) => ({
          date: new Date(Date.now() + i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          time_slots: [
            {
              start_time: '06:00',
              end_time: '10:00',
              safety_score: 80 + Math.floor(Math.random() * 20),
              weather_conditions: {
                wave_height: 0.5 + Math.random() * 1.5,
                wind_speed: 5 + Math.random() * 10,
                weather_description: ['Cerah', 'Berawan'][Math.floor(Math.random() * 2)]
              },
              ai_reasoning: 'Waktu pagi sangat ideal dengan gelombang tenang dan angin sepoi-sepoi.'
            },
            {
              start_time: '16:00',
              end_time: '19:00',
              safety_score: 60 + Math.floor(Math.random() * 30),
              weather_conditions: {
                wave_height: 1 + Math.random() * 2,
                wind_speed: 10 + Math.random() * 10,
                weather_description: ['Berawan', 'Hujan Ringan'][Math.floor(Math.random() * 2)]
              },
              ai_reasoning: 'Sore hari masih cukup aman meskipun gelombang sedikit meningkat.'
            }
          ]
        }))
      };
      setRecommendationData(mockData);
    } catch (error) {
      console.error('Error fetching recommendations:', error);
    } finally {
      setLoading(prev => ({ ...prev, recommendations: false }));
    }
  };

  // Fetch anomalies
  const fetchAnomalies = async () => {
    setLoading(prev => ({ ...prev, anomalies: true }));
    try {
      // Simulate API call
      const mockData: AnomalyData = {
        anomalies_detected: [
          {
            type: 'wave_height_spike',
            severity: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)],
            date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            time: '14:00-18:00',
            description: 'Tinggi gelombang diprediksi naik drastis'
          }
        ]
      };
      setAnomalyData(mockData);
    } catch (error) {
      console.error('Error fetching anomalies:', error);
    } finally {
      setLoading(prev => ({ ...prev, anomalies: false }));
    }
  };

  // Fetch all data when location or filters change
  useEffect(() => {
    fetchConditions();
    fetchRecommendations();
    fetchAnomalies();
  }, [location, boatType, forecastDays]);

  const getSafetyColor = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      default: return 'bg-blue-500';
    }
  };

  return (
    <>
      <LayoutNavbar>
        <div className="min-h-screen pt-20 p-8 bg-white max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-[#053040]">Cek Kondisi Lautmu!</h1>
            <p className="text-sm md:text-base text-[#5c7893] mt-2">
              Dapatkan rekomendasi berlayar yang lebih aman berdasarkan data terkini.
            </p>
          </div>

          {/* Main Content */}
          <div className="grid md:grid-cols-3 gap-6">
            {/* Sidebar */}
            <div className="space-y-6 md:col-span-1 flex flex-col">
              {/* Location Info */}
              <div className="bg-white rounded-xl shadow-sm p-4">
                <h2 className="text-lg font-semibold text-[#053040] border-b pb-2">Lokasi</h2>
                <p className="text-sm text-[#053040] mt-2">{location.name}</p>
                <p className="text-xs text-[#5c7893]">
                  {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
                </p>
              </div>

              {/* Filters */}
              <div className="bg-white rounded-xl shadow-sm p-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#053040] mb-1">Jenis Kapal</label>
                  <select
                    value={boatType}
                    onChange={(e) => setBoatType(e.target.value)}
                    className="w-full border border-gray-200 p-2 rounded-lg text-sm"
                  >
                    <option value="perahu_kecil">Perahu Kecil</option>
                    <option value="kapal_nelayan">Kapal Nelayan</option>
                    <option value="kapal_besar">Kapal Besar</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#053040] mb-1">Durasi Forecast</label>
                  <select
                    value={forecastDays}
                    onChange={(e) => setForecastDays(Number(e.target.value))}
                    className="w-full border border-gray-200 p-2 rounded-lg text-sm"
                  >
                    <option value="1">1 Hari</option>
                    <option value="3">3 Hari</option>
                    <option value="7">7 Hari</option>
                  </select>
                </div>

                <button
                  onClick={() => {
                    fetchConditions();
                    fetchRecommendations();
                    fetchAnomalies();
                  }}
                  className="bg-[#053040] text-white w-full py-2 rounded-lg font-medium flex items-center justify-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                    <path d="M3 3v5h5" />
                    <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
                    <path d="M16 16h5v5" />
                  </svg>
                  Perbarui Data
                </button>
              </div>

              {/* Navigation Tabs */}
              <div className="bg-white rounded-xl shadow-sm p-4">
                <div className="flex border-b">
                  <button
                    onClick={() => setActiveTab('conditions')}
                    className={`px-4 py-2 text-sm font-medium ${activeTab === 'conditions' ? 'text-[#053040] border-b-2 border-[#053040]' : 'text-[#5c7893]'}`}
                  >
                    Kondisi
                  </button>
                  <button
                    onClick={() => setActiveTab('recommendations')}
                    className={`px-4 py-2 text-sm font-medium ${activeTab === 'recommendations' ? 'text-[#053040] border-b-2 border-[#053040]' : 'text-[#5c7893]'}`}
                  >
                    Rekomendasi
                  </button>
                  <button
                    onClick={() => setActiveTab('anomalies')}
                    className={`px-4 py-2 text-sm font-medium ${activeTab === 'anomalies' ? 'text-[#053040] border-b-2 border-[#053040]' : 'text-[#5c7893]'}`}
                  >
                    Anomali
                  </button>
                </div>

                {/* Conditions Tab */}
                {activeTab === 'conditions' && conditionData && (
                  <div className="mt-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-[#053040]">Status Keselamatan</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        conditionData.weather_summary.overall_safety === 'Aman' ? 'bg-green-100 text-green-800' :
                        conditionData.weather_summary.overall_safety === 'Waspada' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {conditionData.weather_summary.overall_safety}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-[#eaf9fd] p-2 rounded-lg">
                        <div className="flex items-center gap-2">
                          <Waves size={16} className="text-[#00698f]" />
                          <span className="text-xs text-[#5c7893]">Gelombang</span>
                        </div>
                        <p className="font-medium text-[#053040]">
                          {conditionData.weather_summary.wave_height.toFixed(1)} m
                        </p>
                      </div>
                      <div className="bg-[#eaf9fd] p-2 rounded-lg">
                        <div className="flex items-center gap-2">
                          <Wind size={16} className="text-[#00698f]" />
                          <span className="text-xs text-[#5c7893]">Angin</span>
                        </div>
                        <p className="font-medium text-[#053040]">
                          {conditionData.weather_summary.wind_speed.toFixed(1)} km/j
                        </p>
                      </div>
                      <div className="bg-[#eaf9fd] p-2 rounded-lg">
                        <div className="flex items-center gap-2">
                          <Thermometer size={16} className="text-[#00698f]" />
                          <span className="text-xs text-[#5c7893]">Cuaca</span>
                        </div>
                        <p className="font-medium text-[#053040]">
                          {conditionData.weather_summary.weather_condition}
                        </p>
                      </div>
                      <div className="bg-[#eaf9fd] p-2 rounded-lg">
                        <div className="flex items-center gap-2">
                          <Compass size={16} className="text-[#00698f]" />
                          <span className="text-xs text-[#5c7893]">Arah</span>
                        </div>
                        <p className="font-medium text-[#053040]">Timur Laut</p>
                      </div>
                    </div>

                    <div className="pt-2">
                      <h4 className="text-sm font-medium text-[#053040]">Saran Keselamatan</h4>
                      <ul className="mt-1 space-y-1 text-sm text-[#5c7893]">
                        {conditionData.ai_explanation.best_practices.map((item, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span>•</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                {/* Recommendations Tab */}
                {activeTab === 'recommendations' && recommendationData && (
                  <div className="mt-4 space-y-4">
                    {recommendationData.recommendations.map((day, i) => (
                      <div key={i} className="space-y-2">
                        <h3 className="font-medium text-[#053040]">
                          {new Date(day.date).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' })}
                        </h3>
                        <div className="space-y-2">
                          {day.time_slots.map((slot, j) => (
                            <div 
                              key={j} 
                              className="p-2 border rounded-lg cursor-pointer hover:bg-gray-50"
                              onClick={() => setShowRecommendationDetail({ date: day.date, timeSlot: slot })}
                            >
                              <div className="flex justify-between items-center">
                                <span className="text-sm font-medium">
                                  {slot.start_time} - {slot.end_time}
                                </span>
                                <div className="flex items-center gap-2">
                                  <span className={`w-3 h-3 rounded-full ${getSafetyColor(slot.safety_score)}`}></span>
                                  <span className="text-xs">{slot.safety_score}</span>
                                </div>
                              </div>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs text-[#5c7893]">
                                  {slot.weather_conditions.weather_description}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Anomalies Tab */}
                {activeTab === 'anomalies' && anomalyData && (
                  <div className="mt-4 space-y-4">
                    {anomalyData.anomalies_detected.length > 0 ? (
                      anomalyData.anomalies_detected.map((anomaly, i) => (
                        <div key={i} className="p-3 border rounded-lg">
                          <div className="flex items-start gap-3">
                            <div className={`w-3 h-3 rounded-full mt-1 ${getSeverityColor(anomaly.severity)}`}></div>
                            <div>
                              <h4 className="text-sm font-medium text-[#053040]">
                                {anomaly.type === 'wave_height_spike' ? 'Lonjakan Gelombang' : 'Perubahan Pola Angin'}
                              </h4>
                              <p className="text-xs text-[#5c7893]">
                                {anomaly.date} • {anomaly.time}
                              </p>
                              <p className="text-sm mt-1">{anomaly.description}</p>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-4 text-sm text-[#5c7893]">
                        Tidak ada anomali terdeteksi
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Map and Main Content */}
            <div className="md:col-span-2 space-y-6">
              {/* Map */}
              <div className="h-[400px] w-full rounded-xl overflow-hidden shadow-md bg-white border border-gray-100">
                <MapContainer 
                  center={[location.lat, location.lng]} 
                  zoom={13} 
                  style={{ height: '100%', width: '100%' }}
                  className="z-0"
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  />
                  <Marker position={[location.lat, location.lng]}>
                    <Popup>{location.name}</Popup>
                  </Marker>
                  <MapClickHandler />
                </MapContainer>
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
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {conditionData.ai_explanation.condition_summary}
                  </p>
                  <div className="mt-3">
                    <h4 className="text-sm font-medium text-[#053040]">Faktor Risiko:</h4>
                    <ul className="mt-1 space-y-1 text-sm text-[#5c7893]">
                      {conditionData.ai_explanation.risk_factors.map((risk, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span>•</span>
                          <span>{risk}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recommendation Detail Modal */}
        {showRecommendationDetail && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold text-[#053040]">
                  Detail Rekomendasi
                </h3>
                <button 
                  onClick={() => setShowRecommendationDetail(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  &times;
                </button>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Calendar size={20} className="text-[#00698f]" />
                  <div>
                    <p className="text-sm text-[#5c7893]">Tanggal</p>
                    <p className="font-medium text-[#053040]">
                      {new Date(showRecommendationDetail.date).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Clock size={20} className="text-[#00698f]" />
                  <div>
                    <p className="text-sm text-[#5c7893]">Waktu</p>
                    <p className="font-medium text-[#053040]">
                      {showRecommendationDetail.timeSlot.start_time} - {showRecommendationDetail.timeSlot.end_time}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Ship size={20} className="text-[#00698f]" />
                  <div>
                    <p className="text-sm text-[#5c7893]">Jenis Kapal</p>
                    <p className="font-medium text-[#053040]">
                      {boatType === 'perahu_kecil' ? 'Perahu Kecil' : 
                       boatType === 'kapal_nelayan' ? 'Kapal Nelayan' : 'Kapal Besar'}
                    </p>
                  </div>
                </div>

                <div className="bg-[#eaf9fd] p-4 rounded-lg">
                  <h4 className="text-sm font-medium text-[#053040] mb-2">Kondisi Cuaca</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <p className="text-xs text-[#5c7893]">Gelombang</p>
                      <p className="font-medium">
                        {showRecommendationDetail.timeSlot.weather_conditions.wave_height.toFixed(1)} m
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-[#5c7893]">Angin</p>
                      <p className="font-medium">
                        {showRecommendationDetail.timeSlot.weather_conditions.wind_speed.toFixed(1)} km/j
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-[#5c7893]">Cuaca</p>
                      <p className="font-medium">
                        {showRecommendationDetail.timeSlot.weather_conditions.weather_description}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-[#5c7893]">Safety Score</p>
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${getSafetyColor(showRecommendationDetail.timeSlot.safety_score)}`}></div>
                        <span>{showRecommendationDetail.timeSlot.safety_score}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-[#053040] mb-2">Analisis AI</h4>
                  <p className="text-sm text-[#5c7893]">
                    {showRecommendationDetail.timeSlot.ai_reasoning}
                  </p>
                </div>

                <button
                  onClick={() => setShowRecommendationDetail(null)}
                  className="w-full bg-[#053040] text-white py-2 rounded-lg mt-4"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        )}
      </LayoutNavbar>
      <Footer />
    </>
  );
}