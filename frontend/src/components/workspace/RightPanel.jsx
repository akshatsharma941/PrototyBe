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
        padding: '0.75rem 1.25rem', 
        background: 'var(--bg-secondary)', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        borderBottom: '1px solid var(--glass-border)'
      }}>
        <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#f59e0b' }} />
          solution.py
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button 
            onClick={handleRun}
            className="btn-ide-run"
          >
            <Play size={14} /> Run Code
          </button>
          <button 
            onClick={handleSubmit}
            disabled={!isReady}
            className="btn-ide-submit"
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
          background: 'var(--bg-primary)', 
          cursor: 'row-resize',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderTop: '1px solid var(--glass-border)',
          borderBottom: '1px solid var(--glass-border)'
        }}
      >
        <div style={{ width: '40px', height: '2px', background: 'var(--text-secondary)', borderRadius: '2px', opacity: 0.5 }} />
      </div>

      {/* Test Cases Area */}
      <div style={{ 
        height: isTestAreaOpen ? `${testAreaHeight}px` : '48px',
        background: 'var(--bg-secondary)',
        display: 'flex',
        flexDirection: 'column',
        transition: isTestAreaOpen ? 'none' : 'height 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
      }}>
        <div 
          onClick={() => setIsTestAreaOpen(!isTestAreaOpen)}
          style={{ 
            padding: '0.75rem 1.5rem', 
            display: 'flex', 
            justifyContent: 'space-between',
            alignItems: 'center',
            cursor: 'pointer',
            borderBottom: isTestAreaOpen ? '1px solid var(--glass-border)' : 'none',
            userSelect: 'none',
            background: 'rgba(255, 255, 255, 0.02)'
          }}
        >
          <span style={{ fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: 600, letterSpacing: '0.5px' }}>Test Cases</span>
          {isTestAreaOpen ? <ChevronDown size={18} color="var(--text-secondary)" /> : <ChevronUp size={18} color="var(--text-secondary)" />}
        </div>
        
        {isTestAreaOpen && (
          <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', background: 'var(--bg-primary)' }}>
            {!testResults ? (
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', fontStyle: 'italic', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                Click "Run Code" to execute tests against your logic.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {testResults.map((tr, idx) => (
                  <div key={idx} style={{ 
                    background: 'var(--bg-secondary)', 
                    padding: '1.25rem', 
                    borderRadius: '8px', 
                    border: `1px solid ${tr.passed ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
                    boxShadow: 'var(--shadow-sm)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.75rem' }}>
                      {tr.passed ? <CheckCircle size={18} color="var(--success)" /> : <XCircle size={18} color="#ef4444" />}
                      <span style={{ color: tr.passed ? 'var(--success)' : '#ef4444', fontWeight: 600, fontSize: '0.95rem' }}>
                        Test Case {idx + 1} {tr.passed ? 'Passed' : 'Failed'}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.9rem', color: 'var(--text-primary)', display: 'grid', gridTemplateColumns: '90px 1fr', gap: '0.75rem', fontFamily: 'JetBrains Mono, monospace' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Input:</span> <span>{tr.input}</span>
                      <span style={{ color: 'var(--text-secondary)' }}>Expected:</span> <span>{tr.expected}</span>
                      <span style={{ color: 'var(--text-secondary)' }}>Output:</span> <span style={{ color: tr.passed ? 'var(--success)' : '#ef4444' }}>{tr.output}</span>
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
