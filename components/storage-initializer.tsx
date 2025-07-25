'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export function StorageInitializer() {
  const router = useRouter();

  useEffect(() => {
    // Only run on client-side and in production
    if (process.env.NODE_ENV === 'production') {
      const initializeStorage = async () => {
        try {
          const response = await fetch('/api/init-storage', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
          });
          
          const data = await response.json();
          
          if (!response.ok) {
            console.error('Failed to initialize storage:', data.message);
            return;
          }
          
          console.log('Storage initialized:', data.message);
        } catch (error) {
          console.error('Error initializing storage:', error);
        }
      };

      initializeStorage();
    }
  }, []);

  return null;
}
