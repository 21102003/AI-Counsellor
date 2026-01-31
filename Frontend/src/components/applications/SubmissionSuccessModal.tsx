"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Rocket, CheckCircle2, ArrowRight } from "lucide-react";
import Confetti from "react-confetti-explosion";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

interface SubmissionSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  universityName: string;
}

export default function SubmissionSuccessModal({
  isOpen,
  onClose,
  universityName,
}: SubmissionSuccessModalProps) {
  const router = useRouter();

  const handleReturnToDashboard = () => {
    // TODO: Update university status to "SUBMITTED" via API
    onClose();
    router.push("/dashboard");
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60]"
            onClick={onClose}
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 50 }}
            transition={{ type: "spring", damping: 20, stiffness: 200 }}
            className="fixed inset-0 z-[70] flex items-center justify-center p-6 pointer-events-none"
          >
            <div
              className="relative bg-gradient-to-b from-[#0a0a0f] to-[#050508] border border-white/10 rounded-3xl shadow-2xl p-12 max-w-lg w-full pointer-events-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Confetti */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                <Confetti
                  force={0.8}
                  duration={3500}
                  particleCount={150}
                  width={600}
                  colors={["#10b981", "#6366f1", "#8b5cf6", "#06b6d4", "#14b8a6"]}
                />
              </div>

              {/* Success Icon Animation */}
              <div className="flex justify-center mb-8">
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{
                    type: "spring",
                    damping: 15,
                    stiffness: 200,
                    delay: 0.2,
                  }}
                  className="relative"
                >
                  {/* Glow Effect */}
                  <div className="absolute inset-0 bg-emerald-500/30 blur-3xl rounded-full animate-pulse" />
                  
                  {/* Icon Container */}
                  <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-2xl shadow-emerald-500/50">
                    <Rocket className="h-12 w-12 text-white" />
                  </div>

                  {/* Checkmark Badge */}
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.5, type: "spring", stiffness: 300 }}
                    className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-xl"
                  >
                    <CheckCircle2 className="h-6 w-6 text-emerald-500" />
                  </motion.div>
                </motion.div>
              </div>

              {/* Text Content */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-center space-y-4"
              >
                <h1 className="text-4xl font-bold text-white tracking-tight">
                  APPLICATION SENT
                </h1>
                <p className="text-slate-400 leading-relaxed max-w-md mx-auto">
                  Your strategy for <span className="text-white font-semibold">{universityName}</span> has been executed successfully. 
                  <br />
                  <span className="text-emerald-400 font-medium">Good luck, Candidate.</span>
                </p>
              </motion.div>

              {/* Status Line */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="mt-8 flex items-center justify-center gap-3 text-xs text-slate-500 font-mono"
              >
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Status: TRANSMITTED</span>
                <div className="w-px h-3 bg-white/10" />
                <span>Tracking ID: #{Math.random().toString(36).substr(2, 9).toUpperCase()}</span>
              </motion.div>

              {/* Action Button */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="mt-8"
              >
                <Button
                  onClick={handleReturnToDashboard}
                  className="w-full h-14 bg-white hover:bg-slate-100 text-black font-bold rounded-xl text-base shadow-xl hover:scale-[1.02] transition-all"
                >
                  Return to Dashboard
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </motion.div>

              {/* Decorative Elements */}
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 via-indigo-500 to-violet-500 rounded-t-3xl" />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
