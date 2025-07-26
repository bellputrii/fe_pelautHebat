'use client';

import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import { useState, useEffect } from 'react';
import { Wind, Waves, Gauge, Thermometer, Compass, AlertTriangle, Clock, Ship, Calendar, MapPin, Navigation } from 'lucide-react';
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
  const [manualLat, setManualLat] = useState("-7.801194");
  const [manualLng, setManualLng] = useState("110.364917");
  const [boatType, setBoatType] = useState('kapal_nelayan');
  const [forecastDays, setForecastDays] = useState(1);
  const [conditionData, setConditionData] = useState<ConditionData | null>(null);
  const [recommendationData, setRecommendationData] = useState<RecommendationData | null>(null);
  const [anomalyData, setAnomalyData] = useState<AnomalyData | null>(null);
  const [loading, setLoading] = useState({
    conditions: false,
    recommendations: false,
    anomalies: false,
    geocode: false
  });
  const [activeTab, setActiveTab] = useState('conditions');
  const [showRecommendationDetail, setShowRecommendationDetail] = useState<{
    date: string;
    timeSlot: any;
  } | null>(null);

  // Reverse geocode to get location name
  const reverseGeocode = async (lat: number, lng: number) => {
    setLoading(prev => ({ ...prev, geocode: true }));
    try {
      // Simulate API call with more realistic location names based on coordinates
      let locationName = "Perairan Tidak Dikenal";
      
      // Simple coordinate-based location naming
      if (lat > -7.9 && lat < -7.7 && lng > 110.3 && lng < 110.4) {
        locationName = "Perairan Manyeuw";
      } else if (lat > -6.2 && lat < -5.8 && lng > 106.7 && lng < 107.0) {
        locationName = "Laut Jawa";
      } else if (lat > -6.5 && lat < -5.5 && lng > 105.5 && lng < 106.5) {
        locationName = "Selat Sunda";
      } else if (lat > -6.1 && lat < -5.9 && lng > 106.7 && lng < 106.9) {
        locationName = "Perairan Jakarta Utara";
      } else if (lat > -5.5 && lat < -5.0 && lng > 106.3 && lng < 106.7) {
        locationName = "Kepulauan Seribu";
      } else {
        // For other coordinates, generate a more generic name
        const directions = ['Utara', 'Selatan', 'Timur', 'Barat'];
        const randomDirection = directions[Math.floor(Math.random() * directions.length)];
        locationName = `Perairan ${randomDirection}`;
      }
      
      setLocation(prev => ({
        ...prev,
        name: locationName
      }));
      
      // Update the condition data with the new location name
      if (conditionData) {
        setConditionData({
          ...conditionData,
          location: {
            ...conditionData.location,
            latitude: lat,
            longitude: lng,
            area_name: locationName
          }
        });
      }
    } catch (error) {
      console.error('Error in reverse geocoding:', error);
    } finally {
      setLoading(prev => ({ ...prev, geocode: false }));
    }
  };

  // Update location from manual input
  const updateLocationFromInput = () => {
    const lat = parseFloat(manualLat);
    const lng = parseFloat(manualLng);
    
    if (!isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
      setLocation({
        lat,
        lng,
        name: "Memuat nama lokasi..."
      });
      setManualLat(lat.toString());
      setManualLng(lng.toString());
      reverseGeocode(lat, lng);
      
      // Fetch new data for the updated location
      fetchConditions(lat, lng);
      fetchRecommendations(lat, lng);
      fetchAnomalies(lat, lng);
    } else {
      alert("Masukkan koordinat yang valid. Latitude harus antara -90 sampai 90 dan Longitude antara -180 sampai 180.");
    }
  };

  // Handle Enter key press in input fields
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      updateLocationFromInput();
    }
  };

  // Map click handler component
  function MapClickHandler() {
    useMapEvents({
      click(e) {
        const newLat = e.latlng.lat;
        const newLng = e.latlng.lng;
        setLocation({
          lat: newLat,
          lng: newLng,
          name: "Memuat nama lokasi..."
        });
        setManualLat(newLat.toString());
        setManualLng(newLng.toString());
        reverseGeocode(newLat, newLng);
        
        // Fetch new data for the clicked location
        fetchConditions(newLat, newLng);
        fetchRecommendations(newLat, newLng);
        fetchAnomalies(newLat, newLng);
      }
    });
    return null;
  }

  // Fetch condition data
  const fetchConditions = async (lat?: number, lng?: number) => {
    setLoading(prev => ({ ...prev, conditions: true }));
    try {
      // Use provided coordinates or current location
      const targetLat = lat !== undefined ? lat : location.lat;
      const targetLng = lng !== undefined ? lng : location.lng;
      const targetName = location.name;
      
      // Simulate API call with more realistic data based on location
      const waveHeight = Math.random() * 3;
      const windSpeed = 5 + Math.random() * 15;
      
      let weatherCondition, overallSafety;
      if (waveHeight < 1 && windSpeed < 10) {
        weatherCondition = 'Cerah';
        overallSafety = 'Aman';
      } else if (waveHeight < 2 && windSpeed < 20) {
        weatherCondition = 'Berawan';
        overallSafety = 'Waspada';
      } else {
        weatherCondition = 'Hujan Ringan';
        overallSafety = 'Berbahaya';
      }
      
      const mockData: ConditionData = {
        location: {
          latitude: targetLat,
          longitude: targetLng,
          area_name: targetName
        },
        weather_summary: {
          wave_height: waveHeight,
          wind_speed: windSpeed,
          weather_condition: weatherCondition,
          overall_safety: overallSafety
        },
        ai_explanation: {
          condition_summary: `Kondisi laut di ${targetName} saat ini ${waveHeight < 1 ? 'sangat tenang' : waveHeight < 2 ? 'sedang' : 'berombak'}. Kecepatan angin ${windSpeed < 10 ? 'rendah' : windSpeed < 20 ? 'sedang' : 'tinggi'}.`,
          safety_advice: overallSafety === 'Aman' ? 'Kondisi aman untuk berlayar.' : overallSafety === 'Waspada' ? 'Perhatikan kondisi cuaca dan gunakan alat keselamatan.' : 'Disarankan tidak berlayar kecuali sangat penting.',
          best_practices: [
            'Gunakan pelampung keselamatan',
            'Pantau prakiraan cuaca secara berkala',
            overallSafety !== 'Aman' ? 'Hindari area dengan arus kuat' : 'Pastikan peralatan navigasi berfungsi'
          ],
          risk_factors: [
            waveHeight > 1.5 ? 'Gelombang cukup tinggi' : 'Gelombang normal',
            windSpeed > 15 ? 'Angin kencang mungkin terjadi' : 'Angin stabil'
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
  const fetchRecommendations = async (lat?: number, lng?: number) => {
    setLoading(prev => ({ ...prev, recommendations: true }));
    try {
      // Use provided coordinates or current location
      const targetLat = lat !== undefined ? lat : location.lat;
      const targetLng = lng !== undefined ? lng : location.lng;
      
      // Simulate API call with location-based recommendations
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
              ai_reasoning: `Waktu pagi sangat ideal dengan gelombang tenang dan angin sepoi-sepoi di area ${location.name}.`
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
              ai_reasoning: `Sore hari masih cukup aman di ${location.name} meskipun gelombang sedikit meningkat.`
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
  const fetchAnomalies = async (lat?: number, lng?: number) => {
    setLoading(prev => ({ ...prev, anomalies: true }));
    try {
      // Use provided coordinates or current location
      const targetLat = lat !== undefined ? lat : location.lat;
      const targetLng = lng !== undefined ? lng : location.lng;
      
      // Simulate API call with location-based anomalies
      const mockData: AnomalyData = {
        anomalies_detected: Math.random() > 0.7 ? [
          {
            type: 'wave_height_spike',
            severity: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)],
            date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            time: '14:00-18:00',
            description: `Tinggi gelombang diprediksi naik drastis di area ${location.name}`
          }
        ] : []
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
        <div className={`min-h-screen pt-20 p-4 md:p-8 bg-white max-w-7xl mx-auto relative ${showRecommendationDetail ? 'overflow-hidden' : ''}`}>
          {/* Blur overlay when modal is open */}
          {showRecommendationDetail && (
            <div className="absolute inset-0 bg-white bg-opacity-70 backdrop-blur-sm z-10"></div>
          )}

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
                <h2 className="text-lg font-semibold text-[#053040] border-b pb-2 flex items-center gap-2">
                  <MapPin size={18} className="text-[#00698f]" />
                  Lokasi
                </h2>
                
                {/* Manual Coordinate Input */}
                <div className="mt-4 space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-[#053040] mb-1">Latitude (-90 to 90)</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={manualLat}
                        onChange={(e) => setManualLat(e.target.value)}
                        onKeyPress={handleKeyPress}
                        className="w-full border border-gray-200 p-2 rounded-lg text-sm"
                        placeholder="-7.801194"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-[#053040] mb-1">Longitude (-180 to 180)</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={manualLng}
                        onChange={(e) => setManualLng(e.target.value)}
                        onKeyPress={handleKeyPress}
                        className="w-full border border-gray-200 p-2 rounded-lg text-sm"
                        placeholder="110.364917"
                      />
                    </div>
                  </div>
                  
                  <button
                    onClick={updateLocationFromInput}
                    disabled={loading.geocode}
                    className="bg-[#053040] text-white w-full py-2 rounded-lg font-medium flex items-center justify-center gap-2 text-sm disabled:opacity-50"
                  >
                    {loading.geocode ? (
                      <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    ) : (
                      <>
                        <Navigation size={16} />
                        Perbarui Lokasi
                      </>
                    )}
                  </button>
                </div>
                
                <div className="mt-4 pt-4 border-t">
                  <p className="text-sm text-[#053040] font-medium">
                    {loading.geocode ? "Memuat nama lokasi..." : location.name}
                  </p>
                  <p className="text-xs text-[#5c7893]">
                    {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
                  </p>
                </div>
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
                  className="bg-[#053040] text-white w-full py-2 rounded-lg font-medium flex items-center justify-center gap-2 text-sm"
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
                    <h2 className="text-lg font-semibold text-[#053040]">Analisis AI untuk {location.name}</h2>
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

          {/* Recommendation Detail Modal */}
          {showRecommendationDetail && (
            <div className="fixed inset-0 flex items-center justify-center z-20 p-4">
              <div className="bg-white rounded-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto shadow-xl relative z-30">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-bold text-[#053040]">
                    Detail Rekomendasi untuk {location.name}
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
        </div>
      </LayoutNavbar>
      <Footer />
    </>
  );
}