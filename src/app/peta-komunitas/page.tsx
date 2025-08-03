'use client';

import { useState, useEffect } from 'react';
import { Users, MapPin, MessageSquare, AlertTriangle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import LayoutNavbar from '@/components/LayoutNavbar';
import Footer from '@/components/Footer';
import { auth } from '@/firebase/config';

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
};

export default function MyCommunitiesPage() {
  const [communities, setCommunities] = useState<Community[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [authError, setAuthError] = useState('');
  const router = useRouter();

  useEffect(() => {
    const fetchCommunities = async () => {
      setIsLoading(true);
      setError(null);
      setAuthError('');

      try {
        const currentUser = auth.currentUser;
        if (!currentUser) {
          setAuthError("Anda perlu login terlebih dahulu");
          setIsLoading(false);
          return;
        }

        const idToken = await currentUser.getIdToken();

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/community/my`,
          {
            headers: {
              'Authorization': `Bearer ${idToken}`
            }
          }
        );
        
        if (response.status === 401) {
          setAuthError('Sesi Anda telah habis, silakan login kembali');
          return;
        }

        if (!response.ok) {
          throw new Error("Gagal memuat komunitas Anda");
        }
        
        const data = await response.json();
        setCommunities(data.data.communities || []);

      } catch (err) {
        console.error("Error fetching communities:", err);
        setError(err instanceof Error ? err.message : "Terjadi kesalahan");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCommunities();
  }, []);

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
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        </div>
      </LayoutNavbar>
    );
  }

  if (authError || error) {
    return (
      <LayoutNavbar>
        <div className="min-h-screen pt-20 p-8 bg-white max-w-7xl mx-auto">
          <div className="bg-red-100 border-l-4 border-red-500 p-4 mb-6">
            <div className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
              <p className="text-red-700">{authError || error}</p>
            </div>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-500 text-white px-4 py-2 rounded"
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
            <h1 className="text-3xl font-bold text-[#053040]">Komunitas Saya</h1>
            <p className="text-[#5c7893]">Daftar komunitas yang Anda ikuti</p>
          </div>

          {communities.length === 0 ? (
            <div className="bg-gray-100 rounded-lg p-8 text-center">
              <p className="text-gray-600">Anda belum bergabung dengan komunitas apapun</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {communities.map((community) => (
                <div key={community.id} className="border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition">
                  {/* Banner */}
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

                  {/* Content */}
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
                        onClick={() => router.push(`/peta-komunitas/reports?communityId=${community.id}&communityName=${encodeURIComponent(community.name)}`)}
                        className="w-full bg-[#053040] text-white py-2 rounded-lg hover:bg-[#2C5B6B] transition-colors"
                      >
                        Masuk Komunitas
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </LayoutNavbar>
      <Footer />
    </>
  );
}