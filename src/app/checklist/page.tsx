"use client";

import { useState } from "react";
import LayoutNavbar from '@/components/LayoutNavbar'
import Footer from '@/components/Footer'

export default function InformasiBerlayarPage() {
  const [form, setForm] = useState({
    tujuan: "",
    durasi: "",
    penumpang: "",
    jenisPerahu: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form Submitted:", form);
    // TODO: Kirim ke API
  };

  return (
    <>
      <LayoutNavbar>
        <main className="bg-[#dcebea] min-h-screen py-16 px-4 flex flex-col items-center">
          <h1 className="text-2xl md:text-3xl font-bold text-[#053040] mb-10 text-center">
            Masukkan Informasi Berlayar Anda
          </h1>

          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-xl shadow-md px-6 py-8 w-full max-w-xl space-y-6"
          >
            {/* Tujuan */}
            <div>
              <label className="font-semibold block mb-1">Apa Tujuan Perjalananmu?</label>
              <select
                name="tujuan"
                value={form.tujuan}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2"
                required
              >
                <option value="">Pilih tujuan</option>
                <option value="memancing">Memancing</option>
                <option value="pengiriman">Pengiriman Barang</option>
                <option value="wisata">Wisata</option>
              </select>
            </div>

            {/* Durasi */}
            <div>
              <label className="font-semibold block mb-1">
                Berapa Lama Anda Berlayar?
              </label>
              <p className="text-sm text-gray-500 mb-1">Diisi dengan satuan menit</p>
              <input
                type="number"
                name="durasi"
                value={form.durasi}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2"
                placeholder="60"
                required
              />
            </div>

            {/* Penumpang */}
            <div>
              <label className="font-semibold block mb-1">
                Ada Berapa Penumpang Di Kapal Anda?
              </label>
              <input
                type="number"
                name="penumpang"
                value={form.penumpang}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2"
                placeholder="60"
                required
              />
            </div>

            {/* Jenis Perahu */}
            <div>
              <label className="font-semibold block mb-1">
                Apa Jenis Perahu yang Anda Gunakan?
              </label>
              <select
                name="jenisPerahu"
                value={form.jenisPerahu}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2"
                required
              >
                <option value="">Pilih jenis perahu</option>
                <option value="perahu_motor">Perahu Motor</option>
                <option value="kapal_layar">Kapal Layar</option>
                <option value="sampan">Sampan</option>
              </select>
            </div>

            {/* Submit */}
            <div className="pt-4 text-center">
              <button
                type="submit"
                className="bg-[#053040] text-white px-6 py-2 rounded hover:bg-[#07475f] transition"
              >
                Buat Persiapan
              </button>
            </div>
          </form>
        </main>
      </LayoutNavbar>
      <Footer />
    </>
  );
}
