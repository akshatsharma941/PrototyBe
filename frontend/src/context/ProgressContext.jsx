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
        completedMissions: saved.completedMissions || [],
        xp: saved.xp || 0,
        discoveredConcepts: saved.discoveredConcepts || [],
        streakDates: saved.streakDates || [],
      };
    }
    // First-time visitor: seed with 5 days of demo streak
    const initialDates = generateInitialStreakDates(5);
    return {
      completedMissions: [],
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

  // ─── Complete a mission ──────────────────────────────────────
  const completeMission = useCallback((missionId, xpReward, concepts = []) => {
    setState(prev => {
      if (prev.completedMissions.includes(missionId)) return prev;

      const newCompleted = [...prev.completedMissions, missionId];
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
        completedMissions: newCompleted,
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
        const prevMissionsCompleted = prevLevel.missions.every(
          m => state.completedMissions.includes(m.id)
        );
        isUnlocked = prevMissionsCompleted;
      }
    }

    const totalMissions = level.missions.length;
    const completedCount = level.missions.filter(
      m => state.completedMissions.includes(m.id)
    ).length;
    const percent = totalMissions === 0 ? 0 : Math.round((completedCount / totalMissions) * 100);

    return { percent, isUnlocked };
  }, [state.completedMissions]);

  return (
    <ProgressContext.Provider value={{
      completedMissions: state.completedMissions,
      xp: state.xp,
      discoveredConcepts: state.discoveredConcepts,
      completeMission,
      getLevelProgress,
      streak,
      streakDates: state.streakDates,
      recordPracticeDay
    }}>
      {children}
    </ProgressContext.Provider>
  );
};
