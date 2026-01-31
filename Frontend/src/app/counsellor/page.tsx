"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Send, 
  Mic, 
  ChevronDown, 
  Plus, 
  MapPin, 
  DollarSign, 
  GraduationCap, 
  Brain,
  History,
  Activity,
  ArrowUpRight,
  User,
  Search,
  Zap,
  CheckCircle2,
  Lock,
  Flag
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

// --- Types ---

type MessageType = "user" | "ai";

interface UniversityArtifact {
  name: string;
  country: string;
  flag: string;
  type: "Target" | "Reach";
  cost: string;
  acceptance: string;
}

interface Message {
  id: string;
  type: MessageType;
  content: string;
  reasoning?: string;
  artifact?: UniversityArtifact;
}

// --- Components ---

const GeometricOrb = ({ isThinking }: { isThinking: boolean }) => (
  <motion.div
    animate={isThinking ? { scale: [1, 1.1, 1], rotate: 360 } : { rotate: 360 }}
    transition={isThinking ? 
      { scale: { duration: 1, repeat: Infinity, ease: "easeInOut" }, rotate: { duration: 20, repeat: Infinity, ease: "linear" } } : 
      { rotate: { duration: 60, repeat: Infinity, ease: "linear" } }
    }
    className="relative w-10 h-10 flex items-center justify-center"
  >
    <div className="absolute inset-0 bg-violet-500/20 blur-lg rounded-full" />
    <svg viewBox="0 0 100 100" className="w-full h-full text-violet-400">
      <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="10 5" />
      <circle cx="50" cy="50" r="30" fill="none" stroke="currentColor" strokeWidth="0.5" />
      <path d="M50 5 L50 95 M5 50 L95 50" stroke="currentColor" strokeWidth="0.5" opacity="0.5" />
      <motion.circle 
        cx="50" cy="50" r="15" 
        fill="currentColor" 
        animate={{ opacity: [0.3, 0.7, 0.3] }}
        transition={{ duration: 2, repeat: Infinity }}
      />
    </svg>
  </motion.div>
);

const Typewriter = ({ text }: { text: string }) => {
  const [displayedText, setDisplayedText] = useState("");
  
  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      setDisplayedText(text.slice(0, i));
      i++;
      if (i > text.length) clearInterval(interval);
    }, 20);
    return () => clearInterval(interval);
  }, [text]);

  return <span>{displayedText}</span>;
};

const ReasoningTrace = ({ reasoning }: { reasoning: string }) => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="border-l-2 border-violet-500/30 pl-4 py-2 my-4 group">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 text-[10px] font-mono text-violet-400/60 uppercase tracking-widest mb-2 hover:text-violet-400 transition-colors"
      >
        <Brain className="w-3 h-3" />
        Neural Process
        <ChevronDown className={`w-3 h-3 transition-transform ${isOpen ? "" : "-rotate-90"}`} />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden font-mono text-[11px] text-violet-400/80 leading-relaxed"
          >
            <Typewriter text={reasoning} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const UniversityCard = ({ artifact }: { artifact: UniversityArtifact }) => (
  <motion.div
    initial={{ scale: 0.95, opacity: 0 }}
    animate={{ scale: 1, opacity: 1 }}
    className="relative mt-4 bg-white/[0.03] border border-white/[0.08] backdrop-blur-xl rounded-2xl p-5 overflow-hidden group"
  >
    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-3xl -z-10 group-hover:bg-emerald-500/10 transition-colors" />
    
    <div className="flex justify-between items-start mb-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10">
          <GraduationCap className="w-5 h-5 text-emerald-400" />
        </div>
        <div>
          <h4 className="text-white font-medium flex items-center gap-2">
            {artifact.name}
            <span className="text-lg" title={artifact.country}>{artifact.flag}</span>
          </h4>
          <Badge variant="outline" className={`mt-1 text-[10px] uppercase tracking-wider ${
            artifact.type === "Target" ? "border-emerald-500/30 text-emerald-400 bg-emerald-500/5" : "border-orange-500/30 text-orange-400 bg-orange-500/5"
          }`}>
            {artifact.type}
          </Badge>
        </div>
      </div>
      <Button size="icon" variant="ghost" className="rounded-full hover:bg-white/5 group/btn">
        <Plus className="w-4 h-4 text-white/40 group-hover/btn:text-white transition-colors" />
      </Button>
    </div>

    <div className="grid grid-cols-2 gap-4">
      <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl">
        <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">Tuition/Year</p>
        <p className="text-sm font-semibold text-white">{artifact.cost}</p>
      </div>
      <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl">
        <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">Acceptance Rate</p>
        <p className="text-sm font-semibold text-white">{artifact.acceptance}</p>
      </div>
    </div>

    <button className="w-full mt-4 py-2.5 rounded-xl bg-white text-black text-xs font-bold hover:scale-[1.02] transition-all flex items-center justify-center gap-2">
      Add to Shortlist
      <ArrowUpRight className="w-3 h-3" />
    </button>
  </motion.div>
);

