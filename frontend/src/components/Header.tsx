'use client';

import React, { useEffect, useState } from 'react';
import { Cpu, ShieldCheck, Sparkles, Activity } from 'lucide-react';

export default function Header() {
  const [apiOnline, setApiOnline] = useState<boolean | null>(null);

  useEffect(() => {
    fetch('http://localhost:8000/api/v1/health')
      .then((res) => res.json())
      .then((data) => setApiOnline(data.status === 'online'))
      .catch(() => setApiOnline(false));
  }, []);

  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 50,
      background: 'hsla(222, 47%, 7%, 0.85)',
      backdropFilter: 'blur(16px)',
      borderBottom: '1px solid var(--border-subtle)',
      padding: '1rem 2rem',
    }}>
      <div style={{
        maxWidth: '1280px',
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        {/* Brand Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: 'var(--radius-md)',
            background: 'var(--gradient-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: 'var(--shadow-glow)'
          }}>
            <Cpu size={24} color="#ffffff" />
          </div>
          <div>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>
              SkillBridge <span className="gradient-text">AI</span>
            </h1>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>
              University Enterprise Platform v1.0
            </p>
          </div>
        </div>

        {/* Navigation Links */}
        <nav style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
          <a href="#overview" style={{ color: 'var(--text-primary)', textDecoration: 'none', fontWeight: 500, fontSize: '0.9rem' }}>Overview</a>
          <a href="#modules" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontWeight: 500, fontSize: '0.9rem' }}>Core Modules</a>
          <a href="#rag-audit" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontWeight: 500, fontSize: '0.9rem' }}>RAG Evaluator</a>
          <a href="#docs" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontWeight: 500, fontSize: '0.9rem' }}>Architecture Docs</a>
        </nav>

        {/* Live System Status Badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div className={apiOnline ? "badge badge-success" : apiOnline === false ? "badge badge-warning" : "badge badge-primary"}>
            <Activity size={14} />
            {apiOnline === true ? "Backend Online (200 OK)" : apiOnline === false ? "Backend Standby" : "Connecting..."}
          </div>
        </div>
      </div>
    </header>
  );
}
