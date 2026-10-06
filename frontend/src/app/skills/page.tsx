'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { skillsAPI } from '@/lib/api';
import {
  Target, TrendingUp, CheckCircle2, XCircle, AlertTriangle,
  ChevronRight, Award, Layers, Search, BarChart3, Sparkles
} from 'lucide-react';

const TARGET_ROLES = [
  'Frontend Developer', 'Backend Developer', 'Full Stack Developer',
  'Data Scientist', 'DevOps Engineer', 'Cloud Architect',
  'Machine Learning Engineer', 'Mobile Developer', 'Cybersecurity Analyst',
  'Product Manager'
];

export default function SkillsPage() {
  const { user, token, isLoading } = useAuth();
  const router = useRouter();
  const [targetRole, setTargetRole] = useState('');
  const [analysis, setAnalysis] = useState<any>(null);
  const [benchmarks, setBenchmarks] = useState<any[]>([]);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'analyze' | 'benchmarks'>('analyze');

  useEffect(() => { if (!isLoading && !user) router.push('/login'); }, [user, isLoading, router]);

  useEffect(() => {
    if (token) {
      skillsAPI.benchmarks(token).then(setBenchmarks).catch(() => {});
    }
  }, [token]);

  async function runAnalysis() {
    if (!targetRole || !token) return;
    setError(''); setAnalyzing(true); setAnalysis(null);
    try {
      const result = await skillsAPI.analyze(targetRole, token);
      setAnalysis(result);
    } catch (err: any) {
      setError(err.message || 'Analysis failed');
    } finally { setAnalyzing(false); }
  }

  if (isLoading || !user) return <div className="loading-page"><div className="spinner" /><span>Loading...</span></div>;

  return (
    <div className="page-container animate-in">
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <Target size={20} style={{ color: 'var(--accent-violet)' }} />
          <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Skill Intelligence</span>
        </div>
        <h1 className="page-title">Skill Gap <span className="gradient-text">Analysis</span></h1>
        <p className="page-subtitle">Compare your skills against industry benchmarks and identify growth areas.</p>
      </div>

      {/* Tabs */}
      <div className="tab-bar">
        <button className={`tab-item ${activeTab === 'analyze' ? 'active' : ''}`} onClick={() => setActiveTab('analyze')}>
          <Sparkles size={14} /> Gap Analysis
        </button>
        <button className={`tab-item ${activeTab === 'benchmarks' ? 'active' : ''}`} onClick={() => setActiveTab('benchmarks')}>
          <Layers size={14} /> Role Benchmarks
        </button>
      </div>

      {activeTab === 'analyze' && (
        <>
          {/* Target Role Selector */}
          <div className="glass-panel-static" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem' }}>Select Target Role</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '1.25rem' }}>
              {TARGET_ROLES.map(role => (
                <button key={role} onClick={() => setTargetRole(role)}
                  style={{
                    padding: '8px 16px', borderRadius: 'var(--radius-full)',
                    background: targetRole === role ? 'hsla(265, 89%, 66%, 0.2)' : 'var(--bg-input)',
                    border: `1px solid ${targetRole === role ? 'hsla(265, 89%, 66%, 0.5)' : 'var(--border-subtle)'}`,
                    color: targetRole === role ? 'var(--accent-violet)' : 'var(--text-secondary)',
                    fontWeight: targetRole === role ? 600 : 400,
                    cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: '0.85rem',
                    transition: 'all 0.2s'
                  }}>
                  {role}
                </button>
              ))}
            </div>
            <button className="btn-primary" onClick={runAnalysis} disabled={!targetRole || analyzing}>
              {analyzing ? <><div className="spinner" style={{ width: 16, height: 16 }} /> Analyzing...</>
                : <><Search size={16} /> Run Skill Gap Analysis</>}
            </button>
          </div>

          {error && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', borderRadius: 'var(--radius-sm)', background: 'hsla(350, 89%, 60%, 0.1)', border: '1px solid hsla(350, 89%, 60%, 0.3)', color: 'var(--accent-rose)', fontSize: '0.85rem', marginBottom: '1rem' }}>
              <AlertTriangle size={16} /> {error}
            </div>
          )}

          {/* Analysis Results */}
          {analysis && (
            <div className="animate-in">
              {/* Score Cards */}
              <div className="grid-3" style={{ marginBottom: '2rem' }}>
                <div className="stat-card" style={{ textAlign: 'center' }}>
                  <div className="score-ring" style={{
                    margin: '0 auto 12px',
                    background: `conic-gradient(var(--accent-cyan) ${(analysis.readiness_score || 0) * 3.6}deg, hsla(222, 40%, 15%, 0.8) 0deg)`
                  }}>
                    <div style={{
                      width: '92px', height: '92px', borderRadius: '50%', background: 'var(--bg-dark)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column'
                    }}>
                      <span className="score-ring-value" style={{ color: 'var(--accent-cyan)' }}>{analysis.readiness_score ?? 0}%</span>
                      <span className="score-ring-label">Readiness</span>
                    </div>
                  </div>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Role Readiness Score</div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon" style={{ background: 'hsla(152, 76%, 48%, 0.12)', color: 'var(--accent-emerald)' }}>
                    <CheckCircle2 size={20} />
                  </div>
                  <div className="stat-label">Matched Skills</div>
                  <div className="stat-value" style={{ color: 'var(--accent-emerald)' }}>
                    {analysis.matched_skills?.length ?? 0}
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon" style={{ background: 'hsla(350, 89%, 60%, 0.12)', color: 'var(--accent-rose)' }}>
                    <XCircle size={20} />
                  </div>
                  <div className="stat-label">Missing Skills</div>
                  <div className="stat-value" style={{ color: 'var(--accent-rose)' }}>
                    {(analysis.missing_required_skills?.length ?? 0) + (analysis.missing_optional_skills?.length ?? 0)}
                  </div>
                </div>
              </div>

              {/* Matched Skills */}
              {analysis.matched_skills?.length > 0 && (
                <div style={{ marginBottom: '1.5rem' }}>
                  <h3 className="section-title" style={{ color: 'var(--accent-emerald)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <CheckCircle2 size={18} /> Matched Skills
                  </h3>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {analysis.matched_skills.map((s: string, i: number) => (
                      <span key={i} className="skill-tag matched">{s}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Missing Required */}
              {analysis.missing_required_skills?.length > 0 && (
                <div style={{ marginBottom: '1.5rem' }}>
                  <h3 className="section-title" style={{ color: 'var(--accent-rose)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <XCircle size={18} /> Missing Required Skills
                  </h3>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {analysis.missing_required_skills.map((s: string, i: number) => (
                      <span key={i} className="skill-tag missing">{s}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Missing Optional */}
              {analysis.missing_optional_skills?.length > 0 && (
                <div>
                  <h3 className="section-title" style={{ color: 'var(--accent-amber)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <AlertTriangle size={18} /> Optional Skills to Learn
                  </h3>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {analysis.missing_optional_skills.map((s: string, i: number) => (
                      <span key={i} className="skill-tag" style={{ background: 'hsla(38, 92%, 50%, 0.1)', color: 'var(--accent-amber)', borderColor: 'hsla(38, 92%, 50%, 0.3)' }}>{s}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {activeTab === 'benchmarks' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {benchmarks.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon"><Layers size={28} style={{ color: 'var(--text-muted)' }} /></div>
              <h3>No benchmarks available</h3>
              <p>Role benchmarks will appear here once data is seeded.</p>
            </div>
          ) : benchmarks.map((bm: any, i: number) => (
            <div key={i} className="glass-panel-static" style={{ padding: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>{bm.role_name}</h3>
                <span className="badge badge-cyan">{bm.required_skills?.length ?? 0} skills</span>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {bm.required_skills?.map((s: string, j: number) => (
                  <span key={j} className="skill-tag">{s}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
