'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import styles from './error.module.css';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  const router = useRouter();

  useEffect(() => {
    // Log error to console for debugging
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.content}>
          <div className={styles.errorIcon}>⚠️</div>
          <h1 className={styles.title}>Something went wrong!</h1>
          <p className={styles.subtitle}>
            We encountered an unexpected error. Don&apos;t worry, our team has been notified.
          </p>

          {process.env.NODE_ENV === 'development' && error.message && (
            <div className={styles.errorDetails}>
              <details>
                <summary className={styles.errorSummary}>Error Details (Development Only)</summary>
                <pre className={styles.errorMessage}>{error.message}</pre>
                {error.stack && (
                  <pre className={styles.errorStack}>{error.stack}</pre>
                )}
              </details>
            </div>
          )}

          <div className={styles.actions}>
            <button 
              onClick={reset} 
              className={styles.button}
            >
              Try Again
            </button>
            <button 
              onClick={() => router.back()} 
              className={styles.buttonSecondary}
            >
              ← Go Back
            </button>
          </div>

          <div className={styles.links}>
            <Link href="/dashboard" className={styles.link}>Go to Dashboard</Link>
            <span className={styles.separator}>•</span>
            <Link href="/" className={styles.link}>Home</Link>
            <span className={styles.separator}>•</span>
            <Link href="/tickets" className={styles.link}>Tickets</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
