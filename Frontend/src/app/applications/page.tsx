"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useScroll, useSpring, useTransform, useMotionValue } from "framer-motion";
import { 
  Lock, 
  ChevronRight, 
  Sparkles, 
  FileText, 
  Send, 
  CheckCircle2, 
  Clock, 
  ArrowLeft,
  ShieldCheck,
  Zap,
  Target,
  Wand2,
  AlertCircle,
  MoreVertical
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { formatDistanceToNow, addDays } from "date-fns";
import Link from "next/link";
import ReadinessHUD from "@/components/applications/ReadinessHUD";
import SubmissionSuccessModal from "@/components/applications/SubmissionSuccessModal";

// --- Mock Data ---
const LOCKED_UNI = {
  name: "New York University",
  major: "Master's in Computer Science",
  deadline: addDays(new Date(), 42),
};

const EXECUTION_STEPS = [
  {
    id: "docs",
    title: "Application Assets",
    items: [
      { id: "sop", label: "Statement of Purpose (SOP)", status: "Drafting", type: "ai" },
      { id: "lor", label: "Letters of Recommendation", status: "Pending Upload", type: "standard" },
    ],
  },
  {
    id: "testing",
    title: "Score Verification",
    items: [
      { id: "gre", label: "GRE Score Report", status: "Action Required", type: "standard", action: "Mark Sent" },
      { id: "toefl", label: "TOEFL/IELTS Scores", status: "Verified", type: "standard" },
    ],
  },
  {
    id: "submission",
    title: "Final Protocol",
    items: [
      { id: "portal", label: "University Portal Submission", status: "Locked", type: "standard" },
    ],
  },
];

// --- Components ---

const GlassCard = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`bg-white/[0.03] border border-white/[0.08] backdrop-blur-xl rounded-2xl p-6 ${className}`}>
    {children}
  </div>
);

const CountdownTimer = ({ deadline }: { deadline: Date }) => {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, mins: 0, secs: 0 });
  const isUrgent = timeLeft.days < 10;

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = deadline.getTime() - now;
      
      setTimeLeft({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        mins: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        secs: Math.floor((distance % (1000 * 60)) / 1000),
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [deadline]);

  return (
    <div className={`flex flex-col items-end font-mono ${isUrgent ? "text-rose-500 animate-pulse" : "text-amber-400"}`}>
      <span className="text-[10px] uppercase tracking-widest text-slate-500 mb-1">Time to Deadline</span>
      <div className="text-2xl md:text-3xl font-bold tracking-tighter">
        {timeLeft.days}d {timeLeft.hours}h {timeLeft.mins}m {timeLeft.secs}s
      </div>
    </div>
  );
};

interface ExecutionItem {
  id: string;
  label: string;
  status: string;
  type: "ai" | "standard";
  action?: string;
}

interface ExecutionStep {
  id: string;
  title: string;
  items: ExecutionItem[];
}

