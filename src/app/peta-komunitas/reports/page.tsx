'use client';

import { useState, useEffect } from 'react';
import { AlertTriangle, ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import LayoutNavbar from '@/components/LayoutNavbar';
import Footer from '@/components/Footer';
import { auth } from '@/firebase/config';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

type Report = {
  id: string;
  author_name: string;
  created_at: string;
  description: string;
  safety_assessment: {
    overall_safety: string;
  };
};

export default function CommunityReportsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const communityId = searchParams.get('communityId');
  const communityName = searchParams.get('communityName');
  
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;

  const fetchReports = async () => {
    setLoading(true);
    setError('');

    try {
      const user = auth.currentUser;
      if (!user) {
        router.push('/login');
        return;
      }

      if (!communityId) {
        throw new Error('Komunitas tidak valid');
      }

      const idToken = await user.getIdToken();
      
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/report/search?community_id=${communityId}&limit=${limit}&page=${currentPage}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${idToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Gagal memuat laporan');
      }

      const data = await response.json();
      
      if (data.success) {
        setReports(data.data.reports);
        setTotalPages(Math.ceil(data.data.total / limit));
      } else {
        setError(data.message || 'Gagal memuat laporan');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (communityId) {
      fetchReports();
    }
  }, [communityId, currentPage]);

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
      return `${diffInMinutes} menit yang lalu`;
    } else if (diffInHours < 24) {
      return `${diffInHours} jam yang lalu`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays} hari yang lalu`;
    }
  };

  const getSafetyColor = (safetyLevel: string) => {
    switch (safetyLevel) {
      case 'safe': return 'text-green-600';
      case 'caution': return 'text-yellow-600';
      case 'danger': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  if (error) {
    return (
      <LayoutNavbar>
        <div className="min-h-screen pt-20 p-4 max-w-4xl mx-auto">
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
            Coba Lagi
          </button>
        </div>
      </LayoutNavbar>
    );
  }

  return (
    <>
      <LayoutNavbar>
        <div className="min-h-screen pt-20 bg-white">
          <div className="max-w-2xl mx-auto p-4">
            <div className="mb-6 sticky top-16 bg-white py-4 z-10">
              <div className="flex items-center justify-between">
                <h1 className="text-xl font-bold text-gray-800">{decodeURIComponent(communityName || '')}</h1>
                <Link 
                  href={`/peta-komunitas/form-report?communityId=${communityId}&communityName=${communityName}`}
                  className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                >
                  <Plus size={18} />
                  Buat Laporan
                </Link>
              </div>
            </div>

            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : reports.length === 0 ? (
              <div className="bg-gray-50 p-6 rounded-lg text-center">
                <p className="text-gray-500">Belum ada laporan untuk komunitas ini</p>
              </div>
            ) : (
              <div className="space-y-6">
                {reports.map((report) => (
                  <div 
                    key={report.id} 
                    className="border-b border-gray-200 pb-6 last:border-0 last:pb-0"
                  >
                    <div className="flex items-start gap-3">
                      <div className="bg-gray-200 rounded-full w-10 h-10 flex-shrink-0 flex items-center justify-center text-gray-600 font-bold">
                        {report.author_name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h2 className="font-semibold text-gray-800">{report.author_name}</h2>
                          <span className="text-xs text-gray-500">•</span>
                          <span className="text-xs text-gray-500">{formatTimeAgo(report.created_at)}</span>
                        </div>
                        
                        <p className="mt-2 text-gray-800 whitespace-pre-line">
                          {report.description}
                        </p>
                        
                        <div className="mt-3">
                          <span className={`text-sm font-medium ${getSafetyColor(report.safety_assessment.overall_safety)}`}>
                            Status: {report.safety_assessment.overall_safety.toUpperCase()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {totalPages > 1 && (
                  <div className="flex justify-between items-center mt-6">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="flex items-center px-4 py-2 border rounded-md disabled:opacity-50"
                    >
                      <ChevronLeft className="h-5 w-5 mr-1" />
                      Sebelumnya
                    </button>
                    <span className="text-gray-700">
                      Halaman {currentPage} dari {totalPages}
                    </span>
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="flex items-center px-4 py-2 border rounded-md disabled:opacity-50"
                    >
                      Selanjutnya
                      <ChevronRight className="h-5 w-5 ml-1" />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </LayoutNavbar>
      <Footer />
    </>
  );
}