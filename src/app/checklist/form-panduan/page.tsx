"use client";

import { useState } from "react";
import LayoutNavbar from '@/components/LayoutNavbar'
import Footer from '@/components/Footer'
import { useRouter } from 'next/navigation'
import { auth } from "@/firebase/config";
import { useTokenRefresh } from '@/app/hooks/useAuth'
import { authFetch } from '@/app/lib/api'
import { Waves, AlertTriangle, Loader2, ChevronRight } from 'lucide-react'

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

  // Initialize token refresh mechanism
  useTokenRefresh();

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

      const apiData = mapFormToAPI(form);

      // Step 1: Start the session
      const sessionResponse = await authFetch(
        `${process.env.NEXT_PUBLIC_API_URL}/guide/session/start`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(apiData)
        }
      );

      const sessionResult = await sessionResponse.json();

      if (!sessionResponse.ok) {
        throw new Error(sessionResult.error || "Gagal memulai sesi panduan");
      }

      const session: GuideSession = sessionResult.data;

      // Step 2: Generate the checklist
      const checklistResponse = await authFetch(
        `${process.env.NEXT_PUBLIC_API_URL}/guide/session/${session.id}/checklist`,
        {
          method: "POST"
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
        <main className="min-h-screen pt-20 p-8 bg-white max-w-7xl mx-auto">
          <div className="container mx-auto px-4 py-12 max-w-3xl">
            {/* Header Section */}
            <div className="text-center mb-10">
              <div className="inline-flex items-center justify-center bg-blue-100 p-3 rounded-full mb-4">
                <Waves className="w-6 h-6 text-blue-600" />
              </div>
              <h1 className="text-3xl font-bold text-blue-900 mb-3">
                Persiapan Berlayar
              </h1>
              <p className="text-gray-600 max-w-lg mx-auto">
                Isi informasi perjalanan Anda untuk mendapatkan panduan keselamatan yang disesuaikan
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg mb-8 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-medium text-red-800">Perhatian</h3>
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            )}

            {/* Form Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {/* Grid Layout for Form Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Tujuan */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Tujuan Perjalanan
                    </label>
                    <select
                      name="tujuan"
                      value={form.tujuan}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      <option value="">Pilih tujuan</option>
                      <option value="memancing">Memancing</option>
                      <option value="pengiriman">Pengiriman Barang</option>
                      <option value="wisata">Wisata</option>
                      <option value="darurat">Situasi Darurat</option>
                    </select>
                  </div>

                  {/* Jenis Perahu */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Jenis Perahu
                    </label>
                    <select
                      name="jenisPerahu"
                      value={form.jenisPerahu}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      <option value="">Pilih jenis perahu</option>
                      <option value="perahu_motor">Perahu Motor Kecil</option>
                      <option value="kapal_layar">Kapal Layar/Nelayan</option>
                      <option value="sampan">Sampan</option>
                      <option value="kapal_besar">Kapal Besar</option>
                    </select>
                  </div>

                  {/* Durasi */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Durasi Perjalanan (menit)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        name="durasi"
                        value={form.durasi}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="60"
                        min="30"
                        max="1440"
                        required
                      />
                      <span className="absolute right-3 top-2.5 text-gray-400 text-sm">min</span>
                    </div>
                  </div>

                  {/* Penumpang */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Jumlah Penumpang
                    </label>
                    <input
                      type="number"
                      name="penumpang"
                      value={form.penumpang}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="2"
                      min="1"
                      max="100"
                      required
                    />
                  </div>

                  {/* Lokasi Keberangkatan */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Lokasi Keberangkatan
                    </label>
                    <input
                      type="text"
                      name="lokasiKeberangkatan"
                      value={form.lokasiKeberangkatan}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Pelabuhan Muara Angke"
                      required
                    />
                  </div>

                  {/* Lokasi Tujuan */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Lokasi Tujuan
                    </label>
                    <input
                      type="text"
                      name="lokasiTujuan"
                      value={form.lokasiTujuan}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Kepulauan Seribu"
                      required
                    />
                  </div>

                  {/* Waktu Keberangkatan */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Waktu Keberangkatan
                    </label>
                    <input
                      type="datetime-local"
                      name="waktuKeberangkatan"
                      value={form.waktuKeberangkatan}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>

                  {/* Kondisi Cuaca */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Kondisi Cuaca
                    </label>
                    <select
                      name="kondisiCuaca"
                      value={form.kondisiCuaca}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      <option value="">Pilih kondisi cuaca</option>
                      <option value="calm">Tenang (gelombang kecil)</option>
                      <option value="moderate">Sedang (gelombang sedang)</option>
                      <option value="rough">Buruk (gelombang besar)</option>
                    </select>
                  </div>

                  {/* Tingkat Urgensi */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Tingkat Urgensi
                    </label>
                    <select
                      name="tingkatUrgensi"
                      value={form.tingkatUrgensi}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="normal">Normal</option>
                      <option value="urgent">Penting</option>
                      <option value="critical">Kritis</option>
                    </select>
                  </div>

                  {/* Jarak */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Jarak Tempuh (km)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        name="jarak"
                        value={form.jarak}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="15.5"
                        step="0.1"
                        min="0.1"
                        max="1000"
                        required
                      />
                      <span className="absolute right-3 top-2.5 text-gray-400 text-sm">km</span>
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-[#053040] hover:bg-[#2C5B6B]  text-white font-medium py-3 px-6 rounded-lg transition duration-200 flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Memproses...
                      </>
                    ) : (
                      <>
                        Lanjutkan
                        <ChevronRight className="w-5 h-5" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </main>
      </LayoutNavbar>
      <Footer />
    </>
  );
}