const MissionNode = ({ 
  step, 
  index, 
  checkedItems, 
  toggleItem 
}: { 
  step: ExecutionStep; 
  index: number; 
  checkedItems: Record<string, boolean>; 
  toggleItem: (id: string) => void;
}) => {
  return (
    <div className="relative pl-12 pb-16 last:pb-0">
      {/* Node Indicator */}
      <motion.div 
        initial={{ scale: 0 }}
        whileInView={{ scale: 1 }}
        viewport={{ once: true }}
        transition={{ delay: index * 0.2 }}
        className="absolute left-0 top-0 w-8 h-8 rounded-full bg-[#030712] border-2 border-white/10 flex items-center justify-center z-10"
      >
        <div className={`w-2 h-2 rounded-full ${index === 0 ? "bg-emerald-400" : "bg-white/20"}`} />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: 20 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ delay: index * 0.2 + 0.1 }}
      >
        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <span className="text-slate-500 font-mono text-sm">0{index + 1}</span>
          {step.title}
        </h3>

        <div className="space-y-4">
          {step.items.map((item: any) => (
            <motion.div
              key={item.id}
              whileTap={{ scale: 0.98 }}
              className={`group cursor-pointer select-none`}
              onClick={() => toggleItem(item.id)}
            >
              <GlassCard className={`relative overflow-hidden transition-all duration-300 ${checkedItems[item.id] ? "border-emerald-500/50 bg-emerald-500/5" : "hover:border-white/20"}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-6 h-6 rounded-md border flex items-center justify-center transition-colors ${checkedItems[item.id] ? "bg-emerald-500 border-emerald-500" : "border-white/10"}`}>
                      {checkedItems[item.id] && <CheckCircle2 className="w-4 h-4 text-black" />}
                    </div>
                    <div>
                      <p className={`font-medium transition-colors ${checkedItems[item.id] ? "text-emerald-400" : "text-white"}`}>
                        {item.label}
                      </p>
                      <p className="text-xs text-slate-500 mt-1 uppercase tracking-wider">{item.status}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {item.type === "ai" && !checkedItems[item.id] && (
                      <Button 
                        size="sm" 
                        className="bg-gradient-to-r from-indigo-600 to-violet-600 text-white border-0 h-8 px-3 text-xs group/btn"
                      >
                        <Sparkles className="w-3 h-3 mr-2 group-hover/btn:rotate-12 transition-transform" />
                        Generate with AI
                      </Button>
                    )}
                    {item.action && !checkedItems[item.id] && (
                      <Button variant="outline" size="sm" className="h-8 px-3 text-xs border-white/10 text-white hover:bg-white/5">
                        {item.action}
                      </Button>
                    )}
                    <MoreVertical className="w-4 h-4 text-slate-600" />
                  </div>
                </div>
                
                {item.type === "ai" && (
                  <div className="absolute top-0 right-0 p-1">
                    <div className="text-[8px] font-bold text-indigo-400/50 uppercase tracking-[0.2em] rotate-90 origin-top-right translate-x-4 translate-y-4">
                      Ghostwriter Active
                    </div>
                  </div>
                )}
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default function ApplicationsPage() {
  const [isLocked, setIsLocked] = useState(true); // Set to false to see Locked State
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({
    "toefl": true,
  });
  const [showGhostwriter, setShowGhostwriter] = useState(false);
  const [showSubmissionModal, setShowSubmissionModal] = useState(false);
  
  const totalItems = EXECUTION_STEPS.flatMap(s => s.items).length;
  const completedCount = Object.values(checkedItems).filter(Boolean).length;
  const progress = (completedCount / totalItems) * 100;

  const toggleItem = (id: string) => {
    setCheckedItems(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleInitiateSubmission = () => {
    setShowSubmissionModal(true);
  };

  const isMissionComplete = progress === 100;

  // Timeline SVG animation
  const { scrollYProgress } = useScroll();
  const scaleY = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  if (!isLocked) {
    return (
      <div className="min-h-screen bg-[#030712] flex items-center justify-center p-6 font-sans">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full"
        >
          <GlassCard className="text-center py-16 px-10 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            <div className="relative z-10">
              <div className="w-20 h-20 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-8">
                <Lock className="w-10 h-10 text-slate-600" />
              </div>
              <h1 className="text-3xl font-bold text-white mb-4 tracking-tight">Target Not Acquired.</h1>
              <p className="text-slate-400 mb-10 leading-relaxed">
                You must lock a university in the Discovery Module to generate a tactical roadmap.
              </p>
              <Link href="/discovery">
                <Button size="lg" variant="outline" className="w-full h-12 rounded-xl border-white/10 text-white hover:bg-white/5 group">
                  Go to Discovery
                  <ChevronRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>
          </GlassCard>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#030712] text-slate-400 font-sans pb-32">
      {/* Background elements */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/5 blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-emerald-500/5 blur-[120px]" />
      </div>

      <div className="max-w-7xl mx-auto px-6 pt-16">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-20">
          <div>
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-2 text-indigo-400 font-mono text-xs uppercase tracking-[0.3em] mb-4"
            >
              <ShieldCheck className="w-4 h-4" />
              Execution Protocol Active
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-6xl font-bold text-white tracking-tight mb-2"
            >
              {LOCKED_UNI.name}
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xl text-slate-500"
            >
              {LOCKED_UNI.major}
            </motion.p>
          </div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
          >
            <CountdownTimer deadline={LOCKED_UNI.deadline} />
          </motion.div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Main Timeline */}
          <div className="lg:col-span-8 relative">
            {/* Animated Line */}
            <div className="absolute left-4 top-4 bottom-4 w-[2px] bg-white/5">
              <motion.div 
                className="absolute top-0 left-0 right-0 bg-gradient-to-b from-emerald-400 via-indigo-500 to-transparent origin-top"
                style={{ height: `${progress}%` }}
              />
            </div>

            <div className="space-y-4">
              {EXECUTION_STEPS.map((step, idx) => (
                <MissionNode 
                  key={step.id} 
                  step={step} 
                  index={idx} 
                  checkedItems={checkedItems}
                  toggleItem={toggleItem}
                />
              ))}
            </div>
          </div>

          {/* Readiness HUD */}
          <div className="lg:col-span-4">
            <div className="sticky top-24 space-y-6">
              <ReadinessHUD
                progress={Math.round(progress)}
                isMissionComplete={isMissionComplete}
                completedCount={completedCount}
                totalCount={totalItems}
                onInitiateSubmission={handleInitiateSubmission}
              />

              {/* Tips / AI Insight */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="p-6 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex gap-4"
              >
                <AlertCircle className="w-5 h-5 text-indigo-400 shrink-0" />
                <div>
                  <p className="text-xs font-bold text-white uppercase tracking-wider mb-1">Intelligence Note</p>
                  <p className="text-xs text-indigo-300 leading-relaxed">
                    NYU prefers SOPs that emphasize practical research. Focus on your Distributed Systems projects.
                  </p>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* AI Assistant FAB */}
      <div className="fixed bottom-8 right-8 z-50">
        <AnimatePresence>
          {showGhostwriter && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.9 }}
              className="absolute bottom-20 right-0 w-80 mb-4"
            >
              <GlassCard className="border-indigo-500/30 bg-[#030712]/90 shadow-2xl shadow-indigo-500/20">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center">
                    <Wand2 className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h5 className="text-sm font-bold text-white">Ghostwriter v2.1</h5>
                    <p className="text-[10px] text-indigo-400 uppercase font-bold">AI Assistant Active</p>
                  </div>
                </div>
                <div className="p-3 bg-white/5 rounded-xl text-xs text-slate-300 italic mb-4 leading-relaxed">
                  "I've analyzed your resume. Should we rewrite the 'Technical Leadership' section of your SOP to align with NYU's CS core values?"
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Button className="h-9 bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-bold uppercase tracking-wider rounded-lg">
                    Initiate Draft
                  </Button>
                  <Button variant="outline" className="h-9 border-white/10 text-white hover:bg-white/5 text-[10px] font-bold uppercase tracking-wider rounded-lg">
                    Custom Query
                  </Button>
                </div>
              </GlassCard>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Floating Labels / Decorative */}
      <div className="fixed bottom-8 left-8 flex items-center gap-4 text-[10px] font-mono text-slate-600 font-bold uppercase tracking-[0.4em]">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          Neural Link: Established
        </div>
        <div className="w-px h-3 bg-white/10" />
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
          Ghostwriter: Standby
        </div>
      </div>

      {/* Submission Success Modal */}
      <SubmissionSuccessModal
        isOpen={showSubmissionModal}
        onClose={() => setShowSubmissionModal(false)}
        universityName={LOCKED_UNI.name}
      />
    </div>
  );
}
