import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Volume2, VolumeX, X, Send, Sparkles, Trash2, Bot } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { User } from '../firebase';
import { GoogleGenAI } from "@google/genai";
import ReactMarkdown from 'react-markdown';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "";

interface Message {
  role: 'bot' | 'user';
  text: string;
}

interface AIBotProps {
  user: User | null;
}

// Intelligent fallback — comprehensive coverage so the bot always gives useful answers
const getIntelligentFallback = (query: string): string => {
  const q = query.toLowerCase();

  if (q.includes('trl') || q.includes('technology readiness')) {
    return "**Technology Readiness Level (TRL)** goes from 1–9:\n\n- **TRL 1–3**: Basic research & concept\n- **TRL 4–6**: Development & lab validation\n- **TRL 7–9**: Demonstration & full deployment\n\nEvery technology report on TechIntel shows an estimated TRL score!";
  }
  if (q.includes('hype') || q.includes('gartner') || q.includes('s-curve')) {
    return "The **Gartner Hype Cycle** has 5 phases:\n\n1. **Innovation Trigger** — Early buzz starts\n2. **Peak of Inflated Expectations** — Over-hype peak\n3. **Trough of Disillusionment** — Reality sets in\n4. **Slope of Enlightenment** — Steady maturity\n5. **Plateau of Productivity** — Mainstream adoption\n\nEach TechIntel analysis places your technology on this curve!";
  }
  if (q.includes('search') || q.includes('analy') || q.includes('how to') || q.includes('how do')) {
    return "To analyze a technology:\n\n1. Go to **Dashboard** in the top navigation\n2. Type any tech name (e.g., *Quantum Computing*) in the search bar\n3. Click **Analyze** — TechIntel generates a full AI report\n\nYou'll get TRL, Hype Cycle position, a 5-year growth forecast, plus key insights, risks, and opportunities!";
  }
  if (q.includes('market') || q.includes('trend')) {
    return "The **Market Trends** tab tracks real-time technology movements. Hot sectors right now:\n\n- 🤖 Generative AI & LLMs\n- ⚡ Solid-State Batteries\n- 🔬 Quantum Computing\n- 🧬 Gene Therapy & Biotech\n\nOpen the **Market Trends** tab from the sidebar for live charts and forecasts!";
  }
  if (q.includes('risk')) {
    return "The **Risk Analysis** feature scores technologies across:\n\n- ⚖️ Regulatory hurdles\n- 💰 Implementation costs\n- 👥 Talent availability\n- 📉 Market adoption barriers\n\nFind it in the **Risk Analysis** tab or at the bottom of any technology report in Dashboard.";
  }
  if (q.includes('compare')) {
    return "The **Compare** tab lets you:\n\n- Select 2+ technologies side-by-side\n- Compare TRL, growth forecasts, and hype cycle positions\n- Identify which technology is the stronger investment\n\nNavigate to **Compare** in the sidebar to get started!";
  }
  if (q.includes('history') || q.includes('past') || q.includes('previous')) {
    return "Your **Search History** is automatically saved every time you run an analysis. Access the **History** tab in the sidebar to:\n\n- Revisit past technology reports\n- Track how your research evolves over time\n- Re-launch any previous search with one click";
  }
  if (q.includes('quantum')) {
    return "**Quantum Computing** is currently at approximately **TRL 4–5**, positioned at the *Peak of Inflated Expectations* on the Hype Cycle. Key insights:\n\n- Major investment from IBM, Google, and IonQ\n- Error correction remains the critical challenge\n- Practical commercial applications expected by 2027–2030\n\nSearch *Quantum Computing* in Dashboard for a full AI-generated report!";
  }
  if (q.includes('ai') || q.includes('artificial intelligence') || q.includes('machine learning')) {
    return "**Artificial Intelligence / ML** is currently at **TRL 7–9** for most mainstream applications, positioned at the *Slope of Enlightenment* on the Hype Cycle. Key trends:\n\n- Generative AI is entering enterprise workflows rapidly\n- Focus shifting from model size to efficiency and reasoning\n- Strong regulatory frameworks emerging in EU and US\n\nSearch any AI subcategory in Dashboard for a detailed forecast!";
  }
  if (q.includes('blockchain') || q.includes('crypto') || q.includes('web3')) {
    return "**Blockchain** technology (TRL ~6) is in the *Trough of Disillusionment* phase. Key points:\n\n- Enterprise blockchain (supply chain, finance) is gaining real traction\n- Consumer crypto speculation has cooled significantly\n- DeFi and tokenization of real-world assets remain promising sectors\n\nRun a full analysis in the Dashboard for up-to-date forecasts!";
  }
  if (q.includes('hello') || q.includes('hi ') || q.startsWith('hi') || q.includes('hey') || q.includes('greet')) {
    return `Hello${' '}👋 I'm your **TechIntel Assistant**! I can help you:\n\n- Understand **TRL** and **Hype Cycle** concepts\n- Learn how to **analyze technologies** on this platform\n- Explore **Market Trends**, **Risks**, and **Comparisons**\n\nWhat would you like to explore today?`;
  }
  if (q.includes('feature') || q.includes('platform') || q.includes('what can') || q.includes('capability')) {
    return "**TechIntel AI** gives you:\n\n- 🔍 **Dashboard** — AI-generated technology intelligence reports\n- 📈 **Market Trends** — Real-time trend tracking\n- ⚠️ **Risk Analysis** — Multi-factor risk scoring\n- 🔄 **Compare** — Side-by-side technology comparison\n- 📚 **History** — Your past research archive\n\nStart by searching any technology in the Dashboard!";
  }
  if (q.includes('sign') || q.includes('login') || q.includes('account') || q.includes('register')) {
    return "To access all features, click the **Sign In** button at the top right. You can:\n\n- **Sign up** with your email to create a free account\n- Save your **search history** and analyses\n- Access **Compare**, **Market Trends**, and **Risk Analysis** tabs\n\nGuest users can still run basic technology analyses on the Dashboard!";
  }

  return `Great question! I can help you get the most out of **TechIntel AI**.\n\nTry asking me about:\n- **TRL** or **Hype Cycle** explained\n- How to **search and analyze** a technology\n- What the **Market Trends** or **Risk Analysis** features do\n- Specific technologies like *Quantum Computing* or *AI*\n\nOr just head to the **Dashboard** and search any technology to get started!`;
};

