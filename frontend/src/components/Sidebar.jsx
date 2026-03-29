// src/components/Sidebar.jsx
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Sidebar({ activeTab, onTabChange }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isDashboard = location.pathname === '/dashboard';
  const isAnalyze = location.pathname === '/analyze';

  return (
    <aside className="dashboard-sidebar">
      <div className="sidebar-brand">
        <span className="brand-icon">🛡️</span>
        <h1 className="brand-name">VibeSecure <span className="brand-tag">AI</span></h1>
      </div>

      <div className="sidebar-nav">
        <div className="nav-group">
          <label>WORKSPACE</label>
          <button 
            className={`nav-item ${isAnalyze ? 'active' : ''}`} 
            onClick={() => navigate('/analyze')}
          >
            <span className="nav-icon">🔍</span> New Analysis
          </button>
          <button 
            className={`nav-item ${isDashboard && activeTab === 'security' ? 'active' : ''}`} 
            onClick={() => { navigate('/dashboard'); onTabChange?.('security'); }}
          >
            <span className="nav-icon">🛡️</span> Security Check
          </button>
          <button 
            className={`nav-item ${isDashboard && activeTab === 'complexity' ? 'active' : ''}`} 
            onClick={() => { navigate('/dashboard'); onTabChange?.('complexity'); }}
          >
            <span className="nav-icon">📊</span> Code Quality
          </button>
          <button 
            className={`nav-item ${isDashboard && activeTab === 'dependencies' ? 'active' : ''}`} 
            onClick={() => { navigate('/dashboard'); onTabChange?.('dependencies'); }}
          >
            <span className="nav-icon">📦</span> Dependencies
          </button>
          <button 
            className={`nav-item ${isDashboard && activeTab === 'architecture' ? 'active' : ''}`} 
            onClick={() => { navigate('/dashboard'); onTabChange?.('architecture'); }}
          >
            <span className="nav-icon">🗺️</span> Architecture
          </button>
        </div>

        <div className="nav-group">
          <label>PROJECT</label>
          <button className="nav-item" onClick={() => window.print()}>
            <span className="nav-icon">📥</span> Export PDF
          </button>
          <button className="nav-item" onClick={() => alert('Feature coming soon: History')}>
            <span className="nav-icon">🕒</span> Scan History
          </button>
          <button className="nav-item" onClick={() => alert('Feature coming soon: Settings')}>
            <span className="nav-icon">⚙️</span> Settings
          </button>
        </div>
      </div>

      <div className="sidebar-footer">
        <div className="user-meta">
          <div className="user-avatar">{user?.email?.[0]?.toUpperCase() || 'U'}</div>
          <div className="user-details">
            <span className="user-name">{user?.email?.split('@')[0]}</span>
            <span className="user-status">Pro Plan</span>
          </div>
        </div>
        <button className="logout-action" onClick={logout}>Sign Out</button>
      </div>
    </aside>
  );
}
