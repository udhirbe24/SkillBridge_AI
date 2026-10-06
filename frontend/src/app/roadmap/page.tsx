'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { roadmapAPI } from '@/lib/api';
import {
  Map, Plus, Clock, CheckCircle2, Circle, Play, BookOpen,
  TrendingUp, ChevronDown, ChevronRight, Target
} from 'lucide-react';

const TARGET_ROLES = [
  'Frontend Developer', 'Backend Developer', 'Full Stack Developer',
  'Data Scientist', 'DevOps Engineer', 'Machine Learning Engineer',
];

export default function RoadmapPage() {
  const { user, token, isLoading } = useAuth();
  const router = useRouter();
  const [roadmaps, setRoadmaps] = useState<any[]>([]);
  const [selectedRoadmap, setSelectedRoadmap] = useState<any>(null);
  const [generating, setGenerating] = useState(false);
  const [targetRole, setTargetRole] = useState('');
  const [showGenerator, setShowGenerator] = useState(false);
  const [loadingList, setLoadingList] = useState(true);

  useEffect(() => { if (!isLoading && !user) router.push('/login'); }, [user, isLoading, router]);

  useEffect(() => {
    if (token) {
      roadmapAPI.list(token).then(data => {
        setRoadmaps(Array.isArray(data) ? data : []);
      }).catch(() => {}).finally(() => setLoadingList(false));
    }
  }, [token]);

  async function handleGenerate() {
    if (!targetRole || !token) return;
    setGenerating(true);
    try {
      const result = await roadmapAPI.generate(targetRole, token);
      setRoadmaps(prev => [result, ...prev]);
      setSelectedRoadmap(result);
      setShowGenerator(false);
    } catch (err) { console.error(err); }
    finally { setGenerating(false); }
  }

  async function updateItemStatus(roadmapId: string, itemId: string, status: string) {
    if (!token) return;
    try {
      await roadmapAPI.updateItem(roadmapId, itemId, status, token);
      if (selectedRoadmap?.id === roadmapId) {
        setSelectedRoadmap((prev: any) => ({
          ...prev,
          items: prev.items?.map((item: any) =>
            item.id === itemId ? { ...item, status } : item
          )
        }));
      }
    } catch (err) { console.error(err); }
  }

  if (isLoading || !user) return <div className="loading-page"><div className="spinner" /><span>Loading...</span></div>;

  const statusIcon = (status: string) => {
    if (status === 'completed') return <CheckCircle2 size={16} style={{ color: 'var(--accent-emerald)' }} />;
    if (status === 'in_progress') return <Play size={14} style={{ color: 'var(--accent-cyan)' }} />;
    return <Circle size={14} style={{ color: 'var(--text-muted)' }} />;
  };

  return (
    <div className="page-container animate-in">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <Map size={20} style={{ color: 'var(--accent-emerald)' }} />
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Career Planning</span>
          </div>
          <h1 className="page-title">Career <span className="gradient-text">Roadmap</span></h1>
          <p className="page-subtitle">AI-generated learning paths based on your skill gaps.</p>
        </div>
        <button className="btn-primary" onClick={() => setShowGenerator(!showGenerator)}>
          <Plus size={16} /> Generate Roadmap
        </button>
      </div>

      {/* Generator Panel */}
      {showGenerator && (
        <div className="glass-panel-static animate-in" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem' }}>Choose a Target Role</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '1.25rem' }}>
            {TARGET_ROLES.map(role => (
              <button key={role} onClick={() => setTargetRole(role)} style={{
                padding: '8px 16px', borderRadius: 'var(--radius-full)',
                background: targetRole === role ? 'hsla(152, 76%, 48%, 0.15)' : 'var(--bg-input)',
                border: `1px solid ${targetRole === role ? 'hsla(152, 76%, 48%, 0.5)' : 'var(--border-subtle)'}`,
                color: targetRole === role ? 'var(--accent-emerald)' : 'var(--text-secondary)',
                fontWeight: targetRole === role ? 600 : 400,
                cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: '0.85rem',
                transition: 'all 0.2s'
              }}>{role}</button>
            ))}
          </div>
          <button className="btn-primary" onClick={handleGenerate} disabled={!targetRole || generating}>
            {generating ? <><div className="spinner" style={{ width: 16, height: 16 }} /> Generating...</>
              : <><Target size={16} /> Generate Personalized Roadmap</>}
          </button>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: selectedRoadmap ? '300px 1fr' : '1fr', gap: '1.5rem' }}>
        {/* Roadmap List */}
        <div>
          <h3 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Your Roadmaps
          </h3>
          {loadingList ? (
            <div className="loading-page" style={{ minHeight: '150px' }}><div className="spinner" /></div>
          ) : roadmaps.length === 0 ? (
            <div className="empty-state" style={{ padding: '2rem' }}>
              <div className="empty-state-icon" style={{ width: '48px', height: '48px' }}><Map size={22} style={{ color: 'var(--text-muted)' }} /></div>
              <h3 style={{ fontSize: '1rem' }}>No roadmaps yet</h3>
              <p style={{ fontSize: '0.85rem' }}>Generate your first career roadmap above.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {roadmaps.map((rm: any, i: number) => (
                <div key={rm.id || i} onClick={() => setSelectedRoadmap(rm)}
                  className="glass-panel" style={{
                    padding: '1rem', cursor: 'pointer',
                    borderColor: selectedRoadmap?.id === rm.id ? 'var(--border-glow)' : undefined
                  }}>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '4px' }}>{rm.target_role}</div>
                  <div style={{ display: 'flex', gap: '12px', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    <span><Clock size={11} /> {rm.total_estimated_hours ?? 0}h</span>
                    <span><TrendingUp size={11} /> {Math.round(rm.overall_readiness ?? 0)}%</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Roadmap Detail Timeline */}
        {selectedRoadmap && (
          <div className="animate-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div>
                <h2 style={{ fontSize: '1.3rem', fontWeight: 700 }}>{selectedRoadmap.target_role}</h2>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  {selectedRoadmap.items?.length ?? 0} learning modules · {selectedRoadmap.total_estimated_hours ?? 0} hours estimated
                </p>
              </div>
              <div className="badge badge-success">
                <TrendingUp size={12} /> {Math.round(selectedRoadmap.overall_readiness ?? 0)}% Ready
              </div>
            </div>

            <div className="timeline">
              {(selectedRoadmap.items || []).sort((a: any, b: any) => (a.item_order || a.order || 0) - (b.item_order || b.order || 0)).map((item: any, i: number) => (
                <div key={item.id || i} className="timeline-item">
                  <div className={`timeline-dot ${item.status === 'completed' ? 'completed' : item.status === 'in_progress' ? 'active' : ''}`} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                        {statusIcon(item.status)}
                        <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>{item.title}</span>
                      </div>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '8px' }}>
                        {item.description?.substring(0, 150)}{item.description?.length > 150 ? '...' : ''}
                      </p>
                      <div style={{ display: 'flex', gap: '12px', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        <span className="skill-tag">{item.skill_name}</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Clock size={11} /> {item.estimated_hours}h</span>
                      </div>
                    </div>
                    <select
                      value={item.status}
                      onChange={e => updateItemStatus(selectedRoadmap.id, item.id, e.target.value)}
                      className="form-select" style={{ width: '130px', fontSize: '0.8rem', padding: '6px 10px' }}>
                      <option value="pending">Pending</option>
                      <option value="in_progress">In Progress</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
