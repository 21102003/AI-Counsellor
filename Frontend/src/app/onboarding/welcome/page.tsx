"use client";

import React from "react";
import { motion } from "framer-motion";
import { Sliders, Sparkles, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { ProtectedRoute } from "@/lib/auth-context";

export default function OnboardingWelcomePage() {
  const router = useRouter();

  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[#030712] flex items-center justify-center p-6 overflow-hidden selection:bg-indigo-500/30">
        {/* Ambient Glow */}
        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] pointer-events-none">
          <div className="absolute inset-0 bg-indigo-600/10 blur-[120px] rounded-full animate-[spin_20s_linear_infinite]" />
          <div className="absolute inset-20 bg-violet-600/10 blur-[100px] rounded-full animate-[spin_15s_linear_infinite_reverse]" />
        </div>

        <div className="w-full max-w-4xl relative z-10">
          <motion.div
            initial="initial"
            animate="animate"
            className="text-center mb-12"
          >
            <motion.h1 
              variants={fadeIn}
              className="text-4xl md:text-5xl font-black text-white tracking-tight mb-4"
            >
              Initialize Your Strategy.
            </motion.h1>
            <motion.p 
              variants={fadeIn}
              className="text-slate-400 text-lg max-w-2xl mx-auto"
            >
              Select how you want to calibrate your profile for the admissions engine.
            </motion.p>
          </motion.div>

          {/* Mode Selection Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Manual Configuration */}
            <motion.button
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              onClick={() => router.push("/onboarding")}
              className="group relative p-8 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 transition-all duration-300 text-left hover:scale-[1.02] hover:bg-white/[0.07]"
            >
              <div className="mb-6">
                <div className="w-14 h-14 rounded-xl bg-slate-700/30 border border-slate-600/30 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Sliders className="w-7 h-7 text-slate-300" />
                </div>
              </div>

              <h3 className="text-2xl font-bold text-white mb-3 tracking-tight">
                Manual Configuration
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-6">
                I will manually enter my GPA, budget, and test scores through the step-by-step form.
              </p>

              <div className="flex items-center gap-2 text-slate-500 group-hover:text-indigo-400 transition-colors">
                <span className="text-xs font-medium uppercase tracking-wider">Continue</span>
                <ChevronRight className="w-4 h-4" />
              </div>
            </motion.button>

            {/* AI Interview (Featured) */}
            <motion.button
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              onClick={() => router.push("/onboarding/ai-interview")}
              className="group relative p-8 rounded-2xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/30 hover:border-indigo-400/50 transition-all duration-300 text-left hover:scale-[1.02] shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30"
            >
              {/* Glow Effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              <div className="relative">
                <div className="mb-6">
                  <div className="w-14 h-14 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <Sparkles className="w-7 h-7 text-indigo-400 animate-pulse" />
                  </div>
                </div>

                <div className="flex items-center gap-2 mb-3">
                  <h3 className="text-2xl font-bold text-white tracking-tight">
                    AI Interview
                  </h3>
                  <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-[10px] text-indigo-300 font-bold uppercase tracking-wider">
                    Recommended
                  </span>
                </div>

                <p className="text-slate-300 text-sm leading-relaxed mb-6">
                  Let the AI analyze me. I'll answer questions, and you build the strategy automatically.
                </p>

                <div className="flex items-center gap-2 text-indigo-400 group-hover:text-indigo-300 transition-colors">
                  <span className="text-xs font-medium uppercase tracking-wider">Start Interview</span>
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            </motion.button>
          </div>

          {/* Skip Option */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-center mt-8"
          >
            <button
              onClick={() => router.push("/discovery")}
              className="text-slate-500 hover:text-slate-400 text-sm transition-colors"
            >
              Skip for now and explore universities →
            </button>
          </motion.div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
