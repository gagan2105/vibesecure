// src/pages/AnalyzePage.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import './AnalyzePage.css';
import './DashboardPage.css'; // Shared layout styles

const EXAMPLE_CODE = `const express = require('express');
const app = express();
const mysql = require('mysql');

// ⚠️ Hardcoded secret
const DB_PASSWORD = "admin123";
const SECRET_KEY = "my-super-secret-key-1234";

app.get('/user', (req, res) => {
  const userId = req.query.id;
  // ⚠️ SQL Injection vulnerability
  const query = "SELECT * FROM users WHERE id = " + userId;
  db.query(query, (err, result) => {
    res.json(result);
  });
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  // ⚠️ No input validation or rate limiting
  if (username === "admin" && password === DB_PASSWORD) {
    res.json({ token: SECRET_KEY });
  }
});

app.listen(3000);`;

export default function AnalyzePage() {
  const { user, getToken, logout } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState('paste'); // 'paste' | 'git' | 'zip'
  const [gitUrl, setGitUrl] = useState('');
  const [file, setFile] = useState(null);
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAnalyze = async () => {
    let payload = {};
    let isFormData = false;

    if (mode === 'paste') {
      if (!code.trim()) { setError('Please paste some code to analyze.'); return; }
      payload = { code, mode: 'paste' };
    } else if (mode === 'git') {
      if (!gitUrl.trim()) { setError('Please enter a Git repository URL.'); return; }
      if (!gitUrl.startsWith('http')) { setError('Please enter a valid HTTP/HTTPS Git URL.'); return; }
      payload = { gitUrl, mode: 'git' };
    } else if (mode === 'zip') {
      if (!file) { setError('Please select a .zip folder to analyze.'); return; }
      const formData = new FormData();
      formData.append('file', file);
      formData.append('mode', 'zip');
      payload = formData;
      isFormData = true;
    }

    setError('');
    setLoading(true);

    try {
      const token = await getToken();
      const headers = { Authorization: `Bearer ${token}` };
      if (!isFormData) headers['Content-Type'] = 'application/json';

      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers,
        body: isFormData ? payload : JSON.stringify(payload),
      });

      if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg || `Server error: ${res.status}`);
      }

      const data = await res.json();
      sessionStorage.setItem('vg_results', JSON.stringify(data));
      navigate('/dashboard');
    } catch (e) {
      setError(e.message || 'Analysis failed. Check console for details.');
    } finally {
      setLoading(false);
    }
  };

  const onFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected && selected.name.endsWith('.zip')) {
      setFile(selected);
      setError('');
    } else {
      setError('Please select a valid .zip file.');
      setFile(null);
    }
  };

  const loadExample = () => setCode(EXAMPLE_CODE);

  return (
    <div className="dashboard-wrapper">
      <Sidebar />

      <main className="dashboard-content">
        <header className="content-header fade-in">
          <div className="header-titles">
            <h1>Start Analysis</h1>
            <p>Select your preferred input method below</p>
          </div>
        </header>

        {/* Input Methods Tabs */}
        <div className="input-tabs fade-in-delay-1" style={{ justifyContent: 'flex-start' }}>
          <button className={`tab-btn ${mode === 'paste' ? 'active' : ''}`} onClick={() => { setMode('paste'); setError(''); }}>
            <span>📄</span> Paste Code
          </button>
          <button className={`tab-btn ${mode === 'git' ? 'active' : ''}`} onClick={() => { setMode('git'); setError(''); }}>
            <span>🔗</span> Git Repository
          </button>
          <button className={`tab-btn ${mode === 'zip' ? 'active' : ''}`} onClick={() => { setMode('zip'); setError(''); }}>
            <span>📦</span> Zip Upload
          </button>
        </div>

        <div className="analyze-grid">
          {/* Code Input Panel */}
          <div className="code-panel glass-card fade-in-delay-1">
            <div className="panel-header">
              <div className="panel-title">
                <span className="dot red" /><span className="dot yellow" /><span className="dot green" />
                <span style={{ marginLeft: 8, color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                  {mode === 'paste' ? 'code-to-analyze.js' : mode === 'git' ? 'git-repository-url' : 'source-code.zip'}
                </span>
              </div>
              {mode === 'paste' && (
                <button id="load-example-btn" className="btn-link" onClick={loadExample}>
                  Load example ↓
                </button>
              )}
            </div>

            <div className="panel-content">
              {mode === 'paste' && (
                <textarea
                  id="code-input"
                  className="code-textarea"
                  value={code}
                  onChange={e => setCode(e.target.value)}
                  placeholder={`// Paste your code here...\n// Example: JavaScript, Python, TypeScript, Go...\n\nconst app = express();\napp.get('/user', (req, res) => {\n  // ...\n});`}
                  spellCheck={false}
                />
              )}

              {mode === 'git' && (
                <div className="git-input-container">
                  <div className="git-icon">🐙</div>
                  <h3>Analyze from Git URL</h3>
                  <p>Enter a public HTTP/HTTPS link to a GitHub or GitLab repository.</p>
                  <input
                    type="url"
                    className="git-url-input"
                    placeholder="https://github.com/username/repository.git"
                    value={gitUrl}
                    onChange={e => setGitUrl(e.target.value)}
                  />
                  <div className="git-notice">
                    ⚠️ Private repositories are not supported yet.
                  </div>
                </div>
              )}

              {mode === 'zip' && (
                <div className="zip-upload-container" onDragOver={e => e.preventDefault()} onDrop={e => { e.preventDefault(); onFileChange({ target: { files: e.dataTransfer.files } }); }}>
                  <div className="zip-icon">📂</div>
                  <h3>Analyze via Zip Upload</h3>
                  <p>Drag and drop your project folder (as .zip) or click to browse.</p>
                  <input
                    type="file"
                    id="zip-input"
                    accept=".zip"
                    onChange={onFileChange}
                    style={{ display: 'none' }}
                  />
                  <label htmlFor="zip-input" className="zip-label btn-secondary">
                    {file ? `✅ ${file.name}` : 'Select Zip File'}
                  </label>
                  {file && <p className="file-detail">{(file.size / 1024 / 1024).toFixed(2)} MB</p>}
                </div>
              )}
            </div>

            <div className="panel-footer">
              <div className="code-meta">
                {mode === 'paste' ? (
                  <>
                    <span>{code.split('\n').length} lines</span>
                    <span>·</span>
                    <span>{code.length} chars</span>
                  </>
                ) : (
                  <span>Ready for analysis</span>
                )}
              </div>
            </div>
          </div>

          {/* Info Panel */}
          <div className="info-panel fade-in-delay-2">
            <div className="what-we-check glass-card">
              <h3>🔍 What we analyze</h3>
              <ul className="check-list">
                {[
                  { icon: '🔴', label: 'SQL Injection / XSS / SSRF' },
                  { icon: '🔑', label: 'Hardcoded secrets & API keys' },
                  { icon: '📊', label: 'Cyclomatic complexity score' },
                  { icon: '📦', label: 'Dependency vulnerability audit' },
                  { icon: '🏗️', label: 'Architecture pattern detection' },
                  { icon: '✅', label: 'Actionable fix recommendations' },
                ].map((item, i) => (
                  <li key={i}>
                    <span>{item.icon}</span>
                    <span>{item.label}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="security-badge glass-card">
              <div className="security-badge-icon">🔐</div>
              <div>
                <div className="security-badge-title">Firebase Secured</div>
                <div className="security-badge-desc">Your session is authenticated. Code is processed securely and never stored.</div>
              </div>
            </div>

            <div className="analyze-actions">
              {error && <div className="error-box">⚠️ {error}</div>}
              <button
                id="analyze-btn"
                className="btn-primary"
                onClick={handleAnalyze}
                disabled={loading || (mode === 'paste' && !code.trim()) || (mode === 'git' && !gitUrl.trim()) || (mode === 'zip' && !file)}
                style={{ width: '100%', justifyContent: 'center', padding: '16px', fontSize: '1rem' }}
              >
                {loading ? (
                  <>
                    <span className="spinner" style={{ width: 18, height: 18 }} />
                    {mode === 'git' ? 'Cloning & Analyzing…' : mode === 'zip' ? 'Extracting & Analyzing…' : 'Analyzing…'}
                  </>
                ) : (
                  '🚀 Run Security Analysis'
                )}
              </button>
              <p className="analyze-hint">Analysis typically takes 3–8 seconds</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
