'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { assessmentAPI } from '@/lib/api';
import {
  Code2, Play, CheckCircle2, XCircle, Clock, Award,
  Terminal, Send, AlertCircle, RotateCcw, ChevronRight
} from 'lucide-react';

export default function AssessmentsPage() {
  const { user, token, isLoading } = useAuth();
  const router = useRouter();
  const [assessments, setAssessments] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);
  const [code, setCode] = useState('');
  const [result, setResult] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [loadingList, setLoadingList] = useState(true);

  useEffect(() => { if (!isLoading && !user) router.push('/login'); }, [user, isLoading, router]);

  useEffect(() => {
    if (token) {
      assessmentAPI.list(token).then(data => {
        setAssessments(Array.isArray(data) ? data : []);
      }).catch(() => {}).finally(() => setLoadingList(false));
    }
  }, [token]);

  async function handleSubmit() {
    if (!selected || !token || !code.trim()) return;
    setSubmitting(true); setResult(null);
    try {
      const res = await assessmentAPI.submit(selected.id, code, 'python', token);
      setResult(res);
    } catch (err: any) {
      setResult({ status: 'error', score: 0, output_logs: err.message });
    } finally { setSubmitting(false); }
  }

  if (isLoading || !user) return <div className="loading-page"><div className="spinner" /><span>Loading...</span></div>;

  return (
    <div className="page-container animate-in">
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <Code2 size={20} style={{ color: 'var(--accent-emerald)' }} />
          <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Coding Assessments</span>
        </div>
        <h1 className="page-title">Code <span className="gradient-text">Challenges</span></h1>
        <p className="page-subtitle">Solve coding problems, run against test cases, and track your progress.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: selected ? '320px 1fr' : '1fr', gap: '1.5rem' }}>
        {/* Assessment List */}
        <div>
          <h3 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Available Challenges
          </h3>
          {loadingList ? (
            <div className="loading-page" style={{ minHeight: '200px' }}><div className="spinner" /></div>
          ) : assessments.length === 0 ? (
            <div className="empty-state" style={{ padding: '2rem' }}>
              <div className="empty-state-icon" style={{ width: '48px', height: '48px' }}><Code2 size={22} style={{ color: 'var(--text-muted)' }} /></div>
              <h3 style={{ fontSize: '1rem' }}>No assessments available</h3>
              <p style={{ fontSize: '0.85rem' }}>Coding challenges will appear once created by administrators.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {assessments.map((a: any, i: number) => (
                <div key={a.id || i} onClick={() => { setSelected(a); setCode(''); setResult(null); }}
                  className="glass-panel" style={{
                    padding: '1rem', cursor: 'pointer',
                    borderColor: selected?.id === a.id ? 'var(--accent-emerald)' : undefined
                  }}>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '6px' }}>{a.title}</div>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <span className={`badge ${a.difficulty === 'hard' ? 'badge-danger' : a.difficulty === 'medium' ? 'badge-warning' : 'badge-success'}`} style={{ fontSize: '0.7rem' }}>
                      {a.difficulty || 'Easy'}
                    </span>
                    <span className="badge badge-cyan" style={{ fontSize: '0.7rem' }}>
                      {a.language || 'Python'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Code Editor */}
        {selected && (
          <div className="animate-in">
            <div className="glass-panel-static" style={{ padding: '1.5rem', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div>
                  <h2 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '4px' }}>{selected.title}</h2>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <span className={`badge ${selected.difficulty === 'hard' ? 'badge-danger' : selected.difficulty === 'medium' ? 'badge-warning' : 'badge-success'}`}>
                      {selected.difficulty || 'Easy'}
                    </span>
                  </div>
                </div>
              </div>
              <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                {selected.description || 'Solve the problem below and submit your Python solution.'}
              </p>
            </div>

            {/* Editor */}
            <div style={{ marginBottom: '1rem' }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 14px',
                background: 'hsl(222, 47%, 5%)', borderRadius: 'var(--radius-sm) var(--radius-sm) 0 0',
                border: '1px solid var(--border-subtle)', borderBottom: 'none'
              }}>
                <Terminal size={14} style={{ color: 'var(--accent-emerald)' }} />
                <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)' }}>solution.py</span>
              </div>
              <textarea
                className="code-editor"
                style={{ borderRadius: '0 0 var(--radius-sm) var(--radius-sm)' }}
                value={code}
                onChange={e => setCode(e.target.value)}
                placeholder="# Write your Python solution here..."
                spellCheck={false}
              />
            </div>

            <div style={{ display: 'flex', gap: '10px', marginBottom: '1.5rem' }}>
              <button className="btn-primary" onClick={handleSubmit} disabled={!code.trim() || submitting}>
                {submitting ? <><div className="spinner" style={{ width: 16, height: 16 }} /> Running...</>
                  : <><Send size={16} /> Submit Solution</>}
              </button>
              <button className="btn-secondary" onClick={() => { setCode(''); setResult(null); }}>
                <RotateCcw size={16} /> Reset
              </button>
            </div>

            {/* Result */}
            {result && (
              <div className="glass-panel-static animate-in" style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1rem' }}>
                  {result.status === 'passed' ? (
                    <CheckCircle2 size={22} style={{ color: 'var(--accent-emerald)' }} />
                  ) : (
                    <XCircle size={22} style={{ color: 'var(--accent-rose)' }} />
                  )}
                  <span style={{ fontSize: '1.1rem', fontWeight: 700, color: result.status === 'passed' ? 'var(--accent-emerald)' : 'var(--accent-rose)' }}>
                    {result.status === 'passed' ? 'All Tests Passed!' : 'Tests Failed'}
                  </span>
                </div>
                <div className="grid-3" style={{ marginBottom: '1rem' }}>
                  <div className="stat-card">
                    <div className="stat-label">Score</div>
                    <div className="stat-value" style={{ fontSize: '1.4rem', color: result.score >= 80 ? 'var(--accent-emerald)' : 'var(--accent-amber)' }}>{result.score}%</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-label">Tests Passed</div>
                    <div className="stat-value" style={{ fontSize: '1.4rem' }}>{result.passed_test_cases}/{result.total_test_cases}</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-label">Execution Time</div>
                    <div className="stat-value" style={{ fontSize: '1.4rem', color: 'var(--accent-cyan)' }}>{result.execution_time_ms}ms</div>
                  </div>
                </div>
                {result.output_logs && (
                  <div>
                    <h4 style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '8px' }}>Output Log</h4>
                    <pre style={{
                      padding: '1rem', background: 'hsl(222, 47%, 5%)', borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border-subtle)', fontSize: '0.82rem', color: 'var(--accent-emerald)',
                      fontFamily: 'var(--font-mono)', overflow: 'auto', maxHeight: '200px', whiteSpace: 'pre-wrap'
                    }}>{result.output_logs}</pre>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
