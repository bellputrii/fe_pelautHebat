import LayoutNavbar from '@/components/LayoutNavbar'
import Footer from '@/components/Footer'
import Image from 'next/image'
import { Quote, Waves, Cloud, Map, Shield, AlertTriangle, Flag } from 'lucide-react'

export default function DashboardPage() {
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
                icon: <AlertTriangle className="text-[#053040]" size={20} />
              },
              { 
                title: '5 Alat Keselamatan Wajib', 
                desc: 'Panduan alat pelindung dasar di kapal',
                icon: <Shield className="text-[#053040]" size={20} />
              },
              { 
                title: 'Kode Warna Bendera Laut', 
                desc: 'Pelajari arti bendera di laut',
                icon: <Flag className="text-[#053040]" size={20} />
              }
            ].map((item, i) => (
              <div
                key={i}
                className="bg-white rounded-xl overflow-hidden border shadow-md hover:shadow-lg transition group"
              >
                <div className="relative h-48 overflow-hidden">
                  <Image
                    src={`/safety-${i+1}.jpg`}
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

        {/* Ringkasan Cuaca & Gelombang */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-[#053040] mb-2">Ringkasan Cuaca & Gelombang Laut</h2>
            <div className="w-20 h-1 bg-[#2C5B6B] mx-auto"></div>
            <p className="text-[#4C5F6B] mt-4 max-w-2xl mx-auto">
              Informasi terkini tentang kondisi laut yang disajikan secara jelas dan mudah dipahami.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="p-6 border rounded-xl shadow-sm bg-white">
              <div className="flex items-center gap-3 mb-4">
                <Cloud className="text-[#053040]" size={24} />
                <h4 className="font-semibold text-lg">Manyeuw, Maluku, Indonesia</h4>
              </div>
              <div className="flex items-center justify-between">
                <div className="text-3xl font-bold text-[#053040]">29°C</div>
                <div className="text-sm text-[#4C5F6B] bg-[#2C5B6B]/10 px-3 py-1 rounded-full">
                  Umumnya berawan
                </div>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2 text-center text-sm">
                <div>
                  <div className="font-medium text-[#053040]">Angin</div>
                  <div className="text-[#4C5F6B]">12 km/j</div>
                </div>
                <div>
                  <div className="font-medium text-[#053040]">Kelembaban</div>
                  <div className="text-[#4C5F6B]">78%</div>
                </div>
                <div>
                  <div className="font-medium text-[#053040]">Gelombang</div>
                  <div className="text-[#4C5F6B]">1.96m</div>
                </div>
              </div>
            </div>
            <div className="p-6 border rounded-xl shadow-sm bg-white">
              <div className="flex items-center gap-3 mb-4">
                <Waves className="text-[#053040]" size={24} />
                <h4 className="font-semibold text-lg">Rekomendasi Pelayaran</h4>
              </div>
              <p className="text-sm text-[#4C5F6B] leading-relaxed space-y-2">
                <p>Dengan kondisi laut saat ini, tinggi gelombang mencapai sekitar <span className="font-semibold">1,96 meter</span>, yang tergolong cukup tinggi untuk kapal nelayan tradisional.</p>
                <p>Periode gelombang sekitar <span className="font-semibold">11,5 detik</span> menunjukkan jarak antar gelombang yang jauh, namun tetap berbahaya karena ukuran gelombangnya besar.</p>
                <div className="mt-4 p-3 bg-[#2C5B6B]/10 rounded-lg border-l-4 border-[#053040]">
                  <p className="font-medium text-[#053040]">Kesimpulan:</p>
                  <p>Kondisi saat ini tidak aman untuk pelayaran dengan kapal kecil atau tradisional. Disarankan untuk menunda keberangkatan hingga gelombang laut lebih tenang, diperkirakan sekitar pukul 12.30.</p>
                </div>
              </p>
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