'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { LogIn, Mail, Lock, AlertCircle, Sparkles } from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const u = await login(email, password);
      const r = u?.role?.toUpperCase();
      if (r === 'RECRUITER') router.push('/recruiter');
      else if (r === 'ADMIN') router.push('/admin');
      else router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card animate-in">
        <div style={{ textAlign: 'center', marginBottom: '2rem', position: 'relative' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
            <div style={{
              width: '56px', height: '56px', borderRadius: 'var(--radius-md)',
              background: 'var(--gradient-primary)', display: 'flex',
              alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow-glow)'
            }}>
              <Sparkles size={28} color="#fff" />
            </div>
          </div>
          <h1 className="auth-title">Welcome Back</h1>
          <p className="auth-subtitle">Sign in to your SkillBridge AI account</p>
        </div>

        {error && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '10px 14px', borderRadius: 'var(--radius-sm)',
            background: 'hsla(350, 89%, 60%, 0.1)', border: '1px solid hsla(350, 89%, 60%, 0.3)',
            color: 'var(--accent-rose)', fontSize: '0.85rem', marginBottom: '1.25rem',
            position: 'relative'
          }}>
            <AlertCircle size={16} /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ position: 'relative' }}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input type="email" className="form-input" style={{ paddingLeft: '40px' }}
                placeholder="you@university.edu" value={email}
                onChange={e => setEmail(e.target.value)} required />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input type="password" className="form-input" style={{ paddingLeft: '40px' }}
                placeholder="••••••••" value={password}
                onChange={e => setPassword(e.target.value)} required />
            </div>
          </div>

          <button type="submit" className="btn-primary" disabled={loading}
            style={{ width: '100%', marginTop: '0.5rem' }}>
            {loading ? <><div className="spinner" style={{ width: 18, height: 18 }} /> Signing in...</>
              : <><LogIn size={18} /> Sign In</>}
          </button>
        </form>

        <div className="auth-footer">
          Don't have an account? <Link href="/register">Create one</Link>
        </div>
      </div>
    </div>
  );
}
