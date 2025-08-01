'use client';
import { ReactNode, useEffect } from 'react';
import { getAuth } from 'firebase/auth';
import { app } from '@/firebase/config';
import { useRouter } from 'next/navigation';

export default function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    const auth = getAuth(app);
    const unsubscribe = auth.onIdTokenChanged(async (user) => {
      if (user) {
        const token = await user.getIdToken();
        localStorage.setItem('idToken', token);
      } else {
        localStorage.removeItem('idToken');
        router.push('/auth/login');
      }
    });

    return () => unsubscribe();
  }, [router]);

  return <>{children}</>;
}