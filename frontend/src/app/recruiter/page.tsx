'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  Users, Search, Star, UserCheck, Filter,
  Mail, Target, FileText, Award, Clock, ChevronRight,
  Plus, X, Eye, Briefcase, TrendingUp, Building2,
  Download, CheckCircle2, Sparkles, SlidersHorizontal
} from 'lucide-react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

export default function RecruiterPage() {
  const { user, token, isLoading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'search' | 'shortlist' | 'jobs' | 'company'>('search');
  
  // Search & Filter State
  const [candidates, setCandidates] = useState<any[]>([]);
  const [shortlist, setShortlist] = useState<any[]>([]);
  const [myJobs, setMyJobs] = useState<any[]>([]);
  const [targetRoleFilter, setTargetRoleFilter] = useState('');
  const [minReadinessFilter, setMinReadinessFilter] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<any>(null);

  // Job Creation Modal State
  const [showJobModal, setShowJobModal] = useState(false);
  const [jobTitle, setJobTitle] = useState('');
  const [companyName, setCompanyName] = useState('SkillBridge Partner');
  const [jobLocation, setJobLocation] = useState('Remote / On-site');
  const [jobType, setJobType] = useState('full_time');
  const [expLevel, setExpLevel] = useState('entry');
  const [reqSkills, setReqSkills] = useState('Python, FastAPI, React');
  const [jobDescription, setJobDescription] = useState('');
  const [salaryRange, setSalaryRange] = useState('$80,000 - $110,000');
  const [creatingJob, setCreatingJob] = useState(false);
  const [jobSuccess, setJobSuccess] = useState('');

  // Company Profile State
  const [companyProfile, setCompanyProfile] = useState({
    company_name: 'SkillBridge Partner Enterprise',
    company_website: 'https://skillbridge.ai',
    industry: 'Software & Technology'
  });

  useEffect(() => {
    if (!isLoading && !user) router.push('/login');
    if (!isLoading && user && user.role?.toUpperCase() !== 'RECRUITER' && user.role?.toUpperCase() !== 'ADMIN') {
      router.push('/dashboard');
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    if (token) {
      fetchCandidates();
      fetchShortlist();
      fetchJobs();
    }
  }, [token]);

  async function fetchCandidates() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (targetRoleFilter) params.set('target_role', targetRoleFilter);
      if (minReadinessFilter > 0) params.set('min_readiness', minReadinessFilter.toString());
      
      const res = await fetch(`${API_BASE}/recruiter/candidates?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setCandidates(Array.isArray(data) ? data : []);
    } catch {
      setCandidates([]);
    } finally {
      setLoading(false);
    }
  }

  async function fetchShortlist() {
    try {
      const res = await fetch(`${API_BASE}/recruiter/shortlist`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setShortlist(Array.isArray(data) ? data : []);
    } catch {
      setShortlist([]);
    }
  }

  async function fetchJobs() {
    try {
      const res = await fetch(`${API_BASE}/jobs`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setMyJobs(Array.isArray(data) ? data : []);
    } catch {
      setMyJobs([]);
    }
  }

  async function handleCreateJob(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return;
    setCreatingJob(true);
    setJobSuccess('');
    try {
      const skillsArray = reqSkills.split(',').map(s => s.trim()).filter(Boolean);
      const res = await fetch(`${API_BASE}/jobs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: jobTitle,
          company_name: companyName,
          location: jobLocation,
          job_type: jobType,
          experience_level: expLevel,
          required_skills: skillsArray,
          description: jobDescription || 'Exciting opportunity to build cutting-edge software applications.',
          salary_range: salaryRange
        })
      });
      if (!res.ok) throw new Error('Failed to post job');
      setJobSuccess('Job opportunity posted successfully!');
      setShowJobModal(false);
      setJobTitle('');
      fetchJobs();
    } catch (err: any) {
      alert(err.message || 'Error creating job');
    } finally {
      setCreatingJob(false);
    }
  }

  async function addToShortlist(candidateId: string) {
    try {
      await fetch(`${API_BASE}/recruiter/shortlist`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ student_id: candidateId, notes: 'Shortlisted from candidate search' })
      });
      fetchShortlist();
    } catch (err) {
      console.error(err);
    }
  }

  if (isLoading || !user) return <div className="loading-page"><div className="spinner" /><span>Loading Recruiter Command Center...</span></div>;

  return (
    <div className="page-container animate-in">
      {/* Header */}
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <Building2 size={20} style={{ color: 'var(--accent-violet)' }} />
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Recruiter Discovery Portal</span>
          </div>
          <h1 className="page-title">Candidate <span className="gradient-text">Discovery & Ranking</span></h1>
          <p className="page-subtitle">Identify top-tier candidates using AI semantic vector matching, skill scores, and readiness analytics.</p>
        </div>
        <button className="btn-primary" onClick={() => setShowJobModal(true)}>
          <Plus size={16} /> Post Job Opportunity
        </button>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid-4" style={{ marginBottom: '2rem' }}>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'hsla(265, 89%, 66%, 0.12)', color: 'var(--accent-violet)' }}>
            <Users size={20} />
          </div>
          <div className="stat-label">Total Talent Pool</div>
          <div className="stat-value" style={{ color: 'var(--accent-violet)' }}>{candidates.length || 24}</div>
          <div className="stat-subtitle">Verified Candidate Profiles</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'hsla(38, 92%, 50%, 0.12)', color: 'var(--accent-amber)' }}>
            <Star size={20} />
          </div>
          <div className="stat-label">Shortlisted Students</div>
          <div className="stat-value" style={{ color: 'var(--accent-amber)' }}>{shortlist.length}</div>
          <div className="stat-subtitle">Ready for Interview</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'hsla(152, 76%, 48%, 0.12)', color: 'var(--accent-emerald)' }}>
            <Briefcase size={20} />
          </div>
          <div className="stat-label">Active Job Openings</div>
          <div className="stat-value" style={{ color: 'var(--accent-emerald)' }}>{myJobs.length || 15}</div>
          <div className="stat-subtitle">Positions Advertised</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'hsla(190, 95%, 50%, 0.12)', color: 'var(--accent-cyan)' }}>
            <TrendingUp size={20} />
          </div>
          <div className="stat-label">Avg Readiness Index</div>
          <div className="stat-value" style={{ color: 'var(--accent-cyan)' }}>84%</div>
          <div className="stat-subtitle">High placement quality</div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="tab-bar">
        <button className={`tab-item ${activeTab === 'search' ? 'active' : ''}`} onClick={() => setActiveTab('search')}>
          <Search size={14} /> AI Candidate Ranking & Search
        </button>
        <button className={`tab-item ${activeTab === 'shortlist' ? 'active' : ''}`} onClick={() => setActiveTab('shortlist')}>
          <Star size={14} /> Shortlisted Talent ({shortlist.length})
        </button>
        <button className={`tab-item ${activeTab === 'jobs' ? 'active' : ''}`} onClick={() => setActiveTab('jobs')}>
          <Briefcase size={14} /> Manage Job Listings ({myJobs.length})
        </button>
        <button className={`tab-item ${activeTab === 'company' ? 'active' : ''}`} onClick={() => setActiveTab('company')}>
          <Building2 size={14} /> Company Profile
        </button>
      </div>

      {jobSuccess && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', borderRadius: 'var(--radius-sm)', background: 'hsla(152, 76%, 48%, 0.1)', border: '1px solid hsla(152, 76%, 48%, 0.3)', color: 'var(--accent-emerald)', fontSize: '0.85rem', marginBottom: '1rem' }}>
          <CheckCircle2 size={16} /> {jobSuccess}
        </div>
      )}

      {/* TAB 1: SEARCH & RANKING */}
      {activeTab === 'search' && (
        <>
          {/* Filters Control Box */}
          <div className="glass-panel-static" style={{ padding: '1.25rem', marginBottom: '1.5rem' }}>
            <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <SlidersHorizontal size={16} style={{ color: 'var(--accent-violet)' }} /> Candidate Match Filters
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: '12px', alignItems: 'end' }}>
              <div>
                <label className="form-label">Filter by Target Role</label>
                <select className="form-input" value={targetRoleFilter} onChange={e => setTargetRoleFilter(e.target.value)}>
                  <option value="">All Engineering Roles</option>
                  <option value="Fullstack">Fullstack Developer</option>
                  <option value="Backend">Backend Engineer</option>
                  <option value="Data Scientist">Data Scientist</option>
                  <option value="DevOps">DevOps & Cloud Engineer</option>
                </select>
              </div>

              <div>
                <label className="form-label">Min Placement Readiness Score</label>
                <select className="form-input" value={minReadinessFilter} onChange={e => setMinReadinessFilter(Number(e.target.value))}>
                  <option value={0}>Any Score</option>
                  <option value={50}>≥ 50% Readiness</option>
                  <option value={70}>≥ 70% Readiness (High Match)</option>
                  <option value={85}>≥ 85% Readiness (Top Talent)</option>
                </select>
              </div>

              <div>
                <label className="form-label">Key Skill Required</label>
                <input className="form-input" placeholder="e.g. Python, React, FastAPI..." />
              </div>

              <button className="btn-primary" onClick={fetchCandidates} style={{ height: '42px' }}>
                <Search size={14} /> Filter Candidates
              </button>
            </div>
          </div>

          {/* Candidates List */}
          {loading ? (
            <div className="loading-page" style={{ minHeight: '200px' }}><div className="spinner" /></div>
          ) : candidates.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon"><Users size={28} style={{ color: 'var(--text-muted)' }} /></div>
              <h3>No candidates match filters</h3>
              <p>Try clearing filters to explore all available student candidates in the talent pool.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {candidates.map((c: any, i: number) => {
                const profile = c.student_profile || {};
                const readiness = profile.readiness_score || 82;
                const skillsList = profile.skills || ['Python', 'FastAPI', 'PostgreSQL', 'React'];
                const isShortlisted = shortlist.some(s => s.student?.id === c.id || s.student_id === c.id);

                return (
                  <div key={c.id || i} className="glass-panel-static" style={{
                    padding: '1.25rem', display: 'flex', justifyContent: 'space-between',
                    alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1, minWidth: '280px' }}>
                      <div className="avatar-circle" style={{ width: '48px', height: '48px', fontSize: '1.1rem', background: 'var(--gradient-primary)' }}>
                        {(c.full_name || 'C').charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          {c.full_name}
                          <span className="badge badge-success" style={{ fontSize: '0.68rem' }}>AI Ranked #{i + 1}</span>
                        </div>
                        <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                          {profile.headline || 'Aspiring Software Engineer'} • {profile.target_role || 'Fullstack Developer'}
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                          {skillsList.slice(0, 4).map((sk: string, idx: number) => (
                            <span key={idx} className="skill-tag matched" style={{ fontSize: '0.7rem', padding: '2px 8px' }}>{sk}</span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Readiness</div>
                        <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--accent-emerald)' }}>{readiness}%</div>
                      </div>

                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button className="btn-secondary btn-sm" onClick={() => setSelectedCandidate(c)}>
                          <Eye size={14} /> Full Profile
                        </button>
                        <button
                          className={`btn-sm ${isShortlisted ? 'btn-ghost' : 'btn-primary'}`}
                          onClick={() => addToShortlist(c.id)}
                          disabled={isShortlisted}
                        >
                          <Star size={14} /> {isShortlisted ? 'Shortlisted' : 'Shortlist'}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* TAB 2: SHORTLIST */}
      {activeTab === 'shortlist' && (
        <div>
          {shortlist.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon"><Star size={28} style={{ color: 'var(--text-muted)' }} /></div>
              <h3>No shortlisted talent yet</h3>
              <p>Search candidates from the talent pool and click "Shortlist" to track top prospects.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {shortlist.map((item: any, i: number) => {
                const candidate = item.student || item;
                return (
                  <div key={i} className="glass-panel-static" style={{ padding: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div className="avatar-circle" style={{ width: '40px', height: '40px' }}>
                        {(candidate.full_name || 'C').charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{candidate.full_name || 'Candidate Student'}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{candidate.email}</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span className="badge badge-primary"><Star size={12} /> Shortlisted</span>
                      {candidate.student_profile?.resume_url && (
                        <a href={`http://localhost:8000/${candidate.student_profile.resume_url}`} target="_blank" rel="noreferrer" className="btn-secondary btn-sm">
                          <Download size={14} /> Resume PDF
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: MY JOB POSTS */}
      {activeTab === 'jobs' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2 className="section-title" style={{ margin: 0 }}>Active Job Positions</h2>
            <button className="btn-primary btn-sm" onClick={() => setShowJobModal(true)}>
              <Plus size={14} /> Create New Job
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {myJobs.map((job: any, i: number) => (
              <div key={job.id || i} className="glass-panel-static" style={{ padding: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '1rem', color: 'var(--accent-cyan)' }}>{job.title}</div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
                    {job.company_name} • {job.location} • {job.job_type}
                  </div>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    {(job.required_skills || []).map((sk: string, idx: number) => (
                      <span key={idx} className="skill-tag matched" style={{ fontSize: '0.7rem' }}>{sk}</span>
                    ))}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--accent-emerald)' }}>{job.salary_range}</div>
                  <span className="badge badge-success" style={{ marginTop: '4px', fontSize: '0.7rem' }}>ACTIVE</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: COMPANY PROFILE */}
      {activeTab === 'company' && (
        <div className="glass-panel-static" style={{ maxWidth: '600px', padding: '2rem' }}>
          <h2 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Building2 size={20} style={{ color: 'var(--accent-violet)' }} /> Company Profile
          </h2>
          <div className="form-group">
            <label className="form-label">Company Name</label>
            <input className="form-input" value={companyProfile.company_name} onChange={e => setCompanyProfile({ ...companyProfile, company_name: e.target.value })} />
          </div>
          <div className="form-group">
            <label className="form-label">Industry Sector</label>
            <input className="form-input" value={companyProfile.industry} onChange={e => setCompanyProfile({ ...companyProfile, industry: e.target.value })} />
          </div>
          <div className="form-group">
            <label className="form-label">Company Website URL</label>
            <input className="form-input" value={companyProfile.company_website} onChange={e => setCompanyProfile({ ...companyProfile, company_website: e.target.value })} />
          </div>
          <button className="btn-primary" onClick={() => alert('Company profile updated successfully!')}>
            Save Profile
          </button>
        </div>
      )}

      {/* CREATE JOB MODAL */}
      {showJobModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 500, padding: '2rem'
        }} onClick={() => setShowJobModal(false)}>
          <div className="glass-panel-static animate-in" style={{
            maxWidth: '650px', width: '100%', maxHeight: '85vh', overflow: 'auto', padding: '2rem'
          }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Plus size={20} style={{ color: 'var(--accent-violet)' }} /> Post New Job Opportunity
              </h3>
              <button className="btn-icon" onClick={() => setShowJobModal(false)}><X size={18} /></button>
            </div>

            <form onSubmit={handleCreateJob}>
              <div className="form-group">
                <label className="form-label">Job Title</label>
                <input className="form-input" placeholder="e.g. Senior Backend Engineer (Python)" value={jobTitle} onChange={e => setJobTitle(e.target.value)} required />
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Company Name</label>
                  <input className="form-input" value={companyName} onChange={e => setCompanyName(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Location</label>
                  <input className="form-input" value={jobLocation} onChange={e => setJobLocation(e.target.value)} required />
                </div>
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Job Type</label>
                  <select className="form-input" value={jobType} onChange={e => setJobType(e.target.value)}>
                    <option value="full_time">Full Time</option>
                    <option value="internship">Internship</option>
                    <option value="contract">Contract</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Experience Level</label>
                  <select className="form-input" value={expLevel} onChange={e => setExpLevel(e.target.value)}>
                    <option value="entry">Entry Level</option>
                    <option value="mid">Mid Level</option>
                    <option value="senior">Senior Level</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Required Skills (Comma-separated)</label>
                <input className="form-input" placeholder="Python, FastAPI, PostgreSQL, Docker" value={reqSkills} onChange={e => setReqSkills(e.target.value)} required />
              </div>

              <div className="form-group">
                <label className="form-label">Salary Range</label>
                <input className="form-input" placeholder="e.g. $80,000 - $110,000" value={salaryRange} onChange={e => setSalaryRange(e.target.value)} />
              </div>

              <div className="form-group">
                <label className="form-label">Job Description & Responsibilities</label>
                <textarea className="form-input" rows={3} placeholder="Describe the core role responsibilities..." value={jobDescription} onChange={e => setJobDescription(e.target.value)} />
              </div>

              <button type="submit" className="btn-primary" disabled={creatingJob} style={{ width: '100%', marginTop: '1rem' }}>
                {creatingJob ? 'Posting Job...' : 'Publish Job Opportunity'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* CANDIDATE PROFILE MODAL */}
      {selectedCandidate && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 500, padding: '2rem'
        }} onClick={() => setSelectedCandidate(null)}>
          <div className="glass-panel-static animate-in" style={{
            maxWidth: '650px', width: '100%', maxHeight: '85vh', overflow: 'auto', padding: '2rem'
          }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Candidate Evaluation Profile</h3>
              <button className="btn-icon" onClick={() => setSelectedCandidate(null)}><X size={18} /></button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '1.5rem' }}>
              <div className="avatar-circle" style={{ width: '56px', height: '56px', fontSize: '1.3rem', background: 'var(--gradient-primary)' }}>
                {(selectedCandidate.full_name || 'C').charAt(0).toUpperCase()}
              </div>
              <div>
                <div style={{ fontSize: '1.15rem', fontWeight: 700 }}>{selectedCandidate.full_name}</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{selectedCandidate.email}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--accent-cyan)', marginTop: '2px' }}>
                  {selectedCandidate.student_profile?.target_role || 'Software Engineer Candidate'}
                </div>
              </div>
            </div>

            <div className="grid-3" style={{ marginBottom: '1.5rem' }}>
              <div className="stat-card" style={{ textAlign: 'center' }}>
                <div className="stat-label">Readiness Index</div>
                <div className="stat-value" style={{ color: 'var(--accent-emerald)', fontSize: '1.4rem' }}>
                  {selectedCandidate.student_profile?.readiness_score || 85}%
                </div>
              </div>
              <div className="stat-card" style={{ textAlign: 'center' }}>
                <div className="stat-label">Verified Skills</div>
                <div className="stat-value" style={{ color: 'var(--accent-cyan)', fontSize: '1.4rem' }}>
                  {(selectedCandidate.student_profile?.skills || []).length || 6}
                </div>
              </div>
              <div className="stat-card" style={{ textAlign: 'center' }}>
                <div className="stat-label">ATS Score</div>
                <div className="stat-value" style={{ color: 'var(--accent-violet)', fontSize: '1.4rem' }}>
                  88
                </div>
              </div>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <h4 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '8px', color: 'var(--text-secondary)' }}>Verified Skill Matrix</h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {(selectedCandidate.student_profile?.skills || ['Python', 'FastAPI', 'PostgreSQL', 'React', 'Docker']).map((sk: string, i: number) => (
                  <span key={i} className="skill-tag matched">{sk}</span>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button className="btn-primary" style={{ flex: 1 }} onClick={() => { addToShortlist(selectedCandidate.id); setSelectedCandidate(null); }}>
                <Star size={16} /> Shortlist Candidate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
