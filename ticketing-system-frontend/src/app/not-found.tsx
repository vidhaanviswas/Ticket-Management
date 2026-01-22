'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import styles from './not-found.module.css';

export default function NotFound() {
  const router = useRouter();

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.content}>
          <div className={styles.errorCode}>404</div>
          <h1 className={styles.title}>Page Not Found</h1>
          <p className={styles.subtitle}>
            Oops! The page you&apos;re looking for doesn&apos;t exist or has been moved.
          </p>
          
          <div className={styles.illustration}>
            <div className={styles.icon}>🔍</div>
          </div>

          <div className={styles.actions}>
            <button 
              onClick={() => router.back()} 
              className={styles.buttonSecondary}
            >
              ← Go Back
            </button>
            <Link href="/dashboard" className={styles.button}>
              Go to Dashboard
            </Link>
          </div>

          <div className={styles.links}>
            <Link href="/" className={styles.link}>Home</Link>
            <span className={styles.separator}>•</span>
            <Link href="/tickets" className={styles.link}>Tickets</Link>
            <span className={styles.separator}>•</span>
            <Link href="/login" className={styles.link}>Login</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
