'use client'

import Link from 'next/link'
import { Home, ClipboardCheck, Map, Waves, LogOut, LogIn } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { auth } from '@/firebase/config'
import { useTokenRefresh } from '@/app/hooks/useAuth'
import { onAuthStateChanged, signOut } from 'firebase/auth'

export default function NavbarContent() {
  const router = useRouter()
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [loadingAuth, setLoadingAuth] = useState(true)

  // Initialize token refresh mechanism
  useTokenRefresh()

  // Check auth state on component mount
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsLoggedIn(!!user)
      setLoadingAuth(false)
    })
    return () => unsubscribe()
  }, [])

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      // 1. Logout from Firebase
      await signOut(auth)
      
      // 2. Send logout request to backend
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/logout`, {
        method: 'POST',
        credentials: 'include'
      })

      if (response.ok) {
        router.push('/beranda') // Redirect to beranda after logout
      } else {
        console.error('Logout failed:', await response.text())
      }
    } catch (error) {
      console.error('Error during logout:', error)
    } finally {
      setIsLoggingOut(false)
    }
  }

  if (loadingAuth) {
    return (
      <div className="flex items-center gap-6">
        <div className="animate-pulse bg-gray-200 h-10 w-20 rounded"></div>
        <div className="animate-pulse bg-gray-200 h-10 w-20 rounded"></div>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-6">
      {/* Always show beranda link */}
      <Link 
        href="/beranda" 
        className="flex items-center gap-2 px-3 py-2 rounded-lg transition-all hover:bg-[#2C5B6B] hover:text-white group"
      >
        <Home className="text-[#053040] group-hover:text-white" size={20} />
        <span className="hidden sm:inline text-[#053040] group-hover:text-white">Beranda</span>
      </Link>
      
      {/* Protected routes - only show when logged in */}
      {isLoggedIn && (
        <>
          <Link 
            href="/checklist" 
            className="flex items-center gap-2 px-3 py-2 rounded-lg transition-all hover:bg-[#2C5B6B] hover:text-white group"
          >
            <ClipboardCheck className="text-[#053040] group-hover:text-white" size={20} />
            <span className="hidden sm:inline text-[#053040] group-hover:text-white">Checklist</span>
          </Link>
          
          <Link 
            href="/peta-komunitas" 
            className="flex items-center gap-2 px-3 py-2 rounded-lg transition-all hover:bg-[#2C5B6B] hover:text-white group"
          >
            <Map className="text-[#053040] group-hover:text-white" size={20} />
            <span className="hidden sm:inline text-[#053040] group-hover:text-white">Peta Komunitas</span>
          </Link>
          
          <Link 
            href="/kondisi-laut" 
            className="flex items-center gap-2 px-3 py-2 rounded-lg transition-all hover:bg-[#2C5B6B] hover:text-white group"
          >
            <Waves className="text-[#053040] group-hover:text-white" size={20} />
            <span className="hidden sm:inline text-[#053040] group-hover:text-white">Kondisi Laut</span>
          </Link>
        </>
      )}

      {isLoggedIn ? (
        <button 
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="flex items-center gap-2 px-3 py-2 rounded-lg transition-all bg-[#053040] text-white hover:bg-[#2C5B6B] disabled:opacity-50"
        >
          {isLoggingOut ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span className="hidden sm:inline">Logging out...</span>
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <LogOut size={20} />
              <span className="hidden sm:inline">Logout</span>
            </span>
          )}
        </button>
      ) : (
        <Link
          href="/auth/login"
          className="flex items-center gap-2 px-3 py-2 rounded-lg transition-all bg-[#2C5B6B] text-white hover:bg-[#1e4755]"
        >
          <LogIn size={20} />
          <span className="hidden sm:inline">Sign In</span>
        </Link>
      )}
    </div>
  )
}