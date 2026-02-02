"use client";

import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { Sliders, Sparkles, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { TokenStorage } from "@/lib/api";


export default function OnboardingModePage() {
  const router = useRouter();

  // Check authentication on mount
  useEffect(() => {
    if (!TokenStorage.isAuthenticated()) {
      router.push('/auth');
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-[#030712] flex items-center justify-center p-6 overflow-hidden selection:bg-indigo-500/30">
      {/* Animated Background Halo */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] pointer-events-none">
        <div className="absolute inset-0 bg-indigo-600/10 blur-[120px] rounded-full animate-[spin_20s_linear_infinite]" />
        <div className="absolute inset-20 bg-violet-600/10 blur-[100px] rounded-full animate-[spin_15s_linear_infinite_reverse]" />
      </div>

      <div className="w-full max-w-4xl relative z-10 space-y-12">
        {/* Header */}
        <div className="text-center space-y-3">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-6xl font-bold text-white tracking-tight"
          >
            Initialize Your Strategy.
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg text-slate-400 max-w-2xl mx-auto"
          >
            Select how you want to calibrate your profile for the admissions engine.
          </motion.p>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card 1: Manual Entry */}
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => router.push('/onboarding/manual')}
            className="group relative bg-white/5 border border-white/10 hover:border-white/20 rounded-3xl p-8 md:p-10 text-left transition-all duration-300 hover:shadow-xl hover:shadow-white/5"
          >
            <div className="space-y-6">
              {/* Icon */}
              <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors duration-300">
                <Sliders className="h-8 w-8 text-slate-300 group-hover:text-white transition-colors duration-300" />
              </div>

              {/* Text Content */}
              <div className="space-y-3">
                <h3 className="text-2xl font-bold text-white tracking-tight">
                  Manual Entry
                </h3>
                <p className="text-slate-400 leading-relaxed">
                  I'll enter my GPA, Budget, and Scores manually through a guided form.
                </p>
              </div>

              {/* Arrow Icon */}
              <div className="flex items-center gap-2 text-slate-500 group-hover:text-indigo-400 transition-colors duration-300">
                <span className="text-sm font-medium">Configure Now</span>
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
              </div>
            </div>
          </motion.button>

          {/* Card 2: AI Interview (Hero Option) */}
          <motion.button
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => router.push('/onboarding/ai')}
            className="group relative bg-indigo-600/10 border border-indigo-500/50 hover:border-indigo-500 rounded-3xl p-8 md:p-10 text-left transition-all duration-300 shadow-[0_0_30px_rgba(79,70,229,0.2)] hover:shadow-[0_0_40px_rgba(79,70,229,0.4)]"
          >
            {/* Recommended Badge */}
            <div className="absolute top-6 right-6">
              <div className="px-3 py-1 bg-indigo-500/20 border border-indigo-500/50 rounded-full text-xs font-bold text-indigo-300 uppercase tracking-wider">
                Recommended
              </div>
            </div>

            <div className="space-y-6">
              {/* Icon with Glow */}
              <div className="relative">
                <div className="absolute inset-0 bg-indigo-500 blur-xl opacity-20 group-hover:opacity-30 transition-opacity duration-300" />
                <div className="relative w-16 h-16 rounded-2xl bg-indigo-500/20 flex items-center justify-center group-hover:bg-indigo-500/30 transition-colors duration-300">
                  <Sparkles className="h-8 w-8 text-indigo-400 group-hover:text-indigo-300 transition-colors duration-300 animate-pulse" />
                </div>
              </div>

              {/* Text Content */}
              <div className="space-y-3">
                <h3 className="text-2xl font-bold text-white tracking-tight">
                  AI Interview
                </h3>
                <p className="text-indigo-100 leading-relaxed">
                  Interview me. The AI will analyze my answers to build the perfect strategy.
                </p>
              </div>

              {/* Arrow Icon */}
              <div className="flex items-center gap-2 text-indigo-400 group-hover:text-indigo-300 transition-colors duration-300">
                <span className="text-sm font-bold">Start Interview</span>
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
              </div>
            </div>

            {/* Animated Glow Effect */}
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-indigo-500/0 via-indigo-500/5 to-violet-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </motion.button>
        </div>

        {/* Optional: Bottom Info Text */}
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center text-xs text-slate-500 uppercase tracking-widest font-mono"
        >
          Both methods yield the same precision. Choose what feels natural.
        </motion.p>
      </div>
    </div>
  );
}

