'use client';

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { useState } from 'react';
import { Wind, Waves, Gauge, Thermometer, Compass } from 'lucide-react';
import LayoutNavbar from '@/components/LayoutNavbar';
import Footer from '@/components/Footer';

export default function KondisiLautPage() {
  const [lokasi, setLokasi] = useState({
    lat: -7.801194,
    lng: 110.364917,
    nama: "Deepa's Art Studio",
  });

  const handleMarkerClick = () => {
    console.log('Titik diklik:', lokasi.nama);
  };

  return (
     <>
      <LayoutNavbar>
     <div className="p-4 md:p-8 bg-[#f5fcff] min-h-screen max-w-7xl mx-auto">
          {/* Header with same width as dropdowns */}
          <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
               <h1 className="text-2xl md:text-3xl font-bold text-[#053040]">Cek Kondisi Lautmu!</h1>
               <p className="text-sm md:text-base text-[#5c7893] mt-2">
               Dapatkan rekomendasi berlayar yang lebih aman berdasarkan data terkini.
               </p>
          </div>
          
          {/* Empty div to maintain grid structure */}
          <div className="md:col-span-2"></div>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
          {/* Sidebar Info - Now matches height with map section */}
          <div className="space-y-6 md:col-span-1 flex flex-col">
               {/* Informasi Cuaca */}
               <div className="bg-white rounded-xl shadow-sm p-4 space-y-4 flex-grow">
               <h2 className="text-lg font-semibold text-[#053040] border-b pb-2">Kondisi Saat Ini</h2>
               {[
               { label: 'Kecepatan Angin', value: '25 knots', icon: <Wind className="text-[#00698f]" size={20} /> },
               { label: 'Tinggi Gelombang', value: '1.5 meters', icon: <Waves className="text-[#00698f]" size={20} /> },
               { label: 'Tekanan Atmosfer', value: '1012 hPa', icon: <Gauge className="text-[#00698f]" size={20} /> },
               { label: 'Suhu', value: '22°C', icon: <Thermometer className="text-[#00698f]" size={20} /> },
               { label: 'Arah Angin', value: '94°', icon: <Compass className="text-[#00698f]" size={20} /> },
               ].map((item, idx) => (
               <div key={idx} className="flex items-center gap-3">
                    <div className="p-2 bg-[#eaf9fd] rounded-lg">
                    {item.icon}
                    </div>
                    <div className="flex-1">
                    <div className="text-sm font-medium text-[#053040]">{item.label}</div>
                    <div className="text-sm text-[#5c7893]">{item.value}</div>
                    </div>
               </div>
               ))}
               </div>

               {/* Tombol Prakiraan - now aligned with AI Recommendation */}
               <div className="mt-auto">
               <button className="bg-[#053040] text-white w-full py-3 rounded-xl font-semibold hover:bg-[#2C5B6B] transition-colors shadow-md flex items-center justify-center gap-2">
               <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 12a10 10 0 0 0-20 0" />
                    <path d="M22 12a10 10 0 0 1-20 0" />
                    <path d="M6 12h.01" />
                    <path d="M12 12h.01" />
                    <path d="M18 12h.01" />
               </svg>
               Lihat Prakiraan
               </button>
               </div>
          </div>

          {/* Map dan Dropdown */}
          <div className="md:col-span-2 space-y-6">
               {/* Dropdowns - now properly aligned with title */}
               <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
               <div className="relative">
               <select className="w-full border border-gray-200 p-2.5 rounded-xl shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-[#2C5B6B]/50 focus:border-[#2C5B6B] bg-white h-[42px]">
                    <option>Waktu Berlayar Aman</option>
                    <option>Pagi (06:00 - 10:00)</option>
                    <option>Siang (10:00 - 14:00)</option>
                    <option>Sore (14:00 - 18:00)</option>
               </select>
               </div>
               <div className="relative">
               <select className="w-full border border-gray-200 p-2.5 rounded-xl shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-[#2C5B6B]/50 focus:border-[#2C5B6B] bg-white h-[42px]">
                    <option>Kapal Nelayan</option>
                    <option>Kapal Pesiar</option>
                    <option>Kapal Kargo</option>
               </select>
               </div>
               <div className="relative">
               <select className="w-full border border-gray-200 p-2.5 rounded-xl shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-[#2C5B6B]/50 focus:border-[#2C5B6B] bg-white h-[42px]">
                    <option>1 Hari</option>
                    <option>3 Hari</option>
                    <option>7 Hari</option>
               </select>
               </div>
               </div>

               {/* Peta */}
               <div className="h-[400px] w-full rounded-xl overflow-hidden shadow-md bg-white border border-gray-100">
               <MapContainer 
               center={[lokasi.lat, lokasi.lng]} 
               zoom={13} 
               style={{ height: '100%', width: '100%' }}
               className="z-0"
               >
               <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    // @ts-ignore
                    attribution="&copy; OpenStreetMap contributors"
               />
               <Marker position={[lokasi.lat, lokasi.lng]} eventHandlers={{ click: handleMarkerClick }}>
                    <Popup className="text-sm font-medium">{lokasi.nama}</Popup>
               </Marker>
               </MapContainer>
               </div>

               {/* Rekomendasi AI - now same height as forecast button */}
               <div className="bg-white p-5 rounded-xl shadow-sm border border-[#eaf9fd] min-h-[80px]">
               <div className="flex items-center gap-3 mb-3">
               <div className="bg-[#053040] p-2 rounded-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 8V4H8" />
                    <rect width="16" height="12" x="4" y="8" rx="2" />
                    <path d="M2 14h2" />
                    <path d="M20 14h2" />
                    <path d="M15 13v2" />
                    <path d="M9 13v2" />
                    </svg>
               </div>
               <h2 className="text-lg font-semibold text-[#053040]">Rekomendasi AI</h2>
               </div>
               <p className="text-sm text-gray-700 leading-relaxed pl-11">
               Berdasarkan kondisi saat ini dan data historis, kondisi laut diklasifikasikan sebagai <span className="font-medium text-[#053040]">sedang</span>.
               Berhati-hatilah saat bernavigasi di dekat pantai. Kondisi cocok untuk perahu kecil,
               tetapi tetaplah berada di dalam area yang ditentukan.
               </p>
               </div>
          </div>
          </div>
     </div>
     </LayoutNavbar>
     <Footer />
     </>
  );
}