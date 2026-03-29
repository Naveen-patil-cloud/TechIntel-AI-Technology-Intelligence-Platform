import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Volume2, VolumeX, X, Send, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { User } from '../firebase';
import { GoogleGenAI, Modality } from "@google/genai";
import { toast } from 'sonner';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

interface AIBotProps {
  user: User | null;
}

export function AIBot({ user }: AIBotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<{ role: 'bot' | 'user'; text: string }[]>([]);
  const [input, setInput] = useState('');
  const [isMuted, setIsMuted] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  const STORAGE_KEY = user ? `techintel_chat_${user.uid}` : 'techintel_chat_guest';

  // Load history
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      setMessages(JSON.parse(saved));
    } else {
      setMessages([
        { role: 'bot', text: "Hello! I'm your TechIntel Assistant. I can help you understand technology trends, market data, or how to use this platform. What's on your mind?" }
      ]);
    }
  }, [user, STORAGE_KEY]);

  // Save history
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    }
  }, [messages, STORAGE_KEY]);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const clearChat = () => {
    const initialMessage = { role: 'bot' as const, text: "Chat cleared. How else can I help you?" };
    setMessages([initialMessage]);
    localStorage.removeItem(STORAGE_KEY);
  };

  const speak = async (text: string) => {
    if (isMuted) return;
    
    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text: text.slice(0, 300) }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: 'Kore' },
            },
          },
        },
      });

      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (base64Audio) {
        try {
          const binary = atob(base64Audio);
          const bytes = new Uint8Array(binary.length);
          for (let i = 0; i < binary.length; i++) {
            bytes[i] = binary.charCodeAt(i);
          }
          
          if (!audioContextRef.current) {
            audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
          }
          
          const audioContext = audioContextRef.current;
          
          if (audioContext.state === 'suspended') {
            await audioContext.resume();
          }

          const audioBuffer = audioContext.createBuffer(1, bytes.length / 2, 24000);
          const nowBuffering = audioBuffer.getChannelData(0);
          const dataView = new DataView(bytes.buffer);
          
          for (let i = 0; i < bytes.length / 2; i++) {
            nowBuffering[i] = dataView.getInt16(i * 2, true) / 32768;
          }
          
          const source = audioContext.createBufferSource();
          source.buffer = audioBuffer;
          source.connect(audioContext.destination);
          source.onended = () => setIsSpeaking(false);
          source.start();
          setIsSpeaking(true);
        } catch (audioError) {
          console.error("Audio Processing Error:", audioError);
          toast.error("Audio playback is currently unavailable in your browser.");
          setIsSpeaking(false);
        }
      }
    } catch (error) {
      console.error("TTS Generation Error:", error);
    }
  };

  const handleSendMessage = async (text?: string) => {
    const userMessage = text || input.trim();
    if (!userMessage || isLoading) return;

    if (!text) setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setIsLoading(true);

    try {
      if (!process.env.GEMINI_API_KEY) {
        throw new Error("Missing Gemini API Key");
      }

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [
          {
            role: "user",
            parts: [{ text: `You are the TechIntel Assistant for the "TechIntel AI" platform. 
            TechIntel AI aggregates global technology data (patents, research, news) to analyze trends and generate forecasts (TRL, S-curve, hype cycle).
            Current User: ${user ? user.displayName : 'Guest'}
            User Query: ${userMessage}
            
            Provide a very short, brief, and professional response (max 2-3 sentences). 
            Avoid long lists or detailed explanations unless explicitly asked. 
            If the user is a guest, briefly remind them they can sign in for full features.` }]
          }
        ],
        config: {
          temperature: 0.7,
          topP: 0.95,
          topK: 40,
        }
      });

      const botResponse = response.text || "I'm sorry, I couldn't process that request.";
      setMessages(prev => [...prev, { role: 'bot', text: botResponse }]);
      if (!isMuted) speak(botResponse);
    } catch (error) {
      console.warn("Chat Error (Demo Mode):", error);
      const mockResponses: Record<string, string> = {
        "What is TRL?": "TRL (Technology Readiness Level) is a measurement system used to assess the maturity level of a particular technology. It ranges from 1 (basic principles observed) to 9 (actual system proven through successful mission operations).",
        "Market Trends": "Currently, Generative AI, Quantum Computing, and Solid-State Batteries are among the top trending technologies. You can see more details in the Live Market Trends section of your dashboard.",
        "How to search?": "Simply type any technology name into the search bar at the top of your dashboard and click 'Analyze'. I'll generate a full intelligence report for you!",
        "Risk Analysis": "Our platform analyzes risks by evaluating regulatory hurdles, implementation costs, and talent shortages. You can find the Risk Analysis card at the bottom of any technology report."
      };

      const defaultResponse = "In demo mode, I can provide basic information about the platform. For full AI capabilities, a Gemini API key is required. How else can I help you today?";
      const botResponse = mockResponses[userMessage] || defaultResponse;

      setMessages(prev => [...prev, { role: 'bot', text: botResponse }]);
      if (!isMuted) {
        // Simple browser TTS for demo if Gemini TTS fails
        const utterance = new SpeechSynthesisUtterance(botResponse);
        window.speechSynthesis.speak(utterance);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const suggestions = [
    { label: "What is TRL?", query: "Can you explain what TRL (Technology Readiness Level) means?" },
    { label: "Market Trends", query: "What are the top 3 technology trends right now?" },
    { label: "How to search?", query: "How do I use the search bar to analyze a technology?" },
    { label: "Risk Analysis", query: "How does the platform analyze technology risks?" }
  ];

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="absolute bottom-20 right-0 w-80 md:w-96 h-[500px] bg-[#0a0a0a] border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="p-4 bg-blue-600 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-white" />
                <span className="font-bold text-sm">TechIntel Assistant</span>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={clearChat}
                  className="p-1.5 hover:bg-white/10 rounded-lg transition-colors text-white/80 hover:text-white"
                  title="Clear Chat"
                >
                  <X className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => setIsMuted(!isMuted)}
                  className="p-1.5 hover:bg-white/10 rounded-lg transition-colors text-white"
                  title={isMuted ? "Unmute" : "Mute"}
                >
                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className={`w-4 h-4 ${isSpeaking ? 'animate-pulse' : ''}`} />}
                </button>
                <button onClick={() => setIsOpen(false)} className="text-white/80 hover:text-white p-1.5 hover:bg-white/10 rounded-lg transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#050505] overscroll-contain custom-scrollbar">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] p-3 rounded-2xl text-sm leading-relaxed ${msg.role === 'user' ? 'bg-blue-600 text-white shadow-lg' : 'bg-white/5 text-white/90 border border-white/5'}`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white/5 p-3 rounded-2xl flex gap-1">
                    <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1 }} className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                    <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                    <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Suggestions */}
            <div className="px-4 py-2 bg-[#0a0a0a] border-t border-white/5 overflow-x-auto flex gap-2 no-scrollbar">
              {suggestions.map((s, i) => (
                <button
                  key={i}
                  onClick={() => handleSendMessage(s.query)}
                  className="whitespace-nowrap px-3 py-1 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-[10px] text-white/60 hover:text-white transition-all"
                >
                  {s.label}
                </button>
              ))}
            </div>

            {/* Input Area */}
            <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} className="p-4 bg-[#0a0a0a]">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask about TechIntel..."
                  className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-blue-500/50 transition-all"
                />
                <button 
                  type="submit"
                  disabled={isLoading || !input.trim()}
                  className="p-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:hover:bg-blue-600 rounded-xl transition-all"
                >
                  <Send className="w-4 h-4 text-white" />
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all active:scale-90 ${isOpen ? 'bg-white text-black' : 'bg-blue-600 text-white shadow-[0_0_20px_rgba(37,99,235,0.5)]'}`}
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
      </button>
    </div>
  );
}
