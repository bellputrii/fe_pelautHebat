
# 🌊 Pelaut Hebat - Ocean Safety Hub (Frontend)

**Website edukasi keselamatan pelayaran Indonesia** berbasis **React & Next.js**, dirancang untuk membantu nelayan, pelaut, dan masyarakat pesisir memahami kondisi laut secara **real-time**.  
Dengan tampilan visual interaktif, analisis AI yang mudah dipahami, dan sistem peringatan dini, **Pelaut Hebat** menjadi asisten digital keselamatan pelayaran Anda.

---

## ✨ Fitur Utama

### 🌊 Dashboard Cuaca Maritim Interaktif
Lihat kondisi laut terkini dengan tampilan visual yang mudah dibaca:
- 🌡️ **Suhu udara & laut**
- 💨 **Kecepatan dan arah angin**
- 🌊 **Tinggi dan periode gelombang**
- 📈 **Tekanan udara**
- 🕒 **Detail prakiraan 24 jam ke depan**

Seluruh data diperbarui **secara real-time** menggunakan integrasi **Open Meteo API** dan ditampilkan dalam antarmuka **responsif & dinamis**.

---

### 📍 Cek Kondisi Laut dengan Geolokasi Otomatis
Fitur utama ini memungkinkan pengguna untuk:
- **Mendeteksi lokasi terkini** secara otomatis melalui geolocation browser
- **Menampilkan kondisi laut di area Anda** tanpa perlu input manual
- **Melihat prakiraan cuaca terkini** secara visual dan numerik
- Mendapatkan **ringkasan sederhana dari AI** tentang:
  - Kecepatan dan arah angin  
  - Tinggi gelombang  
  - Suhu udara dan tekanan atmosfer  
  - Periode gelombang (frekuensi ombak)
- Disertai **rekomendasi waktu berlayar terbaik** berdasarkan kondisi tersebut

💡 **AI akan menjelaskan kondisi cuaca dengan bahasa natural dan mudah dipahami orang awam**, sehingga informasi kompleks menjadi lebih praktis dan berguna dalam pengambilan keputusan.

---

### 🤖 Analisis AI Terintegrasi (Google Gemini AI)
Fitur AI pada Pelaut Hebat memiliki dua fungsi utama:
1. **Penjelasan Kondisi Laut** — menjabarkan data cuaca menjadi kalimat sederhana seperti:  
   > “Gelombang sedang dengan kecepatan angin cukup aman untuk kapal kecil. Disarankan berlayar pagi hari.”
2. **Rekomendasi Waktu Berlayar** — menilai kombinasi data (angin, gelombang, suhu) dan menampilkan:
   - Waktu terbaik untuk berlayar
   - Waktu berisiko tinggi (disertai indikator visual)

---

### 🚨 Peringatan Dini Visual
Sistem peringatan interaktif dengan indikator warna dan animasi:
- 🟢 Aman  
- 🟡 Waspada  
- 🔴 Bahaya  

AI mendeteksi **anomali cuaca laut** dan menampilkan notifikasi otomatis jika terdeteksi perubahan signifikan, seperti potensi badai atau angin kencang mendadak.

---

### ⏰ Rekomendasi Waktu Berlayar
Visualisasi waktu terbaik untuk berlayar berdasarkan:
- Jenis kapal (perahu kecil, kapal motor, dll)
- Kondisi cuaca dan gelombang
- Lokasi pengguna saat ini

Data disajikan dalam bentuk **grafik dan indikator warna** agar lebih mudah dibaca.

---

### 🌐 Deteksi Zona Waktu Otomatis
Website menyesuaikan waktu secara **otomatis** ke zona lokal pengguna:
- WIB (Barat)
- WITA (Tengah)
- WIT (Timur)

---

### 🔐 Autentikasi Firebase
- Login & Register dengan **Email/Password**
- Login cepat dengan **Google OAuth**
- Dukungan **verifikasi email & reset password**
- **Protected Route:** halaman dashboard dan cuaca hanya dapat diakses setelah login

---

### 💨 Performa Responsif & Cepat
- Optimalisasi caching dengan **SWR**
- Lazy loading pada grafik & peta
- Dukungan mobile, tablet, dan desktop

---

## 🛠️ Tech Stack

