'use client';

import { Toaster } from 'react-hot-toast';

export default function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 3500,
        style: {
          background: 'rgba(15, 23, 42, 0.92)',
          color: '#fff',
          borderRadius: '12px',
          padding: '12px 14px',
          boxShadow: '0 12px 30px rgba(2, 6, 23, 0.25)',
        },
      }}
    />
  );
}

