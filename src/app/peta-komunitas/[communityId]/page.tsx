'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  Users, MapPin, MessageSquare, AlertTriangle, Loader2, ArrowLeft, 
  Calendar, Settings, LogOut, UserCheck, Flag, Clock, Eye,
  ChevronRight, Navigation, Shield, Zap
} from 'lucide-react';
import LayoutNavbar from '@/components/LayoutNavbar';
import Footer from '@/components/Footer';
import { authFetch } from '@/app/lib/api';

type CommunityDetail = {
  id: string;
  name: string;
  description: string;
  location: {
    latitude: number;
    longitude: number;
  };
  admin_id: string;
  moderators: string[];
  members: string[];
  member_count: number;
  tags: string[];
  avatar_url: string;
  banner_url: string;
  rules: string[];
  statistics: {
    total_posts: number;
    total_reports: number;
    active_members: number;
    last_activity: string | null;
  };
  user_role: 'admin' | 'moderator' | 'member' | null;
  created_at: string;
  is_public: boolean;
};

export default function CommunityDetailPage() {
  const params = useParams();
  const router = useRouter();
  const communityId = params.communityId as string;

  const [community, setCommunity] = useState<CommunityDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    const fetchCommunityDetail = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await authFetch(`${process.env.NEXT_PUBLIC_API_URL}/community/${communityId}`);

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Komunitas tidak ditemukan');
          }
          throw new Error('Gagal memuat detail komunitas');
        }

        const data = await response.json();
        setCommunity(data.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Terjadi kesalahan yang tidak diketahui");
      } finally {
        setIsLoading(false);
      }
    };

    if (communityId) {
      fetchCommunityDetail();
    }
  }, [communityId]);

  const handleLeaveCommunity = async () => {
    if (!community) return;

    if (community.user_role === 'admin') {
      alert('Admin tidak bisa keluar dari komunitas. Silakan transfer kepemilikan terlebih dahulu.');
      return;
    }

    if (!confirm('Apakah Anda yakin ingin keluar dari komunitas ini?')) {
      return;
    }

    try {
      setLeaving(true);
      const response = await authFetch(
        `${process.env.NEXT_PUBLIC_API_URL}/community/${communityId}/leave`,
        { method: 'POST' }
      );

      if (!response.ok) {
        throw new Error('Gagal keluar dari komunitas');
      }

      router.push('/peta-komunitas');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal keluar dari komunitas');
    } finally {
      setLeaving(false);
    }
  };

  const handleViewMembers = () => {
    router.push(`/peta-komunitas/${communityId}/members`);
  };

  const handleViewReports = () => {
    router.push(`/peta-komunitas/reports?communityId=${communityId}&communityName=${encodeURIComponent(community?.name || '')}`);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTimeAgo = (dateString: string | null) => {
    if (!dateString) return 'Belum ada aktivitas';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
      return `${diffInMinutes}m lalu`;
    } else if (diffInHours < 24) {
      return `${diffInHours}j lalu`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays}h lalu`;
    }
  };

  if (isLoading) {
    return (
      <LayoutNavbar>
        <div className="min-h-screen pt-20 bg-white">
          <div className="max-w-4xl mx-auto p-4">
            <div className="flex justify-center items-center h-64">
              <div className="flex flex-col items-center gap-4">
                <Loader2 className="h-12 w-12 text-[#053040] animate-spin" />
                <p className="text-gray-600">Memuat detail komunitas...</p>
              </div>
            </div>
          </div>
        </div>
      </LayoutNavbar>
    );
  }

  if (error || !community) {
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
                <p className="text-red-700">{error || 'Komunitas tidak ditemukan'}</p>
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
                  <h1 className="text-2xl font-bold text-[#053040]">Detail Komunitas</h1>
                  <p className="text-gray-600">Informasi lengkap tentang komunitas</p>
                </div>
              </div>

              {/* Community Header Card */}
              <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
                <div className="flex flex-col md:flex-row md:items-start gap-6">
                  <div className="flex-shrink-0">
                    {community.avatar_url ? (
                      <img 
                        src={community.avatar_url} 
                        alt={`Avatar ${community.name}`}
                        className="w-20 h-20 rounded-xl object-cover border-2 border-gray-200"
                      />
                    ) : (
                      <div className="w-20 h-20 rounded-xl bg-[#053040] text-white flex items-center justify-center font-bold text-2xl border-2 border-gray-200">
                        {community.name.charAt(0)}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
                      <div>
                        <h1 className="text-2xl font-bold text-[#053040] mb-2">{community.name}</h1>
                        <div className="flex items-center gap-4 text-gray-600 mb-3">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            <span className="text-sm">Dibuat {formatDate(community.created_at)}</span>
                          </div>
                          {community.user_role && (
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                              community.user_role === 'admin' 
                                ? 'bg-red-100 text-red-800 border border-red-200'
                                : community.user_role === 'moderator'
                                ? 'bg-blue-100 text-blue-800 border border-blue-200'
                                : 'bg-green-100 text-green-800 border border-green-200'
                            }`}>
                              {community.user_role === 'admin' ? 'Admin' : 
                               community.user_role === 'moderator' ? 'Moderator' : 'Anggota'}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <button
                          onClick={handleViewReports}
                          className="bg-[#053040] hover:bg-[#2C5B6B] text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2 text-sm"
                        >
                          <Eye className="h-4 w-4" />
                          Lihat Laporan
                        </button>
                        
                        {community.user_role && community.user_role !== 'admin' && (
                          <button
                            onClick={handleLeaveCommunity}
                            disabled={leaving}
                            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2 text-sm disabled:opacity-75"
                          >
                            {leaving ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <LogOut className="h-4 w-4" />
                            )}
                            Keluar
                          </button>
                        )}
                      </div>
                    </div>

                    <p className="text-gray-700 mb-4">{community.description}</p>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2">
                      {community.tags.map((tag) => (
                        <span 
                          key={tag} 
                          className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs border border-gray-300"
                        >
                          {tag.replace(/_/g, ' ')}
                        </span>
                      ))}
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
                {/* Statistics Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-white border border-gray-200 rounded-xl p-4 text-center">
                    <div className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-2">
                      <Users className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="text-2xl font-bold text-[#053040]">{community.member_count}</div>
                    <div className="text-sm text-gray-600">Anggota</div>
                  </div>
                  
                  <div className="bg-white border border-gray-200 rounded-xl p-4 text-center">
                    <div className="bg-green-100 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-2">
                      <Flag className="h-6 w-6 text-green-600" />
                    </div>
                    <div className="text-2xl font-bold text-[#053040]">{community.statistics.total_reports}</div>
                    <div className="text-sm text-gray-600">Laporan</div>
                  </div>
                  
                  <div className="bg-white border border-gray-200 rounded-xl p-4 text-center">
                    <div className="bg-purple-100 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-2">
                      <MessageSquare className="h-6 w-6 text-purple-600" />
                    </div>
                    <div className="text-2xl font-bold text-[#053040]">{community.statistics.total_posts}</div>
                    <div className="text-sm text-gray-600">Diskusi</div>
                  </div>
                  
                  <div className="bg-white border border-gray-200 rounded-xl p-4 text-center">
                    <div className="bg-orange-100 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-2">
                      <Clock className="h-6 w-6 text-orange-600" />
                    </div>
                    <div className="text-sm font-bold text-[#053040]">{formatTimeAgo(community.statistics.last_activity)}</div>
                    <div className="text-sm text-gray-600">Aktivitas</div>
                  </div>
                </div>

                {/* About Community */}
                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <h3 className="text-xl font-bold text-[#053040] mb-4 flex items-center gap-2">
                    <Shield className="h-5 w-5 text-[#053040]" />
                    Tentang Komunitas
                  </h3>
                  <p className="text-gray-700 leading-relaxed mb-6">
                    {community.description}
                  </p>
                  
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-bold text-[#053040] mb-2">Status Keanggotaan</h4>
                    <p className="text-gray-700">
                      {community.user_role ? (
                        <>Anda adalah <strong className="text-[#053040]">{community.user_role === 'admin' ? 'Administrator' : 
                          community.user_role === 'moderator' ? 'Moderator' : 'Anggota'}</strong> dari komunitas ini.</>
                      ) : (
                        'Anda belum bergabung dengan komunitas ini.'
                      )}
                    </p>
                  </div>
                </div>

                {/* Quick Actions */}
                {community.user_role && (
                  <div className="bg-white border border-gray-200 rounded-xl p-6">
                    <h3 className="text-xl font-bold text-[#053040] mb-4 flex items-center gap-2">
                      <Zap className="h-5 w-5 text-[#053040]" />
                      Aksi Cepat
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <button
                        onClick={handleViewReports}
                        className="bg-white hover:bg-gray-50 text-gray-700 p-4 rounded-lg border border-gray-300 transition-all duration-200 flex items-center gap-3 group hover:border-[#053040]"
                      >
                        <div className="bg-blue-100 p-2 rounded-lg">
                          <Flag className="h-5 w-5 text-blue-600" />
                        </div>
                        <div className="text-left flex-1">
                          <div className="font-bold text-[#053040]">Lihat Laporan</div>
                          <div className="text-sm text-gray-600">Pantau kondisi terkini</div>
                        </div>
                        <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-[#053040]" />
                      </button>
                      
                      <button
                        onClick={handleViewMembers}
                        className="bg-white hover:bg-gray-50 text-gray-700 p-4 rounded-lg border border-gray-300 transition-all duration-200 flex items-center gap-3 group hover:border-[#053040]"
                      >
                        <div className="bg-green-100 p-2 rounded-lg">
                          <UserCheck className="h-5 w-5 text-green-600" />
                        </div>
                        <div className="text-left flex-1">
                          <div className="font-bold text-[#053040]">Kelola Anggota</div>
                          <div className="text-sm text-gray-600">Lihat daftar anggota</div>
                        </div>
                        <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-[#053040]" />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column - Sidebar */}
              <div className="space-y-6">
                {/* Community Rules */}
                {community.rules && community.rules.length > 0 && (
                  <div className="bg-white border border-gray-200 rounded-xl p-6">
                    <h3 className="text-xl font-bold text-[#053040] mb-4 flex items-center gap-2">
                      <Shield className="h-5 w-5 text-[#053040]" />
                      Aturan Komunitas
                    </h3>
                    <ul className="space-y-3">
                      {community.rules.map((rule, index) => (
                        <li key={index} className="flex items-start gap-3 text-gray-700">
                          <div className="bg-[#053040] rounded-full w-6 h-6 flex-shrink-0 flex items-center justify-center mt-0.5">
                            <span className="text-white text-xs font-bold">{index + 1}</span>
                          </div>
                          <span className="leading-relaxed text-sm">{rule}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Location */}
                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <h3 className="text-xl font-bold text-[#053040] mb-4 flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-[#053040]" />
                    Lokasi
                  </h3>
                  <div className="flex items-center gap-2 text-gray-700 mb-3">
                    <Navigation className="h-4 w-4" />
                    <span className="text-sm">
                      {community.location.latitude.toFixed(4)}°N, {community.location.longitude.toFixed(4)}°E
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      const url = `https://www.google.com/maps?q=${community.location.latitude},${community.location.longitude}`;
                      window.open(url, '_blank');
                    }}
                    className="w-full bg-[#053040] hover:bg-[#2C5B6B] text-white py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm font-medium"
                  >
                    <MapPin className="h-4 w-4" />
                    Buka di Maps
                  </button>
                </div>

                {/* Community Info */}
                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <h3 className="text-xl font-bold text-[#053040] mb-4 flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-[#053040]" />
                    Informasi
                  </h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-gray-600">Dibuat</span>
                      <span className="font-medium text-[#053040]">{formatDate(community.created_at)}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-gray-600">Status</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        community.is_public 
                          ? 'bg-green-100 text-green-800 border border-green-200'
                          : 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                      }`}>
                        {community.is_public ? 'Publik' : 'Privat'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-gray-600">Anggota Aktif</span>
                      <span className="font-medium text-[#053040]">{community.statistics.active_members}</span>
                    </div>
                  </div>
                </div>

                {/* Members Action */}
                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <h3 className="text-xl font-bold text-[#053040] mb-4 flex items-center gap-2">
                    <Users className="h-5 w-5 text-[#053040]" />
                    Anggota
                  </h3>
                  <p className="text-gray-700 text-sm mb-4">
                    Kelola anggota komunitas dan lihat informasi detail
                  </p>
                  <button
                    onClick={handleViewMembers}
                    className="w-full bg-white hover:bg-gray-50 text-[#053040] border border-[#053040] py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm font-medium"
                  >
                    <UserCheck className="h-4 w-4" />
                    Lihat Semua Anggota
                  </button>
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