import React, { createContext, useState, useContext } from 'react';
import { mockLevels } from '../data/mockData';

const ProgressContext = createContext();

export const useProgress = () => useContext(ProgressContext);

export const ProgressProvider = ({ children }) => {
  const [completedMissions, setCompletedMissions] = useState([]);
  const [xp, setXp] = useState(0);
  const [discoveredConcepts, setDiscoveredConcepts] = useState([]);

  const completeMission = (missionId, xpReward, concepts = []) => {
    if (!completedMissions.includes(missionId)) {
      setCompletedMissions(prev => [...prev, missionId]);
      setXp(prev => prev + xpReward);
      
      const newConcepts = concepts.filter(c => !discoveredConcepts.includes(c));
      if (newConcepts.length > 0) {
        setDiscoveredConcepts(prev => [...prev, ...newConcepts]);
      }
    }
  };

  const getLevelProgress = (levelNum) => {
    const level = mockLevels.find(l => l.levelNumber === levelNum);
    if (!level) return { percent: 0, isUnlocked: false };

    // Level 1 is always unlocked
    let isUnlocked = levelNum === 1;

    if (levelNum > 1) {
      const prevLevel = mockLevels.find(l => l.levelNumber === levelNum - 1);
      if (prevLevel) {
        const prevMissionsCompleted = prevLevel.missions.every(m => completedMissions.includes(m.id));
        isUnlocked = prevMissionsCompleted;
      }
    }

    const totalMissions = level.missions.length;
    const completedCount = level.missions.filter(m => completedMissions.includes(m.id)).length;
    const percent = totalMissions === 0 ? 0 : Math.round((completedCount / totalMissions) * 100);

    return { percent, isUnlocked };
  };

  return (
    <ProgressContext.Provider value={{
      completedMissions,
      xp,
      discoveredConcepts,
      completeMission,
      getLevelProgress
    }}>
      {children}
    </ProgressContext.Provider>
  );
};
