import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { Send, Bot, User, Sparkles, X, ChevronRight } from 'lucide-react';

const AICopilot = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [chatHistory, setChatHistory] = useState([
    {
      sender: 'bot',
      text: "Hello! I am your AI Risk Intelligence Copilot. Ask me about system metrics, explain specific alerts (e.g., 'Explain transaction TXN-200001'), find risky customer details, or analyze merchants. How can I help you today?"
    }
  ]);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  const suggestionChips = [
    "Why was transaction TXN-200000 flagged?",
    "Which customer is most risky?",
    "Which merchant generated most fraud?",
    "How much money was saved?",
    "What is our false positive rate?"
  ];

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatHistory, loading]);

  const handleSend = async (textToSend) => {
    const text = textToSend || query;
    if (!text.trim()) return;

    setChatHistory(prev => [...prev, { sender: 'user', text }]);
    if (!textToSend) setQuery('');
    setLoading(true);

    try {
      const res = await axios.post('/api/copilot/query', { query: text });
      if (res.data.success) {
        setChatHistory(prev => [...prev, { sender: 'bot', text: res.data.reply }]);
      }
    } catch (err) {
      setChatHistory(prev => [...prev, { 
        sender: 'bot', 
        text: "Error connecting to AI backend. Ensure server is online and GEMINI_API_KEY is configured if calling external networks." 
      }]);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[450px] glass border-l border-white/10 shadow-2xl flex flex-col h-full animate-slide-in">
      {/* Header */}
      <div className="p-4 border-b border-white/5 flex justify-between items-center bg-slate-950/40">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
            <Sparkles className="h-4.5 w-4.5 animate-pulse" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-100 uppercase tracking-wider">Risk Copilot</h3>
            <p className="text-[10px] text-slate-400">AI-Powered Investigative Analytics</p>
          </div>
        </div>
        <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white transition-colors">
          <X className="h-4.5 w-4.5" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {chatHistory.map((chat, idx) => (
          <div key={idx} className={`flex gap-3 ${chat.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            {chat.sender === 'bot' && (
              <div className="h-7 w-7 rounded-lg bg-indigo-600/20 text-indigo-400 border border-indigo-500/20 flex justify-center items-center shrink-0">
                <Bot className="h-4 w-4" />
              </div>
            )}
            <div
              className={`p-3 rounded-2xl max-w-[85%] text-xs leading-relaxed ${
                chat.sender === 'user'
                  ? 'bg-indigo-600 text-white rounded-tr-none'
                  : 'bg-slate-900 border border-white/5 text-slate-200 rounded-tl-none whitespace-pre-line'
              }`}
            >
              {chat.text}
            </div>
            {chat.sender === 'user' && (
              <div className="h-7 w-7 rounded-lg bg-slate-800 border border-white/5 flex justify-center items-center text-[10px] font-bold text-slate-300 shrink-0">
                AN
              </div>
            )}
          </div>
        ))}
        {loading && (
          <div className="flex gap-3 justify-start">
            <div className="h-7 w-7 rounded-lg bg-indigo-600/20 text-indigo-400 border border-indigo-500/20 flex justify-center items-center shrink-0">
              <Bot className="h-4 w-4" />
            </div>
            <div className="p-3 rounded-2xl bg-slate-900 border border-white/5 flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '0ms' }}></span>
              <span className="h-1.5 w-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '150ms' }}></span>
              <span className="h-1.5 w-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '300ms' }}></span>
            </div>
          </div>
        )}
        <div ref={scrollRef}></div>
      </div>

      {/* Suggestion Chips */}
      <div className="p-3 border-t border-white/5 bg-slate-950/20">
        <p className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 mb-2">Suggested Queries</p>
        <div className="flex flex-wrap gap-1.5 max-h-[85px] overflow-y-auto pr-1">
          {suggestionChips.map((chip, i) => (
            <button
              key={i}
              onClick={() => handleSend(chip)}
              className="px-2.5 py-1 text-[10px] text-slate-300 bg-slate-900 hover:bg-indigo-650/10 hover:text-indigo-400 border border-white/5 rounded-full transition-all flex items-center gap-1"
            >
              {chip}
              <ChevronRight className="h-2.5 w-2.5" />
            </button>
          ))}
        </div>
      </div>

      {/* Input */}
      <div className="p-4 border-t border-white/5 bg-slate-950/40">
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask AI Copilot..."
            className="w-full pl-3 pr-10 py-2.5 text-xs rounded-xl glass-input placeholder-slate-500 focus:outline-none"
          />
          <button
            onClick={() => handleSend()}
            disabled={!query.trim() || loading}
            className="absolute right-1.5 top-1.5 p-1.5 rounded-lg bg-indigo-600 text-white disabled:opacity-50 disabled:bg-slate-800 transition-colors"
          >
            <Send className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AICopilot;
