import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { mockLevels } from '../data/mockData';
import { Lock, Unlock, CheckCircle, Flag, Zap, Star, Compass, ArrowLeft, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useProgress } from '../context/ProgressContext';
import Logo from '../components/common/Logo';

// ─── Streak Calendar Component ─────────────────────────────────
const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const DAY_HEADERS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

const StreakCalendar = ({ streakDates }) => {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());

  const calendarDays = useMemo(() => {
    const firstDay = new Date(viewYear, viewMonth, 1).getDay();
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const days = [];

    // Empty slots for days before the 1st
    for (let i = 0; i < firstDay; i++) {
      days.push({ day: null, key: `empty-${i}` });
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const isActive = streakDates.includes(dateStr);
      const isToday = d === today.getDate() && viewMonth === today.getMonth() && viewYear === today.getFullYear();
      days.push({ day: d, key: dateStr, isActive, isToday });
    }

    return days;
  }, [viewYear, viewMonth, streakDates]);

  const goToPrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(y => y - 1);
    } else {
      setViewMonth(m => m - 1);
    }
  };

  const goToNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(y => y + 1);
    } else {
      setViewMonth(m => m + 1);
    }
  };

  return (
    <div className="streak-calendar">
      <div className="streak-calendar-nav">
        <button onClick={goToPrevMonth} aria-label="Previous month">
          <ChevronLeft size={16} />
        </button>
        <span>{MONTH_NAMES[viewMonth]} {viewYear}</span>
        <button onClick={goToNextMonth} aria-label="Next month">
          <ChevronRight size={16} />
        </button>
      </div>

      <div className="streak-calendar-grid">
        {DAY_HEADERS.map(d => (
          <div key={d} className="streak-calendar-day-header">{d}</div>
        ))}
        {calendarDays.map(({ day, key, isActive, isToday }) => (
          <div
            key={key}
            className={`streak-calendar-day${day === null ? ' empty' : ''}${isActive ? ' active-day' : ''}${isToday ? ' today' : ''}`}
          >
            {day}
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── Streak Modal Component ────────────────────────────────────
const StreakModal = ({ streak, streakDates, onClose }) => {
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="streak-modal-overlay" onClick={onClose}>
      <div className="streak-modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-label="Streak Calendar">
        <button className="streak-modal-close" onClick={onClose} aria-label="Close">
          <X size={18} />
        </button>

        <div className="streak-modal-header">
          <span className="streak-modal-fire">🔥</span>
          <div className="streak-modal-count">{streak}</div>
          <div className="streak-modal-label">day streak!</div>
        </div>

        <div style={{
          padding: '0.75rem 1rem',
          background: 'rgba(59, 130, 246, 0.08)',
          border: '1px solid rgba(59, 130, 246, 0.2)',
          borderRadius: '12px',
          textAlign: 'center',
          fontSize: '0.85rem',
          color: 'var(--text-secondary)',
          lineHeight: 1.5
        }}>
          <span style={{ color: '#60a5fa', fontWeight: 600 }}>Keep it up!</span> Practice daily to maintain your streak and earn bonus XP.
        </div>

        <StreakCalendar streakDates={streakDates} />
      </div>
    </div>
  );
};

// ─── Node Tooltip Component ────────────────────────────────────
const NodeTooltip = ({ level, percent, isUnlocked, isCompleted, onStart }) => (
  <div className="path-tooltip" onClick={(e) => e.stopPropagation()}>
    <div className="path-tooltip-title">Level {level.levelNumber}: {level.title}</div>
    <div className="path-tooltip-desc">{level.description}</div>
    <div className="path-tooltip-meta">
      <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
        <Flag size={12} color="var(--accent-secondary)" /> {level.caseStudies.length} Case Studies
      </span>
      <span>{percent}% Complete</span>
    </div>
    <div className="path-tooltip-progress">
      <div className="path-tooltip-progress-bar" style={{
        width: `${percent}%`,
        background: isCompleted ? 'var(--success)' : undefined
      }} />
    </div>
    {isUnlocked ? (
      <button className="path-tooltip-btn btn-start" onClick={onStart}>
        {percent > 0 ? 'Continue' : 'Start'}
      </button>
    ) : (
      <button className="path-tooltip-btn btn-locked" disabled>
        🔒 Locked
      </button>
    )}
  </div>
);

// ─── Path Node Positions ───────────────────────────────────────
const NODE_VERTICAL_SPACING = 150;
const PATH_WIDTH = 420;

const getNodePosition = (index, total) => {
  // Serpentine S-curve: alternates left and right
  const pattern = [0.5, 0.25, 0.5, 0.75]; // center, left, center, right
  const patternIndex = index % pattern.length;
  const x = PATH_WIDTH * pattern[patternIndex];
  const y = 60 + index * NODE_VERTICAL_SPACING;
  return { x, y };
};

// ─── Main Component ────────────────────────────────────────────
const LevelSelection = () => {
  const navigate = useNavigate();
  const { xp, discoveredConcepts, getLevelProgress, streak, streakDates } = useProgress();
  const [lockedPopup, setLockedPopup] = useState(null);
  const [showStreakModal, setShowStreakModal] = useState(false);
  const [hoveredNode, setHoveredNode] = useState(null);

  useEffect(() => {
    if (!lockedPopup) return;
    const onKey = (e) => {
      if (e.key === 'Escape') setLockedPopup(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [lockedPopup]);

  const handleNodeClick = (level, isUnlocked) => {
    if (isUnlocked) {
      navigate(`/level/${level.id}/case-studies`);
    } else {
      setLockedPopup(level);
    }
  };

  // Determine the "active" level (first unlocked but not completed)
  const activeIndex = useMemo(() => {
    for (let i = 0; i < mockLevels.length; i++) {
      const { percent, isUnlocked } = getLevelProgress(mockLevels[i].levelNumber);
      if (isUnlocked && percent < 100) return i;
    }
    return 0;
  }, [getLevelProgress]);

  // Calculate node positions
  const nodePositions = useMemo(() => {
    return mockLevels.map((_, i) => getNodePosition(i, mockLevels.length));
  }, []);

  // Generate SVG connector paths
  const connectorPaths = useMemo(() => {
    const paths = [];
    for (let i = 0; i < nodePositions.length - 1; i++) {
      const from = nodePositions[i];
      const to = nodePositions[i + 1];
      const midY = (from.y + to.y) / 2;
      const d = `M ${from.x} ${from.y} C ${from.x} ${midY}, ${to.x} ${midY}, ${to.x} ${to.y}`;
      paths.push({ d, fromIndex: i, toIndex: i + 1 });
    }
    return paths;
  }, [nodePositions]);

  const totalHeight = 60 + (mockLevels.length - 1) * NODE_VERTICAL_SPACING + 100;

  return (
    <div className="doodle-bg learning-path-page">
      <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

        {/* ── Top Bar ────────────────────────────────────── */}
        <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <button onClick={() => navigate('/')} className="btn-back">
            <ArrowLeft size={16} /> Back to Home
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Logo size="small" />

            {/* Streak Fire Badge */}
            <div
              className="streak-badge"
              onClick={() => setShowStreakModal(true)}
              role="button"
              tabIndex={0}
              aria-label={`${streak} day streak. Click to view streak calendar.`}
              onKeyDown={(e) => e.key === 'Enter' && setShowStreakModal(true)}
            >
              <span className="streak-fire">🔥</span>
              <span className="streak-number">{streak}</span>
            </div>

            {/* XP Badge */}
            <div style={{
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
            }}>
              <Zap size={16} color="#f59e0b" fill="#f59e0b" />
              <span style={{ color: '#f59e0b', fontWeight: 700, fontSize: '0.95rem', letterSpacing: '0.5px' }}>
                {xp} XP
              </span>
            </div>
          </div>
        </div>

        {/* ── Discovered Concepts ────────────────────────── */}
        <div style={{
          width: '100%',
          marginBottom: '2rem',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '0.75rem',
          padding: '1.25rem 1.5rem',
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid var(--glass-border)',
          borderRadius: '16px',
          backdropFilter: 'blur(10px)'
        }}>
          <div style={{ background: 'rgba(59, 130, 246, 0.1)', padding: '0.5rem', borderRadius: '50%', marginTop: '0.2rem' }}>
            <Star size={20} color="#3b82f6" />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600 }}>Discovered Concepts</div>
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
              {discoveredConcepts.length === 0 ? (
                <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>None yet — start your journey below!</span>
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

        {/* ── Path Header ───────────────────────────────── */}
        <header style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h1 style={{
            fontSize: '2.5rem',
            marginBottom: '0.75rem',
            background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontWeight: 700
          }}>
            Your Learning Path
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>
            Progress through the levels. Master the logic before touching the syntax.
          </p>
        </header>

        {/* ── Serpentine Path ────────────────────────────── */}
        <div style={{
          position: 'relative',
          width: `${PATH_WIDTH}px`,
          height: `${totalHeight}px`,
          margin: '0 auto'
        }}>
          {/* SVG connectors */}
          <svg
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', zIndex: 0 }}
            viewBox={`0 0 ${PATH_WIDTH} ${totalHeight}`}
            preserveAspectRatio="none"
          >
            {connectorPaths.map(({ d, fromIndex, toIndex }, i) => {
              const fromProgress = getLevelProgress(mockLevels[fromIndex].levelNumber);
              const toProgress = getLevelProgress(mockLevels[toIndex].levelNumber);
              let connectorClass = 'path-connector-line';
              if (fromProgress.percent === 100 && toProgress.isUnlocked) {
                connectorClass += ' completed';
              } else if (fromIndex === activeIndex || toIndex === activeIndex) {
                connectorClass += ' active';
              }
              return <path key={i} d={d} className={connectorClass} />;
            })}
          </svg>

          {/* Nodes */}
          {mockLevels.map((level, index) => {
            const { percent, isUnlocked } = getLevelProgress(level.levelNumber);
            const isCompleted = percent === 100;
            const isActive = index === activeIndex;
            const pos = nodePositions[index];

            let nodeClass = 'path-node';
            if (isCompleted) nodeClass += ' node-completed';
            else if (isActive) nodeClass += ' node-active';
            else if (!isUnlocked) nodeClass += ' node-locked';
            else nodeClass += ' node-active'; // unlocked but not the primary active

            return (
              <div
                key={level.id}
                className={nodeClass}
                style={{ left: `${pos.x}px`, top: `${pos.y}px` }}
                onClick={() => handleNodeClick(level, isUnlocked)}
                onMouseEnter={() => setHoveredNode(level.id)}
                onMouseLeave={() => setHoveredNode(null)}
                role="button"
                tabIndex={0}
                aria-label={`Level ${level.levelNumber}: ${level.title}. ${isUnlocked ? (isCompleted ? 'Completed' : 'Available') : 'Locked'}`}
              >
                {/* Outer ring for active node */}
                {isActive && <div className="node-outer-ring" />}

                {/* Start here label for active node */}
                {isActive && hoveredNode !== level.id && (
                  <div className="path-start-label">Start Here</div>
                )}

                {/* Node icon */}
                {isCompleted ? (
                  <CheckCircle size={32} color="#10b981" />
                ) : (isActive || isUnlocked) ? (
                  <Star size={32} color="#3b82f6" fill="rgba(59, 130, 246, 0.3)" />
                ) : (
                  <Lock size={28} color="rgba(255, 255, 255, 0.3)" />
                )}

                {/* Level label */}
                <span className="path-node-label">Level {level.levelNumber}</span>

                {/* Hover tooltip */}
                {hoveredNode === level.id && (
                  <NodeTooltip
                    level={level}
                    percent={percent}
                    isUnlocked={isUnlocked}
                    isCompleted={isCompleted}
                    onStart={() => navigate(`/level/${level.id}/case-studies`)}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Streak Modal ──────────────────────────────── */}
      {showStreakModal && (
        <StreakModal
          streak={streak}
          streakDates={streakDates}
          onClose={() => setShowStreakModal(false)}
        />
      )}

      {/* ── Locked Level Popup ────────────────────────── */}
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

            <div style={{
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
            }}>
              <Lock size={32} color="#ef4444" />
            </div>

            <h2 id="locked-modal-title" style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
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
