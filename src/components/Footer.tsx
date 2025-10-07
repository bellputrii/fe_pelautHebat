'use client';

import Link from 'next/link';
import { Shield, FileText, Mail, Phone, MapPin } from 'lucide-react';
import { useState, useEffect } from 'react';
import { auth } from '@/firebase/config';
import { onAuthStateChanged } from 'firebase/auth';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const version = '1.0.0';
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loadingAuth, setLoadingAuth] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsLoggedIn(!!user);
      setLoadingAuth(false);
    });
    return () => unsubscribe();
  }, []);

  return (
    <footer className="bg-gray-900 text-white pt-8 pb-6">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {/* Brand Section */}
          <div className="space-y-3 sm:space-y-4">
            <div className="flex items-center gap-2">
              <span className="font-bold text-xl sm:text-2xl text-white">Pelaut Hebat</span>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed">
              Meningkatkan keselamatan transportasi laut dan kesejahteraan masyarakat pesisir melalui solusi inovatif.
            </p>
            <div className="flex items-center gap-2 text-gray-300 text-sm">
              <MapPin size={16} className="flex-shrink-0" />
              <span>Indonesia</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-white text-lg mb-3 sm:mb-4">Navigasi</h3>
            {loadingAuth ? (
              <div className="animate-pulse space-y-2">
                <div className="h-4 bg-gray-700 rounded"></div>
                <div className="h-4 bg-gray-700 rounded"></div>
                <div className="h-4 bg-gray-700 rounded"></div>
              </div>
            ) : (
              <ul className="space-y-2 text-gray-300">
                <li>
                  <Link href="/beranda" className="hover:text-white transition-colors text-sm">
                    Beranda
                  </Link>
                </li>
                {isLoggedIn ? (
                  <>
                    <li>
                      <Link href="/checklist" className="hover:text-white transition-colors text-sm">
                        Checklist
                      </Link>
                    </li>
                    <li>
                      <Link href="/peta-komunitas" className="hover:text-white transition-colors text-sm">
                        Peta Komunitas
                      </Link>
                    </li>
                    <li>
                      <Link href="/kondisi-laut" className="hover:text-white transition-colors text-sm">
                        Kondisi Laut
                      </Link>
                    </li>
                  </>
                ) : (
                  <>
                    <li>
                      <Link href="/beranda" className="hover:text-white transition-colors text-sm">
                        Checklist
                      </Link>
                    </li>
                    <li>
                      <Link href="/beranda" className="hover:text-white transition-colors text-sm">
                        Peta Komunitas
                      </Link>
                    </li>
                    <li>
                      <Link href="/beranda" className="hover:text-white transition-colors text-sm">
                        Kondisi Laut
                      </Link>
                    </li>
                  </>
                )}
              </ul>
            )}
          </div>

          {/* Legal & Contact */}
          <div>
            <h3 className="font-semibold text-white text-lg mb-3 sm:mb-4">Legal</h3>
            <ul className="space-y-2 text-gray-300">
              <li>
                <Link href="/beranda" className="flex items-center gap-2 hover:text-white transition-colors text-sm">
                  <Shield size={16} className="flex-shrink-0" /> 
                  Kebijakan Privasi
                </Link>
              </li>
              <li>
                <Link href="/beranda" className="flex items-center gap-2 hover:text-white transition-colors text-sm">
                  <FileText size={16} className="flex-shrink-0" /> 
                  Ketentuan Layanan
                </Link>
              </li>
              <li>
                <Link href="/beranda" className="flex items-center gap-2 hover:text-white transition-colors text-sm">
                  <Mail size={16} className="flex-shrink-0" /> 
                  Kontak Kami
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="font-semibold text-white text-lg mb-3 sm:mb-4">Kontak</h3>
            <div className="text-gray-300 space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <Phone size={16} className="flex-shrink-0" />
                <span>+62 812-3456-7890</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail size={16} className="flex-shrink-0" />
                <span>info@pelauthebat.id</span>
              </div>
              <div className="pt-2">
                <p>Versi: {version}</p>
                <p>© {currentYear} Pelaut Hebat</p>
                <p>All rights reserved</p>
              </div>
            </div>
          </div>
        </div>

        {/* Disclaimer Section */}
        <div className="mt-6 sm:mt-8 p-3 sm:p-4 bg-gray-800 rounded-lg border border-gray-700">
          <h4 className="font-medium text-gray-200 mb-2 text-center text-sm">Disclaimer Hak Cipta</h4>
          <p className="text-xs text-gray-400 text-center leading-relaxed">
            Kami tidak berniat untuk menyebarluaskan atau memperjualbelikan konten apapun yang memiliki hak cipta. Semua
            materi seperti video, gambar, dan data lainnya yang mungkin ditampilkan bukan hasil produksi Kami, dan
            sepenuhnya merupakan hak milik pemilik aslinya. Website ini tidak menyimpan file video apapun di server
            pribadi, melainkan hanya menggunakan link atau embed dari pihak ketiga untuk simulasi teknis dan pemberian
            informasi.
          </p>
        </div>

        {/* Footer Bottom */}
        <div className="border-t border-gray-700 mt-4 sm:mt-6 pt-4 text-center text-sm text-gray-400">
          <p>Dibangun dengan dedikasi untuk keselamatan pelayaran Indonesia</p>
        </div>
      </div>
    </footer>
  );
}