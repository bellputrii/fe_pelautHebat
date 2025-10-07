'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Users, ArrowLeft, Loader2, Search, User, Shield, Crown } from 'lucide-react';
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
  };
};

type CommunityInfo = {
  id: string;
  name: string;
  avatar_url: string;
};

export default function CommunityMembersPage() {
  const params = useParams();
  const router = useRouter();
  const communityId = params.communityId as string;

  const [members, setMembers] = useState<Member[]>([]);
  const [community, setCommunity] = useState<CommunityInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchCommunityMembers = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Fetch community info
        const communityResponse = await authFetch(`${process.env.NEXT_PUBLIC_API_URL}/community/${communityId}`);
        if (communityResponse.ok) {
          const communityData = await communityResponse.json();
          setCommunity(communityData.data);
        }

        // Fetch members
        const membersResponse = await authFetch(`${process.env.NEXT_PUBLIC_API_URL}/community/${communityId}/members?limit=100`);

        if (!membersResponse.ok) {
          throw new Error('Gagal memuat daftar anggota');
        }

        const membersData = await membersResponse.json();
        setMembers(membersData.data.members || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Terjadi kesalahan yang tidak diketahui");
      } finally {
        setIsLoading(false);
      }
    };

    if (communityId) {
      fetchCommunityMembers();
    }
  }, [communityId]);

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <Crown className="h-4 w-4 text-yellow-600" />;
      case 'moderator':
        return <Shield className="h-4 w-4 text-blue-600" />;
      default:
        return <User className="h-4 w-4 text-gray-600" />;
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

  const filteredMembers = members.filter(member =>
    member.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <LayoutNavbar>
        <div className="min-h-screen pt-20 p-8 bg-white max-w-7xl mx-auto">
          <div className="flex justify-center items-center h-64">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-12 w-12 text-blue-600 animate-spin" />
              <p className="text-gray-600">Memuat daftar anggota...</p>
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
          <button
            onClick={() => router.back()}
            className="bg-[#053040] text-white px-4 py-2 rounded-lg hover:bg-[#2C5B6B] transition-colors flex items-center gap-2 mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            Kembali
          </button>
          
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
            <div className="flex items-center">
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        </div>
      </LayoutNavbar>
    );
  }

  return (
    <>
      <LayoutNavbar>
        <div className="min-h-screen pt-20 p-8 bg-white max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={() => router.back()}
              className="bg-[#053040] text-white p-2 rounded-lg hover:bg-[#2C5B6B] transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            
            <div className="flex items-center gap-3">
              {community?.avatar_url ? (
                <img 
                  src={community.avatar_url} 
                  alt={`Avatar ${community.name}`}
                  className="w-12 h-12 rounded-full object-cover"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-[#053040] text-white flex items-center justify-center font-bold">
                  {community?.name?.charAt(0)}
                </div>
              )}
              <div>
                <h1 className="text-2xl font-bold text-[#053040]">Anggota Komunitas</h1>
                <p className="text-[#5c7893]">{community?.name}</p>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
              <div className="flex items-center gap-2 mb-2">
                <Users className="h-5 w-5 text-blue-600" />
                <span className="text-sm text-blue-800">Total Anggota</span>
              </div>
              <p className="text-2xl font-bold text-[#053040]">{members.length}</p>
            </div>
            
            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100">
              <div className="flex items-center gap-2 mb-2">
                <Crown className="h-5 w-5 text-yellow-600" />
                <span className="text-sm text-yellow-800">Admin</span>
              </div>
              <p className="text-2xl font-bold text-[#053040]">
                {members.filter(m => m.role === 'admin').length}
              </p>
            </div>
            
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="h-5 w-5 text-blue-600" />
                <span className="text-sm text-blue-800">Moderator</span>
              </div>
              <p className="text-2xl font-bold text-[#053040]">
                {members.filter(m => m.role === 'moderator').length}
              </p>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
              <div className="flex items-center gap-2 mb-2">
                <User className="h-5 w-5 text-gray-600" />
                <span className="text-sm text-gray-800">Anggota</span>
              </div>
              <p className="text-2xl font-bold text-[#053040]">
                {members.filter(m => m.role === 'member').length}
              </p>
            </div>
          </div>

          {/* Search */}
          <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Cari anggota berdasarkan nama, email, atau peran..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Members List */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
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
                      Bergabung Pada
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
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
                                alt={`Avatar ${member.user.name}`}
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
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Aktif
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredMembers.length === 0 && (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">
                  {searchTerm ? 'Tidak ada anggota yang sesuai dengan pencarian' : 'Belum ada anggota dalam komunitas ini'}
                </p>
              </div>
            )}
          </div>

          {/* Pagination Info */}
          <div className="mt-4 text-sm text-gray-500">
            Menampilkan {filteredMembers.length} dari {members.length} anggota
          </div>
        </div>
      </LayoutNavbar>
      <Footer />
    </>
  );
}