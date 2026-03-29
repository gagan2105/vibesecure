// src/components/ScoreRing.jsx
import './ScoreRing.css';

export default function ScoreRing({ score }) {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const progress = circumference - (score / 100) * circumference;

  const color = 'var(--ring-color, #00d4ff)';

  return (
    <div className="score-ring-wrapper">
      <svg className="score-ring-svg" viewBox="0 0 130 130" width="130" height="130">
        {/* Background ring */}
        <circle
          cx="65" cy="65" r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.05)"
          strokeWidth="10"
        />
        {/* Glow filter */}
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="4" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        {/* Progress ring */}
        <circle
          cx="65" cy="65" r={radius}
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={progress}
          transform="rotate(-90 65 65)"
          filter="url(#glow)"
          style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(0.4, 0, 0.2, 1)' }}
        />
        {/* Score text */}
        <text
          x="65" y="60"
          textAnchor="middle"
          fill={color}
          fontSize="26"
          fontWeight="800"
          fontFamily="Inter, sans-serif"
        >
          {score}
        </text>
        <text
          x="65" y="78"
          textAnchor="middle"
          fill="rgba(255,255,255,0.4)"
          fontSize="11"
          fontFamily="Inter, sans-serif"
          fontWeight="500"
          letterSpacing="2"
        >
          /100
        </text>
      </svg>
    </div>
  );
}
