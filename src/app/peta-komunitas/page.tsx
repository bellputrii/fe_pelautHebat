'use client';

import { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { ThumbsUp, ThumbsDown, MessageCircle } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import LayoutNavbar from '@/components/LayoutNavbar';
import Footer from '@/components/Footer';

const dangerTypes = [
  'Perubahan cuaca ekstrem',
  'Kabut Tebal',
  'Arus Laut Kuat',
  'Gelombang tinggi',
  'Kebocoran lambung kapal',
];

type Report = {
  id: number;
  username: string;
  time: string;
  content: string;
  likes: number;
  dislikes: number;
  comments: number;
  userLiked: boolean;
  userDisliked: boolean;
};

export default function ReportPage() {
  const [lokasi, setLokasi] = useState('');
  const [jenisBahaya, setJenisBahaya] = useState('');
  const [deskripsi, setDeskripsi] = useState('');
  const [activeFilter, setActiveFilter] = useState('Semua');
  const [reports, setReports] = useState<Report[]>([
    {
      id: 1,
      username: 'Nama Pengguna',
      time: '1 jam yang lalu',
      content: 'Contoh laporan bahaya laut dari pengguna. Deskripsikan bahaya yang terjadi di laut.',
      likes: 20,
      dislikes: 2,
      comments: 0,
      userLiked: false,
      userDisliked: false,
    },
    {
      id: 2,
      username: 'Pelaut Handal',
      time: '3 jam yang lalu',
      content: 'Menemukan gelombang tinggi di sekitar perairan Manyeuw, harap berhati-hati.',
      likes: 15,
      dislikes: 0,
      comments: 3,
      userLiked: false,
      userDisliked: false,
    },
    {
      id: 3,
      username: 'Tim SAR',
      time: '5 jam yang lalu',
      content: 'Kabut tebal terlihat di wilayah selatan, visibilitas kurang dari 100 meter.',
      likes: 32,
      dislikes: 1,
      comments: 5,
      userLiked: false,
      userDisliked: false,
    },
  ]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Kirim data ke backend
    console.log({ lokasi, jenisBahaya, deskripsi });
  };

  const handleLike = (id: number) => {
    setReports(reports.map(report => {
      if (report.id === id) {
        // If already liked, remove like
        if (report.userLiked) {
          return {
            ...report,
            likes: report.likes - 1,
            userLiked: false
          };
        }
        // If disliked, switch to like
        if (report.userDisliked) {
          return {
            ...report,
            likes: report.likes + 1,
            dislikes: report.dislikes - 1,
            userLiked: true,
            userDisliked: false
          };
        }
        // If neither, add like
        return {
          ...report,
          likes: report.likes + 1,
          userLiked: true
        };
      }
      return report;
    }));
  };

  const handleDislike = (id: number) => {
    setReports(reports.map(report => {
      if (report.id === id) {
        // If already disliked, remove dislike
        if (report.userDisliked) {
          return {
            ...report,
            dislikes: report.dislikes - 1,
            userDisliked: false
          };
        }
        // If liked, switch to dislike
        if (report.userLiked) {
          return {
            ...report,
            dislikes: report.dislikes + 1,
            likes: report.likes - 1,
            userLiked: false,
            userDisliked: true
          };
        }
        // If neither, add dislike
        return {
          ...report,
          dislikes: report.dislikes + 1,
          userDisliked: true
        };
      }
      return report;
    }));
  };

  return (
    <>
      <LayoutNavbar>
        <div className="min-h-screen pt-20 p-8 bg-white max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {/* Peta */}
            <div className="border rounded-xl overflow-hidden h-[500px]">
              <MapContainer 
                center={[-7.801194, 110.364917]} 
                zoom={13} 
                style={{ height: '100%', width: '100%' }}
                className="z-0"
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                <Marker position={[-7.801194, 110.364917]}>
                  <Popup>Lokasi Laporan</Popup>
                </Marker>
              </MapContainer>
            </div>

            {/* Form Laporan */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-[#053040]">Laporkan Bahaya !</h2>
                <p className="text-[#5c7893]">Bagikan kondisi laut yang berbahaya kepada komunitas.</p>
              </div>

              {/* Lokasi */}
              <div>
                <label className="font-semibold text-[#053040]">Lokasi</label>
                <input
                  type="text"
                  value={lokasi}
                  onChange={(e) => setLokasi(e.target.value)}
                  placeholder="Contoh: Manyeuw"
                  className="w-full mt-2 px-4 py-3 bg-[#eaf9fd] text-[#053040] rounded-xl border border-[#2C5B6B]/30 focus:outline-none focus:ring-2 focus:ring-[#2C5B6B]/50"
                  required
                />
              </div>

              {/* Jenis Bahaya */}
              <div>
                <label className="font-semibold text-[#053040]">Jenis Bahaya</label>
                <select
                  value={jenisBahaya}
                  onChange={(e) => setJenisBahaya(e.target.value)}
                  className="w-full mt-2 px-4 py-3 bg-[#eaf9fd] text-[#053040] rounded-xl border border-[#2C5B6B]/30 focus:outline-none focus:ring-2 focus:ring-[#2C5B6B]/50"
                  required
                >
                  <option value="">Pilih Jenis Bahaya</option>
                  {dangerTypes.map((jenis, i) => (
                    <option key={i} value={jenis}>{jenis}</option>
                  ))}
                </select>
              </div>

              {/* Deskripsi Bahaya */}
              <div>
                <label className="font-semibold text-[#053040]">Deskripsi Bahaya</label>
                <textarea
                  value={deskripsi}
                  onChange={(e) => setDeskripsi(e.target.value)}
                  placeholder="Jelaskan bahaya secara rinci"
                  className="w-full mt-2 px-4 py-3 bg-[#eaf9fd] text-[#053040] rounded-xl h-32 border border-[#2C5B6B]/30 focus:outline-none focus:ring-2 focus:ring-[#2C5B6B]/50 resize-none"
                  required
                />
              </div>

              <button
                type="submit"
                className="bg-[#053040] text-white px-8 py-3 rounded-xl hover:bg-[#2C5B6B] transition-colors shadow-md font-medium"
              >
                Kirim Laporan
              </button>
            </form>
          </div>

          {/* Filter Jenis Bahaya */}
          <div className="mt-12">
            <h3 className="text-lg font-bold text-[#053040] mb-4">Filter Jenis Bahaya</h3>
            <div className="flex flex-wrap gap-2">
              <button 
                onClick={() => setActiveFilter('Semua')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  activeFilter === 'Semua' 
                    ? 'bg-[#053040] text-white' 
                    : 'bg-white text-[#053040] border border-[#2C5B6B]/30 hover:bg-[#eaf9fd]'
                }`}
              >
                Semua
              </button>
              {dangerTypes.map((jenis, i) => (
                <button 
                  key={i}
                  onClick={() => setActiveFilter(jenis)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    activeFilter === jenis 
                      ? 'bg-[#053040] text-white' 
                      : 'bg-white text-[#053040] border border-[#2C5B6B]/30 hover:bg-[#eaf9fd]'
                  }`}
                >
                  {jenis}
                </button>
              ))}
            </div>
          </div>

          {/* Komentar */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            {reports.map((report) => (
              <div key={report.id} className="bg-white p-5 rounded-xl border border-[#eaf9fd] shadow-sm hover:shadow-md transition">
                <div className="flex items-center gap-3 mb-3">
                  <div className="bg-[#053040] text-white w-10 h-10 rounded-full flex items-center justify-center font-semibold">
                    {report.username.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-[#053040]">{report.username}</p>
                    <p className="text-xs text-[#5c7893]">{report.time}</p>
                  </div>
                </div>
                <p className="text-[#053040] mb-4">{report.content}</p>
                <div className="flex gap-4 text-sm text-[#5c7893]">
                  <button 
                    onClick={() => handleLike(report.id)}
                    className={`flex items-center gap-1 ${report.userLiked ? 'text-[#053040]' : ''}`}
                  >
                    <ThumbsUp size={16} />
                    <span>{report.likes}</span>
                  </button>
                  <button 
                    onClick={() => handleDislike(report.id)}
                    className={`flex items-center gap-1 ${report.userDisliked ? 'text-[#053040]' : ''}`}
                  >
                    <ThumbsDown size={16} />
                    <span>{report.dislikes}</span>
                  </button>
                  <button className="flex items-center gap-1">
                    <MessageCircle size={16} />
                    <span>{report.comments}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </LayoutNavbar>
      <Footer />
    </>
  );
}