🌊 Pelaut Hebat - Ocean Safety Hub (Frontend)

**Website edukasi keselamatan pelayaran Indonesia** berbasis React & Next.js. Menyajikan data cuaca maritim real-time, analisis AI, dan sistem peringatan dini berbasis visual interaktif bagi nelayan dan masyarakat pesisir.

---

✨ Fitur Utama

* 🌊 **Dashboard Cuaca Maritim:** Tampilan interaktif gelombang laut, kecepatan angin, suhu, dan tekanan udara
* 🤖 **Analisis AI Terintegrasi:** Penjelasan kondisi laut dalam bahasa natural dari Google Gemini AI
* ⏰ **Rekomendasi Waktu Berlayar:** Visualisasi waktu terbaik berdasarkan kondisi cuaca & jenis kapal
* 🚨 **Peringatan Dini Visual:** UI peringatan interaktif dengan indikator sensitivitas anomali
* 🌐 **Deteksi Zona Waktu Otomatis:** Menyesuaikan waktu lokal (WIB/WITA/WIT) berdasarkan lokasi pengguna
* 🔐 **Autentikasi Firebase:** Login dengan Email/Password dan Google OAuth
* 💨 **Responsif & Cepat:** Dukungan caching dan optimalisasi loading data API

---

🛠️ Tech Stack

| Layer              | Teknologi                                                     |
| ------------------ | ------------------------------------------------------------- |
| Frontend Framework | **Next.js 14 (App Router)**                                   |
| Styling            | **Tailwind CSS**, Heroicons                                   |
| State Management   | **React Context**, SWR (data fetching & caching)              |
| Auth               | **Firebase Auth** (Email/Password & Google OAuth)             |
| API Integrasi      | **Open Meteo API**, **Google Gemini AI**, Ocean Safety Hub BE |
| Utilities          | Headless UI, Date-fns, React Hook Form, Zod                   |
| Deployment         | Vercel (recommended)                                          |

---

🚀 Quick Start

📦 Prasyarat

* Node.js 18+
* npm atau yarn
* Firebase Project (untuk auth)
* API Backend Ocean Safety Hub tersedia (lihat dokumentasi backend)

🛠 Instalasi

```bash
git clone https://github.com/bellputrii/fe_pelautHebat.git
cd fe_pelautHebat
npm install
```

⚙️ Konfigurasi Environment

Buat file `.env.local` dari template:

```bash
cp .env.example .env.local
```

Edit isinya sesuai kredensial Firebase dan endpoint backend API:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
NEXT_PUBLIC_BACKEND_BASE_URL=http://localhost:3001
```

---

▶️ Jalankan Dev Server

```bash
npm run dev
```

Akses di [http://localhost:3000](http://localhost:3000)

---

📁 Struktur Proyek

```
src/
├── app/                  # Struktur routing Next.js App Router
│   ├── (auth)/           # Layout halaman login/register
│   ├── dashboard/        # Halaman utama pengguna
│   ├── weather/          # Visualisasi data cuaca
│   ├── ai-tools/         # Fitur AI seperti rekomendasi & penjelasan
│   └── components/       # UI komponen reusable
├── lib/                  # Firebase, utils, constants
├── styles/               # Custom Tailwind config
└── types/                # Tipe data & interface global
```

---

🔐 Firebase Authentication

Menggunakan Firebase Auth (Client SDK):

* 🔑 **Login & Register:** Email/Password
* 🔐 **Google OAuth Login**
* 📧 **Email Verification & Reset Password**
* 👤 **Protected Route:** Redirect jika belum login

---

📊 Integrasi Backend API

| Fitur                | Endpoint                     | Method | Auth     |
| -------------------- | ---------------------------- | ------ | -------- |
| Cuaca Maritim        | `/api/weather/marine`        | GET    | Optional |
| Penjelasan AI        | `/api/ai/explain-conditions` | POST   | ✅        |
| Rekomendasi Berlayar | `/api/ai/recommend-times`    | POST   | ✅        |
| Anomali & Peringatan | `/api/ai/early-warnings`     | GET    | ✅        |
| Login                | `/api/auth/login`            | POST   | ❌        |
| Profil               | `/api/auth/profile`          | GET    | ✅        |

---

🧪 Testing (Optional)

Coming soon with Jest & React Testing Library.

---

🌐 Deployment

Gunakan [Vercel](https://vercel.com/) untuk build otomatis.

✅ Setup

* Tambahkan environment variable di dashboard Vercel (copy dari `.env.local`)
* Jalankan build production:

```bash
npm run build
npm start
```

---

📄 License

MIT © 2025 Ocean Safety Hub - Pelaut Hebat

---

📬 Kontak & Bantuan

* 🌐 Website: [pelauthebat.id](https://pelauthebat.id)
* 📩 Email: [support@pelaut-hebat.com](mailto:support@pelaut-hebat.com)
* 🐙 GitHub Issues: [Repo Issues](https://github.com/bellputrii/fe_pelautHebat/issues)

---
