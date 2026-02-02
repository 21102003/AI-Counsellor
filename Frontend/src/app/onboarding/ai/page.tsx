"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Loader2, CheckCircle2, Sparkles, Bot, Mic, MicOff, Volume2, VolumeX } from "lucide-react";
import { useRouter } from "next/navigation";
import { API, TokenStorage } from "@/lib/api";
import { cn } from "@/lib/utils";

interface Message {
  id: number;
  role: "ai" | "user";
  content: string;
}

interface ProfileData {
  degree: string;
  gpa: number;
  ielts?: number | null;
  gre?: number | null;
  budget: number;
  country: string;
}

export default function AIOnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const messageIdCounter = useRef(0);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: ++messageIdCounter.current,
      role: "ai",
      content: "Hello! I am your admissions strategist. Let's build your profile. First, are you aiming for a Bachelor's, Master's, or PhD?"
    }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [profileData, setProfileData] = useState<Partial<ProfileData>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Voice interaction states
  const [isMuted, setIsMuted] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  // Initialize Speech Recognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = 'en-US';

        recognitionRef.current.onresult = (event: any) => {
          const transcript = Array.from(event.results)
            .map((result: any) => result[0])
            .map((result: any) => result.transcript)
            .join('');
          setInput(transcript);
        };

        recognitionRef.current.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error);
          setIsListening(false);
        };
      }
      synthRef.current = window.speechSynthesis;
    }
  }, []);

  // Check authentication on mount
  useEffect(() => {
    if (!TokenStorage.isAuthenticated()) {
      router.push('/auth');
    }
  }, [router]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // Text-to-Speech for AI messages
  useEffect(() => {
    if (!isMuted && messages.length > 0 && synthRef.current) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.role === "ai" && !isTyping) {
        speakText(lastMessage.content);
      }
    }
  }, [messages, isTyping, isMuted]);

  const speakText = (text: string) => {
    if (!synthRef.current || isMuted) return;
    
    // Cancel any ongoing speech
    synthRef.current.cancel();

    // Clean markdown from text
    const cleanText = text.replace(/\*\*/g, '');

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 0.95;
    utterance.pitch = 1;
    utterance.volume = 1;

    // Try to select a professional English voice
    const voices = synthRef.current.getVoices();
    const preferredVoice = voices.find(voice => 
      voice.lang.startsWith('en') && 
      (voice.name.includes('Google') || voice.name.includes('Microsoft') || voice.name.includes('Samantha'))
    );
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    synthRef.current.speak(utterance);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (!isMuted && synthRef.current) {
      synthRef.current.cancel();
    }
  };

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition is not supported in your browser.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      setIsListening(true);
      setInput('');
      recognitionRef.current.start();
    }
  };

  const addAIMessage = (content: string) => {
    setIsTyping(true);
    setTimeout(() => {
      setMessages(prev => [...prev, {
        id: ++messageIdCounter.current,
        role: "ai",
        content
      }]);
      setIsTyping(false);
    }, 800);
  };

  const addUserMessage = (content: string) => {
    setMessages(prev => [...prev, {
      id: ++messageIdCounter.current,
      role: "user",
      content
    }]);
  };

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || isTyping || isProcessing) return;

    const userInput = input.trim();
    setInput("");
    addUserMessage(userInput);

    // Process based on current step
    setTimeout(() => {
      processUserInput(userInput);
    }, 1000);
  };

  const processUserInput = (userInput: string) => {
    const lowerInput = userInput.toLowerCase();

    switch (step) {
      case 0: // Degree Step
        if (lowerInput.includes("bachelor")) {
          setProfileData(prev => ({ ...prev, degree: "bachelors" }));
          setStep(1);
          addAIMessage("Understood. What is your current GPA? For example, 3.5 or 8.5");
        } else if (lowerInput.includes("master")) {
          setProfileData(prev => ({ ...prev, degree: "masters" }));
          setStep(1);
          addAIMessage("Understood. What is your current GPA? For example, 3.5 or 8.5");
        } else if (lowerInput.includes("phd") || lowerInput.includes("doctorate")) {
          setProfileData(prev => ({ ...prev, degree: "phd" }));
          setStep(1);
          addAIMessage("Understood. What is your current GPA? For example, 3.5 or 8.5");
        } else {
          addAIMessage("I need to know if you're targeting a Bachelor's, Master's, or PhD degree. Please specify.");
        }
        break;

      case 1: // GPA Step
        const gpaMatch = userInput.match(/\d+\.?\d*/);
        if (gpaMatch) {
          const gpa = parseFloat(gpaMatch[0]);
          if (gpa >= 0 && gpa <= 10) {
            setProfileData(prev => ({ ...prev, gpa }));
            setStep(2);
            addAIMessage("Got it. Do you have an IELTS score? Please answer Yes or No.");
          } else {
            addAIMessage("That GPA seems unusual. Please enter a value between 0 and 10.");
          }
        } else {
          addAIMessage("I couldn't parse that GPA. Please enter a number like 3.5 or 8.5.");
        }
        break;

      case 2: // IELTS Yes/No
        if (lowerInput.includes("yes") || lowerInput.includes("yep") || lowerInput.includes("yeah")) {
          setStep(3);
          addAIMessage("Great. What is your IELTS score? For example, 7.5");
        } else if (lowerInput.includes("no") || lowerInput.includes("nope")) {
          setProfileData(prev => ({ ...prev, ielts: null }));
          setStep(4);
          addAIMessage("No problem. Do you have a GRE score? Please answer Yes or No.");
        } else {
          addAIMessage("Please answer Yes or No about your IELTS score.");
        }
        break;

      case 3: // IELTS Score
        const ieltsMatch = userInput.match(/\d+\.?\d*/);
        if (ieltsMatch) {
          const ielts = parseFloat(ieltsMatch[0]);
          if (ielts >= 0 && ielts <= 9) {
            setProfileData(prev => ({ ...prev, ielts }));
            setStep(4);
            addAIMessage("Excellent. Do you have a GRE score? Please answer Yes or No.");
          } else {
            addAIMessage("IELTS scores range from 0 to 9. Please enter a valid score.");
          }
        } else {
          addAIMessage("I couldn't parse that score. Please enter a number like 7.5");
        }
        break;

      case 4: // GRE Yes/No
        if (lowerInput.includes("yes") || lowerInput.includes("yep") || lowerInput.includes("yeah")) {
          setStep(5);
          addAIMessage("Perfect. What is your GRE score? For example, 320");
        } else if (lowerInput.includes("no") || lowerInput.includes("nope")) {
          setProfileData(prev => ({ ...prev, gre: null }));
          setStep(6);
          addAIMessage("No worries. What is your annual tuition budget in USD? For example, 30000");
        } else {
          addAIMessage("Please answer Yes or No about your GRE score.");
        }
        break;

      case 5: // GRE Score
        const greMatch = userInput.match(/\d+/);
        if (greMatch) {
          const gre = parseInt(greMatch[0]);
          if (gre >= 260 && gre <= 340) {
            setProfileData(prev => ({ ...prev, gre }));
            setStep(6);
            addAIMessage("Noted. What is your annual tuition budget in USD? For example, 30000");
          } else {
            addAIMessage("GRE scores range from 260 to 340. Please enter a valid score.");
          }
        } else {
          addAIMessage("I couldn't parse that score. Please enter a number like 320");
        }
        break;

      case 6: // Budget Step
        const budgetMatch = userInput.match(/\d+/);
        if (budgetMatch) {
          const budget = parseInt(budgetMatch[0]);
          if (budget > 0) {
            setProfileData(prev => ({ ...prev, budget }));
            setStep(7);
            addAIMessage("Finally, which country is your top target? For example, USA, UK, Canada, Germany, or Australia");
          } else {
            addAIMessage("Please enter a valid budget amount greater than 0.");
          }
        } else {
          addAIMessage("I couldn't understand that budget. Please enter a number like 30000");
        }
        break;

      case 7: // Country Step
        const validCountries = ["usa", "uk", "canada", "germany", "australia"];
        const countryMatch = validCountries.find(country => lowerInput.includes(country));
        
        if (countryMatch) {
          const countryFormatted = countryMatch.toUpperCase();
          setProfileData(prev => ({ ...prev, country: countryFormatted }));
          setStep(8);
          addAIMessage("Analyzing profile... Locking target universities.");
          
          // Save profile and redirect
          setTimeout(() => {
            saveProfile({ ...profileData, country: countryFormatted } as ProfileData);
          }, 1500);
        } else {
          addAIMessage("Please specify a valid country: USA, UK, Canada, Germany, or Australia.");
        }
        break;

      default:
        break;
    }
  };

  const saveProfile = async (data: ProfileData) => {
    setIsProcessing(true);
    
    try {
      // Save to localStorage
      localStorage.setItem('userProfile', JSON.stringify(data));

      // Save to backend
      const payload: any = {
        degree_level: data.degree,
        gpa: data.gpa,
        budget: data.budget,
        target_country: data.country
      };

      // Add optional test scores if they exist
      if (data.ielts !== null && data.ielts !== undefined && data.ielts > 0) {
        payload.ielts_score = data.ielts;
      }
      if (data.gre !== null && data.gre !== undefined && data.gre >= 260) {
        payload.gre_score = data.gre;
      }

      await API.profile.update(payload);
      console.log('Profile saved successfully:', data);

      // Show success message
      setStep(9);
      setMessages(prev => [...prev, {
        id: ++messageIdCounter.current,
        role: "ai",
        content: "Profile complete! Redirecting to your personalized dashboard..."
      }]);

      // Redirect after delay
      setTimeout(() => {
        router.push('/discovery');
      }, 2500);
    } catch (error) {
      console.error('Failed to save profile:', error);
      addAIMessage("There was an error saving your profile. Please try again or use manual entry.");
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-[#030712] flex flex-col font-sans overflow-hidden">
      {/* Header - Minimalist */}
      <div className="relative z-10 p-6 flex items-center justify-between border-b border-white/5 bg-black/20 backdrop-blur-lg">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-indigo-600 to-blue-600 rounded-xl shadow-lg shadow-indigo-500/30">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-white font-bold text-lg tracking-tight">AI Strategist</h1>
            <p className="text-indigo-300 text-xs font-medium">System calibration active</p>
          </div>
        </div>

        {/* Mute/Unmute Toggle */}
        <button
          onClick={toggleMute}
          className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all group"
          title={isMuted ? "Unmute AI Voice" : "Mute AI Voice"}
        >
          {isMuted ? (
            <VolumeX className="w-5 h-5 text-slate-400 group-hover:text-slate-300" />
          ) : (
            <Volume2 className="w-5 h-5 text-indigo-400 group-hover:text-indigo-300" />
          )}
        </button>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-6 relative z-10 scroll-smooth">
        <div className="max-w-3xl mx-auto space-y-4">
          <AnimatePresence>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                className={cn(
                  "flex items-end gap-2",
                  message.role === "user" ? "justify-end" : "justify-start"
                )}
              >
                {/* AI Avatar */}
                {message.role === "ai" && (
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center">
                    <Bot className="w-4 h-4 text-indigo-300" />
                  </div>
                )}

                {/* Message Bubble */}
                <div
                  className={cn(
                    "max-w-[75%] px-5 py-3 rounded-2xl shadow-lg transition-all",
                    message.role === "ai"
                      ? "bg-white/10 backdrop-blur-md border border-white/10 text-slate-200 rounded-bl-none"
                      : "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-blue-500/20 rounded-br-none"
                  )}
                >
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">
                    {message.content}
                  </p>
                </div>

                {/* User Avatar Placeholder (invisible but maintains layout) */}
                {message.role === "user" && (
                  <div className="flex-shrink-0 w-8 h-8" />
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Typing Indicator */}
          {isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex items-end gap-2"
            >
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center">
                <Bot className="w-4 h-4 text-indigo-300" />
              </div>
              <div className="bg-white/10 backdrop-blur-md border border-white/10 px-5 py-3 rounded-2xl rounded-bl-none">
                <div className="flex gap-1.5">
                  <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            </motion.div>
          )}

          {/* Processing Indicator */}
          {isProcessing && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center gap-4 py-12"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-indigo-500 blur-xl opacity-30 animate-pulse" />
                <Loader2 className="relative h-12 w-12 text-indigo-400 animate-spin" />
              </div>
              <p className="text-sm text-slate-300 font-medium">Saving your profile...</p>
            </motion.div>
          )}

          {/* Success Indicator */}
          {step === 9 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", duration: 0.6 }}
              className="flex flex-col items-center gap-4 py-12"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-emerald-500 blur-xl opacity-30 animate-pulse" />
                <CheckCircle2 className="relative h-16 w-16 text-emerald-400" />
              </div>
              <p className="text-xl font-bold text-white">Profile Complete!</p>
              <p className="text-sm text-slate-400">Redirecting to your dashboard...</p>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area - Floating Glass Capsule */}
      {step < 8 && !isProcessing && (
        <div className="relative z-10 p-6 pb-8 bg-gradient-to-t from-[#030712] via-[#030712]/90 to-transparent">
          <form onSubmit={handleSend} className="max-w-3xl mx-auto relative">
            <div className="relative flex items-center gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={isListening ? "Listening..." : "Type or speak your answer..."}
                disabled={isTyping || isProcessing}
                className="w-full bg-white/5 border border-white/10 rounded-full pl-6 pr-28 py-4 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:bg-white/10 transition-all shadow-xl backdrop-blur-md disabled:opacity-50"
              />
              
              {/* Microphone Button */}
              <button
                type="button"
                onClick={toggleListening}
                disabled={isTyping || isProcessing}
                className={cn(
                  "absolute right-16 p-3 rounded-full text-white shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed",
                  isListening 
                    ? "bg-red-500 animate-pulse shadow-red-500/30" 
                    : "bg-indigo-600 hover:bg-indigo-500 hover:scale-105 shadow-indigo-500/30"
                )}
                title={isListening ? "Stop listening" : "Start voice input"}
              >
                {isListening ? (
                  <MicOff className="w-5 h-5" />
                ) : (
                  <Mic className="w-5 h-5" />
                )}
              </button>

              {/* Send Button */}
              <button
                type="submit"
                disabled={!input.trim() || isTyping || isProcessing}
                className="absolute right-2 p-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full text-white shadow-lg shadow-blue-500/30 hover:shadow-blue-500/40 hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
