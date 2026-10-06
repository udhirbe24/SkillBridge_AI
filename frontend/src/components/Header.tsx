'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import {
  Cpu, Activity, LogOut, User, Menu, X,
  LayoutDashboard, FileText, Target, Map,
  Code2, Mic, Briefcase, ChevronDown,
  Users as UsersIcon, Shield, ShieldCheck
} from 'lucide-react';

export default function Header() {
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const roleUpper = user?.role?.toUpperCase();

  const getNavLinks = () => {
    if (roleUpper === 'RECRUITER') {
      return [
        { href: '/recruiter', label: 'Candidate Search', icon: UsersIcon },
        { href: '/jobs', label: 'Job Postings', icon: Briefcase },
        { href: '/security', label: 'Security Audit', icon: Shield },
      ];
    }
    if (roleUpper === 'ADMIN') {
      return [
        { href: '/admin', label: 'Admin Control', icon: ShieldCheck },
        { href: '/recruiter', label: 'Recruiter Portal', icon: UsersIcon },
        { href: '/assessments', label: 'Assessments', icon: Code2 },
        { href: '/security', label: 'Security Audit', icon: Shield },
      ];
    }
    // Default: STUDENT
    return [
      { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { href: '/resumes', label: 'Resumes', icon: FileText },
      { href: '/skills', label: 'Skills', icon: Target },
      { href: '/roadmap', label: 'Roadmap', icon: Map },
      { href: '/assessments', label: 'Assessments', icon: Code2 },
      { href: '/interviews', label: 'Interviews', icon: Mic },
      { href: '/jobs', label: 'Jobs', icon: Briefcase },
      { href: '/security', label: 'Security', icon: Shield },
    ];
  };

  const navLinks = getNavLinks();

  return (
    <header className="app-header">
      <div className="header-inner">
        {/* Brand */}
        <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div className="brand-icon">
            <Cpu size={22} color="#fff" />
          </div>
          <div>
            <h1 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
              SkillBridge <span className="gradient-text">AI</span>
            </h1>
            <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', margin: 0 }}>Career Intelligence Platform</p>
          </div>
        </Link>

        {/* Desktop Nav */}
        {user && (
          <nav className="desktop-nav">
            {navLinks.map(link => (
              <Link key={link.href} href={link.href} className="nav-link">
                <link.icon size={15} />
                {link.label}
              </Link>
            ))}
          </nav>
        )}

        {/* Right Section */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {user ? (
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="profile-btn"
              >
                <div className="avatar-circle">
                  {user.full_name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <span className="profile-name">{user.full_name}</span>
                <ChevronDown size={14} style={{ opacity: 0.6 }} />
              </button>
              {profileOpen && (
                <div className="dropdown-menu">
                  <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-subtle)' }}>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{user.full_name}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{user.email}</div>
                    <div className="badge badge-primary" style={{ marginTop: '6px', fontSize: '0.7rem' }}>
                      {user.role?.toUpperCase()}
                    </div>
                  </div>
                  <button onClick={() => { logout(); setProfileOpen(false); }} className="dropdown-item danger">
                    <LogOut size={14} /> Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '10px' }}>
              <Link href="/login" className="btn-ghost">Sign In</Link>
              <Link href="/register" className="btn-primary-sm">Get Started</Link>
            </div>
          )}

          {/* Mobile Toggle */}
          {user && (
            <button className="mobile-toggle" onClick={() => setMobileOpen(!mobileOpen)}>
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          )}
        </div>
      </div>

      {/* Mobile Nav */}
      {mobileOpen && user && (
        <nav className="mobile-nav">
          {navLinks.map(link => (
            <Link key={link.href} href={link.href} className="mobile-nav-link"
              onClick={() => setMobileOpen(false)}>
              <link.icon size={18} />
              {link.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
