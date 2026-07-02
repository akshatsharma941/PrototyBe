import React from 'react';
import { Bot, MessageSquare } from 'lucide-react';

const AiCoachSection = () => {
  return (
    <section style={{ padding: '6rem 1rem', maxWidth: '1000px', margin: '0 auto' }}>
      <div className="glass-panel" style={{ padding: '4rem 2rem', textAlign: 'center', background: 'radial-gradient(circle at top right, rgba(139, 92, 246, 0.05), transparent 40%)' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2rem' }}>
          <div style={{ 
            width: '80px', 
            height: '80px', 
            borderRadius: '50%', 
            background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 30px rgba(139, 92, 246, 0.4)'
          }}>
            <Bot size={40} color="white" />
          </div>
        </div>
        
        <h2 style={{ fontSize: '2.5rem', marginBottom: '1.5rem', color: 'var(--text-primary)' }}>Meet Pycrates, Your Reasoning Coach</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', lineHeight: 1.7, maxWidth: '700px', margin: '0 auto 3rem' }}>
          Pycrates doesn't write code for you. Instead, he acts as a Socratic tutor. 
          He asks probing questions that help you think clearly, spot edge cases, and discover a complete solution on your own.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', textAlign: 'left', maxWidth: '800px', margin: '0 auto' }}>
          <div style={{ background: 'var(--bg-secondary)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
            <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#ef4444', marginBottom: '0.75rem' }}>
              <MessageSquare size={18} /> What it doesn't do
            </h4>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>"Here is the Python code to reverse the string."</p>
          </div>
          <div style={{ background: 'var(--bg-secondary)', padding: '1.5rem', borderRadius: '12px', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
            <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--success)', marginBottom: '0.75rem' }}>
              <MessageSquare size={18} /> What it does
            </h4>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>"Good idea. What happens if the string is empty? How will your logic handle that?"</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AiCoachSection;
