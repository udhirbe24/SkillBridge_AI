'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { dashboardAPI } from '@/lib/api';
import {
  BarChart3, TrendingUp, Target, FileText, Code2, Mic,
  Briefcase, Award, Zap, ChevronRight, Activity, Layers,
  ArrowUpRight, ArrowDownRight, Minus, PieChart, LineChart,
  Brain, Shield, BookOpen, Clock, CheckCircle2, AlertTriangle
} from 'lucide-react';

interface PillarScore {
  label: string;
  score: number;
  weight: number;
  color: string;
  bg: string;
  icon: any;
  description: string;
}

export default function AnalyticsPage() {
  const { user, token, isLoading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<any>(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [activeView, setActiveView] = useState<'overview' | 'skills' | 'progress'>('overview');

  useEffect(() => { if (!isLoading && !user) router.push('/login'); }, [user, isLoading, router]);

  useEffect(() => {
    if (token) {
      dashboardAPI.stats(token)
        .then(data => setStats(data))
        .catch(() => setStats(null))
        .finally(() => setLoadingStats(false));
    }
  }, [token]);

  if (isLoading || !user) return <div className="loading-page"><div className="spinner" /><span>Loading...</span></div>;

  // Composite career readiness scoring: 4-pillar model
  const skillGap = stats?.skill_coverage ?? 68;
  const codingScore = stats?.coding_avg ?? 72;
  const interviewScore = stats?.interview_avg ?? 65;
  const resumeScore = stats?.resume_score ?? 78;

  const compositeReadiness = Math.round(
    skillGap * 0.35 + codingScore * 0.25 + interviewScore * 0.20 + resumeScore * 0.20
  );

  const pillars: PillarScore[] = [
    { label: 'Skill Gap Coverage', score: skillGap, weight: 35, color: 'var(--accent-cyan)', bg: 'hsla(190, 95%, 50%, 0.12)', icon: Target, description: 'How well your skills match target role requirements' },
    { label: 'Coding Performance', score: codingScore, weight: 25, color: 'var(--accent-emerald)', bg: 'hsla(152, 76%, 48%, 0.12)', icon: Code2, description: 'Assessment scores across coding challenges' },
    { label: 'Interview Readiness', score: interviewScore, weight: 20, color: 'var(--accent-amber)', bg: 'hsla(38, 92%, 50%, 0.12)', icon: Mic, description: 'Mock interview performance and depth scoring' },
    { label: 'Resume Quality', score: resumeScore, weight: 20, color: 'var(--accent-violet)', bg: 'hsla(265, 89%, 66%, 0.12)', icon: FileText, description: 'ATS scoring and resume optimization level' },
  ];

  const moduleStats = [
    { label: 'Resumes Uploaded', value: stats?.resumes_count ?? 0, icon: FileText, color: 'var(--accent-cyan)' },
    { label: 'Assessments Done', value: stats?.assessments_count ?? 0, icon: Code2, color: 'var(--accent-emerald)' },
    { label: 'Interviews Done', value: stats?.interviews_count ?? 0, icon: Mic, color: 'var(--accent-amber)' },
    { label: 'Roadmap Items', value: stats?.roadmap_items ?? 0, icon: BookOpen, color: 'var(--accent-violet)' },
    { label: 'Jobs Matched', value: stats?.jobs_matched ?? 0, icon: Briefcase, color: 'var(--accent-rose)' },
    { label: 'Skills Tracked', value: stats?.skills_count ?? 0, icon: Target, color: 'var(--accent-cyan)' },
  ];

  const recommendations = stats?.recommendations ?? [
    'Complete at least 3 coding assessments to improve your coding pillar score',
    'Practice a mock interview targeting your desired role',
    'Update your resume with recently acquired skills for better ATS scoring',
    'Generate a career roadmap and start working through learning modules',
  ];

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'var(--accent-emerald)';
    if (score >= 60) return 'var(--accent-amber)';
    return 'var(--accent-rose)';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 90) return 'Excellent';
    if (score >= 80) return 'Strong';
    if (score >= 70) return 'Good';
    if (score >= 60) return 'Developing';
    return 'Needs Work';
  };

  return (
    <div className="page-container animate-in">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <BarChart3 size={20} style={{ color: 'var(--accent-cyan)' }} />
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Career Intelligence</span>
          </div>
          <h1 className="page-title">Analytics <span className="gradient-text">Dashboard</span></h1>
          <p className="page-subtitle">Comprehensive career readiness analysis with 4-pillar composite scoring.</p>
        </div>
        <div className="badge badge-primary">
          <Activity size={14} /> Real-time Metrics
        </div>
      </div>

      {/* View Tabs */}
      <div className="tab-bar" style={{ marginBottom: '2rem' }}>
        <button className={`tab-item ${activeView === 'overview' ? 'active' : ''}`} onClick={() => setActiveView('overview')}>
          <PieChart size={14} /> Overview
        </button>
        <button className={`tab-item ${activeView === 'skills' ? 'active' : ''}`} onClick={() => setActiveView('skills')}>
          <Target size={14} /> Pillar Breakdown
        </button>
        <button className={`tab-item ${activeView === 'progress' ? 'active' : ''}`} onClick={() => setActiveView('progress')}>
          <TrendingUp size={14} /> Activity & Progress
        </button>
      </div>

      {/* ===== OVERVIEW TAB ===== */}
      {activeView === 'overview' && (
        <>
          {/* Composite Readiness Hero */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.5rem', marginBottom: '2rem' }}>
            <div className="glass-panel-static" style={{
              padding: '2rem', display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', textAlign: 'center'
            }}>
              <div className="score-ring" style={{
                width: '160px', height: '160px', marginBottom: '1rem',
                background: `conic-gradient(${getScoreColor(compositeReadiness)} ${compositeReadiness * 3.6}deg, hsla(222, 40%, 15%, 0.8) 0deg)`
              }}>
                <div style={{
                  width: '130px', height: '130px', borderRadius: '50%', background: 'var(--bg-dark)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column'
                }}>
                  <span style={{ fontSize: '2.5rem', fontWeight: 800, fontFamily: 'var(--font-heading)', color: getScoreColor(compositeReadiness) }}>
                    {compositeReadiness}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Readiness
                  </span>
                </div>
              </div>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '4px' }}>Career Readiness</div>
              <div className={`badge ${compositeReadiness >= 80 ? 'badge-success' : compositeReadiness >= 60 ? 'badge-warning' : 'badge-danger'}`}>
                {getScoreLabel(compositeReadiness)}
              </div>
            </div>

            {/* 4-Pillar Bars */}
            <div className="glass-panel-static" style={{ padding: '1.5rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Layers size={16} style={{ color: 'var(--accent-violet)' }} /> Readiness Pillars
              </h3>
              {pillars.map((pillar, i) => (
                <div key={i} style={{ marginBottom: i < pillars.length - 1 ? '1.25rem' : 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <pillar.icon size={14} style={{ color: pillar.color }} />
                      <span style={{ fontSize: '0.88rem', fontWeight: 500 }}>{pillar.label}</span>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>({pillar.weight}% weight)</span>
                    </div>
                    <span style={{ fontWeight: 700, color: pillar.color, fontSize: '0.95rem' }}>{pillar.score}%</span>
                  </div>
                  <div className="progress-bar-container" style={{ height: '10px' }}>
                    <div className="progress-bar-fill" style={{ width: `${pillar.score}%`, background: pillar.color }} />
                  </div>
                </div>
              ))}

              <div style={{
                marginTop: '1.25rem', padding: '10px 14px', borderRadius: 'var(--radius-sm)',
                background: 'hsla(222, 40%, 10%, 0.6)', border: '1px solid var(--border-subtle)',
                fontSize: '0.78rem', color: 'var(--text-muted)'
              }}>
                <strong>Formula:</strong> (Skill Gap × 35%) + (Coding × 25%) + (Interview × 20%) + (Resume × 20%) = <strong style={{ color: 'var(--text-primary)' }}>{compositeReadiness}%</strong>
              </div>
            </div>
          </div>

          {/* Module Activity Counts */}
          <h3 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Activity size={16} style={{ color: 'var(--accent-emerald)' }} /> Module Activity
          </h3>
          <div className="grid-3" style={{ marginBottom: '2rem' }}>
            {moduleStats.map((stat, i) => (
              <div key={i} className="stat-card">
                <div className="stat-icon" style={{ background: `${stat.color}20`, color: stat.color }}>
                  <stat.icon size={18} />
                </div>
                <div className="stat-label">{stat.label}</div>
                <div className="stat-value" style={{ color: stat.color }}>{stat.value}</div>
              </div>
            ))}
          </div>

          {/* Smart Recommendations */}
          <h3 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Brain size={16} style={{ color: 'var(--accent-amber)' }} /> AI Recommendations
          </h3>
          <div className="glass-panel-static" style={{ padding: '1.25rem' }}>
            {recommendations.map((rec: string, i: number) => (
              <div key={i} style={{
                display: 'flex', gap: '10px', padding: '10px 0',
                borderBottom: i < recommendations.length - 1 ? '1px solid var(--border-subtle)' : 'none',
                alignItems: 'flex-start'
              }}>
                <div style={{
                  width: '24px', height: '24px', borderRadius: '50%', flexShrink: 0,
                  background: 'hsla(38, 92%, 50%, 0.12)', display: 'flex',
                  alignItems: 'center', justifyContent: 'center'
                }}>
                  <Zap size={12} style={{ color: 'var(--accent-amber)' }} />
                </div>
                <span style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{rec}</span>
              </div>
            ))}
          </div>
        </>
      )}

      {/* ===== PILLAR BREAKDOWN TAB ===== */}
      {activeView === 'skills' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
          {pillars.map((pillar, i) => (
            <div key={i} className="glass-panel-static" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1rem' }}>
                <div style={{
                  width: '44px', height: '44px', borderRadius: 'var(--radius-sm)',
                  background: pillar.bg, color: pillar.color,
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <pillar.icon size={22} />
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '1rem' }}>{pillar.label}</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Weight: {pillar.weight}%</div>
                </div>
              </div>

              <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
                <div className="score-ring" style={{
                  width: '100px', height: '100px', margin: '0 auto',
                  background: `conic-gradient(${pillar.color} ${pillar.score * 3.6}deg, hsla(222, 40%, 15%, 0.8) 0deg)`
                }}>
                  <div style={{
                    width: '80px', height: '80px', borderRadius: '50%', background: 'var(--bg-card)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column'
                  }}>
                    <span style={{ fontSize: '1.5rem', fontWeight: 800, color: pillar.color }}>{pillar.score}%</span>
                  </div>
                </div>
              </div>

              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5, textAlign: 'center' }}>
                {pillar.description}
              </p>

              <div style={{ marginTop: '1rem' }}>
                <div className="progress-bar-container" style={{ height: '6px' }}>
                  <div className="progress-bar-fill" style={{ width: `${pillar.score}%`, background: pillar.color }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  <span>0%</span>
                  <span>{getScoreLabel(pillar.score)}</span>
                  <span>100%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ===== PROGRESS TAB ===== */}
      {activeView === 'progress' && (
        <>
          <div className="glass-panel-static" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <LineChart size={16} style={{ color: 'var(--accent-cyan)' }} /> Readiness Trend
            </h3>
            {/* Simulated bar chart visualization */}
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', height: '180px', padding: '0 16px' }}>
              {[52, 58, 63, 61, 67, 70, 68, 73, compositeReadiness].map((val, i) => (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-muted)' }}>{val}%</span>
                  <div style={{
                    width: '100%', height: `${(val / 100) * 160}px`,
                    background: i === 8 ? 'var(--gradient-primary)' : 'hsla(222, 40%, 20%, 0.8)',
                    borderRadius: '4px 4px 0 0',
                    transition: 'height 0.6s ease',
                    border: i === 8 ? '1px solid var(--border-glow)' : '1px solid var(--border-subtle)'
                  }} />
                  <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>W{i + 1}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="grid-2">
            <div className="glass-panel-static" style={{ padding: '1.5rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle2 size={16} style={{ color: 'var(--accent-emerald)' }} /> Completed Actions
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {[
                  { text: 'Profile setup complete', time: 'Day 1' },
                  { text: 'First resume uploaded', time: 'Day 1' },
                  { text: 'Skill gap analysis run', time: 'Day 2' },
                  { text: 'Career roadmap generated', time: 'Day 3' },
                  { text: 'First coding assessment', time: 'Day 5' },
                ].map((item, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '6px 0', borderBottom: '1px solid hsla(217, 33%, 25%, 0.3)' }}>
                    <CheckCircle2 size={14} style={{ color: 'var(--accent-emerald)', flexShrink: 0 }} />
                    <span style={{ fontSize: '0.88rem', flex: 1 }}>{item.text}</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{item.time}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-panel-static" style={{ padding: '1.5rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertTriangle size={16} style={{ color: 'var(--accent-amber)' }} /> Pending Goals
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {[
                  { text: 'Complete 3+ coding assessments', priority: 'high' },
                  { text: 'Practice 2 mock interviews', priority: 'high' },
                  { text: 'Finish roadmap learning modules', priority: 'medium' },
                  { text: 'Apply to 5 matched jobs', priority: 'low' },
                ].map((item, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '6px 0', borderBottom: '1px solid hsla(217, 33%, 25%, 0.3)' }}>
                    <div style={{
                      width: '8px', height: '8px', borderRadius: '50%', flexShrink: 0,
                      background: item.priority === 'high' ? 'var(--accent-rose)' : item.priority === 'medium' ? 'var(--accent-amber)' : 'var(--accent-emerald)'
                    }} />
                    <span style={{ fontSize: '0.88rem', flex: 1 }}>{item.text}</span>
                    <span className={`badge ${item.priority === 'high' ? 'badge-danger' : item.priority === 'medium' ? 'badge-warning' : 'badge-success'}`} style={{ fontSize: '0.68rem' }}>
                      {item.priority}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
