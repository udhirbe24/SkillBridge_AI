'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { UserPlus, Mail, Lock, User, AlertCircle, Sparkles } from 'lucide-react';

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (password.length < 8) { setError('Password must be at least 8 characters'); return; }
    setLoading(true);
    try {
      const u = await register(email, password, fullName, role.toUpperCase());
      const r = u?.role?.toUpperCase();
      if (r === 'RECRUITER') router.push('/recruiter');
      else if (r === 'ADMIN') router.push('/admin');
      else router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Registration failed');
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
          <h1 className="auth-title">Create Account</h1>
          <p className="auth-subtitle">Join SkillBridge AI and accelerate your career</p>
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
            <label className="form-label">Full Name</label>
            <div style={{ position: 'relative' }}>
              <User size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input type="text" className="form-input" style={{ paddingLeft: '40px' }}
                placeholder="Jane Doe" value={fullName}
                onChange={e => setFullName(e.target.value)} required />
            </div>
          </div>

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
                placeholder="Min. 8 characters" value={password}
                onChange={e => setPassword(e.target.value)} required minLength={8} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">I am a...</label>
            <div style={{ display: 'flex', gap: '10px' }}>
              {['student', 'recruiter'].map(r => (
                <button key={r} type="button"
                  onClick={() => setRole(r)}
                  style={{
                    flex: 1, padding: '10px', borderRadius: 'var(--radius-sm)',
                    background: role === r ? 'hsla(265, 89%, 66%, 0.15)' : 'var(--bg-input)',
                    border: `1px solid ${role === r ? 'hsla(265, 89%, 66%, 0.5)' : 'var(--border-subtle)'}`,
                    color: role === r ? 'var(--accent-violet)' : 'var(--text-muted)',
                    fontWeight: role === r ? 600 : 400,
                    cursor: 'pointer', fontFamily: 'var(--font-body)',
                    fontSize: '0.9rem', textTransform: 'capitalize', transition: 'all 0.2s'
                  }}>
                  {r}
                </button>
              ))}
            </div>
          </div>

          <button type="submit" className="btn-primary" disabled={loading}
            style={{ width: '100%', marginTop: '0.5rem' }}>
            {loading ? <><div className="spinner" style={{ width: 18, height: 18 }} /> Creating account...</>
              : <><UserPlus size={18} /> Create Account</>}
          </button>
        </form>

        <div className="auth-footer">
          Already have an account? <Link href="/login">Sign in</Link>
        </div>
      </div>
    </div>
  );
}