const SidebarHUD = () => (
  <div className="h-full bg-[#030712] border-l border-white/[0.08] p-6 hidden lg:block">
    <div className="space-y-8">
      <div>
        <h3 className="text-[10px] font-mono text-slate-500 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
          <Activity className="w-3 h-3" />
          Active Parameters
        </h3>
        <div className="space-y-4">
          <div className="p-4 bg-white/[0.03] border border-white/[0.08] rounded-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-16 h-16 bg-indigo-500/5 blur-2xl" />
            <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">Academic Status</p>
            <p className="text-white font-medium">GPA 3.8 / 4.0</p>
            <p className="text-[10px] text-indigo-400 mt-1">High Competitive Tier</p>
          </div>
          <div className="p-4 bg-white/[0.03] border border-white/[0.08] rounded-2xl">
            <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">Budget Boundary</p>
            <p className="text-white font-medium">$45,000 USD/yr</p>
          </div>
          <div className="p-4 bg-white/[0.03] border border-white/[0.08] rounded-2xl">
            <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">Preferred Locale</p>
            <p className="text-white font-medium">USA & Canada</p>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-[10px] font-mono text-slate-500 uppercase tracking-[0.2em] mb-4">
          Session History
        </h3>
        <div className="space-y-3">
          {[
            { label: "NYU Analysis", date: "2m ago", status: "complete" },
            { label: "Visa Simulation", date: "1h ago", status: "saved" },
          ].map((item, i) => (
            <div key={i} className="flex items-center justify-between group cursor-pointer">
              <span className="text-xs text-slate-400 group-hover:text-white transition-colors">{item.label}</span>
              <span className="text-[10px] text-slate-600">{item.date}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="pt-8">
        <div className="p-4 bg-indigo-600/10 border border-indigo-500/20 rounded-2xl flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center">
            <Lock className="w-4 h-4 text-indigo-400" />
          </div>
          <div>
            <p className="text-[10px] text-indigo-300 font-bold uppercase tracking-wider">Plan: ELITE</p>
            <p className="text-[9px] text-indigo-300/60">AI Core Access: Unrestricted</p>
          </div>
        </div>
      </div>
    </div>
  </div>
);

// --- Main Page ---

export default function CounsellorPage() {
  const [input, setInput] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      type: "ai",
      content: "Welcome back, Strategist. I have processed your profile updates. Based on your recent GRE mock scores, I have recalculated your risk for Ivy League admissions. How shall we proceed?",
      reasoning: "System initialized... > Loading user profile ID: 8829... > Cross-referencing 2024 university admission data... > Profile integrity: 98%... > Calculating competitive percentile..."
    }
  ]);

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Parse [RENDER_CARD: UniName] tags from AI response
  const parseRenderCard = (content: string): { cleanContent: string; artifact?: UniversityArtifact } => {
    const renderCardRegex = /\[RENDER_CARD:\s*([^\]]+)\]/gi;
    const match = renderCardRegex.exec(content);
    
    const uniData: Record<string, Partial<UniversityArtifact>> = {
      'Stanford University': { country: 'United States', flag: '🇺🇸', cost: '$56,169', acceptance: '4%' },
      'MIT': { country: 'United States', flag: '🇺🇸', cost: '$55,878', acceptance: '4%' },
      'New York University': { country: 'United States', flag: '🇺🇸', cost: '$58,000', acceptance: '12%' },
      'UC Berkeley': { country: 'United States', flag: '🇺🇸', cost: '$44,007', acceptance: '11%' },
    };
    
    if (match) {
      const uniName = match[1].trim();
      const data = uniData[uniName];
      
      if (data) {
        return {
          cleanContent: content.replace(renderCardRegex, '').trim(),
          artifact: {
            name: uniName,
            country: data.country || 'Unknown',
            flag: data.flag || '🌍',
            type: 'Target',
            cost: data.cost || 'N/A',
            acceptance: data.acceptance || 'N/A',
          }
        };
      }
    }
    
    return { cleanContent: content };
  };

  const handleSend = async () => {
    if (!input.trim() || isThinking) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: input
    };

    setMessages(prev => [...prev, userMessage]);
    const userInput = input;
    setInput("");
    setIsThinking(true);

    try {
      // Import API dynamically to avoid SSR issues
      const { API } = await import('@/lib/api');
      
      // Convert messages to API format
      const history = messages.map(msg => ({
        role: msg.type === 'user' ? 'user' as const : 'assistant' as const,
        content: msg.content,
      }));
      
      // Call real API
      const response = await API.chat.sendMessage(userInput, history);
      
      // Parse response for university cards
      const { cleanContent, artifact } = parseRenderCard(response.response);
      
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: "ai",
        content: cleanContent,
        reasoning: `Processing query: "${userInput.substring(0, 30)}..."\n> Analyzing user profile parameters...\n> Cross-referencing admission database...\n> Generating strategic recommendations...`,
        artifact
      };
      
      setMessages(prev => [...prev, aiResponse]);
    } catch (error: any) {
      // Show error message in chat
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "ai",
        content: `⚠️ **Connection Error**\n\n${error.message || 'Failed to reach AI Core'}\n\nPlease ensure the backend server is running on port 8000.`,
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsThinking(false);
    }
  };

  return (
    <div className="flex h-screen bg-[#030712] overflow-hidden selection:bg-indigo-500/30">
      {/* Neural Stream (Main Chat) */}
      <div className="flex-1 flex flex-col relative h-full">
        {/* Header */}
        <header className="h-16 border-b border-white/[0.08] bg-black/40 backdrop-blur-md flex items-center justify-between px-6 z-10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-white tracking-tight">AI COUNSELLOR</h1>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] text-slate-500 font-mono uppercase tracking-widest">Neural Stream Active</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white rounded-full">
              <History className="w-5 h-5" />
            </Button>
            <div className="h-8 w-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden">
              <User className="w-4 h-4 text-slate-400" />
            </div>
          </div>
        </header>

        {/* Chat Area */}
        <ScrollArea className="flex-1 p-6 relative" viewportRef={scrollRef}>
          <div className="max-w-3xl mx-auto space-y-8 pb-32">
            {/* Watermark */}
            <div className="fixed inset-0 flex items-center justify-center pointer-events-none opacity-[0.02] z-0">
              <Brain className="w-96 h-96 text-white" />
            </div>

            <AnimatePresence mode="popLayout">
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-4 ${message.type === "user" ? "flex-row-reverse" : "flex-row"}`}
                >
                  {message.type === "ai" && (
                    <div className="flex-shrink-0 mt-1">
                      <GeometricOrb isThinking={isThinking && messages[messages.length-1].id === message.id} />
                    </div>
                  )}
                  
                  <div className={`flex flex-col max-w-[85%] ${message.type === "user" ? "items-end" : "items-start"}`}>
                    {message.type === "ai" && message.reasoning && (
                      <ReasoningTrace reasoning={message.reasoning} />
                    )}
                    
                    <div className={`p-4 rounded-2xl text-sm leading-relaxed ${
                      message.type === "user" 
                        ? "bg-indigo-600 text-white rounded-tr-none shadow-lg shadow-indigo-500/10" 
                        : "bg-white/[0.03] border border-white/[0.08] backdrop-blur-xl text-slate-200 rounded-tl-none prose prose-invert prose-p:leading-relaxed prose-strong:text-indigo-400"
                    }`}>
                      {message.type === "ai" ? (
                        <ReactMarkdown>{message.content}</ReactMarkdown>
                      ) : (
                        message.content
                      )}
                    </div>

                    {message.artifact && (
                      <div className="w-full max-w-sm">
                        <UniversityCard artifact={message.artifact} />
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {isThinking && messages[messages.length-1]?.type !== "ai" && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex gap-4"
              >
                <div className="flex-shrink-0 mt-1">
                  <GeometricOrb isThinking={true} />
                </div>
                <div className="flex flex-col gap-2">
                  <div className="border-l-2 border-violet-500/30 pl-4 py-2">
                    <div className="flex items-center gap-2 text-[10px] font-mono text-violet-400/60 uppercase tracking-widest">
                      <Brain className="w-3 h-3 animate-pulse" />
                      Neural Process Underway...
                    </div>
                  </div>
                  <div className="flex gap-1.5 p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] w-20 justify-center">
                    <motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1, repeat: Infinity }} className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                    <motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1, repeat: Infinity, delay: 0.2 }} className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                    <motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1, repeat: Infinity, delay: 0.4 }} className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </ScrollArea>

        {/* Command Line Area */}
        <div className="absolute bottom-0 left-0 right-0 p-6 pointer-events-none">
          <div className="max-w-3xl mx-auto pointer-events-auto">
            {/* Suggestion Pills */}
            <div className="flex gap-2 mb-4 overflow-x-auto no-scrollbar pb-2">
              {[
                { label: "Safe Universities", icon: <CheckCircle2 className="w-3 h-3" /> },
                { label: "Review SOP", icon: <Zap className="w-3 h-3" /> },
                { label: "Analyze Risk", icon: <Activity className="w-3 h-3" /> },
                { label: "Scholarship Search", icon: <DollarSign className="w-3 h-3" /> }
              ].map((pill, i) => (
                <button
                  key={i}
                  className="whitespace-nowrap flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/5 text-[11px] text-slate-400 hover:bg-white/5 hover:text-white transition-all hover:border-white/20"
                >
                  {pill.icon}
                  {pill.label}
                </button>
              ))}
            </div>

            {/* Input Capsule */}
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500/20 to-violet-500/20 rounded-[28px] blur opacity-0 group-focus-within:opacity-100 transition duration-500" />
              <div className="relative flex items-center bg-white/[0.03] border border-white/10 backdrop-blur-2xl rounded-[26px] p-1.5 shadow-2xl">
                <button className="p-3 text-slate-500 hover:text-white transition-colors">
                  <Mic className="w-5 h-5" />
                </button>
                <input 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  placeholder="Ask the Counsellor..."
                  className="flex-1 bg-transparent border-none outline-none text-sm text-white px-2 placeholder:text-slate-600"
                />
                <button 
                  onClick={handleSend}
                  disabled={!input.trim()}
                  className="p-3 rounded-full bg-indigo-500 text-white disabled:opacity-50 disabled:bg-slate-800 transition-all hover:scale-105 active:scale-95"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
            <p className="text-[10px] text-center text-slate-600 mt-3 font-mono">
              ENGINE VERSION: ORCHIDS-R1 • QUANTUM REASONING ENABLED
            </p>
          </div>
        </div>
      </div>

      {/* Live Context Sidebar */}
      <div className="w-[25%] min-w-[300px]">
        <SidebarHUD />
      </div>
    </div>
  );
}
