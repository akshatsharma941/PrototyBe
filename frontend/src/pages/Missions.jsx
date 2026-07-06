import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Clock, Brain, CheckCircle, Circle, ArrowLeft } from 'lucide-react';
import { mockLevels } from '../data/mockData';
import { useProgress } from '../context/ProgressContext';

const Missions = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { completedMissions } = useProgress();
  
  const levelData = mockLevels.find(l => l.id === id);
  const missions = levelData ? levelData.missions : [];
  const topicTitle = levelData ? `Level ${levelData.levelNumber}: ${levelData.title}` : 'Missions';

  return (
    <div style={{ 
      width: '100%', 
      height: '100%', 
      overflowY: 'auto', 
      padding: '4rem 1rem',
      background: 'radial-gradient(circle at top right, rgba(139, 92, 246, 0.05), transparent 50%)'
    }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <div style={{ marginBottom: '2rem' }}>
          <button 
            onClick={() => navigate('/levels')}
            className="btn-back"
          >
            <ArrowLeft size={16} /> Back to Levels
          </button>
        </div>

        <header style={{ marginBottom: '4rem' }}>
          <h1 style={{ 
            fontSize: '2.5rem', 
            marginBottom: '0.5rem',
            color: 'var(--text-primary)',
            fontWeight: 700
          }}>
            {topicTitle} Missions
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>
            Select a scenario to practice your reasoning skills.
          </p>
        </header>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '2rem' }}>
          {missions.map(mission => (
            <div 
              key={mission.id}
              className="glass-panel"
              style={{ 
                padding: '2rem',
                display: 'flex',
                flexDirection: 'column',
                cursor: 'pointer',
                transition: 'transform 0.2s, box-shadow 0.2s'
              }}
              onClick={() => navigate(`/workspace/${mission.id}`)}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'var(--shadow-md)';
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <h3 style={{ fontSize: '1.25rem', color: 'var(--text-primary)', lineHeight: 1.3 }}>{mission.title}</h3>
                {completedMissions.includes(mission.id) ? (
                  <CheckCircle size={24} color="var(--success)" style={{ flexShrink: 0 }} />
                ) : (
                  <Circle size={24} color="var(--text-secondary)" style={{ flexShrink: 0 }} />
                )}
              </div>
              
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.6, flex: 1, marginBottom: '1.5rem' }}>
                {mission.description}
              </p>

              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                paddingTop: '1rem',
                borderTop: '1px solid var(--glass-border)',
                fontSize: '0.85rem',
                color: 'var(--text-secondary)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Brain size={16} color="var(--accent-primary)" />
                  <span>{mission.difficulty}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <span>{mission.xpReward} XP</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Missions;
