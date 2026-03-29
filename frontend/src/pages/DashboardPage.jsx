// src/pages/DashboardPage.jsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ScoreRing from '../components/ScoreRing';
import IssueCard from '../components/IssueCard';
import ArchDiagram from '../components/ArchDiagram';
import DepsPanel from '../components/DepsPanel';
import './DashboardPage.css';

// Fallback demo data if no session results
const DEMO_DATA = {
  score: 34,
  summary: "Critical vulnerabilities detected. This code has SQL injection, hardcoded secrets, and missing input validation. Immediate remediation required before deployment.",
  security: {
    grade: "F",
    issues: [
      { severity: "critical", title: "SQL Injection", description: "User input directly concatenated into SQL query on line 12. Use parameterized queries.", line: 12, fix: "Use db.query('SELECT * FROM users WHERE id = ?', [userId])" },
      { severity: "critical", title: "Hardcoded Secret", description: "API secret key and DB password stored in plaintext source code.", line: 5, fix: "Move to environment variables: process.env.SECRET_KEY" },
      { severity: "high", title: "Missing Authentication Middleware", description: "Endpoints have no rate limiting or brute force protection.", line: 18, fix: "Add express-rate-limit and helmet middleware" },
      { severity: "medium", title: "Sensitive Data Exposure", description: "Secret key returned directly in login response.", line: 24, fix: "Generate a proper JWT with expiry instead of returning raw secret" },
    ]
  },
  complexity: {
    score: 61,
    cyclomatic: 8,
    cognitive: 14,
    linesOfCode: 28,
    functions: 2,
    rating: "Medium",
    details: "Code has moderate complexity but critical security patterns."
  },
  dependencies: [
    { name: "express", version: "4.18.2", status: "safe", license: "MIT" },
    { name: "mysql", version: "2.18.1", status: "vulnerable", vulnerabilities: 3, severity: "high", license: "MIT" },
  ],
  architecture: {
    pattern: "Monolithic REST API",
    components: ["HTTP Layer (Express)", "SQL Database (MySQL)", "Business Logic"],
    concerns: ["No separation of concerns", "DB access in route handlers", "No middleware layer"],
    diagram: {
      nodes: [
        { id: "client", label: "Client", type: "external" },
        { id: "express", label: "Express App", type: "server" },
        { id: "routes", label: "Route Handlers", type: "module" },
        { id: "mysql", label: "MySQL DB", type: "database" },
      ],
      edges: [
        { from: "client", to: "express", label: "HTTP" },
        { from: "express", to: "routes", label: "Route" },
        { from: "routes", to: "mysql", label: "Query (Unsafe)" },
      ]
    }
  }
};

