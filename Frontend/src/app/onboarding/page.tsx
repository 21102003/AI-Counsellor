"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Scroll, 
  GraduationCap, 
  Atom, 
  ArrowRight, 
  Loader2, 
  CheckCircle2, 
  ChevronRight,
  ShieldCheck,
  TrendingUp,
  Banknote,
  Activity
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { API, TokenStorage } from "@/lib/api";

// --- Types ---

type Degree = "bachelors" | "masters" | "phd" | null;

interface OnboardingData {
  degree: Degree;
  gpa: number;
  budget: string;
  targetCountry: string;
  exams: {
    ielts: number | null;
    gre: number | null;
  };
}

// --- Components ---

const ProgressIndicator = ({ step, onStepClick }: { step: number; onStepClick: (targetStep: number) => void }) => (
  <div className="w-full max-w-md mx-auto mb-12">
    <div className="flex justify-between gap-2 mb-3">
      {[1, 2, 3, 4].map((s) => (
        <button
          key={s}
          onClick={() => onStepClick(s)}
          className={cn(
            "h-1.5 flex-1 rounded-full transition-all duration-500 cursor-pointer hover:scale-105",
            s <= step ? "bg-indigo-600 shadow-[0_0_10px_rgba(79,70,229,0.4)]" : "bg-slate-200 hover:bg-slate-300"
          )}
          style={s === step ? { animation: "pulse 2s infinite" } : {}}
          aria-label={`Go to step ${s}`}
        />
      ))}
    </div>
    <p className="text-[10px] text-slate-500 uppercase tracking-widest text-center font-mono">
      System Calibration: Step {step} of 4
    </p>
  </div>
);

