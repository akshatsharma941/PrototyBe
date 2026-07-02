import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Hexagon } from 'lucide-react';

const HeroSection = () => {
  const navigate = useNavigate();

  return (
    <section style={{ textAlign: 'center', padding: '4rem 1rem 6rem', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '3rem' }}>
        <Hexagon size={36} color="var(--accent-primary)" fill="rgba(139, 92, 246, 0.2)" />
        <span style={{ fontSize: '1.75rem', fontWeight: 700, letterSpacing: '1px' }}>PyBe</span>
      </div>

      <h1 style={{ 
        fontSize: '4rem', 
        lineHeight: 1.1,
        marginBottom: '1.5rem',
        background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))', 
        WebkitBackgroundClip: 'text', 
        WebkitTextFillColor: 'transparent',
        fontWeight: 700
      }}>
        Learn to think like a programmer. Python becomes the easy part.
      </h1>
      <p style={{ 
        color: 'var(--text-secondary)', 
        fontSize: '1.25rem', 
        marginBottom: '3rem',
        lineHeight: 1.6 
      }}>
        PyBe teaches computational thinking through realistic missions. Solve problems in plain English with Pycrates, your AI Socratic tutor, before you write a single line of code.
      </p>
      <button 
        className="btn-primary" 
        style={{ fontSize: '1.2rem', padding: '1rem 2rem' }}
        onClick={() => navigate('/levels')}
      >
        Onto the missions!
      </button>
    </section>
  );
};

export default HeroSection;