import Sidebar from '../components/Sidebar';

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [results, setResults] = useState(null);
  const [activeTab, setActiveTab] = useState('security');

  useEffect(() => {
    const stored = sessionStorage.getItem('vg_results');
    if (stored) {
      try {
        setResults(JSON.parse(stored));
      } catch {
        setResults(DEMO_DATA);
      }
    } else {
      setResults(DEMO_DATA);
    }
  }, []);

  if (!results) {
    return (
      <div className="dashboard-loading">
        <div className="spinner" />
        <p>Loading analysis results…</p>
      </div>
    );
  }

  const scoreClass =
    results.score >= 75 ? 'score-high' :
    results.score >= 45 ? 'score-medium' : 'score-low';

  const criticalCount = results.security?.issues?.filter(i => i.severity === 'critical').length || 0;
  const highCount = results.security?.issues?.filter(i => i.severity === 'high').length || 0;

  return (
    <div className="dashboard-wrapper">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />

      <main className="dashboard-content">
        {/* Main Header */}
        <header className="content-header fade-in">
          <div className="header-titles">
            <h1>Analysis Dashboard</h1>
            <p>Full suite security audit for your repository</p>
          </div>
          <div className="header-actions">
            <button className="btn-secondary" onClick={() => navigate('/analyze')}>+ New Scan</button>
            <button className="btn-primary" onClick={() => alert('Report shared successfully!')}>Share Report</button>
          </div>
        </header>
        {/* Top Metrics Row */}
        <div className="metrics-row fade-in">
          {/* Score Ring */}
          <div className={`score-card glass-card ${scoreClass}`}>
            <ScoreRing score={results.score} />
            <div className="score-info">
              <div className="score-label">Cybersecurity Posture</div>
              <p className="score-summary">{results.summary}</p>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="quick-stats">
            <div className="stat-box glass-card danger-box">
              <div className="stat-box-icon">🔴</div>
              <div className="stat-box-value">{criticalCount}</div>
              <div className="stat-box-label">Critical</div>
            </div>
            <div className="stat-box glass-card warning-box">
              <div className="stat-box-icon">🟠</div>
              <div className="stat-box-value">{highCount}</div>
              <div className="stat-box-label">High</div>
            </div>
            <div className="stat-box glass-card info-box">
              <div className="stat-box-icon">📊</div>
              <div className="stat-box-value">{results.complexity?.cyclomatic || '—'}</div>
              <div className="stat-box-label">Complexity</div>
            </div>
            <div className="stat-box glass-card dep-box">
              <div className="stat-box-icon">📦</div>
              <div className="stat-box-value">{results.dependencies?.length || 0}</div>
              <div className="stat-box-label">Deps</div>
            </div>
          </div>
        </div>

        {/* Quick Tabs Summary (Removed top navigation, replaced with Sidebar) */}
        {!['security', 'complexity', 'dependencies', 'architecture'].includes(activeTab) && (
          <div className="tab-nav-backup hidden">
            {/* Kept for compatibility if needed */}
          </div>
        )}

        {/* Tab Content */}
        <div className="tab-content fade-in-delay-2">

          {/* Security Tab */}
          {activeTab === 'security' && (
            <div className="issues-grid">
              {(results.security?.issues || []).map((issue, i) => (
                <IssueCard key={i} issue={issue} index={i} />
              ))}
              {(!results.security?.issues?.length) && (
                <div className="glass-card empty-state">
                  <span style={{ fontSize: '3rem' }}>✅</span>
                  <p>No security issues detected!</p>
                </div>
              )}
            </div>
          )}

          {/* Complexity Tab */}
          {activeTab === 'complexity' && (
            <div className="complexity-content">
              <div className="complexity-grid">
                {[
                  { label: 'Cyclomatic Complexity', value: results.complexity?.cyclomatic, icon: '🔄', desc: 'Number of independent code paths' },
                  { label: 'Cognitive Complexity', value: results.complexity?.cognitive, icon: '🧠', desc: 'How hard the code is to understand' },
                  { label: 'Lines of Code', value: results.complexity?.linesOfCode, icon: '📝', desc: 'Total executable lines' },
                  { label: 'Functions', value: results.complexity?.functions, icon: '⚙️', desc: 'Number of function definitions' },
                ].map((m, i) => (
                  <div key={i} className="complexity-card glass-card">
                    <div className="complexity-icon">{m.icon}</div>
                    <div className="complexity-value">{m.value ?? '—'}</div>
                    <div className="complexity-label">{m.label}</div>
                    <div className="complexity-desc">{m.desc}</div>
                  </div>
                ))}
              </div>
              <div className="complexity-detail glass-card">
                <h3>📋 Complexity Analysis</h3>
                <div className="detail-row">
                  <span>Rating</span>
                  <span className={`badge ${results.complexity?.rating === 'Low' ? 'badge-success' : results.complexity?.rating === 'Medium' ? 'badge-warning' : 'badge-danger'}`}>
                    {results.complexity?.rating || 'Unknown'}
                  </span>
                </div>
                <p className="detail-text">{results.complexity?.details}</p>
              </div>
            </div>
          )}

          {/* Dependencies Tab */}
          {activeTab === 'dependencies' && (
            <DepsPanel deps={results.dependencies || []} />
          )}

          {/* Architecture Tab */}
          {activeTab === 'architecture' && (
            <ArchDiagram arch={results.architecture} />
          )}
        </div>
      </main>
    </div>
  );
}
