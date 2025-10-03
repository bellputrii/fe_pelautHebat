'use client';

import { useEffect, useState, useRef } from 'react';
import LayoutNavbar from '@/components/LayoutNavbar'
import Footer from '@/components/Footer'
import Image from 'next/image'
import { Quote, Waves, Cloud, Map, Shield, AlertTriangle, Flag, Droplets, Wind, Gauge, ChevronDown, Play, Pause } from 'lucide-react'
import { useTokenRefresh } from '@/app/hooks/useAuth'

export default function DashboardPage() {
  // Initialize token refresh mechanism
  useTokenRefresh();

  const [location, setLocation] = useState<{ lat: number; lon: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [city, setCity] = useState<string>('Manyeuw, Maluku'); // Default lokasi
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const testimonialRef = useRef<HTMLDivElement>(null);

  // Auto-rotate testimonials
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % 3);
    }, 5000);

    return () => clearInterval(interval);
  }, [isPlaying]);

  // Scroll to testimonials
  const scrollToTestimonials = () => {
    testimonialRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (!navigator.geolocation) {
      setError('Geolocation tidak didukung browser ini.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        setLocation({ lat: latitude, lon: longitude });

        // Fetch lokasi berdasarkan koordinat
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          const data = await response.json();
          if (data && data.address) {
            const { city, town, village, state } = data.address;
            setCity(city || town || village || state || 'Lokasi Tidak Diketahui');
          }
        } catch (err) {
          console.error('Error fetching location name:', err);
          setCity('Lokasi Tidak Diketahui');
        }
      },
      (err) => {
        setError(err.message);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  const testimonials = [
    {
      quote: "Sejak pakai website ini, saya bisa tahu kapan laut sedang tidak bersahabat. Dulu saya sering nekat berangkat, tapi sekarang lebih tenang karena bisa melihat rekomendasi langsung. Sangat membantu nelayan kecil seperti saya.",
      author: "Pak Rudi, 52 tahun, Ambon"
    },
    {
      quote: "Fitur ringkasan cuacanya sangat informatif dan mudah dipahami, terutama untuk menjelaskan kondisi laut ke awak kapal yang akan berlayar. Perhitungan gelombang dan saran waktunya cukup akurat sejauh ini.",
      author: "Bu Yuni, 38 tahun, Tual"
    },
    {
      quote: "Saya pakai website ini setiap hari sebelum membawa tamu snorkeling. Info tinggi gelombangnya sangat membantu untuk menentukan spot yang aman. Desain webnya juga simpel dan langsung ke poin.",
      author: "Bang Dimas, 29 tahun, Kei Kecil"
    }
  ];

  return (
    <>
      <LayoutNavbar>
        <div className="space-y-24 pt-28 pb-12">
          {/* Hero Section - Enhanced */}
          <section className="relative bg-[#053040] text-white rounded-3xl px-6 py-20 overflow-hidden shadow-lg mx-4 sm:mx-8 md:mx-auto max-w-6xl">
            <Image
              src="/signup-bg.png"
              alt="Hero background"
              fill
              className="absolute inset-0 object-cover opacity-30"
              priority
            />
            <div className="relative z-10 max-w-3xl mx-auto text-center space-y-6">
              <div className="inline-flex items-center gap-2 bg-[#2C5B6B]/80 px-4 py-2 rounded-full animate-pulse">
                <Waves size={20} />
                <span className="text-sm font-medium">Keselamatan Laut Prioritas Kami</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-extrabold leading-tight animate-fade-in">
                Meningkatkan Keselamatan Transportasi Laut dan Kesejahteraan Masyarakat Pesisir
              </h1>
              <p className="text-lg text-[#C9CFCF] animate-fade-in-delayed">
                Pelaut Hebat berdedikasi untuk meningkatkan keselamatan dalam transportasi laut dan mendukung kesejahteraan masyarakat pesisir melalui solusi inovatif dan layanan komprehensif.
              </p>
              
              {/* Scroll indicator */}
              <button 
                onClick={scrollToTestimonials}
                className="mt-8 animate-bounce inline-flex flex-col items-center gap-2 text-sm text-[#C9CFCF] hover:text-white transition-colors"
              >
                <span>Jelajahi Lebih Lanjut</span>
                <ChevronDown size={20} />
              </button>
            </div>
          </section>

          {/* Fitur Utama - Enhanced */}
          <section className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-12">
              <h2 className="text-2xl md:text-3xl font-bold text-[#053040] mb-2">Fitur Utama</h2>
              <div className="w-20 h-1 bg-[#2C5B6B] mx-auto"></div>
              <p className="text-[#4C5F6B] mt-4 max-w-2xl mx-auto">
                Pelaut Hebat menawarkan berbagai fitur yang dirancang untuk meningkatkan keselamatan dan mendukung masyarakat pesisir.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { 
                  title: 'Manajemen Keselamatan', 
                  desc: 'Protokol keselamatan komprehensif dan alat manajemen risiko untuk operasi maritim.', 
                  icon: <Shield className="text-[#053040]" size={32} />
                },
                { 
                  title: 'Ringkasan Cuaca', 
                  desc: 'Ringkasan cuaca dan gelombang laut yang disajikan dalam bentuk singkat dan mudah dipahami oleh pengguna hasil dari pengolahan data oleh AI.', 
                  icon: <Cloud className="text-[#053040]" size={32} />
                },
                { 
                  title: 'Peta Komunitas', 
                  desc: 'Sistem respons cepat dan efektif untuk keadaan darurat maritim dan panggilan darurat.', 
                  icon: <Map className="text-[#053040]" size={32} />
                }
              ].map((item, index) => (
                <div 
                  key={index} 
                  className="p-6 border rounded-xl shadow-sm bg-white hover:shadow-md transition-all duration-300 hover:-translate-y-2 group cursor-pointer"
                >
                  <div className="w-14 h-14 bg-[#2C5B6B]/10 rounded-full flex items-center justify-center mb-4 group-hover:bg-[#2C5B6B]/20 transition-colors">
                    {item.icon}
                  </div>
                  <h3 className="font-semibold text-lg text-[#053040] mb-2 group-hover:text-[#2C5B6B] transition-colors">{item.title}</h3>
                  <p className="text-sm text-[#4C5F6B]">{item.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Manajemen Keselamatan - Enhanced */}
          <section className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-12">
              <h2 className="text-2xl md:text-3xl font-bold text-[#053040] mb-2">Manajemen Keselamatan</h2>
              <div className="w-20 h-1 bg-[#2C5B6B] mx-auto"></div>
              <p className="text-[#4C5F6B] mt-4 max-w-2xl mx-auto">
                Protokol keselamatan komprehensif dan alat manajemen risiko untuk operasi maritim.
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                { 
                  title: 'Tips Cuaca Buruk di Laut', 
                  desc: 'Durasi 2 menit',
                  icon: <AlertTriangle className="text-[#053040]" size={20} />,
                  image: '/cuaca.jpg'
                },
                { 
                  title: '5 Alat Keselamatan Wajib', 
                  desc: 'Panduan alat pelindung dasar di kapal',
                  icon: <Shield className="text-[#053040]" size={20} />,
                  image: '/alat-keselamatan.jpeg'
                },
                { 
                  title: 'Kode Warna Bendera Laut', 
                  desc: 'Pelajari arti bendera di laut',
                  icon: <Flag className="text-[#053040]" size={20} />,
                  image: '/arti-bendera.jpg'
                }
              ].map((item, i) => (
                <div
                  key={i}
                  className="bg-white rounded-xl overflow-hidden border shadow-md hover:shadow-xl transition-all duration-300 group cursor-pointer hover:-translate-y-1"
                >
                  <div className="relative h-48 overflow-hidden">
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      className="object-cover group-hover:scale-110 transition duration-500"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300"></div>
                  </div>
                  <div className="p-5">
                    <div className="flex items-center gap-2 mb-2">
                      {item.icon}
                      <h4 className="font-semibold text-[#053040] text-md group-hover:text-[#2C5B6L] transition-colors">
                        {item.title}
                      </h4>
                    </div>
                    <p className="text-sm text-[#628696]">
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Enhanced Ringkasan Cuaca & Gelombang dengan Lokasi Terkini */}
          <section className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-12">
              <h2 className="text-2xl md:text-3xl font-bold text-[#053040] mb-2">Ringkasan Cuaca & Gelombang Laut</h2>
              <div className="w-20 h-1 bg-[#2C5B6B] mx-auto"></div>
              <p className="text-[#4C5F6B] mt-4 max-w-2xl mx-auto">
                Informasi terkini tentang kondisi laut yang disajikan secara jelas dan mudah dipahami.
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              {/* Lokasi Terkini Card - Enhanced */}
              <div className="bg-gradient-to-br from-[#053040] to-[#2C5B6B] rounded-2xl shadow-lg overflow-hidden text-white hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                        <Map className="text-white" size={20} />
                      </div>
                      <div>
                        <h4 className="font-semibold text-lg">Lokasi Terkini</h4>
                        <p className="text-sm opacity-80">Posisi GPS Anda</p>
                      </div>
                    </div>
                    <div className={`w-3 h-3 rounded-full animate-pulse ${location ? 'bg-green-400' : 'bg-yellow-400'}`}></div>
                  </div>

                  {/* Lokasi Name */}
                  <div className="bg-white/10 rounded-xl p-4 mb-4 backdrop-blur-sm border border-white/10">
                    <div className="text-center">
                      <div className="text-2xl font-bold mb-2">{city}</div>
                      <div className="text-sm opacity-80 flex items-center justify-center gap-2">
                        <span>📍</span>
                        <span>Lokasi Terdeteksi</span>
                      </div>
                    </div>
                  </div>

                  {/* Coordinates Grid */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm hover:bg-white/15 transition-colors group">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                        <span className="text-xs opacity-80">Latitude</span>
                      </div>
                      <div className="font-mono font-bold text-lg">
                        {location?.lat.toFixed(6) || '---.------'}
                      </div>
                      <div className="text-xs opacity-60 mt-1">Garis Lintang</div>
                    </div>
                    
                    <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm hover:bg-white/15 transition-colors group">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                        <span className="text-xs opacity-80">Longitude</span>
                      </div>
                      <div className="font-mono font-bold text-lg">
                        {location?.lon.toFixed(6) || '---.------'}
                      </div>
                      <div className="text-xs opacity-60 mt-1">Garis Bujur</div>
                    </div>
                  </div>

                  {/* Status */}
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${location ? 'bg-green-400' : 'bg-yellow-400'}`}></div>
                      <span>{location ? 'Terkoneksi GPS' : 'Mencari sinyal...'}</span>
                    </div>
                    <span className="opacity-70">
                      {new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  {error && (
                    <div className="mt-4 p-3 bg-red-500/20 rounded-lg border border-red-500/30">
                      <div className="flex items-center gap-2">
                        <AlertTriangle size={16} className="text-red-400" />
                        <p className="text-sm text-red-200">{error}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Recommendation Card - Enhanced */}
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-[#E5E7EB] hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="p-6">
                  {/* Notes: Data Dummy */}
                  <p className="text-xs text-[#4C5F6B] italic mb-4">
                    *Data berikut merupakan contoh hasil analisis (dummy data).
                  </p>

                  {/* Header */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-[#053040]/10 rounded-lg">
                        <Waves className="text-[#053040]" size={20} />
                      </div>
                      <div>
                        <h4 className="font-semibold text-lg text-[#053040]">Analisis Kondisi Laut</h4>
                        <p className="text-sm text-[#4C5F6B]">Rekomendasi pelayaran</p>
                      </div>
                    </div>
                    <div className="w-3 h-3 bg-red-400 rounded-full animate-pulse"></div>
                  </div>

                  {/* Metrics Grid */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-[#F8FAFC] rounded-lg p-3 border border-[#E5E7EB] hover:border-[#2C5B6B] transition-colors group">
                      <div className="flex items-center gap-2 mb-2">
                        <Waves size={16} className="text-[#053040]" />
                        <span className="text-xs font-medium text-[#4C5F6B]">Tinggi Gelombang</span>
                      </div>
                      <div className="text-xl font-bold text-[#053040]">1.96m</div>
                      <div className="text-xs text-red-500 font-medium mt-1">Tinggi</div>
                    </div>
                    
                    <div className="bg-[#F8FAFC] rounded-lg p-3 border border-[#E5E7EB] hover:border-[#2C5B6B] transition-colors group">
                      <div className="flex items-center gap-2 mb-2">
                        <Gauge size={16} className="text-[#053040]" />
                        <span className="text-xs font-medium text-[#4C5F6B]">Periode</span>
                      </div>
                      <div className="text-xl font-bold text-[#053040]">11.5s</div>
                      <div className="text-xs text-yellow-500 font-medium mt-1">Sedang</div>
                    </div>
                  </div>

                  {/* Analysis */}
                  <div className="space-y-4">
                    <div className="flex items-start gap-3 group hover:bg-[#F8FAFC] p-3 rounded-lg transition-colors">
                      <div className="flex-shrink-0 mt-1">
                        <div className="w-2 h-2 bg-[#053040] rounded-full group-hover:scale-125 transition-transform"></div>
                      </div>
                      <p className="text-sm text-[#4C5F6B] leading-relaxed">
                        Tinggi gelombang <span className="font-semibold text-[#053040]">1,96 meter</span> berisiko untuk kapal tradisional.
                      </p>
                    </div>
                    
                    <div className="flex items-start gap-3 group hover:bg-[#F8FAFC] p-3 rounded-lg transition-colors">
                      <div className="flex-shrink-0 mt-1">
                        <div className="w-2 h-2 bg-[#053040] rounded-full group-hover:scale-125 transition-transform"></div>
                      </div>
                      <p className="text-sm text-[#4C5F6B] leading-relaxed">
                        Periode <span className="font-semibold text-[#053040]">11,5 detik</span> menunjukkan gelombang besar dengan jarak jauh.
                      </p>
                    </div>
                  </div>

                  {/* Warning Box */}
                  <div className="mt-6 p-4 bg-red-50 rounded-lg border-l-4 border-red-500 hover:border-red-600 transition-colors">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="text-red-500 flex-shrink-0 mt-0.5" size={18} />
                      <div>
                        <p className="font-medium text-red-800 text-sm mb-1">Peringatan Keselamatan</p>
                        <p className="text-sm text-red-700 leading-relaxed">
                          Kondisi <span className="font-semibold">tidak aman</span> untuk pelayaran. Disarankan menunda hingga pukul <span className="font-semibold text-green-600">12.30</span>.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Footer */}
                <div className="bg-[#F8FAFC] px-6 py-4 border-t border-[#E5E7EB]">
                  <div className="flex items-center justify-between text-sm text-[#4C5F6B]">
                    <div className="flex items-center gap-2">
                      <Cloud size={16} className="text-[#2C5B6B]" />
                      <span>Update berikutnya</span>
                    </div>
                    <span className="font-medium">11:30 AM</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Testimoni - Enhanced with carousel */}
          <section ref={testimonialRef} className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-12">
              <h2 className="text-2xl md:text-3xl font-bold text-[#053040] mb-2">Apa Kata Mereka</h2>
              <div className="w-20 h-1 bg-[#2C5B6B] mx-auto"></div>
              <p className="text-[#4C5F6B] mt-4 max-w-2xl mx-auto">
                Testimoni dari pengguna setia Pelaut Hebat
              </p>
            </div>

            {/* Testimonial Carousel */}
            <div className="relative">
              {/* Testimonial Cards */}
              <div className="overflow-hidden rounded-2xl">
                <div 
                  className="flex transition-transform duration-500 ease-in-out"
                  style={{ transform: `translateX(-${currentSlide * 100}%)` }}
                >
                  {testimonials.map((testimonial, i) => (
                    <div
                      key={i}
                      className="w-full flex-shrink-0 bg-white border rounded-2xl shadow-md p-8 relative overflow-hidden hover:shadow-lg transition-shadow"
                    >
                      <Quote className="absolute top-6 right-6 text-[#053040]/10 w-16 h-16" />
                      <div className="relative z-10">
                        <p className="text-lg text-[#053040] leading-relaxed mb-6">
                          {testimonial.quote}
                        </p>
                        <div className="text-md text-[#053040] italic font-semibold">
                          {testimonial.author}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Carousel Controls */}
              <div className="flex items-center justify-center gap-4 mt-8">
                <button 
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="p-2 rounded-full bg-[#053040] text-white hover:bg-[#2C5B6B] transition-colors"
                >
                  {isPlaying ? <Pause size={20} /> : <Play size={20} />}
                </button>
                
                {/* Dots Indicator */}
                <div className="flex gap-2">
                  {testimonials.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentSlide(i)}
                      className={`w-3 h-3 rounded-full transition-all ${
                        i === currentSlide ? 'bg-[#053040]' : 'bg-[#2C5B6B]/30'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </section>
        </div>
      </LayoutNavbar>
      <Footer />

      {/* Custom CSS for animations */}
      <style jsx global>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fade-in-delayed {
          0% { opacity: 0; transform: translateY(20px); }
          50% { opacity: 0; transform: translateY(20px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 1s ease-out;
        }
        .animate-fade-in-delayed {
          animation: fade-in-delayed 1.5s ease-out;
        }
      `}</style>
    </>
  );
}