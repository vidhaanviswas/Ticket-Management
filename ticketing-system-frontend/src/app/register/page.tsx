'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { authAPI } from '@/lib/api';
import Link from 'next/link';
import styles from './page.module.css';

export default function RegisterPage() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authAPI.register(username, email, password);
      login(response.token, {
        id: response.userId,
        username: response.username,
        email: email,
        role: response.role,
      });
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className={styles.page}>
      <section className={styles.card} aria-label="Register">
        <header className={styles.brand}>
          <div className={styles.title}>Create your account</div>
          <div className={styles.subtitle}>
            Sign up to create tickets and track resolutions.
          </div>
        </header>

        {error && (
          <div className={styles.error} role="alert" aria-live="polite">
            {error}
          </div>
        )}

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="username">
              Username
            </label>
            <input
              id="username"
              className={styles.input}
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              disabled={loading}
              autoComplete="username"
              placeholder="e.g. Sam"
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="email">
              Email
            </label>
            <input
              id="email"
              className={styles.input}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
              autoComplete="email"
              placeholder="sam@example.com"
            />
          </div>

          <div className={styles.field}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <label className={styles.label} htmlFor="password">
                Password
              </label>
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                aria-pressed={showPassword}
                disabled={loading}
                style={{
                  background: 'transparent',
                  border: 'none',
                  padding: 0,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontSize: 16,
                  lineHeight: 1,
                }}
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
            <input
              id="password"
              className={styles.input}
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
              autoComplete="new-password"
              placeholder="Create a strong password"
            />
          </div>

          <div className={styles.actions}>
            <button type="submit" className={styles.button} disabled={loading}>
              {loading ? 'Creating account…' : 'Create account'}
            </button>
          </div>
        </form>

        <div className={styles.meta}>
          Already have an account?{' '}
          <Link className={styles.link} href="/login">
            Login
          </Link>
        </div>
      </section>
    </main>
  );
}
