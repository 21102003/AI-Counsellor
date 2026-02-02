"use client";

import React, { useState } from "react";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import { ArrowLeft, Trash2, Lock, Loader2, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { ProtectedRoute } from "@/lib/auth-context";
import { useShortlist } from "@/lib/shortlist-context";
import { UniversitySuperCard } from "../components";
import { Button } from "@/components/ui/button";
import { API, University } from "@/lib/api";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

export default function ReviewShortlistPage() {
  const router = useRouter();
  const { shortlist, removeFromShortlist, clearShortlist } = useShortlist();
  const [selectedUniForLock, setSelectedUniForLock] = useState<University | null>(null);
  const [isLocking, setIsLocking] = useState(false);

  const handleLockUniversity = async () => {
    if (!selectedUniForLock) return;

    setIsLocking(true);
    try {
      await API.universities.lock(selectedUniForLock.id);
      // Clear the shortlist after successful lock
      clearShortlist();
      // Redirect to applications page
      window.location.href = "/applications";
    } catch (error) {
      console.error("Failed to lock university:", error);
      setIsLocking(false);
      setSelectedUniForLock(null);
    }
  };

  const handleRemoveFromShortlist = (uni: University) => {
    removeFromShortlist(uni.id);
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[#030712] text-slate-400 font-sans selection:bg-indigo-500/30">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-black/40 backdrop-blur-md border-b border-white/5">
          <div className="px-4 md:px-8 py-4 md:py-6">
            <div className="flex items-center justify-between mb-4">
              <Button
                variant="ghost"
                size="sm"
                className="text-slate-400 hover:text-white hover:bg-white/5 text-xs md:text-sm h-8 md:h-9"
                onClick={() => router.push("/discovery")}
              >
                <ArrowLeft className="w-3 md:w-4 h-3 md:h-4 mr-1 md:mr-2" />
                Back
              </Button>

              {shortlist.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 text-xs md:text-sm h-8 md:h-9"
                  onClick={clearShortlist}
                >
                  <Trash2 className="w-3 md:w-4 h-3 md:h-4 mr-1 md:mr-2" />
                  Clear
                </Button>
              )}
            </div>

            <div>
              <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight mb-2">
                Your Shortlist
              </h1>
              <p className="text-xs md:text-sm text-slate-500">
                Review and commit to your final target university.
              </p>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="px-4 md:px-8 py-6 md:py-12 pb-24 md:pb-12">
          <div className="max-w-7xl mx-auto">
            {shortlist.length > 0 ? (
              <>
                {/* Stats Bar */}
                <div className="mb-6 md:mb-8 p-4 rounded-xl bg-white/[0.03] border border-white/5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="flex items-center gap-4 md:gap-6 flex-wrap">
                    <div>
                      <span className="text-[10px] font-mono uppercase tracking-widest text-slate-500 block mb-1">
                        Total Selected
                      </span>
                      <span className="text-xl md:text-2xl font-bold text-white">
                        {shortlist.length} {shortlist.length === 1 ? "University" : "Universities"}
                      </span>
                    </div>
                    <div className="h-8 md:h-10 w-px bg-white/10" />
                    <div>
                      <span className="text-[10px] font-mono uppercase tracking-widest text-slate-500 block mb-1">
                        Avg. Tuition
                      </span>
                      <span className="text-xl md:text-2xl font-bold text-white">
                        ${Math.round(
                          shortlist.reduce((sum, uni) => sum + uni.tuition_fee, 0) /
                            shortlist.length
                        ).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 px-3 md:px-4 py-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20 w-full md:w-auto">
                    <AlertCircle className="w-3 md:w-4 h-3 md:h-4 text-indigo-400" />
                    <span className="text-[10px] md:text-xs text-indigo-300 font-medium">
                      Ready to lock
                    </span>
                  </div>
                </div>

                {/* University Grid */}
                <LayoutGroup>
                  <motion.div
                    layout
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                  >
                    <AnimatePresence mode="popLayout">
                      {shortlist.map((uni) => (
                        <UniversitySuperCard
                          key={uni.id}
                          university={uni}
                          onLock={setSelectedUniForLock}
                          onShortlist={handleRemoveFromShortlist}
                          isShortlisted={true}
                          showRemoveButton={true}
                        />
                      ))}
                    </AnimatePresence>
                  </motion.div>
                </LayoutGroup>
              </>
            ) : (
              /* Empty State */
              <div className="flex flex-col items-center justify-center py-12 md:py-20 text-center px-4">
                <div className="w-16 md:w-20 h-16 md:h-20 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-4 md:mb-6">
                  <Lock className="w-8 md:w-10 h-8 md:h-10 text-slate-600" />
                </div>
                <h3 className="text-xl md:text-2xl font-bold text-white mb-2 md:mb-3">
                  No Universities Shortlisted
                </h3>
                <p className="text-xs md:text-sm text-slate-500 max-w-md mb-6 md:mb-8">
                  Explore universities and add favorites to your shortlist.
                </p>
                <Button
                  className="bg-white text-black hover:bg-white/90 font-bold px-6 md:px-8 h-10 md:h-11 text-sm"
                  onClick={() => router.push("/discovery")}
                >
                  <ArrowLeft className="w-3 md:w-4 h-3 md:h-4 mr-2" />
                  Return to Discovery
                </Button>
              </div>
            )}
          </div>
        </main>

        {/* Lock Confirmation Dialog */}
        <Dialog open={!!selectedUniForLock && !isLocking} onOpenChange={() => setSelectedUniForLock(null)}>
          <DialogContent className="bg-[#030712] border-white/10 text-slate-400 max-w-[90vw] md:max-w-md mx-4">
            <DialogHeader>
              <div className="w-10 md:w-12 h-10 md:h-12 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-3 md:mb-4">
                <Lock className="w-5 md:w-6 h-5 md:h-6 text-amber-500" />
              </div>
              <DialogTitle className="text-lg md:text-xl font-bold text-white tracking-tight">
                Confirm Strategy Lock?
              </DialogTitle>
              <DialogDescription className="text-slate-400 text-xs md:text-sm py-2">
                Locking <span className="text-white font-bold">{selectedUniForLock?.name}</span> will
                generate your specific application roadmap. This action signals intent and allocates AI
                resources to this target.
              </DialogDescription>
            </DialogHeader>
            <div className="p-3 md:p-4 bg-white/5 border border-white/10 rounded-xl space-y-2 md:space-y-3">
              <div className="flex justify-between items-center text-[10px] md:text-xs">
                <span className="text-slate-500">Target Semester</span>
                <span className="text-white font-mono">FALL 2026</span>
              </div>
              <div className="flex justify-between items-center text-[10px] md:text-xs">
                <span className="text-slate-500">Strategy Complexity</span>
                <span className="text-amber-400 font-mono">HIGH (TARGET)</span>
              </div>
            </div>
            <DialogFooter className="mt-4 md:mt-6 flex gap-2 md:gap-3">
              <Button
                variant="ghost"
                className="flex-1 hover:bg-white/5 border border-transparent hover:border-white/5 text-sm h-10"
                onClick={() => setSelectedUniForLock(null)}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 bg-white text-black font-bold hover:bg-white/90 shadow-[0_0_20px_rgba(255,255,255,0.1)] text-sm h-10"
                onClick={handleLockUniversity}
              >
                Execute Lock
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Locking Overlay */}
        {isLocking && (
          <div className="fixed inset-0 bg-[#030712]/90 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="w-12 h-12 text-indigo-500 animate-spin" />
              <p className="text-white text-lg font-bold">Locking Target...</p>
              <p className="text-slate-400 text-sm font-mono">Generating your application strategy</p>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
