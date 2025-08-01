import { useEffect } from 'react';
import { getAuth } from 'firebase/auth';
import { app } from '@/firebase/config';

export function useTokenRefresh() {
  useEffect(() => {
    const auth = getAuth(app);
    let refreshInterval: NodeJS.Timeout;

    const setupRefresh = async () => {
      const user = auth.currentUser;
      if (user) {
        // Set interval untuk refresh token setiap 55 menit
        refreshInterval = setInterval(async () => {
          try {
            const freshToken = await user.getIdToken(true);
            localStorage.setItem('idToken', freshToken);
          } catch (error) {
            console.error('Gagal merefresh token:', error);
            clearInterval(refreshInterval);
          }
        }, 55 * 60 * 1000); // 55 menit
      }
    };

    // Setup listener untuk perubahan auth state
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) setupRefresh();
    });

    return () => {
      clearInterval(refreshInterval);
      unsubscribe();
    };
  }, []);
}