'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  Users, Search, Star, UserCheck, UserX, Filter,
  Mail, Target, FileText, Award, Clock, ChevronRight,
  Plus, X, Eye, Briefcase, TrendingUp, Building2
} from 'lucide-react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

export default function RecruiterPage() {
  const { user, token, isLoading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'search' | 'shortlist' | 'jobs'>('search');
  const [candidates, setCandidates] = useState<any[]>([]);
  const [shortlist, setShortlist] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [skillFilter, setSkillFilter] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<any>(null);

  useEffect(() => {
    if (!isLoading && !user) router.push('/login');
    if (!isLoading && user && user.role !== 'recruiter' && user.role !== 'admin') {
      router.push('/dashboard');
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    if (token) {
      fetchCandidates();
      fetchShortlist();
    }
  }, [token]);

  async function fetchCandidates() {
    try {
      const params = new URLSearchParams();
      if (skillFilter) params.set('skill', skillFilter);
      if (searchQuery) params.set('query', searchQuery);
      const res = await fetch(`${API_BASE}/recruiter/candidates?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setCandidates(Array.isArray(data) ? data : data.candidates || []);
    } catch { setCandidates([]); }
  }

  async function fetchShortlist() {
    try {
      const res = await fetch(`${API_BASE}/recruiter/shortlist`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setShortlist(Array.isArray(data) ? data : data.shortlisted || []);
    } catch { setShortlist([]); }
  }

  async function addToShortlist(candidateId: string) {
    try {
      await fetch(`${API_BASE}/recruiter/shortlist`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ candidate_id: candidateId })
      });
      fetchShortlist();
    } catch (err) { console.error(err); }
  }

  if (isLoading || !user) return <div className="loading-page"><div className="spinner" /><span>Loading...</span></div>;

  return (
    <div className="page-container animate-in">
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <Building2 size={20} style={{ color: 'var(--accent-violet)' }} />
          <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Recruiter Portal</span>
        </div>
        <h1 className="page-title">Candidate <span className="gradient-text">Search</span></h1>
        <p className="page-subtitle">Search, filter, and shortlist candidates based on verified skill scores.</p>
      </div>

      <div className="tab-bar">
        <button className={`tab-item ${activeTab === 'search' ? 'active' : ''}`} onClick={() => setActiveTab('search')}>
          <Search size={14} /> Candidate Search
        </button>
        <button className={`tab-item ${activeTab === 'shortlist' ? 'active' : ''}`} onClick={() => setActiveTab('shortlist')}>
          <Star size={14} /> Shortlist ({shortlist.length})
        </button>
        <button className={`tab-item ${activeTab === 'jobs' ? 'active' : ''}`} onClick={() => setActiveTab('jobs')}>
          <Briefcase size={14} /> My Job Posts
        </button>
      </div>

      {activeTab === 'search' && (
        <>
          <div style={{ display: 'flex', gap: '10px', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', flex: 1, minWidth: '250px' }}>
              <Search size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input className="form-input" style={{ paddingLeft: '40px' }}
                placeholder="Search by name or email..." value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)} />
            </div>
            <div style={{ position: 'relative', minWidth: '200px' }}>
              <Filter size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input className="form-input" style={{ paddingLeft: '40px' }}
                placeholder="Filter by skill..." value={skillFilter}
                onChange={e => setSkillFilter(e.target.value)} />
            </div>
            <button className="btn-primary btn-sm" onClick={fetchCandidates}>
              <Search size={14} /> Search
            </button>
          </div>

          {candidates.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon"><Users size={28} style={{ color: 'var(--text-muted)' }} /></div>
              <h3>No candidates found</h3>
              <p>Try adjusting your search filters or skill requirements.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {candidates.map((c: any, i: number) => (
                <div key={c.id || i} className="glass-panel-static" style={{
                  padding: '1.25rem', display: 'flex', justifyContent: 'space-between',
                  alignItems: 'center', gap: '1rem', flexWrap: 'wrap'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1 }}>
                    <div className="avatar-circle" style={{ width: '44px', height: '44px', fontSize: '1rem' }}>
                      {(c.full_name || c.name || 'U').charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{c.full_name || c.name}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{c.email}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                    {c.readiness_score && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem' }}>
                        <TrendingUp size={14} style={{ color: 'var(--accent-emerald)' }} />
                        <span style={{ fontWeight: 600, color: 'var(--accent-emerald)' }}>{c.readiness_score}%</span>
                      </div>
                    )}
                    <button className="btn-secondary btn-sm" onClick={() => setSelectedCandidate(c)}>
                      <Eye size={14} /> View
                    </button>
                    <button className="btn-primary btn-sm" onClick={() => addToShortlist(c.id)}>
                      <Star size={14} /> Shortlist
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {activeTab === 'shortlist' && (
        <div>
          {shortlist.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon"><Star size={28} style={{ color: 'var(--text-muted)' }} /></div>
              <h3>No shortlisted candidates</h3>
              <p>Search for candidates and add them to your shortlist.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {shortlist.map((c: any, i: number) => (
                <div key={i} className="glass-panel-static" style={{ padding: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{c.full_name || c.candidate_name || 'Candidate'}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{c.email || 'No email'}</div>
                  </div>
                  <div className="badge badge-primary"><Star size={12} /> Shortlisted</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'jobs' && (
        <div className="empty-state">
          <div className="empty-state-icon"><Briefcase size={28} style={{ color: 'var(--text-muted)' }} /></div>
          <h3>Job Post Management</h3>
          <p>Create and manage job postings from this panel. Job listings will be matched against candidate profiles automatically.</p>
          <button className="btn-primary" style={{ marginTop: '1rem' }}><Plus size={16} /> Create Job Post</button>
        </div>
      )}

      {/* Candidate Detail Modal */}
      {selectedCandidate && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 500, padding: '2rem'
        }} onClick={() => setSelectedCandidate(null)}>
          <div className="glass-panel-static animate-in" style={{
            maxWidth: '600px', width: '100%', maxHeight: '80vh', overflow: 'auto', padding: '2rem'
          }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Candidate Profile</h3>
              <button className="btn-icon" onClick={() => setSelectedCandidate(null)}><X size={18} /></button>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '1.25rem' }}>
              <div className="avatar-circle" style={{ width: '56px', height: '56px', fontSize: '1.3rem' }}>
                {(selectedCandidate.full_name || 'U').charAt(0).toUpperCase()}
              </div>
              <div>
                <div style={{ fontSize: '1.1rem', fontWeight: 600 }}>{selectedCandidate.full_name}</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{selectedCandidate.email}</div>
              </div>
            </div>
            <div className="grid-2" style={{ marginBottom: '1rem' }}>
              <div className="stat-card">
                <div className="stat-label">Readiness Score</div>
                <div className="stat-value" style={{ fontSize: '1.4rem', color: 'var(--accent-emerald)' }}>{selectedCandidate.readiness_score ?? 'N/A'}%</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Resume Score</div>
                <div className="stat-value" style={{ fontSize: '1.4rem', color: 'var(--accent-cyan)' }}>{selectedCandidate.resume_score ?? 'N/A'}</div>
              </div>
            </div>
            {selectedCandidate.skills?.length > 0 && (
              <div>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '8px', color: 'var(--text-secondary)' }}>Skills</h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {selectedCandidate.skills.map((s: string, i: number) => (
                    <span key={i} className="skill-tag matched">{s}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
