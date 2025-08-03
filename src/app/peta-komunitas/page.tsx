'use client';

import { useState, useEffect } from 'react';
import { Users, MapPin, MessageSquare, AlertTriangle, Loader2, Check, Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import LayoutNavbar from '@/components/LayoutNavbar';
import Footer from '@/components/Footer';
import { authFetch } from '@/app/lib/api';

type Community = {
  id: string;
  name: string;
  description: string;
  location: {
    latitude: number;
    longitude: number;
  };
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
  created_at: string;
  is_public: boolean;
  is_member: boolean;
};

export default function MyCommunitiesPage() {
  const [communities, setCommunities] = useState<Community[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loadingCommunity, setLoadingCommunity] = useState<string | null>(null);
  const [showAllCommunities, setShowAllCommunities] = useState(false);
  const [allCommunities, setAllCommunities] = useState<Community[]>([]);
  const router = useRouter();

  useEffect(() => {
    const fetchMyCommunities = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await authFetch(`${process.env.NEXT_PUBLIC_API_URL}/community/my`);
        
        if (!response.ok) {
          throw new Error('Failed to load communities');
        }
        
        const data = await response.json();
        setCommunities(data.data.communities || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error occurred");
      } finally {
        setIsLoading(false);
      }
    };

    const fetchAllCommunities = async () => {
      try {
        const response = await authFetch(`${process.env.NEXT_PUBLIC_API_URL}/community/search`);
        if (response.ok) {
          const data = await response.json();
          setAllCommunities(data.data.communities || []);
        }
      } catch (err) {
        console.error("Error fetching all communities:", err);
      }
    };

    fetchMyCommunities();
    fetchAllCommunities();
  }, []);

  const handleCommunityAction = async (communityId: string, communityName: string, isMember: boolean) => {
    try {
      setLoadingCommunity(communityId);
      setError(null);

      if (isMember) {
        router.push(`/peta-komunitas/reports?communityId=${communityId}&communityName=${encodeURIComponent(communityName)}`);
        return;
      }

      const response = await authFetch(
        `${process.env.NEXT_PUBLIC_API_URL}/community/${communityId}/join`,
        { method: 'POST' }
      );

      if (!response.ok) {
        throw new Error('Failed to join community');
      }

      const data = await response.json();
      setCommunities(prev => [...prev, data.data.community]);
      router.push(`/peta-komunitas/reports?communityId=${communityId}&communityName=${encodeURIComponent(communityName)}`);
    } catch (err: any) {
      if (err.status === 409) {
        setCommunities(prev => [...prev, err.data.community]);
        router.push(`/peta-komunitas/reports?communityId=${communityId}&communityName=${encodeURIComponent(communityName)}`);
      } else {
        setError(err instanceof Error ? err.message : 'Failed to join community');
      }
    } finally {
      setLoadingCommunity(null);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const renderCommunityCard = (community: Community, isMyCommunity: boolean) => (
    <div key={community.id} className="border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition">
      <div className="h-32 bg-gradient-to-r from-blue-500 to-teal-400 flex items-center justify-center">
        {community.banner_url ? (
          <img 
            src={community.banner_url} 
            alt={`Banner ${community.name}`} 
            className="w-full h-full object-cover"
          />
        ) : (
          <h2 className="text-white text-xl font-bold">{community.name}</h2>
        )}
      </div>
      
      <div className="p-6">
        <div className="flex items-start gap-4 mb-4">
          <div className="flex-shrink-0">
            {community.avatar_url ? (
              <img 
                src={community.avatar_url} 
                alt={`Avatar ${community.name}`}
                className="w-12 h-12 rounded-full object-cover"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-[#053040] text-white flex items-center justify-center font-bold">
                {community.name.charAt(0)}
              </div>
            )}
          </div>
          <div>
            <h3 className="font-bold text-lg text-[#053040]">{community.name}</h3>
            <p className="text-sm text-[#5c7893]">Bergabung pada {formatDate(community.created_at)}</p>
          </div>
        </div>

        <p className="text-[#053040] mb-4">{community.description}</p>

        <div className="flex flex-wrap gap-2 mb-4">
          {community.tags.map((tag) => (
            <span 
              key={tag} 
              className="bg-[#eaf9fd] text-[#053040] px-3 py-1 rounded-full text-xs"
            >
              {tag.replace(/_/g, ' ')}
            </span>
          ))}
        </div>

        <div className="flex items-center justify-between text-sm text-[#5c7893] border-t pt-4">
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            <span>{community.member_count} Anggota</span>
          </div>
          <div className="flex items-center gap-1">
            <MessageSquare className="h-4 w-4" />
            <span>{community.statistics.total_posts} Diskusi</span>
          </div>
        </div>

        <div className="mt-4">
          <button 
            onClick={() => handleCommunityAction(community.id, community.name, isMyCommunity || community.is_member)}
            disabled={loadingCommunity === community.id}
            className={`w-full ${
              isMyCommunity || community.is_member
                ? 'bg-green-500 hover:bg-green-600' 
                : 'bg-[#053040] hover:bg-[#2C5B6B]'
            } text-white py-2 rounded-lg transition-colors flex items-center justify-center ${
              loadingCommunity === community.id ? 'opacity-75' : ''
            }`}
          >
            {loadingCommunity === community.id ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Memproses...
              </>
            ) : (
              <>
                {(isMyCommunity || community.is_member) ? (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Masuk Komunitas
                  </>
                ) : (
                  'Bergabung Sekarang'
                )}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <LayoutNavbar>
        <div className="min-h-screen pt-20 p-8 bg-white max-w-7xl mx-auto">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        </div>
      </LayoutNavbar>
    );
  }

  if (error) {
    return (
      <LayoutNavbar>
        <div className="min-h-screen pt-20 p-8 bg-white max-w-7xl mx-auto">
          <div className="bg-red-100 border-l-4 border-red-500 p-4 mb-6 rounded-lg">
            <div className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
              <p className="text-red-700">{error}</p>
            </div>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
          >
            Muat Ulang
          </button>
        </div>
      </LayoutNavbar>
    );
  }

  return (
    <>
      <LayoutNavbar>
        <div className="min-h-screen pt-20 p-8 bg-white max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-[#053040]">
              {showAllCommunities ? 'Semua Komunitas' : 'Komunitas Saya'}
            </h1>
            <p className="text-[#5c7893]">
              {showAllCommunities ? 'Temukan komunitas untuk diikuti' : 'Daftar komunitas yang Anda ikuti'}
            </p>
          </div>

          {!showAllCommunities && communities.length === 0 ? (
            <div className="bg-gray-100 rounded-lg p-8 text-center">
              <p className="text-gray-600 mb-4">Anda belum bergabung dengan komunitas apapun</p>
              <button
                onClick={() => setShowAllCommunities(true)}
                className="bg-[#053040] text-white px-6 py-2 rounded-lg hover:bg-[#2C5B6B] transition-colors flex items-center gap-2 mx-auto"
              >
                <Search className="h-5 w-5" />
                Lihat Semua Komunitas
              </button>
            </div>
          ) : (
            <>
              <div className="mb-6">
                {showAllCommunities ? (
                  <button
                    onClick={() => setShowAllCommunities(false)}
                    className="bg-[#053040] text-white px-6 py-2 rounded-lg hover:bg-[#2C5B6B]"
                  >
                    {/* <ArrowLeft className="h-5 w-5" /> */}
                    Kembali ke Komunitas Saya
                  </button>
                ) : (
                  <button
                    onClick={() => setShowAllCommunities(true)}
                    className="bg-[#053040] text-white px-4 py-2 rounded-lg hover:bg-[#2C5B6B] transition-colors flex items-center gap-2"
                  >
                    <Search className="h-5 w-5" />
                    Lihat Semua Komunitas
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {(showAllCommunities ? allCommunities : communities).map((community) =>
                  renderCommunityCard(community, !showAllCommunities)
                )}
              </div>
            </>
          )}
        </div>
      </LayoutNavbar>
      <Footer />
    </>
  );
}