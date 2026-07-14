import React, { useState, useRef, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { Play, UploadCloud, ChevronUp, ChevronDown, CheckCircle, XCircle } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProgress } from '../../context/ProgressContext';
import { mockLevels } from '../../data/mockData';
import MissionAccomplishedModal from './MissionAccomplishedModal';

const RightPanel = ({ pycratesStatus }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { completeMission } = useProgress();
  const [code, setCode] = useState('# Write your Python code here\n');
  const [testAreaHeight, setTestAreaHeight] = useState(250);
  const [isTestAreaOpen, setIsTestAreaOpen] = useState(true);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [testResults, setTestResults] = useState(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const isReady = pycratesStatus === 'Ready for Coding' || pycratesStatus === 'Complete';

  // Calculate next mission ID
  let nextMissionId = null;
  let currentMissionData = null;
  for (let lIdx = 0; lIdx < mockLevels.length; lIdx++) {
    const level = mockLevels[lIdx];
    const mIdx = level.missions.findIndex(m => m.id === id);
    if (mIdx !== -1) {
      currentMissionData = level.missions[mIdx];
      if (mIdx < level.missions.length - 1) {
        nextMissionId = level.missions[mIdx + 1].id;
      } else if (lIdx < mockLevels.length - 1) {
        nextMissionId = mockLevels[lIdx + 1].missions[0].id;
      }
      break;
    }
  }

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

  const handleRun = async () => {
    setIsExecuting(true);
    try {
      const missionData = mockLevels.flatMap(l => l.missions).find(m => m.id === id);
      const defaultTcs = [
        { input: '', expectedOutput: '0' },
        { input: '', expectedOutput: '1' }
      ];
      const tcs = missionData?.testCases || defaultTcs;

      const results = [];
      for (let i = 0; i < tcs.length; i++) {
        const tc = tcs[i];
        
        let codeToRun = code;
        // Simple hack to simulate state change across tests for this specific mission if needed
        if (id === 'mis-1-1' && tc.expectedOutput === '1') {
          // If they didn't write print statements, we can inject them or just run as is
          // but for general execution, just send the code.
        }

        const response = await fetch('http://localhost:5001/api/execute', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            language: 'python',
            files: [{ content: codeToRun }],
            stdin: tc.input
          })
        });
        
        const data = await response.json();
        
        if (!data.run || data.run.code !== 0 || data.run.stderr) {
           results.push({
             input: tc.input || 'None',
             expected: tc.expectedOutput,
             output: data.run?.stderr?.trim() || 'Execution Error',
             passed: false
           });
        } else {
           const actualOutput = data.run.output.trim();
           // For mis-1-1, maybe we just want to ensure it runs without error, or actually matches
           // Since it's a basic tracking mission, let's strictly compare output if expectedOutput is provided
           let passed = false;
           if (tc.expectedOutput) {
              passed = actualOutput === tc.expectedOutput;
           } else {
              passed = true;
           }

           results.push({
             input: tc.input || 'None',
             expected: tc.expectedOutput || 'Success',
             output: actualOutput || '(No output)',
             passed: passed
           });
        }
      }
      
      setTestResults(results);
    } catch (err) {
      console.error(err);
      alert('Failed to connect to execution server. Is the backend running?');
    } finally {
      setIsExecuting(false);
    }
  };

  const handleSubmit = () => {
    // Check if tests passed before submitting
    const allPassed = testResults?.every(r => r.passed);
    if (allPassed && testResults?.length > 0) {
      if (currentMissionData) {
        completeMission(id, currentMissionData.xpReward, currentMissionData.possibleConcepts);
      }
      setShowCompletionModal(true);
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
            disabled={isExecuting}
            className="btn-ide-run"
            style={{ opacity: isExecuting ? 0.7 : 1, cursor: isExecuting ? 'wait' : 'pointer' }}
          >
            <Play size={14} /> {isExecuting ? 'Running...' : 'Run Code'}
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
          onChange={(val) => setCode(val ?? '')}
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

      {/* Completion Modal */}
      {showCompletionModal && (
        <MissionAccomplishedModal 
          missionData={currentMissionData} 
          nextMissionId={nextMissionId} 
          onClose={() => setShowCompletionModal(false)} 
        />
      )}
    </div>
  );
};

export default RightPanel;
