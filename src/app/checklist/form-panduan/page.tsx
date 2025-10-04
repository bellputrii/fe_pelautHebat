"use client";

import { useState } from "react";
import LayoutNavbar from '@/components/LayoutNavbar'
import Footer from '@/components/Footer'
import { useRouter } from 'next/navigation'
import { auth } from "@/firebase/config";
import { useTokenRefresh } from '@/app/hooks/useAuth'
import { authFetch } from '@/app/lib/api'
import { Waves, AlertTriangle, Loader2, ChevronRight, Info, Clock, Users, Navigation, MapPin, Calendar, Cloud, Gauge, Route } from 'lucide-react'

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

  // Handle input untuk number fields tanpa spinner
  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    // Hanya menerima angka dan titik desimal
    const numericValue = value.replace(/[^\d.]/g, '');
    setForm((prev) => ({ ...prev, [name]: numericValue }));
    setError(null);
  };

  // Set default values for empty fields
  const setDefaultValues = () => {
    const defaults = {
      durasi: form.durasi || "120",
      penumpang: form.penumpang || "2",
      jarak: form.jarak || "5"
    };
    
    setForm(prev => ({
      ...prev,
      ...defaults
    }));
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
      duration_minutes: parseInt(formData.durasi) || 120,
      passenger_count: parseInt(formData.penumpang) || 2,
      boat_type: boatTypeMap[formData.jenisPerahu] || formData.jenisPerahu,
      departure_location: formData.lokasiKeberangkatan,
      destination_location: formData.lokasiTujuan,
      planned_departure_time: new Date(formData.waktuKeberangkatan).toISOString(),
      weather_condition: formData.kondisiCuaca,
      urgency_level: formData.tingkatUrgensi,
      distance_km: parseFloat(formData.jarak) || 5
    };
  };

  const validateForm = (formData: FormData) => {
    const errors: string[] = [];

    if (!formData.tujuan) errors.push("Tujuan perjalanan harus dipilih");
    if (!formData.jenisPerahu) errors.push("Jenis perahu harus dipilih");
    if (!formData.lokasiKeberangkatan) errors.push("Lokasi keberangkatan harus diisi");
    if (!formData.lokasiTujuan) errors.push("Lokasi tujuan harus diisi");
    if (!formData.waktuKeberangkatan) errors.push("Waktu keberangkatan harus diisi");
    if (!formData.kondisiCuaca) errors.push("Kondisi cuaca harus dipilih");

    // Set default values if empty
    if (!formData.durasi) {
      setForm(prev => ({ ...prev, durasi: "120" }));
    }
    if (!formData.penumpang) {
      setForm(prev => ({ ...prev, penumpang: "2" }));
    }
    if (!formData.jarak) {
      setForm(prev => ({ ...prev, jarak: "5" }));
    }

    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // Set default values before validation
    setDefaultValues();

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

  // Tooltip component
  const Tooltip = ({ text }: { text: string }) => (
    <div className="group relative inline-flex items-center">
      <Info className="w-4 h-4 text-gray-400 ml-1 cursor-help" />
      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10">
        {text}
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
      </div>
    </div>
  );

  return (
    <>
      <LayoutNavbar>
        <main className="min-h-screen pt-20 p-4 md:p-8 bg-white max-w-7xl mx-auto">
          <div className="container mx-auto px-2 md:px-4 py-8 md:py-12 max-w-3xl">
            {/* Header Section */}
            <div className="text-center mb-8 md:mb-10">
              <div className="inline-flex items-center justify-center bg-blue-100 p-3 rounded-full mb-4">
                <Waves className="w-6 h-6 text-blue-600" />
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-blue-900 mb-3">
                Persiapan Berlayar
              </h1>
              <p className="text-gray-600 max-w-lg mx-auto text-sm md:text-base">
                Isi informasi perjalanan Anda untuk mendapatkan panduan keselamatan yang disesuaikan
              </p>
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-medium text-blue-900 text-sm mb-1">
                    Informasi Penting
                  </h3>
                  <p className="text-blue-700 text-xs">
                    Beberapa field akan diisi otomatis dengan nilai default jika dikosongkan. Pastikan untuk memeriksa semua informasi sebelum melanjutkan.
                  </p>
                </div>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg mb-6 md:mb-8 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-medium text-red-800">Perhatian</h3>
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            )}

            {/* Form Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <form onSubmit={handleSubmit} className="p-4 md:p-6 space-y-6">
                {/* Grid Layout for Form Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  {/* Tujuan */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 flex items-center gap-1">
                      <Navigation className="w-4 h-4" />
                      Tujuan Perjalanan
                    </label>
                    <select
                      name="tujuan"
                      value={form.tujuan}
                      onChange={handleChange}
                      className="w-full px-3 md:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                      required
                    >
                      <option value="">Pilih tujuan perjalanan</option>
                      <option value="memancing">Memancing</option>
                      <option value="pengiriman">Pengiriman Barang</option>
                      <option value="wisata">Wisata & Rekreasi</option>
                      <option value="darurat">Situasi Darurat</option>
                    </select>
                    <p className="text-xs text-gray-500">
                      Pilih tujuan utama perjalanan Anda
                    </p>
                  </div>

                  {/* Jenis Perahu */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 flex items-center gap-1">
                      <Waves className="w-4 h-4" />
                      Jenis Perahu
                    </label>
                    <select
                      name="jenisPerahu"
                      value={form.jenisPerahu}
                      onChange={handleChange}
                      className="w-full px-3 md:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                      required
                    >
                      <option value="">Pilih jenis perahu</option>
                      <option value="perahu_motor">Perahu Motor Kecil</option>
                      <option value="kapal_layar">Kapal Layar / Nelayan</option>
                      <option value="sampan">Sampan / Perahu Dayung</option>
                      <option value="kapal_besar">Kapal Besar</option>
                    </select>
                    <p className="text-xs text-gray-500">
                      Pilih jenis kendaraan air yang akan digunakan
                    </p>
                  </div>

                  {/* Durasi */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      Durasi Perjalanan
                      <Tooltip text="Durasi perkiraan dari keberangkatan sampai kembali" />
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        name="durasi"
                        value={form.durasi}
                        onChange={handleNumberChange}
                        className="w-full px-3 md:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        placeholder="120"
                        min="30"
                        max="1440"
                      />
                      <span className="absolute right-3 top-2.5 text-gray-400 text-sm">menit</span>
                    </div>
                    <p className="text-xs text-gray-500">
                      Default: 120 menit (2 jam) jika dikosongkan
                    </p>
                  </div>

                  {/* Penumpang */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      Jumlah Penumpang
                      <Tooltip text="Termasuk diri Anda dan seluruh awak kapal" />
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      name="penumpang"
                      value={form.penumpang}
                      onChange={handleNumberChange}
                      className="w-full px-3 md:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      placeholder="2"
                      min="1"
                      max="100"
                    />
                    <p className="text-xs text-gray-500">
                      Default: 2 penumpang jika dikosongkan
                    </p>
                  </div>

                  {/* Lokasi Keberangkatan */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      Lokasi Keberangkatan
                    </label>
                    <input
                      type="text"
                      name="lokasiKeberangkatan"
                      value={form.lokasiKeberangkatan}
                      onChange={handleChange}
                      className="w-full px-3 md:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                      placeholder="Contoh: Pelabuhan Muara Angke, Jakarta"
                      required
                    />
                    <p className="text-xs text-gray-500">
                      Tuliskan pelabuhan atau titik keberangkatan
                    </p>
                  </div>

                  {/* Lokasi Tujuan */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      Lokasi Tujuan
                    </label>
                    <input
                      type="text"
                      name="lokasiTujuan"
                      value={form.lokasiTujuan}
                      onChange={handleChange}
                      className="w-full px-3 md:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                      placeholder="Contoh: Pulau Seribu, Kepulauan Seribu"
                      required
                    />
                    <p className="text-xs text-gray-500">
                      Tuliskan pulau atau destinasi tujuan
                    </p>
                  </div>

                  {/* Waktu Keberangkatan */}
                  <div className="space-y-2 md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      Waktu Keberangkatan
                      <Tooltip text="Perkiraan waktu ketika Anda berencana berangkat" />
                    </label>
                    <input
                      type="datetime-local"
                      name="waktuKeberangkatan"
                      value={form.waktuKeberangkatan}
                      onChange={handleChange}
                      className="w-full px-3 md:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                      required
                    />
                    <p className="text-xs text-gray-500">
                      Pilih tanggal dan waktu rencana keberangkatan
                    </p>
                  </div>

                  {/* Kondisi Cuaca */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 flex items-center gap-1">
                      <Cloud className="w-4 h-4" />
                      Kondisi Cuaca
                      <Tooltip text="Perkiraan kondisi cuaca saat keberangkatan" />
                    </label>
                    <select
                      name="kondisiCuaca"
                      value={form.kondisiCuaca}
                      onChange={handleChange}
                      className="w-full px-3 md:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                      required
                    >
                      <option value="">Pilih kondisi cuaca</option>
                      <option value="calm">Tenang (gelombang kecil, angin lemah)</option>
                      <option value="moderate">Sedang (gelombang sedang, angin cukup)</option>
                      <option value="rough">Buruk (gelombang besar, angin kencang)</option>
                    </select>
                    <p className="text-xs text-gray-500">
                      Sesuaikan dengan prakiraan cuaca terbaru
                    </p>
                  </div>

                  {/* Tingkat Urgensi */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                      <Gauge className="w-4 h-4" />
                      Tingkat Urgensi
                      <Tooltip text="Tingkat kepentingan perjalanan ini" />
                    </label>
                    <select
                      name="tingkatUrgensi"
                      value={form.tingkatUrgensi}
                      onChange={handleChange}
                      className="w-full px-3 md:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                    >
                      <option value="normal">Normal (Perjalanan Biasa)</option>
                      <option value="urgent">Penting (Perlu Segera Sampai)</option>
                      <option value="critical">Kritis (Situasi Darurat)</option>
                    </select>
                    <p className="text-xs text-gray-500">
                      Pilih sesuai kebutuhan perjalanan
                    </p>
                  </div>

                  {/* Jarak */}
                  <div className="space-y-2 md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 flex items-center gap-1">
                      <Route className="w-4 h-4" />
                      Jarak Tempuh
                      <Tooltip text="Perkiraan jarak tempuh melalui laut dalam kilometer" />
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        inputMode="decimal"
                        pattern="[0-9.]*"
                        name="jarak"
                        value={form.jarak}
                        onChange={handleNumberChange}
                        className="w-full px-3 md:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        placeholder="5.0"
                        step="0.1"
                        min="0.1"
                        max="1000"
                      />
                      <span className="absolute right-3 top-2.5 text-gray-400 text-sm">kilometer</span>
                    </div>
                    <p className="text-xs text-gray-500">
                      Default: 5 km jika dikosongkan. Contoh: 15.5 untuk 15 setengah kilometer
                    </p>
                  </div>
                </div>

                {/* Notes Section */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Info className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-medium text-yellow-900 text-sm mb-1">
                        Catatan Pengisian
                      </h3>
                      <ul className="text-yellow-700 text-xs space-y-1">
                        <li>• Field dengan nilai default dapat dikosongkan</li>
                        <li>• Durasi, penumpang, dan jarak akan menggunakan nilai default jika tidak diisi</li>
                        <li>• Pastikan informasi cuaca sesuai dengan prakiraan terbaru</li>
                        <li>• Tingkat urgensi mempengaruhi rekomendasi keselamatan</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-[#053040] hover:bg-[#2C5B6B] text-white font-medium py-3 px-6 rounded-lg transition duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Memproses...
                      </>
                    ) : (
                      <>
                        Lanjutkan ke Panduan Keselamatan
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