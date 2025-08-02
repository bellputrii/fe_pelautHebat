"use client";

import { useState, useEffect } from "react";
import LayoutNavbar from "@/components/LayoutNavbar";
import Footer from "@/components/Footer";
import Image from "next/image";
import { useSearchParams, useRouter } from 'next/navigation';
import { Check, ChevronLeft, PlayCircle, AlertTriangle, Info } from 'lucide-react';
import { auth } from "@/firebase/config";

type SummaryData = {
  session_id: string;
  status: string;
  completed_at: string;
  summary: {
    trip_info: {
      trip_purpose: string;
      duration_minutes: number;
      passenger_count: number;
      boat_type: string;
      weather_condition: string;
      distance_km: number;
    };
    progress: {
      total_items: number;
      completed_items: number;
      completion_percentage: number;
      mandatory_completed: boolean;
    };
    status: string;
    duration_spent: number;
    created_at: string;
    completed_at: string;
  };
};

// Mock guide data since it's not in the API response
const MOCK_GUIDES = [
  {
    id: "1",
    title: "Tutorial Menggunakan Jaket Pelampung",
    description: "Perangkat keselamatan yang satu ini sering kita jumpai, yuk kita kenali dan persiapkan perangkat ini ketika kita berada di sarana prasarana dan area dimana ada bahaya tenggelam disana.",
    image_url: "/jaket-pelampung.jpg",
    video_url: "https://example.com/video1",
    is_completed: true
  },
  {
    id: "2",
    title: "Tutorial Menggunakan Peluit Darurat",
    description: "Peluit darurat penting untuk meminta pertolongan saat keadaan darurat di perairan.",
    image_url: "/peluit-darurat.jpg",
    video_url: "https://example.com/video2",
    is_completed: true
  },
  {
    id: "3",
    title: "Isi P3K",
    description: "Pastikan kotak P3K Anda lengkap dan siap digunakan saat diperlukan.",
    image_url: "/p3k.jpg",
    video_url: "https://example.com/video3",
    is_completed: true
  },
  {
    id: "4",
    title: "Tutorial Menggunakan Senter",
    description: "Senter penting untuk memberi sinyal atau penerangan di malam hari.",
    image_url: "/senter.jpg",
    video_url: "https://example.com/video4",
    is_completed: true
  }
];

export default function SummaryPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('sessionId');
  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionId) {
      setError("Session ID tidak valid");
      setIsLoading(false);
      return;
    }

    const fetchSummary = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const currentUser = auth.currentUser;
        if (!currentUser) {
          throw new Error("Anda perlu login terlebih dahulu");
        }
        const idToken = await currentUser.getIdToken();

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/guide/session/${sessionId}/complete`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${idToken}`
            }
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Gagal memuat rangkuman");
        }

        const result = await response.json();
        setSummary(result.data);
      } catch (err) {
        console.error("Error fetching summary:", err);
        setError(err instanceof Error ? err.message : "Terjadi kesalahan");
      } finally {
        setIsLoading(false);
      }
    };

    fetchSummary();
  }, [sessionId]);

  if (isLoading) {
    return (
      <LayoutNavbar>
        <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white px-4 py-16">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex flex-col items-center justify-center gap-4 py-20">
              <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-lg text-blue-800">Memuat rangkuman perjalanan...</p>
            </div>
          </div>
        </main>
      </LayoutNavbar>
    );
  }

  if (error) {
    return (
      <LayoutNavbar>
        <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white px-4 py-16">
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                <h3 className="text-red-800 font-medium">{error}</h3>
              </div>
            </div>
            <button
              onClick={() => router.push('/checklist')}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
            >
              Kembali ke Checklist
            </button>
          </div>
        </main>
      </LayoutNavbar>
    );
  }

  if (!summary) {
    return null;
  }

  return (
    <>
      <LayoutNavbar>
        <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white px-4 py-16">
          <div className="max-w-4xl mx-auto space-y-8">
            {/* Header */}
            <div className="text-center">
              <h1 className="text-3xl font-bold text-blue-900 mb-4">
                Selamat! Anda Telah Menyelesaikan Semua Persiapan.
              </h1>
              <p className="text-lg text-gray-700">
                Berikut adalah rangkuman panduan penting yang perlu Anda Ingat
              </p>
            </div>

            {/* Guides List - Using mock data since API doesn't provide guides */}
            <div className="space-y-6">
              {MOCK_GUIDES.map((guide) => (
                <div 
                  key={guide.id} 
                  className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col md:flex-row gap-6">
                    {/* Video/Image Thumbnail */}
                    <div className="relative w-full md:w-1/3 aspect-video rounded-lg overflow-hidden bg-gray-100">
                      {guide.video_url ? (
                        <>
                          <Image
                            src={guide.image_url}
                            alt={guide.title}
                            fill
                            className="object-cover"
                          />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <PlayCircle className="w-12 h-12 text-white bg-blue-600 rounded-full p-2 bg-opacity-80" />
                          </div>
                        </>
                      ) : guide.image_url ? (
                        <Image
                          src={guide.image_url}
                          alt={guide.title}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <Info className="w-8 h-8" />
                        </div>
                      )}
                    </div>
                    
                    {/* Guide Content */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="text-xl font-bold text-blue-900">
                          {guide.title}
                        </h3>
                        {guide.is_completed && (
                          <span className="flex items-center gap-1 text-sm bg-green-100 text-green-800 px-2 py-1 rounded-full">
                            <Check className="w-4 h-4" /> Selesai
                          </span>
                        )}
                      </div>
                      
                      <p className="text-gray-600 mt-3">
                        {guide.description}
                      </p>
                      
                      <div className="mt-6">
                        <button 
                          onClick={() => {
                            if (guide.video_url) {
                              window.open(guide.video_url, '_blank');
                            }
                          }}
                          className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                            guide.video_url 
                              ? 'bg-blue-600 text-white hover:bg-blue-700' 
                              : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                          }`}
                          disabled={!guide.video_url}
                        >
                          <PlayCircle className="w-5 h-5" />
                          Lihat Tutorial
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Navigation */}
            <div className="flex justify-center pt-8">
              <button
                onClick={() => router.push('/checklist')}
                className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors shadow-sm flex items-center gap-2"
              >
                <ChevronLeft className="w-5 h-5" />
                Kembali ke Menu Utama
              </button>
            </div>
          </div>
        </main>
      </LayoutNavbar>
      <Footer />
    </>
  );
}