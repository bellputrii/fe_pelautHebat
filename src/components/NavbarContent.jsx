'use client'

import Link from 'next/link'
import { Home, Waves, Info } from 'lucide-react'

export default function NavbarContent() {
  return (
    <>
      <Link href="/" className="flex items-center gap-1 hover:text-blue-600">
        <span className="hidden sm:inline">Beranda</span>
      </Link>
      <Link href="/cuaca" className="flex items-center gap-1 hover:text-blue-600">
        <span className="hidden sm:inline">Checklist</span>
      </Link>
      <Link href="/tentang" className="flex items-center gap-1 hover:text-blue-600">
        <span className="hidden sm:inline">Peta Komunitas</span>
      </Link>
      <Link href="/tentang" className="flex items-center gap-1 hover:text-blue-600">
        <span className="hidden sm:inline">Kondisi Laut</span>
      </Link>
    </>
  )
}
