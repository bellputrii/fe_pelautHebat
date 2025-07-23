'use client'

import useVerticalNavbar from '@/hooks/useVerticalNavbar'
import NavbarToggle from '@/components/NavbarToggle'
import NavbarContent from '@/components/NavbarContent'
import Image from 'next/image'

export default function Navbar() {
  const { isOpen, toggleNavbar } = useVerticalNavbar()

  return (
    <header className="fixed top-0 z-50 w-full bg-white shadow-md px-6 py-4 flex items-center justify-between">
      {/* Kiri: Logo dan Brand */}
      <div className="flex items-center gap-3">
        <Image src="/logo.png" alt="Logo" width={15} height={15} />
        <h1 className="text-xl font-bold text-[#053040]">Pelaut Hebat</h1>
      </div>

      {/* Kanan: Navigasi */}
      <div className="flex items-center gap-4">
        <nav className="hidden md:flex gap-6">
          <NavbarContent />
        </nav>
        <NavbarToggle isOpen={isOpen} toggle={toggleNavbar} />
      </div>

      {/* Dropdown Mobile */}
      {isOpen && (
        <div className="md:hidden absolute top-16 left-0 w-full bg-white shadow-md z-50 px-6 py-4">
          <NavbarContent />
        </div>
      )}
    </header>
  )
}
