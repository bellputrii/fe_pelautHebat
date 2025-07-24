"use client";

import LayoutNavbar from "@/components/LayoutNavbar";
import Footer from "@/components/Footer";
import { useState } from "react";
import Image from "next/image";

const tutorialList = [
  {
    id: 1,
    title: "Tutorial Menggunakan Jaket Pelampung",
    description: "Ensure engine is running smoothly and all systems are operational.",
    image: "/images/jaket.png",
    videoUrl: "https://www.youtube.com/embed/ZzDP8VqH9AY",
    detail:
      "Perangkat keselamatan yang satu ini sering kita jumpai, yuk kita kenali dan persiapkan perangkat ini ketika kita berada di sarana-prasarana dan area dimana ada bahaya tenggelam disana.",
  },
  {
    id: 2,
    title: "Tutorial Menggunakan Peluit Darurat",
    description: "Ensure engine is running smoothly and all systems are operational.",
    image: "/images/peluit.png",
    videoUrl: "https://www.youtube.com/embed/VIDEO_ID_PELUIT",
    detail: "Peluit darurat digunakan untuk menarik perhatian ketika terjadi keadaan bahaya di laut.",
  },
  {
    id: 3,
    title: "Isi P3K",
    description: "Ensure engine is running smoothly and all systems are operational.",
    image: "/images/p3k.png",
    videoUrl: "https://www.youtube.com/embed/VIDEO_ID_P3K",
    detail: "Kotak P3K penting sebagai tindakan pertolongan pertama jika terjadi kecelakaan ringan.",
  },
  {
    id: 4,
    title: "Tutorial Menggunakan Senter",
    description: "Ensure engine is running smoothly and all systems are operational.",
    image: "/images/senter.png",
    videoUrl: "https://www.youtube.com/embed/VIDEO_ID_SENTER",
    detail: "Senter atau lampu kepala dibutuhkan dalam kondisi gelap atau ketika mencari bantuan.",
  },
];

export default function RangkumanPanduanPage() {
  const [selected, setSelected] = useState<null | typeof tutorialList[0]>(null);

  return (
    <>
      <LayoutNavbar>
        <main className="bg-[#f2f9fa] min-h-screen py-12 px-4">
          <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-8">
            {/* Kiri: List */}
            <div className="flex-1 space-y-6">
              <h1 className="text-2xl font-bold text-[#053040]">
                Selamat! Anda Telah Menyelesaikan Semua Persiapan.
              </h1>
              <p className="text-gray-700 mb-4">
                Berikut adalah rangkuman panduan penting yang perlu Anda ingat
              </p>

              {tutorialList.map((item) => (
                <div
                  key={item.id}
                  className={`flex items-center gap-4 p-4 rounded-lg ${
                    selected?.id === item.id ? "bg-[#cfe4e6]" : "bg-[#dcebea]"
                  }`}
                >
                  <Image
                    src={item.image}
                    alt={item.title}
                    width={80}
                    height={80}
                    className="rounded"
                  />
                  <div className="flex-1">
                    <p className="font-semibold">{item.title}</p>
                    <p className="text-sm text-gray-600">{item.description}</p>
                  </div>
                  <button
                    className="bg-[#3f5f6f] text-white px-4 py-1 rounded hover:opacity-90"
                    onClick={() => setSelected(item)}
                  >
                    Putar
                  </button>
                </div>
              ))}
            </div>

            {/* Kanan: Hanya tampil jika ada video dipilih */}
            {selected && (
              <div className="flex-1 space-y-4 animate-fade-in">
                <div className="aspect-video w-full rounded overflow-hidden">
                  <iframe
                    src={selected.videoUrl}
                    title={selected.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full rounded"
                  ></iframe>
                </div>
                <div>
                  <h2 className="font-bold text-lg">{selected.title}</h2>
                  <p className="text-gray-700 text-sm mt-2">{selected.detail}</p>
                </div>

                <button
                  onClick={() => setSelected(null)}
                  className="mt-6 bg-[#053040] text-white px-6 py-2 rounded hover:bg-[#07475f]"
                >
                  Kembali
                </button>
              </div>
            )}
          </div>
        </main>
      </LayoutNavbar>
      <Footer />
    </>
  );
}
