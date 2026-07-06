import React from 'react';
import { useNavigate } from 'react-router-dom';
import { mockLevels } from '../data/mockData';
import { Lock, Unlock, CheckCircle, Flag, Zap, Compass, ArrowLeft } from 'lucide-react';
import { useProgress } from '../context/ProgressContext';

const LevelSelection = () => {
  const navigate = useNavigate();
  const { xp, discoveredConcepts, getLevelProgress } = useProgress();

  return (
    <div style={{ 
      width: '100%', 
      height: '100%', 
      overflowY: 'auto', 
      padding: '2rem 1rem 4rem',
      background: 'radial-gradient(circle at top left, rgba(59, 130, 246, 0.05), transparent 50%)'
    }}>
      <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ width: '100%', display: 'flex', justifyContent: 'flex-start', marginBottom: '1rem' }}>
          <button 
            onClick={() => navigate('/')}
            className="btn-back"
          >
            <ArrowLeft size={16} /> Back to Home
          </button>
        </div>
        {/* Profile Progress Bar */}
        <div style={{ 
          width: '100%', 
          marginBottom: '3rem', 
          display: 'flex', 
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '1rem 2rem',
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid var(--glass-border)',
          borderRadius: '16px',
          backdropFilter: 'blur(10px)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ background: 'rgba(245, 158, 11, 0.1)', padding: '0.5rem', borderRadius: '50%' }}>
              <Zap size={20} color="#f59e0b" />
            </div>
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600 }}>Total XP</div>
              <div style={{ fontSize: '1.25rem', color: '#f59e0b', fontWeight: 700 }}>{xp}</div>
            </div>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ background: 'rgba(59, 130, 246, 0.1)', padding: '0.5rem', borderRadius: '50%' }}>
              <Compass size={20} color="#3b82f6" />
            </div>
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600 }}>Discovered Concepts</div>
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
                {discoveredConcepts.length === 0 ? (
                  <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>None yet</span>
                ) : (
                  discoveredConcepts.map(concept => (
                    <span key={concept} style={{ 
                      background: 'rgba(59, 130, 246, 0.15)', 
                      color: '#60a5fa', 
                      padding: '0.2rem 0.6rem', 
                      borderRadius: '12px', 
                      fontSize: '0.8rem',
                      fontWeight: 500
                    }}>
                      {concept}
                    </span>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        <header style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <h1 style={{ 
            fontSize: '3rem', 
            marginBottom: '1rem',
            background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))', 
            WebkitBackgroundClip: 'text', 
            WebkitTextFillColor: 'transparent',
            fontWeight: 700
          }}>
            Your Learning Path
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem' }}>
            Progress through the levels. Master the logic before touching the syntax.
          </p>
        </header>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem', width: '100%', position: 'relative' }}>
          {/* Vertical line connecting nodes */}
          <div style={{
            position: 'absolute',
            top: '40px',
            bottom: '40px',
            left: '30px',
            width: '4px',
            background: 'var(--glass-border)',
            zIndex: 0
          }} />

          {mockLevels.map((level, index) => {
            const { percent, isUnlocked } = getLevelProgress(level.levelNumber);
            
            return (
              <div 
                key={level.id}
                className={`glass-panel ${!isUnlocked ? 'ide-disabled' : ''}`}
                style={{ 
                  padding: '2rem', 
                  display: 'flex', 
                  gap: '2rem',
                  alignItems: 'center',
                  cursor: isUnlocked ? 'pointer' : 'not-allowed',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  opacity: isUnlocked ? 1 : 0.6,
                  position: 'relative',
                  zIndex: 1,
                  marginLeft: index % 2 === 0 ? '40px' : '0px',
                  marginRight: index % 2 === 0 ? '0px' : '40px',
                }}
                onClick={() => isUnlocked && navigate(`/level/${level.id}/missions`)}
                onMouseEnter={(e) => {
                  if(isUnlocked) {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
                  }
                }}
                onMouseLeave={(e) => {
                  if(isUnlocked) {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                  }
                }}
              >
                <div style={{ 
                  width: '60px', 
                  height: '60px', 
                  borderRadius: '50%', 
                  background: percent === 100 ? 'rgba(16, 185, 129, 0.2)' : (isUnlocked ? 'rgba(59, 130, 246, 0.2)' : 'var(--bg-primary)'),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  border: `2px solid ${isUnlocked ? 'var(--accent-secondary)' : 'var(--glass-border)'}`
                }}>
                  {percent === 100 ? (
                    <CheckCircle size={28} color="var(--success)" />
                  ) : isUnlocked ? (
                    <Unlock size={28} color="var(--accent-secondary)" />
                  ) : (
                    <Lock size={28} color="var(--text-secondary)" />
                  )}
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '1rem', marginBottom: '0.5rem' }}>
                    <h2 style={{ fontSize: '1.5rem', color: 'var(--text-primary)' }}>Level {level.levelNumber}: {level.title}</h2>
                  </div>
                  <p style={{ color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '1rem' }}>
                    {level.description}
                  </p>
                  
                  <div style={{ display: 'flex', gap: '2rem', alignItems: 'center', fontSize: '0.9rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)' }}>
                      <Flag size={16} color="var(--accent-secondary)" />
                      <span>{level.missions.length} Missions</span>
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, maxWidth: '200px' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Progress:</span>
                      <div style={{ flex: 1, height: '8px', background: 'var(--bg-primary)', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{ 
                          height: '100%', 
                          width: `${percent}%`, 
                          background: percent === 100 ? 'var(--success)' : 'linear-gradient(90deg, var(--accent-secondary), var(--accent-primary))',
                          borderRadius: '4px'
                        }} />
                      </div>
                      <span style={{ color: 'var(--text-primary)', fontWeight: 500, minWidth: '40px' }}>{percent}%</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default LevelSelection;
