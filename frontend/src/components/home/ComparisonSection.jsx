import React from 'react';

const ComparisonSection = () => {
  return (
    <section style={{ padding: '4rem 1rem', maxWidth: '1000px', margin: '0 auto' }}>
      <h2 style={{ textAlign: 'center', fontSize: '2.5rem', marginBottom: '3rem' }}>The PyBe Difference</h2>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <div className="glass-panel" style={{ padding: '2.5rem', borderLeft: '4px solid #ef4444' }}>
          <h3 style={{ color: '#ef4444', marginBottom: '1rem', fontSize: '1.2rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Traditional Learning</h3>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap', color: 'var(--text-secondary)' }}>
            <span>Learn Syntax</span>
            <span>&rarr;</span>
            <span>Practice Exercises</span>
            <span>&rarr;</span>
            <span>Build Projects (and get stuck)</span>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '2.5rem', borderLeft: '4px solid var(--success)' }}>
          <h3 style={{ color: 'var(--success)', marginBottom: '1rem', fontSize: '1.2rem', textTransform: 'uppercase', letterSpacing: '1px' }}>The PyBe Method</h3>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap', color: 'var(--text-primary)', fontWeight: 500 }}>
            <span>Solve a Mission</span>
            <span style={{ color: 'var(--text-secondary)' }}>&rarr;</span>
            <span>Explain Reasoning</span>
            <span style={{ color: 'var(--text-secondary)' }}>&rarr;</span>
            <span>AI Removes Ambiguity</span>
            <span style={{ color: 'var(--text-secondary)' }}>&rarr;</span>
            <span>Learn Python Naturally</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ComparisonSection;
