'use client';

import { useState, useEffect, Suspense } from 'react';
import { AlertTriangle, ChevronLeft, ChevronRight, Plus, ArrowLeft, MessageCircle, Send, MapPin, Calendar, User, Flag, Users, ThumbsUp, ThumbsDown, Eye, X } from 'lucide-react';
import LayoutNavbar from '@/components/LayoutNavbar';
import Footer from '@/components/Footer';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useTokenRefresh } from '@/app/hooks/useAuth';
import { authFetch } from '@/app/lib/api';

type Comment = {
  id: string;
  author_name: string;
  content: string;
  created_at: string;
};

type VotingInfo = {
  upvotes: number;
  downvotes: number;
  total_votes: number;
  accuracy_rating: number;
  user_vote?: 'up' | 'down' | null;
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
  comments: Comment[];
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
  voting?: VotingInfo;
  view_count?: number;
  verification?: {
    status: string;
    verified_by?: string;
    verified_at?: string;
    confidence_score?: number;
  };
};

type CommunityMember = {
  id: string;
  name: string;
  role: string;
  joined_at: string;
};

type CommunityDetail = {
  id: string;
  name: string;
  description: string;
  member_count: number;
  members: CommunityMember[];
  created_at: string;
};

function CommunityReportsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const communityId = searchParams.get('communityId');
  const communityName = searchParams.get('communityName');
  
  const [reports, setReports] = useState<Report[]>([]);
  const [communityDetail, setCommunityDetail] = useState<CommunityDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [commentInputs, setCommentInputs] = useState<{ [key: string]: string }>({});
  const [expandedComments, setExpandedComments] = useState<{ [key: string]: boolean }>({});
  const [loadingStates, setLoadingStates] = useState<{ 
    commenting: { [key: string]: boolean };
    voting: { [key: string]: boolean };
    detail: boolean;
  }>({
    commenting: {},
    voting: {},
    detail: false
  });
  
  // Modal states
  const [showCommunityModal, setShowCommunityModal] = useState(false);
  const [showVoteAlert, setShowVoteAlert] = useState(false);
  
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
        
        // Reset comment inputs and expanded comments
        const newCommentInputs: { [key: string]: string } = {};
        const newExpandedComments: { [key: string]: boolean } = {};
        data.data.reports.forEach((report: Report) => {
          newCommentInputs[report.id] = '';
          newExpandedComments[report.id] = false;
        });
        setCommentInputs(newCommentInputs);
        setExpandedComments(newExpandedComments);
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

  const fetchCommunityDetail = async () => {
    setLoadingStates(prev => ({ ...prev, detail: true }));
    try {
      const response = await authFetch(
        `${process.env.NEXT_PUBLIC_API_URL}/community/${communityId}`
      );

      if (!response.ok) {
        throw new Error('Gagal memuat detail komunitas');
      }

      const data = await response.json();
      if (data.success) {
        setCommunityDetail(data.data);
      }
    } catch (err) {
      console.error('Error fetching community detail:', err);
    } finally {
      setLoadingStates(prev => ({ ...prev, detail: false }));
    }
  };

  const handleViewReportDetail = (reportId: string) => {
    router.push(`/peta-komunitas/reports/${reportId}`);
  };

  const handleVote = async (reportId: string, voteType: 'up' | 'down') => {
    // Cek apakah user adalah author dari report
    const report = reports.find(r => r.id === reportId);
    // Untuk demo, kita asumsikan current user ID bisa didapat dari auth context
    // Dalam implementasi real, ganti dengan cara mendapatkan user_id yang sedang login
    const currentUserId = 'current_user_id'; // Ganti dengan user ID sebenarnya
    
    if (report && report.author_id === currentUserId) {
      setShowVoteAlert(true);
      return;
    }

    setLoadingStates(prev => ({
      ...prev,
      voting: { ...prev.voting, [reportId]: true }
    }));

    try {
      const response = await authFetch(
        `${process.env.NEXT_PUBLIC_API_URL}/report/${reportId}/vote`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            vote_type: voteType
          })
        }
      );

      if (!response.ok) {
        if (response.status === 403) {
          setShowVoteAlert(true);
          return;
        }
        throw new Error('Gagal melakukan vote');
      }

      const data = await response.json();
      
      if (data.success) {
        // Update reports list
        setReports(prev => prev.map(report => {
          if (report.id === reportId) {
            return {
              ...report,
              voting: data.data.voting
            };
          }
          return report;
        }));
      }
    } catch (err) {
      console.error('Error voting:', err);
      if (err instanceof Error && !err.message.includes('403')) {
        alert('Gagal melakukan vote');
      }
    } finally {
      setLoadingStates(prev => ({
        ...prev,
        voting: { ...prev.voting, [reportId]: false }
      }));
    }
  };

  const toggleComments = (reportId: string) => {
    setExpandedComments(prev => ({
      ...prev,
      [reportId]: !prev[reportId]
    }));
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
      return `${diffInMinutes}m`;
    } else if (diffInHours < 24) {
      return `${diffInHours}j`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays}h`;
    }
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
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

  const getSafetyIcon = (safetyLevel: string) => {
    switch (safetyLevel) {
      case 'safe': return '🟢';
      case 'caution': return '🟡';
      case 'danger': return '🔴';
      default: return '⚪';
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

  // Handle Add Comment Function
  const handleAddComment = async (reportId: string) => {
    const content = commentInputs[reportId]?.trim();
    if (!content || content.length < 5) {
      alert('Komentar harus minimal 5 karakter');
      return;
    }

    setLoadingStates(prev => ({
      ...prev,
      commenting: { ...prev.commenting, [reportId]: true }
    }));

    try {
      const response = await authFetch(
        `${process.env.NEXT_PUBLIC_API_URL}/report/${reportId}/comments`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            content: content
          })
        }
      );

      if (!response.ok) {
        throw new Error('Gagal menambahkan komentar');
      }

      const data = await response.json();
      
      if (data.success) {
        // Update the report with new comments
        setReports(prev => prev.map(report => {
          if (report.id === reportId) {
            return {
              ...report,
              comments: data.data.comments
            };
          }
          return report;
        }));
        
        // Clear comment input
        setCommentInputs(prev => ({
          ...prev,
          [reportId]: ''
        }));
      }
    } catch (err) {
      console.error('Error adding comment:', err);
      alert('Gagal menambahkan komentar');
    } finally {
      setLoadingStates(prev => ({
        ...prev,
        commenting: { ...prev.commenting, [reportId]: false }
      }));
    }
  };

  const handleShowCommunityDetail = () => {
    fetchCommunityDetail();
    setShowCommunityModal(true);
  };

  if (error) {
    return (
      <LayoutNavbar>
        <div className="min-h-screen pt-20 p-4 max-w-2xl mx-auto">
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6 rounded-lg">
            <div className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-red-400 mr-2" />
              <p className="text-red-700">{error}</p>
            </div>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="bg-[#053040] text-white px-4 py-2 rounded-lg hover:bg-[#2C5B6B] transition-colors"
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
          <div className="max-w-2xl mx-auto p-4">
            {/* Header Section */}
            <div className="mb-6 bg-white rounded-xl shadow-sm border border-gray-100 p-4">
              <div className="flex items-center justify-between mb-4">
                <button
                  onClick={() => router.push('/peta-komunitas')}
                  className="flex items-center gap-2 text-[#053040] hover:text-[#2C5B6B] transition-colors p-2 rounded-lg hover:bg-gray-100"
                >
                  <ArrowLeft size={18} />
                  <span className="font-medium text-sm">Kembali</span>
                </button>
                
                <div className="flex items-center gap-2">
                  
                  <Link 
                    href={`/peta-komunitas/form-report?communityId=${communityId}&communityName=${communityName}`}
                    className="bg-[#053040] hover:bg-[#2C5B6B] text-white shadow-sm flex items-center gap-2 px-3 py-2 rounded-lg transition-all text-sm font-medium"
                  >
                    <Plus size={16} />
                    <span>Laporan Baru</span>
                  </Link>
                </div>
              </div>
              
              <div className="text-center">
                <h1 className="text-xl font-bold text-[#053040] mb-1">
                  {decodeURIComponent(communityName || 'Komunitas')}
                </h1>
                <p className="text-gray-600 text-sm">
                  Laporan kondisi laut terkini
                </p>
                <div className="mt-3 flex items-center justify-center gap-3 text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>{reports.filter(r => r.safety_assessment.overall_safety === 'safe').length} Aman</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    <span>{reports.filter(r => r.safety_assessment.overall_safety === 'caution').length} Waspada</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <span>{reports.filter(r => r.safety_assessment.overall_safety === 'danger').length} Berbahaya</span>
                  </div>
                </div>
              </div>
            </div>

            {loading ? (
              <div className="flex justify-center items-center h-40 bg-white rounded-xl shadow-sm border border-gray-100">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#053040] mx-auto mb-2"></div>
                  <p className="text-gray-600 text-sm">Memuat laporan...</p>
                </div>
              </div>
            ) : reports.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 text-center">
                <div className="bg-gray-100 rounded-xl w-16 h-16 mx-auto mb-3 flex items-center justify-center">
                  <Flag className="w-6 h-6 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-1">Belum ada laporan</h3>
                <p className="text-gray-600 text-sm mb-4 max-w-xs mx-auto">
                  Jadilah yang pertama membagikan informasi kondisi laut
                </p>
                <Link 
                  href={`/peta-komunitas/form-report?communityId=${communityId}&communityName=${communityName}`}
                  className="bg-[#053040] hover:bg-[#2C5B6B] text-white px-4 py-2 rounded-lg font-medium transition-all inline-flex items-center gap-2 text-sm"
                >
                  <Plus size={16} />
                  Buat Laporan Pertama
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {reports.map((report) => (
                  <div 
                    key={report.id} 
                    className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
                  >
                    {/* Report Header */}
                    <div className="p-4 border-b border-gray-100">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className="bg-gradient-to-br from-[#053040] to-[#2C5B6B] rounded-full w-8 h-8 flex-shrink-0 flex items-center justify-center text-white font-medium text-sm">
                            {report.author_name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-900 text-sm">{report.author_name}</h3>
                            <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
                              <Calendar className="w-3 h-3" />
                              <span>{formatTimeAgo(report.created_at)}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className={`px-2 py-1 rounded-lg border text-xs font-medium ${getSafetyColor(report.safety_assessment.overall_safety)}`}>
                          <div className="flex items-center gap-1">
                            <span>{getSafetyIcon(report.safety_assessment.overall_safety)}</span>
                            <span>{getSafetyText(report.safety_assessment.overall_safety)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Location and Conditions */}
                      <div className="flex flex-wrap gap-2 text-xs text-gray-600">
                        {report.location?.area_name && (
                          <div className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded">
                            <MapPin className="w-3 h-3" />
                            <span>{report.location.area_name}</span>
                          </div>
                        )}
                        
                        {report.conditions?.weather_description && (
                          <div className="flex items-center gap-1 bg-blue-50 text-blue-700 px-2 py-1 rounded">
                            <span>{report.conditions.weather_description}</span>
                          </div>
                        )}
                        
                        {report.conditions?.wave_height && (
                          <div className="flex items-center gap-1 bg-blue-50 text-blue-700 px-2 py-1 rounded">
                            <span>Gelombang: {report.conditions.wave_height}m</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Report Content */}
                    <div className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <h4 className="font-semibold text-gray-900 text-sm line-clamp-2 flex-1">
                          {report.title}
                        </h4>
                        <button
                          onClick={() => handleViewReportDetail(report.id)}
                          className="flex items-center gap-1 text-[#053040] hover:text-[#2C5B6B] text-xs font-medium ml-2 flex-shrink-0"
                        >
                          <Eye className="w-3 h-3" />
                          Detail
                        </button>
                      </div>

                      <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-line line-clamp-3">
                        {report.description}
                      </p>

                      {/* Voting Section */}
                      <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleVote(report.id, 'up')}
                              disabled={loadingStates.voting[report.id]}
                              className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium transition-colors ${
                                report.voting?.user_vote === 'up' 
                                  ? 'bg-green-100 text-green-700 border border-green-200' 
                                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                              }`}
                            >
                              <ThumbsUp className="w-3 h-3" />
                              {report.voting?.upvotes || 0}
                            </button>
                            
                            <button
                              onClick={() => handleVote(report.id, 'down')}
                              disabled={loadingStates.voting[report.id]}
                              className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium transition-colors ${
                                report.voting?.user_vote === 'down' 
                                  ? 'bg-red-100 text-red-700 border border-red-200' 
                                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                              }`}
                            >
                              <ThumbsDown className="w-3 h-3" />
                              {report.voting?.downvotes || 0}
                            </button>
                          </div>
                          
                          {report.voting?.accuracy_rating && (
                            <div className="text-xs text-gray-500">
                              Rating: {report.voting.accuracy_rating}/5
                            </div>
                          )}
                        </div>

                        <div className="text-xs text-gray-500 flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          {report.view_count || 0} dilihat
                        </div>
                      </div>

                      {/* Comments Section */}
                      <div className="mt-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <MessageCircle className="w-4 h-4 text-gray-700" />
                            <span className="font-medium text-gray-700 text-sm">Komentar</span>
                            <span className="text-xs text-gray-700 bg-gray-100 px-1.5 py-0.5 rounded-full">
                              {report.comments?.length || 0}
                            </span>
                          </div>
                          
                          <button 
                            className="text-xs text-[#053040] hover:text-[#2C5B6B] font-medium"
                            onClick={() => {
                              const commentInput = document.getElementById(`comment-input-${report.id}`);
                              commentInput?.focus();
                            }}
                          >
                            Tambah Komentar
                          </button>
                        </div>

                        {/* Comments List */}
                        {report.comments && report.comments.length > 0 && (
                          <div className="space-y-3 mb-3">
                            {(expandedComments[report.id] ? report.comments : report.comments.slice(0, 2)).map((comment) => (
                              <div key={comment.id} className="flex gap-2">
                                <div className="bg-gray-200 rounded-full w-6 h-6 flex-shrink-0 flex items-center justify-center text-gray-600 font-medium text-xs">
                                  {comment.author_name.charAt(0).toUpperCase()}
                                </div>
                                <div className="flex-1 bg-gray-50 rounded-lg p-2">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="font-medium text-gray-900 text-xs">
                                      {comment.author_name}
                                    </span>
                                    <span className="text-xs text-gray-500">
                                      {formatTimeAgo(comment.created_at)}
                                    </span>
                                  </div>
                                  <p className="text-gray-700 text-xs leading-relaxed">
                                    {comment.content}
                                  </p>
                                </div>
                              </div>
                            ))}
                            
                            {report.comments.length > 2 && !expandedComments[report.id] && (
                              <button 
                                className="text-xs text-[#053040] hover:text-[#2C5B6B] font-medium ml-8"
                                onClick={() => toggleComments(report.id)}
                              >
                                Lihat {report.comments.length - 2} komentar lainnya
                              </button>
                            )}
                            
                            {expandedComments[report.id] && report.comments.length > 2 && (
                              <button 
                                className="text-xs text-[#053040] hover:text-[#2C5B6B] font-medium ml-8"
                                onClick={() => toggleComments(report.id)}
                              >
                                Tampilkan lebih sedikit
                              </button>
                            )}
                          </div>
                        )}

                        {/* Comment Input */}
                        <div className="flex gap-2">
                          <div className="flex-1">
                            <input
                              id={`comment-input-${report.id}`}
                              type="text"
                              value={commentInputs[report.id] || ''}
                              onChange={(e) => setCommentInputs(prev => ({
                                ...prev,
                                [report.id]: e.target.value
                              }))}
                              placeholder="Tulis komentar..."
                              className="w-full border border-gray-400 rounded-lg px-3 py-2 text-xs text-gray-700 focus:ring-1 focus:ring-[#053040] focus:border-transparent transition-all"
                              onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                  handleAddComment(report.id);
                                }
                              }}
                            />
                          </div>
                          <button
                            onClick={() => handleAddComment(report.id)}
                            disabled={loadingStates.commenting[report.id] || !commentInputs[report.id]?.trim()}
                            className="bg-[#053040] hover:bg-[#2C5B6B] text-white p-2 rounded-lg transition-all"
                          >
                            {loadingStates.commenting[report.id] ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                            ) : (
                              <Send size={14} />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-between items-center mt-6 bg-white rounded-xl shadow-sm border border-gray-100 p-4">
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
                )}
              </div>
            )}
          </div>
        </div>
      </LayoutNavbar>
      <Footer />

      {/* Vote Alert Modal */}
      {showVoteAlert && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-sm w-full p-6">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Tidak Dapat Melakukan Vote
              </h3>
              <p className="text-gray-600 mb-6">
                Anda tidak dapat memberikan vote pada laporan Anda sendiri.
              </p>
              <button
                onClick={() => setShowVoteAlert(false)}
                className="bg-[#053040] hover:bg-[#2C5B6B] text-white px-6 py-2 rounded-lg transition-colors w-full"
              >
                Mengerti
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Community Detail Modal */}
      {showCommunityModal && communityDetail && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-[#053040]">Detail Komunitas</h2>
                <button
                  onClick={() => setShowCommunityModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="text-center">
                  <div className="bg-gradient-to-br from-[#053040] to-[#2C5B6B] rounded-full w-16 h-16 mx-auto mb-3 flex items-center justify-center text-white font-bold text-2xl">
                    {communityDetail.name.charAt(0).toUpperCase()}
                  </div>
                  <h3 className="text-lg font-bold text-[#053040]">{communityDetail.name}</h3>
                  <p className="text-gray-600 text-sm mt-1">{communityDetail.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="bg-gray-50 rounded-lg p-3 text-center">
                    <Users className="w-5 h-5 text-[#053040] mx-auto mb-1" />
                    <div className="font-semibold text-[#053040]">{communityDetail.member_count}</div>
                    <div className="text-gray-600 text-xs">Anggota</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3 text-center">
                    <Calendar className="w-5 h-5 text-[#053040] mx-auto mb-1" />
                    <div className="font-semibold text-[#053040]">
                      {new Date(communityDetail.created_at).toLocaleDateString('id-ID')}
                    </div>
                    <div className="text-gray-600 text-xs">Dibuat</div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-[#053040] mb-3 flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Daftar Anggota ({communityDetail.members.length})
                  </h4>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {communityDetail.members.map((member) => (
                      <div key={member.id} className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                        <div className="flex items-center gap-2">
                          <div className="bg-[#053040] rounded-full w-8 h-8 flex items-center justify-center text-white font-medium text-sm">
                            {member.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-medium text-sm">{member.name}</div>
                            <div className="text-xs text-gray-500 capitalize">{member.role}</div>
                          </div>
                        </div>
                        <div className="text-xs text-gray-500">
                          Bergabung {formatTimeAgo(member.joined_at)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default function CommunityReportsPage() {
  return (
    <Suspense fallback={
      <LayoutNavbar>
        <div className="min-h-screen pt-20 bg-gray-50">
          <div className="max-w-2xl mx-auto p-4">
            <div className="flex justify-center items-center h-40 bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#053040] mx-auto mb-2"></div>
                <p className="text-gray-600 text-sm">Memuat laporan...</p>
              </div>
            </div>
          </div>
        </div>
      </LayoutNavbar>
    }>
      <CommunityReportsContent />
    </Suspense>
  );
}