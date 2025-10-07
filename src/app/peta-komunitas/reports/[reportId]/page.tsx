'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  ArrowLeft, Calendar, User, MapPin, Waves, Wind, Eye, Thermometer, 
  Navigation, Shield, Flag, AlertTriangle, Loader2, ChevronRight, 
  Compass, Zap
} from 'lucide-react';
import LayoutNavbar from '@/components/LayoutNavbar';
import Footer from '@/components/Footer';
import { authFetch } from '@/app/lib/api';

type Report = {
  id: string;
  author_name: string;
  author_id: string;
  created_at: string;
  description: string;
  title: string;
  safety_assessment: {
    overall_safety: string;
    boat_recommendations: {
      perahu_kecil: string;
      kapal_nelayan: string;
      kapal_besar: string;
    };
    recommended_actions: string[];
  };
  location?: {
    address?: string;
    area_name?: string;
    latitude?: number;
    longitude?: number;
  };
  conditions?: {
    weather_description?: string;
    wave_height?: number;
    wind_speed?: number;
    wind_direction?: number;
    visibility?: number;
    sea_temperature?: number;
    current_strength?: number;
    tide_level?: string;
  };
  view_count?: number;
  verification?: {
    status: string;
    verified_by?: string;
    verified_at?: string;
    confidence_score?: number;
  };
};

