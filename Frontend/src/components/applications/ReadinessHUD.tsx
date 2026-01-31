"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { TrendingUp, Target, Zap, Send } from "lucide-react";
import Confetti from "react-confetti-explosion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface ReadinessHUDProps {
  progress: number;
  isMissionComplete: boolean;
  completedCount: number;
  totalCount: number;
  onInitiateSubmission?: () => void;
}

export default function ReadinessHUD({
  progress,
  isMissionComplete,
  completedCount,
  totalCount,
  onInitiateSubmission,
}: ReadinessHUDProps) {
  const [showConfetti, setShowConfetti] = useState(false);

  // Trigger confetti on mission complete
  useEffect(() => {
    if (isMissionComplete && !showConfetti) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
    }
  }, [isMissionComplete, showConfetti]);

  // Color logic
  const getColor = () => {
    if (progress <= 30) return { bar: "bg-rose-500", glow: "shadow-rose-500/40", text: "text-rose-400" };
    if (progress <= 70) return { bar: "bg-amber-400", glow: "shadow-amber-400/40", text: "text-amber-400" };
    return { bar: "bg-emerald-400", glow: "shadow-emerald-400/60", text: "text-emerald-400" };
  };

  const colors = getColor();

  return (
    <div className="relative bg-white/[0.03] border border-white/10 rounded-2xl p-6 backdrop-blur-xl">
      {/* Confetti */}
      {showConfetti && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50">
          <Confetti
            force={0.6}
            duration={3000}
            particleCount={80}
            width={400}
          />
        </div>
      )}

      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className={cn("p-2 rounded-lg", isMissionComplete ? "bg-emerald-500/20" : "bg-indigo-500/10")}>
          {isMissionComplete ? (
            <Zap className="h-5 w-5 text-emerald-400" />
          ) : (
            <Target className="h-5 w-5 text-indigo-400" />
          )}
        </div>
        <div>
          <h3 className="text-sm font-bold text-white">Readiness Score</h3>
          <p className="text-xs text-slate-500">Application Progress</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="relative h-48 w-12 mx-auto rounded-full bg-white/5 border border-white/10 overflow-hidden">
        {/* Fill Bar */}
        <motion.div
          layout
          initial={{ height: 0 }}
          animate={{ height: `${progress}%` }}
          transition={{ type: "spring", damping: 20, stiffness: 100 }}
          className={cn(
            "absolute bottom-0 left-0 right-0 rounded-full transition-colors duration-500",
            colors.bar,
            progress > 70 && colors.glow
          )}
          style={{
            boxShadow: progress > 70 ? `0 0 20px ${colors.glow}` : "none",
          }}
        />

        {/* Percentage Text (Overlay) */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span
            className={cn(
              "text-xl font-bold font-mono mix-blend-difference",
              colors.text
            )}
          >
            {progress}
          </span>
        </div>
      </div>

      {/* Stats */}
      <div className="mt-6 space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-400">Tasks Completed</span>
          <span className={cn("font-bold", colors.text)}>
            {completedCount}/{totalCount}
          </span>
        </div>

        {/* Status Badge */}
        {isMissionComplete ? (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="flex items-center justify-center gap-2 p-3 rounded-xl bg-gradient-to-r from-emerald-500/20 to-green-500/20 border border-emerald-500/30"
          >
            <Zap className="h-5 w-5 text-emerald-400 animate-pulse" />
            <span className="text-sm font-bold text-emerald-400">ALL SYSTEMS GO</span>
          </motion.div>
        ) : (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-white/[0.02] border border-white/10">
            <TrendingUp className={cn("h-4 w-4", colors.text)} />
            <span className="text-xs text-slate-400">
              {progress <= 30
                ? "Just getting started..."
                : progress <= 70
                ? "Keep pushing forward!"
                : "Almost there!"}
            </span>
          </div>
        )}
      </div>

      {/* Submission Button - Only visible when mission complete */}
      {isMissionComplete && onInitiateSubmission && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", damping: 15, stiffness: 200, delay: 0.3 }}
          className="mt-6"
        >
          <Button
            onClick={onInitiateSubmission}
            className="w-full h-14 bg-white hover:bg-slate-100 text-black font-bold rounded-xl shadow-2xl hover:scale-[1.02] transition-all relative overflow-hidden group"
          >
            {/* Pulsing Glow */}
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/20 to-indigo-400/20 animate-pulse" />
            
            <span className="relative flex items-center justify-center gap-2">
              <Send className="h-5 w-5" />
              INITIATE SUBMISSION
            </span>
          </Button>
        </motion.div>
      )}
    </div>
  );
}
