import React from 'react';
import { useNavigate } from 'react-router-dom';

const FinalCtaSection = () => {
  const navigate = useNavigate();

  return (
    <section style={{ padding: '6rem 1rem 8rem', textAlign: 'center' }}>
      <h2 style={{ fontSize: '3rem', marginBottom: '2rem', color: 'var(--text-primary)' }}>Ready to rethink programming?</h2>
      <button 
        className="btn-primary" 
        style={{ 
          fontSize: '1.2rem', 
          padding: '1rem 2.5rem',
          boxShadow: '0 0 20px rgba(16, 185, 129, 0.3)'
        }}
        onClick={() => navigate('/levels')}
      >
        Onto the missions!
      </button>
    </section>
  );
};

export default FinalCtaSection;
