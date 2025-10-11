'use client'

import Link from 'next/link'
import { Home, ClipboardCheck, Map, Waves, LogOut, LogIn, CheckCircle, X } from 'lucide-react'
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
  const [showLogoutToast, setShowLogoutToast] = useState(false)
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)

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

  const handleLogoutClick = () => {
    setShowLogoutConfirm(true)
  }

  const handleLogout = async () => {
    setShowLogoutConfirm(false)
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
        // Show success toast
        setShowLogoutToast(true)
        
        // Redirect after a short delay to show the toast
        setTimeout(() => {
          router.push('/beranda')
        }, 1500)
      } else {
        console.error('Logout failed:', await response.text())
      }
    } catch (error) {
      console.error('Error during logout:', error)
    } finally {
      setIsLoggingOut(false)
    }
  }

  const handleCancelLogout = () => {
    setShowLogoutConfirm(false)
  }

  // Auto-hide toast after 3 seconds
  useEffect(() => {
    if (showLogoutToast) {
      const timer = setTimeout(() => {
        setShowLogoutToast(false)
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [showLogoutToast])

  if (loadingAuth) {
    return (
      <div className="flex items-center gap-6">
        <div className="animate-pulse bg-gray-200 h-10 w-20 rounded"></div>
        <div className="animate-pulse bg-gray-200 h-10 w-20 rounded"></div>
      </div>
    )
  }

  return (
    <>
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
              href="/kondisi-laut" 
              className="flex items-center gap-2 px-3 py-2 rounded-lg transition-all hover:bg-[#2C5B6B] hover:text-white group"
            >
              <Waves className="text-[#053040] group-hover:text-white" size={20} />
              <span className="hidden sm:inline text-[#053040] group-hover:text-white">Kondisi Laut</span>
            </Link>
            <Link 
              href="/checklist" 
              className="flex items-center gap-2 px-3 py-2 rounded-lg transition-all hover:bg-[#2C5B6B] hover:text-white group"
            >
              <ClipboardCheck className="text-[#053040] group-hover:text-white" size={20} />
              <span className="hidden sm:inline text-[#053040] group-hover:text-white">Panduan</span>
            </Link>
            
            <Link 
              href="/peta-komunitas" 
              className="flex items-center gap-2 px-3 py-2 rounded-lg transition-all hover:bg-[#2C5B6B] hover:text-white group"
            >
              <Map className="text-[rgb(5,48,64)] group-hover:text-white" size={20} />
              <span className="hidden sm:inline text-[#053040] group-hover:text-white">Komunitas</span>
            </Link>
          </>
        )}

        {isLoggedIn ? (
          <button 
            onClick={handleLogoutClick}
            className="flex items-center gap-2 px-3 py-2 rounded-lg transition-all bg-[#053040] text-white hover:bg-[#2C5B6B]"
          >
            <LogOut size={20} />
            <span className="hidden sm:inline">Logout</span>
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

      {/* Logout Confirmation Dialog */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-[1px]">
          <div className="bg-white rounded-xl shadow-2xl border border-gray-200 p-6 mx-4 max-w-sm w-full transform transition-all duration-200 scale-100">
            <div className="text-center">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <LogOut className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Konfirmasi Logout
              </h3>
              <p className="text-gray-600 text-sm mb-6">
                Anda yakin ingin logout? Anda perlu login kembali untuk mengakses fitur lengkap.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={handleCancelLogout}
                  className="flex-1 py-2 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Batal
                </button>
                <button
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="flex-1 py-2 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 font-medium flex items-center justify-center gap-2"
                >
                  {isLoggingOut ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      <span className="hidden sm:inline">Loading...</span>
                    </>
                  ) : (
                    'Logout'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Success Toast Notification */}
      {showLogoutToast && (
        <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-right duration-300">
          <div className="bg-green-50 border border-green-200 rounded-xl shadow-lg p-4 max-w-sm">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div className="flex-1">
                <p className="text-green-800 font-medium text-sm">
                  Logout Berhasil
                </p>
                <p className="text-green-700 text-sm mt-1">
                  Anda telah berhasil logout. Mengarahkan ke beranda...
                </p>
              </div>
              <button
                onClick={() => setShowLogoutToast(false)}
                className="flex-shrink-0 text-green-500 hover:text-green-700 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}