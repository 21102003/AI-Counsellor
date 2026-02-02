"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle, AlertCircle, ArrowRight, BookOpen, Target, UserCircle } from "lucide-react";
import Link from "next/link";
import { 
  calculateProfileScore, 
  getScoreFeedback, 
  getCircleProgress, 
  getScoreColor,
  type UserProfile 
} from "@/lib/profile-score";

// Mock Data (Replace with API call later if needed)
const MOCK_STATS = {
  gpa: "3.5",
  budget: "$40k",
  stage: 3, // 1=Profile, 2=Discovery, 3=Locked, 4=Applied
};

interface LockedUniversity {
  id: string;
  name: string;
  location: string;
  country: string;
  flag: string;
  matchScore: number;
  tuition: number;
  acceptanceRate: number;
  type: 'Safe' | 'Target' | 'Dream';
  tags: string[];
  aiInsight: string;
}

export default function DashboardPage() {
  const [mounted, setMounted] = useState(false);
  const [lockedUniversity, setLockedUniversity] = useState<LockedUniversity | null>(null);
  const [integrityScore, setIntegrityScore] = useState(0);

  useEffect(() => {
    // Verify token exists before rendering
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') || localStorage.getItem('token') : null;
    console.log('[Dashboard] Component mounted, token exists:', !!token);
    
    if (!token) {
      console.warn('[Dashboard] No token found, redirecting to auth');
      window.location.href = '/auth';
      return;
    }
    
    // Load locked university from localStorage
    const savedUniversity = localStorage.getItem('lockedUniversity');
    if (savedUniversity) {
      try {
        const university = JSON.parse(savedUniversity);
        setLockedUniversity(university);
        console.log('[Dashboard] Loaded locked university:', university.name);
      } catch (error) {
        console.error('[Dashboard] Failed to parse locked university:', error);
      }
    }

    // Load user profile from localStorage
    let userProfile: UserProfile | null = null;
    const savedProfile = localStorage.getItem('userProfile');
    if (savedProfile) {
      try {
        userProfile = JSON.parse(savedProfile);
        console.log('[Dashboard] Loaded user profile:', userProfile);
      } catch (error) {
        console.error('[Dashboard] Failed to parse user profile:', error);
      }
    }

    // Calculate profile integrity score
    const score = calculateProfileScore(userProfile, !!savedUniversity, !!token);
    setIntegrityScore(score);
    console.log('[Dashboard] Profile integrity score:', score);
    
    setMounted(true);
  }, []);

  if (!mounted) return null;

  // Get feedback for current score
  const scoreFeedback = getScoreFeedback(integrityScore);
  
  // Calculate SVG circle progress
  const radius = 56;
  const { circumference, progressOffset } = getCircleProgress(integrityScore, radius);
  const scoreColor = getScoreColor(integrityScore);

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
          
          {/* Dynamic Circular Progress */}
          <div className="relative w-32 h-32 mx-auto mb-4 flex items-center justify-center">
            <svg className="transform -rotate-90 w-32 h-32">
              {/* Background Circle */}
              <circle
                cx="64"
                cy="64"
                r={radius}
                stroke="currentColor"
                strokeWidth="8"
                fill="transparent"
                className="text-indigo-500/20"
              />
              {/* Progress Circle */}
              <circle
                cx="64"
                cy="64"
                r={radius}
                stroke="currentColor"
                strokeWidth="8"
                fill="transparent"
                strokeDasharray={circumference}
                strokeDashoffset={progressOffset}
                strokeLinecap="round"
                className={`transition-all duration-1000 ${scoreColor}`}
              />
            </svg>
            {/* Score Text */}
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl font-bold">{integrityScore}%</span>
            </div>
          </div>
          
          <p className={`text-center text-sm ${scoreFeedback.color} font-medium`}>
            {scoreFeedback.message}
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
          
          {lockedUniversity ? (
            <>
              <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl">{lockedUniversity.flag}</span>
                <div>
                  <h2 className="text-3xl font-bold">{lockedUniversity.name}</h2>
                  <p className="text-sm text-slate-400">{lockedUniversity.location}</p>
                </div>
              </div>
              <p className="text-slate-400 mb-8 max-w-md">
                Application materials for <span className="text-white font-semibold">{lockedUniversity.name}</span> have been finalized. 
                Review submission status and continue building your profile.
              </p>
              
              <div className="flex gap-3">
                <Link href="/applications">
                  <button className="bg-white text-black px-6 py-3 rounded-lg font-bold flex items-center gap-2 hover:scale-105 transition-transform">
                    View Application <ArrowRight className="w-4 h-4" />
                  </button>
                </Link>
                <Link href="/discovery">
                  <button className="bg-white/10 text-white px-6 py-3 rounded-lg font-bold flex items-center gap-2 hover:bg-white/20 transition-all border border-white/10">
                    Continue Discovery
                  </button>
                </Link>
              </div>
            </>
          ) : (
            <>
              <h2 className="text-3xl font-bold mb-2">No University Locked</h2>
              <p className="text-slate-400 mb-8 max-w-md">
                You haven't committed to a university yet. Browse the discovery page to find your perfect match and lock your target.
              </p>
              
              <Link href="/discovery">
                <button className="bg-white text-black px-6 py-3 rounded-lg font-bold flex items-center gap-2 hover:scale-105 transition-transform">
                  Go to Discovery <ArrowRight className="w-4 h-4" />
                </button>
              </Link>
            </>
          )}
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
               lockedUniversity && { text: `University Locked: ${lockedUniversity.name}`, time: "Just now", status: "success" },
               { text: "Profile Calibration Completed", time: "2 hours ago", status: "success" },
               { text: "Discovery Mode Activated", time: "1 day ago", status: "neutral" }
             ].filter(Boolean).map((item, i) => (
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
