import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import { Send, Bot, User, Code, Play } from 'lucide-react';
import '../index.css';

const Tutor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hello! I'm your PyBe Tutor. Let's work through the Case Study together. Explain to me how you think we should solve this problem?"
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [status, setStatus] = useState('needs_guidance'); // needs_guidance | insight_reached
  const [code, setCode] = useState('# Write your Python code here...');
  const [caseStudy, setCaseStudy] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [output, setOutput] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);
  const messagesEndRef = useRef(null);

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
      })
      .catch(err => {
         setError(err.message);
         setLoading(false);
      });
  }, [id]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    try {
      const res = await fetch('http://localhost:5000/api/tutor/explanation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          caseStudyId: caseStudy._id,
          studentExplanation: input
        })
      });

      if (!res.ok) throw new Error("API failed");

      const data = await res.json();
      setIsTyping(false);
      
      setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: data.message 
      }]);
      
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
        <div className="editor-wrapper">
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
