'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { dashboardAPI } from '@/lib/api';
import {
  LayoutDashboard, TrendingUp, Target, FileText, Code2,
  Mic, Briefcase, ArrowRight, Award, Zap, Clock, ChevronRight,
  BarChart3, BookOpen, CheckCircle2
} from 'lucide-react';

export default function DashboardPage() {
  const { user, token, isLoading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<any>(null);
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    if (!isLoading && !user) router.push('/login');
  }, [user, isLoading, router]);

  useEffect(() => {
    if (token) {
      dashboardAPI.stats(token)
        .then(data => setStats(data))
        .catch(() => setStats(null))
        .finally(() => setLoadingStats(false));
    }
  }, [token]);

  if (isLoading || !user) return <div className="loading-page"><div className="spinner" /><span>Loading...</span></div>;

  const readiness = stats?.career_readiness_score ?? 72;
  const skillCoverage = stats?.skill_coverage ?? 68;
  const resumeScore = stats?.resume_score ?? 78;
  const interviewScore = stats?.interview_avg ?? 65;

  const quickActions = [
    { icon: FileText, label: 'Upload Resume', href: '/resumes', color: 'var(--accent-cyan)', bg: 'hsla(190, 95%, 50%, 0.12)' },
    { icon: Target, label: 'Skill Analysis', href: '/skills', color: 'var(--accent-violet)', bg: 'hsla(265, 89%, 66%, 0.12)' },
    { icon: Code2, label: 'Assessments', href: '/assessments', color: 'var(--accent-emerald)', bg: 'hsla(152, 76%, 48%, 0.12)' },
    { icon: Mic, label: 'Mock Interview', href: '/interviews', color: 'var(--accent-amber)', bg: 'hsla(38, 92%, 50%, 0.12)' },
    { icon: Briefcase, label: 'Job Matches', href: '/jobs', color: 'var(--accent-rose)', bg: 'hsla(350, 89%, 60%, 0.12)' },
    { icon: BookOpen, label: 'Roadmap', href: '/roadmap', color: 'var(--accent-cyan)', bg: 'hsla(190, 95%, 50%, 0.12)' },
  ];

  const recommendations = stats?.recommendations ?? [
    'Upload your resume to get a personalized skill gap analysis',
    'Complete a coding assessment to benchmark your abilities',
    'Try a mock interview to practice for your target role',
  ];

  return (
    <div className="page-container animate-in">
      {/* Welcome Header */}
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <LayoutDashboard size={20} style={{ color: 'var(--accent-cyan)' }} />
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Dashboard</span>
          </div>
          <h1 className="page-title">Welcome back, <span className="gradient-text">{user.full_name?.split(' ')[0]}</span></h1>
          <p className="page-subtitle">Track your career readiness and progress across all modules.</p>
        </div>
        <div className="badge badge-primary">
          <Award size={14} /> {user.role?.toUpperCase()}
        </div>
      </div>

      {/* Score Cards */}
      <div className="grid-4" style={{ marginBottom: '2rem' }}>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'hsla(190, 95%, 50%, 0.12)', color: 'var(--accent-cyan)' }}>
            <TrendingUp size={20} />
          </div>
          <div className="stat-label">Career Readiness</div>
          <div className="stat-value" style={{ color: 'var(--accent-cyan)' }}>{readiness}%</div>
          <div style={{ marginTop: '8px' }}>
            <div className="progress-bar-container">
              <div className="progress-bar-fill progress-cyan" style={{ width: `${readiness}%` }} />
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'hsla(265, 89%, 66%, 0.12)', color: 'var(--accent-violet)' }}>
            <Target size={20} />
          </div>
          <div className="stat-label">Skill Coverage</div>
          <div className="stat-value" style={{ color: 'var(--accent-violet)' }}>{skillCoverage}%</div>
          <div style={{ marginTop: '8px' }}>
            <div className="progress-bar-container">
              <div className="progress-bar-fill progress-violet" style={{ width: `${skillCoverage}%` }} />
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'hsla(152, 76%, 48%, 0.12)', color: 'var(--accent-emerald)' }}>
            <FileText size={20} />
          </div>
          <div className="stat-label">Resume Score</div>
          <div className="stat-value" style={{ color: 'var(--accent-emerald)' }}>{resumeScore}</div>
          <div style={{ marginTop: '8px' }}>
            <div className="progress-bar-container">
              <div className="progress-bar-fill progress-emerald" style={{ width: `${resumeScore}%` }} />
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'hsla(38, 92%, 50%, 0.12)', color: 'var(--accent-amber)' }}>
            <Mic size={20} />
          </div>
          <div className="stat-label">Interview Score</div>
          <div className="stat-value" style={{ color: 'var(--accent-amber)' }}>{interviewScore}</div>
          <div style={{ marginTop: '8px' }}>
            <div className="progress-bar-container">
              <div className="progress-bar-fill progress-amber" style={{ width: `${interviewScore}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions + Recommendations */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
        {/* Quick Actions */}
        <div>
          <h2 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Zap size={18} style={{ color: 'var(--accent-amber)' }} /> Quick Actions
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
            {quickActions.map(action => (
              <Link key={action.href} href={action.href} style={{ textDecoration: 'none' }}>
                <div className="glass-panel" style={{ padding: '1.25rem', cursor: 'pointer' }}>
                  <div style={{
                    width: '40px', height: '40px', borderRadius: 'var(--radius-sm)',
                    background: action.bg, color: action.color,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '10px'
                  }}>
                    <action.icon size={20} />
                  </div>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '4px' }}>{action.label}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.78rem', color: action.color }}>
                    Open <ChevronRight size={12} />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Recommendations */}
        <div>
          <h2 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <BarChart3 size={18} style={{ color: 'var(--accent-emerald)' }} /> Next Steps
          </h2>
          <div className="glass-panel-static" style={{ padding: '1.25rem' }}>
            {recommendations.map((rec: string, i: number) => (
              <div key={i} style={{
                display: 'flex', gap: '10px', padding: '10px 0',
                borderBottom: i < recommendations.length - 1 ? '1px solid var(--border-subtle)' : 'none',
                alignItems: 'flex-start'
              }}>
                <CheckCircle2 size={16} style={{ color: 'var(--accent-cyan)', flexShrink: 0, marginTop: '2px' }} />
                <span style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{rec}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
