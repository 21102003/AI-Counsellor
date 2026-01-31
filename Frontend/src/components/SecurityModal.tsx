"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ShieldCheck, Mail, Lock, AlertTriangle } from "lucide-react";

interface SecurityModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type TabType = "email" | "password";

export default function SecurityModal({ isOpen, onClose }: SecurityModalProps) {
  const [activeTab, setActiveTab] = useState<TabType>("password");
  
  // Email State
  const [newEmail, setNewEmail] = useState("");
  
  // Password State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState(false);

  const handlePasswordSubmit = () => {
    if (newPassword !== confirmPassword) {
      setPasswordError(true);
      setTimeout(() => setPasswordError(false), 2000);
      return;
    }
    
    // TODO: API call to update password
    console.log("Updating password...");
    onClose();
  };

  const handleEmailSubmit = () => {
    // TODO: API call to update email
    console.log("Updating email to:", newEmail);
    onClose();
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
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] flex items-center justify-center p-6"
          >
            {/* Modal Content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="relative bg-gradient-to-br from-[#0a0a0f]/95 to-[#050508]/95 border border-white/10 rounded-3xl shadow-2xl p-8 max-w-md w-full backdrop-blur-xl"
            >
              {/* Top Accent Bar */}
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 rounded-t-3xl" />

              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-6 right-6 w-8 h-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 transition-colors"
              >
                <X className="w-4 h-4 text-slate-400" />
              </button>

              {/* Header */}
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5 text-red-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold tracking-wider">ACCESS CONTROL</h2>
                  <p className="text-xs text-slate-500 font-mono">SECURITY SETTINGS</p>
                </div>
              </div>

              {/* Segmented Control (Tabs) */}
              <div className="flex gap-2 p-1 bg-white/5 rounded-xl mb-6">
                <button
                  onClick={() => setActiveTab("email")}
                  className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                    activeTab === "email"
                      ? "bg-white/10 text-white"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <Mail className="w-4 h-4 inline mr-2" />
                  Update Email
                </button>
                <button
                  onClick={() => setActiveTab("password")}
                  className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                    activeTab === "password"
                      ? "bg-white/10 text-white"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <Lock className="w-4 h-4 inline mr-2" />
                  Change Password
                </button>
              </div>

              {/* Tab Content */}
              <AnimatePresence mode="wait">
                {activeTab === "email" ? (
                  <motion.div
                    key="email"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.2 }}
                  >
                    {/* Email Form */}
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs text-slate-400 font-mono mb-2 uppercase">
                          New Email Address
                        </label>
                        <input
                          type="email"
                          value={newEmail}
                          onChange={(e) => setNewEmail(e.target.value)}
                          placeholder="user@example.com"
                          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500/50 transition-colors"
                        />
                      </div>

                      {/* Warning */}
                      <div className="flex items-start gap-3 p-4 bg-yellow-500/5 border border-yellow-500/20 rounded-xl">
                        <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm text-yellow-200 font-medium mb-1">Verification Required</p>
                          <p className="text-xs text-yellow-300/70">
                            Changing your email requires re-verification. You'll receive a confirmation link.
                          </p>
                        </div>
                      </div>

                      {/* Submit Button */}
                      <button
                        onClick={handleEmailSubmit}
                        disabled={!newEmail}
                        className="w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 disabled:from-slate-700 disabled:to-slate-800 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all shadow-lg shadow-indigo-500/20 disabled:shadow-none"
                      >
                        Update Email Address
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="password"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                  >
                    {/* Password Form */}
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs text-slate-400 font-mono mb-2 uppercase">
                          Current Password
                        </label>
                        <input
                          type="password"
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500/50 transition-colors"
                        />
                      </div>

                      <div>
                        <label className="block text-xs text-slate-400 font-mono mb-2 uppercase">
                          New Password
                        </label>
                        <motion.input
                          type="password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="••••••••"
                          animate={passwordError ? { x: [-10, 10, -10, 10, 0] } : {}}
                          transition={{ duration: 0.4 }}
                          className={`w-full px-4 py-3 bg-white/5 border rounded-xl text-white placeholder-slate-600 focus:outline-none transition-colors ${
                            passwordError
                              ? "border-red-500 ring-2 ring-red-500/20"
                              : "border-white/10 focus:border-indigo-500/50"
                          }`}
                        />
                      </div>

                      <div>
                        <label className="block text-xs text-slate-400 font-mono mb-2 uppercase">
                          Confirm New Password
                        </label>
                        <motion.input
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="••••••••"
                          animate={passwordError ? { x: [-10, 10, -10, 10, 0] } : {}}
                          transition={{ duration: 0.4 }}
                          className={`w-full px-4 py-3 bg-white/5 border rounded-xl text-white placeholder-slate-600 focus:outline-none transition-colors ${
                            passwordError
                              ? "border-red-500 ring-2 ring-red-500/20"
                              : "border-white/10 focus:border-indigo-500/50"
                          }`}
                        />
                      </div>

                      {/* Error Message */}
                      <AnimatePresence>
                        {passwordError && (
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="flex items-center gap-2 text-red-400 text-sm font-medium"
                          >
                            <AlertTriangle className="w-4 h-4" />
                            Passwords do not match
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Submit Button */}
                      <button
                        onClick={handlePasswordSubmit}
                        disabled={!currentPassword || !newPassword || !confirmPassword}
                        className="w-full py-3 bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 hover:from-red-600 hover:via-orange-600 hover:to-yellow-600 disabled:from-slate-700 disabled:to-slate-800 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all shadow-lg shadow-orange-500/30 disabled:shadow-none"
                      >
                        Update Credentials
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
