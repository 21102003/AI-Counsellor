"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Heart, 
  Map as MapIcon, 
  Lock, 
  Sparkles, 
  SignalHigh, 
  SignalMedium, 
  SignalLow,
  Globe,
  ChevronDown,
  X
} from "lucide-react";
import { University } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter,
  DialogTrigger
} from "@/components/ui/dialog";

// --- Sub-components ---

export const MatchScoreRing = ({ score }: { score: number }) => {
  const color = score > 80 ? "#34d399" : score > 50 ? "#fbbf24" : "#f43f5e";
  const circumference = 2 * Math.PI * 18;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center w-12 h-12">
      <svg className="w-full h-full transform -rotate-90">
        <circle
          cx="24"
          cy="24"
          r="18"
          stroke="currentColor"
          strokeWidth="3"
          fill="transparent"
          className="text-white/5"
        />
        <motion.circle
          cx="24"
          cy="24"
          r="18"
          stroke={color}
          strokeWidth="3"
          fill="transparent"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          strokeLinecap="round"
        />
      </svg>
      <span className="absolute text-[10px] font-bold text-white">{score}%</span>
    </div>
  );
};

export const UniversitySuperCard = ({ 
  university, 
  onLock, 
  onShortlist, 
  isShortlisted 
}: { 
  university: University; 
  onLock: (uni: University) => void;
  onShortlist: (uni: University) => void;
  isShortlisted: boolean;
}) => {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ scale: 1.01 }}
      className="group relative bg-white/[0.03] border border-white/[0.08] backdrop-blur-xl rounded-2xl overflow-hidden transition-all duration-300 hover:border-white/20"
    >
      <div className="p-6">
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 text-xl">
              🎓
            </div>
            <div>
              <h3 className="text-lg font-bold text-white tracking-tight">{university.name}</h3>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <Globe className="w-3 h-3" />
                {university.location || university.country}
              </div>
            </div>
          </div>
          <MatchScoreRing score={university.ranking ? 100 - university.ranking : 75} />
        </div>

        {/* Data Vis */}
        <div className="space-y-4 mb-6">
          <div className="space-y-1.5">
            <div className="flex justify-between text-[10px] font-mono uppercase tracking-widest text-slate-500">
              <span>Annual Tuition</span>
              <span className={university.tuition_fee > 40000 ? "text-rose-400" : "text-emerald-400"}>
                ${university.tuition_fee.toLocaleString()}
              </span>
            </div>
            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
              <motion.div 
                className={`h-full ${university.tuition_fee > 40000 ? "bg-rose-500" : "bg-emerald-500"}`}
                initial={{ width: 0 }}
                animate={{ width: `${Math.min((university.tuition_fee / 60000) * 100, 100)}%` }}
                transition={{ duration: 1, delay: 0.2 }}
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase tracking-widest text-slate-500">Acceptance</span>
              <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div 
                      key={i} 
                      className={`h-3 w-1 rounded-full ${
                        university.acceptance_rate < 10 ? (i <= 1 ? "bg-rose-500" : "bg-white/10") :
                        university.acceptance_rate < 25 ? (i <= 2 ? "bg-rose-400" : "bg-white/10") :
                        university.acceptance_rate < 50 ? (i <= 3 ? "bg-amber-500" : "bg-white/10") :
                        university.acceptance_rate < 75 ? (i <= 4 ? "bg-emerald-400" : "bg-white/10") :
                        "bg-emerald-500"
                      }`} 
                    />
                  ))}
                </div>
              </div>
              <Badge variant="outline" className={`text-[10px] uppercase font-mono border-white/10 ${
                university.match_tier === 'Safe' ? "text-emerald-400" :
                university.match_tier === 'Target' ? "text-amber-400" :
                "text-rose-400"
              }`}>
                {university.match_tier || 'Target'}
              </Badge>
            </div>
          </div>

          {/* AI Insight */}
          <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-4 mb-6 relative overflow-hidden group/insight">
            <div className="flex items-center gap-2 mb-2 text-indigo-300">
              <Sparkles className="w-3.5 h-3.5" />
              <span className="text-[10px] font-bold uppercase tracking-wider">AI Insight</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed italic">
              {university.match_tier === 'Safe' 
                ? `Strong admission probability. Your profile aligns well with ${university.name}'s acceptance criteria.`
                : university.match_tier === 'Target'
                ? `Competitive application. Focus on showcasing unique strengths in your application.`
                : `Reach university. Exceptional essays and recommendations will be crucial for admission.`}
            </p>
          </div>

          {/* Action Array (Hidden by default, shown on hover/touch) */}
          <div className="grid grid-cols-2 gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <Button 
              variant="outline" 
              size="sm" 
              className={`bg-white/5 border-white/10 hover:bg-white/10 text-xs gap-2 ${isShortlisted ? "text-rose-400 border-rose-400/30" : ""}`}
              onClick={() => onShortlist(university)}
            >
              <Heart className={`w-3.5 h-3.5 ${isShortlisted ? "fill-current" : ""}`} />
              {isShortlisted ? "Shortlisted" : "Shortlist"}
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="bg-white/5 border-white/10 hover:bg-white/10 text-xs gap-2"
            >
              <MapIcon className="w-3.5 h-3.5" />
              Campus
            </Button>
            <Button 
              className="col-span-2 bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900 border border-white/10 hover:border-white/20 text-white text-xs font-bold gap-2 py-5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]"
              onClick={() => onLock(university)}
            >
              <Lock className="w-3.5 h-3.5" />
              COMMIT & LOCK
            </Button>
          </div>
      </div>
    </motion.div>
  );
};
