import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import { Send, Bot, User, Code, Play, ChevronUp, ChevronDown } from 'lucide-react';
import '../index.css';

const Tutor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [status, setStatus] = useState('needs_guidance');
  const [code, setCode] = useState('# Write your Python code here...');
  const [caseStudy, setCaseStudy] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [output, setOutput] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);
  const [hintVisible, setHintVisible] = useState(false);
  const [phase, setPhase] = useState(null);
  const [questionIndex, setQuestionIndex] = useState(0);
  const messagesEndRef = useRef(null);
  const retryAttemptedRef = useRef(false);
  const lastSubmissionRef = useRef('');

  // Resizable panel states
  const [leftWidth, setLeftWidth] = useState(() => {
    if (typeof window === 'undefined') return 500;
    const stored = window.localStorage.getItem('pybe-tutor-left-width');
    const parsed = parseInt(stored, 10);
    return Number.isFinite(parsed) ? parsed : 500;
  });
  
  const [outputHeight, setOutputHeight] = useState(() => {
    if (typeof window === 'undefined') return 250;
    const stored = window.localStorage.getItem('pybe-tutor-output-height');
    const parsed = parseInt(stored, 10);
    return Number.isFinite(parsed) ? parsed : 250;
  });
  
  const [isOutputOpen, setIsOutputOpen] = useState(true);
  const containerRef = useRef(null);

  const startHorizontalResize = (e) => {
    e.preventDefault();
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
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const startVerticalResize = (e) => {
    e.preventDefault();
    const handleMouseMove = (e) => {
      if (!containerRef.current) return;
      const containerRect = containerRef.current.getBoundingClientRect();
      const newHeight = containerRect.bottom - e.clientY;
      if (newHeight > 100 && newHeight < containerRect.height - 100) {
        setOutputHeight(newHeight);
        if (!isOutputOpen) setIsOutputOpen(true);
      }
    };
    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem('pybe-tutor-left-width', leftWidth.toString());
      window.localStorage.setItem('pybe-tutor-output-height', outputHeight.toString());
    } catch (e) {}
  }, [leftWidth, outputHeight]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, status]);

  useEffect(() => {
    fetch(`http://localhost:5001/api/case-studies/${id}`)
      .then(res => {
         if (!res.ok) throw new Error('Case study not found');
         return res.json();
      })
      .then(data => {
         setCaseStudy(data);
         setCode(data.starterCode || '# Write your Python code here...');
         setLoading(false);
         bootstrapFirstTurn(data);
      })
      .catch(err => {
         setError(err.message);
         setLoading(false);
      });
  }, [id]);

  const bootstrapFirstTurn = async (cs) => {
    try {
      setIsTyping(true);
      const res = await fetch('http://localhost:5001/api/tutor/explanation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          caseStudyId: cs.id || cs._id,
          studentExplanation: ' '
        })
      });
      if (!res.ok) throw new Error('Tutor bootstrap failed');
      const data = await res.json();
      setIsTyping(false);
      setMessages([{ role: 'assistant', content: data.message }]);
      if (data.phase) setPhase(data.phase);
      if (typeof data.questionIndex === 'number') setQuestionIndex(data.questionIndex);
      if (data.status === 'insight_reached') setStatus('insight_reached');
    } catch (e) {
      setIsTyping(false);
      setMessages([{
        role: 'assistant',
        content: "Hello! I'm your PyBe Tutor. Let's work through the Case Study together. Explain to me how you think we should solve this problem?"
      }]);
    }
  };

  const handleSend = async (retry = false) => {
    if (!retry && !input.trim()) return;
    const text = retry ? lastSubmissionRef.current : input.trim();

    if (!retry) {
      lastSubmissionRef.current = text;
      const userMessage = { role: 'user', content: text };
      setMessages(prev => [...prev, userMessage]);
      setInput('');
    }
    setIsTyping(true);

    try {
      const res = await fetch('http://localhost:5001/api/tutor/explanation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          caseStudyId: caseStudy.id || caseStudy._id,
          studentExplanation: text,
          currentPhase: phase,
          questionIndex
        })
      });

      if (!res.ok) throw new Error("API failed");

      const data = await res.json();
      setIsTyping(false);

      if (data.isRateLimit && !retryAttemptedRef.current) {
        retryAttemptedRef.current = true;
        const waitMs = Math.min(8000, Math.max(1500, (data.retryAfterSeconds || 5) * 1000));
        // v1.1: show the persona's rate-limit message directly. Do NOT
        // append "Retrying automatically..." - it leaks infrastructure
        // into the learner experience. The persona message itself ("Hold
        // on a sec - I'm gathering my thoughts.") is enough.
        setMessages(prev => {
          const next = [...prev];
          next[next.length - 1] = {
            role: 'assistant',
            content: data.message
          };
          return next;
        });
        await new Promise(r => setTimeout(r, waitMs));
        return handleSend(true);
      }

      retryAttemptedRef.current = false;
      setMessages(prev => [...prev, {
          role: 'assistant',
          content: data.message
      }]);

      if (data.phase) setPhase(data.phase);
      if (typeof data.questionIndex === 'number') setQuestionIndex(data.questionIndex);

      if (data.status === 'insight_reached') {
        setStatus('insight_reached');
      }
    } catch (err) {
      // v1.1: the previous version had a kitchen-sink fallback here that
      // hardcoded bakery-checkout case-study content ("multiply the
      // quantities by the prices"). That leaked the bakery checkout into
      // every other case-study session and made the Socratic tutor
      // behaviour unpredictable. Replaced with a persona-voice fallback
      // that mirrors the controller's own error fallback. The tutor's
      // actual Socratic response comes from the controller's catch block
      // (which returns 200 with persona.fallback.error); this branch only
      // fires on hard network failures where the request never reached
      // the controller at all.
      console.error(err);
      setIsTyping(false);
      setTimeout(() => {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: "I'm having trouble reaching the tutor right now. Could you try sending your last message again?"
        }]);
      }, 800);
    }
  };

  const handleRunCode = async () => {
    setIsExecuting(true);
    setOutput('Running code...');
    
    try {
      const res = await fetch('http://localhost:5001/api/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
      console.error(err);
    } finally {
      setIsExecuting(false);
    }
  };

  if (loading) return <div className="loader" style={{margin: '3rem auto'}}>Loading...</div>;
  if (error) return <div className="error-message">Error: {error}</div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>

      {/* Main Workspace */}
      <div ref={containerRef} style={{ display: 'flex', flex: 1, minHeight: 0 }}>

        {/* LEFT PANEL: Case Study + Chat */}
        <div style={{ width: `${leftWidth}px`, flexShrink: 0, display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--bg-primary)' }}>
          
          {/* Case Study Context */}
          <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--glass-border)', flexShrink: 0, maxHeight: '30vh', overflowY: 'auto' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.25rem', marginBottom: '0.75rem', color: 'var(--accent-primary)' }}>
              <Code size={18} /> Case Study: {caseStudy?.title || 'Loading...'}
            </h3>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.5 }}>{caseStudy?.description}</p>
          </div>

          {/* Chat Area */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
            {/* Chat Messages - Scrollable */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {messages.map((msg, idx) => (
                <div key={idx} className={`chat-message ${msg.role}`}>
                  <div className="avatar">
                    {msg.role === 'assistant' ? <Bot size={20} /> : <User size={20} />}
                  </div>
                  <div className="message-bubble">
                    {msg.content}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="chat-message assistant">
                  <div className="avatar"><Bot size={20} /></div>
                  <div className="message-bubble">Thinking...</div>
                </div>
              )}
              
              {status === 'insight_reached' && (
                <div className="insight-reached-banner">
                  <h4>Insight Reached! 🎉</h4>
                  <p>You've successfully mapped out the logic. You're ready to translate this into code.</p>
                  <button className="btn-primary" onClick={() => navigate(`/challenge/${id}`)}>
                    Continue to Coding <Play size={16} />
                  </button>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Chat Input - Fixed at bottom */}
            <div style={{ padding: '1rem', borderTop: '1px solid var(--glass-border)', background: 'var(--bg-secondary)', flexShrink: 0 }}>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <textarea
                  placeholder="Explain your reasoning here..."
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  disabled={status === 'insight_reached'}
                  style={{
                    flex: 1,
                    background: 'var(--bg-primary)',
                    border: '1px solid var(--glass-border)',
                    borderRadius: '8px',
                    padding: '0.75rem 1rem',
                    color: 'var(--text-primary)',
                    outline: 'none',
                    fontFamily: 'inherit',
                    resize: 'none',
                    minHeight: '44px',
                    maxHeight: '120px'
                  }}
                />
                <button 
                  onClick={handleSend} 
                  disabled={isTyping || !input.trim() || status === 'insight_reached'}
                  style={{
                    background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
                    border: 'none',
                    borderRadius: '8px',
                    width: '46px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    color: 'white'
                  }}
                >
                  <Send size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Resizer */}
        <div 
          onMouseDown={startHorizontalResize}
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

        {/* RIGHT PANEL: IDE */}
        <div style={{ 
          flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', height: '100%',
          background: '#1e1e1e',
          opacity: 1,
          filter: 'none',
          transition: 'all 0.3s ease'
        }}>
          {/* IDE Header */}
          <div className="ide-header" style={{ flexShrink: 0 }}>
            <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-primary)' }}>Workspace</h3>
            <button className="btn-run" onClick={handleRunCode} disabled={isExecuting}>
              <Play size={14} /> {isExecuting ? 'Running...' : 'Run Code'}
            </button>
          </div>

          {/* Practice Task */}
          {caseStudy?.practice?.[0] && (
            <div style={{
              padding: '0.75rem 1rem',
              borderBottom: '1px solid rgba(255,255,255,0.08)',
              background: 'rgba(59, 130, 246, 0.06)',
              flexShrink: 0
            }}>
              <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--accent-secondary)', marginBottom: '0.35rem' }}>
                Practice Task
              </div>
              <div style={{ fontSize: '0.95rem', color: 'var(--text-primary)', lineHeight: '1.45', marginBottom: caseStudy.practice[0].hint ? '0.6rem' : 0 }}>
                {caseStudy.practice[0].task}
              </div>
              {caseStudy.practice[0].hint && (
                <div>
                  {!hintVisible ? (
                    <button type="button" onClick={() => setHintVisible(true)}
                      style={{ background: 'transparent', border: '1px solid rgba(251, 191, 36, 0.4)', color: '#fbbf24', padding: '0.3rem 0.7rem', fontSize: '0.8rem', borderRadius: '4px', cursor: 'pointer' }}>
                      Show Hint
                    </button>
                  ) : (
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', background: 'rgba(245, 158, 11, 0.08)', border: '1px solid rgba(245, 158, 11, 0.25)', padding: '0.55rem 0.75rem', borderRadius: '4px', lineHeight: '1.45' }}>
                      <span style={{ color: '#fbbf24', fontWeight: 600 }}>Hint: </span>
                      {caseStudy.practice[0].hint}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Editor */}
          <div style={{ flex: 1, minHeight: 0 }}>
            <Editor
              height="100%"
              defaultLanguage="python"
              theme="vs-dark"
              value={code}
              onChange={(val) => setCode(val ?? '# Write your Python code here...')}
              options={{
                minimap: { enabled: false },
                fontSize: 15,
                fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                readOnly: false,
                padding: { top: 16 }
              }}
            />
          </div>

          {/* Vertical Resizer */}
          <div 
            onMouseDown={startVerticalResize}
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

          {/* Resizable Output Panel */}
          <div style={{ 
            height: isOutputOpen ? `${outputHeight}px` : '48px',
            background: 'var(--bg-secondary)',
            display: 'flex',
            flexDirection: 'column',
            transition: isOutputOpen ? 'none' : 'height 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
          }}>
            <div 
              onClick={() => setIsOutputOpen(!isOutputOpen)}
              style={{ 
                padding: '0.75rem 1.5rem', 
                display: 'flex', 
                justifyContent: 'space-between',
                alignItems: 'center',
                cursor: 'pointer',
                borderBottom: isOutputOpen ? '1px solid var(--glass-border)' : 'none',
                userSelect: 'none',
                background: 'rgba(255, 255, 255, 0.02)'
              }}
            >
              <span style={{ fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: 600, letterSpacing: '0.5px' }}>Terminal Output</span>
              {isOutputOpen ? <ChevronDown size={18} color="var(--text-secondary)" /> : <ChevronUp size={18} color="var(--text-secondary)" />}
            </div>
            
            {isOutputOpen && (
              <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', background: 'var(--bg-primary)' }}>
                <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.9rem', whiteSpace: 'pre-wrap', color: 'var(--text-primary)' }}>
                  {output || 'Output will appear here...'}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Tutor;
