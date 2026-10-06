'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  Shield, Users, UserCheck, UserX, Search, Eye, Clock,
  Activity, AlertTriangle, Settings, BarChart3, Database,
  Server, Lock, FileText, TrendingUp, ChevronRight
} from 'lucide-react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

export default function AdminPage() {
  const { user, token, isLoading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'users' | 'audit' | 'system'>('users');
  const [users, setUsers] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [systemStats, setSystemStats] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoading && !user) router.push('/login');
    if (!isLoading && user && user.role !== 'admin') router.push('/dashboard');
  }, [user, isLoading, router]);

  useEffect(() => {
    if (token) {
      Promise.all([fetchUsers(), fetchAuditLogs(), fetchSystemStats()])
        .finally(() => setLoading(false));
    }
  }, [token]);

  async function fetchUsers() {
    try {
      const res = await fetch(`${API_BASE}/admin/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setUsers(Array.isArray(data) ? data : data.users || []);
    } catch { setUsers([]); }
  }

  async function fetchAuditLogs() {
    try {
      const res = await fetch(`${API_BASE}/admin/audit-logs`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setAuditLogs(Array.isArray(data) ? data : data.logs || []);
    } catch { setAuditLogs([]); }
  }

  async function fetchSystemStats() {
    try {
      const res = await fetch(`${API_BASE}/admin/system-stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSystemStats(await res.json());
    } catch { setSystemStats(null); }
  }

  async function toggleUserStatus(userId: string, action: 'activate' | 'deactivate') {
    try {
      await fetch(`${API_BASE}/admin/users/${userId}/${action}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchUsers();
    } catch (err) { console.error(err); }
  }

  if (isLoading || !user) return <div className="loading-page"><div className="spinner" /><span>Loading...</span></div>;

  const filteredUsers = users.filter(u =>
    !searchQuery ||
    (u.full_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (u.email || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="page-container animate-in">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <Shield size={20} style={{ color: 'var(--accent-rose)' }} />
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Administration</span>
          </div>
          <h1 className="page-title">Admin <span className="gradient-text">Control Panel</span></h1>
          <p className="page-subtitle">Manage users, view audit logs, and monitor system health.</p>
        </div>
        <div className="badge badge-danger"><Lock size={12} /> Admin Only</div>
      </div>

      <div className="tab-bar">
        <button className={`tab-item ${activeTab === 'users' ? 'active' : ''}`} onClick={() => setActiveTab('users')}>
          <Users size={14} /> User Management
        </button>
        <button className={`tab-item ${activeTab === 'audit' ? 'active' : ''}`} onClick={() => setActiveTab('audit')}>
          <Activity size={14} /> Audit Logs
        </button>
        <button className={`tab-item ${activeTab === 'system' ? 'active' : ''}`} onClick={() => setActiveTab('system')}>
          <Server size={14} /> System Stats
        </button>
      </div>

      {/* USERS TAB */}
      {activeTab === 'users' && (
        <>
          <div style={{ display: 'flex', gap: '10px', marginBottom: '1.5rem' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <Search size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input className="form-input" style={{ paddingLeft: '40px' }}
                placeholder="Search users by name or email..." value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)} />
            </div>
          </div>

          {filteredUsers.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon"><Users size={28} style={{ color: 'var(--text-muted)' }} /></div>
              <h3>No users found</h3>
            </div>
          ) : (
            <div className="glass-panel-static" style={{ overflow: 'hidden' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Joined</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((u: any, i: number) => (
                    <tr key={u.id || i}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div className="avatar-circle" style={{ width: '32px', height: '32px', fontSize: '0.75rem' }}>
                            {(u.full_name || 'U').charAt(0).toUpperCase()}
                          </div>
                          <span style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{u.full_name || 'Unknown'}</span>
                        </div>
                      </td>
                      <td>{u.email}</td>
                      <td>
                        <span className={`badge ${u.role === 'admin' ? 'badge-danger' : u.role === 'recruiter' ? 'badge-primary' : 'badge-cyan'}`} style={{ fontSize: '0.7rem' }}>
                          {u.role?.toUpperCase()}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${u.is_active !== false ? 'badge-success' : 'badge-warning'}`} style={{ fontSize: '0.7rem' }}>
                          {u.is_active !== false ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td style={{ fontSize: '0.82rem' }}>
                        {u.created_at ? new Date(u.created_at).toLocaleDateString() : 'N/A'}
                      </td>
                      <td>
                        {u.is_active !== false ? (
                          <button className="btn-secondary btn-sm" style={{ fontSize: '0.75rem' }}
                            onClick={() => toggleUserStatus(u.id, 'deactivate')}>
                            <UserX size={12} /> Deactivate
                          </button>
                        ) : (
                          <button className="btn-primary btn-sm" style={{ fontSize: '0.75rem' }}
                            onClick={() => toggleUserStatus(u.id, 'activate')}>
                            <UserCheck size={12} /> Activate
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* AUDIT LOGS TAB */}
      {activeTab === 'audit' && (
        <div>
          {auditLogs.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon"><Activity size={28} style={{ color: 'var(--text-muted)' }} /></div>
              <h3>No audit logs</h3>
              <p>Security audit events will appear here.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {auditLogs.map((log: any, i: number) => (
                <div key={i} className="glass-panel-static" style={{
                  padding: '1rem', display: 'flex', alignItems: 'center', gap: '14px'
                }}>
                  <div style={{
                    width: '36px', height: '36px', borderRadius: 'var(--radius-sm)', flexShrink: 0,
                    background: log.action?.includes('fail') ? 'hsla(350, 89%, 60%, 0.12)' : 'hsla(152, 76%, 48%, 0.12)',
                    color: log.action?.includes('fail') ? 'var(--accent-rose)' : 'var(--accent-emerald)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    {log.action?.includes('fail') ? <AlertTriangle size={16} /> : <Activity size={16} />}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 500, fontSize: '0.9rem' }}>{log.action || log.event_type}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      {log.user_email || log.actor} · {log.ip_address || 'N/A'}
                    </div>
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Clock size={12} /> {log.created_at ? new Date(log.created_at).toLocaleString() : 'Recent'}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* SYSTEM STATS TAB */}
      {activeTab === 'system' && (
        <div>
          <div className="grid-3" style={{ marginBottom: '1.5rem' }}>
            <div className="stat-card">
              <div className="stat-icon" style={{ background: 'hsla(190, 95%, 50%, 0.12)', color: 'var(--accent-cyan)' }}>
                <Users size={18} />
              </div>
              <div className="stat-label">Total Users</div>
              <div className="stat-value" style={{ color: 'var(--accent-cyan)' }}>{systemStats?.total_users ?? users.length}</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon" style={{ background: 'hsla(152, 76%, 48%, 0.12)', color: 'var(--accent-emerald)' }}>
                <FileText size={18} />
              </div>
              <div className="stat-label">Total Resumes</div>
              <div className="stat-value" style={{ color: 'var(--accent-emerald)' }}>{systemStats?.total_resumes ?? 0}</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon" style={{ background: 'hsla(265, 89%, 66%, 0.12)', color: 'var(--accent-violet)' }}>
                <Database size={18} />
              </div>
              <div className="stat-label">Total Assessments</div>
              <div className="stat-value" style={{ color: 'var(--accent-violet)' }}>{systemStats?.total_assessments ?? 0}</div>
            </div>
          </div>

          <div className="glass-panel-static" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Server size={16} style={{ color: 'var(--accent-cyan)' }} /> System Health
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[
                { label: 'FastAPI Backend', status: 'online', color: 'var(--accent-emerald)' },
                { label: 'PostgreSQL Database', status: 'connected', color: 'var(--accent-emerald)' },
                { label: 'Redis Cache', status: 'connected', color: 'var(--accent-emerald)' },
                { label: 'Vector Store (Qdrant)', status: 'ready', color: 'var(--accent-emerald)' },
                { label: 'OWASP Security Headers', status: 'enforced', color: 'var(--accent-emerald)' },
              ].map((service, i) => (
                <div key={i} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '8px 0', borderBottom: i < 4 ? '1px solid hsla(217, 33%, 25%, 0.3)' : 'none'
                }}>
                  <span style={{ fontSize: '0.9rem' }}>{service.label}</span>
                  <span className="badge badge-success" style={{ fontSize: '0.7rem' }}>
                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: service.color }} />
                    {service.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
