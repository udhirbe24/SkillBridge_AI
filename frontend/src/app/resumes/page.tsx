'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { resumeAPI } from '@/lib/api';
import {
  FileText, Upload, CheckCircle2, AlertCircle, File, Trash2,
  Eye, Clock, Award, TrendingUp, X
} from 'lucide-react';

export default function ResumesPage() {
  const { user, token, isLoading } = useAuth();
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [resumes, setResumes] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedResume, setSelectedResume] = useState<any>(null);
  const [loadingList, setLoadingList] = useState(true);

  useEffect(() => { if (!isLoading && !user) router.push('/login'); }, [user, isLoading, router]);

  useEffect(() => {
    if (token) {
      resumeAPI.list(token).then(setResumes).catch(() => {}).finally(() => setLoadingList(false));
    }
  }, [token]);

  async function handleUpload(file: File) {
    if (!token) return;
    if (!file.name.endsWith('.pdf') && !file.name.endsWith('.docx')) {
      setError('Only PDF and DOCX files are supported'); return;
    }
    if (file.size > 5 * 1024 * 1024) { setError('File must be under 5MB'); return; }
    setError(''); setSuccess(''); setUploading(true);
    try {
      const result = await resumeAPI.upload(file, token);
      setSuccess('Resume uploaded and parsed successfully!');
      setResumes(prev => [result, ...prev]);
    } catch (err: any) {
      setError(err.message || 'Upload failed');
    } finally { setUploading(false); }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault(); setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleUpload(file);
  }

  if (isLoading || !user) return <div className="loading-page"><div className="spinner" /><span>Loading...</span></div>;

  return (
    <div className="page-container animate-in">
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <FileText size={20} style={{ color: 'var(--accent-cyan)' }} />
          <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Resume Intelligence</span>
        </div>
        <h1 className="page-title">Resume <span className="gradient-text">Analysis</span></h1>
        <p className="page-subtitle">Upload your resume for AI-powered parsing, skill extraction, and ATS scoring.</p>
      </div>

      {/* Upload Zone */}
      <div className={`upload-zone ${dragging ? 'dragging' : ''}`}
        onDragOver={e => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileRef.current?.click()}
        style={{ marginBottom: '2rem' }}>
        <input ref={fileRef} type="file" accept=".pdf,.docx" hidden
          onChange={e => { const f = e.target.files?.[0]; if (f) handleUpload(f); }} />
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
          <div style={{
            width: '64px', height: '64px', borderRadius: '50%',
            background: 'hsla(190, 95%, 50%, 0.1)', display: 'flex',
            alignItems: 'center', justifyContent: 'center'
          }}>
            {uploading ? <div className="spinner" /> : <Upload size={28} style={{ color: 'var(--accent-cyan)' }} />}
          </div>
        </div>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.5rem' }}>
          {uploading ? 'Analyzing your resume...' : 'Drop your resume here or click to browse'}
        </h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
          Supports PDF and DOCX — Max 5MB
        </p>
      </div>

      {error && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', borderRadius: 'var(--radius-sm)', background: 'hsla(350, 89%, 60%, 0.1)', border: '1px solid hsla(350, 89%, 60%, 0.3)', color: 'var(--accent-rose)', fontSize: '0.85rem', marginBottom: '1rem' }}>
          <AlertCircle size={16} /> {error}
          <button onClick={() => setError('')} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: 'inherit', cursor: 'pointer' }}><X size={14} /></button>
        </div>
      )}
      {success && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', borderRadius: 'var(--radius-sm)', background: 'hsla(152, 76%, 48%, 0.1)', border: '1px solid hsla(152, 76%, 48%, 0.3)', color: 'var(--accent-emerald)', fontSize: '0.85rem', marginBottom: '1rem' }}>
          <CheckCircle2 size={16} /> {success}
          <button onClick={() => setSuccess('')} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: 'inherit', cursor: 'pointer' }}><X size={14} /></button>
        </div>
      )}

      {/* Resume List */}
      <h2 className="section-title">Your Resumes</h2>
      {loadingList ? (
        <div className="loading-page" style={{ minHeight: '200px' }}><div className="spinner" /></div>
      ) : resumes.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon"><FileText size={28} style={{ color: 'var(--text-muted)' }} /></div>
          <h3>No resumes uploaded yet</h3>
          <p>Upload your first resume to get started with AI-powered analysis and skill extraction.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {resumes.map((resume: any, i: number) => (
            <div key={resume.id || i} className="glass-panel-static" style={{
              padding: '1.25rem', display: 'flex', alignItems: 'center',
              justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1 }}>
                <div style={{
                  width: '44px', height: '44px', borderRadius: 'var(--radius-sm)',
                  background: 'hsla(190, 95%, 50%, 0.1)', display: 'flex',
                  alignItems: 'center', justifyContent: 'center', flexShrink: 0
                }}>
                  <File size={22} style={{ color: 'var(--accent-cyan)' }} />
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.95rem', marginBottom: '4px' }}>
                    {resume.original_filename || resume.filename || 'Resume'}
                  </div>
                  <div style={{ display: 'flex', gap: '16px', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Clock size={12} /> {resume.created_at ? new Date(resume.created_at).toLocaleDateString() : 'Just now'}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Award size={12} /> Score: {resume.ats_score ?? 'Pending'}
                    </span>
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <span className={`badge ${resume.status === 'completed' ? 'badge-success' : 'badge-warning'}`}>
                  {resume.status || 'processed'}
                </span>
                <button className="btn-icon" onClick={() => setSelectedResume(resume)} title="View Details">
                  <Eye size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Resume Detail Modal */}
      {selectedResume && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 500, padding: '2rem'
        }} onClick={() => setSelectedResume(null)}>
          <div className="glass-panel-static animate-in" style={{
            maxWidth: '700px', width: '100%', maxHeight: '80vh', overflow: 'auto', padding: '2rem'
          }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Resume Analysis</h3>
              <button className="btn-icon" onClick={() => setSelectedResume(null)}><X size={18} /></button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
              <div className="stat-card">
                <div className="stat-label">ATS Score</div>
                <div className="stat-value" style={{ color: 'var(--accent-emerald)' }}>{selectedResume.ats_score ?? 'N/A'}</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Skills Found</div>
                <div className="stat-value" style={{ color: 'var(--accent-cyan)' }}>{selectedResume.extracted_skills?.length ?? 0}</div>
              </div>
            </div>
            {selectedResume.extracted_skills?.length > 0 && (
              <div style={{ marginBottom: '1.5rem' }}>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '10px', color: 'var(--text-secondary)' }}>Extracted Skills</h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {selectedResume.extracted_skills.map((skill: string, i: number) => (
                    <span key={i} className="skill-tag matched">{skill}</span>
                  ))}
                </div>
              </div>
            )}
            {selectedResume.extracted_text && (
              <div>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '10px', color: 'var(--text-secondary)' }}>Extracted Text Preview</h4>
                <div style={{
                  padding: '1rem', background: 'hsla(222, 47%, 5%, 0.8)', borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-subtle)', fontSize: '0.82rem', color: 'var(--text-muted)',
                  maxHeight: '200px', overflow: 'auto', lineHeight: 1.6, fontFamily: 'var(--font-mono)'
                }}>
                  {selectedResume.extracted_text.substring(0, 1000)}...
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
