// src/app/dashboard/page.tsx

import LayoutNavbar from '@/components/LayoutNavbar'
import Image from 'next/image'
import { AlertCircle, Video, Waves, Quote } from 'lucide-react'

export default function DashboardPage() {
  return (
    <LayoutNavbar>
      <div className="space-y-16 pt-28">
        {/* Hero Section */}
        <section className="relative bg-[#053040] text-white rounded-3xl px-8 py-16 overflow-hidden shadow-lg">
          <Image
            src="/hero-sea.jpg"
            alt="Hero background"
            fill
            className="absolute inset-0 object-cover opacity-30"
          />
          <div className="relative z-10 max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-extrabold leading-tight mb-4">
              Meningkatkan Keselamatan Transportasi Laut dan Kesejahteraan Masyarakat Pesisir
            </h1>
            <p className="text-lg text-[#C9CFCF]">
              Pelaut Hebat berdedikasi untuk meningkatkan keselamatan dalam transportasi laut dan mendukung kesejahteraan masyarakat pesisir melalui solusi inovatif dan layanan komprehensif.
            </p>
          </div>
        </section>

        {/* Ringkasan Info Cuaca & Gelombang */}
        <section className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-[#053040] mb-8 text-center">Ringkasan Cuaca & Gelombang Laut</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {/* Cuaca */}
            <div className="bg-white p-6 rounded-2xl shadow-md border hover:shadow-lg transition">
              <h3 className="text-[#2C5B6B] font-semibold text-lg mb-3">Cuaca Hari Ini</h3>
              <p className="text-[#628696] text-sm leading-relaxed">
                Wilayah: Perairan Indonesia Timur<br />
                Cuaca: Cerah berawan<br />
                Suhu: 28°C - 30°C
              </p>
            </div>
            {/* Gelombang */}
            <div className="bg-white p-6 rounded-2xl shadow-md border hover:shadow-lg transition">
              <h3 className="text-[#2C5B6B] font-semibold text-lg mb-3">Kondisi Gelombang</h3>
              <ul className="text-[#628696] text-sm list-disc list-inside space-y-1">
                <li>Maluku Tenggara: 2.5 - 4.0 m ⚠️</li>
                <li>Selat Makassar: 1.0 - 2.0 m</li>
                <li>Laut Jawa: 0.5 - 1.5 m</li>
              </ul>
            </div>
            {/* Peta Laut */}
            <div className="bg-white p-6 rounded-2xl shadow-md border hover:shadow-lg transition">
              <h3 className="text-[#2C5B6B] font-semibold text-lg mb-3">Peta Interaktif (Preview)</h3>
              <div className="rounded-lg overflow-hidden border">
                <Image
                  src="/hero-sea.jpg"
                  alt="Peta Laut"
                  width={400}
                  height={200}
                  className="object-cover w-full h-32"
                />
              </div>
              <p className="text-[#8FAABB] text-xs mt-2 italic text-center">Klik untuk membuka versi lengkap</p>
            </div>
          </div>
        </section>

        {/* Notifikasi
        <section className="max-w-4xl mx-auto px-4">
          <div className="flex items-start gap-4 bg-red-50 border border-red-200 p-6 rounded-xl shadow">
            <AlertCircle className="text-red-600 mt-1" />
            <div>
              <h3 className="font-semibold text-[#8B0000] text-lg mb-1">Peringatan Dini</h3>
              <p className="text-sm text-[#2C5B6B] leading-relaxed">
                Gelombang tinggi (2.5 – 4.0 meter) terpantau di wilayah <strong>Maluku Tenggara</strong>. Kapal kecil disarankan tidak berlayar.
              </p>
            </div>
          </div>
        </section> */}

        {/* Edukasi Keselamatan */}
        <section className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-[#053040] mb-8 text-center">Edukasi Keselamatan</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl overflow-hidden shadow-md border hover:shadow-xl transition group">
              <Image
                src="/hero-sea.jpg"
                alt="Tips Cuaca Buruk"
                width={400}
                height={200}
                className="w-full h-40 object-cover group-hover:scale-105 transition-transform"
              />
              <div className="p-5">
                <h4 className="font-semibold text-[#053040] text-lg mb-1">Tips Cuaca Buruk di Laut</h4>
                <p className="text-sm text-[#628696]">Durasi: 2 menit</p>
              </div>
            </div>
            <div className="bg-white rounded-2xl overflow-hidden shadow-md border hover:shadow-xl transition group">
              <Image
                src="/hero-sea.jpg"
                alt="Alat Keselamatan"
                width={400}
                height={200}
                className="w-full h-40 object-cover group-hover:scale-105 transition-transform"
              />
              <div className="p-5">
                <h4 className="font-semibold text-[#053040] text-lg mb-1">5 Alat Keselamatan Wajib</h4>
                <p className="text-sm text-[#628696]">Panduan alat pelindung dasar di kapal.</p>
              </div>
            </div>
            <div className="bg-white rounded-2xl overflow-hidden shadow-md border hover:shadow-xl transition group">
              <Image
                src="/hero-sea.jpg"
                alt="Kode Warna Bendera"
                width={400}
                height={200}
                className="w-full h-40 object-cover group-hover:scale-105 transition-transform"
              />
              <div className="p-5">
                <h4 className="font-semibold text-[#053040] text-lg mb-1">Kode Warna Bendera Laut</h4>
                <p className="text-sm text-[#628696]">Pelajari arti bendera cuaca untuk keamanan pelayaran.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Testimoni */}
        <section className="max-w-5xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-[#053040] mb-12 text-center">Apa Kata Mereka ?</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-gradient-to-br from-[#C9CFCF] to-[#8FAABB] p-6 rounded-3xl shadow-xl relative overflow-hidden hover:scale-[1.02] transition-transform">
              <Quote className="absolute top-4 right-4 text-[#053040] opacity-10 w-16 h-16" />
              <p className="text-[#053040] text-base leading-relaxed">
                “Dashboard ini sangat membantu nelayan seperti saya. Saya bisa tahu kapan aman melaut.”
              </p>
              <div className="mt-4 text-sm text-[#053040] italic font-medium text-right">
                — Pak Darto, Nelayan Kendari
              </div>
            </div>
            <div className="bg-gradient-to-br from-[#C9CFCF] to-[#8FAABB] p-6 rounded-3xl shadow-xl relative overflow-hidden hover:scale-[1.02] transition-transform">
              <Quote className="absolute top-4 right-4 text-[#053040] opacity-10 w-16 h-16" />
              <p className="text-[#053040] text-base leading-relaxed">
                “Peta dan ringkasan cuacanya jelas. Sangat membantu kami para wisatawan.”
              </p>
              <div className="mt-4 text-sm text-[#053040] italic font-medium text-right">
                — Mira, Wisatawan Raja Ampat
              </div>
            </div>
          </div>
        </section>
      </div>
    </LayoutNavbar>
  )
}
