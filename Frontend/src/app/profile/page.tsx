"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  UserCircle,
  GraduationCap,
  DollarSign,
  Award,
  Globe,
  Calendar,
  CheckCircle2,
  Edit3,
  Save,
  X,
  ShieldCheck,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import SecurityModal from "@/components/SecurityModal";
import { API, UserProfile } from "@/lib/api";

export default function ProfilePage() {
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showSecurityModal, setShowSecurityModal] = useState(false);
  const [profileData, setProfileData] = useState<UserProfile | null>(null);

  // Helper to get initials from profile data
  const getInitials = (profile: UserProfile | null) => {
    if (!profile) return "??";
    
    // Try to get initials from full_name first
    const fullName = (profile as any).full_name;
    if (fullName) {
      const nameParts = fullName.trim().split(' ');
      if (nameParts.length >= 2) {
        return (nameParts[0][0] + nameParts[nameParts.length - 1][0]).toUpperCase();
      }
      return fullName.substring(0, 2).toUpperCase();
    }
    
    // Fallback to email
    const email = (profile as any).email;
    if (email) {
      const parts = email.split('@')[0].split('.');
      if (parts.length >= 2) {
        return (parts[0][0] + parts[1][0]).toUpperCase();
      }
      return email.substring(0, 2).toUpperCase();
    }
    
    return "??";
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        // Check token first
        const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') || localStorage.getItem('token') : null;
        if (!token) {
          window.location.href = '/auth';
          return;
        }

        console.log('[Profile] Fetching user profile...');
        const data = await API.profile.get();
        console.log('[Profile] Profile data received:', data);
        
        setProfileData(data);
      } catch (error) {
        console.error('[Profile] Failed to fetch profile:', error);
      } finally {
        setLoading(false);
        setMounted(true);
      }
    };

    fetchProfile();
  }, []);

  if (!mounted || loading) {
    return (
      <div className="min-h-screen bg-[#030712] text-white flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 text-indigo-500 animate-spin mx-auto" />
          <p className="text-slate-400 font-mono text-sm uppercase tracking-widest">Initializing Neural Link...</p>
        </div>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="min-h-screen bg-[#030712] text-white flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-red-400 font-mono text-sm">Failed to load profile data</p>
          <Link href="/dashboard" className="text-indigo-400 hover:text-indigo-300 text-sm">← Return to Dashboard</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#030712] text-white p-8 font-sans selection:bg-indigo-500/30">
      {/* Header */}
      <header className="flex justify-between items-center mb-12 border-b border-white/10 pb-6 mt-20">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 bg-indigo-500 rounded-full animate-pulse" />
          <h1 className="text-2xl font-bold tracking-[0.3em] text-transparent bg-clip-text bg-gradient-to-r from-white to-white/60">
            IDENTITY PARAMETERS
          </h1>
        </div>
        <Link href="/dashboard">
          <button className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-white transition-colors">
            ← Back to Command
          </button>
        </Link>
      </header>

      {/* Main Layout: Two Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN: Passport Card */}
        <motion.div
          initial={{ opacity: 0, x: -50, rotateY: -15 }}
          animate={{ opacity: 1, x: 0, rotateY: 0 }}
          transition={{ type: "spring", damping: 20, stiffness: 100 }}
          className="lg:col-span-1"
        >
          <div className="relative bg-gradient-to-br from-white/[0.07] to-white/[0.02] border border-white/10 rounded-3xl p-8 backdrop-blur-xl shadow-2xl">
            {/* Holographic Top Bar */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-t-3xl" />
            
            {/* Avatar */}
            <div className="flex justify-center mb-6 mt-4">
              <div className="relative">
                {/* Glow Effect */}
                <div className="absolute inset-0 bg-indigo-500/30 blur-2xl rounded-full" />
                
                {/* Avatar Circle */}
                <div className="relative w-32 h-32 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-2xl shadow-indigo-500/50 border-4 border-white/10">
                  <span className="text-4xl font-bold text-white tracking-wider">
                    {getInitials(profileData)}
                  </span>
                </div>
                
                {/* Verification Badge */}
                <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center shadow-xl border-4 border-[#030712]">
                  <CheckCircle2 className="w-5 h-5 text-white" />
                </div>
              </div>
            </div>

            {/* Name */}
            <h2 className="text-2xl font-bold text-center mb-2 tracking-tight">
              {(profileData as any)?.full_name || (profileData as any)?.email?.split('@')[0] || "Authorized Candidate"}
            </h2>
            <p className="text-center text-slate-500 text-sm font-mono mb-8">
              CANDIDATE ID: #{profileData.user_id?.toString().padStart(8, '0') || 'UNKNOWN'}
            </p>

            {/* Key Stats */}
            <div className="space-y-4 mb-8">
              {/* GPA Velocity */}
              <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                    <Award className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 font-mono">GPA VELOCITY</p>
                    <p className="text-xl font-bold text-emerald-400">{profileData.gpa?.toFixed(1) || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Budget Cap */}
              <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-yellow-500/10 flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-yellow-400" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 font-mono">BUDGET CAP</p>
                    <p className="text-xl font-bold text-yellow-400">
                      {profileData.budget ? `$${(profileData.budget / 1000).toFixed(0)}k` : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Edit Button */}
            <button
              onClick={() => setIsEditing(!isEditing)}
              className={`w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${
                isEditing
                  ? "bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20"
                  : "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 hover:bg-indigo-500/20"
              }`}
            >
              {isEditing ? (
                <>
                  <X className="w-4 h-4" /> Cancel Editing
                </>
              ) : (
                <>
                  <Edit3 className="w-4 h-4" /> Edit Parameters
                </>
              )}
            </button>

            {/* Security Protocols Button */}
            <button
              onClick={() => setShowSecurityModal(true)}
              className="w-full mt-3 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 border border-white/10 text-slate-300 hover:text-white hover:bg-white/5 hover:border-white/20 transition-all"
            >
              <ShieldCheck className="w-4 h-4" />
              Security Protocols
            </button>
          </div>
        </motion.div>

        {/* RIGHT COLUMN: Details Grid */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Section 1: Academic Trace */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white/[0.02] border border-white/[0.08] rounded-2xl p-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <GraduationCap className="w-5 h-5 text-indigo-400" />
              <h3 className="text-lg font-bold tracking-wider">ACADEMIC TRACE</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <DataField
                label="Degree Level"
                value={profileData.degree_level || 'Not Set'}
                isEditing={isEditing}
                onChange={(val) => setProfileData({ ...profileData, degree_level: val as any })}
              />
              <DataField
                label="Major / Specialization"
                value="Computer Science" // Not in backend model yet
                isEditing={isEditing}
                onChange={(val) => {}}
              />
              <DataField
                label="Backlogs"
                value="0" // Not in backend model yet
                isEditing={isEditing}
                onChange={(val) => {}}
              />
            </div>
          </motion.div>

          {/* Section 2: Examination Matrix */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/[0.02] border border-white/[0.08] rounded-2xl p-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <Award className="w-5 h-5 text-emerald-400" />
              <h3 className="text-lg font-bold tracking-wider">EXAMINATION MATRIX</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs text-slate-500 font-mono">IELTS SCORE</p>
                  {profileData.ielts_score && (
                    <div className="flex items-center gap-1 text-emerald-400">
                      <CheckCircle2 className="w-3 h-3" />
                      <span className="text-xs font-mono">VERIFIED</span>
                    </div>
                  )}
                </div>
                {isEditing ? (
                  <input
                    type="text"
                    value={profileData.ielts_score || ''}
                    onChange={(e) => setProfileData({ ...profileData, ielts_score: parseFloat(e.target.value) })}
                    className="w-full text-2xl font-bold bg-transparent border-b border-indigo-500 focus:outline-none"
                  />
                ) : (
                  <p className="text-2xl font-bold">{profileData.ielts_score?.toFixed(1) || 'Not Set'}</p>
                )}
              </div>

              <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs text-slate-500 font-mono">GRE SCORE</p>
                  {profileData.gre_score && (
                    <div className="flex items-center gap-1 text-emerald-400">
                      <CheckCircle2 className="w-3 h-3" />
                      <span className="text-xs font-mono">VERIFIED</span>
                    </div>
                  )}
                </div>
                {isEditing ? (
                  <input
                    type="text"
                    value={profileData.gre_score || ''}
                    onChange={(e) => setProfileData({ ...profileData, gre_score: parseInt(e.target.value) })}
                    className="w-full text-2xl font-bold bg-transparent border-b border-indigo-500 focus:outline-none"
                  />
                ) : (
                  <p className="text-2xl font-bold">{profileData.gre_score || 'Not Set'}</p>
                )}
              </div>
            </div>
          </motion.div>

          {/* Section 3: Target Constraints */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white/[0.02] border border-white/[0.08] rounded-2xl p-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <Globe className="w-5 h-5 text-purple-400" />
              <h3 className="text-lg font-bold tracking-wider">TARGET CONSTRAINTS</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <DataField
                label="Target Countries"
                value={profileData.target_country || 'Not Set'}
                isEditing={isEditing}
                onChange={(val) => setProfileData({ ...profileData, target_country: val })}
              />
              <DataField
                label="Intake Period"
                value="Fall 2025" // Not in backend model yet
                isEditing={isEditing}
                onChange={(val) => console.log('Intake changed:', val)}
                icon={<Calendar className="w-4 h-4 text-slate-400" />}
              />
            </div>
          </motion.div>

          {/* Save Button (Only shows when editing) */}
          <AnimatePresence>
            {isEditing && (
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                disabled={saving}
                onClick={async () => {
                  if (!profileData) return;
                  
                  setSaving(true);
                  try {
                    const updatedProfile = await API.profile.update({
                      gpa: profileData.gpa,
                      budget: profileData.budget,
                      degree_level: profileData.degree_level,
                      target_country: profileData.target_country,
                      ielts_score: profileData.ielts_score,
                      gre_score: profileData.gre_score,
                    });
                    setProfileData(updatedProfile);
                    setIsEditing(false);
                    console.log("✅ Profile saved successfully:", updatedProfile);
                  } catch (error) {
                    console.error("❌ Failed to save profile:", error);
                    alert("Failed to save profile. Please try again.");
                  } finally {
                    setSaving(false);
                  }
                }}
                className="w-full py-4 rounded-xl bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-500/50 text-white font-bold text-lg flex items-center justify-center gap-2 shadow-2xl shadow-emerald-500/30 transition-all"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    Save Changes
                  </>
                )}
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Security Modal */}
      <SecurityModal
        isOpen={showSecurityModal}
        onClose={() => setShowSecurityModal(false)}
      />
    </div>
  );
}

// Reusable Data Field Component
function DataField({
  label,
  value,
  isEditing,
  onChange,
  icon,
}: {
  label: string;
  value: string;
  isEditing: boolean;
  onChange: (val: string) => void;
  icon?: React.ReactNode;
}) {
  return (
    <div className="p-4 bg-white/5 rounded-xl border border-white/5">
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <p className="text-xs text-slate-500 font-mono uppercase">{label}</p>
      </div>
      {isEditing ? (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full text-lg font-semibold bg-transparent border-b border-indigo-500 focus:outline-none pb-1"
        />
      ) : (
        <p className="text-lg font-semibold">{value}</p>
      )}
    </div>
  );
}
