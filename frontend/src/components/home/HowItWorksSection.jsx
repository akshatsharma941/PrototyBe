import React from 'react';

const steps = [
  {
    title: 'Mission',
    desc: 'You are given a realistic, open-ended problem to solve.'
  },
  {
    title: 'Reasoning',
    desc: 'You explain how you would solve it in plain English.'
  },
  {
    title: 'Algorithm',
    desc: 'The AI helps you refine your reasoning into unambiguous steps.'
  },
  {
    title: 'Python',
    desc: 'Only when the logic is perfect do we translate it to code.'
  }
];

const HowItWorksSection = () => {
  return (
    <section style={{ padding: '6rem 1rem', maxWidth: '1200px', margin: '0 auto' }}>
      <h2 style={{ textAlign: 'center', fontSize: '2.5rem', marginBottom: '4rem' }}>How PyBe Works</h2>
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
        gap: '2rem',
        position: 'relative'
      }}>
        {steps.map((step, index) => (
          <div key={index} className="glass-panel" style={{ padding: '2rem', textAlign: 'center', position: 'relative', zIndex: 2 }}>
            <div style={{ 
              width: '40px', 
              height: '40px', 
              borderRadius: '50%', 
              background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.5rem',
              fontWeight: 'bold',
              color: 'white'
            }}>
              {index + 1}
            </div>
            <h3 style={{ marginBottom: '1rem', color: 'var(--text-primary)' }}>{step.title}</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.5 }}>{step.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default HowItWorksSection;