| Layer              | Teknologi                                                     |
| ------------------ | ------------------------------------------------------------- |
| Frontend Framework | **Next.js 14 (App Router)**                                   |
| Styling            | **Tailwind CSS**, Heroicons                                   |
| State Management   | **React Context**, SWR (data fetching & caching)              |
| Auth               | **Firebase Auth** (Email/Password & Google OAuth)             |
| API Integrasi      | **Open Meteo API**, **Google Gemini AI**, Ocean Safety Hub BE |
| Utilities          | Headless UI, Date-fns, React Hook Form, Zod                   |
| Deployment         | **Vercel** (recommended)                                      |

---

## 🚀 Quick Start

### 📦 Prasyarat
- Node.js 18+
- npm atau yarn
- Firebase Project (untuk autentikasi)
- API Backend Ocean Safety Hub aktif (lihat dokumentasi backend)

### 🛠 Instalasi

```bash
git clone https://github.com/bellputrii/fe_pelautHebat.git
cd fe_pelautHebat
npm install
````

### ⚙️ Konfigurasi Environment

Buat file `.env.local` dari template:

```bash
cp .env.example .env.local
```

Isi kredensial sesuai Firebase dan backend API:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
NEXT_PUBLIC_BACKEND_BASE_URL=http://localhost:3001
```

---

### ▶️ Jalankan Dev Server

```bash
npm run dev
```

Akses di [http://localhost:3000](http://localhost:3000)

---

## 📁 Struktur Proyek

```
src/
├── app/
│   ├── (auth)/           # Layout halaman login/register
│   ├── dashboard/        # Halaman utama pengguna
│   ├── weather/          # Visualisasi data cuaca & geolocation
│   ├── ai-tools/         # Fitur analisis & rekomendasi AI
│   └── components/       # Komponen UI reusable
├── lib/                  # Firebase, utils, constants
├── styles/               # Konfigurasi Tailwind & global CSS
└── types/                # Interface & tipe data global
```

---

## 🔐 Firebase Authentication

Menggunakan Firebase Auth (Client SDK):

| Fitur                 | Deskripsi                               |
| --------------------- | --------------------------------------- |
| 🔑 Login/Register     | Email & Password                        |
| 🔐 Google OAuth       | Login cepat dengan akun Google          |
| 📧 Email Verification | Verifikasi akun sebelum akses dashboard |
| 🔁 Reset Password     | Kirim tautan ke email                   |
| 👤 Protected Route    | Redirect otomatis jika belum login      |

---

## 📊 Integrasi Backend API

| Fitur                | Endpoint                     | Method | Auth     |
| -------------------- | ---------------------------- | ------ | -------- |
| Cuaca Maritim        | `/api/weather/marine`        | GET    | Optional |
| Penjelasan AI        | `/api/ai/explain-conditions` | POST   | ✅        |
| Rekomendasi Berlayar | `/api/ai/recommend-times`    | POST   | ✅        |
| Anomali & Peringatan | `/api/ai/early-warnings`     | GET    | ✅        |
| Login                | `/api/auth/login`            | POST   | ❌        |
| Profil               | `/api/auth/profile`          | GET    | ✅        |

---

## 🌐 Explore Website

Kunjungi website Pelaut Hebat untuk mencoba fitur lengkap:
👉 **[https://pelauthebat.vercel.app/](https://pelauthebat.vercel.app/)**

Di sana, kamu bisa langsung:

* Melihat **prakiraan cuaca terkini**
* Mendapatkan **rekomendasi AI yang mudah dipahami**
* Mengecek **kondisi laut sesuai lokasi kamu**
* Melihat **perubahan cuaca 24 jam ke depan**
* Mengetahui **waktu terbaik untuk berlayar** dengan tampilan visual menarik

---

## 🧪 Testing (Optional)

Segera hadir dengan **Jest & React Testing Library**.

---

## 🌐 Deployment

Gunakan [Vercel](https://vercel.com/) untuk build otomatis.

### ✅ Setup

* Tambahkan environment variable dari `.env.local`
* Jalankan build production:

```bash
npm run build
npm start
```

---

## 📄 License

MIT © 2025 Ocean Safety Hub - Pelaut Hebat

---

## 📬 Kontak & Bantuan

* 🌐 Website: [pelauthebat.id](https://pelauthebat.id)
* 📩 Email: [support@pelaut-hebat.com](mailto:support@pelaut-hebat.com)
* 🐙 GitHub Issues: [Repo Issues](https://github.com/bellputrii/fe_pelautHebat/issues)

```

---

Apakah kamu ingin aku tambahkan **preview gambar antarmuka (screenshot dashboard dan cuaca)** di bagian atas README agar tampak lebih profesional di GitHub?
```
