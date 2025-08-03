'use client';

import { useState, useEffect, Suspense } from 'react';
import { AlertTriangle, CheckCircle, X, Plus } from 'lucide-react';
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

function CommunityReportFormContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const communityId = searchParams.get('communityId');
  const communityName = searchParams.get('communityName');

  const [authError, setAuthError] = useState('');

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');
  const [areaName, setAreaName] = useState('');
  const [latitude, setLatitude] = useState(-5.8);
  const [longitude, setLongitude] = useState(106.5);
  
  // Conditions
  const [waveHeight, setWaveHeight] = useState(0.8);
  const [windSpeed, setWindSpeed] = useState(12);
  const [windDirection, setWindDirection] = useState(90);
  const [visibility, setVisibility] = useState(8);
  const [weatherDescription, setWeatherDescription] = useState('Cerah berawan, angin sepoi-sepoi');
  const [seaTemperature, setSeaTemperature] = useState(29);
  const [currentStrength, setCurrentStrength] = useState(1);
  const [tideLevel, setTideLevel] = useState<TideLevel>('medium');
  
  // Safety Assessment
  const [overallSafety, setOverallSafety] = useState<SafetyLevel>('safe');
  const [boatRecommendations, setBoatRecommendations] = useState({
    perahu_kecil: 'safe' as SafetyLevel,
    kapal_nelayan: 'safe' as SafetyLevel,
    kapal_besar: 'safe' as SafetyLevel
  });
  const [recommendedActions, setRecommendedActions] = useState([
    'Tetap gunakan pelampung keselamatan',
    'Manfaatkan kondisi baik untuk aktivitas memancing'
  ]);
  const [newAction, setNewAction] = useState('');
  
  // Tags and urgency
  const [tags, setTags] = useState(['cuaca_cerah', 'kondisi_baik']);
  const [newTag, setNewTag] = useState('');
  const [urgencyLevel, setUrgencyLevel] = useState<UrgencyLevel>('low');
  
  // UI states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});

  // Initialize token refresh mechanism
  useTokenRefresh();

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
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
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
        title: title || "Laporan Kondisi Laut",
        description: description || "Tidak ada deskripsi",
        location: {
          latitude: Number(latitude),
          longitude: Number(longitude),
          address: address || "Lokasi tidak ditentukan",
          area_name: areaName || "Area tidak ditentukan"
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
        <AlertTriangle className="h-4 w-4 mr-1" />
        <span>{message}</span>
      </div>
    );
  };

  if (error) {
    return (
      <LayoutNavbar>
        <div className="min-h-screen pt-20 p-4 max-w-4xl mx-auto">
          <div className="bg-red-100 border-l-4 border-red-500 p-4 mb-6 rounded-lg flex items-start">
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
        <div className="min-h-screen pt-20 bg-gray-50">
          <div className="max-w-4xl mx-auto p-4">
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-gray-800">Buat Laporan Baru</h1>
              <p className="text-gray-600">Komunitas: {decodeURIComponent(communityName || '')}</p>
            </div>

            {success && (
              <div className="bg-green-100 border-l-4 border-green-500 p-4 mb-6 rounded-lg flex items-start">
                <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-green-700 font-medium">{success}</p>
                  <p className="text-green-600 text-sm mt-1">Laporan Anda telah berhasil dikirim dan akan segera diproses.</p>
                </div>
              </div>
            )}

            {(error || authError) && (
              <div className="bg-red-100 border-l-4 border-red-500 p-4 mb-6 rounded-lg flex items-start">
                <AlertTriangle className="h-5 w-5 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-red-700 font-medium">{error || authError}</p>
                  {authError && (
                    <button
                      onClick={() => router.push('/login')}
                      className="mt-2 text-sm text-red-600 underline hover:text-red-800"
                    >
                      Klik di sini untuk login
                    </button>
                  )}
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-lg font-semibold mb-4">Informasi Dasar</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Judul Laporan*</label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Contoh: Cuaca Cerah - Kondisi Ideal untuk Berlayar"
                      className={`w-full px-3 py-2 border ${errors.title ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      required
                    />
                    <ErrorMessage message={errors.title} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi*</label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={4}
                      className={`w-full px-3 py-2 border ${errors.description ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      placeholder="Deskripsikan kondisi secara detail..."
                      required
                    />
                    <div className="flex justify-between items-center mt-1">
                      <ErrorMessage message={errors.description} />
                      <span className={`text-xs ${description.length < 20 ? 'text-red-500' : 'text-gray-500'}`}>
                        {description.length}/1000 karakter
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tingkat Urgensi*</label>
                    <div className="flex space-x-4">
                      {(['low', 'medium', 'high'] as UrgencyLevel[]).map((level) => (
                        <label key={level} className="flex items-center">
                          <input
                            type="radio"
                            checked={urgencyLevel === level}
                            onChange={() => setUrgencyLevel(level)}
                            className="mr-2"
                            required
                          />
                          <span className="capitalize">{level}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Location Information */}
              <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-lg font-semibold mb-4">Lokasi</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Alamat*</label>
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className={`w-full px-3 py-2 border ${errors.address ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      placeholder="Contoh: Kepulauan Seribu, DKI Jakarta"
                      required
                    />
                    <ErrorMessage message={errors.address} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nama Area*</label>
                    <input
                      type="text"
                      value={areaName}
                      onChange={(e) => setAreaName(e.target.value)}
                      className={`w-full px-3 py-2 border ${errors.areaName ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      placeholder="Contoh: Perairan Kepulauan Seribu"
                      required
                    />
                    <ErrorMessage message={errors.areaName} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Latitude*</label>
                    <input
                      type="number"
                      step="0.000001"
                      value={latitude}
                      onChange={(e) => setLatitude(Number(e.target.value))}
                      className={`w-full px-3 py-2 border ${errors.latitude ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      required
                    />
                    <ErrorMessage message={errors.latitude} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Longitude*</label>
                    <input
                      type="number"
                      step="0.000001"
                      value={longitude}
                      onChange={(e) => setLongitude(Number(e.target.value))}
                      className={`w-full px-3 py-2 border ${errors.longitude ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      required
                    />
                    <ErrorMessage message={errors.longitude} />
                  </div>
                </div>
              </div>

              {/* Conditions */}
              <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-lg font-semibold mb-4">Kondisi Laut</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tinggi Gelombang (m)*</label>
                    <input
                      type="number"
                      step="0.1"
                      value={waveHeight}
                      onChange={(e) => setWaveHeight(Number(e.target.value))}
                      className={`w-full px-3 py-2 border ${errors.waveHeight ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      required
                    />
                    <ErrorMessage message={errors.waveHeight} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Kecepatan Angin (km/jam)*</label>
                    <input
                      type="number"
                      value={windSpeed}
                      onChange={(e) => setWindSpeed(Number(e.target.value))}
                      className={`w-full px-3 py-2 border ${errors.windSpeed ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      required
                    />
                    <ErrorMessage message={errors.windSpeed} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Arah Angin (derajat)*</label>
                    <input
                      type="number"
                      value={windDirection}
                      onChange={(e) => setWindDirection(Number(e.target.value))}
                      className={`w-full px-3 py-2 border ${errors.windDirection ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      required
                    />
                    <ErrorMessage message={errors.windDirection} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Visibilitas (km)*</label>
                    <input
                      type="number"
                      step="0.1"
                      value={visibility}
                      onChange={(e) => setVisibility(Number(e.target.value))}
                      className={`w-full px-3 py-2 border ${errors.visibility ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      required
                    />
                    <ErrorMessage message={errors.visibility} />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi Cuaca*</label>
                    <input
                      type="text"
                      value={weatherDescription}
                      onChange={(e) => setWeatherDescription(e.target.value)}
                      className={`w-full px-3 py-2 border ${errors.weatherDescription ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      required
                    />
                    <ErrorMessage message={errors.weatherDescription} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Suhu Laut (°C)*</label>
                    <input
                      type="number"
                      step="0.1"
                      value={seaTemperature}
                      onChange={(e) => setSeaTemperature(Number(e.target.value))}
                      className={`w-full px-3 py-2 border ${errors.seaTemperature ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      required
                    />
                    <ErrorMessage message={errors.seaTemperature} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Kekuatan Arus*</label>
                    <input
                      type="number"
                      value={currentStrength}
                      onChange={(e) => setCurrentStrength(Number(e.target.value))}
                      className={`w-full px-3 py-2 border ${errors.currentStrength ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      required
                    />
                    <ErrorMessage message={errors.currentStrength} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tinggi Pasang*</label>
                    <select
                      value={tideLevel}
                      onChange={(e) => setTideLevel(e.target.value as TideLevel)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="low">Rendah</option>
                      <option value="medium">Sedang</option>
                      <option value="high">Tinggi</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Safety Assessment */}
              <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-lg font-semibold mb-4">Penilaian Keselamatan</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tingkat Keselamatan Keseluruhan*</label>
                    <div className="flex space-x-4">
                      {(['safe', 'caution', 'danger'] as SafetyLevel[]).map((level) => (
                        <label key={level} className="flex items-center">
                          <input
                            type="radio"
                            checked={overallSafety === level}
                            onChange={() => setOverallSafety(level)}
                            className="mr-2"
                            required
                          />
                          <span className="capitalize">{level}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Rekomendasi untuk Kapal*</label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {(['perahu_kecil', 'kapal_nelayan', 'kapal_besar'] as BoatType[]).map((boatType) => (
                        <div key={boatType} className="border p-3 rounded">
                          <h3 className="font-medium mb-2">
                            {boatType === 'perahu_kecil' && 'Perahu Kecil'}
                            {boatType === 'kapal_nelayan' && 'Kapal Nelayan'}
                            {boatType === 'kapal_besar' && 'Kapal Besar'}
                          </h3>
                          <div className="space-y-2">
                            {(['safe', 'caution', 'danger'] as SafetyLevel[]).map((level) => (
                              <label key={level} className="flex items-center">
                                <input
                                  type="radio"
                                  name={boatType}
                                  checked={boatRecommendations[boatType] === level}
                                  onChange={() => handleBoatRecommendationChange(boatType, level)}
                                  className="mr-2"
                                  required
                                />
                                <span className="capitalize">{level}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tindakan yang Direkomendasikan</label>
                    <div className="space-y-2">
                      {recommendedActions.map((action, index) => (
                        <div key={index} className="flex justify-between items-center bg-gray-50 p-2 rounded">
                          <span>{action}</span>
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
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button
                          type="button"
                          onClick={handleAddAction}
                          className="bg-blue-500 text-white px-3 py-2 rounded-r-md hover:bg-blue-600"
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tags */}
              <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-lg font-semibold mb-4">Tag</h2>
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag, index) => (
                      <div key={index} className="flex items-center bg-gray-100 px-3 py-1 rounded-full">
                        <span>{tag}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          className="ml-2 text-red-500 hover:text-red-700"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="flex">
                    <input
                      type="text"
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      placeholder="Tambah tag baru"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      type="button"
                      onClick={handleAddTag}
                      className="bg-blue-500 text-white px-3 py-2 rounded-r-md hover:bg-blue-600"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => router.push(`/peta-komunitas/reports?communityId=${communityId}&communityName=${encodeURIComponent(communityName || '')}`)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-blue-300 flex items-center justify-center"
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Mengirim...
                    </>
                  ) : 'Kirim Laporan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </LayoutNavbar>
      <Footer />
    </>
  );
}

export default function CommunityReportFormPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CommunityReportFormContent />
    </Suspense>
  );
}