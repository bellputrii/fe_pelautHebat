'use client';

import { useState, useEffect, Suspense } from 'react';
import { AlertTriangle, CheckCircle, X, Plus, Waves, Info, Loader2, ChevronRight, MapPin, Cloud, Gauge, Navigation, Clock, Users, Route, Calendar } from 'lucide-react';
import LayoutNavbar from '@/components/LayoutNavbar';
import Footer from '@/components/Footer';
import { auth } from '@/firebase/config';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTokenRefresh } from '@/app/hooks/useAuth';
import { authFetch } from '@/app/lib/api';

type SafetyLevel = 'safe' | 'caution' | 'danger';
type UrgencyLevel = 'low' | 'medium' | 'high';
type TideLevel = 'low' | 'medium' | 'high';
type BoatType = 'perahu_kecil' | 'kapal_nelayan' | 'kapal_besar';

type FormErrors = {
  title?: string;
  description?: string;
  address?: string;
  areaName?: string;
  latitude?: string;
  longitude?: string;
  waveHeight?: string;
  windSpeed?: string;
  windDirection?: string;
  visibility?: string;
  weatherDescription?: string;
  seaTemperature?: string;
  currentStrength?: string;
  general?: string;
};

// Tooltip component
const Tooltip = ({ text }: { text: string }) => (
  <div className="group relative inline-flex items-center">
    <Info className="w-4 h-4 text-gray-400 ml-1 cursor-help" />
    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10">
      {text}
      <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
    </div>
  </div>
);

function CommunityReportFormContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const communityId = searchParams.get('communityId');
  const communityName = searchParams.get('communityName');

  const safetyLevelLabels = {
    safe: 'Aman',
    caution: 'Hati-hati',
    danger: 'Berbahaya'
  };

  const urgencyLevelLabels = {
    low: 'Rendah',
    medium: 'Sedang',
    high: 'Tinggi'
  };

  const [authError, setAuthError] = useState('');

  // Form states dengan default values
  const [title, setTitle] = useState('Laporan Kondisi Laut');
  const [description, setDescription] = useState('Kondisi laut saat ini dalam keadaan normal, cocok untuk aktivitas pelayaran');
  const [address, setAddress] = useState('Perairan sekitar lokasi komunitas');
  const [areaName, setAreaName] = useState('Area Perairan Komunitas');
  const [latitude, setLatitude] = useState(-5.8);
  const [longitude, setLongitude] = useState(106.5);
  
  // Conditions dengan default values
  const [waveHeight, setWaveHeight] = useState(0.8);
  const [windSpeed, setWindSpeed] = useState(12);
  const [windDirection, setWindDirection] = useState(90);
  const [visibility, setVisibility] = useState(8);
  const [weatherDescription, setWeatherDescription] = useState('Cerah berawan, angin sepoi-sepoi');
  const [seaTemperature, setSeaTemperature] = useState(29);
  const [currentStrength, setCurrentStrength] = useState(1);
  const [tideLevel, setTideLevel] = useState<TideLevel>('medium');
  
  // Safety Assessment dengan default values
  const [overallSafety, setOverallSafety] = useState<SafetyLevel>('safe');
  const [boatRecommendations, setBoatRecommendations] = useState({
    perahu_kecil: 'safe' as SafetyLevel,
    kapal_nelayan: 'safe' as SafetyLevel,
    kapal_besar: 'safe' as SafetyLevel
  });
  const [recommendedActions, setRecommendedActions] = useState([
    'Tetap gunakan pelampung keselamatan',
    'Periksa kondisi perahu sebelum berlayar',
    'Bawa alat komunikasi yang memadai'
  ]);
  const [newAction, setNewAction] = useState('');
  
  // Tags and urgency dengan default values
  const [tags, setTags] = useState(['kondisi_normal', 'cuaca_cerah', 'aman_berlayar']);
  const [newTag, setNewTag] = useState('');
  const [urgencyLevel, setUrgencyLevel] = useState<UrgencyLevel>('low');
  
  // UI states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});

  // Initialize token refresh mechanism
  useTokenRefresh();

  // Format tag by replacing spaces with underscores and converting to lowercase
  const formatTag = (tag: string): string => {
    return tag.trim().replace(/\s+/g, '_').toLowerCase();
  };

  // Validate form function
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!title.trim()) {
      newErrors.title = 'Judul laporan wajib diisi';
    } else if (title.length < 5) {
      newErrors.title = 'Judul harus minimal 5 karakter';
    } else if (title.length > 100) {
      newErrors.title = 'Judul tidak boleh lebih dari 100 karakter';
    }

    if (!description.trim()) {
      newErrors.description = 'Deskripsi wajib diisi';
    } else if (description.length < 20) {
      newErrors.description = 'Deskripsi harus minimal 20 karakter';
    } else if (description.length > 1000) {
      newErrors.description = 'Deskripsi tidak boleh lebih dari 1000 karakter';
    }

    if (!address.trim()) {
      newErrors.address = 'Alamat wajib diisi';
    } else if (address.length < 5) {
      newErrors.address = 'Alamat harus minimal 5 karakter';
    }

    if (!areaName.trim()) {
      newErrors.areaName = 'Nama area wajib diisi';
    }

    if (latitude < -90 || latitude > 90) {
      newErrors.latitude = 'Latitude harus antara -90 dan 90';
    }

    if (longitude < -180 || longitude > 180) {
      newErrors.longitude = 'Longitude harus antara -180 dan 180';
    }

    if (waveHeight < 0 || waveHeight > 50) {
      newErrors.waveHeight = 'Tinggi gelombang harus antara 0 dan 50 meter';
    }

    if (windSpeed < 0 || windSpeed > 300) {
      newErrors.windSpeed = 'Kecepatan angin harus antara 0 dan 300 km/jam';
    }

    if (windDirection < 0 || windDirection > 360) {
      newErrors.windDirection = 'Arah angin harus antara 0 dan 360 derajat';
    }

    if (visibility < 0 || visibility > 100) {
      newErrors.visibility = 'Visibilitas harus antara 0 dan 100 km';
    }

    if (!weatherDescription.trim()) {
      newErrors.weatherDescription = 'Deskripsi cuaca wajib diisi';
    }

    if (seaTemperature < -2 || seaTemperature > 40) {
      newErrors.seaTemperature = 'Suhu laut harus antara -2°C dan 40°C';
    }

    if (currentStrength < 0 || currentStrength > 10) {
      newErrors.currentStrength = 'Kekuatan arus harus antara 0 (lemah) dan 10 (kuat)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  useEffect(() => {
    if (Object.keys(errors).length > 0) {
      validateForm();
    }
  }, [title, description, address, areaName, latitude, longitude, waveHeight, 
      windSpeed, windDirection, visibility, weatherDescription, seaTemperature, 
      currentStrength]);

  const handleAddAction = () => {
    if (newAction.trim() && !recommendedActions.includes(newAction.trim())) {
      setRecommendedActions([...recommendedActions, newAction.trim()]);
      setNewAction('');
    }
  };

  const handleRemoveAction = (action: string) => {
    setRecommendedActions(recommendedActions.filter(a => a !== action));
  };

  const handleAddTag = () => {
    const formattedTag = formatTag(newTag);
    if (formattedTag && !tags.includes(formattedTag)) {
      setTags([...tags, formattedTag]);
      setNewTag('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag));
  };

  const handleBoatRecommendationChange = (boatType: BoatType, value: SafetyLevel) => {
    setBoatRecommendations({
      ...boatRecommendations,
      [boatType]: value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    setError('');
    setSuccess('');
    setAuthError('');

    try {
      if (!communityId) {
        throw new Error('Komunitas tidak valid');
      }

      const reportData = {
        community_id: communityId,
        title: title,
        description: description,
        location: {
          latitude: Number(latitude),
          longitude: Number(longitude),
          address: address,
          area_name: areaName
        },
        conditions: {
          wave_height: Number(waveHeight),
          wind_speed: Number(windSpeed),
          wind_direction: Number(windDirection),
          visibility: Number(visibility),
          weather_description: weatherDescription,
          sea_temperature: Number(seaTemperature),
          current_strength: Number(currentStrength),
          tide_level: tideLevel
        },
        safety_assessment: {
          overall_safety: overallSafety,
          boat_recommendations: {
            perahu_kecil: boatRecommendations.perahu_kecil,
            kapal_nelayan: boatRecommendations.kapal_nelayan,
            kapal_besar: boatRecommendations.kapal_besar
          },
          recommended_actions: recommendedActions
        },
        tags: tags,
        urgency_level: urgencyLevel
      };

      const response = await authFetch(`${process.env.NEXT_PUBLIC_API_URL}/report`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reportData)
      });

      if (!response.ok) {
        if (response.status === 401) {
          setAuthError('Sesi Anda telah habis, silakan login kembali');
          return;
        }
        
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      setSuccess('Laporan berhasil dikirim!');
      
      setTimeout(() => {
        router.push(`/peta-komunitas/reports?communityId=${communityId}&communityName=${encodeURIComponent(communityName || '')}`);
      }, 1500);

    } catch (err) {
      console.error("Error saat submit:", err);
      if (err instanceof Error) {
        setError(authError || err.message);
      } else {
        setError('Terjadi kesalahan saat mengirim laporan');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const ErrorMessage = ({ message }: { message?: string }) => {
    if (!message) return null;
    
    return (
      <div className="mt-1 flex items-center text-red-500 text-sm">
        <AlertTriangle className="h-4 w-4 mr-1 text-red-500" />
        <span>{message}</span>
      </div>
    );
  };

  if (error) {
    return (
      <LayoutNavbar>
        <div className="min-h-screen pt-20 p-4 max-w-4xl mx-auto">
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-lg flex items-start">
            <AlertTriangle className="h-5 w-5 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-red-700 font-medium">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-2 text-sm text-red-600 underline hover:text-red-800"
              >
                Klik di sini untuk mencoba lagi
              </button>
            </div>
          </div>
        </div>
      </LayoutNavbar>
    );
  }

  return (
    <>
      <LayoutNavbar>
        <main className="min-h-screen pt-20 p-4 md:p-8 bg-white max-w-7xl mx-auto">
          <div className="container mx-auto px-2 md:px-4 py-8 md:py-12 max-w-4xl">
            {/* Header Section */}
            <div className="text-center mb-8 md:mb-10">
              <div className="inline-flex items-center justify-center bg-blue-100 p-3 rounded-full mb-4">
                <Waves className="w-6 h-6 text-blue-600" />
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-blue-900 mb-3">
                Laporan Kondisi Laut
              </h1>
              <p className="text-gray-600 max-w-lg mx-auto text-sm md:text-base">
                Laporkan kondisi terkini laut untuk keselamatan bersama komunitas {decodeURIComponent(communityName || '')}
              </p>
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-medium text-blue-900 text-sm mb-1">
                    Informasi Penting
                  </h3>
                  <p className="text-blue-700 text-xs">
                    Form ini telah diisi dengan nilai default berdasarkan kondisi normal. Pastikan untuk menyesuaikan dengan kondisi aktual sebelum mengirim laporan.
                  </p>
                </div>
              </div>
            </div>

            {/* Success Message */}
            {success && (
              <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-lg mb-6 md:mb-8 flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-medium text-green-800">Berhasil!</h3>
                  <p className="text-sm text-green-700">{success}</p>
                </div>
              </div>
            )}

            {/* Error Message */}
            {(error || authError) && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg mb-6 md:mb-8 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-medium text-red-800">Perhatian</h3>
                  <p className="text-sm text-red-700">{error || authError}</p>
                </div>
              </div>
            )}

            {/* Form Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <form onSubmit={handleSubmit} className="p-4 md:p-6 space-y-6">
                {/* Informasi Dasar */}
                <div className="space-y-4">
                  <h2 className="text-lg font-semibold text-blue-900 flex items-center gap-2">
                    <Navigation className="w-5 h-5" />
                    Informasi Dasar
                  </h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700 flex items-center gap-1">
                        Judul Laporan
                        <Tooltip text="Judul yang jelas dan deskriptif tentang kondisi laut" />
                      </label>
                      <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className={`w-full px-3 md:px-4 py-2 border ${errors.title ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900`}
                        required
                      />
                      <ErrorMessage message={errors.title} />
                      <p className="text-xs text-gray-500">
                        Contoh: "Cuaca Cerah - Kondisi Ideal untuk Berlayar"
                      </p>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700 flex items-center gap-1">
                        <Gauge className="w-4 h-4" />
                        Tingkat Urgensi
                      </label>
                      <select
                        value={urgencyLevel}
                        onChange={(e) => setUrgencyLevel(e.target.value as UrgencyLevel)}
                        className="w-full px-3 md:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                        required
                      >
                        <option value="low">Rendah (Kondisi Normal)</option>
                        <option value="medium">Sedang (Perlu Perhatian)</option>
                        <option value="high">Tinggi (Darurat)</option>
                      </select>
                      <p className="text-xs text-gray-500">
                        Pilih sesuai tingkat kepentingan laporan
                      </p>
                    </div>

                    <div className="md:col-span-2 space-y-2">
                      <label className="block text-sm font-medium text-gray-700 flex items-center gap-1">
                        Deskripsi Kondisi
                        <Tooltip text="Jelaskan kondisi laut secara detail dan jelas" />
                      </label>
                      <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={4}
                        className={`w-full px-3 md:px-4 py-2 border ${errors.description ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900`}
                        required
                      />
                      <div className="flex justify-between items-center">
                        <ErrorMessage message={errors.description} />
                        <span className={`text-xs ${description.length < 20 ? 'text-red-500' : 'text-gray-500'}`}>
                          {description.length}/1000 karakter
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Informasi Lokasi */}
                <div className="space-y-4">
                  <h2 className="text-lg font-semibold text-blue-900 flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    Informasi Lokasi
                  </h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700 flex items-center gap-1">
                        Alamat
                        <Tooltip text="Lokasi umum atau nama tempat" />
                      </label>
                      <input
                        type="text"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        className={`w-full px-3 md:px-4 py-2 border ${errors.address ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900`}
                        required
                      />
                      <ErrorMessage message={errors.address} />
                      <p className="text-xs text-gray-500">
                        Contoh: "Kepulauan Seribu, DKI Jakarta"
                      </p>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700 flex items-center gap-1">
                        Nama Area
                      </label>
                      <input
                        type="text"
                        value={areaName}
                        onChange={(e) => setAreaName(e.target.value)}
                        className={`w-full px-3 md:px-4 py-2 border ${errors.areaName ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900`}
                        required
                      />
                      <ErrorMessage message={errors.areaName} />
                      <p className="text-xs text-gray-500">
                        Contoh: "Perairan Kepulauan Seribu"
                      </p>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700 flex items-center gap-1">
                        Latitude
                        <Tooltip text="Koordinat latitude antara -90 sampai 90" />
                      </label>
                      <input
                        type="number"
                        step="0.000001"
                        value={latitude}
                        onChange={(e) => setLatitude(Number(e.target.value))}
                        className={`w-full px-3 md:px-4 py-2 border ${errors.latitude ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900`}
                        required
                      />
                      <ErrorMessage message={errors.latitude} />
                      <p className="text-xs text-gray-500">
                        Default: -5.8 (Jakarta)
                      </p>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700 flex items-center gap-1">
                        Longitude
                        <Tooltip text="Koordinat longitude antara -180 sampai 180" />
                      </label>
                      <input
                        type="number"
                        step="0.000001"
                        value={longitude}
                        onChange={(e) => setLongitude(Number(e.target.value))}
                        className={`w-full px-3 md:px-4 py-2 border ${errors.longitude ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900`}
                        required
                      />
                      <ErrorMessage message={errors.longitude} />
                      <p className="text-xs text-gray-500">
                        Default: 106.5 (Jakarta)
                      </p>
                    </div>
                  </div>
                </div>

                {/* Kondisi Laut */}
                <div className="space-y-4">
                  <h2 className="text-lg font-semibold text-blue-900 flex items-center gap-2">
                    <Waves className="w-5 h-5" />
                    Kondisi Laut
                  </h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700 flex items-center gap-1">
                        Tinggi Gelombang
                        <Tooltip text="Tinggi gelombang dalam meter (0-50m)" />
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          step="0.1"
                          value={waveHeight}
                          onChange={(e) => setWaveHeight(Number(e.target.value))}
                          className={`w-full px-3 md:px-4 py-2 border ${errors.waveHeight ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900`}
                          required
                        />
                        <span className="absolute right-3 top-2.5 text-gray-400 text-sm">meter</span>
                      </div>
                      <ErrorMessage message={errors.waveHeight} />
                      <p className="text-xs text-gray-500">
                        Default: 0.8m (tenang)
                      </p>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700 flex items-center gap-1">
                        Kecepatan Angin
                        <Tooltip text="Kecepatan angin dalam km/jam (0-300km/jam)" />
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          value={windSpeed}
                          onChange={(e) => setWindSpeed(Number(e.target.value))}
                          className={`w-full px-3 md:px-4 py-2 border ${errors.windSpeed ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900`}
                          required
                        />
                        <span className="absolute right-3 top-2.5 text-gray-400 text-sm">km/jam</span>
                      </div>
                      <ErrorMessage message={errors.windSpeed} />
                      <p className="text-xs text-gray-500">
                        Default: 12 km/jam (sepoi-sepoi)
                      </p>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700 flex items-center gap-1">
                        Arah Angin
                        <Tooltip text="Arah angin dalam derajat (0-360°)" />
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          value={windDirection}
                          onChange={(e) => setWindDirection(Number(e.target.value))}
                          className={`w-full px-3 md:px-4 py-2 border ${errors.windDirection ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900`}
                          required
                        />
                        <span className="absolute right-3 top-2.5 text-gray-400 text-sm">°</span>
                      </div>
                      <ErrorMessage message={errors.windDirection} />
                      <p className="text-xs text-gray-500">
                        Default: 90° (timur)
                      </p>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700 flex items-center gap-1">
                        Visibilitas
                        <Tooltip text="Jarak pandang dalam kilometer (0-100km)" />
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          step="0.1"
                          value={visibility}
                          onChange={(e) => setVisibility(Number(e.target.value))}
                          className={`w-full px-3 md:px-4 py-2 border ${errors.visibility ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900`}
                          required
                        />
                        <span className="absolute right-3 top-2.5 text-gray-400 text-sm">km</span>
                      </div>
                      <ErrorMessage message={errors.visibility} />
                      <p className="text-xs text-gray-500">
                        Default: 8km (baik)
                      </p>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700 flex items-center gap-1">
                        Suhu Laut
                        <Tooltip text="Suhu air laut dalam °C (-2°C sampai 40°C)" />
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          step="0.1"
                          value={seaTemperature}
                          onChange={(e) => setSeaTemperature(Number(e.target.value))}
                          className={`w-full px-3 md:px-4 py-2 border ${errors.seaTemperature ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900`}
                          required
                        />
                        <span className="absolute right-3 top-2.5 text-gray-400 text-sm">°C</span>
                      </div>
                      <ErrorMessage message={errors.seaTemperature} />
                      <p className="text-xs text-gray-500">
                        Default: 29°C (tropis)
                      </p>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700 flex items-center gap-1">
                        Kekuatan Arus
                        <Tooltip text="Skala 0-10 (0=lemah, 10=sangat kuat)" />
                      </label>
                      <input
                        type="number"
                        value={currentStrength}
                        onChange={(e) => setCurrentStrength(Number(e.target.value))}
                        className={`w-full px-3 md:px-4 py-2 border ${errors.currentStrength ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900`}
                        required
                      />
                      <ErrorMessage message={errors.currentStrength} />
                      <p className="text-xs text-gray-500">
                        Default: 1 (lemah)
                      </p>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700 flex items-center gap-1">
                        Deskripsi Cuaca
                      </label>
                      <input
                        type="text"
                        value={weatherDescription}
                        onChange={(e) => setWeatherDescription(e.target.value)}
                        className={`w-full px-3 md:px-4 py-2 border ${errors.weatherDescription ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900`}
                        required
                      />
                      <ErrorMessage message={errors.weatherDescription} />
                      <p className="text-xs text-gray-500">
                        Contoh: "Cerah berawan, angin sepoi-sepoi"
                      </p>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700 flex items-center gap-1">
                        Tinggi Pasang
                      </label>
                      <select
                        value={tideLevel}
                        onChange={(e) => setTideLevel(e.target.value as TideLevel)}
                        className="w-full px-3 md:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                        required
                      >
                        <option value="low">Rendah</option>
                        <option value="medium">Sedang</option>
                        <option value="high">Tinggi</option>
                      </select>
                      <p className="text-xs text-gray-500">
                        Default: Sedang
                      </p>
                    </div>
                  </div>
                </div>

                {/* Penilaian Keselamatan - MODIFIED */}
                <div className="space-y-4">
                  <h2 className="text-lg font-semibold text-blue-900 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5" />
                    Penilaian Keselamatan
                  </h2>
                  
                  <div className="grid grid-cols-1 gap-4 md:gap-6">
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-black">
                        Tingkat Keselamatan Keseluruhan
                      </label>
                      <div className="flex flex-wrap gap-4">
                        {(['safe', 'caution', 'danger'] as SafetyLevel[]).map((level) => (
                          <label key={level} className="flex items-center text-black">
                            <input
                              type="radio"
                              checked={overallSafety === level}
                              onChange={() => setOverallSafety(level)}
                              className="mr-2"
                              required
                            />
                            <span className="text-black">{safetyLevelLabels[level]}</span>
                          </label>
                        ))}
                      </div>
                      <p className="text-xs text-gray-500">
                        Pilih tingkat keselamatan berdasarkan kondisi keseluruhan
                      </p>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-black">
                        Rekomendasi untuk Jenis Kapal
                      </label>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {(['perahu_kecil', 'kapal_nelayan', 'kapal_besar'] as BoatType[]).map((boatType) => (
                          <div key={boatType} className="border border-gray-200 p-3 rounded-lg bg-white">
                            <h3 className="font-medium mb-2 text-sm text-black">
                              {boatType === 'perahu_kecil' && 'Perahu Kecil'}
                              {boatType === 'kapal_nelayan' && 'Kapal Nelayan'}
                              {boatType === 'kapal_besar' && 'Kapal Besar'}
                            </h3>
                            <div className="space-y-2">
                              {(['safe', 'caution', 'danger'] as SafetyLevel[]).map((level) => (
                                <label key={level} className="flex items-center text-sm text-black">
                                  <input
                                    type="radio"
                                    name={boatType}
                                    checked={boatRecommendations[boatType] === level}
                                    onChange={() => handleBoatRecommendationChange(boatType, level)}
                                    className="mr-2"
                                    required
                                  />
                                  <span className="text-black">{safetyLevelLabels[level]}</span>
                                </label>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-black">
                        Tindakan yang Direkomendasikan
                      </label>
                      <div className="space-y-2">
                        {recommendedActions.map((action, index) => (
                          <div key={index} className="flex justify-between items-center bg-gray-100 p-2 rounded">
                            <span className="text-sm text-black">{action}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveAction(action)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        ))}
                        <div className="flex mt-2">
                          <input
                            type="text"
                            value={newAction}
                            onChange={(e) => setNewAction(e.target.value)}
                            placeholder="Tambah tindakan baru"
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black bg-white"
                          />
                          <button
                            type="button"
                            onClick={handleAddAction}
                            className="bg-blue-500 text-white px-3 py-2 rounded-r-lg hover:bg-blue-600 flex items-center"
                          >
                            <Plus size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tags - MODIFIED */}
                <div className="space-y-4">
                  <h2 className="text-lg font-semibold text-blue-900 flex items-center gap-2">
                    Kategori
                  </h2>
                  
                  <div className="space-y-4">
                    <div className="flex flex-wrap gap-2">
                      {tags.map((tag, index) => (
                        <div key={index} className="flex items-center bg-blue-100 px-3 py-1 rounded-full border border-blue-200">
                          <span className="text-sm text-black">{tag}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveTag(tag)}
                            className="ml-2 text-red-500 hover:text-red-700"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                    <div className="flex">
                      <input
                        type="text"
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        placeholder="Tambah tag baru (contoh: kondisi_baik)"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black bg-white"
                      />
                      <button
                        type="button"
                        onClick={handleAddTag}
                        className="bg-blue-500 text-white px-3 py-2 rounded-r-lg hover:bg-blue-600 flex items-center"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                    <p className="text-xs text-gray-500">
                      Tag akan otomatis diubah menjadi huruf kecil dan spasi diganti dengan underscore (_)
                    </p>
                  </div>
                </div>

                {/* Notes Section */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Info className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-medium text-yellow-900 text-sm mb-1">
                        Catatan Pengisian
                      </h3>
                      <ul className="text-yellow-700 text-xs space-y-1">
                        <li>• Semua field telah diisi dengan nilai default kondisi normal</li>
                        <li>• Pastikan untuk menyesuaikan dengan kondisi aktual sebelum mengirim</li>
                        <li>• Tingkat urgensi mempengaruhi prioritas penanganan laporan</li>
                        <li>• Rekomendasi keselamatan harus sesuai dengan kondisi terbaru</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-[#053040] hover:bg-[#2C5B6B] text-white font-medium py-3 px-6 rounded-lg transition duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Mengirim Laporan...
                      </>
                    ) : (
                      <>
                        Kirim Laporan ke Komunitas
                        <ChevronRight className="w-5 h-5" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </main>
      </LayoutNavbar>
      <Footer />
    </>
  );
}

export default function CommunityReportFormPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen pt-20 p-4 md:p-8 bg-white max-w-7xl mx-auto">
        <div className="flex justify-center items-center h-64">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-12 w-12 text-blue-600 animate-spin" />
            <p className="text-gray-600">Memuat form laporan...</p>
          </div>
        </div>
      </div>
    }>
      <CommunityReportFormContent />
    </Suspense>
  );
}