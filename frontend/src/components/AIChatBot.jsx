import { useState, useRef, useEffect } from 'react';
import { Bot, X, Send, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { streamAiChat } from '../api/ai';
import useAuthStore from '../store/authStore';

const QUICK_PROMPTS = [
  "What's my workout today?",
  "What are my top PRs?",
  "How many days did I train this week?",
  "What muscles am I neglecting?",
  "Suggest a deload week",
];

const WELCOME_MSG = { role: 'ai', content: "Hey! 💪 I'm your AI Coach. Ask me anything about your workouts, PRs, splits, or training progress." };

export default function AIChatBot() {
  const [open, setOpen]           = useState(false);
  const [messages, setMessages]   = useState([WELCOME_MSG]);
  const [input, setInput]         = useState('');
  const [streaming, setStreaming] = useState(false);
  const stopRef   = useRef(null);
  const bottomRef = useRef(null);

  const { user } = useAuthStore();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = (text) => {
    const msg = (text ?? input).trim();
    if (!msg || streaming) return;
    setInput('');

    const userMsg = { role: 'user', content: msg };
    const aiMsg   = { role: 'ai',   content: '' };
    setMessages(prev => [...prev, userMsg, aiMsg]);
    setStreaming(true);

    stopRef.current = streamAiChat(
      msg,
      (token) => {
        setMessages(prev => {
          const next = [...prev];
          next[next.length - 1] = { role: 'ai', content: next[next.length - 1].content + token };
          return next;
        });
      },
      () => setStreaming(false),
      () => {
        setStreaming(false);
        setMessages(prev => {
          const next = [...prev];
          next[next.length - 1] = { role: 'ai', content: '⚠️ Something went wrong. Please try again.' };
          return next;
        });
      }
    );
  };

  return (
    <>
      {/* Floating Bubble Button */}
      <button
        onClick={() => setOpen(o => !o)}
        className="fixed bottom-24 right-4 z-50 w-14 h-14 rounded-full bg-gym-blue flex items-center justify-center text-white shadow-[0_0_24px_rgba(0,122,255,0.5)] hover:scale-110 active:scale-95 transition-transform"
        title="AI Coach"
      >
        {open ? <ChevronDown size={22} /> : <Bot size={22} />}
      </button>

      {/* Chat Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0,  scale: 1    }}
            exit={{    opacity: 0, y: 16, scale: 0.96 }}
            transition={{ duration: 0.18 }}
            className="fixed bottom-20 sm:bottom-40 right-4 z-50 w-[calc(100vw-32px)] sm:w-[380px] h-[60vh] sm:h-[500px] flex flex-col rounded-2xl overflow-hidden shadow-2xl border border-white/10 bg-[#0e0e0e]/95 backdrop-blur-xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-[#080808]/80 flex-shrink-0">
              <div className="flex items-center gap-2">
                <Bot size={17} className="text-gym-blue" />
                <span className="text-white font-bold text-sm tracking-wide">AI Coach</span>
                <span className="text-[11px] text-gray-500 font-mono">· {user?.fullName || user?.username}</span>
              </div>
              <button onClick={() => setOpen(false)} className="text-gray-500 hover:text-white transition-colors p-1">
                <X size={15} />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2 scrollbar-hide">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] px-3 py-2 rounded-2xl text-sm leading-relaxed break-words ${
                    m.role === 'user'
                      ? 'bg-gym-blue/20 text-white rounded-br-sm'
                      : 'bg-white/6 text-gray-200 rounded-bl-sm border border-white/5'
                  }`}>
                    {m.role === 'user' ? (
                      <div className="whitespace-pre-wrap">{m.content}</div>
                    ) : (
                      <ReactMarkdown 
                        remarkPlugins={[remarkGfm]}
                        components={{
                          p: ({node, ...props}) => <p className="mb-2 last:mb-0" {...props} />,
                          ul: ({node, ...props}) => <ul className="list-disc pl-4 mb-2" {...props} />,
                          ol: ({node, ...props}) => <ol className="list-decimal pl-4 mb-2" {...props} />,
                          li: ({node, ...props}) => <li className="mb-1" {...props} />,
                          strong: ({node, ...props}) => <strong className="font-bold text-white" {...props} />,
                          h1: ({node, ...props}) => <h1 className="text-lg font-bold mb-2 text-white" {...props} />,
                          h2: ({node, ...props}) => <h2 className="text-md font-bold mb-2 text-white" {...props} />,
                          h3: ({node, ...props}) => <h3 className="text-base font-bold mb-2 text-white" {...props} />
                        }}
                      >
                        {m.content}
                      </ReactMarkdown>
                    )}
                    {m.role === 'ai' && streaming && i === messages.length - 1 && m.content === '' && (
                      <span className="inline-flex gap-1 items-center h-4">
                        {[0, 1, 2].map(d => (
                          <span key={d} className="w-1.5 h-1.5 bg-gym-blue rounded-full animate-bounce" style={{ animationDelay: `${d * 0.12}s` }} />
                        ))}
                      </span>
                    )}
                  </div>
                </div>
              ))}
              <div ref={bottomRef} />
            </div>

            {/* Quick Prompts — only on first open */}
            {messages.length === 1 && (
              <div className="px-3 pb-2 flex gap-2 overflow-x-auto scrollbar-hide flex-shrink-0">
                {QUICK_PROMPTS.map(p => (
                  <button
                    key={p}
                    onClick={() => send(p)}
                    className="flex-shrink-0 text-xs px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:border-gym-blue/40 transition-all whitespace-nowrap"
                  >
                    {p}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <div className="flex gap-2 px-3 py-3 border-t border-white/10 flex-shrink-0">
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), send())}
                placeholder="Ask about your training…"
                disabled={streaming}
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-gym-blue/50 transition-colors disabled:opacity-50"
              />
              <button
                onClick={() => send()}
                disabled={streaming || !input.trim()}
                className="p-2.5 rounded-xl bg-gym-blue/15 text-gym-blue hover:bg-gym-blue/25 disabled:opacity-30 transition-all flex-shrink-0"
              >
                <Send size={15} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
