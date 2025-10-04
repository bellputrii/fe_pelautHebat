'use client';

import { useEffect, useState, useRef } from 'react';
import LayoutNavbar from '@/components/LayoutNavbar'
import Footer from '@/components/Footer'
import Image from 'next/image'
import { Quote, Waves, Cloud, Map, Shield, AlertTriangle, Flag, Droplets, Wind, Gauge, ChevronDown, Play, Pause, Compass, CheckCircle, Navigation, Eye } from 'lucide-react'
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

  const usageSteps = [
    {
      step: 1,
      title: "Cek Kondisi Laut",
      description: "Masuk ke menu kondisi laut dengan titik koordinat sesuai lokasi terkini Anda",
      icon: <Waves className="text-white" size={24} />,
      color: "from-[#053040] to-[#0A4A60]"
    },
    {
      step: 2,
      title: "Cek Prakiraan Cuaca",
      description: "Periksa prakiraan cuaca laut berdasarkan koordinat lokasi terkini",
      icon: <Cloud className="text-white" size={24} />,
      color: "from-[#0A4A60] to-[#2C5B6B]"
    },
    {
      step: 3,
      title: "Filter Panduan Keselamatan",
      description: "Gunakan menu checklist untuk memfilter panduan sesuai kebutuhan Anda",
      icon: <CheckCircle className="text-white" size={24} />,
      color: "from-[#2C5B6B] to-[#3A6D7E]"
    },
    {
      step: 4,
      title: "Lakukan Perjalanan",
      description: "Mulai perjalanan dengan memperhatikan analisis dan rekomendasi dari website",
      icon: <Navigation className="text-white" size={24} />,
      color: "from-[#3A6D7E] to-[#4C7E8F]"
    },
    {
      step: 5,
      title: "Berikan Feedback",
      description: "Gunakan menu peta komunitas untuk memberikan feedback berdasarkan penglihatan langsung",
      icon: <Eye className="text-white" size={24} />,
      color: "from-[#4C7E8F] to-[#5D8FA0]"
    }
  ];

  return (
    <>
      <LayoutNavbar>
        <div className="space-y-16 md:space-y-24 pt-24 md:pt-28 pb-8 md:pb-12">
          {/* Hero Section - Enhanced dengan perbaikan mobile */}
          <section className="relative bg-[#053040] text-white rounded-2xl md:rounded-3xl px-4 sm:px-6 py-16 md:py-20 overflow-hidden shadow-lg mx-3 sm:mx-6 md:mx-auto max-w-6xl">
            <Image
              src="/signup-bg.png"
              alt="Hero background"
              fill
              className="absolute inset-0 object-cover opacity-30"
              priority
            />
            <div className="relative z-10 max-w-3xl mx-auto text-center space-y-4 md:space-y-6">
              <div className="inline-flex items-center gap-2 bg-[#2C5B6B]/80 px-3 py-1.5 md:px-4 md:py-2 rounded-full animate-pulse text-xs md:text-sm">
                <Waves size={16} className="md:w-5 md:h-5" />
                <span className="font-medium">Keselamatan Laut Prioritas Kami</span>
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold leading-tight md:leading-tight animate-fade-in px-2">
                Meningkatkan Keselamatan Transportasi Laut dan Kesejahteraan Masyarakat Pesisir
              </h1>
              <p className="text-sm sm:text-base md:text-lg text-[#C9CFCF] animate-fade-in-delayed px-2 sm:px-0">
                Pelaut Hebat berdedikasi untuk meningkatkan keselamatan dalam transportasi laut dan mendukung kesejahteraan masyarakat pesisir melalui solusi inovatif dan layanan komprehensif.
              </p>
              
              {/* Scroll indicator */}
              <button 
                onClick={scrollToTestimonials}
                className="mt-6 md:mt-8 animate-bounce inline-flex flex-col items-center gap-2 text-xs md:text-sm text-[#C9CFCF] hover:text-white transition-colors"
              >
                <span>Jelajahi Lebih Lanjut</span>
                <ChevronDown size={16} className="md:w-5 md:h-5" />
              </button>
            </div>
          </section>

          {/* Cara Penggunaan Website - MODIFIED SECTION dengan perbaikan mobile */}
          <section className="max-w-6xl mx-auto px-3 sm:px-4 md:px-6">
            <div className="text-center mb-8 md:mb-12">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-[#053040] dark:text-white mb-2">Cara Penggunaan Website</h2>
              <div className="w-16 sm:w-20 h-1 bg-[#2C5B6B] mx-auto"></div>
              <p className="text-sm sm:text-base text-[#4C5F6B] dark:text-gray-300 mt-3 md:mt-4 max-w-2xl mx-auto px-2">
                Ikuti langkah-langkah berikut untuk memaksimalkan penggunaan Pelaut Hebat
              </p>
            </div>

            <div className="relative">
              {/* Timeline Connector - MODIFIED dengan main color palette */}
              <div className="absolute left-4 md:left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-[#053040] via-[#2C5B6B] to-[#4C7E8F] hidden md:block"></div>
              
              <div className="space-y-6 md:space-y-12">
                {usageSteps.map((step, index) => (
                  <div 
                    key={step.step}
                    className="flex flex-col md:flex-row items-start gap-3 md:gap-6 group cursor-pointer"
                  >
                    {/* Step Number and Icon - MODIFIED untuk mobile */}
                    <div className="flex items-center gap-3 md:w-40">
                      <div className={`relative flex-shrink-0 w-10 h-10 md:w-16 md:h-16 rounded-full bg-gradient-to-br ${step.color} shadow-lg group-hover:scale-105 md:group-hover:scale-110 transition-transform duration-300`}>
                        <div className="absolute inset-0 flex items-center justify-center">
                          {step.icon}
                        </div>
                        <div className="absolute -top-1 -right-1 md:-top-2 md:-right-2 w-4 h-4 md:w-6 md:h-6 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center shadow-md border border-gray-200 dark:border-gray-700">
                          <span className="text-xs font-bold text-gray-800 dark:text-white">{step.step}</span>
                        </div>
                      </div>
                      
                      {/* Connector dot for mobile - MODIFIED dengan main colors */}
                      <div className="w-2 h-2 rounded-full bg-gradient-to-r from-[#053040] to-[#2C5B6B] md:hidden"></div>
                    </div>

                    {/* Content - MODIFIED untuk dark mode support dan mobile */}
                    <div className="flex-1 bg-white dark:bg-gray-800 rounded-xl md:rounded-2xl p-4 md:p-6 shadow-md hover:shadow-lg md:hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700 group-hover:border-[#2C5B6B] dark:group-hover:border-[#4C7E8F] ml-0 md:ml-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-bold text-base md:text-lg text-[#053040] dark:text-white mb-2 group-hover:text-[#2C5B6B] dark:group-hover:text-[#4C7E8F] transition-colors">
                            {step.title}
                          </h3>
                          <p className="text-xs md:text-sm text-[#4C5F6B] dark:text-gray-300 leading-relaxed">
                            {step.description}
                          </p>
                        </div>
                        <div className="ml-2 md:ml-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex-shrink-0">
                          <Compass className="text-[#2C5B6B] dark:text-[#4C7E8F] w-4 h-4 md:w-5 md:h-5" />
                        </div>
                      </div>
                      
                      {/* Progress indicator - MODIFIED untuk mobile */}
                      <div className="mt-3 md:mt-4 flex items-center gap-2">
                        <div className="flex-1 h-1.5 md:h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div 
                            className={`h-full bg-gradient-to-r ${step.color} rounded-full transition-all duration-1000`}
                            style={{ 
                              width: step.step === 1 ? '20%' : 
                                     step.step === 2 ? '40%' : 
                                     step.step === 3 ? '60%' : 
                                     step.step === 4 ? '80%' : '100%' 
                            }}
                          ></div>
                        </div>
                        <span className="text-xs font-medium text-[#4C5F6B] dark:text-gray-400">
                          {step.step}/5
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Call to Action - MODIFIED untuk mobile */}
              <div className="mt-8 md:mt-12 text-center">
                <div className="inline-flex items-center gap-2 md:gap-3 bg-gradient-to-r from-[#053040] to-[#2C5B6B] text-white px-4 py-3 md:px-6 md:py-4 rounded-xl md:rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5 md:hover:-translate-y-1">
                  <Compass size={20} className="md:w-6 md:h-6" />
                  <div className="text-left">
                    <div className="font-semibold text-sm md:text-base">Siap Memulai?</div>
                    <div className="text-xs md:text-sm opacity-90">Ikuti panduan di atas untuk pengalaman terbaik</div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Fitur Utama - Enhanced dengan dark mode support dan perbaikan mobile */}
          <section className="max-w-6xl mx-auto px-3 sm:px-4 md:px-6">
            <div className="text-center mb-8 md:mb-12">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-[#053040] dark:text-white mb-2">Fitur Utama</h2>
              <div className="w-16 sm:w-20 h-1 bg-[#2C5B6B] mx-auto"></div>
              <p className="text-sm sm:text-base text-[#4C5F6B] dark:text-gray-300 mt-3 md:mt-4 max-w-2xl mx-auto px-2">
                Pelaut Hebat menawarkan berbagai fitur yang dirancang untuk meningkatkan keselamatan dan mendukung masyarakat pesisir.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {[
                { 
                  title: 'Manajemen Keselamatan', 
                  desc: 'Protokol keselamatan komprehensif dan alat manajemen risiko untuk operasi maritim.', 
                  icon: <Shield className="text-[#053040] dark:text-[#2C5B6B] w-6 h-6 md:w-8 md:h-8" />
                },
                { 
                  title: 'Ringkasan Cuaca', 
                  desc: 'Ringkasan cuaca dan gelombang laut yang disajikan dalam bentuk singkat dan mudah dipahami oleh pengguna hasil dari pengolahan data oleh AI.', 
                  icon: <Cloud className="text-[#053040] dark:text-[#2C5B6B] w-6 h-6 md:w-8 md:h-8" />
                },
                { 
                  title: 'Peta Komunitas', 
                  desc: 'Sistem respons cepat dan efektif untuk keadaan darurat maritim dan panggilan darurat.', 
                  icon: <Map className="text-[#053040] dark:text-[#2C5B6B] w-6 h-6 md:w-8 md:h-8" />
                }
              ].map((item, index) => (
                <div 
                  key={index} 
                  className="p-4 md:p-6 border rounded-lg md:rounded-xl shadow-sm bg-white dark:bg-gray-800 hover:shadow-md transition-all duration-300 hover:-translate-y-1 md:hover:-translate-y-2 group cursor-pointer border-gray-200 dark:border-gray-700"
                >
                  <div className="w-10 h-10 md:w-14 md:h-14 bg-[#2C5B6B]/10 dark:bg-[#2C5B6B]/20 rounded-full flex items-center justify-center mb-3 md:mb-4 group-hover:bg-[#2C5B6B]/20 dark:group-hover:bg-[#2C5B6B]/30 transition-colors">
                    {item.icon}
                  </div>
                  <h3 className="font-semibold text-base md:text-lg text-[#053040] dark:text-white mb-1 md:mb-2 group-hover:text-[#2C5B6B] dark:group-hover:text-[#4C7E8F] transition-colors">{item.title}</h3>
                  <p className="text-xs md:text-sm text-[#4C5F6B] dark:text-gray-300">{item.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Manajemen Keselamatan - Enhanced dengan dark mode dan perbaikan mobile */}
          <section className="max-w-6xl mx-auto px-3 sm:px-4 md:px-6">
            <div className="text-center mb-8 md:mb-12">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-[#053040] dark:text-white mb-2">Manajemen Keselamatan</h2>
              <div className="w-16 sm:w-20 h-1 bg-[#2C5B6B] mx-auto"></div>
              <p className="text-sm sm:text-base text-[#4C5F6B] dark:text-gray-300 mt-3 md:mt-4 max-w-2xl mx-auto px-2">
                Protokol keselamatan komprehensif dan alat manajemen risiko untuk operasi maritim.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {[
                { 
                  title: 'Tips Cuaca Buruk di Laut', 
                  desc: 'Durasi 2 menit',
                  icon: <AlertTriangle className="text-[#053040] dark:text-[#2C5B6B] w-4 h-4 md:w-5 md:h-5" />,
                  image: '/cuaca.jpg'
                },
                { 
                  title: '5 Alat Keselamatan Wajib', 
                  desc: 'Panduan alat pelindung dasar di kapal',
                  icon: <Shield className="text-[#053040] dark:text-[#2C5B6B] w-4 h-4 md:w-5 md:h-5" />,
                  image: '/alat-keselamatan.jpeg'
                },
                { 
                  title: 'Kode Warna Bendera Laut', 
                  desc: 'Pelajari arti bendera di laut',
                  icon: <Flag className="text-[#053040] dark:text-[#2C5B6B] w-4 h-4 md:w-5 md:h-5" />,
                  image: '/arti-bendera.jpg'
                }
              ].map((item, i) => (
                <div
                  key={i}
                  className="bg-white dark:bg-gray-800 rounded-lg md:rounded-xl overflow-hidden border shadow-md hover:shadow-lg md:hover:shadow-xl transition-all duration-300 group cursor-pointer hover:-translate-y-0.5 md:hover:-translate-y-1 border-gray-200 dark:border-gray-700"
                >
                  <div className="relative h-32 sm:h-36 md:h-48 overflow-hidden">
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      className="object-cover group-hover:scale-105 md:group-hover:scale-110 transition duration-500"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300"></div>
                  </div>
                  <div className="p-3 md:p-5">
                    <div className="flex items-center gap-2 mb-1 md:mb-2">
                      {item.icon}
                      <h4 className="font-semibold text-[#053040] dark:text-white text-sm md:text-base group-hover:text-[#2C5B6B] dark:group-hover:text-[#4C7E8F] transition-colors">
                        {item.title}
                      </h4>
                    </div>
                    <p className="text-xs md:text-sm text-[#628696] dark:text-gray-400">
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Enhanced Ringkasan Cuaca & Gelombang dengan Lokasi Terkini - dengan perbaikan mobile */}
          <section className="max-w-6xl mx-auto px-3 sm:px-4 md:px-6">
            <div className="text-center mb-8 md:mb-12">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-[#053040] dark:text-white mb-2">Ringkasan Cuaca & Gelombang Laut</h2>
              <div className="w-16 sm:w-20 h-1 bg-[#2C5B6B] mx-auto"></div>
              <p className="text-sm sm:text-base text-[#4C5F6B] dark:text-gray-300 mt-3 md:mt-4 max-w-2xl mx-auto px-2">
                Informasi terkini tentang kondisi laut yang disajikan secara jelas dan mudah dipahami.
              </p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
              {/* Lokasi Terkini Card - Enhanced dengan dark mode dan perbaikan mobile */}
              <div className="bg-gradient-to-br from-[#053040] to-[#2C5B6B] rounded-xl md:rounded-2xl shadow-lg overflow-hidden text-white hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5 md:hover:-translate-y-1">
                <div className="p-4 md:p-6">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-4 md:mb-6">
                    <div className="flex items-center gap-2 md:gap-3">
                      <div className="p-1.5 md:p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                        <Map className="text-white w-4 h-4 md:w-5 md:h-5" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-base md:text-lg">Lokasi Terkini</h4>
                        <p className="text-xs md:text-sm opacity-80">Posisi GPS Anda</p>
                      </div>
                    </div>
                    <div className={`w-2 h-2 md:w-3 md:h-3 rounded-full animate-pulse ${location ? 'bg-green-400' : 'bg-yellow-400'}`}></div>
                  </div>

                  {/* Lokasi Name */}
                  <div className="bg-white/10 rounded-lg md:rounded-xl p-3 md:p-4 mb-3 md:mb-4 backdrop-blur-sm border border-white/10">
                    <div className="text-center">
                      <div className="text-lg md:text-2xl font-bold mb-1 md:mb-2">{city}</div>
                      <div className="text-xs md:text-sm opacity-80 flex items-center justify-center gap-1 md:gap-2">
                        <span>📍</span>
                        <span>Lokasi Terdeteksi</span>
                      </div>
                    </div>
                  </div>

                  {/* Coordinates Grid */}
                  <div className="grid grid-cols-2 gap-3 md:gap-4 mb-3 md:mb-4">
                    <div className="bg-white/10 rounded-lg p-3 md:p-4 backdrop-blur-sm hover:bg-white/15 transition-colors group">
                      <div className="flex items-center gap-1 md:gap-2 mb-1 md:mb-2">
                        <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-blue-400 rounded-full"></div>
                        <span className="text-xs opacity-80">Latitude</span>
                      </div>
                      <div className="font-mono font-bold text-base md:text-lg">
                        {location?.lat.toFixed(6) || '---.------'}
                      </div>
                      <div className="text-xs opacity-60 mt-1">Garis Lintang</div>
                    </div>
                    
                    <div className="bg-white/10 rounded-lg p-3 md:p-4 backdrop-blur-sm hover:bg-white/15 transition-colors group">
                      <div className="flex items-center gap-1 md:gap-2 mb-1 md:mb-2">
                        <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-green-400 rounded-full"></div>
                        <span className="text-xs opacity-80">Longitude</span>
                      </div>
                      <div className="font-mono font-bold text-base md:text-lg">
                        {location?.lon.toFixed(6) || '---.------'}
                      </div>
                      <div className="text-xs opacity-60 mt-1">Garis Bujur</div>
                    </div>
                  </div>

                  {/* Status */}
                  <div className="flex items-center justify-between text-xs md:text-sm">
                    <div className="flex items-center gap-1 md:gap-2">
                      <div className={`w-1.5 h-1.5 md:w-2 md:h-2 rounded-full ${location ? 'bg-green-400' : 'bg-yellow-400'}`}></div>
                      <span>{location ? 'Terkoneksi GPS' : 'Mencari sinyal...'}</span>
                    </div>
                    <span className="opacity-70">
                      {new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  {error && (
                    <div className="mt-3 md:mt-4 p-2 md:p-3 bg-red-500/20 rounded-lg border border-red-500/30">
                      <div className="flex items-center gap-1 md:gap-2">
                        <AlertTriangle size={14} className="md:w-4 md:h-4 text-red-400" />
                        <p className="text-xs md:text-sm text-red-200">{error}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Recommendation Card - Enhanced dengan dark mode dan perbaikan mobile */}
              <div className="bg-white dark:bg-gray-800 rounded-xl md:rounded-2xl shadow-lg overflow-hidden border border-[#E5E7EB] dark:border-gray-700 hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5 md:hover:-translate-y-1">
                <div className="p-4 md:p-6">
                  {/* Notes: Data Dummy */}
                  <p className="text-xs text-[#4C5F6B] dark:text-gray-400 italic mb-3 md:mb-4">
                    *Data berikut merupakan contoh hasil analisis (dummy data).
                  </p>

                  {/* Header */}
                  <div className="flex items-center justify-between mb-4 md:mb-6">
                    <div className="flex items-center gap-2 md:gap-3">
                      <div className="p-1.5 md:p-2 bg-[#053040]/10 dark:bg-[#2C5B6B]/20 rounded-lg">
                        <Waves className="text-[#053040] dark:text-[#2C5B6B] w-4 h-4 md:w-5 md:h-5" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-base md:text-lg text-[#053040] dark:text-white">Analisis Kondisi Laut</h4>
                        <p className="text-xs md:text-sm text-[#4C5F6B] dark:text-gray-400">Rekomendasi pelayaran</p>
                      </div>
                    </div>
                    <div className="w-2 h-2 md:w-3 md:h-3 bg-red-400 rounded-full animate-pulse"></div>
                  </div>

                  {/* Metrics Grid */}
                  <div className="grid grid-cols-2 gap-3 md:gap-4 mb-4 md:mb-6">
                    <div className="bg-[#F8FAFC] dark:bg-gray-700 rounded-lg p-2 md:p-3 border border-[#E5E7EB] dark:border-gray-600 hover:border-[#2C5B6B] dark:hover:border-[#4C7E8F] transition-colors group">
                      <div className="flex items-center gap-1 md:gap-2 mb-1 md:mb-2">
                        <Waves size={14} className="md:w-4 md:h-4 text-[#053040] dark:text-[#2C5B6B]" />
                        <span className="text-xs font-medium text-[#4C5F6B] dark:text-gray-300">Tinggi Gelombang</span>
                      </div>
                      <div className="text-lg md:text-xl font-bold text-[#053040] dark:text-white">1.96m</div>
                      <div className="text-xs text-red-500 font-medium mt-1">Tinggi</div>
                    </div>
                    
                    <div className="bg-[#F8FAFC] dark:bg-gray-700 rounded-lg p-2 md:p-3 border border-[#E5E7EB] dark:border-gray-600 hover:border-[#2C5B6B] dark:hover:border-[#4C7E8F] transition-colors group">
                      <div className="flex items-center gap-1 md:gap-2 mb-1 md:mb-2">
                        <Gauge size={14} className="md:w-4 md:h-4 text-[#053040] dark:text-[#2C5B6B]" />
                        <span className="text-xs font-medium text-[#4C5F6B] dark:text-gray-300">Periode</span>
                      </div>
                      <div className="text-lg md:text-xl font-bold text-[#053040] dark:text-white">11.5s</div>
                      <div className="text-xs text-yellow-500 font-medium mt-1">Sedang</div>
                    </div>
                  </div>

                  {/* Analysis */}
                  <div className="space-y-3 md:space-y-4">
                    <div className="flex items-start gap-2 md:gap-3 group hover:bg-[#F8FAFC] dark:hover:bg-gray-700 p-2 md:p-3 rounded-lg transition-colors">
                      <div className="flex-shrink-0 mt-0.5 md:mt-1">
                        <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-[#053040] dark:bg-[#2C5B6B] rounded-full group-hover:scale-110 md:group-hover:scale-125 transition-transform"></div>
                      </div>
                      <p className="text-xs md:text-sm text-[#4C5F6B] dark:text-gray-300 leading-relaxed">
                        Tinggi gelombang <span className="font-semibold text-[#053040] dark:text-white">1,96 meter</span> berisiko untuk kapal tradisional.
                      </p>
                    </div>
                    
                    <div className="flex items-start gap-2 md:gap-3 group hover:bg-[#F8FAFC] dark:hover:bg-gray-700 p-2 md:p-3 rounded-lg transition-colors">
                      <div className="flex-shrink-0 mt-0.5 md:mt-1">
                        <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-[#053040] dark:bg-[#2C5B6B] rounded-full group-hover:scale-110 md:group-hover:scale-125 transition-transform"></div>
                      </div>
                      <p className="text-xs md:text-sm text-[#4C5F6B] dark:text-gray-300 leading-relaxed">
                        Periode <span className="font-semibold text-[#053040] dark:text-white">11,5 detik</span> menunjukkan gelombang besar dengan jarak jauh.
                      </p>
                    </div>
                  </div>

                  {/* Warning Box */}
                  <div className="mt-4 md:mt-6 p-3 md:p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border-l-4 border-red-500 hover:border-red-600 transition-colors">
                    <div className="flex items-start gap-2 md:gap-3">
                      <AlertTriangle className="text-red-500 flex-shrink-0 mt-0.5 w-4 h-4 md:w-5 md:h-5" />
                      <div>
                        <p className="font-medium text-red-800 dark:text-red-200 text-xs md:text-sm mb-1">Peringatan Keselamatan</p>
                        <p className="text-xs md:text-sm text-red-700 dark:text-red-300 leading-relaxed">
                          Kondisi <span className="font-semibold">tidak aman</span> untuk pelayaran. Disarankan menunda hingga pukul <span className="font-semibold text-green-600 dark:text-green-400">12.30</span>.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Footer */}
                <div className="bg-[#F8FAFC] dark:bg-gray-700 px-4 md:px-6 py-3 md:py-4 border-t border-[#E5E7EB] dark:border-gray-600">
                  <div className="flex items-center justify-between text-xs md:text-sm text-[#4C5F6B] dark:text-gray-400">
                    <div className="flex items-center gap-1 md:gap-2">
                      <Cloud size={14} className="md:w-4 md:h-4 text-[#2C5B6B] dark:text-[#4C7E8F]" />
                      <span>Update berikutnya</span>
                    </div>
                    <span className="font-medium">11:30 AM</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Testimoni - Enhanced dengan carousel dan dark mode serta perbaikan mobile */}
          <section ref={testimonialRef} className="max-w-6xl mx-auto px-3 sm:px-4 md:px-6">
            <div className="text-center mb-8 md:mb-12">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-[#053040] dark:text-white mb-2">Apa Kata Mereka</h2>
              <div className="w-16 sm:w-20 h-1 bg-[#2C5B6B] mx-auto"></div>
              <p className="text-sm sm:text-base text-[#4C5F6B] dark:text-gray-300 mt-3 md:mt-4 max-w-2xl mx-auto px-2">
                Testimoni dari pengguna setia Pelaut Hebat
              </p>
            </div>

            {/* Testimonial Carousel */}
            <div className="relative">
              {/* Testimonial Cards */}
              <div className="overflow-hidden rounded-xl md:rounded-2xl">
                <div 
                  className="flex transition-transform duration-500 ease-in-out"
                  style={{ transform: `translateX(-${currentSlide * 100}%)` }}
                >
                  {testimonials.map((testimonial, i) => (
                    <div
                      key={i}
                      className="w-full flex-shrink-0 bg-white dark:bg-gray-800 border rounded-xl md:rounded-2xl shadow-md p-4 md:p-8 relative overflow-hidden hover:shadow-lg transition-shadow border-gray-200 dark:border-gray-700"
                    >
                      <Quote className="absolute top-4 right-4 md:top-6 md:right-6 text-[#053040]/10 dark:text-gray-600 w-8 h-8 md:w-16 md:h-16" />
                      <div className="relative z-10">
                        <p className="text-sm md:text-lg text-[#053040] dark:text-white leading-relaxed mb-4 md:mb-6">
                          {testimonial.quote}
                        </p>
                        <div className="text-xs md:text-base text-[#053040] dark:text-gray-300 italic font-semibold">
                          {testimonial.author}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Carousel Controls */}
              <div className="flex items-center justify-center gap-3 md:gap-4 mt-6 md:mt-8">
                <button 
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="p-1.5 md:p-2 rounded-full bg-[#053040] dark:bg-[#2C5B6B] text-white hover:bg-[#2C5B6B] dark:hover:bg-[#4C7E8F] transition-colors"
                >
                  {isPlaying ? <Pause size={16} className="md:w-5 md:h-5" /> : <Play size={16} className="md:w-5 md:h-5" />}
                </button>
                
                {/* Dots Indicator */}
                <div className="flex gap-1.5 md:gap-2">
                  {testimonials.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentSlide(i)}
                      className={`w-2 h-2 md:w-3 md:h-3 rounded-full transition-all ${
                        i === currentSlide ? 'bg-[#053040] dark:bg-[#2C5B6B]' : 'bg-[#2C5B6B]/30 dark:bg-gray-600'
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

        /* Mobile-specific improvements */
        @media (max-width: 400px) {
          .text-2xl {
            font-size: 1.5rem;
            line-height: 2rem;
          }
          
          .text-lg {
            font-size: 1.125rem;
            line-height: 1.75rem;
          }
          
          .text-base {
            font-size: 1rem;
            line-height: 1.5rem;
          }
          
          .text-sm {
            font-size: 0.875rem;
            line-height: 1.25rem;
          }
          
          .text-xs {
            font-size: 0.75rem;
            line-height: 1rem;
          }
          
          .p-4 {
            padding: 1rem;
          }
          
          .p-3 {
            padding: 0.75rem;
          }
          
          .gap-4 {
            gap: 1rem;
          }
          
          .gap-3 {
            gap: 0.75rem;
          }
          
          .rounded-xl {
            border-radius: 0.75rem;
          }
          
          .rounded-lg {
            border-radius: 0.5rem;
          }
        }

        /* iPhone 6s specific fixes */
        @media (max-width: 375px) {
          .space-y-16 > * + * {
            margin-top: 3rem;
          }
          
          .pt-24 {
            padding-top: 5rem;
          }
          
          .mx-3 {
            margin-left: 0.75rem;
            margin-right: 0.75rem;
          }
          
          .px-3 {
            padding-left: 0.75rem;
            padding-right: 0.75rem;
          }
        }
      `}</style>
    </>
  );
}