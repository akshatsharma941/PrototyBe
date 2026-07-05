// Load case studies from the backend instead of the local mockData.js.
// Backend (backend/seedData.js) is the single source of truth — adding a
// new entry there makes a new card appear here on next load.
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
// Imports: kajal's 242c2f8 removed `mockLevels`, `Lock`, `CheckCircle` because
// the page became backend-driven (case studies are fetched from the API).
// Upstream PR #2 (9f790a3) added `ArrowLeft` + `Logo` for the new header.
// We keep both intents: backend-driven loading AND the new header chrome.
import { useProgress } from '../context/ProgressContext';
import { Unlock, Flag, Zap, Compass, ArrowLeft } from 'lucide-react';
import Logo from '../components/common/Logo';

const API_BASE = 'http://localhost:5000';

const LevelSelection = () => {
  const navigate = useNavigate();
  const { xp, discoveredConcepts, getLevelProgress } = useProgress();

  // Backend-driven case studies. Until the load finishes we render an empty
  // list. While loading or on error we show a small inline status message
  // rather than blocking the user.
  const [caseStudies, setCaseStudies] = useState([]);
  const [status, setStatus] = useState('loading'); // 'loading' | 'ready' | 'error'

  useEffect(() => {
    let cancelled = false;

    fetch(`${API_BASE}/api/case-studies`)
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(data => {
        if (cancelled) return;
        // Backend returns Mongo docs; fall back to _id if no slug.
        const list = (data || []).map(cs => ({
          id: cs.id || cs._id,
          title: cs.title,
          description: cs.description,
          subtitle: cs.subtitle,
          difficulty: cs.difficulty,
          tags: cs.tags || []
        }));
        setCaseStudies(list);
        setStatus('ready');
      })
      .catch(err => {
        if (cancelled) return;
        console.error('Failed to load case studies:', err);
        setStatus('error');
      });

    return () => { cancelled = true; };
  }, []);

  const onCardClick = (item) => {
    // Each card points at the canonical case-study route using its backend id.
    // ProgressContext still treats them as a single "level 1" unlocked level
    // for this incremental step — full unlock/mission wiring comes later.
    navigate(`/case-study/${encodeURIComponent(item.id)}`);
  };

  return (
    <div style={{ 
      width: '100%', 
      height: '100%', 
      overflowY: 'auto', 
      padding: '2rem 1rem 4rem',
      background: 'radial-gradient(circle at top left, rgba(59, 130, 246, 0.05), transparent 50%)'
    }}>
      <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <button 
            onClick={() => navigate('/')}
            className="btn-back"
          >
            <ArrowLeft size={16} /> Back to Home
          </button>
          <Logo size="small" />
        </div>
        {/* Profile Progress Bar */}
        <div style={{ 
          width: '100%', 
          marginBottom: '3rem', 
          display: 'flex', 
          flexDirection: 'column',
          gap: '1.5rem',
          padding: '1.5rem 2rem',
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid var(--glass-border)',
          borderRadius: '16px',
          backdropFilter: 'blur(10px)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ background: 'rgba(245, 158, 11, 0.1)', padding: '0.5rem', borderRadius: '50%' }}>
              <Zap size={20} color="#f59e0b" />
            </div>
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600 }}>Total XP</div>
              <div style={{ fontSize: '1.25rem', color: '#f59e0b', fontWeight: 700 }}>{xp}</div>
            </div>
          </div>
          
          <div style={{ width: '100%', height: '1px', background: 'var(--glass-border)' }} />
          
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
            <div style={{ background: 'rgba(59, 130, 246, 0.1)', padding: '0.5rem', borderRadius: '50%', marginTop: '0.2rem' }}>
              <Compass size={20} color="#3b82f6" />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600 }}>Discovered Concepts</div>
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                {discoveredConcepts.length === 0 ? (
                  <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>None yet</span>
                ) : (
                  discoveredConcepts.map(concept => (
                    <span key={concept} style={{ 
                      background: 'rgba(59, 130, 246, 0.15)', 
                      color: '#60a5fa', 
                      padding: '0.2rem 0.6rem', 
                      borderRadius: '12px', 
                      fontSize: '0.8rem',
                      fontWeight: 500
                    }}>
                      {concept}
                    </span>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        <header style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <h1 style={{ 
            fontSize: '3rem', 
            marginBottom: '1rem',
            background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))', 
            WebkitBackgroundClip: 'text', 
            WebkitTextFillColor: 'transparent',
            fontWeight: 700
          }}>
            Your Learning Path
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem' }}>
            Progress through the levels. Master the logic before touching the syntax.
          </p>
        </header>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem', width: '100%', position: 'relative' }}>
          {/* Vertical line connecting nodes */}
          <div style={{
            position: 'absolute',
            top: '40px',
            bottom: '40px',
            left: '30px',
            width: '4px',
            background: 'var(--glass-border)',
            zIndex: 0
          }} />

          {/* Click target: each fetched case study. While we still have the
              old Level id scheme inside ProgressContext, every card reports
              as "Level 1" (always unlocked). Once Levels support lands, this
              will derive level metadata from the case study itself. */}
          {caseStudies.length === 0 && status !== 'error' && (
            <p style={{ color: 'var(--text-secondary)' }}>Loading case studies…</p>
          )}
          {status === 'error' && (
            <p style={{ color: 'var(--text-secondary)' }}>
              Could not load case studies from backend. Make sure the server is running on port 5000.
            </p>
          )}
          {caseStudies.map((cs) => {
            // Temporary: keep all case studies in a single unlocked bucket so
            // the existing ProgressContext continues to function unchanged.
            const { percent } = getLevelProgress(1);

            return (
              <div
                key={cs.id}
                className="glass-panel"
                style={{
                  padding: '2rem',
                  display: 'flex',
                  gap: '2rem',
                  alignItems: 'center',
                  cursor: 'pointer',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  opacity: 1,
                  position: 'relative',
                  zIndex: 1,
                  marginLeft: '40px',
                  marginRight: '0px',
                }}
                onClick={() => onCardClick(cs)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                }}
              >
                <div style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '50%',
                  background: 'rgba(59, 130, 246, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  border: `2px solid var(--accent-secondary)`
                }}>
                  <Unlock size={28} color="var(--accent-secondary)" />
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '1rem', marginBottom: '0.5rem' }}>
                    <h2 style={{ fontSize: '1.5rem', color: 'var(--text-primary)' }}>{cs.title}</h2>
                  </div>
                  {cs.subtitle && (
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '0.5rem', fontStyle: 'italic' }}>
                      {cs.subtitle}
                    </p>
                  )}
                  <p style={{ color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '1rem' }}>
                    {cs.description}
                  </p>

                  <div style={{ display: 'flex', gap: '2rem', alignItems: 'center', fontSize: '0.9rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)' }}>
                      <Flag size={16} color="var(--accent-secondary)" />
                      <span>{cs.tags?.length || 0} Topics</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, maxWidth: '200px' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Progress:</span>
                      <div style={{ flex: 1, height: '8px', background: 'var(--bg-primary)', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{
                          height: '100%',
                          width: `${percent}%`,
                          background: 'linear-gradient(90deg, var(--accent-secondary), var(--accent-primary))',
                          borderRadius: '4px'
                        }} />
                      </div>
                      <span style={{ color: 'var(--text-primary)', fontWeight: 500, minWidth: '40px' }}>{percent}%</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default LevelSelection;
