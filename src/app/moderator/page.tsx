'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Users, Shield, CheckCircle, XCircle, Loader2, AlertTriangle, 
  Search, UserCheck, UserX, Crown, Filter, Eye, Calendar,
  ChevronLeft, ChevronRight, MoreVertical, MessageSquare,
  MapPin, Waves, Wind, Thermometer, Navigation
} from 'lucide-react';
import LayoutNavbar from '@/components/LayoutNavbar';
import Footer from '@/components/Footer';
import { authFetch } from '@/app/lib/api';

type Member = {
  user_id: string;
  role: 'admin' | 'moderator' | 'member';
  joined_at: string;
  user?: {
    id: string;
    name: string;
    avatar_url: string;
    email: string;
    last_active?: string;
  };
};

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
  voting?: {
    upvotes: number;
    downvotes: number;
    total_votes: number;
    accuracy_rating: number;
  };
  view_count?: number;
  verification?: {
    status: 'pending' | 'verified' | 'rejected' | 'disputed';
    verified_by?: string;
    verified_at?: string;
    confidence_score?: number;
    notes?: string;
  };
};

type Community = {
  id: string;
  name: string;
  description: string;
  member_count: number;
  avatar_url?: string;
  user_role: 'admin' | 'moderator' | 'member';
};

export default function ModeratorPage() {
  const router = useRouter();
  
  const [communities, setCommunities] = useState<Community[]>([]);
  const [selectedCommunity, setSelectedCommunity] = useState<Community | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [verificationFilter, setVerificationFilter] = useState<'all' | 'pending' | 'verified' | 'rejected'>('all');
  const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'moderator' | 'member'>('all');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;

  // Active tab
  const [activeTab, setActiveTab] = useState<'members' | 'reports'>('members');

  useEffect(() => {
    const fetchModeratorData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Fetch communities where user is moderator or admin
        const response = await authFetch(`${process.env.NEXT_PUBLIC_API_URL}/community/my`);
        
        if (!response.ok) {
          throw new Error('Gagal memuat data komunitas');
        }
        
        const data = await response.json();
        const moderatedCommunities = data.data.communities.filter(
          (community: Community) => community.user_role === 'admin' || community.user_role === 'moderator'
        );
        
        setCommunities(moderatedCommunities);
        
        if (moderatedCommunities.length > 0) {
          setSelectedCommunity(moderatedCommunities[0]);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Terjadi kesalahan yang tidak diketahui");
      } finally {
        setIsLoading(false);
      }
    };

    fetchModeratorData();
  }, []);

  useEffect(() => {
    if (selectedCommunity) {
      if (activeTab === 'members') {
        fetchCommunityMembers();
      } else {
        fetchCommunityReports();
      }
    }
  }, [selectedCommunity, activeTab, currentPage, verificationFilter]);

  const fetchCommunityMembers = async () => {
    if (!selectedCommunity) return;

    try {
      const response = await authFetch(
        `${process.env.NEXT_PUBLIC_API_URL}/community/${selectedCommunity.id}/members?limit=100`
      );

      if (!response.ok) {
        throw new Error('Gagal memuat daftar anggota');
      }

      const data = await response.json();
      setMembers(data.data.members || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memuat anggota");
    }
  };

  const fetchCommunityReports = async () => {
    if (!selectedCommunity) return;

    try {
      let url = `${process.env.NEXT_PUBLIC_API_URL}/report/search?community_id=${selectedCommunity.id}&limit=${limit}&page=${currentPage}`;
      
      if (verificationFilter !== 'all') {
        url += `&verification_status=${verificationFilter}`;
      }

      const response = await authFetch(url);

      if (!response.ok) {
        throw new Error('Gagal memuat laporan');
      }

      const data = await response.json();
      setReports(data.data.reports || []);
      setTotalPages(Math.ceil(data.data.total / limit));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memuat laporan");
    }
  };

  const handlePromoteToModerator = async (userId: string) => {
    if (!selectedCommunity) return;

    try {
      setLoadingAction(`promote-${userId}`);
      const response = await authFetch(
        `${process.env.NEXT_PUBLIC_API_URL}/community/${selectedCommunity.id}/moderators`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId })
        }
      );

      if (!response.ok) {
        throw new Error('Gagal menambahkan moderator');
      }

      // Update local state
      setMembers(prev =>
        prev.map(member =>
          member.user_id === userId ? { ...member, role: 'moderator' } : member
        )
      );
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Terjadi kesalahan');
    } finally {
      setLoadingAction(null);
    }
  };

  const handleRemoveModerator = async (userId: string) => {
    if (!selectedCommunity) return;

    try {
      setLoadingAction(`remove-${userId}`);
      const response = await authFetch(
        `${process.env.NEXT_PUBLIC_API_URL}/community/${selectedCommunity.id}/moderators`,
        {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId })
        }
      );

      if (!response.ok) {
        throw new Error('Gagal menghapus moderator');
      }

      // Update local state
      setMembers(prev =>
        prev.map(member =>
          member.user_id === userId ? { ...member, role: 'member' } : member
        )
      );
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Terjadi kesalahan');
    } finally {
      setLoadingAction(null);
    }
  };

  const handleVerifyReport = async (reportId: string, status: 'verified' | 'rejected' | 'disputed') => {
    if (!selectedCommunity) return;

    try {
      setLoadingAction(`verify-${reportId}`);
      const response = await authFetch(
        `${process.env.NEXT_PUBLIC_API_URL}/report/${reportId}/verify`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            status,
            notes: status === 'verified' ? 'Laporan telah diverifikasi oleh moderator' : 'Laporan ditolak oleh moderator'
          })
        }
      );

      if (!response.ok) {
        throw new Error('Gagal memverifikasi laporan');
      }

      // Update local state
      setReports(prev =>
        prev.map(report =>
          report.id === reportId 
            ? { 
                ...report, 
                verification: { 
                  status,
                  verified_at: new Date().toISOString(),
                  confidence_score: status === 'verified' ? 90 : 30
                }
              } 
            : report
        )
      );
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Terjadi kesalahan');
    } finally {
      setLoadingAction(null);
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <Crown className="h-4 w-4 text-yellow-600" />;
      case 'moderator':
        return <Shield className="h-4 w-4 text-blue-600" />;
      default:
        return <Users className="h-4 w-4 text-gray-600" />;
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Administrator';
      case 'moderator':
        return 'Moderator';
      default:
        return 'Anggota';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'moderator':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getVerificationColor = (status: string) => {
    switch (status) {
      case 'verified':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'disputed':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
  };

  const getVerificationLabel = (status: string) => {
    switch (status) {
      case 'verified':
        return 'Terverifikasi';
      case 'rejected':
        return 'Ditolak';
      case 'disputed':
        return 'Diperdebatkan';
      default:
        return 'Menunggu';
    }
  };

  const getSafetyColor = (safetyLevel: string) => {
    switch (safetyLevel) {
      case 'safe': return 'bg-green-100 text-green-800 border-green-200';
      case 'caution': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'danger': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatTimeAgo = (dateString: string) => {
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

  // Filter members based on search and role filter
  const filteredMembers = members.filter(member => {
    const matchesSearch = member.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.user?.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || member.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  if (isLoading) {
    return (
      <LayoutNavbar>
        <div className="min-h-screen pt-20 p-8 bg-white max-w-7xl mx-auto">
          <div className="flex justify-center items-center h-64">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-12 w-12 text-[#053040] animate-spin" />
              <p className="text-gray-600">Memuat data moderator...</p>
            </div>
          </div>
        </div>
      </LayoutNavbar>
    );
  }

  if (error) {
    return (
      <LayoutNavbar>
        <div className="min-h-screen pt-20 p-8 bg-white max-w-7xl mx-auto">
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-lg">
            <div className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
              <p className="text-red-700">{error}</p>
            </div>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="bg-[#053040] text-white px-4 py-2 rounded-lg hover:bg-[#2C5B6B] transition-colors"
          >
            Muat Ulang
          </button>
        </div>
      </LayoutNavbar>
    );
  }

  if (communities.length === 0) {
    return (
      <LayoutNavbar>
        <div className="min-h-screen pt-20 p-8 bg-white max-w-7xl mx-auto">
          <div className="text-center py-12">
            <Shield className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-[#053040] mb-2">Bukan Moderator</h2>
            <p className="text-gray-600 mb-6">
              Anda belum menjadi moderator atau admin di komunitas manapun.
            </p>
            <button
              onClick={() => router.push('/peta-komunitas')}
              className="bg-[#053040] text-white px-6 py-2 rounded-lg hover:bg-[#2C5B6B] transition-colors"
            >
              Lihat Komunitas
            </button>
          </div>
        </div>
      </LayoutNavbar>
    );
  }

  return (
    <>
      <LayoutNavbar>
        <div className="min-h-screen pt-20 bg-gray-50">
          <div className="max-w-7xl mx-auto p-4">
            {/* Header */}
            <div className="mb-6 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-[#053040] mb-2">Panel Moderator</h1>
                  <p className="text-gray-600">Kelola anggota dan verifikasi laporan di komunitas Anda</p>
                </div>
                
                {/* Community Selector */}
                <div className="flex items-center gap-4">
                  <label className="text-sm font-medium text-[#053040]">Pilih Komunitas:</label>
                  <select
                    value={selectedCommunity?.id || ''}
                    onChange={(e) => {
                      const community = communities.find(c => c.id === e.target.value);
                      setSelectedCommunity(community || null);
                      setCurrentPage(1);
                    }}
                    className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#053040] focus:border-transparent"
                  >
                    {communities.map(community => (
                      <option key={community.id} value={community.id}>
                        {community.name} ({getRoleLabel(community.user_role)})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {selectedCommunity && (
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Sidebar */}
                <div className="lg:col-span-1 space-y-6">
                  {/* Community Info */}
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center gap-3 mb-4">
                      {selectedCommunity.avatar_url ? (
                        <img 
                          src={selectedCommunity.avatar_url} 
                          alt={selectedCommunity.name}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-[#053040] text-white flex items-center justify-center font-bold text-lg">
                          {selectedCommunity.name.charAt(0)}
                        </div>
                      )}
                      <div>
                        <h3 className="font-bold text-[#053040]">{selectedCommunity.name}</h3>
                        <p className="text-sm text-gray-600">{selectedCommunity.member_count} anggota</p>
                      </div>
                    </div>
                    <p className="text-gray-700 text-sm mb-4">{selectedCommunity.description}</p>
                    <div className={`px-3 py-1 rounded-full text-xs font-medium border inline-block ${
                      selectedCommunity.user_role === 'admin' 
                        ? 'bg-yellow-100 text-yellow-800 border-yellow-200'
                        : 'bg-blue-100 text-blue-800 border-blue-200'
                    }`}>
                      {getRoleLabel(selectedCommunity.user_role)}
                    </div>
                  </div>

                  {/* Quick Stats */}
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 className="font-bold text-[#053040] mb-4 flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      Statistik Cepat
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Total Anggota</span>
                        <span className="font-bold text-[#053040]">{members.length}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Moderator</span>
                        <span className="font-bold text-[#053040]">
                          {members.filter(m => m.role === 'moderator').length}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Laporan Menunggu</span>
                        <span className="font-bold text-[#053040]">
                          {reports.filter(r => r.verification?.status === 'pending').length}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Main Content */}
                <div className="lg:col-span-3 space-y-6">
                  {/* Tabs */}
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-1">
                    <div className="flex space-x-1">
                      <button
                        onClick={() => setActiveTab('members')}
                        className={`flex-1 py-3 px-4 rounded-lg text-center font-medium transition-colors ${
                          activeTab === 'members'
                            ? 'bg-[#053040] text-white'
                            : 'text-gray-600 hover:text-[#053040] hover:bg-gray-50'
                        }`}
                      >
                        <Users className="h-5 w-5 inline mr-2" />
                        Kelola Anggota
                      </button>
                      <button
                        onClick={() => setActiveTab('reports')}
                        className={`flex-1 py-3 px-4 rounded-lg text-center font-medium transition-colors ${
                          activeTab === 'reports'
                            ? 'bg-[#053040] text-white'
                            : 'text-gray-600 hover:text-[#053040] hover:bg-gray-50'
                        }`}
                      >
                        <Shield className="h-5 w-5 inline mr-2" />
                        Verifikasi Laporan
                      </button>
                    </div>
                  </div>

                  {/* Tab Content */}
                  {activeTab === 'members' ? (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                      {/* Members Header */}
                      <div className="p-6 border-b border-gray-200">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                          <h2 className="text-xl font-bold text-[#053040]">Daftar Anggota</h2>
                          
                          <div className="flex flex-col sm:flex-row gap-3">
                            {/* Search */}
                            <div className="relative">
                              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                              <input
                                type="text"
                                placeholder="Cari anggota..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#053040] focus:border-transparent w-full sm:w-64"
                              />
                            </div>
                            
                            {/* Role Filter */}
                            <select
                              value={roleFilter}
                              onChange={(e) => setRoleFilter(e.target.value as any)}
                              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#053040] focus:border-transparent"
                            >
                              <option value="all">Semua Peran</option>
                              <option value="admin">Admin</option>
                              <option value="moderator">Moderator</option>
                              <option value="member">Anggota</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      {/* Members List */}
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Anggota
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Peran
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Bergabung
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Aksi
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {filteredMembers.map((member) => (
                              <tr key={member.user_id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="flex items-center gap-3">
                                    <div className="flex-shrink-0">
                                      {member.user?.avatar_url ? (
                                        <img 
                                          src={member.user.avatar_url} 
                                          alt={member.user.name}
                                          className="w-10 h-10 rounded-full object-cover"
                                        />
                                      ) : (
                                        <div className="w-10 h-10 rounded-full bg-[#053040] text-white flex items-center justify-center font-bold">
                                          {member.user?.name?.charAt(0) || 'U'}
                                        </div>
                                      )}
                                    </div>
                                    <div>
                                      <div className="font-medium text-[#053040]">
                                        {member.user?.name || 'Unknown User'}
                                      </div>
                                      <div className="text-sm text-gray-500">
                                        {member.user?.email || 'No email'}
                                      </div>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="flex items-center gap-2">
                                    {getRoleIcon(member.role)}
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getRoleColor(member.role)}`}>
                                      {getRoleLabel(member.role)}
                                    </span>
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {formatDate(member.joined_at)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {member.role === 'member' && (
                                    <button
                                      onClick={() => handlePromoteToModerator(member.user_id)}
                                      disabled={loadingAction === `promote-${member.user_id}`}
                                      className="text-blue-600 hover:text-blue-900 flex items-center gap-1 disabled:opacity-50"
                                    >
                                      {loadingAction === `promote-${member.user_id}` ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                      ) : (
                                        <UserCheck className="h-4 w-4" />
                                      )}
                                      Jadikan Moderator
                                    </button>
                                  )}
                                  {member.role === 'moderator' && member.user_id !== selectedCommunity.id && (
                                    <button
                                      onClick={() => handleRemoveModerator(member.user_id)}
                                      disabled={loadingAction === `remove-${member.user_id}`}
                                      className="text-orange-600 hover:text-orange-900 flex items-center gap-1 disabled:opacity-50"
                                    >
                                      {loadingAction === `remove-${member.user_id}` ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                      ) : (
                                        <UserX className="h-4 w-4" />
                                      )}
                                      Turunkan
                                    </button>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>

                        {filteredMembers.length === 0 && (
                          <div className="text-center py-12">
                            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-500">
                              {searchTerm ? 'Tidak ada anggota yang sesuai dengan pencarian' : 'Belum ada anggota dalam komunitas ini'}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                      {/* Reports Header */}
                      <div className="p-6 border-b border-gray-200">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                          <h2 className="text-xl font-bold text-[#053040]">Verifikasi Laporan</h2>
                          
                          <div className="flex items-center gap-3">
                            <Filter className="h-4 w-4 text-gray-400" />
                            <select
                              value={verificationFilter}
                              onChange={(e) => {
                                setVerificationFilter(e.target.value as any);
                                setCurrentPage(1);
                              }}
                              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#053040] focus:border-transparent"
                            >
                              <option value="all">Semua Status</option>
                              <option value="pending">Menunggu Verifikasi</option>
                              <option value="verified">Terverifikasi</option>
                              <option value="rejected">Ditolak</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      {/* Reports List */}
                      <div className="divide-y divide-gray-200">
                        {reports.map((report) => (
                          <div key={report.id} className="p-6 hover:bg-gray-50 transition-colors">
                            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                              <div className="flex-1">
                                <div className="flex items-start justify-between mb-3">
                                  <div className="flex items-center gap-2">
                                    <div className="bg-gradient-to-br from-[#053040] to-[#2C5B6B] rounded-full w-8 h-8 flex-shrink-0 flex items-center justify-center text-white font-medium text-sm">
                                      {report.author_name.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                      <h3 className="font-medium text-gray-900">{report.author_name}</h3>
                                      <div className="flex items-center gap-1 text-xs text-gray-500">
                                        <Calendar className="w-3 h-3" />
                                        <span>{formatTimeAgo(report.created_at)}</span>
                                      </div>
                                    </div>
                                  </div>
                                  
                                  <div className="flex items-center gap-2">
                                    <div className={`px-2 py-1 rounded-lg border text-xs font-medium ${getSafetyColor(report.safety_assessment.overall_safety)}`}>
                                      {report.safety_assessment.overall_safety === 'safe' ? 'Aman' : 
                                       report.safety_assessment.overall_safety === 'caution' ? 'Waspada' : 'Berbahaya'}
                                    </div>
                                    <div className={`px-2 py-1 rounded-lg border text-xs font-medium ${getVerificationColor(report.verification?.status || 'pending')}`}>
                                      {getVerificationLabel(report.verification?.status || 'pending')}
                                    </div>
                                  </div>
                                </div>

                                <h4 className="font-semibold text-gray-900 mb-2">{report.title}</h4>
                                <p className="text-gray-700 text-sm leading-relaxed mb-3 line-clamp-2">
                                  {report.description}
                                </p>

                                {/* Conditions */}
                                <div className="flex flex-wrap gap-2 text-xs text-gray-600 mb-3">
                                  {report.location?.area_name && (
                                    <div className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded">
                                      <MapPin className="w-3 h-3" />
                                      <span>{report.location.area_name}</span>
                                    </div>
                                  )}
                                  {report.conditions?.wave_height && (
                                    <div className="flex items-center gap-1 bg-blue-50 text-blue-700 px-2 py-1 rounded">
                                      <Waves className="w-3 h-3" />
                                      <span>Gelombang: {report.conditions.wave_height}m</span>
                                    </div>
                                  )}
                                  {report.conditions?.wind_speed && (
                                    <div className="flex items-center gap-1 bg-green-50 text-green-700 px-2 py-1 rounded">
                                      <Wind className="w-3 h-3" />
                                      <span>Angin: {report.conditions.wind_speed} km/jam</span>
                                    </div>
                                  )}
                                </div>

                                {/* Voting Stats */}
                                <div className="flex items-center gap-4 text-xs text-gray-500">
                                  {report.voting && (
                                    <>
                                      <div className="flex items-center gap-1">
                                        <span>👍 {report.voting.upvotes}</span>
                                        <span>👎 {report.voting.downvotes}</span>
                                      </div>
                                      {report.voting.accuracy_rating && (
                                        <div>Rating: {report.voting.accuracy_rating}/5</div>
                                      )}
                                    </>
                                  )}
                                  {report.view_count && (
                                    <div className="flex items-center gap-1">
                                      <Eye className="w-3 h-3" />
                                      <span>{report.view_count} dilihat</span>
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Verification Actions */}
                              <div className="flex flex-col gap-2 lg:w-48">
                                {report.verification?.status === 'pending' && (
                                  <>
                                    <button
                                      onClick={() => handleVerifyReport(report.id, 'verified')}
                                      disabled={loadingAction === `verify-${report.id}`}
                                      className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                                    >
                                      {loadingAction === `verify-${report.id}` ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                      ) : (
                                        <CheckCircle className="h-4 w-4" />
                                      )}
                                      Setujui
                                    </button>
                                    <button
                                      onClick={() => handleVerifyReport(report.id, 'rejected')}
                                      disabled={loadingAction === `verify-${report.id}`}
                                      className="w-full bg-red-600 hover:bg-red-700 text-white py-2 px-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                                    >
                                      {loadingAction === `verify-${report.id}` ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                      ) : (
                                        <XCircle className="h-4 w-4" />
                                      )}
                                      Tolak
                                    </button>
                                  </>
                                )}
                                <button
                                  onClick={() => router.push(`/peta-komunitas/reports/${report.id}`)}
                                  className="w-full bg-[#053040] hover:bg-[#2C5B6B] text-white py-2 px-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                                >
                                  <Eye className="h-4 w-4" />
                                  Lihat Detail
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}

                        {reports.length === 0 && (
                          <div className="text-center py-12">
                            <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-500">
                              {verificationFilter === 'all' 
                                ? 'Belum ada laporan dalam komunitas ini'
                                : `Tidak ada laporan dengan status ${verificationFilter}`
                              }
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Pagination */}
                      {totalPages > 1 && (
                        <div className="p-6 border-t border-gray-200">
                          <div className="flex justify-between items-center">
                            <button
                              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                              disabled={currentPage === 1}
                              className="flex items-center gap-1 px-3 py-1.5 border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50 transition-colors text-sm"
                            >
                              <ChevronLeft className="h-4 w-4" />
                              <span>Sebelumnya</span>
                            </button>
                            <span className="text-gray-700 font-medium text-sm">
                              {currentPage} / {totalPages}
                            </span>
                            <button
                              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                              disabled={currentPage === totalPages}
                              className="flex items-center gap-1 px-3 py-1.5 border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50 transition-colors text-sm"
                            >
                              <span>Selanjutnya</span>
                              <ChevronRight className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </LayoutNavbar>
      <Footer />
    </>
  );
}