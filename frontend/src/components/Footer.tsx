'use client';

import React from 'react';
import Link from 'next/link';
import { Cpu, Github, ExternalLink } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="app-footer">
      <div className="footer-inner">
        <div className="footer-grid">
          {/* Brand */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <div className="brand-icon" style={{ width: '32px', height: '32px' }}>
                <Cpu size={18} color="#fff" />
              </div>
              <span style={{ fontWeight: 700, fontSize: '1rem' }}>
                SkillBridge <span className="gradient-text">AI</span>
              </span>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', lineHeight: 1.6, maxWidth: '280px' }}>
              AI-powered career intelligence bridging university education and industry demands.
            </p>
          </div>

          {/* Platform */}
          <div>
            <h4 className="footer-heading">Platform</h4>
            <Link href="/dashboard" className="footer-link">Dashboard</Link>
            <Link href="/resumes" className="footer-link">Resume Analysis</Link>
            <Link href="/skills" className="footer-link">Skill Gap Engine</Link>
            <Link href="/roadmap" className="footer-link">Career Roadmap</Link>
          </div>

          {/* Features */}
          <div>
            <h4 className="footer-heading">Features</h4>
            <Link href="/assessments" className="footer-link">Coding Assessments</Link>
            <Link href="/interviews" className="footer-link">Mock Interviews</Link>
            <Link href="/jobs" className="footer-link">Job Matching</Link>
          </div>

          {/* Resources */}
          <div>
            <h4 className="footer-heading">Resources</h4>
            <a href="https://github.com/udhirbe24/SkillBridge_AI" target="_blank" rel="noopener noreferrer" className="footer-link">
              <Github size={13} /> GitHub <ExternalLink size={10} style={{ opacity: 0.5 }} />
            </a>
            <a href="/docs" className="footer-link">API Documentation</a>
          </div>
        </div>

        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} SkillBridge AI. Built with FastAPI + Next.js 14.</span>
          <span style={{ color: 'var(--text-muted)' }}>University Capstone Project</span>
        </div>
      </div>
    </footer>
  );
}
