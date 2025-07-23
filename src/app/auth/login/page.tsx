"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

declare global {
  interface Window {
    google?: any;
  }
}

export default function SignInPage() {
  const router = useRouter();

  const [form, setForm] = useState({ email: "", password: "" });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    setStatus("loading");

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email, password: form.password }),
      });

      const result = await response.json();

      if (response.ok) {
        setStatus("success");
        setMessage("Login berhasil!");
        if (result.token) localStorage.setItem("token", result.token);
        setTimeout(() => router.push("/dashboard"), 1000);
      } else {
        setStatus("error");
        setMessage(result?.message || "Login gagal.");
      }
    } catch (error) {
      setStatus("error");
      setMessage("Terjadi kesalahan saat menghubungi server.");
    } finally {
      setTimeout(() => setStatus("idle"), 4000);
    }
  };

  // ⬇️ Google Sign-In
  const handleGoogleSignIn = () => {
    // @ts-ignore
    google.accounts.id.initialize({
      client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
      callback: async (response: any) => {
        if (response.credential) {
          try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/google-signin`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ idToken: response.credential }),
            });

            const data = await res.json();
            if (res.ok) {
              localStorage.setItem("token", data.token);
              router.push("/dashboard");
            } else {
              console.error("Google sign-in server error:", data);
              alert(data?.message || "Google Sign-In gagal.");
            }
          } catch (err) {
            console.error("Google sign-in error:", err);
            alert("Terjadi kesalahan saat sign in dengan Google.");
          }
        }
      },
    });

    // @ts-ignore
    google.accounts.id.prompt();
  };

  // Render Google button jika ingin tombol (opsional)
  useEffect(() => {
    if (typeof window !== "undefined" && window.google) {
      // @ts-ignore
      google.accounts.id.renderButton(document.getElementById("googleBtn"), {
        theme: "outline",
        size: "large",
        width: "100%",
      });
    }
  }, []);

  return (
    <div className="min-h-screen flex">
      <div className="w-full md:w-1/2 flex flex-col justify-center px-8 md:px-24">
        <div className="flex items-center gap-2 mb-8">
          <img src="/logo.png" alt="Logo" className="w-4 h-4" />
          <h1 className="text-3xl font-bold text-primary">Pelaut Hebat</h1>
        </div>

        <h2 className="text-2xl font-semibold mb-6">Sign In</h2>

        {status === "success" && (
          <div className="bg-green-100 text-green-800 p-3 rounded-md mb-4 shadow border border-green-300">{message}</div>
        )}
        {status === "error" && (
          <div className="bg-red-100 text-red-800 p-3 rounded-md mb-4 shadow border border-red-300">{message}</div>
        )}

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
          Don't have an account?{" "}
          <a href="/auth/register" className="font-semibold text-gray-700">
            Sign up
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
            "Sign In"
          )}
        </button>

        <button
          onClick={handleGoogleSignIn}
          className="w-full flex items-center justify-center gap-2 border border-black p-3 rounded-md shadow hover:bg-gray-200"
        >
          <img src="/google.png" alt="Google" className="w-5 h-5" />
          <span>Sign In With Google</span>
        </button>

        {/* Untuk button render langsung dari Google (opsional) */}
        {/* <div id="googleBtn" className="mt-4" /> */}
      </div>

      <div className="hidden md:block w-1/2">
        <img src="/signup-bg.png" alt="Ocean" className="w-full object-cover h-full" />
      </div>
    </div>
  );
}
