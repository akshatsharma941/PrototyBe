import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, ArrowRight, Zap, Target, Lightbulb } from 'lucide-react';

const MissionAccomplishedModal = ({ missionData, nextMissionId, onClose }) => {
  const navigate = useNavigate();

  const handleNext = () => {
    if (nextMissionId) {
      navigate(`/workspace/${nextMissionId}`);
    } else {
      navigate('/levels');
    }
    onClose();
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div className="glass-panel" style={{
        width: '100%',
        maxWidth: '600px',
        padding: '3rem',
        borderRadius: '24px',
        border: '1px solid var(--success)',
        boxShadow: '0 0 40px rgba(16, 185, 129, 0.2)',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Subtle background success glow */}
        <div style={{
          position: 'absolute',
          top: '-50%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '300px',
          height: '300px',
          background: 'rgba(16, 185, 129, 0.1)',
          filter: 'blur(60px)',
          borderRadius: '50%',
          zIndex: 0
        }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ 
            width: '80px', 
            height: '80px', 
            borderRadius: '50%', 
            background: 'rgba(16, 185, 129, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.5rem'
          }}>
            <CheckCircle size={48} color="var(--success)" />
          </div>

          <h2 style={{ 
            fontSize: '2.5rem', 
            marginBottom: '0.5rem', 
            background: 'linear-gradient(135deg, #10b981, #34d399)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontWeight: 800
          }}>
            Mission Accomplished!
          </h2>
          
          <div style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: '0.5rem', 
            background: 'rgba(245, 158, 11, 0.1)', 
            padding: '0.5rem 1rem', 
            borderRadius: '20px',
            marginBottom: '2.5rem',
            border: '1px solid rgba(245, 158, 11, 0.2)'
          }}>
            <Zap size={18} color="#f59e0b" />
            <span style={{ color: '#f59e0b', fontWeight: 700, fontSize: '1.1rem' }}>+{missionData?.xpReward} XP Gained</span>
          </div>

          <div style={{ 
            textAlign: 'left', 
            background: 'var(--bg-primary)', 
            padding: '1.5rem', 
            borderRadius: '12px',
            marginBottom: '2.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5rem'
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', fontWeight: 600 }}>
                <Target size={16} /> Lesson Summary
              </div>
              <p style={{ color: 'var(--text-primary)', lineHeight: 1.5 }}>
                {missionData?.lessonSummary}
              </p>
            </div>
            
            <div style={{ height: '1px', background: 'var(--glass-border)' }} />

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', fontWeight: 600 }}>
                <Lightbulb size={16} color="var(--accent-secondary)" /> Intuition Built
              </div>
              <p style={{ color: 'var(--text-primary)', lineHeight: 1.5 }}>
                {missionData?.intuitionBuilt}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <button 
              onClick={onClose}
              style={{
                padding: '1rem 1.5rem',
                background: 'transparent',
                border: '1px solid var(--glass-border)',
                color: 'var(--text-secondary)',
                borderRadius: '8px',
                fontSize: '1rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                e.currentTarget.style.color = 'var(--text-primary)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = 'var(--text-secondary)';
              }}
            >
              Stay & ponder
            </button>
            <button 
              onClick={handleNext}
              className="btn-primary"
              style={{
                padding: '1rem 2rem',
                fontSize: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              Onto the next one <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MissionAccomplishedModal;
