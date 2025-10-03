'use client'
import { useState } from 'react'

export default function useVerticalNavbar() {
  const [isOpen, setIsOpen] = useState(true)

  const toggleNavbar = () => setIsOpen(prev => !prev)

  return { isOpen, toggleNavbar }
}

