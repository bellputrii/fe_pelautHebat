"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signInWithPopup } from "firebase/auth";
import { auth, provider } from "@/firebase/config";

export default function SignUpPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });

  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");

    const fullName = `${form.firstName} ${form.lastName}`.trim();

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: fullName,
          email: form.email,
          password: form.password,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setStatus("success");
        setMessage("Registrasi berhasil! Mengarahkan ke halaman login...");
        setForm({ firstName: "", lastName: "", email: "", password: "" });

        setTimeout(() => {
          router.push("/auth/login");
        }, 1500);
      } else {
        setStatus("error");
        setMessage(result?.message || "Registrasi gagal.");
      }
    } catch (error) {
      setStatus("error");
      setMessage("Terjadi kesalahan saat menghubungi server.");
    } finally {
      setTimeout(() => setStatus("idle"), 4000);
    }
  };

  const handleGoogleSignUp = async () => {
    try {
      setStatus("loading");
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      const idToken = await user.getIdToken();

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/google-signin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem("token", data.token);
        setStatus("success");
        setMessage("Registrasi dengan Google berhasil!");
        setTimeout(() => router.push("/beranda"), 1000);
      } else {
        throw new Error(data?.message || "Registrasi dengan Google gagal.");
      }
    } catch (error: any) {
      setStatus("error");
      setMessage(error.message || "Terjadi kesalahan saat registrasi dengan Google.");
      setTimeout(() => setStatus("idle"), 4000);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col md:flex-row">
      {/* Left Side - Form Section */}
      <div className="w-full md:w-1/2 flex items-center justify-center px-6 py-12 md:px-12 lg:px-24 bg-white">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-10">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center">
                <img 
                  src="/logo.png" 
                  alt="Logo Pelaut Hebat" 
                  className="w-full h-full object-contain"
                />
              </div>
              <h1 className="text-3xl font-bold text-[#053040]">Pelaut Hebat</h1>
            </div>
            <h2 className="text-2xl font-semibold text-[#053040] mb-2">Buat Akun Baru</h2>
            <p className="text-gray-600">Bergabunglah dengan komunitas pelaut kami</p>
          </div>

          {/* Status Messages */}
          {status === "success" && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6 flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>{message}</span>
            </div>
          )}
          {status === "error" && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center gap-2">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <span>{message}</span>
            </div>
          )}

          {/* Registration Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-[#053040] mb-2">
                  Nama Depan
                </label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  placeholder="Nama depan"
                  value={form.firstName}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#053040] focus:border-[#053040] bg-white text-gray-900 placeholder-gray-500 transition-colors"
                  required
                />
              </div>

              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-[#053040] mb-2">
                  Nama Belakang
                </label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  placeholder="Nama belakang"
                  value={form.lastName}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#053040] focus:border-[#053040] bg-white text-gray-900 placeholder-gray-500 transition-colors"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-[#053040] mb-2">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                placeholder="Masukkan email Anda"
                value={form.email}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#053040] focus:border-[#053040] bg-white text-gray-900 placeholder-gray-500 transition-colors"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-[#053040] mb-2">
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                placeholder="Buat password yang kuat"
                value={form.password}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#053040] focus:border-[#053040] bg-white text-gray-900 placeholder-gray-500 transition-colors"
                required
                minLength={6}
              />
              <p className="text-xs text-gray-500 mt-1">Minimal 6 karakter</p>
            </div>

            <button
              type="submit"
              disabled={status === "loading"}
              className="w-full bg-[#053040] hover:bg-[#2C5B6B] text-white font-medium py-3 px-4 rounded-lg transition duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {status === "loading" ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Mendaftarkan...</span>
                </>
              ) : (
                <span>Daftar Sekarang</span>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="my-8 flex items-center">
            <div className="flex-1 border-t border-gray-300"></div>
            <span className="px-4 text-gray-500 text-sm">ATAU</span>
            <div className="flex-1 border-t border-gray-300"></div>
          </div>

          {/* Google Sign Up */}
          <button
            onClick={handleGoogleSignUp}
            disabled={status === "loading"}
            className="w-full flex items-center justify-center gap-3 border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 font-medium py-3 px-4 rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <span>Daftar dengan Google</span>
          </button>

          {/* Sign In Link */}
          <div className="text-center mt-8">
            <p className="text-gray-600">
              Sudah punya akun?{" "}
              <a 
                href="/auth/login" 
                className="font-semibold text-[#053040] hover:text-[#2C5B6B] transition-colors"
              >
                Masuk di sini
              </a>
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Image Section */}
      <div className="hidden md:block w-1/2 bg-gradient-to-br from-[#053040] to-[#2C5B6B] relative">
        <div className="absolute inset-0 flex items-center justify-center p-12">
          <div className="text-center text-white max-w-lg">
            <div className="w-20 h-20 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <img 
                src="/logo.png" 
                alt="Logo Pelaut Hebat" 
                className="w-12 h-12 object-contain"
              />
            </div>
            <h3 className="text-3xl font-bold mb-4">Bergabung dengan Komunitas</h3>
            <p className="text-white text-opacity-90 text-lg leading-relaxed">
              Daftar sekarang untuk menjadi bagian dari komunitas pelaut terpercaya. 
              Dapatkan akses ke informasi kondisi laut terkini, berbagi pengalaman, 
              dan jaga keselamatan bersama-sama.
            </p>
            <div className="mt-8 flex justify-center space-x-6">
              <div className="text-center">
                <div className="text-2xl font-bold">✓</div>
                <div className="text-white text-opacity-80 text-sm">Informasi Real-time</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">✓</div>
                <div className="text-white text-opacity-80 text-sm">Komunitas Aktif</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">✓</div>
                <div className="text-white text-opacity-80 text-sm">Keamanan Data</div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Wave Pattern */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="w-full h-20">
            <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" opacity=".25" fill="white" className="shape-fill"></path>
            <path d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z" opacity=".5" fill="white" className="shape-fill"></path>
            <path d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z" fill="white" className="shape-fill"></path>
          </svg>
        </div>
      </div>

      {/* Mobile Background Pattern */}
      <div className="md:hidden absolute inset-0 bg-gradient-to-br from-[#053040] to-[#2C5B6B] opacity-5 pointer-events-none"></div>
    </div>
  );
}