export default function ReportDetailPage() {
  const params = useParams();
  const router = useRouter();
  const reportId = params.reportId as string;

  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchReportDetail = async () => {
      setLoading(true);
      setError('');

      try {
        const response = await authFetch(
          `${process.env.NEXT_PUBLIC_API_URL}/report/${reportId}`
        );

        if (!response.ok) {
          throw new Error('Gagal memuat detail laporan');
        }

        const data = await response.json();
        if (data.success) {
          setReport(data.data);
        } else {
          setError(data.message || 'Gagal memuat laporan');
        }
      } catch (err) {
        console.error('Error fetching report detail:', err);
        setError('Gagal memuat detail laporan');
      } finally {
        setLoading(false);
      }
    };

    if (reportId) {
      fetchReportDetail();
    }
  }, [reportId]);

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getSafetyColor = (safetyLevel: string) => {
    switch (safetyLevel) {
      case 'safe': return 'bg-green-100 text-green-800 border-green-200';
      case 'caution': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'danger': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getSafetyText = (safetyLevel: string) => {
    switch (safetyLevel) {
      case 'safe': return 'Aman';
      case 'caution': return 'Waspada';
      case 'danger': return 'Berbahaya';
      default: return 'Tidak Diketahui';
    }
  };

  if (loading) {
    return (
      <LayoutNavbar>
        <div className="min-h-screen pt-20 bg-white">
          <div className="max-w-4xl mx-auto p-4">
            <div className="flex justify-center items-center h-64">
              <div className="flex flex-col items-center gap-4">
                <Loader2 className="h-12 w-12 text-[#053040] animate-spin" />
                <p className="text-gray-600">Memuat detail laporan...</p>
              </div>
            </div>
          </div>
        </div>
      </LayoutNavbar>
    );
  }

  if (error || !report) {
    return (
      <LayoutNavbar>
        <div className="min-h-screen pt-20 bg-white">
          <div className="max-w-4xl mx-auto p-4">
            <button
              onClick={() => router.back()}
              className="bg-[#053040] text-white px-4 py-2 rounded-lg hover:bg-[#2C5B6B] transition-colors flex items-center gap-2 mb-6"
            >
              <ArrowLeft className="h-4 w-4" />
              Kembali
            </button>
            
            <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
              <div className="flex items-center">
                <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
                <p className="text-red-700">{error || 'Laporan tidak ditemukan'}</p>
              </div>
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
          {/* Header Section */}
          <div className="bg-white border-b border-gray-200">
            <div className="max-w-4xl mx-auto p-4">
              <div className="flex items-center gap-4 mb-6">
                <button
                  onClick={() => router.back()}
                  className="bg-white border border-gray-300 text-gray-700 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>
                <div>
                  <h1 className="text-2xl font-bold text-[#053040]">Detail Laporan</h1>
                  <p className="text-gray-600">Informasi lengkap tentang laporan kondisi laut</p>
                </div>
              </div>

              {/* Report Header Card */}
              <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
                <div className="flex flex-col md:flex-row md:items-start gap-6">
                  <div className="flex-shrink-0">
                    <div className="w-20 h-20 rounded-xl bg-[#053040] text-white flex items-center justify-center font-bold text-2xl border-2 border-gray-200">
                      <Flag className="h-8 w-8" />
                    </div>
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
                      <div>
                        <h1 className="text-2xl font-bold text-[#053040] mb-2">{report.title}</h1>
                        <div className="flex items-center gap-4 text-gray-600 mb-3">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            <span className="text-sm">{formatDateTime(report.created_at)}</span>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getSafetyColor(report.safety_assessment.overall_safety)}`}>
                            Status: {getSafetyText(report.safety_assessment.overall_safety)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <p className="text-gray-700 mb-4">{report.description}</p>

                    {/* Quick Stats */}
                    <div className="flex flex-wrap gap-2">
                      {report.view_count && (
                        <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs border border-gray-300 flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          {report.view_count} dilihat
                        </span>
                      )}
                      {report.verification?.status && (
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          report.verification.status === 'verified' 
                            ? 'bg-green-100 text-green-800 border border-green-200'
                            : report.verification.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                            : 'bg-red-100 text-red-800 border border-red-200'
                        }`}>
                          {report.verification.status === 'verified' ? 'Terverifikasi' : 
                           report.verification.status === 'pending' ? 'Menunggu Verifikasi' : 'Ditolak'}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="max-w-4xl mx-auto p-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column - Main Content */}
              <div className="lg:col-span-2 space-y-6">
                {/* Conditions Cards */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {report.conditions?.wave_height && (
                    <div className="bg-white border border-gray-200 rounded-xl p-4 text-center">
                      <div className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-2">
                        <Waves className="h-6 w-6 text-blue-600" />
                      </div>
                      <div className="text-2xl font-bold text-[#053040]">{report.conditions.wave_height}m</div>
                      <div className="text-sm text-gray-600">Tinggi Gelombang</div>
                    </div>
                  )}
                  
                  {report.conditions?.wind_speed && (
                    <div className="bg-white border border-gray-200 rounded-xl p-4 text-center">
                      <div className="bg-green-100 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-2">
                        <Wind className="h-6 w-6 text-green-600" />
                      </div>
                      <div className="text-2xl font-bold text-[#053040]">{report.conditions.wind_speed}km/jam</div>
                      <div className="text-sm text-gray-600">Kecepatan Angin</div>
                    </div>
                  )}
                  
                  {report.conditions?.visibility && (
                    <div className="bg-white border border-gray-200 rounded-xl p-4 text-center">
                      <div className="bg-purple-100 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-2">
                        <Eye className="h-6 w-6 text-purple-600" />
                      </div>
                      <div className="text-2xl font-bold text-[#053040]">{report.conditions.visibility}km</div>
                      <div className="text-sm text-gray-600">Visibilitas</div>
                    </div>
                  )}
                  
                  {report.conditions?.sea_temperature && (
                    <div className="bg-white border border-gray-200 rounded-xl p-4 text-center">
                      <div className="bg-orange-100 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-2">
                        <Thermometer className="h-6 w-6 text-orange-600" />
                      </div>
                      <div className="text-2xl font-bold text-[#053040]">{report.conditions.sea_temperature}°C</div>
                      <div className="text-sm text-gray-600">Suhu Laut</div>
                    </div>
                  )}
                  
                  {report.conditions?.current_strength && (
                    <div className="bg-white border border-gray-200 rounded-xl p-4 text-center">
                      <div className="bg-red-100 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-2">
                        <Navigation className="h-6 w-6 text-red-600" />
                      </div>
                      <div className="text-2xl font-bold text-[#053040]">{report.conditions.current_strength}/10</div>
                      <div className="text-sm text-gray-600">Kekuatan Arus</div>
                    </div>
                  )}
                  
                  {report.conditions?.wind_direction && (
                    <div className="bg-white border border-gray-200 rounded-xl p-4 text-center">
                      <div className="bg-indigo-100 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-2">
                        <Compass className="h-6 w-6 text-indigo-600" />
                      </div>
                      <div className="text-2xl font-bold text-[#053040]">{report.conditions.wind_direction}°</div>
                      <div className="text-sm text-gray-600">Arah Angin</div>
                    </div>
                  )}
                </div>

                {/* Detailed Description */}
                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <h3 className="text-xl font-bold text-[#053040] mb-4 flex items-center gap-2">
                    <Compass className="h-5 w-5 text-[#053040]" />
                    Deskripsi Lengkap
                  </h3>
                  <div className="prose prose-lg max-w-none">
                    <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                      {report.description}
                    </p>
                  </div>
                </div>

                {/* Weather Description */}
                {report.conditions?.weather_description && (
                  <div className="bg-white border border-gray-200 rounded-xl p-6">
                    <h3 className="text-xl font-bold text-[#053040] mb-4 flex items-center gap-2">
                      <Zap className="h-5 w-5 text-[#053040]" />
                      Deskripsi Cuaca
                    </h3>
                    <p className="text-gray-700 leading-relaxed">
                      {report.conditions.weather_description}
                    </p>
                  </div>
                )}

                {/* Safety Assessment */}
                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <h3 className="text-xl font-bold text-[#053040] mb-4 flex items-center gap-2">
                    <Shield className="h-5 w-5 text-[#053040]" />
                    Penilaian Keselamatan
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
                      <div className="text-lg font-bold text-[#053040] mb-2">Perahu Kecil</div>
                      <div className={`px-3 py-1 rounded-full text-sm font-medium ${getSafetyColor(report.safety_assessment.boat_recommendations.perahu_kecil)}`}>
                        {getSafetyText(report.safety_assessment.boat_recommendations.perahu_kecil)}
                      </div>
                    </div>
                    
                    <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
                      <div className="text-lg font-bold text-[#053040] mb-2">Kapal Nelayan</div>
                      <div className={`px-3 py-1 rounded-full text-sm font-medium ${getSafetyColor(report.safety_assessment.boat_recommendations.kapal_nelayan)}`}>
                        {getSafetyText(report.safety_assessment.boat_recommendations.kapal_nelayan)}
                      </div>
                    </div>
                    
                    <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
                      <div className="text-lg font-bold text-[#053040] mb-2">Kapal Besar</div>
                      <div className={`px-3 py-1 rounded-full text-sm font-medium ${getSafetyColor(report.safety_assessment.boat_recommendations.kapal_besar)}`}>
                        {getSafetyText(report.safety_assessment.boat_recommendations.kapal_besar)}
                      </div>
                    </div>
                  </div>
                  
                  {report.safety_assessment.recommended_actions.length > 0 && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h4 className="font-bold text-[#053040] mb-3">Tindakan yang Direkomendasikan</h4>
                      <ul className="space-y-2">
                        {report.safety_assessment.recommended_actions.map((action, index) => (
                          <li key={index} className="flex items-start gap-3 text-gray-700">
                            <div className="bg-[#053040] rounded-full w-5 h-5 flex-shrink-0 flex items-center justify-center mt-0.5">
                              <span className="text-white text-xs font-bold">{index + 1}</span>
                            </div>
                            <span className="leading-relaxed">{action}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column - Sidebar */}
              <div className="space-y-6">
                {/* Author Info */}
                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <h3 className="text-xl font-bold text-[#053040] mb-4 flex items-center gap-2">
                    <User className="h-5 w-5 text-[#053040]" />
                    Penulis Laporan
                  </h3>
                  <div className="text-center">
                    <div className="bg-[#053040] rounded-full w-16 h-16 mx-auto mb-3 flex items-center justify-center text-white font-bold text-xl">
                      {report.author_name.charAt(0).toUpperCase()}
                    </div>
                    <h4 className="font-semibold text-[#053040]">{report.author_name}</h4>
                    <div className="flex items-center justify-center gap-1 text-sm text-gray-500 mt-1">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDateTime(report.created_at)}</span>
                    </div>
                  </div>
                </div>

                {/* Location */}
                {report.location && (
                  <div className="bg-white border border-gray-200 rounded-xl p-6">
                    <h3 className="text-xl font-bold text-[#053040] mb-4 flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-[#053040]" />
                      Lokasi
                    </h3>
                    <div className="space-y-3 text-sm">
                      {report.location.area_name && (
                        <div className="flex justify-between items-center py-2 border-b border-gray-100">
                          <span className="text-gray-600">Area</span>
                          <span className="font-medium text-[#053040]">{report.location.area_name}</span>
                        </div>
                      )}
                      {report.location.address && (
                        <div className="flex justify-between items-center py-2 border-b border-gray-100">
                          <span className="text-gray-600">Alamat</span>
                          <span className="font-medium text-[#053040] text-right">{report.location.address}</span>
                        </div>
                      )}
                      {report.location.latitude && report.location.longitude && (
                        <>
                          <div className="flex justify-between items-center py-2 border-b border-gray-100">
                            <span className="text-gray-600">Latitude</span>
                            <span className="font-medium text-[#053040]">{report.location.latitude.toFixed(6)}</span>
                          </div>
                          <div className="flex justify-between items-center py-2">
                            <span className="text-gray-600">Longitude</span>
                            <span className="font-medium text-[#053040]">{report.location.longitude.toFixed(6)}</span>
                          </div>
                        </>
                      )}
                    </div>
                    {report.location.latitude && report.location.longitude && (
                      <button
                        onClick={() => {
                         if (report.location?.latitude && report.location?.longitude) {
                         const url = `https://www.google.com/maps?q=${report.location.latitude},${report.location.longitude}`;
                         window.open(url, '_blank');
                         }
                         }}
                        className="w-full bg-[#053040] hover:bg-[#2C5B6B] text-white py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm font-medium mt-4"
                      >
                        <MapPin className="h-4 w-4" />
                        Buka di Maps
                      </button>
                    )}
                  </div>
                )}

                {/* Verification Info */}
                {report.verification && (
                  <div className="bg-white border border-gray-200 rounded-xl p-6">
                    <h3 className="text-xl font-bold text-[#053040] mb-4 flex items-center gap-2">
                      <Shield className="h-5 w-5 text-[#053040]" />
                      Verifikasi
                    </h3>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-gray-600">Status</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          report.verification.status === 'verified' 
                            ? 'bg-green-100 text-green-800 border border-green-200'
                            : report.verification.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                            : 'bg-red-100 text-red-800 border border-red-200'
                        }`}>
                          {report.verification.status === 'verified' ? 'Terverifikasi' : 
                           report.verification.status === 'pending' ? 'Menunggu' : 'Ditolak'}
                        </span>
                      </div>
                      {report.verification.confidence_score && (
                        <div className="flex justify-between items-center py-2 border-b border-gray-100">
                          <span className="text-gray-600">Skor Kepercayaan</span>
                          <span className="font-medium text-[#053040]">{report.verification.confidence_score}%</span>
                        </div>
                      )}
                      {report.verification.verified_at && (
                        <div className="flex justify-between items-center py-2">
                          <span className="text-gray-600">Diverifikasi</span>
                          <span className="font-medium text-[#053040] text-sm text-right">{formatDateTime(report.verification.verified_at)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Additional Conditions */}
                {report.conditions && (
                  <div className="bg-white border border-gray-200 rounded-xl p-6">
                    <h3 className="text-xl font-bold text-[#053040] mb-4 flex items-center gap-2">
                      <Waves className="h-5 w-5 text-[#053040]" />
                      Kondisi Tambahan
                    </h3>
                    <div className="space-y-3 text-sm">
                      {report.conditions.tide_level && (
                        <div className="flex justify-between items-center py-2 border-b border-gray-100">
                          <span className="text-gray-600">Level Pasang</span>
                          <span className="font-medium text-[#053040]">{report.conditions.tide_level}</span>
                        </div>
                      )}
                      {report.conditions.wind_direction && (
                        <div className="flex justify-between items-center py-2 border-b border-gray-100">
                          <span className="text-gray-600">Arah Angin</span>
                          <span className="font-medium text-[#053040]">{report.conditions.wind_direction}°</span>
                        </div>
                      )}
                      {report.conditions.current_strength && (
                        <div className="flex justify-between items-center py-2">
                          <span className="text-gray-600">Kekuatan Arus</span>
                          <span className="font-medium text-[#053040]">{report.conditions.current_strength}/10</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </LayoutNavbar>
      <Footer />
    </>
  );
}