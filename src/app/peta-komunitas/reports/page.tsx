'use client';

import { useState, useEffect, Suspense } from 'react';
import { AlertTriangle, ChevronLeft, ChevronRight, Plus, ArrowLeft } from 'lucide-react';
import LayoutNavbar from '@/components/LayoutNavbar';
import Footer from '@/components/Footer';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useTokenRefresh } from '@/app/hooks/useAuth';
import { authFetch } from '@/app/lib/api';

type Report = {
  id: string;
  author_name: string;
  created_at: string;
  description: string;
  safety_assessment: {
    overall_safety: string;
  };
};

function CommunityReportsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  
  const communityId = searchParams.get('communityId');
  const communityName = searchParams.get('communityName');
  
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;

  useTokenRefresh();

  const fetchReports = async () => {
    setLoading(true);
    setError('');

    try {
      if (!communityId) {
        throw new Error('Komunitas tidak valid');
      }

      const response = await authFetch(
        `${process.env.NEXT_PUBLIC_API_URL}/report/search?community_id=${communityId}&limit=${limit}&page=${currentPage}`
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
      if (err instanceof Error) {
        if (err.message.includes('401')) {
          setError('Sesi Anda telah habis, silakan login kembali');
        } else {
          setError(err.message || 'Terjadi kesalahan');
        }
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (communityId) {
      fetchReports();
    } else {
      router.push('/peta-komunitas');
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
      case 'safe': return 'bg-green-100 text-green-800';
      case 'caution': return 'bg-yellow-100 text-yellow-800';
      case 'danger': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSafetyIcon = (safetyLevel: string) => {
    switch (safetyLevel) {
      case 'safe': return '🟢';
      case 'caution': return '🟡';
      case 'danger': return '🔴';
      default: return '⚪';
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
                <button
                  onClick={() => router.push('/peta-komunitas')}
                  className="flex items-center gap-2 text-[#053040] hover:text-[#2C5B6B]"
                >
                  <ArrowLeft size={18} />
                  <span>Semua Komunitas</span>
                </button>
                
                <Link 
                  href={`/peta-komunitas/form-report?communityId=${communityId}&communityName=${communityName}`}
                  className="bg-[#053040] hover:bg-[#2C5B6B] text-white shadow-md flex items-center gap-2 px-4 py-2 rounded-lg transition-colors"
                >
                  <Plus size={18} />
                  Buat Laporan
                </Link>
              </div>
              
              <h1 className="text-xl font-bold text-gray-800 mt-4">
                {decodeURIComponent(communityName || '')}
              </h1>
            </div>

            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : reports.length === 0 ? (
              <div className="bg-gray-50 p-8 rounded-xl text-center border border-gray-200">
                <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-800">Belum ada laporan</h3>
                <p className="text-gray-500 mt-2">
                  Jadilah yang pertama membagikan laporan di komunitas ini
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {reports.map((report) => (
                  <div 
                    key={report.id} 
                    className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden"
                  >
                    <div className="p-5">
                      <div className="flex items-start gap-4">
                        <div className="bg-gray-200 rounded-full w-10 h-10 flex-shrink-0 flex items-center justify-center text-gray-600 font-bold">
                          {report.author_name.charAt(0).toUpperCase()}
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h2 className="font-semibold text-gray-800">{report.author_name}</h2>
                            <span className="text-xs text-gray-500">•</span>
                            <span className="text-xs text-gray-500">{formatTimeAgo(report.created_at)}</span>
                          </div>
                          
                          <p className="mt-3 text-gray-700 whitespace-pre-line">
                            {report.description}
                          </p>
                          
                          <div className="mt-4">
                            <span className={`inline-flex items-center gap-2 text-sm px-3 py-1 rounded-full ${getSafetyColor(report.safety_assessment.overall_safety)}`}>
                              <span>{getSafetyIcon(report.safety_assessment.overall_safety)}</span>
                              Status: {report.safety_assessment.overall_safety === 'safe' ? 'Aman' : 
                                      report.safety_assessment.overall_safety === 'caution' ? 'Waspada' : 
                                      'Berbahaya'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {totalPages > 1 && (
                  <div className="flex justify-between items-center mt-8">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="flex items-center px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50"
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
                      className="flex items-center px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50"
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

export default function CommunityReportsPage() {
  return (
    <Suspense fallback={
      <LayoutNavbar>
        <div className="min-h-screen pt-20 bg-white">
          <div className="max-w-2xl mx-auto p-4">
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          </div>
        </div>
      </LayoutNavbar>
    }>
      <CommunityReportsContent />
    </Suspense>
  );
}