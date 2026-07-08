import React from 'react';
import { useNavigate } from 'react-router-dom';

const Logo = ({ size = 'large' }) => {
  const navigate = useNavigate();
  
  const isLarge = size === 'large';
  // Increased sizes based on feedback
  const iconSize = isLarge ? 80 : 40;
  const fontSize = isLarge ? '3.5rem' : '1.8rem';

  return (
    <div 
      className="logo-container" 
      onClick={() => navigate('/')}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: isLarge ? '1.5rem' : '0.75rem',
        cursor: 'pointer',
        userSelect: 'none'
      }}
    >
      <div className="logo-icon-wrapper" style={{ position: 'relative', width: iconSize, height: iconSize }}>
        <svg 
          viewBox="0 0 110 110" 
          width={iconSize} 
          height={iconSize} 
          style={{ overflow: 'visible' }}
        >
          {/* Top Snake (Blueish / Primary) */}
          <path 
            className="logo-snake-top"
            d="M 55 10 C 30 10 30 25 30 25 L 30 35 L 55 35 L 55 40 L 20 40 C 5 40 5 65 20 65 L 30 65 L 30 55 C 30 40 40 30 55 30 L 75 30 C 85 30 85 20 85 20 C 85 10 70 10 55 10 Z" 
            fill="var(--accent-primary)"
            style={{ transformOrigin: 'center' }}
          />
          {/* Top Snake Eye */}
          <circle cx="45" cy="20" r="4" fill="var(--bg-primary)" className="logo-snake-top" style={{ transformOrigin: 'center' }} />

          {/* Bottom Snake (Yellowish / Secondary) */}
          <path 
            className="logo-snake-bottom"
            d="M 55 100 C 80 100 80 85 80 85 L 80 75 L 55 75 L 55 70 L 90 70 C 105 70 105 45 90 45 L 80 45 L 80 55 C 80 70 70 80 55 80 L 35 80 C 25 80 25 90 25 90 C 25 100 40 100 55 100 Z" 
            fill="var(--accent-secondary)"
            style={{ transformOrigin: 'center' }}
          />
          {/* Bottom Snake Eye */}
          <circle cx="65" cy="90" r="4" fill="var(--bg-primary)" className="logo-snake-bottom" style={{ transformOrigin: 'center' }} />
        </svg>
      </div>
      <span className="logo-text" style={{ 
        fontSize: fontSize, 
        fontWeight: 800, 
        letterSpacing: '1px',
        background: 'linear-gradient(135deg, #f8fafc, #94a3b8)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        transition: 'all 0.3s ease'
      }}>
        PyBe
      </span>
    </div>
  );
};

export default Logo;
