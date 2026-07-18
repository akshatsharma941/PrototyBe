import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import CaseStudy from './pages/CaseStudy';
import Tutor from './pages/Tutor';
import CodeChallenge from './pages/CodeChallenge';
import LevelSelection from './pages/LevelSelection';
import CaseStudies from './pages/CaseStudies';
import MissionExperience from './pages/MissionExperience';

import { ProgressProvider } from './context/ProgressContext';

function App() {
  return (
    <ProgressProvider>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/levels" element={<LevelSelection />} />
        <Route path="/level/:id/case-studies" element={<CaseStudies />} />
        <Route path="/workspace/:id" element={<MissionExperience />} />
        <Route path="/case-study/:id" element={<CaseStudy />} />
        <Route path="/tutor/:id" element={<Tutor />} />
        <Route path="/challenge/:id" element={<CodeChallenge />} />
      </Routes>
    </ProgressProvider>
  );
}

export default App;
