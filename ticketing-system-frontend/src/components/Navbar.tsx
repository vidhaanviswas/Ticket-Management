'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { usePathname, useRouter } from 'next/navigation';
import styles from './Navbar.module.css';

export default function Navbar() {
  const { user, logout, isAdmin, isSupportAgent } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard';
    if (href === '/tickets') return pathname === '/tickets' || pathname.startsWith('/tickets/');
    if (href === '/admin') return pathname === '/admin';
    return pathname === href;
  };

  return (
    <nav className={styles.navbar}>
      <div className={styles.inner}>
        <Link className={styles.brand} href="/dashboard" aria-label="Ticketing System home">
          <span className={styles.logo} aria-hidden="true" />
          Ticketing System
        </Link>

        {user && (
          <div className={styles.right}>
            <div className={styles.welcome} title={`Welcome, ${user.username}`}>
              Welcome, {user.username}
            </div>

            <div className={styles.links} aria-label="Primary navigation">
              <Link
                className={[styles.link, isActive('/dashboard') ? styles.linkActive : ''].join(' ')}
                href="/dashboard"
              >
                Dashboard
              </Link>

              {isSupportAgent() && (
                <Link
                  className={[styles.link, isActive('/tickets') ? styles.linkActive : ''].join(' ')}
                  href="/tickets"
                >
                  Tickets
                </Link>
              )}

              {isAdmin() && (
                <Link
                  className={[styles.link, isActive('/admin') ? styles.linkActive : ''].join(' ')}
                  href="/admin"
                >
                  Admin
                </Link>
              )}
            </div>

            <button type="button" className={styles.logout} onClick={handleLogout}>
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
