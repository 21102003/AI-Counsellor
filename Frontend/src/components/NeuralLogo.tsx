"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Hexagon, BrainCircuit } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";

export default function NeuralLogo() {
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Hide logo on landing page (it would be redundant)
  if (pathname === '/' || !mounted) {
    return null;
  }

  return (
    <motion.button
      onClick={() => router.push('/')}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ type: "spring", damping: 20, stiffness: 200, delay: 0.1 }}
      className="fixed top-6 left-8 z-50 flex items-center gap-3 group cursor-pointer"
    >
      {/* Glass Backdrop Pill */}
      <div className="absolute inset-0 -left-4 -right-4 -top-2 -bottom-2 bg-black/40 backdrop-blur-md rounded-full border border-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      {/* Icon Container */}
      <div className="relative">
        {/* Glow Effect */}
        <div className="absolute inset-0 bg-indigo-500/30 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Hexagon with Brain Icon */}
        <div className="relative w-10 h-10 flex items-center justify-center">
          <Hexagon 
            className="absolute w-10 h-10 text-indigo-500 drop-shadow-[0_0_10px_rgba(99,102,241,0.5)] transition-all group-hover:drop-shadow-[0_0_15px_rgba(99,102,241,0.8)]" 
            strokeWidth={1.5}
          />
          <BrainCircuit 
            className="relative w-5 h-5 text-indigo-400 group-hover:text-indigo-300 transition-colors" 
            strokeWidth={2}
          />
        </div>
      </div>

      {/* Text */}
      <motion.div
        initial={{ opacity: 0.8 }}
        whileHover={{ opacity: 1 }}
        className="flex flex-col"
      >
        <h1 className="text-sm font-bold tracking-[0.3em] text-white font-mono uppercase leading-none">
          AI COUNSELLOR
        </h1>
        <div className="h-px w-full bg-gradient-to-r from-indigo-500/50 to-transparent mt-1 opacity-0 group-hover:opacity-100 transition-opacity" />
      </motion.div>

      {/* Status Indicator */}
      <div className="flex items-center gap-1.5 ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
        <span className="text-[9px] text-emerald-400 font-mono uppercase tracking-wider">
          ONLINE
        </span>
      </div>
    </motion.button>
  );
}
