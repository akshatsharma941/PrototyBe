import React from 'react';

const WhyPyBeSection = () => {
  return (
    <section style={{ padding: '4rem 1rem', maxWidth: '1000px', margin: '0 auto' }}>
      <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center' }}>
        <h2 style={{ fontSize: '2.5rem', marginBottom: '1.5rem', color: 'var(--text-primary)' }}>Why PyBe?</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', lineHeight: 1.7, maxWidth: '800px', margin: '0 auto' }}>
          Most programming courses start by teaching you syntax—where to put commas and brackets. 
          But the real challenge of programming isn't the syntax; it's the <strong>reasoning</strong>.
          <br /><br />
          PyBe flips the script. We teach you how to break down complex problems, formulate logical solutions, 
          and remove ambiguity using plain English. Once your reasoning is solid, translating it into Python 
          is just the final, effortless step.
        </p>
      </div>
    </section>
  );
};

export default WhyPyBeSection;