function getWelcomeMessage(user: User | null): Message {
  return {
    role: 'bot',
    text: `Hello${user?.displayName ? ` **${user.displayName}**` : ''}! 👋 I'm your **TechIntel Assistant**.\n\nAsk me about technology trends, platform features, or anything about your research. I'm here to help!`
  };
}

export function AIBot({ user }: AIBotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isMuted, setIsMuted] = useState(false);
  const [isAIMode, setIsAIMode] = useState(true);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const STORAGE_KEY = user ? `techintel_chat_${user.uid}` : 'techintel_chat_guest';

  // Load history
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setMessages(JSON.parse(saved));
      } catch {
        setMessages([getWelcomeMessage(user)]);
      }
    } else {
      setMessages([getWelcomeMessage(user)]);
    }
  }, [user, STORAGE_KEY]);

  // Save history
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    }
  }, [messages, STORAGE_KEY]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        inputRef.current?.focus();
      }, 150);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const clearChat = () => {
    window.speechSynthesis.cancel();
    setMessages([getWelcomeMessage(user)]);
    localStorage.removeItem(STORAGE_KEY);
    setIsAIMode(true);
  };

  const speak = (text: string) => {
    if (isMuted || typeof window === 'undefined') return;
    window.speechSynthesis.cancel();
    const clean = text.replace(/[*#_`[\]()>~|]/g, '').slice(0, 280);
    const utterance = new SpeechSynthesisUtterance(clean);
    utterance.rate = 1.05;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  const handleSendMessage = async (text?: string) => {
    const userMessage = (text || input).trim();
    if (!userMessage || isLoading) return;

    if (!text) setInput('');

    const updatedMessages: Message[] = [...messages, { role: 'user', text: userMessage }];
    setMessages(updatedMessages);
    setIsLoading(true);

    // Cancel any previous in-flight request
    abortControllerRef.current?.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;

    // 12-second hard timeout — avoids waiting 56s on rate-limit retries
    const timeoutId = setTimeout(() => controller.abort(), 12000);

    try {
      if (!GEMINI_API_KEY) throw new Error("No API key configured");

      const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

      // Build conversation context from last 6 messages
      const recentHistory = updatedMessages.slice(-7, -1);
      const historyContext = recentHistory.length
        ? recentHistory.map(m => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.text}`).join('\n') + '\n\n'
        : '';

      const fullPrompt = `You are the TechIntel Assistant for "TechIntel AI" — a technology intelligence platform providing AI-generated forecasts (TRL, Hype Cycle, S-curve) from global patent, research, and news data.

Current user: ${user ? (user.displayName || user.email || 'Authenticated user') : 'Guest'}

${historyContext}Respond concisely (2–4 sentences or a short bullet list). Use markdown formatting. Mention relevant platform features when helpful (Dashboard, Market Trends, Risk Analysis, Compare, History). Never fabricate specific data — direct users to the Dashboard for real analysis.

User: ${userMessage}`;

      const response = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: [{ role: "user", parts: [{ text: fullPrompt }] }],
        config: { temperature: 0.7, topP: 0.9, maxOutputTokens: 350 }
      });

      clearTimeout(timeoutId);
      if (controller.signal.aborted) return;

      const botText = response.text?.trim();
      if (!botText) throw new Error("Empty response");

      setIsAIMode(true);
      setMessages(prev => [...prev, { role: 'bot', text: botText }]);
      speak(botText);

    } catch (err: any) {
      clearTimeout(timeoutId);
      if (controller.signal.aborted && err?.name !== 'AbortError') return;

      const fallback = getIntelligentFallback(userMessage);
      setIsAIMode(false);
      setMessages(prev => [...prev, { role: 'bot', text: fallback }]);
      speak(fallback);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMute = () => {
    if (!isMuted) window.speechSynthesis.cancel();
    setIsMuted(m => !m);
  };

  const suggestions = [
    { label: "What is TRL?",    query: "What is TRL (Technology Readiness Level)?" },
    { label: "Hype Cycle",      query: "Explain the Gartner Hype Cycle phases" },
    { label: "How to analyze?", query: "How do I analyze a technology on this platform?" },
    { label: "Risk Analysis",   query: "How does the Risk Analysis feature work?" },
  ];

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 22, stiffness: 300 }}
            className="absolute bottom-20 right-0 w-[calc(100vw-3rem)] sm:w-80 md:w-96 h-[65vh] max-h-[640px] min-h-[440px] bg-[var(--card-bg)] border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="p-4 bg-gradient-to-r from-blue-700 to-blue-500 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="relative w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-white" />
                  <span
                    className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-blue-600 ${
                      isAIMode ? 'bg-green-400' : 'bg-yellow-400'
                    }`}
                  />
                </div>
                <div>
                  <p className="font-bold text-sm text-white leading-tight">TechIntel Assistant</p>
                  <p className="text-[10px] text-white/60 leading-tight">
                    {isAIMode ? '● Gemini AI Active' : '● Guide Mode'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={clearChat}
                  className="p-1.5 hover:bg-white/15 rounded-lg transition-colors text-white/70 hover:text-white"
                  title="Clear chat"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <button
                  onClick={toggleMute}
                  className="p-1.5 hover:bg-white/15 rounded-lg transition-colors text-white/70 hover:text-white"
                  title={isMuted ? 'Unmute' : 'Mute'}
                >
                  {isMuted
                    ? <VolumeX className="w-4 h-4" />
                    : <Volume2 className={`w-4 h-4 ${isSpeaking ? 'animate-pulse text-white' : ''}`} />
                  }
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 hover:bg-white/15 rounded-lg transition-colors text-white/70 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div
              className="flex-1 overflow-y-auto p-4 space-y-3 bg-[var(--app-bg)]"
              style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.08) transparent' }}
            >
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.role === 'bot' && (
                    <div className="w-7 h-7 rounded-full bg-blue-600/20 border border-blue-500/30 flex items-center justify-center flex-shrink-0 mt-1">
                      <Bot className="w-3.5 h-3.5 text-blue-400" />
                    </div>
                  )}
                  <div
                    className={`max-w-[84%] px-3 py-2.5 rounded-2xl text-sm leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-blue-600 text-white shadow-md rounded-br-sm'
                        : 'bg-white/5 text-white/90 border border-white/8 rounded-bl-sm'
                    }`}
                  >
                    {msg.role === 'bot' ? (
                      <div className="prose prose-invert prose-sm max-w-none
                        [&>*:first-child]:mt-0 [&>*:last-child]:mb-0
                        [&>p]:my-1 [&>ul]:my-1 [&>ol]:my-1
                        [&>ul]:pl-4 [&>ol]:pl-4
                        [&>ul>li]:my-0.5 [&>ol>li]:my-0.5
                        [&>h1]:my-1 [&>h2]:my-1 [&>h3]:my-1
                        [&_strong]:text-blue-300 [&_code]:bg-white/10 [&_code]:px-1 [&_code]:rounded">
                        <ReactMarkdown>{msg.text}</ReactMarkdown>
                      </div>
                    ) : (
                      msg.text
                    )}
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex gap-2 justify-start">
                  <div className="w-7 h-7 rounded-full bg-blue-600/20 border border-blue-500/30 flex items-center justify-center flex-shrink-0">
                    <Bot className="w-3.5 h-3.5 text-blue-400" />
                  </div>
                  <div className="bg-white/5 px-3 py-3 rounded-2xl border border-white/8 rounded-bl-sm flex gap-1 items-center">
                    {[0, 0.2, 0.4].map((delay, i) => (
                      <motion.div
                        key={i}
                        animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.1, 0.8] }}
                        transition={{ repeat: Infinity, duration: 1.2, delay }}
                        className="w-1.5 h-1.5 bg-blue-400 rounded-full"
                      />
                    ))}
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Suggestion chips */}
            <div
              className="px-3 py-2 bg-[var(--card-bg)] border-t border-white/5 flex gap-2 overflow-x-auto flex-shrink-0"
              style={{ scrollbarWidth: 'none' }}
            >
              {suggestions.map((s, i) => (
                <button
                  key={i}
                  onClick={() => handleSendMessage(s.query)}
                  disabled={isLoading}
                  className="whitespace-nowrap px-3 py-1 bg-blue-600/10 hover:bg-blue-600/20 border border-blue-500/20 rounded-full text-[10px] text-white/60 hover:text-white/90 transition-all disabled:opacity-30 flex-shrink-0"
                >
                  {s.label}
                </button>
              ))}
            </div>

            {/* Input */}
            <form
              onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}
              className="p-3 bg-[var(--card-bg)] border-t border-white/5 flex-shrink-0"
            >
              <div className="flex gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask about TechIntel..."
                  disabled={isLoading}
                  autoComplete="off"
                  className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all disabled:opacity-50 placeholder:text-white/30"
                />
                <button
                  type="submit"
                  disabled={isLoading || !input.trim()}
                  className="px-3 py-2.5 bg-blue-600 hover:bg-blue-500 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl transition-all"
                >
                  <Send className="w-4 h-4 text-white" />
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FAB */}
      <motion.button
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(o => !o)}
        className={`w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-colors duration-200 ${
          isOpen
            ? 'bg-white text-slate-900'
            : 'bg-blue-600 text-white shadow-[0_0_24px_rgba(37,99,235,0.55)]'
        }`}
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}>
              <X className="w-6 h-6" />
            </motion.div>
          ) : (
            <motion.div key="open" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}>
              <MessageSquare className="w-6 h-6" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  );
}
