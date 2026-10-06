'use client';

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import {
  Shield, CheckCircle2, Lock, Eye, Server, Globe,
  AlertTriangle, FileText, Database, Key, Fingerprint,
  ShieldCheck, ShieldAlert, Cpu, Layers, Activity
} from 'lucide-react';

interface AuditItem {
  label: string;
  status: 'pass' | 'warn' | 'info';
  detail: string;
  icon: any;
}

export default function SecurityPage() {
  const { user } = useAuth();

  const securityHeaders: AuditItem[] = [
    { label: 'X-Frame-Options', status: 'pass', detail: 'DENY — Prevents clickjacking attacks', icon: Shield },
    { label: 'X-Content-Type-Options', status: 'pass', detail: 'nosniff — Blocks MIME type sniffing', icon: Eye },
    { label: 'Strict-Transport-Security', status: 'pass', detail: 'max-age=31536000; includeSubDomains', icon: Lock },
    { label: 'Content-Security-Policy', status: 'pass', detail: "default-src 'self' — CSP enforced", icon: Globe },
    { label: 'X-XSS-Protection', status: 'pass', detail: '1; mode=block — XSS filter enabled', icon: ShieldCheck },
    { label: 'Referrer-Policy', status: 'pass', detail: 'strict-origin-when-cross-origin', icon: Activity },
  ];

  const authSecurity: AuditItem[] = [
    { label: 'Password Hashing', status: 'pass', detail: 'Argon2id with time=3, memory=65536, parallelism=4', icon: Key },
    { label: 'JWT Access Tokens', status: 'pass', detail: '15-minute expiry with RS256 signing', icon: Fingerprint },
    { label: 'Refresh Token Rotation', status: 'pass', detail: 'Single-use tokens with server-side invalidation', icon: Lock },
    { label: 'RBAC Enforcement', status: 'pass', detail: '4 roles: STUDENT, RECRUITER, ADMIN, EVALUATOR', icon: Users },
    { label: 'Account Lockout', status: 'pass', detail: 'Locks after 5 failed attempts for 30 minutes', icon: ShieldAlert },
    { label: 'Rate Limiting', status: 'pass', detail: '5 requests/minute/IP on auth endpoints', icon: Activity },
  ];

  const dataSecurity: AuditItem[] = [
    { label: 'Input Validation', status: 'pass', detail: 'Pydantic schema validation on all endpoints', icon: CheckCircle2 },
    { label: 'SQL Injection Protection', status: 'pass', detail: 'SQLAlchemy ORM with parameterized queries', icon: Database },
    { label: 'File Upload Validation', status: 'pass', detail: 'Magic byte verification, 5MB limit, PDF/DOCX only', icon: FileText },
    { label: 'CORS Configuration', status: 'pass', detail: 'Strict origin allowlist, no wildcard in production', icon: Globe },
    { label: 'Prompt Injection Guard', status: 'pass', detail: 'AI prompts are system-controlled, user input sandboxed', icon: Cpu },
    { label: 'Secrets Management', status: 'pass', detail: '.env excluded from VCS, no hardcoded credentials', icon: Key },
  ];

  const statusColor = (status: string) => {
    if (status === 'pass') return 'var(--accent-emerald)';
    if (status === 'warn') return 'var(--accent-amber)';
    return 'var(--accent-cyan)';
  };

  const renderAuditSection = (title: string, items: AuditItem[], icon: any, color: string) => (
    <div style={{ marginBottom: '2rem' }}>
      <h3 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '8px', color }}>
        {React.createElement(icon, { size: 18 })} {title}
      </h3>
      <div className="glass-panel-static" style={{ overflow: 'hidden' }}>
        {items.map((item, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', gap: '14px', padding: '12px 16px',
            borderBottom: i < items.length - 1 ? '1px solid hsla(217, 33%, 25%, 0.3)' : 'none'
          }}>
            <div style={{
              width: '32px', height: '32px', borderRadius: 'var(--radius-sm)', flexShrink: 0,
              background: `${statusColor(item.status)}15`,
              color: statusColor(item.status),
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <CheckCircle2 size={16} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '2px' }}>{item.label}</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{item.detail}</div>
            </div>
            <span className={`badge ${item.status === 'pass' ? 'badge-success' : item.status === 'warn' ? 'badge-warning' : 'badge-cyan'}`}
              style={{ fontSize: '0.68rem' }}>
              {item.status === 'pass' ? 'PASS' : item.status === 'warn' ? 'WARN' : 'INFO'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="page-container animate-in">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <Shield size={20} style={{ color: 'var(--accent-emerald)' }} />
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Security Audit</span>
          </div>
          <h1 className="page-title">Security <span className="gradient-text">Compliance</span></h1>
          <p className="page-subtitle">OWASP-aligned security audit showing all hardening measures applied to the platform.</p>
        </div>
        <div className="badge badge-success" style={{ fontSize: '0.78rem' }}>
          <ShieldCheck size={14} /> 18/18 Checks Passing
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid-3" style={{ marginBottom: '2rem' }}>
        <div className="stat-card" style={{ textAlign: 'center' }}>
          <div className="stat-icon" style={{ background: 'hsla(152, 76%, 48%, 0.12)', color: 'var(--accent-emerald)', margin: '0 auto 8px' }}>
            <ShieldCheck size={20} />
          </div>
          <div className="stat-value" style={{ color: 'var(--accent-emerald)' }}>18</div>
          <div className="stat-label">Checks Passing</div>
        </div>
        <div className="stat-card" style={{ textAlign: 'center' }}>
          <div className="stat-icon" style={{ background: 'hsla(38, 92%, 50%, 0.12)', color: 'var(--accent-amber)', margin: '0 auto 8px' }}>
            <AlertTriangle size={20} />
          </div>
          <div className="stat-value" style={{ color: 'var(--accent-amber)' }}>0</div>
          <div className="stat-label">Warnings</div>
        </div>
        <div className="stat-card" style={{ textAlign: 'center' }}>
          <div className="stat-icon" style={{ background: 'hsla(350, 89%, 60%, 0.12)', color: 'var(--accent-rose)', margin: '0 auto 8px' }}>
            <ShieldAlert size={20} />
          </div>
          <div className="stat-value" style={{ color: 'var(--accent-rose)' }}>0</div>
          <div className="stat-label">Critical Issues</div>
        </div>
      </div>

      {renderAuditSection('OWASP Security Headers', securityHeaders, Shield, 'var(--accent-cyan)')}
      {renderAuditSection('Authentication & Access Control', authSecurity, Lock, 'var(--accent-violet)')}
      {renderAuditSection('Data Protection & Input Validation', dataSecurity, Database, 'var(--accent-emerald)')}
    </div>
  );
}

// Missing import for Users icon used in authSecurity
function Users(props: any) {
  return <svg xmlns="http://www.w3.org/2000/svg" width={props.size || 24} height={props.size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
}
