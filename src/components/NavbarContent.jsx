'use client'

import Link from 'next/link'
import { Home, Waves, Info } from 'lucide-react'

export default function NavbarContent() {
  return (
    <>
      <Link href="/" className="flex items-center gap-1 hover:text-blue-600">
        <Home size={18} /> <span className="hidden sm:inline">Beranda</span>
      </Link>
      <Link href="/cuaca" className="flex items-center gap-1 hover:text-blue-600">
        <Waves size={18} /> <span className="hidden sm:inline">Info Cuaca</span>
      </Link>
      <Link href="/tentang" className="flex items-center gap-1 hover:text-blue-600">
        <Info size={18} /> <span className="hidden sm:inline">Tentang</span>
      </Link>
    </>
  )
}
