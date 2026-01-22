'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import styles from './page.module.css';

export default function Home() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (user) {
        router.push('/dashboard');
      } else {
        router.push('/login');
      }
    }
  }, [user, loading, router]);

  return (
    <main className={styles.page}>
      <section className={styles.card} aria-label="Loading">
        <div className={styles.row}>
          <div className={styles.spinner} aria-hidden="true" />
          <div>
            <div className={styles.title}>Loading your workspace</div>
            <div className={styles.subtitle}>Checking your session…</div>
          </div>
        </div>

        <div className={styles.skeletonGroup} aria-hidden="true">
          <div className={[styles.skeletonLine, styles.w100].join(' ')} />
          <div className={[styles.skeletonLine, styles.w80].join(' ')} />
          <div className={[styles.skeletonLine, styles.w60].join(' ')} />
        </div>
      </section>
    </main>
  );
}
