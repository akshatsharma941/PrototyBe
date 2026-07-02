import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import { Play, CheckCircle, XCircle } from 'lucide-react';

const CodeChallenge = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [caseStudy, setCaseStudy] = useState(null);
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [output, setOutput] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);
  const [evalResult, setEvalResult] = useState(null);

  useEffect(() => {
    fetch(`http://localhost:5000/api/case-studies/${id}`)
      .then(res => {
         if (!res.ok) throw new Error('Case study not found');
         return res.json();
      })
      .then(data => {
         setCaseStudy(data);
         setCode(data.starterCode || '# Write your Python code here...');
         setLoading(false);
      })
      .catch(err => {
         setError(err.message);
         setLoading(false);
      });
  }, [id]);

  const handleRunCode = async () => {
    setIsExecuting(true);
    setOutput('Running code...');
    setEvalResult(null);
    
    try {
      const res = await fetch('http://localhost:5000/api/execute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          language: 'python',
          version: '3.10.0',
          files: [{ content: code }]
        })
      });
      
      const data = await res.json();
      if (data.run) {
        setOutput(data.run.output || 'No output generated.');
      } else {
        setOutput(data.message || 'Error executing code.');
      }
    } catch (err) {
      setOutput('Failed to connect to execution engine.');
    } finally {
      setIsExecuting(false);
    }
  };

  const handleSubmit = async () => {
    setIsExecuting(true);
    setOutput('Evaluating against hidden test cases...');
    
    try {
      const res = await fetch('http://localhost:5000/api/eval', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          caseStudyId: id,
          code: code
        })
      });
      
      const data = await res.json();
      setEvalResult(data);
      if (data.failed === 0) {
        setOutput('All tests passed! Great job!');
      } else {
        setOutput(`Failed ${data.failed} test(s). Check hints below.`);
      }
    } catch (err) {
      setOutput('Failed to submit evaluation.');
    } finally {
      setIsExecuting(false);
    }
  };

  if (loading) return <div className="loader" style={{margin: '3rem auto'}}>Loading...</div>;
  if (error) return <div className="error-message">Error: {error}</div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', padding: '1rem', gap: '1rem', background: 'var(--bg-primary)' }}>
      <div className="glass-panel" style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ color: 'var(--accent-primary)', fontSize: '1.25rem' }}>Challenge: {caseStudy.title}</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{caseStudy.targetInsight}</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button className="btn-run" onClick={handleRunCode} disabled={isExecuting} style={{ background: 'var(--bg-secondary)', border: '1px solid var(--glass-border)' }}>
            <Play size={14} /> Run (Manual)
          </button>
          <button className="btn-primary" onClick={handleSubmit} disabled={isExecuting}>
            <CheckCircle size={16} /> Submit Solution
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '1rem', flex: 1, minHeight: 0 }}>
        <div className="glass-panel" style={{ flex: 2, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <Editor
            height="100%"
            defaultLanguage="python"
            theme="vs-dark"
            value={code}
            onChange={(val) => setCode(val)}
            options={{
              minimap: { enabled: false },
              fontSize: 15,
              fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
              padding: { top: 16 }
            }}
          />
        </div>

        <div className="glass-panel" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{ padding: '1rem', borderBottom: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.2)' }}>
            <h3 style={{ fontSize: '1rem', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>Output & Evaluation</h3>
          </div>
          
          <div className="output-content" style={{ padding: '1rem', flex: 1, overflowY: 'auto', background: '#000', color: '#0f0', fontFamily: "'JetBrains Mono', monospace", fontSize: '0.9rem' }}>
            {output || 'Run your code or submit to see results here.'}
          </div>

          {evalResult && (
            <div style={{ padding: '1rem', borderTop: '1px solid var(--glass-border)', background: evalResult.failed === 0 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)' }}>
              <h4 style={{ color: evalResult.failed === 0 ? 'var(--success)' : '#ef4444', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {evalResult.failed === 0 ? <><CheckCircle size={18}/> Success!</> : <><XCircle size={18}/> Needs Work</>}
              </h4>
              <p style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}>Passed: {evalResult.passed} | Failed: {evalResult.failed}</p>
              
              {evalResult.failed > 0 && evalResult.hints && evalResult.hints.length > 0 && (
                <div style={{ marginTop: '1rem' }}>
                  <h5 style={{ color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Hints:</h5>
                  <ul style={{ paddingLeft: '1.25rem', fontSize: '0.85rem', color: '#f8fafc' }}>
                    {evalResult.hints.map((hint, idx) => (
                      <li key={idx} style={{ marginBottom: '0.25rem' }}>
                        <strong>{hint.concept}:</strong> {hint.hint}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CodeChallenge;
