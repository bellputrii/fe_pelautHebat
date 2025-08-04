'use client';

import LayoutNavbar from '@/components/LayoutNavbar'
import Footer from '@/components/Footer'
import Image from 'next/image'
import { Quote, Waves, Cloud, Map, Shield, AlertTriangle, Flag, Droplets, Wind, Gauge } from 'lucide-react'
import { useTokenRefresh } from '@/app/hooks/useAuth'

export default function DashboardPage() {
  // Initialize token refresh mechanism
  useTokenRefresh();

  return (
    <LayoutNavbar>
      <div className="space-y-24 pt-28 pb-12">
        {/* Hero Section */}
        <section className="relative bg-[#053040] text-white rounded-3xl px-6 py-20 overflow-hidden shadow-lg mx-4 sm:mx-8 md:mx-auto max-w-6xl">
          <Image
            src="/signup-bg.png"
            alt="Hero background"
            fill
            className="absolute inset-0 object-cover opacity-30"
            priority
          />
          <div className="relative z-10 max-w-3xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center gap-2 bg-[#2C5B6B]/80 px-4 py-2 rounded-full">
              <Waves size={20} />
              <span className="text-sm font-medium">Keselamatan Laut Prioritas Kami</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold leading-tight">
              Meningkatkan Keselamatan Transportasi Laut dan Kesejahteraan Masyarakat Pesisir
            </h1>
            <p className="text-lg text-[#C9CFCF]">
              Pelaut Hebat berdedikasi untuk meningkatkan keselamatan dalam transportasi laut dan mendukung kesejahteraan masyarakat pesisir melalui solusi inovatif dan layanan komprehensif.
            </p>
          </div>
        </section>

        {/* Fitur Utama */}
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
                className="p-6 border rounded-xl shadow-sm bg-white hover:shadow-md transition-all duration-300 hover:-translate-y-1"
              >
                <div className="w-14 h-14 bg-[#2C5B6B]/10 rounded-full flex items-center justify-center mb-4">
                  {item.icon}
                </div>
                <h3 className="font-semibold text-lg text-[#053040] mb-2">{item.title}</h3>
                <p className="text-sm text-[#4C5F6B]">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Manajemen Keselamatan */}
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
                className="bg-white rounded-xl overflow-hidden border shadow-md hover:shadow-lg transition group"
              >
                <div className="relative h-48 overflow-hidden">
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    className="object-cover group-hover:scale-105 transition duration-500"
                  />
                </div>
                <div className="p-5">
                  <div className="flex items-center gap-2 mb-2">
                    {item.icon}
                    <h4 className="font-semibold text-[#053040] text-md">
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

        {/* Enhanced Ringkasan Cuaca & Gelombang */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-[#053040] mb-2">Ringkasan Cuaca & Gelombang Laut</h2>
            <div className="w-20 h-1 bg-[#2C5B6B] mx-auto"></div>
            <p className="text-[#4C5F6B] mt-4 max-w-2xl mx-auto">
              Informasi terkini tentang kondisi laut yang disajikan secara jelas dan mudah dipahami.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            {/* Weather Card - Enhanced */}
            <div className="bg-gradient-to-br from-[#053040] to-[#2C5B6B] rounded-2xl shadow-lg overflow-hidden text-white">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <Cloud className="text-white" size={24} />
                    <h4 className="font-semibold text-lg">Manyeuw, Maluku</h4>
                  </div>
                  <div className="text-xs bg-white/20 px-3 py-1 rounded-full">
                    Updated: 10:45 AM
                  </div>
                </div>
                
                <div className="flex items-center justify-between mb-6">
                  <div className="text-5xl font-bold">29°C</div>
                  <div className="text-right">
                    <div className="text-sm opacity-80">Umumnya berawan</div>
                    <div className="text-xs mt-1 opacity-60">H: 31° L: 27°</div>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="bg-white/10 p-3 rounded-lg backdrop-blur-sm">
                    <Wind className="mx-auto mb-1" size={20} />
                    <div className="text-xs opacity-80">Angin</div>
                    <div className="font-medium">12 km/j</div>
                  </div>
                  <div className="bg-white/10 p-3 rounded-lg backdrop-blur-sm">
                    <Droplets className="mx-auto mb-1" size={20} />
                    <div className="text-xs opacity-80">Kelembaban</div>
                    <div className="font-medium">78%</div>
                  </div>
                  <div className="bg-white/10 p-3 rounded-lg backdrop-blur-sm">
                    <Waves className="mx-auto mb-1" size={20} />
                    <div className="text-xs opacity-80">Gelombang</div>
                    <div className="font-medium">1.96m</div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white/10 px-6 py-3 border-t border-white/20">
                <div className="flex items-center justify-between text-sm">
                  <span>Periode Gelombang:</span>
                  <span className="font-medium">11.5 detik</span>
                </div>
              </div>
            </div>
            
            {/* Recommendation Card - Enhanced */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-[#E5E7EB]">
              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Waves className="text-[#053040]" size={24} />
                  <h4 className="font-semibold text-lg">Rekomendasi Pelayaran</h4>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-1">
                      <div className="w-2 h-2 bg-[#053040] rounded-full"></div>
                    </div>
                    <p className="text-sm text-[#4C5F6B]">
                      Tinggi gelombang saat ini mencapai <span className="font-semibold text-[#053040]">1,96 meter</span>, tergolong cukup tinggi untuk kapal nelayan tradisional.
                    </p>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-1">
                      <div className="w-2 h-2 bg-[#053040] rounded-full"></div>
                    </div>
                    <p className="text-sm text-[#4C5F6B]">
                      Periode gelombang <span className="font-semibold text-[#053040]">11,5 detik</span> menunjukkan jarak antar gelombang yang jauh, namun tetap berbahaya karena ukuran gelombangnya besar.
                    </p>
                  </div>
                  
                  <div className="mt-6 p-4 bg-[#F8FAFC] rounded-lg border-l-4 border-[#053040]">
                    <div className="flex items-start gap-2">
                      <Gauge className="text-[#053040] flex-shrink-0 mt-0.5" size={18} />
                      <div>
                        <p className="font-medium text-[#053040] text-sm mb-1">Kesimpulan:</p>
                        <p className="text-sm text-[#4C5F6B]">
                          Kondisi saat ini <span className="font-semibold">tidak aman</span> untuk pelayaran dengan kapal kecil atau tradisional. Disarankan untuk menunda keberangkatan hingga gelombang laut lebih tenang, diperkirakan sekitar pukul <span className="font-semibold">12.30</span>.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-[#F8FAFC] px-6 py-3 border-t border-[#E5E7EB] text-sm text-[#4C5F6B]">
                <div className="flex items-center justify-between">
                  <span>Update berikutnya:</span>
                  <span className="font-medium">11:30 AM</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Testimoni */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-[#053040] mb-2">Apa Kata Mereka</h2>
            <div className="w-20 h-1 bg-[#2C5B6B] mx-auto"></div>
            <p className="text-[#4C5F6B] mt-4 max-w-2xl mx-auto">
              Testimoni dari pengguna setia Pelaut Hebat
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
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
            ].map((testimonial, i) => (
              <div
                key={i}
                className="bg-white border rounded-3xl shadow-md p-6 relative overflow-hidden hover:shadow-xl transition h-full"
              >
                <Quote className="absolute top-4 right-4 text-[#053040]/10 w-12 h-12" />
                <div className="relative z-10 h-full flex flex-col">
                  <p className="text-sm text-[#053040] leading-relaxed mb-4 flex-grow">
                    {testimonial.quote}
                  </p>
                  <div className="text-sm text-[#053040] italic font-medium mt-auto">
                    {testimonial.author}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
      <Footer />
    </LayoutNavbar>
  )
}