const CompletionOverlay = () => {
  const universities = [
    "Stanford University", "MIT", "Oxford", "ETH Zurich", "UCL", "NUS", "TUM", "Harvard", "Cambridge"
  ];
  const [currentUni, setCurrentUni] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentUni((prev) => (prev + 1) % universities.length);
    }, 150);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 bg-[#030712] flex flex-col items-center justify-center p-6">
    >
      <div className="absolute inset-0 bg-gradient-to-t from-indigo-950/30 to-transparent" />
      <div className="relative z-10 space-y-8 text-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="mx-auto"
        >
          <Activity className="h-12 w-12 text-indigo-400" />
        </motion.div>
        
        <div className="space-y-2">
          <h2 className="text-3xl font-bold text-white tracking-tight">Profile Locked.</h2>
          <p className="text-slate-400 font-mono text-sm">Generating Recommendations...</p>
        </div>

        <div className="h-20 flex items-center justify-center overflow-hidden border-y border-white/10 w-full max-w-xs mx-auto">
          <AnimatePresence mode="wait">
            <motion.p 
              key={currentUni}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              className="text-xl font-bold text-indigo-400 tracking-tighter"
            >
              {universities[currentUni]}
            </motion.p>
          </AnimatePresence>
        </div>

        <div className="flex gap-2 justify-center">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse delay-75" />
          <div className="w-2 h-2 rounded-full bg-teal-500 animate-pulse delay-150" />
        </div>
      </div>
    </motion.div>
  );
};

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isCompleting, setIsCompleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check authentication on mount
  useEffect(() => {
    if (!TokenStorage.isAuthenticated()) {
      router.push('/auth');
    }
  }, [router]);
  const [data, setData] = useState<OnboardingData>({
    degree: null,
    gpa: 3.5,
    budget: "",
    targetCountry: "",
    exams: {
      ielts: null,
      gre: null,
    }
  });

  const nextStep = () => {
    if (step < 4) setStep(prev => prev + 1);
  };

  const handleComplete = async () => {
    setIsCompleting(true);
    setError(null);
    
    // Check if authenticated before API call
    if (!TokenStorage.isAuthenticated()) {
      console.error("Not authenticated, redirecting to auth");
      setError("Authentication required. Redirecting...");
      router.push('/auth');
      return;
    }
    
    // Log token status
    const token = TokenStorage.get();
    console.log('Token exists:', !!token);
    console.log('Token preview:', token ? token.substring(0, 30) + '...' : 'NONE');
    
    try {
      // Prepare payload - only send fields with actual values
      const payload: any = {};
      
      if (data.degree) {
        payload.degree_level = data.degree;
      }
      
      if (data.gpa) {
        payload.gpa = Number(data.gpa);
      }
      
      if (data.budget) {
        payload.budget = parseInt(data.budget);
      }
      
      if (data.targetCountry) {
        payload.target_country = data.targetCountry;
      }
      
      if (data.exams.ielts !== null && data.exams.ielts > 0) {
        payload.ielts_score = Number(data.exams.ielts);
      }
      
      if (data.exams.gre !== null && data.exams.gre >= 260) {
        payload.gre_score = Number(data.exams.gre);
      }
      
      console.log('Sending profile update:', JSON.stringify(payload, null, 2));
      
      // Send profile data to backend
      const result = await API.profile.update(payload);
      console.log('Profile update successful:', result);

      setTimeout(() => {
        router.push("/discovery");
      }, 3500);
    } catch (error: any) {
      console.error("Failed to save profile:", error);
      console.error("Error type:", typeof error);
      console.error("Error keys:", Object.keys(error));
      console.error("Error response:", error?.response);
      console.error("Error message:", error?.message);
      console.error("Error status:", error?.status || error?.response?.status);
      
      // Extract validation errors
      if (error?.response?.data?.detail) {
        const detail = error.response.data.detail;
        if (Array.isArray(detail)) {
          // Pydantic validation errors
          const errorMessages = detail.map((err: any) => {
            const field = err.loc?.join('.') || 'Unknown field';
            return `${field}: ${err.msg}`;
          }).join(', ');
          setError(`Validation Error: ${errorMessages}`);
        } else {
          setError(detail);
        }
      } else if (error?.message) {
        setError(`Error: ${error.message}`);
      } else if (error?.isNetworkError) {
        setError("Network Error: Backend server is offline. Please check if the server is running.");
      } else {
        setError("Failed to save profile. Please check the console for details.");
      }
      
      // If 401, redirect to auth
      const status = error?.status || error?.response?.status;
      if (status === 401) {
        setError("Session expired. Redirecting to login...");
        setTimeout(() => router.push('/auth'), 1500);
      }
      
      setIsCompleting(false);
      
      // Auto-clear error after 5 seconds
      setTimeout(() => setError(null), 5000);
    }
  };

  const slideVariants = {
    initial: { x: 100, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: -100, opacity: 0 },
  };

  return (
    <div className="min-h-screen bg-[#030712] flex items-center justify-center p-6 overflow-hidden selection:bg-indigo-500/30">
      {/* Halo Effect */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] pointer-events-none">
        <div className="absolute inset-0 bg-indigo-600/10 blur-[120px] rounded-full animate-[spin_20s_linear_infinite]" />
        <div className="absolute inset-20 bg-violet-600/10 blur-[100px] rounded-full animate-[spin_15s_linear_infinite_reverse]" />
      </div>

      <div className="w-full max-w-2xl relative z-10">
        <ProgressIndicator step={step} onStepClick={(targetStep) => setStep(targetStep)} />

        <div className="relative min-h-[500px]">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div 
                key="step1"
                variants={slideVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="space-y-8"
              >
                <div className="text-center space-y-2">
                  <h1 className="text-4xl font-bold text-white tracking-tight">Let's define the target.</h1>
                  <p className="text-slate-400">What is the academic peak you are aiming for?</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { id: "bachelors" as Degree, icon: Scroll, label: "Bachelor's" },
                    { id: "masters" as Degree, icon: GraduationCap, label: "Master's", pulse: true },
                    { id: "phd" as Degree, icon: Atom, label: "PhD" },
                  ].map((item) => (
                    <button
                      key={item.id}
                      onClick={() => {
                        setData({ ...data, degree: item.id as Degree });
                        setTimeout(nextStep, 500);
                      }}
                      className={cn(
                        "relative group p-8 rounded-2xl bg-white/5 border border-white/10 shadow-sm transition-all duration-300 flex flex-col items-center gap-4 hover:border-indigo-500 hover:shadow-lg hover:shadow-indigo-500/20 backdrop-blur-sm",
                        data.degree === item.id && "border-indigo-500 bg-indigo-500/10 ring-1 ring-indigo-500 shadow-lg shadow-indigo-500/30",
                        item.pulse && !data.degree && "animate-pulse shadow-lg shadow-indigo-500/20"
                      )}
                    >
                      <item.icon className={cn(
                        "h-10 w-10 transition-colors duration-300",
                        data.degree === item.id ? "text-indigo-400" : "text-slate-300 group-hover:text-indigo-400"
                      )} />
                      <span className={cn(
                        "font-medium tracking-tight",
                        data.degree === item.id ? "text-white" : "text-slate-400 group-hover:text-white"
                      )}>
                        {item.label}
                      </span>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div 
                key="step2"
                variants={slideVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="space-y-12"
              >
                <div className="text-center space-y-2">
                  <h1 className="text-4xl font-bold text-white tracking-tight">Analyzing academic velocity.</h1>
                  <p className="text-slate-400">Your GPA tells us how high we can aim. Be honest—the AI adjusts risk accordingly.</p>
                </div>

                <div className="bg-white/5 border border-white/10 backdrop-blur-sm shadow-lg p-10 rounded-3xl space-y-10">
                  <div className="flex justify-between items-end">
                    <div className="space-y-1">
                      <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Current Metric</p>
                      <p className="text-5xl font-bold text-white tabular-nums">{data.gpa.toFixed(1)} <span className="text-xl text-slate-400">/ 4.0</span></p>
                    </div>
                    <div className={cn(
                      "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border",
                      data.gpa >= 3.5 ? "text-emerald-400 border-emerald-500/30 bg-emerald-500/10" :
                      data.gpa >= 3.0 ? "text-indigo-400 border-indigo-500/30 bg-indigo-500/10" :
                      "text-orange-400 border-orange-500/30 bg-orange-500/10"
                    )}>
                      {data.gpa >= 3.5 ? "Top 20% Universities Accessible" : 
                       data.gpa >= 3.0 ? "Solid Admission Potential" : 
                       "Strategy adjustment required"}
                    </div>
                  </div>

                  <Slider
                    defaultValue={[data.gpa]}
                    max={4}
                    step={0.1}
                    onValueChange={(val) => setData({ ...data, gpa: val[0] })}
                    className={cn(
                      "py-4",
                      data.gpa >= 3.5 ? "[&_[data-slot=slider-range]]:bg-emerald-500" :
                      data.gpa >= 3.0 ? "[&_[data-slot=slider-range]]:bg-indigo-600" :
                      "[&_[data-slot=slider-range]]:bg-orange-500",
                      "[&_[role=slider]]:bg-slate-200"
                    )}
                  />

                  <Button 
                    onClick={nextStep}
                    className="w-full h-14 bg-indigo-600 text-white hover:bg-indigo-700 transition-all rounded-2xl font-bold shadow-lg shadow-indigo-600/30"
                  >
                    Confirm & Continue
                    <ChevronRight className="ml-2 h-5 w-5" />
                  </Button>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div 
                key="step3"
                variants={slideVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="space-y-12"
              >
                <div className="text-center space-y-2">
                  <h1 className="text-4xl font-bold text-white tracking-tight">Setting financial parameters.</h1>
                  <p className="text-slate-400">We need a realistic boundary to filter out universities that drain your ROI.</p>
                </div>

                <div className="bg-white/5 border border-white/10 backdrop-blur-sm shadow-lg p-10 rounded-3xl space-y-10">
                  <div className="space-y-4">
                    <label className="text-xs font-mono text-slate-500 uppercase tracking-widest ml-1">Annual Budget ($)</label>
                    <div className="relative">
                      <Banknote className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                      <input 
                        type="number"
                        placeholder="e.g. 35000"
                        value={data.budget}
                        onChange={(e) => setData({ ...data, budget: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl h-16 pl-12 pr-6 text-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all placeholder:text-slate-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    {[
                      { 
                        label: "Scholarship Heavy", 
                        active: Number(data.budget) > 0 && Number(data.budget) < 15000,
                        color: "bg-orange-500"
                      },
                      { 
                        label: "Balanced Strategy", 
                        active: Number(data.budget) >= 15000 && Number(data.budget) <= 40000,
                        color: "bg-blue-500"
                      },
                      { 
                        label: "Wide Open Strategy", 
                        active: Number(data.budget) > 40000,
                        color: "bg-emerald-500"
                      },
                    ].map((status) => (
                      <div key={status.label} className="flex flex-col items-center gap-3">
                        <div className={cn(
                          "w-3 h-3 rounded-full transition-all duration-500",
                          status.active ? status.color + " shadow-[0_0_10px_currentColor]" : "bg-slate-200"
                        )} />
                        <span className={cn(
                          "text-[9px] uppercase tracking-tighter text-center",
                          status.active ? "text-white font-bold" : "text-slate-600"
                        )}>
                          {status.label}
                        </span>
                      </div>
                    ))}
                  </div>

                  <Button 
                    onClick={nextStep}
                    disabled={!data.budget}
                    className="w-full h-14 bg-indigo-600 text-white hover:bg-indigo-700 transition-all rounded-2xl font-bold shadow-lg shadow-indigo-600/30 disabled:opacity-50"
                  >
                    Confirm & Continue
                    <ChevronRight className="ml-2 h-5 w-5" />
                  </Button>
                </div>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div 
                key="step4"
                variants={slideVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="space-y-12"
              >
                <div className="text-center space-y-2">
                  <h1 className="text-4xl font-bold text-white tracking-tight">Running constraints check...</h1>
                  <p className="text-slate-400">Final verification of standardized test assets.</p>
                </div>

                <div className="bg-white/5 border border-white/10 backdrop-blur-sm shadow-lg p-10 rounded-3xl space-y-8">
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <label className="text-xs font-mono text-slate-500 uppercase tracking-widest ml-1">Target Country</label>
                      <select
                        value={data.targetCountry}
                        onChange={(e) => setData({ ...data, targetCountry: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl h-14 px-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent [&>option]:bg-[#0B1120] [&>option]:text-white"
                      >
                        <option value="">Select Country</option>
                        <option value="USA">USA</option>
                        <option value="UK">UK</option>
                        <option value="Canada">Canada</option>
                        <option value="Germany">Germany</option>
                        <option value="Australia">Australia</option>
                      </select>
                    </div>

                    <div className="space-y-4">
                      <label className="text-xs font-mono text-slate-500 uppercase tracking-widest ml-1">IELTS Score (optional)</label>
                      <input 
                        type="number"
                        step="0.5"
                        min="0"
                        max="9"
                        placeholder="e.g. 7.5"
                        value={data.exams.ielts || ""}
                        onChange={(e) => setData({ 
                          ...data, 
                          exams: { ...data.exams, ielts: e.target.value ? parseFloat(e.target.value) : null }
                        })}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl h-14 px-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent placeholder:text-slate-500"
                      />
                    </div>

                    <div className="space-y-4">
                      <label className="text-xs font-mono text-slate-500 uppercase tracking-widest ml-1">GRE Score (optional)</label>
                      <input 
                        type="number"
                        min="260"
                        max="340"
                        placeholder="e.g. 320"
                        value={data.exams.gre || ""}
                        onChange={(e) => setData({ 
                          ...data, 
                          exams: { ...data.exams, gre: e.target.value ? parseInt(e.target.value) : null }
                        })}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl h-14 px-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent placeholder:text-slate-500"
                      />
                    </div>
                  </div>

                  <Button 
                    onClick={handleComplete}
                    disabled={isCompleting}
                    className="w-full h-16 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white hover:scale-[1.01] transition-all rounded-2xl font-bold text-lg shadow-lg"
                  >
                    {isCompleting ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Initializing Strategy Engine...
                      </>
                    ) : (
                      <>
                        Complete Setup
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </>
                    )}
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <AnimatePresence>
        {isCompleting && <CompletionOverlay />}
      </AnimatePresence>

      {/* Error Toast */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 w-full max-w-md p-4 bg-red-500/10 border border-red-500/30 backdrop-blur-xl rounded-xl flex items-start gap-3 text-red-400 text-sm shadow-xl z-50"
          >
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse mt-1" />
            <div className="flex-1">
              <p className="font-medium mb-1">Validation Error</p>
              <p className="text-xs text-red-300">{error}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx global>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.98); }
        }
      `}</style>
    </div>
  );
}
