// Load case studies from the backend instead of the local mockData.js.
// Backend (backend/seedData.js) is the single source of truth ΓÇö adding a
// new entry there makes a new card appear here on next load.
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
// Icons: Lock/CheckCircle come from the original main-branch level UI
// (locked popup + completion state). Unlock/Flag/Zap/Compass/ArrowLeft/X
// support the new header chrome (XP, back button, locked-modal close).
import { Lock, Unlock, CheckCircle, Flag, Zap, Compass, ArrowLeft, X } from 'lucide-react';
import { useProgress } from '../context/ProgressContext';
import Logo from '../components/common/Logo';

const API_BASE = 'http://localhost:5001';

const LevelSelection = () => {
  const navigate = useNavigate();
  const { xp, discoveredConcepts, getLevelProgress } = useProgress();
  const [lockedPopup, setLockedPopup] = useState(null);

  useEffect(() => {
    if (!lockedPopup) return;
    const onKey = (e) => {
      if (e.key === 'Escape') setLockedPopup(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [lockedPopup]);

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
        // Each item is also given a synthetic levelNumber (1, 2, 3, ...)
        // so the lock/complete UI from main's design and ProgressContext's
        // per-level progress lookup both work on backend-driven items.
        // Until the real Level system lands, the controller treats them as
        // one bucket (levelNumber 1) ΓÇö lockedPopup + getLevelProgress will
        // start respecting real per-level state once it ships.
        const list = (data || []).map((cs, idx) => ({
          id: cs.id || cs._id,
          title: cs.title,
          description: cs.description,
          subtitle: cs.subtitle,
          difficulty: cs.difficulty,
          tags: cs.tags || [],
          levelNumber: idx + 1
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

  // Single click handler used by the rendered cards. Respects the lock
  // state surfaced by ProgressContext (per-level progress) and either
  // navigates to the case-study route or shows the locked modal.
  const handleCardClick = (item) => {
    const { isUnlocked } = getLevelProgress(item.levelNumber);
    if (isUnlocked) {
      navigate(`/case-study/${encodeURIComponent(item.id)}`);
    } else {
      setLockedPopup(item);
    }
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <Logo size="small" />
            {/* XP ΓÇö pinned to top right */}
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.5rem 1rem',
                background: 'rgba(245, 158, 11, 0.1)',
                border: '1px solid rgba(245, 158, 11, 0.3)',
                borderRadius: '999px',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
                boxShadow: 'var(--shadow-sm)'
              }}
            >
              <Zap size={16} color="#f59e0b" fill="#f59e0b" />
              <span style={{ color: '#f59e0b', fontWeight: 700, fontSize: '0.95rem', letterSpacing: '0.5px' }}>
                {xp} XP
              </span>
            </div>
          </div>
        </div>
        {/* Discovered Concepts (XP moved to top-right) */}
        <div style={{
          width: '100%',
          marginBottom: '3rem',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '0.75rem',
          padding: '1.5rem 2rem',
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid var(--glass-border)',
          borderRadius: '16px',
          backdropFilter: 'blur(10px)'
        }}>
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

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%', position: 'relative' }}>
          {/* Vertical line connecting nodes ΓÇö centered on the 60px icons (left: 30px = 60/2) */}
          <div
            aria-hidden="true"
            style={{
              position: 'absolute',
              top: '30px',
              bottom: '30px',
              left: '30px',
              width: '3px',
              background: 'linear-gradient(180deg, var(--glass-border) 0%, rgba(139, 92, 246, 0.25) 50%, var(--glass-border) 100%)',
              borderRadius: '2px',
              transform: 'translateX(-1.5px)',
              zIndex: 0
            }}
          />

          {/* Click target: each fetched case study. The list comes from the
              backend (HEAD architecture); the card layout uses main's
              three-state icon column (locked / unlocked / completed) so
              the lockedPopup + ProgressContext wiring keeps working. Each
              case study is given a synthetic levelNumber (1, 2, 3, ΓÇª) at
              load time so per-level progress lookups are meaningful. */}
          {caseStudies.length === 0 && status !== 'error' && (
            <p style={{ color: 'var(--text-secondary)' }}>Loading case studiesΓÇª</p>
          )}
          {status === 'error' && (
            <p style={{ color: 'var(--text-secondary)' }}>
              Could not load case studies from backend. Make sure the server is running on port 5000.
            </p>
          )}
          {caseStudies.map((cs) => {
            const { percent, isUnlocked } = getLevelProgress(cs.levelNumber);
            const isCompleted = percent === 100;

            return (
              <div
                key={cs.id}
                style={{
                  display: 'flex',
                  alignItems: 'stretch',
                  gap: '1.5rem',
                  position: 'relative',
                  zIndex: 1
                }}
              >
                {/* Icon column ΓÇö fixed width so every node lines up with the vertical line */}
                <div
                  style={{
                    width: '60px',
                    flexShrink: 0,
                    display: 'flex',
                    justifyContent: 'center',
                    position: 'relative'
                  }}
                >
                  <div
                    style={{
                      width: '60px',
                      height: '60px',
                      borderRadius: '50%',
                      background: isCompleted
                        ? 'rgba(16, 185, 129, 0.2)'
                        : (isUnlocked ? 'rgba(59, 130, 246, 0.2)' : 'var(--bg-primary)'),
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: `2px solid ${isUnlocked ? 'var(--accent-secondary)' : 'var(--glass-border)'}`,
                      boxShadow: isUnlocked ? 'var(--shadow-md)' : 'none',
                      transition: 'transform 0.25s ease, box-shadow 0.25s ease',
                      position: 'relative',
                      zIndex: 2
                    }}
                  >
                    {isCompleted ? (
                      <CheckCircle size={28} color="var(--success)" />
                    ) : isUnlocked ? (
                      <Unlock size={28} color="var(--accent-secondary)" />
                    ) : (
                      <Lock size={28} color="var(--text-secondary)" />
                    )}
                  </div>
                </div>

                {/* Card */}
                <div
                  className={`glass-panel ${!isUnlocked ? 'ide-disabled' : ''}`}
                  style={{
                    flex: 1,
                    padding: '2rem',
                    display: 'flex',
                    gap: '2rem',
                    alignItems: 'center',
                    cursor: isUnlocked ? 'pointer' : 'not-allowed',
                    transition: 'transform 0.2s ease, box-shadow 0.2s ease, opacity 0.2s ease',
                    opacity: isUnlocked ? 1 : 0.6
                  }}
                  onClick={() => handleCardClick(cs)}
                  onMouseEnter={(e) => {
                    if (isUnlocked) {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (isUnlocked) {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                    }
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '1rem', marginBottom: '0.5rem' }}>
                      <h2 style={{ fontSize: '1.5rem', color: 'var(--text-primary)' }}>
                        Level {cs.levelNumber}: {cs.title}
                      </h2>
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
                            background: isCompleted
                              ? 'var(--success)'
                              : 'linear-gradient(90deg, var(--accent-secondary), var(--accent-primary))',
                            borderRadius: '4px',
                            transition: 'width 0.4s ease'
                          }} />
                        </div>
                        <span style={{ color: 'var(--text-primary)', fontWeight: 500, minWidth: '40px' }}>{percent}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {lockedPopup && (
        <div
          onClick={() => setLockedPopup(null)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.6)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem',
            animation: 'fadeIn 0.2s ease-out'
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="locked-modal-title"
            className="glass-panel"
            style={{
              width: '100%',
              maxWidth: '440px',
              padding: '2.5rem 2rem 2rem',
              borderRadius: '20px',
              border: '1px solid rgba(239, 68, 68, 0.25)',
              boxShadow: '0 20px 50px rgba(0, 0, 0, 0.4), 0 0 30px rgba(239, 68, 68, 0.15)',
              textAlign: 'center',
              position: 'relative',
              background: 'var(--glass-bg)'
            }}
          >
            <button
              onClick={() => setLockedPopup(null)}
              aria-label="Close"
              style={{
                position: 'absolute',
                top: '0.75rem',
                right: '0.75rem',
                background: 'transparent',
                border: 'none',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                padding: '0.4rem',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'background 0.2s ease, color 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)';
                e.currentTarget.style.color = 'var(--text-primary)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = 'var(--text-secondary)';
              }}
            >
              <X size={18} />
            </button>

            <div
              style={{
                width: '72px',
                height: '72px',
                borderRadius: '50%',
                background: 'rgba(239, 68, 68, 0.12)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.25rem',
                boxShadow: '0 0 24px rgba(239, 68, 68, 0.15)'
              }}
            >
              <Lock size={32} color="#ef4444" />
            </div>

            <h2
              id="locked-modal-title"
              style={{
                fontSize: '1.5rem',
                fontWeight: 700,
                color: 'var(--text-primary)',
                marginBottom: '0.5rem'
              }}
            >
              Level Locked
            </h2>

            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '0.5rem' }}>
              <strong style={{ color: 'var(--text-primary)' }}>Level {lockedPopup.levelNumber}: {lockedPopup.title}</strong> is locked.
            </p>

            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '1.75rem' }}>
              Complete the previous level to unlock this level.
            </p>

            <button
              onClick={() => setLockedPopup(null)}
              style={{
                background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
                color: 'white',
                border: 'none',
                padding: '0.75rem 2rem',
                borderRadius: '10px',
                fontWeight: 600,
                fontSize: '0.95rem',
                cursor: 'pointer',
                transition: 'transform 0.15s ease, box-shadow 0.2s ease, opacity 0.2s ease',
                boxShadow: '0 4px 14px rgba(59, 130, 246, 0.3)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(59, 130, 246, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 14px rgba(59, 130, 246, 0.3)';
              }}
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LevelSelection;
