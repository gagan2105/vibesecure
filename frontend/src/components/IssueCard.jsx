// src/components/IssueCard.jsx
import { useState } from 'react';
import './IssueCard.css';

const SEVERITY_MAP = {
  critical: { color: '#ef4444', bg: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.25)', icon: '🔴', label: 'Critical' },
  high:     { color: '#f97316', bg: 'rgba(249,115,22,0.08)', border: 'rgba(249,115,22,0.25)', icon: '🟠', label: 'High' },
  medium:   { color: '#f59e0b', bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.25)', icon: '🟡', label: 'Medium' },
  low:      { color: '#60a5fa', bg: 'rgba(96,165,250,0.08)', border: 'rgba(96,165,250,0.25)', icon: '🔵', label: 'Low' },
  info:     { color: '#00d4ff', bg: 'rgba(0,212,255,0.08)',  border: 'rgba(0,212,255,0.2)',   icon: 'ℹ️', label: 'Info' },
};

export default function IssueCard({ issue, index }) {
  const [expanded, setExpanded] = useState(false);
  const sev = SEVERITY_MAP[issue.severity] || SEVERITY_MAP.info;

  return (
    <div
      className="issue-card glass-card"
      style={{
        '--sev-color': sev.color,
        '--sev-bg': sev.bg,
        '--sev-border': sev.border,
        animationDelay: `${index * 0.07}s`
      }}
      id={`issue-card-${index}`}
    >
      <div className="issue-header" onClick={() => setExpanded(e => !e)}>
        <div className="issue-left">
          <span className="issue-sev-icon">{sev.icon}</span>
          <div>
            <div className="issue-title">{issue.title}</div>
            {issue.line && (
              <div className="issue-line">Line {issue.line}</div>
            )}
          </div>
        </div>
        <div className="issue-right">
          <span className="badge" style={{
            background: sev.bg,
            border: `1px solid ${sev.border}`,
            color: sev.color
          }}>
            {sev.label}
          </span>
          <span className="expand-icon">{expanded ? '▲' : '▼'}</span>
        </div>
      </div>

      {expanded && (
        <div className="issue-body">
          <div className="issue-section">
            <div className="issue-section-label">⚠️ Description</div>
            <p className="issue-desc">{issue.description}</p>
          </div>
          {issue.fix && (
            <div className="issue-section">
              <div className="issue-section-label">✅ Recommended Fix</div>
              <div className="issue-fix-box">
                <code>{issue.fix}</code>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
