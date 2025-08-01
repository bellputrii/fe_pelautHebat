import { getAuth } from 'firebase/auth';
import { app } from '@/firebase/config';

export async function authFetch(url: string, options: RequestInit = {}) {
  const auth = getAuth(app);
  
  try {
    // 1. Coba request dengan token saat ini
    let token = localStorage.getItem('idToken');
    let response = await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        'Authorization': `Bearer ${token}`
      }
    });

    // 2. Jika token expired (401), refresh dan coba lagi
    if (response.status === 401) {
      const freshToken = await auth.currentUser?.getIdToken(true);
      if (!freshToken) throw new Error('Failed to refresh token');
      
      localStorage.setItem('idToken', freshToken);
      response = await fetch(url, {
        ...options,
        headers: {
          ...options.headers,
          'Authorization': `Bearer ${freshToken}`
        }
      });
    }

    // 3. Jika masih error setelah refresh
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Request failed');
    }

    return response;
  } catch (error) {
    console.error('API error:', error);
    throw error;
  }
}