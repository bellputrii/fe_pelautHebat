'use client'

import Link from 'next/link'
import { Waves, Shield, FileText, Mail } from 'lucide-react'

export default function Footer() {
  const currentYear = new Date().getFullYear()
  const version = "1.0.0"

  return (
    <footer className="bg-[#053040] text-white py-12">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Waves className="text-[#2C5B6B]" size={24} />
              <span className="font-bold text-xl">Pelaut Hebat</span>
            </div>
            <p className="text-[#C9CFCF] text-sm">
              Meningkatkan keselamatan transportasi laut dan kesejahteraan masyarakat pesisir melalui solusi inovatif.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Navigasi</h3>
            <ul className="space-y-2 text-[#C9CFCF]">
              <li><Link href="/dashboard" className="hover:text-white transition">Beranda</Link></li>
              <li><Link href="/dashboard" className="hover:text-white transition">Checklist</Link></li>
              <li><Link href="/dashboard" className="hover:text-white transition">Peta Komunitas</Link></li>
              <li><Link href="/dashboard" className="hover:text-white transition">Kondisi Laut</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Legal</h3>
            <ul className="space-y-2 text-[#C9CFCF]">
              <li>
                <Link href="/dashboard" className="flex items-center gap-2 hover:text-white transition">
                  <Shield size={16} /> Kebijakan Privasi
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="flex items-center gap-2 hover:text-white transition">
                  <FileText size={16} /> Ketentuan Layanan
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="flex items-center gap-2 hover:text-white transition">
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

        <div className="border-t border-[#2C5B6B] mt-8 pt-8 text-center text-sm text-[#C9CFCF]">
          <p>Dibangun dengan dedikasi untuk keselamatan pelayaran Indonesia</p>
        </div>
      </div>
    </footer>
  )
}