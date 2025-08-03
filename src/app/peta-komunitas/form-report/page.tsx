'use client';

import { useState } from 'react';
import { AlertTriangle, CheckCircle, X, Plus } from 'lucide-react';
import LayoutNavbar from '@/components/LayoutNavbar';
import Footer from '@/components/Footer';
import { auth } from '@/firebase/config';
import { useRouter, useSearchParams } from 'next/navigation';

type SafetyLevel = 'safe' | 'caution' | 'danger';
type UrgencyLevel = 'low' | 'medium' | 'high';
type TideLevel = 'low' | 'medium' | 'high';
type BoatType = 'perahu_kecil' | 'kapal_nelayan' | 'kapal_besar';

export default function CommunityReportFormPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  // Get community info from URL parameters
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
  setIsSubmitting(true);
  setError('');
  setSuccess('');
  setAuthError(''); // Clear any previous auth errors

  try {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      setAuthError("Anda perlu login terlebih dahulu");
      setIsSubmitting(false);
      return;
    }

    // Get the ID token
    const idToken = await currentUser.getIdToken();
    console.log("ID Token:", idToken); // For debugging

    if (!communityId) {
      throw new Error('Komunitas tidak valid');
    }

    // Prepare the report data
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

    console.log("Data yang akan dikirim:", JSON.stringify(reportData, null, 2));

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/report`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${idToken}`
      },
      body: JSON.stringify(reportData)
    });

    // Handle 401 Unauthorized specifically
    if (response.status === 401) {
      setAuthError('Sesi Anda telah habis, silakan login kembali');
      return;
    }

    // Handle other error statuses
    if (!response.ok) {
      const errorData = await response.json();
      console.error("Error detail dari server:", errorData);
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log("Response sukses:", result);

    setSuccess('Laporan berhasil dikirim!');
    setTimeout(() => {
      router.push(`/peta-komunitas/reports?communityId=${communityId}&communityName=${encodeURIComponent(communityName || '')}`);
    }, 1500);

  } catch (err) {
    console.error("Error saat submit:", err);
    if (err instanceof Error) {
      // Prioritize auth error message if exists
      setError(authError || err.message);
    } else {
      setError('Terjadi kesalahan saat mengirim laporan');
    }
  } finally {
    setIsSubmitting(false);
  }
};

  if (error) {
    return (
      <LayoutNavbar>
        <div className="min-h-screen pt-20 p-4 max-w-4xl mx-auto">
          <div className="bg-red-100 border-l-4 border-red-500 p-4 mb-6">
            <div className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
              <p className="text-red-700">{error}</p>
            </div>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Coba Lagi
          </button>
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
              <div className="bg-green-100 border-l-4 border-green-500 p-4 mb-6 rounded">
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                  <p className="text-green-700">{success}</p>
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi*</label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Deskripsikan kondisi secara detail..."
                      required
                    />
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Contoh: Kepulauan Seribu, DKI Jakarta"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nama Area*</label>
                    <input
                      type="text"
                      value={areaName}
                      onChange={(e) => setAreaName(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Contoh: Perairan Kepulauan Seribu"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Latitude*</label>
                    <input
                      type="number"
                      step="0.000001"
                      value={latitude}
                      onChange={(e) => setLatitude(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Longitude*</label>
                    <input
                      type="number"
                      step="0.000001"
                      value={longitude}
                      onChange={(e) => setLongitude(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Kecepatan Angin (km/jam)*</label>
                    <input
                      type="number"
                      value={windSpeed}
                      onChange={(e) => setWindSpeed(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Arah Angin (derajat)*</label>
                    <input
                      type="number"
                      value={windDirection}
                      onChange={(e) => setWindDirection(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Visibilitas (km)*</label>
                    <input
                      type="number"
                      step="0.1"
                      value={visibility}
                      onChange={(e) => setVisibility(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi Cuaca*</label>
                    <input
                      type="text"
                      value={weatherDescription}
                      onChange={(e) => setWeatherDescription(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Suhu Laut (°C)*</label>
                    <input
                      type="number"
                      step="0.1"
                      value={seaTemperature}
                      onChange={(e) => setSeaTemperature(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Kekuatan Arus*</label>
                    <input
                      type="number"
                      value={currentStrength}
                      onChange={(e) => setCurrentStrength(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
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
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-blue-300"
                >
                  {isSubmitting ? 'Mengirim...' : 'Kirim Laporan'}
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