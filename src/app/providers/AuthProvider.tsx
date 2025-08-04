'use client';
import { ReactNode, useEffect, useState } from 'react';
import { getAuth } from 'firebase/auth';
import { app } from '@/firebase/config';
import { useRouter } from 'next/navigation';

export default function AuthProvider({ 
  children,
  requireAuth = false 
}: { 
  children: ReactNode;
  requireAuth?: boolean;
}) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const auth = getAuth(app);
    const unsubscribe = auth.onIdTokenChanged(async (user) => {
      setIsLoading(true);
      
      if (user) {
        // User is logged in
        const token = await user.getIdToken();
        localStorage.setItem('idToken', token);
        setIsAuthenticated(true);
        
        // Jika di halaman auth tapi sudah login, redirect ke beranda
        if (window.location.pathname.startsWith('/auth')) {
          router.push('/beranda');
        }
      } else {
        // User is not logged in
        localStorage.removeItem('idToken');
        setIsAuthenticated(false);
        
        // Jika requireAuth true dan tidak ada user, redirect ke login
        if (requireAuth && !window.location.pathname.startsWith('/auth')) {
          router.push('/auth/login');
        }
      }
      
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [router, requireAuth]);

  // Tampilkan loading state saat memeriksa auth status
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Jika halaman membutuhkan auth tapi user tidak login
  if (requireAuth && !isAuthenticated) {
    return null; // Redirect sudah ditangani oleh useEffect
  }

  return <>{children}</>;
}