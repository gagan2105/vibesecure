// src/components/ArchDiagram.jsx
import './ArchDiagram.css';

const TYPE_STYLES = {
  external: { bg: 'rgba(124,58,237,0.2)', border: 'rgba(124,58,237,0.5)', icon: '👤' },
  server:   { bg: 'rgba(0,212,255,0.12)', border: 'rgba(0,212,255,0.4)',  icon: '⚡' },
  module:   { bg: 'rgba(16,185,129,0.12)',border: 'rgba(16,185,129,0.4)', icon: '📦' },
  database: { bg: 'rgba(245,158,11,0.12)',border: 'rgba(245,158,11,0.4)', icon: '🗄️' },
};

export default function ArchDiagram({ arch }) {
  if (!arch) return null;
  const { nodes = [], edges = [] } = arch.diagram || {};

  return (
    <div className="arch-panel">
      {/* Info Cards */}
      <div className="arch-info-row">
        <div className="glass-card arch-info-card">
          <div className="arch-info-label">🏗️ Pattern</div>
          <div className="arch-info-value">{arch.pattern || '—'}</div>
        </div>
        <div className="glass-card arch-info-card">
          <div className="arch-info-label">⚙️ Components</div>
          <div className="arch-components">
            {(arch.components || []).map((c, i) => (
              <span key={i} className="badge badge-info">{c}</span>
            ))}
          </div>
        </div>
        <div className="glass-card arch-info-card arch-concerns">
          <div className="arch-info-label">⚠️ Concerns</div>
          <ul className="concerns-list">
            {(arch.concerns || []).map((c, i) => (
              <li key={i}>{c}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* Visual Diagram */}
      {nodes.length > 0 && (
        <div className="glass-card arch-diagram-card">
          <div className="arch-diagram-title">🗺️ Architecture Diagram</div>
          <div className="arch-diagram-canvas">
            <div className="arch-nodes">
              {nodes.map((node, i) => {
                const style = TYPE_STYLES[node.type] || TYPE_STYLES.module;
                return (
                  <div key={node.id} className="arch-node" id={`arch-node-${node.id}`}
                    style={{ background: style.bg, border: `1px solid ${style.border}`, animationDelay: `${i * 0.1}s` }}>
                    <span className="arch-node-icon">{style.icon}</span>
                    <span className="arch-node-label">{node.label}</span>
                  </div>
                );
              })}
            </div>
            <div className="arch-edges">
              {edges.map((edge, i) => (
                <div key={i} className="arch-edge">
                  <span className="arch-edge-from">{edge.from}</span>
                  <span className="arch-edge-arrow">
                    <span className="arch-edge-label">{edge.label}</span>
                    →
                  </span>
                  <span className="arch-edge-to">{edge.to}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
