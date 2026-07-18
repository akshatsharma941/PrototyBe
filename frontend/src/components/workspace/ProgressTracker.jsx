import React from 'react';
import { Check } from 'lucide-react';

const stages = [
  'Case Study Brief',
  'Reasoning Phase',
  'Python Translation',
  'Coding Phase',
  'Complete'
];

const ProgressTracker = ({ currentStage }) => {
  const currentIndex = stages.indexOf(currentStage);

  return (
    <div style={{ 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      padding: '1rem', 
      background: 'var(--bg-secondary)', 
      borderBottom: '1px solid var(--glass-border)' 
    }}>
      <div style={{ display: 'flex', alignItems: 'center', width: '100%', maxWidth: '800px', gap: '0.5rem' }}>
        {stages.map((stage, index) => {
          const isActive = index === currentIndex;
          const isPast = index < currentIndex;
          
          return (
            <React.Fragment key={stage}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.8rem',
                  fontWeight: 'bold',
                  background: isPast ? 'var(--success)' : (isActive ? 'var(--accent-primary)' : 'transparent'),
                  border: isPast || isActive ? 'none' : '1px solid var(--text-secondary)',
                  color: isPast || isActive ? 'white' : 'var(--text-secondary)'
                }}>
                  {isPast ? <Check size={14} /> : (index + 1)}
                </div>
                <span style={{ 
                  fontSize: '0.85rem', 
                  fontWeight: isActive ? 600 : 400,
                  color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)'
                }}>
                  {stage}
                </span>
              </div>
              {index < stages.length - 1 && (
                <div style={{ 
                  flex: 1, 
                  height: '2px', 
                  background: isPast ? 'var(--success)' : 'var(--glass-border)',
                  margin: '0 0.5rem'
                }} />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

export default ProgressTracker;
