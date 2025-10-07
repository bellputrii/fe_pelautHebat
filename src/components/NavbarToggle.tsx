'use client'

import { Menu, X } from 'lucide-react'

interface NavbarToggleProps {
  isOpen: boolean
  toggle: () => void
}

export default function NavbarToggle({ isOpen, toggle }: NavbarToggleProps) {
  return (
    <button
      onClick={toggle}
      className="md:hidden p-2 rounded hover:bg-gray-200 transition"
      aria-label="Toggle Navbar"
    >
      {isOpen ? <X size={24} className="text-[#053040]" /> : <Menu size={24} className="text-[#053040]" />}
    </button>
  )
}