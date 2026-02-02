"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Loader2, CheckCircle2, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { ProtectedRoute } from "@/lib/auth-context";
import { API } from "@/lib/api";
import { Button } from "@/components/ui/button";

interface Message {
  id: string;
  role: "ai" | "user";
  content: string;
}

type Step = "degree" | "gpa" | "budget" | "country" | "processing" | "complete";

export default function AIInterviewPage() {
  const router = useRouter();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [currentStep, setCurrentStep] = useState<Step>("degree");
  const [isTyping, setIsTyping] = useState(false);
  const [isSending, setIsSending] = useState(false);

  // Profile data being collected
  const [profileData, setProfileData] = useState({
    degree: "",
    gpa: 0,
    budget: "",
    targetCountry: ""
  });

  // Question templates for each step
  const questions: Record<Step, string> = {
    degree: "Welcome to your personalized strategy session. Let's build your master plan. First, are you aiming for a **Bachelor's**, **Master's**, or **PhD**?",
    gpa: "Understood. What is your current **GPA** (on a 4.0 or 10.0 scale)?",
    budget: "Got it. What is your maximum annual **Budget** for tuition in USD? (e.g., 30000)",
    country: "Finally, do you have a specific **Target Country** (e.g., USA, UK, Canada, Germany)? If not, say 'Any'.",
    processing: "Processing your profile...",
    complete: "✅ Profile Locked Successfully!"
  };

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // Start with first question
  useEffect(() => {
    setTimeout(() => {
      addAIMessage(questions.degree);
    }, 500);
  }, []);

  const addAIMessage = (content: string) => {
    setIsTyping(true);
    setTimeout(() => {
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: "ai",
        content
      }]);
      setIsTyping(false);
    }, 1000); // Simulate typing delay
  };

  const addUserMessage = (content: string) => {
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      role: "user",
      content
    }]);
  };

  const parseUserInput = (input: string, step: Step): boolean => {
    const trimmed = input.trim().toLowerCase();

    switch (step) {
      case "degree":
        if (trimmed.includes("bachelor") || trimmed.includes("bs") || trimmed.includes("bsc")) {
          setProfileData(prev => ({ ...prev, degree: "bachelors" }));
          return true;
        } else if (trimmed.includes("master") || trimmed.includes("ms") || trimmed.includes("msc")) {
          setProfileData(prev => ({ ...prev, degree: "masters" }));
          return true;
        } else if (trimmed.includes("phd") || trimmed.includes("doctorate")) {
          setProfileData(prev => ({ ...prev, degree: "phd" }));
          return true;
        }
        return false;

      case "gpa":
        const gpaMatch = input.match(/(\d+\.?\d*)/);
        if (gpaMatch) {
          const gpaValue = parseFloat(gpaMatch[1]);
          if (gpaValue >= 0 && gpaValue <= 10) {
            // Convert to 4.0 scale if needed
            const normalized = gpaValue > 4 ? (gpaValue / 10) * 4 : gpaValue;
            setProfileData(prev => ({ ...prev, gpa: normalized }));
            return true;
          }
        }
        return false;

      case "budget":
        const budgetMatch = input.match(/(\d+)/);
        if (budgetMatch) {
          setProfileData(prev => ({ ...prev, budget: budgetMatch[1] }));
          return true;
        }
        return false;

      case "country":
        if (trimmed === "any" || trimmed === "anywhere" || trimmed === "no preference") {
          setProfileData(prev => ({ ...prev, targetCountry: "Any" }));
        } else {
          setProfileData(prev => ({ ...prev, targetCountry: input.trim() }));
        }
        return true;

      default:
        return false;
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isSending) return;

    const userInput = input.trim();
    setInput("");
    setIsSending(true);

    // Add user message
    addUserMessage(userInput);

    // Process based on current step
    const isValid = parseUserInput(userInput, currentStep);

    if (!isValid && currentStep !== "country") {
      // Invalid input, ask again
      setTimeout(() => {
        addAIMessage("I didn't quite catch that. " + questions[currentStep]);
        setIsSending(false);
      }, 800);
      return;
    }

    // Move to next step
    await new Promise(resolve => setTimeout(resolve, 1000));

    if (currentStep === "degree") {
      setCurrentStep("gpa");
      addAIMessage(questions.gpa);
    } else if (currentStep === "gpa") {
      setCurrentStep("budget");
      addAIMessage(questions.budget);
    } else if (currentStep === "budget") {
      setCurrentStep("country");
      addAIMessage(questions.country);
    } else if (currentStep === "country") {
      // All questions answered, process profile
      setCurrentStep("processing");
      addAIMessage(questions.processing);

      // Submit to backend
      try {
        await API.profile.update({
          degree_level: profileData.degree,
          gpa: profileData.gpa,
          budget: parseInt(profileData.budget),
          target_country: profileData.targetCountry
        });

        setTimeout(() => {
          setCurrentStep("complete");
          addAIMessage(questions.complete);

          // Redirect to discovery after 2 seconds
          setTimeout(() => {
            router.push("/discovery");
          }, 2000);
        }, 2000);
      } catch (error) {
        console.error("Failed to save profile:", error);
        addAIMessage("There was an error saving your profile. Please try again or use manual configuration.");
        setCurrentStep("degree");
      }
    }

    setIsSending(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[#030712] flex flex-col">
        {/* Header */}
        <header className="border-b border-white/5 bg-black/40 backdrop-blur-md">
          <div className="px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-indigo-400" />
              </div>
              <div>
                <h1 className="text-sm font-bold text-white uppercase tracking-widest">AI Interview</h1>
                <p className="text-[10px] text-slate-500 font-mono">Profile Calibration Protocol</p>
              </div>
            </div>

            <button
              onClick={() => router.push("/onboarding/welcome")}
              className="text-xs text-slate-500 hover:text-slate-400 transition-colors"
            >
              ← Back
            </button>
          </div>
        </header>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto px-4 md:px-6 py-8 custom-scrollbar">
          <div className="max-w-3xl mx-auto space-y-6">
            <AnimatePresence mode="popLayout">
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] md:max-w-[70%] rounded-2xl px-4 py-3 ${
                      message.role === "user"
                        ? "bg-indigo-600 text-white"
                        : "bg-white/5 border border-white/10 text-slate-300"
                    }`}
                  >
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">
                      {message.content}
                    </p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Typing Indicator */}
            {isTyping && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-start"
              >
                <div className="bg-white/5 border border-white/10 rounded-2xl px-4 py-3">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </motion.div>
            )}

            {/* Processing Animation */}
            {currentStep === "processing" && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex justify-center py-8"
              >
                <div className="text-center">
                  <Loader2 className="w-10 h-10 text-indigo-500 animate-spin mx-auto mb-4" />
                  <p className="text-slate-400 text-sm font-mono">Analyzing profile data...</p>
                </div>
              </motion.div>
            )}

            {/* Success Animation */}
            {currentStep === "complete" && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex justify-center py-8"
              >
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                  </div>
                  <p className="text-white font-bold text-lg mb-2">Profile Locked!</p>
                  <p className="text-slate-400 text-sm">Redirecting to Discovery Dashboard...</p>
                </div>
              </motion.div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area */}
        {currentStep !== "processing" && currentStep !== "complete" && (
          <div className="border-t border-white/5 bg-black/40 backdrop-blur-md p-4">
            <div className="max-w-3xl mx-auto flex gap-3">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your answer..."
                disabled={isSending || isTyping}
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 disabled:opacity-50"
              />
              <Button
                onClick={handleSend}
                disabled={!input.trim() || isSending || isTyping}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 rounded-xl disabled:opacity-50"
              >
                {isSending ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </Button>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
