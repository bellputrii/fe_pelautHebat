// src/app/lib/api.ts
import { getAuth } from 'firebase/auth';
import { app } from '@/firebase/config';

export async function authFetch(input: RequestInfo, init?: RequestInit) {
  const auth = getAuth(app);
  
  try {
    // Get current token from localStorage
    let token = localStorage.getItem('idToken');
    
    // First attempt with current token
    let response = await fetch(input, {
      ...init,
      headers: {
        ...init?.headers,
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    // If unauthorized (401), try refreshing token
    if (response.status === 401) {
      try {
        const freshToken = await auth.currentUser?.getIdToken(true);
        if (!freshToken) throw new Error('Failed to refresh token');
        
        // Store new token
        localStorage.setItem('idToken', freshToken);
        
        // Retry request with new token
        response = await fetch(input, {
          ...init,
          headers: {
            ...init?.headers,
            'Authorization': `Bearer ${freshToken}`,
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        });
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
        throw new Error('Session expired. Please login again.');
      }
    }

    // Handle response
    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch {
        errorData = { message: response.statusText };
      }
      
      const error = new Error(errorData.message || 'Request failed');
      (error as any).status = response.status;
      (error as any).data = errorData;
      
      throw error;
    }

    return response;
  } catch (error) {
    console.error('API error:', error);
    throw error;
  }
}

// Helper function to get access token (used by other parts of the app)
export async function getAccessToken(): Promise<string> {
  const auth = getAuth(app);
  try {
    // Get current user token
    const token = await auth.currentUser?.getIdToken();
    if (!token) throw new Error('No authenticated user');
    return token;
  } catch (error) {
    console.error('Failed to get access token:', error);
    throw error;
  }
}