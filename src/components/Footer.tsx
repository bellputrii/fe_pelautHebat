'use client';

import Link from 'next/link';
import { Waves, Shield, FileText, Mail } from 'lucide-react';
import { useState, useEffect } from 'react';
import { auth } from '@/firebase/config';
import { onAuthStateChanged } from 'firebase/auth';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const version = '1.0.0';
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loadingAuth, setLoadingAuth] = useState(true);

  // Check auth state on component mount
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsLoggedIn(!!user);
      setLoadingAuth(false);
    });
    return () => unsubscribe();
  }, []);

  return (
    <footer className="bg-[#053040] text-white py-12">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              {/* <Waves className="text-[#2C5B6B]" size={28} /> */}
              <span className="font-bold text-2xl">Pelaut Hebat</span>
            </div>
            <p className="text-[#C9CFCF] text-sm leading-relaxed">
              Meningkatkan keselamatan transportasi laut dan kesejahteraan masyarakat pesisir melalui solusi inovatif.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Navigasi</h3>
            {loadingAuth ? (
              <div className="animate-pulse space-y-2">
                <div className="h-4 bg-gray-700 rounded"></div>
                <div className="h-4 bg-gray-700 rounded"></div>
                <div className="h-4 bg-gray-700 rounded"></div>
                <div className="h-4 bg-gray-700 rounded"></div>
              </div>
            ) : (
              <ul className="space-y-2 text-[#C9CFCF]">
                <li>
                  <Link href="/beranda" className="hover:text-white transition">
                    Beranda
                  </Link>
                </li>
                {isLoggedIn ? (
                  <>
                    <li>
                      <Link href="/checklist" className="hover:text-white transition">
                        Checklist
                      </Link>
                    </li>
                    <li>
                      <Link href="/peta-komunitas" className="hover:text-white transition">
                        Peta Komunitas
                      </Link>
                    </li>
                    <li>
                      <Link href="/kondisi-laut" className="hover:text-white transition">
                        Kondisi Laut
                      </Link>
                    </li>
                  </>
                ) : (
                  <>
                    <li>
                      <Link href="/beranda" className="hover:text-white transition">
                        Checklist
                      </Link>
                    </li>
                    <li>
                      <Link href="/beranda" className="hover:text-white transition">
                        Peta Komunitas
                      </Link>
                    </li>
                    <li>
                      <Link href="/beranda" className="hover:text-white transition">
                        Kondisi Laut
                      </Link>
                    </li>
                  </>
                )}
              </ul>
            )}
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Legal</h3>
            <ul className="space-y-2 text-[#C9CFCF]">
              <li>
                <Link href="/beranda" className="flex items-center gap-2 hover:text-white transition">
                  <Shield size={16} /> Kebijakan Privasi
                </Link>
              </li>
              <li>
                <Link href="/beranda" className="flex items-center gap-2 hover:text-white transition">
                  <FileText size={16} /> Ketentuan Layanan
                </Link>
              </li>
              <li>
                <Link href="/beranda" className="flex items-center gap-2 hover:text-white transition">
                  <Mail size={16} /> Kontak Kami
                </Link>
              </li>
            </ul>
          </div>

          {/* Version Info */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Kontak</h3>
            <div className="text-[#C9CFCF] space-y-2">
              <p>Version: {version}</p>
              <p>© {currentYear} Pelaut Hebat</p>
              <p>All rights reserved</p>
            </div>
          </div>
        </div>

        {/* Disclaimer Section */}
        <div className="mt-10 p-4 bg-[#0a3a4d] rounded-lg border border-[#2C5B6B]">
          <h4 className="font-medium text-[#C9CFCF] mb-2 text-center">Disclaimer Hak Cipta</h4>
          <p className="text-xs text-[#a0aec0] text-center leading-relaxed">
            Kami tidak berniat untuk menyebarluaskan atau memperjualbelikan konten apapun yang memiliki hak cipta. Semua
            materi seperti video, gambar, dan data lainnya yang mungkin ditampilkan bukan hasil produksi Kami, dan
            sepenuhnya merupakan hak milik pemilik aslinya. Website ini tidak menyimpan file video apapun di server
            pribadi, melainkan hanya menggunakan link atau embed dari pihak ketiga untuk simulasi teknis dan pemberian
            informasi.
          </p>
        </div>

        {/* Footer Bottom */}
        <div className="border-t border-[#2C5B6B] mt-8 pt-8 text-center text-sm text-[#C9CFCF]">
          <p>Dibangun dengan dedikasi untuk keselamatan pelayaran Indonesia</p>
        </div>
      </div>
    </footer>
  );
}