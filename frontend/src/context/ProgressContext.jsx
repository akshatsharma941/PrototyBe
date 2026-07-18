import React, { createContext, useState, useContext, useCallback, useEffect } from 'react';
import { mockLevels } from '../data/mockData';

const ProgressContext = createContext();

export const useProgress = () => useContext(ProgressContext);

// ─── localStorage helpers ──────────────────────────────────────
const STORAGE_KEY = 'prototypbe_progress';

const loadFromStorage = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore corrupt data */ }
  return null;
};

const saveToStorage = (data) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch { /* quota exceeded — silently ignore */ }
};

// ─── Streak calculation ────────────────────────────────────────
// Given a sorted (newest-first) array of ISO date strings,
// compute how many consecutive days lead up to today (or yesterday).
const computeStreak = (sortedDates) => {
  if (sortedDates.length === 0) return 0;

  const toDateOnly = (s) => {
    const [y, m, d] = s.split('-').map(Number);
    return new Date(y, m - 1, d);
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  // The streak must start from today or yesterday
  const mostRecent = toDateOnly(sortedDates[0]);
  if (mostRecent.getTime() !== today.getTime() && mostRecent.getTime() !== yesterday.getTime()) {
    return 0; // streak is broken
  }

  let streak = 1;
  for (let i = 1; i < sortedDates.length; i++) {
    const current = toDateOnly(sortedDates[i]);
    const previous = toDateOnly(sortedDates[i - 1]);

    // Calculate difference in days
    const diffMs = previous.getTime() - current.getTime();
    const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      streak++;
    } else if (diffDays === 0) {
      // Same day (duplicate), skip
      continue;
    } else {
      // Gap — streak is broken
      break;
    }
  }

  return streak;
};

// Generate initial demo streak dates — last N consecutive days from today
const generateInitialStreakDates = (count) => {
  const dates = [];
  const today = new Date();
  for (let i = 0; i < count; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    dates.push(d.toISOString().split('T')[0]);
  }
  return dates; // sorted newest-first
};

// ─── Provider ──────────────────────────────────────────────────
export const ProgressProvider = ({ children }) => {
  // Initialize state from localStorage or defaults
  const [state, setState] = useState(() => {
    const saved = loadFromStorage();
    if (saved) {
      return {
        completedCaseStudies: saved.completedCaseStudies || [],
        xp: saved.xp || 0,
        discoveredConcepts: saved.discoveredConcepts || [],
        streakDates: saved.streakDates || [],
      };
    }
    // First-time visitor: no initial streak
    const initialDates = generateInitialStreakDates(0);
    return {
      completedCaseStudies: [],
      xp: 0,
      discoveredConcepts: [],
      streakDates: initialDates,
    };
  });

  // Derive streak count from dates (always computed, never stored separately)
  const streak = computeStreak(state.streakDates);

  // Persist to localStorage whenever state changes
  useEffect(() => {
    saveToStorage(state);
  }, [state]);

  // ─── Record a practice session for today ─────────────────────
  const recordPracticeDay = useCallback(() => {
    const today = new Date().toISOString().split('T')[0];
    setState(prev => {
      if (prev.streakDates.includes(today)) return prev; // already recorded
      // Insert today at the front (keep sorted newest-first)
      return { ...prev, streakDates: [today, ...prev.streakDates] };
    });
  }, []);

  // ─── Complete a case study ──────────────────────────────────────
  const completeCaseStudy = useCallback((caseStudyId, xpReward, concepts = []) => {
    setState(prev => {
      if (prev.completedCaseStudies.includes(caseStudyId)) return prev;

      const newCompleted = [...prev.completedCaseStudies, caseStudyId];
      const newXp = prev.xp + xpReward;
      const newConcepts = [
        ...prev.discoveredConcepts,
        ...concepts.filter(c => !prev.discoveredConcepts.includes(c))
      ];

      // Record today as a practice day
      const today = new Date().toISOString().split('T')[0];
      const newStreakDates = prev.streakDates.includes(today)
        ? prev.streakDates
        : [today, ...prev.streakDates];

      return {
        completedCaseStudies: newCompleted,
        xp: newXp,
        discoveredConcepts: newConcepts,
        streakDates: newStreakDates,
      };
    });
  }, []);

  // ─── Get level progress ──────────────────────────────────────
  const getLevelProgress = useCallback((levelNum) => {
    const level = mockLevels.find(l => l.levelNumber === levelNum);
    if (!level) return { percent: 0, isUnlocked: false };

    let isUnlocked = levelNum === 1;

    if (levelNum > 1) {
      const prevLevel = mockLevels.find(l => l.levelNumber === levelNum - 1);
      if (prevLevel) {
        const prevCaseStudiesCompleted = prevLevel.caseStudies.every(
          m => state.completedCaseStudies.includes(m.id)
        );
        isUnlocked = prevCaseStudiesCompleted;
      }
    }

    const totalCaseStudies = level.caseStudies.length;
    const completedCount = level.caseStudies.filter(
      m => state.completedCaseStudies.includes(m.id)
    ).length;
    const percent = totalCaseStudies === 0 ? 0 : Math.round((completedCount / totalCaseStudies) * 100);

    return { percent, isUnlocked };
  }, [state.completedCaseStudies]);

  return (
    <ProgressContext.Provider value={{
      completedCaseStudies: state.completedCaseStudies,
      xp: state.xp,
      discoveredConcepts: state.discoveredConcepts,
      completeCaseStudy,
      getLevelProgress,
      streak,
      streakDates: state.streakDates,
      recordPracticeDay
    }}>
      {children}
    </ProgressContext.Provider>
  );
};
