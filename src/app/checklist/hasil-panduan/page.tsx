// app/persiapan/page.tsx

"use client";

import LayoutNavbar from "@/components/LayoutNavbar";
import Footer from "@/components/Footer";
import Image from "next/image";
import { Info } from "lucide-react";

const dataChecklist = [
  {
    id: 1,
    nama: "Jaket Pelampung",
    deskripsi: "Ensure engine is running smoothly and all systems are operational.",
    image: "/images/jaket.png", // Sesuaikan path gambar
  },
  {
    id: 2,
    nama: "Peluit Darurat",
    deskripsi: "Ensure engine is running smoothly and all systems are operational.",
    image: "/images/peluit.png",
  },
  {
    id: 3,
    nama: "Kotak P3K",
    deskripsi: "Ensure engine is running smoothly and all systems are operational.",
    image: "/images/p3k.png",
  },
  {
    id: 4,
    nama: "Senter atau Lampu Kepala",
    deskripsi: "Ensure engine is running smoothly and all systems are operational.",
    image: "/images/senter.png",
  },
];

export default function PersiapanPage() {
  return (
    <>
      <LayoutNavbar>
        <main className="min-h-screen bg-[#f2f9fa] px-4 py-16">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <h1 className="text-2xl md:text-3xl font-bold text-[#053040] mb-2">
              Persiapan Aman Untukmu
            </h1>
            <p className="text-gray-600 mb-8">
              Untuk Perjalanan 1 KM ke Pulau Adranan dengan Perahu Motor Kecil, sekitar 1 Jam
            </p>

            {/* Checklist Section */}
            <h2 className="text-[#053040] font-semibold mb-4 uppercase tracking-wide">
              Perlengkapan Keselamatan Diri
            </h2>

            <div className="space-y-4">
              {dataChecklist.map((item) => (
                <div
                  key={item.id}
                  className="bg-[#dcebea] rounded-lg flex items-center p-4 gap-4"
                >
                  <Image
                    src={item.image}
                    alt={item.nama}
                    width={100}
                    height={100}
                    className="rounded object-cover"
                  />
                  <div className="flex-1">
                    <p className="font-bold">{item.nama}</p>
                    <p className="text-sm text-gray-600">{item.deskripsi}</p>
                  </div>
                  <button className="bg-[#3f5f6f] text-white px-4 py-1 rounded hover:opacity-90 flex items-center gap-1">
                    Checklist
                    {item.nama === "Peluit Darurat" && (
                      <Info className="w-4 h-4 ml-1" />
                    )}
                  </button>
                </div>
              ))}
            </div>

            {/* Tombol Navigasi dan Rangkuman */}
            <div className="flex justify-end items-center gap-4 mt-10">
              <div className="flex gap-2">
                <div className="w-6 h-6 bg-[#8aaab3] rounded-md" />
                <div className="w-6 h-6 bg-[#8aaab3] rounded-md" />
              </div>
              <button className="bg-[#053040] text-white px-5 py-2 rounded hover:bg-[#07475f]">
                Rangkuman Panduan
              </button>
            </div>
          </div>
        </main>
      </LayoutNavbar>
      <Footer />
    </>
  );
}
