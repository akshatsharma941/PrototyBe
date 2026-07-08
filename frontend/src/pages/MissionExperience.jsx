import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import ProgressTracker from '../components/workspace/ProgressTracker';
import LeftPanel from '../components/workspace/LeftPanel';
import RightPanel from '../components/workspace/RightPanel';

import { mockLevels } from '../data/mockData';

const MissionExperience = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // Find the level and mission from mock data
  const level = mockLevels.find(l => l.missions.some(m => m.id === id));
  const missionData = level?.missions.find(m => m.id === id);
  
  const mission = {
    id: id,
    title: missionData?.title || 'Unknown Mission',
    story: missionData?.description || 'Mission details not found.'
  };

  const [leftWidth, setLeftWidth] = useState(
    parseInt(localStorage.getItem('pybe-left-width') || '450')
  );
  
  const [pycratesStatus, setPycratesStatus] = useState('Guiding Reasoning');
  const [currentStage, setCurrentStage] = useState('Mission Brief');

  useEffect(() => {
    setPycratesStatus('Guiding Reasoning');
    setCurrentStage('Mission Brief');
  }, [id]);

  const containerRef = useRef(null);

  const startResize = (e) => {
    e.preventDefault();
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleMouseMove = (e) => {
    if (!containerRef.current) return;
    const containerRect = containerRef.current.getBoundingClientRect();
    const newWidth = e.clientX - containerRect.left;
    if (newWidth > 300 && newWidth < containerRect.width - 300) {
      setLeftWidth(newWidth);
    }
  };

  const handleMouseUp = () => {
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  };

  useEffect(() => {
    localStorage.setItem('pybe-left-width', leftWidth.toString());
  }, [leftWidth]);

  return (
    <div key={id} style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      
      {/* Top Bar */}
      <div style={{ display: 'flex', alignItems: 'center', background: 'var(--bg-secondary)', borderBottom: '1px solid var(--glass-border)' }}>
        <div style={{ paddingLeft: '1rem', borderRight: '1px solid var(--glass-border)', paddingRight: '1.5rem', display: 'flex', alignItems: 'center' }}>
          <button 
            onClick={() => navigate(`/level/${level?.id}/missions`)}
            className="btn-back"
          >
            <ArrowLeft size={16} /> Back
          </button>
        </div>
        <div style={{ flex: 1 }}>
          <ProgressTracker currentStage={currentStage} />
        </div>
      </div>

      {/* Main Workspace */}
      <div ref={containerRef} style={{ display: 'flex', flex: 1, minHeight: 0 }}>
        
        {/* Left Panel */}
        <div style={{ width: `${leftWidth}px`, flexShrink: 0 }}>
          <LeftPanel 
            mission={mission} 
            pycratesStatus={pycratesStatus} 
            setPycratesStatus={setPycratesStatus}
            currentStage={currentStage}
            setCurrentStage={setCurrentStage}
          />
        </div>

        {/* Resizer */}
        <div 
          onMouseDown={startResize}
          style={{
            width: '6px',
            background: 'var(--bg-secondary)',
            cursor: 'col-resize',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            borderLeft: '1px solid var(--glass-border)',
            borderRight: '1px solid var(--glass-border)',
            zIndex: 10
          }}
        >
          <div style={{ width: '2px', height: '24px', background: 'var(--text-secondary)', borderRadius: '2px' }} />
        </div>

        {/* Right Panel */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <RightPanel pycratesStatus={pycratesStatus} />
        </div>
      </div>

      {/* Footer Notice */}
      <div style={{ 
        padding: '0.75rem 1.5rem', 
        background: 'var(--bg-secondary)', 
        borderTop: '1px solid var(--glass-border)',
        fontSize: '0.8rem',
        color: 'var(--text-secondary)',
        textAlign: 'center',
        lineHeight: 1.5
      }}>
        <strong style={{ color: 'var(--text-primary)' }}>PyBe evaluates your reasoning before your syntax.</strong> Once Pycrates has guided you to a correct solution approach, it is completely acceptable to use the Python code provided during instruction inside the coding workspace. The goal is to understand how ideas translate into Python, not to memorize syntax.
      </div>

    </div>
  );
};

export default MissionExperience;
