"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle, AlertCircle, ArrowRight, BookOpen, Target, UserCircle } from "lucide-react";
import Link from "next/link";

// Mock Data (Replace with API call later if needed)
const MOCK_STATS = {
  gpa: "3.5",
  budget: "$40k",
  stage: 3, // 1=Profile, 2=Discovery, 3=Locked, 4=Applied
};

export default function DashboardPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Verify token exists before rendering
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') || localStorage.getItem('token') : null;
    console.log('[Dashboard] Component mounted, token exists:', !!token);
    
    if (!token) {
      console.warn('[Dashboard] No token found, redirecting to auth');
      window.location.href = '/auth';
      return;
    }
    
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-[#030712] text-white p-8 font-sans selection:bg-indigo-500/30">
      {/* Header */}
      <header className="flex justify-between items-center mb-12 border-b border-white/10 pb-6 pt-24">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_#10b981]" />
          <h1 className="text-2xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-white/60">
            NEURAL COMMAND // DASHBOARD
          </h1>
        </div>
        <div className="flex gap-4 items-center">
          <Link href="/profile">
            <button className="flex items-center gap-2 px-4 py-1.5 text-sm font-medium text-slate-300 hover:text-white hover:bg-white/5 rounded-full transition-colors">
              <UserCircle className="w-4 h-4" />
              View Identity
            </button>
          </Link>
          
          {/* Existing Status Badge */}
          <div className="px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-sm font-mono">
             STATUS: ONLINE
          </div>
        </div>
      </header>

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Card 1: Profile Health */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="col-span-1 bg-white/[0.02] border border-white/[0.08] p-6 rounded-2xl backdrop-blur-xl hover:border-indigo-500/30 transition-colors group"
        >
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-lg font-medium text-slate-300">Profile Integrity</h3>
            <Target className="w-5 h-5 text-indigo-400 group-hover:rotate-45 transition-transform" />
          </div>
          <div className="relative w-32 h-32 mx-auto mb-4 flex items-center justify-center">
             <div className="absolute inset-0 border-4 border-indigo-500/20 rounded-full" />
             <div className="absolute inset-0 border-4 border-emerald-500 rounded-full border-t-transparent rotate-45" />
             <span className="text-2xl font-bold">92%</span>
          </div>
          <p className="text-center text-sm text-slate-500">
            Optimization complete. <br /> ready for submission.
          </p>
        </motion.div>

        {/* Card 2: Mission Control (Wide) */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="col-span-1 md:col-span-2 bg-gradient-to-br from-indigo-900/20 to-purple-900/10 border border-indigo-500/20 p-8 rounded-2xl relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2" />
          
          <h2 className="text-3xl font-bold mb-2">Next Best Action</h2>
          <p className="text-slate-400 mb-8 max-w-md">
            Application materials for New York University have been finalized. 
            Review submission status.
          </p>
          
          <Link href="/discovery">
             <button className="bg-white text-black px-6 py-3 rounded-lg font-bold flex items-center gap-2 hover:scale-105 transition-transform">
               Continue Discovery <ArrowRight className="w-4 h-4" />
             </button>
          </Link>
        </motion.div>

        {/* Card 3: Recent Activity */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="col-span-1 md:col-span-3 bg-white/[0.02] border border-white/[0.08] p-6 rounded-2xl"
        >
           <h3 className="text-lg font-medium text-slate-300 mb-4">Execution Log</h3>
           <div className="space-y-3">
             {[
               { text: "Application Submitted: New York University", time: "Just now", status: "success" },
               { text: "SOP Generation Completed", time: "2 hours ago", status: "success" },
               { text: "University Lock Confirmed", time: "1 day ago", status: "neutral" }
             ].map((item, i) => (
               <div key={i} className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/5">
                  <div className="flex items-center gap-3">
                    {item.status === 'success' ? <CheckCircle className="w-4 h-4 text-emerald-400" /> : <BookOpen className="w-4 h-4 text-slate-400" />}
                    <span className="text-sm text-slate-300">{item.text}</span>
                  </div>
                  <span className="text-xs text-slate-500 font-mono">{item.time}</span>
               </div>
             ))}
           </div>
        </motion.div>

      </div>
    </div>
  );
}
