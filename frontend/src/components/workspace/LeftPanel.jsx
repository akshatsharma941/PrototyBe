import React, { useState, useRef, useEffect } from 'react';
import { Send, Book, ChevronDown, ChevronUp, CheckCircle, Bot } from 'lucide-react';
import MessageSpeaker from './MessageSpeaker';

const LeftPanel = ({ mission, pycratesStatus, setPycratesStatus, currentStage, setCurrentStage }) => {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: "Hello! I'm Pycrates. Let's tackle this mission together. How would you approach tracking the coffee cups sold in plain English?" }
  ]);
  const [input, setInput] = useState('');
  const [isRefOpen, setIsRefOpen] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    const newMsgs = [...messages, { role: 'user', content: input }];
    setMessages(newMsgs);
    setInput('');
    
    // Mock Pycrates reasoning flow with Concept Reveal
    setTimeout(() => {
      if (pycratesStatus === 'Guiding Reasoning') {
        setMessages(m => [...m, { role: 'assistant', content: 'That makes sense! We need a place to store that number. What happens when a new coffee is sold?' }]);
        setPycratesStatus('Insight Reached');
        setCurrentStage('Reasoning Phase');
      } else if (pycratesStatus === 'Insight Reached') {
        setMessages(m => [...m, 
          { role: 'assistant', content: 'Exactly! We update the count.' },
          { 
            type: 'discovery', 
            concept: 'Variables', 
            description: 'You discovered a way to store information for later use.' 
          },
          { role: 'assistant', content: 'In Python, we use these to store and update values. Let me show you the syntax in the Python Reference below.' }
        ]);
        setPycratesStatus('Teaching Python');
        setCurrentStage('Python Translation');
        setIsRefOpen(true);
      } else {
        setMessages(m => [...m, { role: 'assistant', content: 'You are ready! You can now write the code in the IDE.' }]);
        setPycratesStatus('Ready for Coding');
        setCurrentStage('Coding Phase');
      }
    }, 1000);
  };

  const getStatusColor = () => {
    switch(pycratesStatus) {
      case 'Guiding Reasoning': return 'var(--accent-secondary)';
      case 'Insight Reached': return 'var(--accent-primary)';
      case 'Teaching Python': return '#f59e0b';
      case 'Ready for Coding': return 'var(--success)';
      default: return 'var(--text-secondary)';
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--bg-primary)' }}>
      {/* Mission Context */}
      <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--glass-border)', flexShrink: 0 }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>{mission?.title || 'Mission Title'}</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.5, marginBottom: '1rem' }}>
          {mission?.story || 'Mission description goes here.'}
        </p>
        <div style={{ background: 'rgba(59, 130, 246, 0.1)', padding: '0.75rem', borderRadius: '6px', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
          <span style={{ color: 'var(--accent-secondary)', fontWeight: 600, fontSize: '0.85rem' }}>Objective:</span>
          <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginLeft: '0.5rem' }}>Understand basic assignment and updating values.</span>
        </div>
      </div>

      {/* Chat Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
        <div style={{ 
          padding: '0.75rem 1.5rem', 
          borderBottom: '1px solid var(--glass-border)', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          background: 'var(--bg-secondary)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Bot size={18} color="var(--accent-primary)" />
            <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>Pycrates</span>
          </div>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.4rem', 
            background: 'var(--bg-primary)', 
            padding: '0.25rem 0.75rem', 
            borderRadius: '99px',
            border: `1px solid ${getStatusColor()}`
          }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: getStatusColor() }} />
            <span style={{ fontSize: '0.75rem', color: getStatusColor(), fontWeight: 600 }}>{pycratesStatus}</span>
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {messages.map((msg, idx) => {
            if (msg.type === 'discovery') {
              return (
                <div key={idx} style={{ 
                  margin: '0.5rem 0',
                  padding: '1.5rem', 
                  background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(16, 185, 129, 0.02))', 
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  borderRadius: '12px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem',
                  alignItems: 'center',
                  textAlign: 'center'
                }}>
                  <div style={{ color: 'var(--success)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 700 }}>
                    Discovery Unlocked
                  </div>
                  <h3 style={{ color: 'var(--text-primary)', fontSize: '1.4rem', margin: '0', letterSpacing: '0.5px' }}>{msg.concept}</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', fontStyle: 'italic', margin: '0' }}>
                    "{msg.description}"
                  </p>
                </div>
              );
            }

            if (msg.role === 'assistant') {
              return (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0.4rem',
                    alignSelf: 'flex-start',
                    maxWidth: '85%'
                  }}
                >
                  <div style={{
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--glass-border)',
                    padding: '1rem',
                    borderRadius: '12px',
                    borderTopLeftRadius: '2px',
                    fontSize: '0.95rem',
                    lineHeight: 1.5,
                    flex: 1,
                    minWidth: 0
                  }}>
                    {msg.content}
                  </div>
                  <MessageSpeaker id={`chat-msg-${idx}`} text={msg.content} />
                </div>
              );
            }

            return (
              <div key={idx} style={{ 
                alignSelf: 'flex-end',
                background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(59, 130, 246, 0.2))',
                border: '1px solid rgba(139, 92, 246, 0.3)',
                padding: '1rem',
                borderRadius: '12px',
                borderTopRightRadius: '2px',
                maxWidth: '85%',
                fontSize: '0.95rem',
                lineHeight: 1.5
              }}>
                {msg.content}
              </div>
            );
          })}
          <div ref={chatEndRef} />
        </div>

        <div style={{ padding: '1rem', borderTop: '1px solid var(--glass-border)', background: 'var(--bg-secondary)' }}>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Type your reasoning..."
              style={{
                flex: 1,
                background: 'var(--bg-primary)',
                border: '1px solid var(--glass-border)',
                borderRadius: '8px',
                padding: '0.75rem 1rem',
                color: 'var(--text-primary)',
                outline: 'none',
                fontFamily: 'inherit'
              }}
            />
            <button 
              onClick={handleSend}
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

      {/* Python Reference - Only visible after concept reveal */}
      {(pycratesStatus === 'Teaching Python' || pycratesStatus === 'Ready for Coding') && (
        <div style={{ borderTop: '1px solid var(--glass-border)', background: 'var(--bg-secondary)', flexShrink: 0 }}>
          <div 
            onClick={() => setIsRefOpen(!isRefOpen)}
            style={{ 
              padding: '1rem 1.5rem', 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              cursor: 'pointer',
              userSelect: 'none'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Book size={18} color="var(--accent-secondary)" />
              <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>Python Reference: Variables</span>
            </div>
            {isRefOpen ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
          </div>
          
          {isRefOpen && (
            <div style={{ padding: '0 1.5rem 1.5rem', maxHeight: '200px', overflowY: 'auto' }}>
              <div style={{ background: '#1e1e1e', padding: '1rem', borderRadius: '6px', fontFamily: 'JetBrains Mono, monospace', fontSize: '0.85rem' }}>
                <span style={{ color: '#569cd6' }}># Creating a variable</span><br/>
                <span style={{ color: '#9cdcfe' }}>cups_sold</span> = <span style={{ color: '#b5cea8' }}>0</span><br/><br/>
                <span style={{ color: '#569cd6' }}># Updating it</span><br/>
                <span style={{ color: '#9cdcfe' }}>cups_sold</span> = <span style={{ color: '#9cdcfe' }}>cups_sold</span> + <span style={{ color: '#b5cea8' }}>1</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default LeftPanel;
