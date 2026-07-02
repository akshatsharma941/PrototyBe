import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Unlock, CheckCircle, Flag } from 'lucide-react';

const levelsData = [
  {
    id: 'level-1',
    title: 'Level 1: The Basics of Tracking',
    description: 'Begin your journey. Learn to keep track of information in the real world and discover the fundamentals of memory.',
    progress: 0,
    estimatedMissions: 2,
    isUnlocked: true,
  },
  {
    id: 'level-2',
    title: 'Level 2: Branching Paths',
    description: 'Face scenarios that require making choices. Master the art of decision making.',
    progress: 0,
    estimatedMissions: 3,
    isUnlocked: true,
  },
  {
    id: 'level-3',
    title: 'Level 3: The Factory Floor',
    description: 'Repetitive tasks are boring. Learn how to automate actions efficiently.',
    progress: 0,
    estimatedMissions: 5,
    isUnlocked: false,
  },
  {
    id: 'level-4',
    title: 'Level 4: Organizing Chaos',
    description: 'Deal with large amounts of related information and keep it structured.',
    progress: 0,
    estimatedMissions: 4,
    isUnlocked: false,
  },
  {
    id: 'level-5',
    title: 'Level 5: Tools of the Trade',
    description: 'Wrap your actions into reusable tools to solve complex problems.',
    progress: 0,
    estimatedMissions: 6,
    isUnlocked: false,
  },
  {
    id: 'level-6',
    title: 'Level 6: The Detective',
    description: 'Things will go wrong. Become a master at tracking down flaws in logic.',
    progress: 0,
    estimatedMissions: 3,
    isUnlocked: false,
  },
  {
    id: 'level-7',
    title: 'Level 7: The Grand Finale',
    description: 'Combine all your reasoning skills to solve comprehensive, real-world challenges.',
    progress: 0,
    estimatedMissions: 2,
    isUnlocked: false,
  }
];

const Path = () => {
  const navigate = useNavigate();

  return (
    <div style={{ 
      width: '100%', 
      height: '100%', 
      overflowY: 'auto', 
      padding: '4rem 1rem',
      background: 'radial-gradient(circle at top left, rgba(59, 130, 246, 0.05), transparent 50%)'
    }}>
      <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
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

          {levelsData.map((level, index) => (
            <div 
              key={level.id}
              className={`glass-panel ${!level.isUnlocked ? 'ide-disabled' : ''}`}
              style={{ 
                padding: '2rem', 
                display: 'flex', 
                gap: '2rem',
                alignItems: 'center',
                cursor: level.isUnlocked ? 'pointer' : 'not-allowed',
                transition: 'transform 0.2s, box-shadow 0.2s',
                opacity: level.isUnlocked ? 1 : 0.6,
                position: 'relative',
                zIndex: 1,
                marginLeft: index % 2 === 0 ? '40px' : '0px',
                marginRight: index % 2 === 0 ? '0px' : '40px',
              }}
              onClick={() => level.isUnlocked && navigate(`/level/${level.id}/missions`)}
              onMouseEnter={(e) => {
                if(level.isUnlocked) {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
                }
              }}
              onMouseLeave={(e) => {
                if(level.isUnlocked) {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                }
              }}
            >
              <div style={{ 
                width: '60px', 
                height: '60px', 
                borderRadius: '50%', 
                background: level.progress === 100 ? 'rgba(16, 185, 129, 0.2)' : (level.isUnlocked ? 'rgba(59, 130, 246, 0.2)' : 'var(--bg-primary)'),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                border: `2px solid ${level.isUnlocked ? 'var(--accent-secondary)' : 'var(--glass-border)'}`
              }}>
                {level.progress === 100 ? (
                  <CheckCircle size={28} color="var(--success)" />
                ) : level.isUnlocked ? (
                  <Unlock size={28} color="var(--accent-secondary)" />
                ) : (
                  <Lock size={28} color="var(--text-secondary)" />
                )}
              </div>

              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '1rem', marginBottom: '0.5rem' }}>
                  <h2 style={{ fontSize: '1.5rem', color: 'var(--text-primary)' }}>{level.title}</h2>
                </div>
                <p style={{ color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '1rem' }}>
                  {level.description}
                </p>
                
                <div style={{ display: 'flex', gap: '2rem', alignItems: 'center', fontSize: '0.9rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)' }}>
                    <Flag size={16} color="var(--accent-secondary)" />
                    <span>{level.estimatedMissions} Missions</span>
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, maxWidth: '200px' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Progress:</span>
                    <div style={{ flex: 1, height: '8px', background: 'var(--bg-primary)', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ 
                        height: '100%', 
                        width: `${level.progress}%`, 
                        background: level.progress === 100 ? 'var(--success)' : 'linear-gradient(90deg, var(--accent-secondary), var(--accent-primary))',
                        borderRadius: '4px'
                      }} />
                    </div>
                    <span style={{ color: 'var(--text-primary)', fontWeight: 500, minWidth: '40px' }}>{level.progress}%</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Path;
