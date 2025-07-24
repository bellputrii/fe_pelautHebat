"use client";

import { useState } from "react";
import LayoutNavbar from '@/components/LayoutNavbar';
import Footer from '@/components/Footer';

export default function CuacaPage() {
  const [latitude, setLatitude] = useState("-6.8");
  const [longitude, setLongitude] = useState("107.8");

  // Dummy data (bisa diganti dengan API)
  const kondisi = {
    angin: "12 knots",
    gelombang: "0.5 m",
    suhu: "17.2 ℃",
    tekanan: "1013 hPa",
  };

  const detailPrakiraan = [
    { waktu: "12:00 PM", angin: "15 knots", gelombang: "0.7 m", arah: "121°", suhu: "22℃", tekanan: "1012.3 hPa" },
    { waktu: "3:00 PM", angin: "18 knots", gelombang: "1.0 m", arah: "78°", suhu: "23℃", tekanan: "1011.6 hPa" },
    { waktu: "6:00 PM", angin: "16 knots", gelombang: "0.8 m", arah: "92°", suhu: "17℃", tekanan: "1013.3 hPa" },
    { waktu: "9:00 PM", angin: "10 knots", gelombang: "0.5 m", arah: "104°", suhu: "18.5℃", tekanan: "1010.8 hPa" },
  ];

  return (
    <>
      <LayoutNavbar>
        <div className="max-w-6xl mx-auto px-6 py-20">
          <h1 className="text-4xl font-bold text-[#053040] mb-6">Prakiraan Cuaca</h1>

          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">Kondisi Saat Ini</h2>
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex gap-2 items-center">
                <label htmlFor="latitude" className="text-gray-700 font-medium">Latitude:</label>
                <input
                  id="latitude"
                  type="text"
                  value={latitude}
                  onChange={(e) => setLatitude(e.target.value)}
                  className="border rounded px-2 py-1 w-28"
                />
              </div>
              <div className="flex gap-2 items-center">
                <label htmlFor="longitude" className="text-gray-700 font-medium">Longitude:</label>
                <input
                  id="longitude"
                  type="text"
                  value={longitude}
                  onChange={(e) => setLongitude(e.target.value)}
                  className="border rounded px-2 py-1 w-28"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
            {[
              { label: "Kecepatan Angin", value: kondisi.angin },
              { label: "Tinggi Gelombang", value: kondisi.gelombang },
              { label: "Suhu", value: kondisi.suhu },
              { label: "Tekanan Atmosfer", value: kondisi.tekanan },
            ].map((item, index) => (
              <div
                key={index}
                className="border rounded-lg px-4 py-6 text-center bg-white shadow-sm"
              >
                <p className="text-sm text-gray-500">{item.label}</p>
                <p className="text-xl font-semibold">{item.value}</p>
              </div>
            ))}
          </div>

          <h2 className="text-lg font-semibold mb-2">Detail Prakiraan</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse rounded-md overflow-hidden">
              <thead>
                <tr className="bg-gray-100 text-sm text-gray-600">
                  <th className="p-3">Waktu</th>
                  <th className="p-3">Kecepatan Angin</th>
                  <th className="p-3">Tinggi Gelombang</th>
                  <th className="p-3">Arah Angin</th>
                  <th className="p-3">Suhu</th>
                  <th className="p-3">Tekanan Atmosfer</th>
                </tr>
              </thead>
              <tbody>
                {detailPrakiraan.map((data, idx) => (
                  <tr key={idx} className="even:bg-gray-50 text-sm">
                    <td className="p-3">{data.waktu}</td>
                    <td className="p-3 text-blue-700 font-medium">{data.angin}</td>
                    <td className="p-3">{data.gelombang}</td>
                    <td className="p-3">{data.arah}</td>
                    <td className="p-3">{data.suhu}</td>
                    <td className="p-3">{data.tekanan}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </LayoutNavbar>
      <Footer />
    </>
  );
}