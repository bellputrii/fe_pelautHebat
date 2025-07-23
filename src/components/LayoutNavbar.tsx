import Navbar from '@/components/NavBar'
import { ReactNode } from 'react'

export default function LayoutNavbar({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 p-6 bg-gray-50">{children}</main>
    </div>
  )
}
