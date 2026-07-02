import React, { useState, useRef, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { Play, UploadCloud, ChevronUp, ChevronDown, CheckCircle, XCircle } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProgress } from '../../context/ProgressContext';
import { mockLevels } from '../../data/mockData';

const RightPanel = ({ pycratesStatus }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { completeMission } = useProgress();
  const [code, setCode] = useState('# Write your Python code here\n');
  const [testAreaHeight, setTestAreaHeight] = useState(250);
  const [isTestAreaOpen, setIsTestAreaOpen] = useState(true);
  const isReady = pycratesStatus === 'Ready for Coding' || pycratesStatus === 'Complete';
  
  const dividerRef = useRef(null);
  const containerRef = useRef(null);

  const startResize = (e) => {
    e.preventDefault();
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleMouseMove = (e) => {
    if (!containerRef.current) return;
    const containerRect = containerRef.current.getBoundingClientRect();
    const newHeight = containerRect.bottom - e.clientY;
    if (newHeight > 100 && newHeight < containerRect.height - 100) {
      setTestAreaHeight(newHeight);
      if (!isTestAreaOpen) setIsTestAreaOpen(true);
    }
  };

  const handleMouseUp = () => {
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  };

  const [testResults, setTestResults] = useState(null);

  const handleRun = () => {
    setTestResults([
      { input: 'Initial state', expected: '0', output: '0', passed: true },
      { input: 'Add 1 cup', expected: '1', output: '1', passed: true }
    ]);
  };

  const handleSubmit = () => {
    // Check if tests passed before submitting
    const allPassed = testResults?.every(r => r.passed);
    if (allPassed && testResults?.length > 0) {
      alert('Mission Completed successfully!');
      // Find mission data to get XP and concepts
      const missionData = mockLevels.flatMap(l => l.missions).find(m => m.id === id);
      if (missionData) {
        completeMission(id, missionData.xpReward, missionData.possibleConcepts);
      }
      navigate('/levels');
    } else {
      alert('You must run and pass all tests before submitting!');
    }
  };

  return (
    <div ref={containerRef} style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#1e1e1e' }}>
      
      {/* IDE Toolbar */}
      <div style={{ 
        padding: '0.5rem 1rem', 
        background: '#2d2d2d', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        borderBottom: '1px solid #404040'
      }}>
        <div style={{ fontSize: '0.85rem', color: '#ccc' }}>solution.py</div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button 
            onClick={handleRun}
            style={{ 
              background: 'transparent', 
              border: '1px solid #404040', 
              color: '#ccc', 
              padding: '0.4rem 0.75rem', 
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              cursor: 'pointer',
              fontSize: '0.85rem'
            }}
          >
            <Play size={14} /> Run Code
          </button>
          <button 
            disabled={!isReady}
            style={{ 
              background: isReady ? 'var(--success)' : '#404040', 
              border: 'none', 
              color: isReady ? 'white' : '#888', 
              padding: '0.4rem 1rem', 
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              cursor: isReady ? 'pointer' : 'not-allowed',
              fontSize: '0.85rem',
              fontWeight: 600
            }}
          >
            <UploadCloud size={14} /> Submit
          </button>
        </div>
      </div>

      {/* Editor */}
      <div style={{ flex: 1, minHeight: 0 }}>
        <Editor
          height="100%"
          defaultLanguage="python"
          theme="vs-dark"
          value={code}
          onChange={setCode}
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            padding: { top: 16 }
          }}
        />
      </div>

      {/* Vertical Resizer */}
      <div 
        ref={dividerRef}
        onMouseDown={startResize}
        style={{ 
          height: '6px', 
          background: '#333', 
          cursor: 'row-resize',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderTop: '1px solid #404040',
          borderBottom: '1px solid #404040'
        }}
      >
        <div style={{ width: '40px', height: '2px', background: '#555', borderRadius: '2px' }} />
      </div>

      {/* Test Cases Area */}
      <div style={{ 
        height: isTestAreaOpen ? `${testAreaHeight}px` : '40px',
        background: '#2d2d2d',
        display: 'flex',
        flexDirection: 'column',
        transition: isTestAreaOpen ? 'none' : 'height 0.2s ease'
      }}>
        <div 
          onClick={() => setIsTestAreaOpen(!isTestAreaOpen)}
          style={{ 
            padding: '0.5rem 1rem', 
            display: 'flex', 
            justifyContent: 'space-between',
            alignItems: 'center',
            cursor: 'pointer',
            borderBottom: '1px solid #404040',
            userSelect: 'none'
          }}
        >
          <span style={{ fontSize: '0.85rem', color: '#ccc', fontWeight: 600 }}>Test Cases</span>
          {isTestAreaOpen ? <ChevronDown size={16} color="#aaa" /> : <ChevronUp size={16} color="#aaa" />}
        </div>
        
        {isTestAreaOpen && (
          <div style={{ flex: 1, overflowY: 'auto', padding: '1rem' }}>
            {!testResults ? (
              <div style={{ color: '#888', fontSize: '0.85rem' }}>Run code to see test results.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {testResults.map((tr, idx) => (
                  <div key={idx} style={{ background: '#1e1e1e', padding: '1rem', borderRadius: '6px', border: '1px solid #404040' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      {tr.passed ? <CheckCircle size={16} color="var(--success)" /> : <XCircle size={16} color="#ef4444" />}
                      <span style={{ color: tr.passed ? 'var(--success)' : '#ef4444', fontWeight: 600, fontSize: '0.85rem' }}>
                        Test Case {idx + 1}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.85rem', color: '#ccc', display: 'grid', gridTemplateColumns: '80px 1fr', gap: '0.5rem', marginTop: '0.5rem' }}>
                      <span style={{ color: '#888' }}>Input:</span> <span>{tr.input}</span>
                      <span style={{ color: '#888' }}>Expected:</span> <span>{tr.expected}</span>
                      <span style={{ color: '#888' }}>Output:</span> <span>{tr.output}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default RightPanel;
