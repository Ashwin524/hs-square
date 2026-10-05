'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api, setToken } from '@/lib/api';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const { accessToken } = await api.loginAdmin(email, password);
      setToken(accessToken);
      router.push('/tenants');
    } catch (err: any) {
      setError(err.message ?? 'Sign-in failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#0F172A',
        padding: 20,
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 380,
          background: '#FFFFFF',
          borderRadius: 6,
          padding: '30px 28px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 22 }}>
          <span style={{ width: 10, height: 10, background: '#2563EB' }} />
          <span style={{ fontWeight: 700, fontSize: 17 }}>HS-Square Technologies</span>
        </div>
        <p style={{ color: '#64748B', fontSize: 13, margin: '0 0 18px' }}>Platform Admin sign-in.</p>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 6 }}>Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={inputStyle}
              placeholder="[email protected]"
            />
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 6 }}>Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={inputStyle}
              placeholder="••••••••"
            />
          </div>

          {error && <div style={{ color: '#DC2626', fontSize: 12, marginBottom: 14 }}>{error}</div>}

          <button type="submit" disabled={loading} style={submitStyle}>
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <p style={{ fontSize: 11, color: '#64748B', marginTop: 14, textAlign: 'center' }}>
          Use the Platform Admin account created by <code>npx prisma db seed</code>.
        </p>
      </div>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  fontSize: 13.5,
  padding: '9px 12px',
  border: '1px solid #E2E8F0',
  borderRadius: 3,
  background: '#F8FAFC',
  color: '#0F172A',
  boxSizing: 'border-box',
};

const submitStyle: React.CSSProperties = {
  width: '100%',
  padding: 11,
  fontWeight: 600,
  fontSize: 13,
  borderRadius: 3,
  border: 'none',
  background: '#0F172A',
  color: '#F8FAFC',
  cursor: 'pointer',
};
