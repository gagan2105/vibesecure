// src/components/DepsPanel.jsx
import './DepsPanel.css';

export default function DepsPanel({ deps }) {
  const vulnerable = deps.filter(d => d.status === 'vulnerable');
  const safe = deps.filter(d => d.status === 'safe');

  return (
    <div className="deps-panel">
      <div className="deps-summary">
        <div className="deps-stat glass-card">
          <span className="deps-stat-icon">📦</span>
          <span className="deps-stat-value">{deps.length}</span>
          <span className="deps-stat-label">Total</span>
        </div>
        <div className="deps-stat glass-card danger-box">
          <span className="deps-stat-icon">⚠️</span>
          <span className="deps-stat-value" style={{ color: '#ef4444' }}>{vulnerable.length}</span>
          <span className="deps-stat-label">Vulnerable</span>
        </div>
        <div className="deps-stat glass-card">
          <span className="deps-stat-icon">✅</span>
          <span className="deps-stat-value" style={{ color: '#10b981' }}>{safe.length}</span>
          <span className="deps-stat-label">Safe</span>
        </div>
      </div>

      <div className="deps-table glass-card">
        <div className="deps-table-head">
          <span>Package</span>
          <span>Version</span>
          <span>License</span>
          <span>Status</span>
          <span>Vulnerabilities</span>
        </div>
        {deps.length === 0 && (
          <div className="deps-empty">No dependencies detected.</div>
        )}
        {deps.map((dep, i) => (
          <div key={i} className={`deps-row ${dep.status === 'vulnerable' ? 'vulnerable-row' : ''}`} id={`dep-row-${i}`}>
            <span className="dep-name">
              <span className="dep-icon">📦</span>
              {dep.name}
            </span>
            <span className="dep-version">{dep.version}</span>
            <span className="dep-license badge badge-info">{dep.license || 'Unknown'}</span>
            <span>
              {dep.status === 'vulnerable' ? (
                <span className="badge badge-danger">⚠️ Vulnerable</span>
              ) : (
                <span className="badge badge-success">✅ Safe</span>
              )}
            </span>
            <span className="dep-vulns">
              {dep.vulnerabilities
                ? <span style={{ color: '#f87171', fontWeight: 600 }}>{dep.vulnerabilities} CVEs ({dep.severity})</span>
                : <span style={{ color: 'var(--text-muted)' }}>None</span>
              }
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
