// src/pages/WelcomePage.jsx
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useEffect } from 'react';
import './WelcomePage.css';

const FEATURES = [
  { icon: '🛡️', title: 'Security Analysis', desc: 'AI scans for OWASP Top 10, SQL injection, XSS, hardcoded secrets & more.' },
  { icon: '🧠', title: 'Complexity Metrics', desc: 'Cyclomatic complexity, cognitive load, and maintainability scores.' },
  { icon: '📦', title: 'Dependency Audit', desc: 'Real-time npm vulnerability checks against known CVE databases.' },
  { icon: '🗺️', title: 'Architecture Diagram', desc: 'Auto-generated system diagrams from your codebase structure.' },
  { icon: '⚡', title: 'Instant Feedback', desc: 'Get actionable fixes in seconds, not hours of code review.' },
  { icon: '🔐', title: 'Auth-Gated', desc: 'Firebase-secured — only authenticated developers can deploy safe code.' },
];

export default function WelcomePage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (user) navigate('/analyze');
  }, [user, navigate]);

  return (
    <div className="welcome-wrapper">
      {/* Ambient orbs */}
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />

      {/* Navbar */}
      <nav className="welcome-nav">
        <div className="nav-brand">
          <span className="brand-icon">🛡️</span>
          <span className="brand-name">VibeSecure</span>
          <span className="brand-tag">AI</span>
        </div>
        <div className="nav-actions">
          <button id="nav-login-btn" className="btn-secondary" onClick={() => navigate('/login')}>
            Sign In
          </button>
          <button id="nav-get-started-btn" className="btn-primary" onClick={() => navigate('/login')}>
            Get Started →
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section className="hero">
        <div className="hero-badge fade-in">
          <span className="pulse-dot" />
          AI-Powered DevSecOps · Live
        </div>
        <h1 className="hero-title fade-in-delay-1">
          Secure Your Code<br />
          <span className="gradient-text">Before It Kills You</span>
        </h1>
        <p className="hero-subtitle fade-in-delay-2">
          VibeSecure uses cutting-edge LLM analysis to detect vulnerabilities,<br />
          audit dependencies, and map your architecture — in seconds.
        </p>
        <div className="hero-actions fade-in-delay-3">
          <button id="hero-analyze-btn" className="btn-primary btn-xl" onClick={() => navigate('/login')}>
            🚀 Start Analyzing
          </button>
          <button id="hero-demo-btn" className="btn-secondary btn-xl" onClick={() => navigate('/login')}>
            View Demo
          </button>
        </div>
        <div className="hero-stats fade-in-delay-4">
          <div className="stat"><span className="stat-number">99.2%</span><span className="stat-label">Detection Rate</span></div>
          <div className="stat-divider" />
          <div className="stat"><span className="stat-number">&lt; 5s</span><span className="stat-label">Avg Analysis</span></div>
          <div className="stat-divider" />
          <div className="stat"><span className="stat-number">OWASP</span><span className="stat-label">Top 10 Coverage</span></div>
        </div>
      </section>

      {/* How it Works */}
      <section className="how-it-works">
        <h2 className="section-title">Analysis in <span className="gradient-text">Three Simple Steps</span></h2>
        <div className="steps-container">
          <div className="step-card glass-card">
            <div className="step-number">01</div>
            <h3>Connect Source</h3>
            <p>Paste code, link a Git repo, or upload a .zip folder.</p>
          </div>
          <div className="step-arrow">→</div>
          <div className="step-card glass-card">
            <div className="step-number">02</div>
            <h3>AI Audit</h3>
            <div className="step-progress-bar">
              <div className="step-progress-fill" />
            </div>
            <p>Our LLM scans for vulnerabilities and complexity.</p>
          </div>
          <div className="step-arrow">→</div>
          <div className="step-card glass-card">
            <div className="step-number">03</div>
            <h3>Get Dashboard</h3>
            <p>Download your report and start fixing issues instantly.</p>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="features-section">
        <h2 className="section-title">Everything you need to ship <span className="gradient-text">secure code</span></h2>
        <div className="features-grid">
          {FEATURES.map((f, i) => (
            <div key={i} className="feature-card glass-card" style={{ animationDelay: `${i * 0.08}s` }}>
              <div className="feature-icon">{f.icon}</div>
              <h3 className="feature-title">{f.title}</h3>
              <p className="feature-desc">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section">
        <div className="cta-card glass-card">
          <h2>Ready to secure your codebase?</h2>
          <p>Join the next generation of security-first developers.</p>
          <button id="cta-start-btn" className="btn-primary btn-xl" onClick={() => navigate('/login')}>
            🔐 Start Free — Sign in with Google
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="welcome-footer">
        <span>Built with ❤️ for DevSecOps</span>
        <span>·</span>
        <span>Powered by OpenRouter AI</span>
        <span>·</span>
        <span>Secured by Firebase</span>
      </footer>
    </div>
  );
}
