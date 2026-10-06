'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { interviewAPI } from '@/lib/api';
import {
  Mic, Send, Play, Square, Clock, Award, MessageSquare,
  ChevronRight, BarChart3, Target, Sparkles, User, Bot
} from 'lucide-react';

const ROLES = ['Frontend Developer', 'Backend Developer', 'Full Stack Developer', 'Data Scientist', 'DevOps Engineer'];
const DIFFICULTIES = ['easy', 'medium', 'hard'];

export default function InterviewsPage() {
  const { user, token, isLoading } = useAuth();
  const router = useRouter();
  const chatEndRef = useRef<HTMLDivElement>(null);

  const [activeTab, setActiveTab] = useState<'new' | 'history'>('new');
  const [role, setRole] = useState('');
  const [difficulty, setDifficulty] = useState('medium');
  const [session, setSession] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [starting, setStarting] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);

  useEffect(() => { if (!isLoading && !user) router.push('/login'); }, [user, isLoading, router]);

  useEffect(() => {
    if (token) {
      interviewAPI.history(token).then(data => setHistory(Array.isArray(data) ? data : [])).catch(() => {});
    }
  }, [token]);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  async function startInterview() {
    if (!role || !token) return;
    setStarting(true);
    try {
      const res = await interviewAPI.start({ role, difficulty }, token);
      setSession(res);
      setMessages([{
        role: 'ai',
        content: res.question || res.current_question || `Welcome! Let's begin your ${role} mock interview. ${res.questions?.[0] || 'Tell me about yourself and your experience.'}`
      }]);
      setSummary(null);
    } catch (err) { console.error(err); }
    finally { setStarting(false); }
  }

  async function sendAnswer() {
    if (!answer.trim() || !session || !token) return;
    setMessages(prev => [...prev, { role: 'user', content: answer }]);
    const currentAnswer = answer;
    setAnswer(''); setLoading(true);
    try {
      const res = await interviewAPI.respond(session.session_id || session.id, currentAnswer, token);
      if (res.next_question || res.question) {
        setMessages(prev => [...prev, {
          role: 'ai',
          content: res.feedback ? `**Feedback:** ${res.feedback}\n\n**Next Question:** ${res.next_question || res.question}` : (res.next_question || res.question)
        }]);
      } else if (res.feedback) {
        setMessages(prev => [...prev, { role: 'ai', content: `**Feedback:** ${res.feedback}` }]);
      }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }

  async function endInterview() {
    if (!session || !token) return;
    setLoading(true);
    try {
      const res = await interviewAPI.end(session.session_id || session.id, token);
      setSummary(res);
      setSession(null);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }

  if (isLoading || !user) return <div className="loading-page"><div className="spinner" /><span>Loading...</span></div>;

  return (
    <div className="page-container animate-in">
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <Mic size={20} style={{ color: 'var(--accent-amber)' }} />
          <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>AI Interview Simulator</span>
        </div>
        <h1 className="page-title">Mock <span className="gradient-text">Interviews</span></h1>
        <p className="page-subtitle">Practice with AI-generated questions and receive structured feedback.</p>
      </div>

      <div className="tab-bar">
        <button className={`tab-item ${activeTab === 'new' ? 'active' : ''}`} onClick={() => setActiveTab('new')}>
          <Sparkles size={14} /> New Interview
        </button>
        <button className={`tab-item ${activeTab === 'history' ? 'active' : ''}`} onClick={() => setActiveTab('history')}>
          <Clock size={14} /> History
        </button>
      </div>

      {activeTab === 'new' && !session && !summary && (
        <div className="glass-panel-static" style={{ padding: '2rem', maxWidth: '600px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1.25rem' }}>Configure Your Interview</h3>
          <div className="form-group">
            <label className="form-label">Target Role</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {ROLES.map(r => (
                <button key={r} onClick={() => setRole(r)} style={{
                  padding: '8px 16px', borderRadius: 'var(--radius-full)',
                  background: role === r ? 'hsla(38, 92%, 50%, 0.15)' : 'var(--bg-input)',
                  border: `1px solid ${role === r ? 'hsla(38, 92%, 50%, 0.5)' : 'var(--border-subtle)'}`,
                  color: role === r ? 'var(--accent-amber)' : 'var(--text-secondary)',
                  fontWeight: role === r ? 600 : 400,
                  cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: '0.85rem', transition: 'all 0.2s'
                }}>{r}</button>
              ))}
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Difficulty</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              {DIFFICULTIES.map(d => (
                <button key={d} onClick={() => setDifficulty(d)} style={{
                  padding: '8px 20px', borderRadius: 'var(--radius-full)',
                  background: difficulty === d ? 'hsla(265, 89%, 66%, 0.15)' : 'var(--bg-input)',
                  border: `1px solid ${difficulty === d ? 'hsla(265, 89%, 66%, 0.5)' : 'var(--border-subtle)'}`,
                  color: difficulty === d ? 'var(--accent-violet)' : 'var(--text-secondary)',
                  fontWeight: difficulty === d ? 600 : 400, textTransform: 'capitalize',
                  cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: '0.85rem', transition: 'all 0.2s'
                }}>{d}</button>
              ))}
            </div>
          </div>
          <button className="btn-primary" onClick={startInterview} disabled={!role || starting} style={{ marginTop: '0.5rem' }}>
            {starting ? <><div className="spinner" style={{ width: 16, height: 16 }} /> Starting...</>
              : <><Play size={16} /> Start Interview</>}
          </button>
        </div>
      )}

      {/* Active Interview Chat */}
      {session && (
        <div className="animate-in">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div className="badge badge-primary"><Mic size={12} /> Live Interview — {role}</div>
            <button className="btn-secondary btn-sm" onClick={endInterview} disabled={loading}>
              <Square size={14} /> End Interview
            </button>
          </div>
          <div className="glass-panel-static" style={{ padding: '0', overflow: 'hidden' }}>
            <div className="chat-container" style={{ minHeight: '400px', maxHeight: '500px' }}>
              {messages.map((msg, i) => (
                <div key={i} className={`chat-bubble ${msg.role === 'ai' ? 'ai' : 'user'}`}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                    {msg.role === 'ai' ? <><Bot size={12} /> Interviewer</> : <><User size={12} /> You</>}
                  </div>
                  <div style={{ whiteSpace: 'pre-wrap' }}>{msg.content}</div>
                </div>
              ))}
              {loading && (
                <div className="chat-bubble ai">
                  <div className="spinner" style={{ width: 16, height: 16 }} />
                </div>
              )}
              <div ref={chatEndRef} />
            </div>
            <div style={{ padding: '1rem', borderTop: '1px solid var(--border-subtle)', display: 'flex', gap: '10px' }}>
              <input
                className="form-input"
                style={{ flex: 1 }}
                placeholder="Type your answer..."
                value={answer}
                onChange={e => setAnswer(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendAnswer(); } }}
                disabled={loading}
              />
              <button className="btn-primary btn-sm" onClick={sendAnswer} disabled={!answer.trim() || loading}>
                <Send size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Summary */}
      {summary && (
        <div className="animate-in">
          <h2 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Award size={18} style={{ color: 'var(--accent-amber)' }} /> Interview Summary
          </h2>
          <div className="grid-3" style={{ marginBottom: '1.5rem' }}>
            <div className="stat-card" style={{ textAlign: 'center' }}>
              <div className="stat-label">Overall Score</div>
              <div className="stat-value" style={{ color: 'var(--accent-amber)' }}>{summary.overall_score ?? summary.score ?? 'N/A'}</div>
            </div>
            <div className="stat-card" style={{ textAlign: 'center' }}>
              <div className="stat-label">Questions Answered</div>
              <div className="stat-value" style={{ color: 'var(--accent-cyan)' }}>{summary.questions_answered ?? summary.total_questions ?? 'N/A'}</div>
            </div>
            <div className="stat-card" style={{ textAlign: 'center' }}>
              <div className="stat-label">Avg Depth Score</div>
              <div className="stat-value" style={{ color: 'var(--accent-violet)' }}>{summary.avg_depth_score ?? 'N/A'}</div>
            </div>
          </div>
          {summary.key_improvements?.length > 0 && (
            <div className="glass-panel-static" style={{ padding: '1.25rem' }}>
              <h4 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '10px' }}>Key Improvements</h4>
              {summary.key_improvements.map((imp: string, i: number) => (
                <div key={i} style={{ display: 'flex', gap: '8px', padding: '6px 0', fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                  <Target size={14} style={{ color: 'var(--accent-rose)', flexShrink: 0, marginTop: '3px' }} />
                  {imp}
                </div>
              ))}
            </div>
          )}
          <button className="btn-primary" onClick={() => { setSummary(null); setMessages([]); }} style={{ marginTop: '1.5rem' }}>
            <Play size={16} /> Start New Interview
          </button>
        </div>
      )}

      {/* History Tab */}
      {activeTab === 'history' && !session && !summary && (
        <div>
          {history.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon"><MessageSquare size={28} style={{ color: 'var(--text-muted)' }} /></div>
              <h3>No interview history</h3>
              <p>Complete your first mock interview to see results here.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {history.map((h: any, i: number) => (
                <div key={i} className="glass-panel-static" style={{ padding: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.95rem', marginBottom: '4px' }}>{h.role || 'Interview Session'}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', gap: '12px' }}>
                      <span><Clock size={11} /> {h.created_at ? new Date(h.created_at).toLocaleDateString() : 'Recent'}</span>
                      <span><Award size={11} /> Score: {h.overall_score ?? 'N/A'}</span>
                    </div>
                  </div>
                  <span className={`badge ${(h.overall_score ?? 0) >= 70 ? 'badge-success' : 'badge-warning'}`}>
                    {h.difficulty || 'medium'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
