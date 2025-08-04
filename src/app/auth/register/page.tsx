"use client";

import { useState } from "react";
import { useRouter } from "next/navigation"; // ⬅️ untuk redirect
import { signInWithPopup } from "firebase/auth";
import { auth, provider } from "@/firebase/config";


export default function SignUpPage() {
  const router = useRouter(); // ⬅️ inisialisasi router

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

  const handleSubmit = async () => {
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
        setMessage("Registrasi berhasil!");
        setForm({ firstName: "", lastName: "", email: "", password: "" });

        // Tunggu 1 detik biar user sempat lihat pesan, lalu redirect ke login
        setTimeout(() => {
          router.push("/auth/login");
        }, 1000);
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
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      const idToken = await user.getIdToken();

      // Kirim ke backend endpoint khusus signup Google
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/google-signin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem("token", data.token); // jika backend mengembalikan token
        router.push("/beranda"); // arahkan ke halaman setelah signup
      } else {
        alert(data?.message || "Registrasi dengan Google gagal.");
      }
    } catch (error) {
      console.error("Google sign-up error:", error);
      alert("Terjadi kesalahan saat registrasi dengan Google.");
    }
  };


  return (
    <div className="min-h-screen flex">
      {/* Left - Form */}
      <div className="w-full md:w-1/2 flex flex-col justify-center px-8 md:px-24">
        <div className="flex items-center gap-2 mb-8">
          <img src="/logo.png" alt="Logo" className="w-4 h-4" />
          <h1 className="text-3xl font-bold text-primary">Pelaut Hebat</h1>
        </div>

        <h2 className="text-2xl font-semibold mb-6">Sign Up</h2>

        {/* Alert */}
        {status === "success" && (
          <div className="bg-green-100 text-green-800 p-3 rounded-md mb-4 shadow border border-green-300">
            {message}
          </div>
        )}
        {status === "error" && (
          <div className="bg-red-100 text-red-800 p-3 rounded-md mb-4 shadow border border-red-300">
            {message}
          </div>
        )}

        <input
          type="text"
          name="firstName"
          placeholder="Nama Depan"
          value={form.firstName}
          onChange={handleChange}
          className="w-full p-3 rounded-md bg-[#628696] text-white placeholder-white shadow mb-4"
        />
        <input
          type="text"
          name="lastName"
          placeholder="Nama Belakang"
          value={form.lastName}
          onChange={handleChange}
          className="w-full p-3 rounded-md bg-[#628696] text-white placeholder-white shadow mb-4"
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          className="w-full p-3 rounded-md bg-[#628696] text-white placeholder-white shadow mb-4"
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          className="w-full p-3 rounded-md bg-[#628696] text-white placeholder-white shadow mb-4"
        />

        <p className="text-sm mb-4">
          Already have an account?{" "}
          <a href="/auth/login" className="font-semibold text-gray-700">
            Sign in
          </a>
        </p>

        <button
          onClick={handleSubmit}
          disabled={status === "loading"}
          className={`w-full text-white p-3 rounded-md shadow font-semibold mb-4 flex justify-center items-center
          ${status === "loading" ? "bg-[#628696]" : "bg-[#2C5B6B] hover:bg-[#1e3f4b]"}`}
        >
          {status === "loading" ? (
            <img src="/logo.png" alt="Loading" className="w-6 h-6 animate-spin" />
          ) : (
            "Create Account"
          )}
        </button>

        <button
          onClick={handleGoogleSignUp}
          className="w-full flex items-center justify-center gap-2 border border-black p-3 rounded-md shadow hover:bg-gray-200"
        >
          <img src="/google.png" alt="Google" className="w-5 h-5" />
          <span>Sign Up With Google</span>
        </button>

      </div>

      <div className="hidden md:block w-1/2">
        <img src="/signup-bg.png" alt="Ocean" className="w-full object-cover h-full" />
      </div>
    </div>
  );
}
