"use client";

import { useState } from "react";
import LayoutNavbar from '@/components/LayoutNavbar'
import Footer from '@/components/Footer'
import { useRouter } from 'next/navigation'
import { auth } from "@/firebase/config";

type FormData = {
  tujuan: string;
  durasi: string;
  penumpang: string;
  jenisPerahu: string;
  lokasiKeberangkatan: string;
  lokasiTujuan: string;
  waktuKeberangkatan: string;
  kondisiCuaca: string;
  tingkatUrgensi: string;
  jarak: string;
};

type GuideSession = {
  id: string;
  user_id: string;
  trip_info: {
    trip_purpose: string;
    duration_minutes: number;
    passenger_count: number;
    boat_type: string;
    departure_location: string;
    destination_location: string;
    planned_departure_time: string;
    weather_condition: string;
    urgency_level: string;
    distance_km: number;
  };
  status: string;
};

export default function InformasiBerlayarPage() {
  const router = useRouter();
  const [form, setForm] = useState<FormData>({
    tujuan: "",
    durasi: "",
    penumpang: "",
    jenisPerahu: "",
    lokasiKeberangkatan: "",
    lokasiTujuan: "",
    waktuKeberangkatan: "",
    kondisiCuaca: "",
    tingkatUrgensi: "normal",
    jarak: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setError(null);
  };

  const mapFormToAPI = (formData: FormData) => {
    const tripPurposeMap: Record<string, string> = {
      "memancing": "fishing",
      "pengiriman": "transport",
      "wisata": "recreation",
      "darurat": "emergency"
    };

    const boatTypeMap: Record<string, string> = {
      "perahu_motor": "perahu_kecil",
      "kapal_layar": "kapal_nelayan",
      "sampan": "perahu_kecil",
      "kapal_besar": "kapal_besar"
    };

    return {
      trip_purpose: tripPurposeMap[formData.tujuan] || formData.tujuan,
      duration_minutes: parseInt(formData.durasi) || 0,
      passenger_count: parseInt(formData.penumpang) || 0,
      boat_type: boatTypeMap[formData.jenisPerahu] || formData.jenisPerahu,
      departure_location: formData.lokasiKeberangkatan,
      destination_location: formData.lokasiTujuan,
      planned_departure_time: new Date(formData.waktuKeberangkatan).toISOString(),
      weather_condition: formData.kondisiCuaca,
      urgency_level: formData.tingkatUrgensi,
      distance_km: parseFloat(formData.jarak) || 0
    };
  };

  const validateForm = (formData: FormData) => {
    const errors: string[] = [];

    if (!formData.tujuan) errors.push("Tujuan perjalanan harus dipilih");
    if (!formData.durasi || parseInt(formData.durasi) < 30) errors.push("Durasi minimal 30 menit");
    if (!formData.penumpang || parseInt(formData.penumpang) < 1) errors.push("Jumlah penumpang minimal 1");
    if (!formData.jenisPerahu) errors.push("Jenis perahu harus dipilih");
    if (!formData.lokasiKeberangkatan) errors.push("Lokasi keberangkatan harus diisi");
    if (!formData.lokasiTujuan) errors.push("Lokasi tujuan harus diisi");
    if (!formData.waktuKeberangkatan) errors.push("Waktu keberangkatan harus diisi");
    if (!formData.kondisiCuaca) errors.push("Kondisi cuaca harus dipilih");
    if (!formData.jarak || parseFloat(formData.jarak) < 0.1) errors.push("Jarak minimal 0.1 km");

    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const validationErrors = validateForm(form);
    if (validationErrors.length > 0) {
      setError(validationErrors.join(", "));
      setIsLoading(false);
      return;
    }

    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        setError("Anda perlu login terlebih dahulu.");
        setIsLoading(false);
        return;
      }

      const idToken = await currentUser.getIdToken();
      const apiData = mapFormToAPI(form);

      const myHeaders = new Headers();
      myHeaders.append("Content-Type", "application/json");
      myHeaders.append("Authorization", `Bearer ${idToken}`);

      const raw = JSON.stringify(apiData);

      // Step 1: Start the session
      const sessionResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/guide/session/start`,
        {
          method: "POST",
          headers: myHeaders,
          body: raw,
          redirect: "follow"
        }
      );

      const sessionResult = await sessionResponse.json();

      if (!sessionResponse.ok) {
        throw new Error(sessionResult.error || "Gagal memulai sesi panduan");
      }

      const session: GuideSession = sessionResult.data;

      // Step 2: Generate the checklist
      const checklistHeaders = new Headers();
      checklistHeaders.append("Authorization", `Bearer ${idToken}`);

      const checklistResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/guide/session/${session.id}/checklist`,
        {
          method: "POST",
          headers: checklistHeaders,
          redirect: "follow"
        }
      );

      const checklistResult = await checklistResponse.json();

      if (!checklistResponse.ok) {
        throw new Error(checklistResult.error || "Gagal membuat checklist");
      }

      // Redirect to checklist page with session ID
      router.push(`/checklist/hasil-panduan?sessionId=${session.id}`);
      
    } catch (err) {
      console.error("Error in form submission:", err);
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <LayoutNavbar>
        <main className="bg-[#dcebea] min-h-screen py-16 px-4 flex flex-col items-center">
          <h1 className="text-2xl md:text-3xl font-bold text-[#053040] mb-10 text-center">
            Masukkan Informasi Berlayar Anda
          </h1>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6 w-full max-w-xl">
              {error}
            </div>
          )}

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
                <option value="darurat">Situasi Darurat</option>
              </select>
            </div>

            {/* Durasi */}
            <div>
              <label className="font-semibold block mb-1">
                Berapa Lama Anda Berlayar? (pulang-pergi)
              </label>
              <p className="text-sm text-gray-500 mb-1">Diisi dengan satuan menit (minimal 30 menit)</p>
              <input
                type="number"
                name="durasi"
                value={form.durasi}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2"
                placeholder="60"
                min="30"
                max="1440"
                required
              />
            </div>

            {/* Penumpang */}
            <div>
              <label className="font-semibold block mb-1">
                Ada Berapa Penumpang Di Kapal Anda?
              </label>
              <p className="text-sm text-gray-500 mb-1">Termasuk operator kapal</p>
              <input
                type="number"
                name="penumpang"
                value={form.penumpang}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2"
                placeholder="2"
                min="1"
                max="100"
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
                <option value="perahu_motor">Perahu Motor Kecil</option>
                <option value="kapal_layar">Kapal Layar/Nelayan</option>
                <option value="sampan">Sampan</option>
                <option value="kapal_besar">Kapal Besar</option>
              </select>
            </div>

            {/* Lokasi Keberangkatan */}
            <div>
              <label className="font-semibold block mb-1">
                Lokasi Keberangkatan
              </label>
              <input
                type="text"
                name="lokasiKeberangkatan"
                value={form.lokasiKeberangkatan}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2"
                placeholder="Pelabuhan Muara Angke"
                required
              />
            </div>

            {/* Lokasi Tujuan */}
            <div>
              <label className="font-semibold block mb-1">
                Lokasi Tujuan
              </label>
              <input
                type="text"
                name="lokasiTujuan"
                value={form.lokasiTujuan}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2"
                placeholder="Kepulauan Seribu"
                required
              />
            </div>

            {/* Waktu Keberangkatan */}
            <div>
              <label className="font-semibold block mb-1">
                Waktu Keberangkatan
              </label>
              <input
                type="datetime-local"
                name="waktuKeberangkatan"
                value={form.waktuKeberangkatan}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2"
                required
              />
            </div>

            {/* Kondisi Cuaca */}
            <div>
              <label className="font-semibold block mb-1">
                Kondisi Cuaca Saat Ini
              </label>
              <select
                name="kondisiCuaca"
                value={form.kondisiCuaca}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2"
                required
              >
                <option value="">Pilih kondisi cuaca</option>
                <option value="calm">Tenang (gelombang kecil)</option>
                <option value="moderate">Sedang (gelombang sedang)</option>
                <option value="rough">Buruk (gelombang besar)</option>
              </select>
            </div>

            {/* Tingkat Urgensi */}
            <div>
              <label className="font-semibold block mb-1">
                Tingkat Urgensi
              </label>
              <select
                name="tingkatUrgensi"
                value={form.tingkatUrgensi}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2"
              >
                <option value="normal">Normal</option>
                <option value="urgent">Penting</option>
                <option value="critical">Kritis</option>
              </select>
            </div>

            {/* Jarak */}
            <div>
              <label className="font-semibold block mb-1">
                Jarak Tempuh Perjalanan (km)
              </label>
              <p className="text-sm text-gray-500 mb-1">Total jarak pulang-pergi</p>
              <input
                type="number"
                name="jarak"
                value={form.jarak}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2"
                placeholder="15.5"
                step="0.1"
                min="0.1"
                max="1000"
                required
              />
            </div>

            {/* Submit */}
            <div className="pt-4 text-center">
              <button
                type="submit"
                className="bg-[#053040] text-white px-6 py-2 rounded hover:bg-[#07475f] transition disabled:opacity-50"
                disabled={isLoading}
              >
                {isLoading ? 'Memproses...' : 'Buat Persiapan'}
              </button>
            </div>
          </form>
        </main>
      </LayoutNavbar>
      <Footer />
    </>
  );
}