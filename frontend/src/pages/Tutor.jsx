import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import { Send, Bot, User, Code, Play } from 'lucide-react';
import '../index.css';

const Tutor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  // The engine drives the case study through 8 phases (observation → reflection).
  // We start with no messages; the bootstrap effect below fetches the engine's
  // first observation-phase question so the tutor engages with the actual case
  // study from the very first turn (instead of a generic greeting).
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [status, setStatus] = useState('needs_guidance'); // needs_guidance | insight_reached
  const [code, setCode] = useState('# Write your Python code here...');
  const [caseStudy, setCaseStudy] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [output, setOutput] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);
  // UX-only: whether the learner has chosen to reveal the Practice-phase hint.
  // Hidden by default per requirement (4). Holds no business logic — purely a
  // UI toggle bound to practice[0].hint from seedData.
  const [hintVisible, setHintVisible] = useState(false);
  // Track the tutor's engine phase + question index so subsequent requests
  // continue from where the learner left off (instead of restarting at phase 1).
  const [phase, setPhase] = useState(null);
  const [questionIndex, setQuestionIndex] = useState(0);
  const messagesEndRef = useRef(null);
  // Track whether the current handleSend invocation has already auto-retried
  // a rate-limit response, so we don't recurse forever.
  const retryAttemptedRef = useRef(false);
  // Hold the most recent user submission so a rate-limit retry can resend
  // the same text even though the input box has already been cleared.
  const lastSubmissionRef = useRef('');

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, status]);

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
         // Bootstrap the conversation with the engine's first observation
         // question, grounded in this specific case study.
         bootstrapFirstTurn(data);
      })
      .catch(err => {
         setError(err.message);
         setLoading(false);
      });
  }, [id]);

  // Ask the engine for its opening Socratic question for this case study.
  // The controller treats an empty studentExplanation as "start of phase".
  const bootstrapFirstTurn = async (cs) => {
    try {
      setIsTyping(true);
      const res = await fetch('http://localhost:5000/api/tutor/explanation', {
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
      // Engine unreachable — fall back to a friendly static greeting so the
      // page is still usable.
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
      const res = await fetch('http://localhost:5000/api/tutor/explanation', {
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

      // If the backend hit a Gemini 429, automatically retry once after the
      // indicated back-off (capped at 8s) so the learner doesn't have to do
      // anything. We retry by re-posting the same payload.
      if (data.isRateLimit && !retryAttemptedRef.current) {
        retryAttemptedRef.current = true;
        const waitMs = Math.min(8000, Math.max(1500, (data.retryAfterSeconds || 5) * 1000));
        // Replace the just-shown rate-limit message with a "still trying" note.
        setMessages(prev => {
          const next = [...prev];
          next[next.length - 1] = {
            role: 'assistant',
            content: `${data.message} Retrying automatically...`
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

      // Persist the engine's phase + question index so the next turn continues
      // where this one left off (instead of restarting at observation).
      if (data.phase) setPhase(data.phase);
      if (typeof data.questionIndex === 'number') setQuestionIndex(data.questionIndex);

      if (data.status === 'insight_reached') {
        setStatus('insight_reached');
      }
    } catch (err) {
      console.error(err);
      setIsTyping(false);
      // Fallback for demonstration if backend is down
      setTimeout(() => {
        const lowerInput = userMessage.content.toLowerCase();
        if (lowerInput.includes('multiply') || lowerInput.includes('add') || lowerInput.includes('+') || lowerInput.includes('*')) {
          setMessages(prev => [...prev, { 
            role: 'assistant', 
            content: "Spot on! We need to multiply the quantities by the prices and then add them up. In Python, you can translate this reasoning into math operations using variables. Let's move to the editor to write the code!" 
          }]);
          setStatus('insight_reached');
        } else {
          setMessages(prev => [...prev, { 
            role: 'assistant', 
            content: "I see what you're thinking, but how exactly do we combine the prices and quantities? What mathematical operations should we use?" 
          }]);
        }
      }, 1000);
    }
  };

  const handleRunCode = async () => {
    setIsExecuting(true);
    setOutput('Running code...');
    
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
      console.error(err);
    } finally {
      setIsExecuting(false);
    }
  };

  if (loading) return <div className="loader" style={{margin: '3rem auto'}}>Loading...</div>;
  if (error) return <div className="error-message">Error: {error}</div>;

  return (
    <div className="tutor-layout">
      {/* LEFT SIDE: Chat & Case Study */}
      <div className="tutor-left">
        <div className="case-study-panel glass-panel">
          <h3><Code size={18} /> Case Study: {caseStudy?.title || 'Loading...'}</h3>
          <p>{caseStudy?.description}</p>
        </div>
        
        <div className="chat-container glass-panel">
          <div className="chat-history">
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

          <div className="chat-input-area">
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
            />
            <button 
              className="btn-send" 
              onClick={handleSend} 
              disabled={isTyping || !input.trim() || status === 'insight_reached'}
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE: IDE */}
      <div className={`tutor-right ${status === 'needs_guidance' ? 'ide-disabled' : ''}`}>
        <div className="ide-header">
          <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-primary)' }}>Workspace</h3>
          {status === 'needs_guidance' ? (
             <span className="ide-lock-msg">Complete reasoning to unlock</span>
          ) : (
             <button className="btn-run" onClick={handleRunCode} disabled={isExecuting}>
               <Play size={14} /> {isExecuting ? 'Running...' : 'Run Code'}
             </button>
          )}
        </div>
        {/*
          UX-only: surface the Practice-phase task description and a collapsible
          hint from seedData.practice[0]. The data already exists in seedData.js
          (and is verified by the backend linter) — this just makes it visible
          above the editor so the learner can read what they're supposed to do.
          No backend, content, or Socratic-flow changes here.
        */}
        {caseStudy?.practice?.[0] && (
          <div style={{
            padding: '0.75rem 1rem',
            borderBottom: '1px solid rgba(255,255,255,0.08)',
            background: 'rgba(59, 130, 246, 0.06)'
          }}>
            <div style={{
              fontSize: '0.75rem',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              color: 'var(--accent-secondary)',
              marginBottom: '0.35rem'
            }}>
              Practice Task
            </div>
            <div style={{
              fontSize: '0.95rem',
              color: 'var(--text-primary)',
              lineHeight: '1.45',
              marginBottom: caseStudy.practice[0].hint ? '0.6rem' : 0
            }}>
              {caseStudy.practice[0].task}
            </div>
            {caseStudy.practice[0].hint && (
              <div>
                {!hintVisible ? (
                  <button
                    type="button"
                    onClick={() => setHintVisible(true)}
                    style={{
                      background: 'transparent',
                      border: '1px solid rgba(251, 191, 36, 0.4)',
                      color: '#fbbf24',
                      padding: '0.3rem 0.7rem',
                      fontSize: '0.8rem',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    Show Hint
                  </button>
                ) : (
                  <div style={{
                    fontSize: '0.85rem',
                    color: 'var(--text-secondary)',
                    background: 'rgba(245, 158, 11, 0.08)',
                    border: '1px solid rgba(245, 158, 11, 0.25)',
                    padding: '0.55rem 0.75rem',
                    borderRadius: '4px',
                    lineHeight: '1.45'
                  }}>
                    <span style={{ color: '#fbbf24', fontWeight: 600 }}>Hint: </span>
                    {caseStudy.practice[0].hint}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
        <div className="editor-wrapper">
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
              readOnly: status === 'needs_guidance',
              padding: { top: 16 }
            }}
          />
        </div>
        <div className="output-panel">
          <div className="output-header">Terminal Output</div>
          <div className="output-content">{output || 'Output will appear here...'}</div>
        </div>
      </div>
    </div>
  );
};

export default Tutor;
