"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  X,
  Send,
  Loader2,
  BrainCircuit,
  MapPin,
  AlertCircle,
  ChevronDown,
} from "lucide-react";
import { usePathname } from "next/navigation";
import { useChat } from "@/hooks/useChat";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";

// Context mapping for different pages
const PAGE_CONTEXTS: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  "/discovery": {
    label: "Analyzing Marketplace Results",
    icon: MapPin,
    color: "text-emerald-400",
  },
  "/applications": {
    label: "Application Strategy Mode",
    icon: BrainCircuit,
    color: "text-blue-400",
  },
  "/counsellor": {
    label: "Deep Consultation Active",
    icon: Sparkles,
    color: "text-indigo-400",
  },
};

export default function GlobalAIChat() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [isHovered, setIsHovered] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { messages, isLoading, error, sendMessage, clearError } = useChat();

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 🚫 BLACKLIST: Pages where Chat should be HIDDEN
  // Check AFTER all hooks to avoid React Hooks order violation
  const hiddenRoutes = ['/', '/auth', '/login', '/signup', '/onboarding'];
  if (hiddenRoutes.includes(pathname) || pathname.startsWith('/auth')) {
    return null;
  }

  // Get current page context
  const currentContext = PAGE_CONTEXTS[pathname] || {
    label: "General Consultation",
    icon: Sparkles,
    color: "text-slate-400",
  };

  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return;

    const message = inputValue.trim();
    setInputValue("");
    await sendMessage(message);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Floating Trigger Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        className="fixed bottom-6 right-6 z-40 group"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {/* Pulsing Ring Animation */}
        <div className="absolute inset-0 rounded-full bg-indigo-500/30 animate-ping" />
        <div className="absolute inset-0 rounded-full bg-indigo-500/20 blur-xl" />

        {/* Main Button */}
        <div
          className={cn(
            "relative flex items-center gap-3 px-6 py-4 rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 shadow-2xl shadow-indigo-500/50 transition-all duration-300",
            isHovered && "pr-6"
          )}
        >
          <Sparkles className="h-6 w-6 text-white" />
          <AnimatePresence>
            {isHovered && (
              <motion.span
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: "auto", opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                className="text-white font-bold text-sm whitespace-nowrap overflow-hidden"
              >
                AI Online
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        {/* Active Indicator Dot */}
        {messages.length > 0 && (
          <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-green-500 border-2 border-white animate-pulse" />
        )}
      </motion.button>

      {/* Backdrop Blur */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
          />
        )}
      </AnimatePresence>

      {/* Slide-Over Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed top-0 right-0 h-screen w-full sm:w-[400px] bg-[#030712] border-l border-white/10 shadow-2xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="relative p-6 border-b border-white/10 bg-gradient-to-b from-indigo-500/5 to-transparent">
              <button
                onClick={() => setIsOpen(false)}
                className="absolute top-4 right-4 p-2 rounded-lg hover:bg-white/5 transition-colors"
              >
                <X className="h-5 w-5 text-slate-400" />
              </button>

              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-indigo-500/10">
                  <BrainCircuit className="h-6 w-6 text-indigo-400" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">AI Strategist</h2>
                  <p className="text-xs text-slate-500">Powered by Groq • Llama 3</p>
                </div>
              </div>

              {/* Context Chip */}
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/[0.03] border border-white/10">
                <currentContext.icon className={cn("h-4 w-4", currentContext.color)} />
                <span className="text-xs text-slate-300 font-medium">
                  Context: {currentContext.label}
                </span>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
                  <div className="p-4 rounded-full bg-indigo-500/10">
                    <Sparkles className="h-8 w-8 text-indigo-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white mb-2">AI Ready</h3>
                    <p className="text-sm text-slate-400 max-w-xs">
                      Ask me anything about universities, applications, or your strategy.
                    </p>
                  </div>
                </div>
              )}

              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "flex gap-3",
                    message.type === "user" ? "justify-end" : "justify-start"
                  )}
                >
                  {message.type === "ai" && (
                    <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                      <BrainCircuit className="h-4 w-4 text-indigo-400" />
                    </div>
                  )}

                  <div
                    className={cn(
                      "max-w-[85%] rounded-2xl px-4 py-3",
                      message.type === "user"
                        ? "bg-indigo-600 text-white"
                        : "bg-white/[0.03] border border-white/10 text-slate-200"
                    )}
                  >
                    {message.type === "ai" ? (
                      <div className="text-sm prose prose-invert prose-sm max-w-none prose-p:my-1 prose-ul:my-1 prose-li:my-0 prose-strong:text-indigo-300">
                        <ReactMarkdown>{message.content}</ReactMarkdown>
                      </div>
                    ) : (
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    )}

                    {/* University Artifact Card */}
                    {message.artifact && (
                      <div className="mt-3 p-3 rounded-xl bg-black/20 border border-white/10">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-bold text-white">
                            {message.artifact.flag} {message.artifact.name}
                          </span>
                          <span
                            className={cn(
                              "px-2 py-0.5 rounded-full text-[10px] font-bold",
                              message.artifact.type === "Target" &&
                                "bg-blue-500/20 text-blue-400",
                              message.artifact.type === "Reach" &&
                                "bg-orange-500/20 text-orange-400",
                              message.artifact.type === "Safe" &&
                                "bg-green-500/20 text-green-400"
                            )}
                          >
                            {message.artifact.type}
                          </span>
                        </div>
                        <div className="flex gap-4 text-xs text-slate-400">
                          <div>
                            <span className="text-slate-500">Cost:</span>{" "}
                            {message.artifact.cost}
                          </div>
                          <div>
                            <span className="text-slate-500">Accept:</span>{" "}
                            {message.artifact.acceptance}
                          </div>
                        </div>
                      </div>
                    )}

                    <span className="text-[10px] text-slate-500 mt-2 block">
                      {message.timestamp.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>

                  {message.type === "user" && (
                    <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white text-sm font-bold">
                      U
                    </div>
                  )}
                </div>
              ))}

              {/* Loading Indicator */}
              {isLoading && (
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                    <BrainCircuit className="h-4 w-4 text-indigo-400" />
                  </div>
                  <div className="bg-white/[0.03] border border-white/10 rounded-2xl px-4 py-3">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" />
                      <span
                        className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce"
                        style={{ animationDelay: "0.1s" }}
                      />
                      <span
                        className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce"
                        style={{ animationDelay: "0.2s" }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="flex items-start gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20">
                  <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm text-red-300">{error}</p>
                    <button
                      onClick={clearError}
                      className="text-xs text-red-400 hover:text-red-300 mt-1"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-white/10 bg-gradient-to-t from-black/20 to-transparent">
              <div className="flex gap-2">
                <textarea
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask the AI strategist..."
                  rows={1}
                  className="flex-1 bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 resize-none"
                  style={{ minHeight: "44px", maxHeight: "120px" }}
                />
                <button
                  onClick={handleSend}
                  disabled={!inputValue.trim() || isLoading}
                  className={cn(
                    "flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center transition-all",
                    inputValue.trim() && !isLoading
                      ? "bg-indigo-600 hover:bg-indigo-500 text-white"
                      : "bg-white/5 text-slate-600 cursor-not-allowed"
                  )}
                >
                  {isLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Send className="h-5 w-5" />
                  )}
                </button>
              </div>

              <p className="text-[10px] text-slate-600 mt-2 text-center">
                AI can make mistakes. Verify important information.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
