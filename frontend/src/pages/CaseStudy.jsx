import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Bot } from 'lucide-react';

const CaseStudy = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [caseStudy, setCaseStudy] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`http://localhost:5000/api/case-studies/${id}`)
      .then(res => {
        if (!res.ok) throw new Error('Case study not found');
        return res.json();
      })
      .then(data => {
        setCaseStudy(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [id]);

  if (loading) return <div className="container" style={{ padding: '3rem', textAlign: 'center' }}><div className="loader">Loading...</div></div>;
  if (error) return <div className="container" style={{ padding: '3rem', textAlign: 'center' }}><div className="error-message">{error}</div></div>;

  return (
    <div className="container" style={{ padding: '3rem', maxWidth: '800px', margin: '0 auto' }}>
      <div className="glass-panel" style={{ padding: '3rem' }}>
        <h2 style={{ fontSize: '2rem', marginBottom: '1rem', color: 'var(--accent-primary)' }}>{caseStudy.title}</h2>

        <div style={{ marginBottom: '2rem' }}>
          <h4 style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.85rem' }}>Scenario</h4>
          <p style={{ fontSize: '1.1rem', lineHeight: '1.6' }}>{caseStudy.description}</p>
        </div>

        {/*
          v1.1 case studies carry an explicit observation.prompt — the first
          question the Socratic tutor will ask the learner. v1.0 case studies
          don't have this, so fall back to the v1.0 framing.
        */}
        {(() => {
          // v1.1 case studies carry observation.prompt — the literal first
          // Socratic question. v1.0 case studies don't, so build a question
          // from their stored fields in priority order: a hand-picked
          // followUp question, then a sketch from requiredConcepts.
          const openingQuestion =
            caseStudy.observation?.prompt ||
            caseStudy.followUpQuestions?.[0] ||
            (caseStudy.requiredConcepts?.length
              ? `How would you solve this using ${caseStudy.requiredConcepts.join(', ')}?`
              : null);
          if (!openingQuestion) return null;
          return (
            <div style={{
              background: 'rgba(245, 158, 11, 0.12)',
              border: '1px solid rgba(245, 158, 11, 0.3)',
              padding: '1.25rem 1.5rem',
              borderRadius: '8px',
              marginBottom: '2rem'
            }}>
              <h4 style={{ color: '#fbbf24', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.85rem' }}>
                Your Opening Question
              </h4>
              <p style={{ fontSize: '1.05rem', lineHeight: '1.5', margin: 0, color: 'var(--text-primary)' }}>
                {openingQuestion}
              </p>
            </div>
          );
        })()}

        {/*
          v1.1 has rich objectives; v1.0 had a flat requiredConcepts string list.
          Show whichever the case study carries.
        */}
        {(caseStudy.objectives?.length || caseStudy.requiredConcepts?.length) ? (
          <div style={{ background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.2)', padding: '1.5rem', borderRadius: '8px', marginBottom: '2rem' }}>
            <h4 style={{ color: 'var(--accent-secondary)', marginBottom: '0.5rem' }}>
              {caseStudy.objectives?.length ? 'Learning Objectives' : 'Concepts to Learn'}
            </h4>
            {caseStudy.objectives?.length ? (
              <ul style={{ paddingLeft: '1.5rem', color: 'var(--text-secondary)' }}>
                {caseStudy.objectives.map((obj, idx) => (
                  <li key={obj.id || idx} style={{ marginBottom: '0.5rem' }}>{obj.label}</li>
                ))}
              </ul>
            ) : (
              <ul style={{ paddingLeft: '1.5rem', color: 'var(--text-secondary)' }}>
                {caseStudy.requiredConcepts.map((concept, idx) => (
                  <li key={idx} style={{ marginBottom: '0.5rem' }}>{concept}</li>
                ))}
              </ul>
            )}
          </div>
        ) : null}

        <div style={{ textAlign: 'center' }}>
          <p style={{ marginBottom: '1rem', color: 'var(--text-secondary)' }}>Ready to analyze the problem? You won't write code yet. You'll talk to your AI tutor first to plan your approach.</p>
          <button className="btn-primary" onClick={() => navigate(`/tutor/${id}`)} style={{ fontSize: '1.1rem', padding: '1rem 2rem' }}>
            <Bot size={20} /> Begin Tutor Session
          </button>
        </div>
      </div>
    </div>
  );
};

export default CaseStudy;
