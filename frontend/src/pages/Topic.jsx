import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Unlock, CheckCircle, Flag } from 'lucide-react';

const topicsData = [
  {
    id: 'variables',
    title: 'Variables',
    journeyStage: 'Stage 1: Storing Memory',
    description: 'Learn how to remember information and give it meaningful names, just like assigning labels to boxes.',
    progress: 0,
    estimatedMissions: 2,
    isUnlocked: true,
  },
  {
    id: 'conditions',
    title: 'Conditions',
    journeyStage: 'Stage 2: Making Decisions',
    description: 'Discover how to guide your logic down different paths based on choices and circumstances.',
    progress: 0,
    estimatedMissions: 1,
    isUnlocked: true,
  },
  {
    id: 'loops',
    title: 'Loops',
    journeyStage: 'Stage 3: Automating Repetition',
    description: 'Master the art of doing things over and over again without repeating yourself in plain English.',
    progress: 0,
    estimatedMissions: 5,
    isUnlocked: false,
  },
  {
    id: 'lists',
    title: 'Lists',
    journeyStage: 'Stage 4: Organizing Collections',
    description: 'Find out how to keep multiple pieces of related information neatly grouped together.',
    progress: 0,
    estimatedMissions: 4,
    isUnlocked: false,
  },
  {
    id: 'functions',
    title: 'Functions',
    journeyStage: 'Stage 5: Packaging Actions',
    description: 'Learn to wrap up complex sequences of actions into single, reusable tools.',
    progress: 0,
    estimatedMissions: 6,
    isUnlocked: false,
  },
  {
    id: 'debugging',
    title: 'Debugging',
    journeyStage: 'Stage 6: Investigating Flaws',
    description: 'Become a detective. Learn how to systematically track down and fix logic errors.',
    progress: 0,
    estimatedMissions: 3,
    isUnlocked: false,
  },
  {
    id: 'projects',
    title: 'Projects',
    journeyStage: 'Stage 7: The Grand Finale',
    description: 'Combine all your reasoning skills to solve comprehensive, real-world challenges.',
    progress: 0,
    estimatedMissions: 2,
    isUnlocked: false,
  }
];

const Topic = () => {
  const navigate = useNavigate();

  return (
    <div style={{ 
      width: '100%', 
      height: '100%', 
      overflowY: 'auto', 
      padding: '4rem 1rem',
      background: 'radial-gradient(circle at top left, rgba(59, 130, 246, 0.05), transparent 50%)'
    }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <header style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <h1 style={{ 
            fontSize: '3rem', 
            marginBottom: '1rem',
            background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))', 
            WebkitBackgroundClip: 'text', 
            WebkitTextFillColor: 'transparent',
            fontWeight: 700
          }}>
            Your Reasoning Journey
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem' }}>
            Progress through the stages. Master the logic before touching the syntax.
          </p>
        </header>

        <div style={{ display: 'grid', gap: '2rem' }}>
          {topicsData.map((topic, index) => (
            <div 
              key={topic.id}
              className={`glass-panel ${!topic.isUnlocked ? 'ide-disabled' : ''}`}
              style={{ 
                padding: '2rem', 
                display: 'flex', 
                gap: '2rem',
                alignItems: 'center',
                cursor: topic.isUnlocked ? 'pointer' : 'not-allowed',
                transition: 'transform 0.2s, box-shadow 0.2s',
                opacity: topic.isUnlocked ? 1 : 0.6
              }}
              onClick={() => topic.isUnlocked && navigate(`/missions/${topic.id}`)}
              onMouseEnter={(e) => {
                if(topic.isUnlocked) {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
                }
              }}
              onMouseLeave={(e) => {
                if(topic.isUnlocked) {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                }
              }}
            >
              <div style={{ 
                width: '60px', 
                height: '60px', 
                borderRadius: '50%', 
                background: topic.progress === 100 ? 'rgba(16, 185, 129, 0.2)' : (topic.isUnlocked ? 'rgba(59, 130, 246, 0.2)' : 'rgba(148, 163, 184, 0.1)'),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                {topic.progress === 100 ? (
                  <CheckCircle size={28} color="var(--success)" />
                ) : topic.isUnlocked ? (
                  <Unlock size={28} color="var(--accent-secondary)" />
                ) : (
                  <Lock size={28} color="var(--text-secondary)" />
                )}
              </div>

              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '1rem', marginBottom: '0.5rem' }}>
                  <h2 style={{ fontSize: '1.5rem', color: 'var(--text-primary)' }}>{topic.title}</h2>
                  <span style={{ color: 'var(--accent-primary)', fontSize: '0.9rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px' }}>
                    {topic.journeyStage}
                  </span>
                </div>
                <p style={{ color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '1rem' }}>
                  {topic.description}
                </p>
                
                <div style={{ display: 'flex', gap: '2rem', alignItems: 'center', fontSize: '0.9rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)' }}>
                    <Flag size={16} color="var(--accent-secondary)" />
                    <span>{topic.estimatedMissions} Missions</span>
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, maxWidth: '300px' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Progress:</span>
                    <div style={{ flex: 1, height: '8px', background: 'var(--bg-primary)', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ 
                        height: '100%', 
                        width: `${topic.progress}%`, 
                        background: topic.progress === 100 ? 'var(--success)' : 'linear-gradient(90deg, var(--accent-secondary), var(--accent-primary))',
                        borderRadius: '4px'
                      }} />
                    </div>
                    <span style={{ color: 'var(--text-primary)', fontWeight: 500, minWidth: '40px' }}>{topic.progress}%</span>
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

export default Topic;
