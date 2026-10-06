'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { jobsAPI } from '@/lib/api';
import {
  Briefcase, MapPin, Clock, TrendingUp, CheckCircle2,
  XCircle, ExternalLink, Search, Filter, Building2,
  DollarSign, Star
} from 'lucide-react';

export default function JobsPage() {
  const { user, token, isLoading } = useAuth();
  const router = useRouter();
  const [jobs, setJobs] = useState<any[]>([]);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'recommended' | 'all'>('recommended');
  const [searchQuery, setSearchQuery] = useState('');
  const [loadingData, setLoadingData] = useState(true);
  const [selectedJob, setSelectedJob] = useState<any>(null);

  useEffect(() => { if (!isLoading && !user) router.push('/login'); }, [user, isLoading, router]);

  useEffect(() => {
    if (token) {
      Promise.all([
        jobsAPI.recommendations(token).catch(() => []),
        jobsAPI.list(token).catch(() => []),
      ]).then(([recs, all]) => {
        setRecommendations(Array.isArray(recs) ? recs : recs?.recommendations || []);
        setJobs(Array.isArray(all) ? all : all?.jobs || []);
      }).finally(() => setLoadingData(false));
    }
  }, [token]);

  if (isLoading || !user) return <div className="loading-page"><div className="spinner" /><span>Loading...</span></div>;

  const displayJobs = activeTab === 'recommended' ? recommendations : jobs;
  const filteredJobs = displayJobs.filter((j: any) =>
    !searchQuery || (j.title || j.job_title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (j.company || j.company_name || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="page-container animate-in">
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <Briefcase size={20} style={{ color: 'var(--accent-rose)' }} />
          <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Job Intelligence</span>
        </div>
        <h1 className="page-title">Job <span className="gradient-text">Recommendations</span></h1>
        <p className="page-subtitle">AI-matched opportunities based on your skills, experience, and career goals.</p>
      </div>

      {/* Search & Tabs */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '250px' }}>
          <Search size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input className="form-input" style={{ paddingLeft: '40px' }}
            placeholder="Search jobs by title or company..."
            value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
        </div>
        <div className="tab-bar" style={{ marginBottom: 0 }}>
          <button className={`tab-item ${activeTab === 'recommended' ? 'active' : ''}`} onClick={() => setActiveTab('recommended')}>
            <Star size={14} /> Recommended
          </button>
          <button className={`tab-item ${activeTab === 'all' ? 'active' : ''}`} onClick={() => setActiveTab('all')}>
            <Briefcase size={14} /> All Jobs
          </button>
        </div>
      </div>

      {/* Job Grid */}
      {loadingData ? (
        <div className="loading-page" style={{ minHeight: '300px' }}><div className="spinner" /></div>
      ) : filteredJobs.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon"><Briefcase size={28} style={{ color: 'var(--text-muted)' }} /></div>
          <h3>No jobs found</h3>
          <p>{activeTab === 'recommended' ? 'Upload your resume and complete skill analysis to get personalized recommendations.' : 'No job listings available yet.'}</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: selectedJob ? '1fr 1fr' : 'repeat(auto-fill, minmax(380px, 1fr))', gap: '1rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {filteredJobs.map((job: any, i: number) => (
              <div key={job.id || i} className="glass-panel" style={{
                padding: '1.5rem', cursor: 'pointer',
                borderColor: selectedJob?.id === job.id ? 'var(--border-glow)' : undefined
              }} onClick={() => setSelectedJob(job)}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                  <div>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 600, marginBottom: '4px' }}>
                      {job.title || job.job_title}
                    </h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Building2 size={13} /> {job.company || job.company_name || 'Company'}
                      </span>
                      {(job.location) && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <MapPin size={13} /> {job.location}
                        </span>
                      )}
                    </div>
                  </div>
                  {(job.match_score || job.fit_score) && (
                    <div style={{
                      padding: '6px 12px', borderRadius: 'var(--radius-full)',
                      background: (job.match_score || job.fit_score) >= 80 ? 'hsla(152, 76%, 48%, 0.15)' : 'hsla(38, 92%, 50%, 0.15)',
                      color: (job.match_score || job.fit_score) >= 80 ? 'var(--accent-emerald)' : 'var(--accent-amber)',
                      fontWeight: 700, fontSize: '0.85rem'
                    }}>
                      {Math.round(job.match_score || job.fit_score)}% match
                    </div>
                  )}
                </div>

                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '12px' }}>
                  {(job.description || '').substring(0, 120)}{(job.description || '').length > 120 ? '...' : ''}
                </p>

                {job.required_skills && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {(job.required_skills || []).slice(0, 5).map((skill: string, j: number) => (
                      <span key={j} className="skill-tag">{skill}</span>
                    ))}
                    {(job.required_skills || []).length > 5 && (
                      <span className="skill-tag">+{job.required_skills.length - 5} more</span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Job Detail Panel */}
          {selectedJob && (
            <div className="glass-panel-static animate-in" style={{ padding: '1.5rem', position: 'sticky', top: '80px', alignSelf: 'start' }}>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '6px' }}>{selectedJob.title || selectedJob.job_title}</h2>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Building2 size={14} /> {selectedJob.company || selectedJob.company_name}</span>
                {selectedJob.location && <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><MapPin size={14} /> {selectedJob.location}</span>}
                {selectedJob.job_type && <span className="badge badge-cyan" style={{ fontSize: '0.72rem' }}>{selectedJob.job_type}</span>}
              </div>

              {(selectedJob.match_score || selectedJob.fit_score) && (
                <div style={{ marginBottom: '1.25rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.82rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Skill Match</span>
                    <span style={{ fontWeight: 600, color: 'var(--accent-emerald)' }}>{Math.round(selectedJob.match_score || selectedJob.fit_score)}%</span>
                  </div>
                  <div className="progress-bar-container">
                    <div className="progress-bar-fill progress-emerald" style={{ width: `${selectedJob.match_score || selectedJob.fit_score}%` }} />
                  </div>
                </div>
              )}

              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: '1.5rem' }}>
                {selectedJob.description || 'No description available.'}
              </p>

              {selectedJob.required_skills?.length > 0 && (
                <div style={{ marginBottom: '1.25rem' }}>
                  <h4 style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '8px' }}>Required Skills</h4>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {selectedJob.required_skills.map((s: string, i: number) => (
                      <span key={i} className="skill-tag">{s}</span>
                    ))}
                  </div>
                </div>
              )}

              {selectedJob.match_breakdown && (
                <div style={{ marginBottom: '1.25rem' }}>
                  <h4 style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '8px' }}>Match Breakdown</h4>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                    {typeof selectedJob.match_breakdown === 'string' ? selectedJob.match_breakdown :
                      JSON.stringify(selectedJob.match_breakdown, null, 2)}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
