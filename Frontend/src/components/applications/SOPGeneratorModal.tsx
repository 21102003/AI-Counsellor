"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  X,
  Copy,
  CheckCircle2,
  Terminal,
  FileText,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface SOPGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (sopText: string) => void;
  universityName: string;
}

type Step = "INPUT" | "GENERATING" | "REVIEW";

interface FormData {
  motivation: string;
  keyProject: string;
  futureGoal: string;
}

export default function SOPGeneratorModal({
  isOpen,
  onClose,
  onComplete,
  universityName,
}: SOPGeneratorModalProps) {
  const [step, setStep] = useState<Step>("INPUT");
  const [formData, setFormData] = useState<FormData>({
    motivation: "",
    keyProject: "",
    futureGoal: "",
  });
  const [streamedText, setStreamedText] = useState("");
  const [fullText, setFullText] = useState("");
  const [isCopied, setIsCopied] = useState(false);
  const streamRef = useRef<NodeJS.Timeout | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Generate SOP content based on form data
  const generateSOPContent = (): string => {
    return `STATEMENT OF PURPOSE
${universityName} - Graduate Admission

${formData.motivation || "I am deeply passionate about pursuing advanced studies at " + universityName + " due to its world-class research facilities and distinguished faculty members."}

Throughout my academic journey, I have demonstrated commitment and excellence. ${formData.keyProject || "One of my most significant achievements was leading a cross-functional team project that resulted in innovative solutions to complex problems, showcasing my ability to collaborate and drive results."} This experience not only honed my technical skills but also revealed my capacity for leadership and creative problem-solving.

Looking ahead, ${formData.futureGoal || "my goal is to leverage cutting-edge research and industry collaboration to make meaningful contributions to my field. I envision myself working at the intersection of academia and industry, driving innovation that creates real-world impact."} The resources and opportunities at ${universityName} perfectly align with these aspirations.

The program's emphasis on hands-on learning, combined with access to state-of-the-art laboratories and industry partnerships, makes it the ideal environment for my growth. I am particularly excited about the possibility of working with distinguished faculty members whose research aligns with my interests.

My academic background, combined with my practical experience and unwavering dedication, has prepared me to thrive in this rigorous program. I am confident that ${universityName} will provide the perfect platform to achieve my academic and professional goals, and I am eager to contribute to the vibrant intellectual community.

I am committed to making the most of every opportunity, collaborating with peers from diverse backgrounds, and emerging as a well-rounded professional ready to tackle the challenges of tomorrow.`;
  };

  // Streaming effect
  useEffect(() => {
    if (step === "GENERATING" && fullText) {
      let index = 0;
      setStreamedText("");

      const typeNextChar = () => {
        if (index < fullText.length) {
          setStreamedText((prev) => prev + fullText[index]);
          index++;
          streamRef.current = setTimeout(typeNextChar, 15);
        } else {
          // Typing complete
          setTimeout(() => {
            setStep("REVIEW");
          }, 1000);
        }
      };

      typeNextChar();

      return () => {
        if (streamRef.current) clearTimeout(streamRef.current);
      };
    }
  }, [step, fullText]);

  const handleStartGeneration = () => {
    if (!formData.motivation.trim() || !formData.keyProject.trim() || !formData.futureGoal.trim()) {
      alert("Please fill in all fields before generating.");
      return;
    }

    const content = generateSOPContent();
    setFullText(content);
    setStep("GENERATING");
  };

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(fullText);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleAcceptDraft = () => {
    onComplete(fullText);
    onClose();
  };

  const handleClose = () => {
    setStep("INPUT");
    setFormData({ motivation: "", keyProject: "", futureGoal: "" });
    setStreamedText("");
    setFullText("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-md z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div
              className="bg-[#0a0a0f] border border-white/10 rounded-3xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden pointer-events-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="relative p-6 border-b border-white/10 bg-gradient-to-r from-indigo-500/10 to-violet-500/10">
                <button
                  onClick={handleClose}
                  className="absolute top-4 right-4 p-2 rounded-lg hover:bg-white/5 transition-colors"
                >
                  <X className="h-5 w-5 text-slate-400" />
                </button>

                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-indigo-500/20">
                    <Sparkles className="h-6 w-6 text-indigo-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">
                      Ghostwriter Protocol: SOP v1.0
                    </h2>
                    <p className="text-sm text-slate-400">{universityName}</p>
                  </div>
                </div>

                {/* Step Indicator */}
                <div className="flex gap-2 mt-4">
                  {["INPUT", "GENERATING", "REVIEW"].map((s, i) => (
                    <div
                      key={s}
                      className={`flex-1 h-1 rounded-full transition-all duration-300 ${
                        step === s
                          ? "bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.6)]"
                          : i < ["INPUT", "GENERATING", "REVIEW"].indexOf(step)
                          ? "bg-indigo-500/50"
                          : "bg-white/10"
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Content */}
              <div className="relative overflow-hidden">
                <AnimatePresence mode="wait">
                  {/* STEP 1: INPUT */}
                  {step === "INPUT" && (
                    <motion.div
                      key="input"
                      initial={{ x: 300, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      exit={{ x: -300, opacity: 0 }}
                      transition={{ type: "spring", damping: 25, stiffness: 200 }}
                      className="p-6 space-y-6"
                    >
                      <div className="space-y-4">
                        {/* Motivation */}
                        <div className="space-y-2">
                          <label className="text-xs font-mono text-slate-400 uppercase tracking-wider">
                            Why {universityName}?
                          </label>
                          <textarea
                            value={formData.motivation}
                            onChange={(e) =>
                              setFormData({ ...formData, motivation: e.target.value })
                            }
                            placeholder="Express your motivation to join this university..."
                            rows={3}
                            className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 resize-none"
                          />
                        </div>

                        {/* Key Project */}
                        <div className="space-y-2">
                          <label className="text-xs font-mono text-slate-400 uppercase tracking-wider">
                            Key Achievement / Project
                          </label>
                          <input
                            type="text"
                            value={formData.keyProject}
                            onChange={(e) =>
                              setFormData({ ...formData, keyProject: e.target.value })
                            }
                            placeholder="Describe one major accomplishment..."
                            className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                          />
                        </div>

                        {/* Future Goal */}
                        <div className="space-y-2">
                          <label className="text-xs font-mono text-slate-400 uppercase tracking-wider">
                            Post-Graduation Target
                          </label>
                          <input
                            type="text"
                            value={formData.futureGoal}
                            onChange={(e) =>
                              setFormData({ ...formData, futureGoal: e.target.value })
                            }
                            placeholder="What is your career goal after graduation?"
                            className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                          />
                        </div>
                      </div>

                      <Button
                        onClick={handleStartGeneration}
                        className="w-full h-14 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold rounded-xl shadow-[0_0_20px_rgba(99,102,241,0.4)] transition-all hover:scale-[1.02]"
                      >
                        <Zap className="mr-2 h-5 w-5" />
                        Initialize Generation
                      </Button>
                    </motion.div>
                  )}

                  {/* STEP 2: GENERATING */}
                  {step === "GENERATING" && (
                    <motion.div
                      key="generating"
                      initial={{ x: 300, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      exit={{ x: -300, opacity: 0 }}
                      transition={{ type: "spring", damping: 25, stiffness: 200 }}
                      className="p-6 space-y-4"
                    >
                      <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                        <Terminal className="h-5 w-5 text-emerald-400 animate-pulse" />
                        <span className="text-sm font-mono text-emerald-400">
                          Initializing Neural Net...
                        </span>
                      </div>

                      <div className="bg-black/40 border border-white/10 rounded-xl p-6 min-h-[400px] max-h-[500px] overflow-y-auto">
                        <pre className="font-mono text-sm text-emerald-400 whitespace-pre-wrap">
                          {streamedText}
                          <span className="animate-pulse">_</span>
                        </pre>
                      </div>
                    </motion.div>
                  )}

                  {/* STEP 3: REVIEW */}
                  {step === "REVIEW" && (
                    <motion.div
                      key="review"
                      initial={{ x: 300, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      exit={{ x: -300, opacity: 0 }}
                      transition={{ type: "spring", damping: 25, stiffness: 200 }}
                      className="p-6 space-y-4"
                    >
                      <div className="flex items-center justify-between p-4 rounded-xl bg-green-500/10 border border-green-500/20">
                        <div className="flex items-center gap-3">
                          <CheckCircle2 className="h-5 w-5 text-green-400" />
                          <span className="text-sm font-bold text-green-400">
                            Draft Complete
                          </span>
                        </div>
                        <button
                          onClick={handleCopyToClipboard}
                          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                        >
                          {isCopied ? (
                            <>
                              <CheckCircle2 className="h-4 w-4 text-green-400" />
                              <span className="text-xs text-green-400">Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="h-4 w-4 text-slate-400" />
                              <span className="text-xs text-slate-400">Copy</span>
                            </>
                          )}
                        </button>
                      </div>

                      <textarea
                        ref={textareaRef}
                        value={fullText}
                        onChange={(e) => setFullText(e.target.value)}
                        className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 resize-none min-h-[400px]"
                      />

                      <div className="flex gap-3">
                        <Button
                          onClick={handleClose}
                          variant="outline"
                          className="flex-1 h-12 rounded-xl border-white/10 text-slate-400 hover:bg-white/5"
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={handleAcceptDraft}
                          className="flex-1 h-12 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold rounded-xl"
                        >
                          <FileText className="mr-2 h-5 w-5" />
                          Accept Draft
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
