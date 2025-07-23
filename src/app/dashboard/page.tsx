// src/app/dashboard/page.tsx

import LayoutNavbar from '@/components/LayoutNavbar'
import Image from 'next/image'
import { Quote } from 'lucide-react'

export default function DashboardPage() {
  return (
    <LayoutNavbar>
      <div className="space-y-24 pt-28">
        {/* Hero Section */}
        <section className="relative bg-[#053040] text-white rounded-3xl px-6 py-20 overflow-hidden shadow-lg mx-4 sm:mx-8 md:mx-auto max-w-6xl">
          <Image
            src="/signup-bg.png"
            alt="Hero background"
            fill
            className="absolute inset-0 object-cover opacity-30"
          />
          <div className="relative z-10 max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-extrabold leading-tight mb-6">
              Meningkatkan Keselamatan Transportasi Laut dan Kesejahteraan Masyarakat Pesisir
            </h1>
            <p className="text-lg text-[#C9CFCF]">
              Pelaut Hebat berdedikasi untuk meningkatkan keselamatan dalam transportasi laut dan mendukung kesejahteraan masyarakat pesisir melalui solusi inovatif dan layanan komprehensif.
            </p>
          </div>
        </section>

        {/* Fitur Utama */}
        <section className="max-w-6xl mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-[#053040] mb-4">Fitur Utama</h2>
          <p className="text-[#4C5F6B] mb-6">
            Pelaut Hebat menawarkan berbagai fitur yang dirancang untuk meningkatkan keselamatan dan mendukung masyarakat pesisir.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { title: 'Manajemen Keselamatan', desc: 'Protokol keselamatan komprehensif dan alat manajemen risiko untuk operasi maritim.', icon: '🌊' },
              { title: 'Ringkasan Cuaca', desc: 'Ringkasan cuaca dan gelombang laut yang disajikan dalam bentuk singkat dan mudah dipahami oleh pengguna hasil dari pengolahan data oleh AI.', icon: '☁️' },
              { title: 'Peta Komunitas', desc: 'Sistem respons cepat dan efektif untuk keadaan darurat maritim dan panggilan darurat.', icon: '🗺️' }
            ].map((item, index) => (
              <div key={index} className="p-5 border rounded-xl shadow-sm bg-white">
                <div className="text-3xl mb-3">{item.icon}</div>
                <h3 className="font-semibold text-[#053040] mb-1">{item.title}</h3>
                <p className="text-sm text-[#4C5F6B]">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Manajemen Keselamatan */}
        <section className="max-w-6xl mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-[#053040] mb-4">Manajemen Keselamatan</h2>
          <p className="text-[#4C5F6B] mb-6">
            Protokol keselamatan komprehensif dan alat manajemen risiko untuk operasi maritim.
          </p>
          <div className="grid md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-white rounded-xl overflow-hidden border shadow-md hover:shadow-lg transition"
              >
                <Image
                  src="/hero-sea.jpg"
                  alt="Keselamatan Laut"
                  width={400}
                  height={200}
                  className="object-cover w-full h-36"
                />
                <div className="p-4">
                  <h4 className="font-semibold text-[#053040] text-md mb-1">
                    {i === 1 && 'Tips Cuaca Buruk di Laut'}
                    {i === 2 && '5 Alat Keselamatan Wajib'}
                    {i === 3 && 'Kode Warna Bendera Laut'}
                  </h4>
                  <p className="text-sm text-[#628696]">
                    {i === 1 && 'Durasi 2 menit'}
                    {i === 2 && 'Panduan alat pelindung dasar di kapal'}
                    {i === 3 && 'Pelajari arti bendera di laut'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Ringkasan Cuaca & Gelombang */}
        <section className="max-w-6xl mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-[#053040] mb-6">Ringkasan Cuaca & Gelombang Laut</h2>
          <p className="text-[#4C5F6B] mb-8">
            Ringkasan cuaca dan gelombang laut yang disajikan dalam bentuk singkat dan mudah dipahami oleh pengguna hasil dari pengolahan data oleh AI.
          </p>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="p-5 border rounded-xl shadow-sm bg-white">
              <h4 className="font-semibold mb-2">Manyeuw, Maluku, Indonesia</h4>
              <p className="text-sm text-[#4C5F6B]">Saat ini 29° - Umumnya berawan</p>
            </div>
            <div className="p-5 border rounded-xl shadow-sm bg-white">
              <h4 className="font-semibold mb-2">Rekomendasi Pelayaran</h4>
              <p className="text-sm text-[#4C5F6B] leading-relaxed">
                Dengan kondisi laut saat ini, tinggi gelombang mencapai sekitar 1,96 meter, yang tergolong cukup tinggi untuk kapal nelayan tradisional. Gelombang sebesar ini dapat menyebabkan kapal perayangan cukup kuat dan meningkatkan risiko keselamatan. <br />
                Periode gelombang sekitar 11,5 detik menunjukkan jarak antar gelombang yang jauh, namun tetap berbahaya karena ukuran gelombangnya besar.
                <br />
                <strong>Kesimpulan:</strong> Kondisi saat ini tidak aman untuk pelayaran dengan kapal kecil atau tradisional. Disarankan untuk menunda keberangkatan hingga gelombang laut lebih tenang, diperkirakan sekitar pukul 12.30.
              </p>
            </div>
          </div>
        </section>

        {/* Testimoni */}
        <section className="max-w-6xl mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-[#053040] mb-12 text-center">Testimoni</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-white border rounded-3xl shadow-md p-6 relative overflow-hidden hover:shadow-xl transition"
              >
                <Quote className="absolute top-4 right-4 text-[#053040] opacity-10 w-12 h-12" />
                <p className="text-sm text-[#053040] leading-relaxed mb-4">
                  {i === 1 && '“Sejak pakai website ini, saya bisa tahu kapan laut sedang tidak bersahabat. Dulu saya sering nekat berangkat, tapi sekarang lebih tenang karena bisa melihat rekomendasi langsung. Sangat membantu nelayan kecil seperti saya.”'}
                  {i === 2 && '“Fitur ringkasan cuacanya sangat informatif dan mudah dipahami, terutama untuk menjelaskan kondisi laut ke awak kapal yang akan berlayar. Perhitungan gelombang dan saran waktunya cukup akurat sejauh ini.”'}
                  {i === 3 && '“Saya pakai website ini setiap hari sebelum membawa tamu snorkeling. Info tinggi gelombangnya sangat membantu untuk menentukan spot yang aman. Desain webnya juga simpel dan langsung ke poin.”'}
                </p>
                <div className="text-sm text-[#053040] italic font-medium">
                  {i === 1 && 'Pak Rudi, 52 tahun, Ambon'}
                  {i === 2 && 'Bu Yuni, 38 tahun, Tual'}
                  {i === 3 && 'Bang Dimas, 29 tahun, Kei Kecil'}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Footer */}
        <footer className="max-w-6xl mx-auto px-4 pt-12 pb-6 text-sm text-[#4C5F6B] flex flex-col md:flex-row justify-between border-t mt-16">
          <div className="flex flex-col md:flex-row gap-4">
            <span>Kebijakan Privasi</span>
            <span>Ketentuan Layanan</span>
          </div>
          <div className="mt-4 md:mt-0">&copy; 2025 Pelaut Hebat. Hak cipta dilindungi.</div>
        </footer>
      </div>
    </LayoutNavbar>
  )
}