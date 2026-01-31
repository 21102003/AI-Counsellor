"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { 
  ChevronRight, 
  Lock, 
  Shield, 
  Map, 
  RobotIcon, 
  Zap, 
  ArrowRight, 
  CheckCircle2, 
  Bot,
  BrainCircuit,
  Globe
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

// --- Components ---

const Spotlight = () => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState(0);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
    };

    const handleMouseEnter = () => setOpacity(1);
    const handleMouseLeave = () => setOpacity(0);

    window.addEventListener("mousemove", handleMouseMove);
    document.body.addEventListener("mouseenter", handleMouseEnter);
    document.body.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      document.body.removeEventListener("mouseenter", handleMouseEnter);
      document.body.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  return (
    <div
      className="pointer-events-none fixed inset-0 z-30 transition-opacity duration-300"
      style={{
        opacity,
        background: `radial-gradient(600px circle at ${position.x}px ${position.y}px, rgba(99, 102, 241, 0.06), transparent 80%)`,
      }}
    />
  );
};

const AuroraBackground = () => (
  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[1200px] h-[600px] pointer-events-none -z-10">
    <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/20 via-violet-500/10 to-transparent blur-[120px] opacity-50 rounded-full" />
    <div className="absolute top-0 left-1/4 w-1/2 h-1/2 bg-cyan-500/10 blur-[100px] opacity-30 animate-pulse" />
  </div>
);

const GlassCard = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`bg-white/[0.02] border border-white/[0.05] backdrop-blur-2xl rounded-2xl p-6 ${className}`}>
    {children}
  </div>
);

// --- Sections ---

export default function LandingPage() {
  const [isLocked, setIsLocked] = useState(false);
  const containerRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => setIsLocked(true), 1500);
    return () => clearTimeout(timer);
  }, []);

  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
  };

  const stagger = {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#030712] text-slate-400 font-sans selection:bg-indigo-500/30 overflow-x-hidden">
      <Spotlight />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden">
        <AuroraBackground />
        
        <motion.div 
          className="max-w-4xl mx-auto text-center"
          variants={stagger}
          initial="initial"
          animate="animate"
        >
          <motion.div variants={fadeIn} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-indigo-500/20 bg-indigo-500/10 text-indigo-300 text-sm font-medium mb-8">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
            </span>
            The unfair advantage for study abroad
          </motion.div>

          <motion.h1 
            variants={fadeIn}
            className="text-5xl md:text-7xl font-bold tracking-tight mb-8 leading-[1.1]"
          >
            <span className="bg-clip-text text-transparent bg-gradient-to-b from-white via-white to-white/40">
              Admissions isn't a lottery.<br />
              It’s{" "}
              <span className="text-indigo-500 drop-shadow-[0_0_15px_rgba(99,102,241,0.5)]">
                Engineering
              </span>
              .
            </span>
          </motion.h1>

          <motion.p 
            variants={fadeIn}
            className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-12 leading-relaxed"
          >
            Stop drowning in forums and generic advice. The AI Counsellor builds a data-backed strategy, shortlists 3 perfect universities, and locks your path to acceptance.
          </motion.p>

          <motion.div 
            variants={fadeIn}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20"
          >
            <Button 
              size="lg"
              onClick={() => {
                console.log('Start My Master Plan clicked');
                router.push('/auth');
              }}
              className="h-12 px-8 bg-white text-black hover:scale-105 hover:shadow-[0_0_20px_rgba(255,255,255,0.2)] transition-all duration-300 font-semibold rounded-full group"
            >
              Start My Master Plan
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
            <Button 
              variant="outline"
              size="lg"
              onClick={() => {
                console.log('Login to Dashboard clicked');
                router.push('/auth');
              }}
              className="h-12 px-8 bg-transparent border-white/10 text-white hover:bg-white/5 transition-all rounded-full"
            >
              Login to Dashboard
            </Button>
          </motion.div>

          {/* Hero Graphic - Interface Mockup */}
          <motion.div 
            variants={fadeIn}
            className="relative perspective-1000 max-w-5xl mx-auto"
          >
            <motion.div
              style={{ rotateX: 15, rotateY: -10 }}
              animate={{ 
                rotateX: [15, 12, 15], 
                rotateY: [-10, -5, -10] 
              }}
              transition={{ 
                duration: 6, 
                repeat: Infinity, 
                ease: "easeInOut" 
              }}
              className="relative"
            >
              <GlassCard className="relative p-0 overflow-hidden shadow-2xl shadow-indigo-500/10">
                <div className="h-8 border-b border-white/5 bg-white/5 flex items-center px-4 gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500/20" />
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/20" />
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500/20" />
                  <div className="ml-auto flex items-center gap-4">
                    <div className="h-4 w-32 bg-white/5 rounded" />
                    <div className="h-4 w-4 bg-white/5 rounded-full" />
                  </div>
                </div>
                
                <div className="p-8 md:p-12 grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
                  <div className="col-span-2 space-y-6">
                    <div className="space-y-2">
                      <div className="h-4 w-24 bg-indigo-500/20 rounded" />
                      <div className="h-8 w-64 bg-white/10 rounded" />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      {[1, 2, 3, 4].map(i => (
                        <div key={i} className="h-24 bg-white/[0.03] border border-white/5 rounded-xl p-4 space-y-3">
                          <div className="h-3 w-1/2 bg-white/10 rounded" />
                          <div className="h-4 w-full bg-white/5 rounded" />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-6">
                    <AnimatePresence>
                      <motion.div 
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        className="bg-indigo-500/10 border border-indigo-500/20 rounded-2xl p-6 relative overflow-hidden group"
                      >
                        <div className="flex justify-between items-start mb-4">
                          <div className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center">
                            <Globe className="h-5 w-5 text-indigo-300" />
                          </div>
                          <motion.div
                            animate={isLocked ? { scale: [1, 1.2, 1] } : {}}
                            transition={{ duration: 0.5 }}
                          >
                            <Lock className={`h-5 w-5 ${isLocked ? "text-green-400" : "text-white/20"}`} />
                          </motion.div>
                        </div>
                        <div className="space-y-2">
                          <p className="text-white font-medium">Stanford University</p>
                          <p className="text-xs text-indigo-300">Computer Science • Fall 2026</p>
                        </div>
                        
                        {isLocked && (
                          <motion.div 
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="absolute inset-0 bg-green-500/10 backdrop-blur-[2px] flex items-center justify-center pointer-events-none"
                          >
                            <div className="bg-green-500 text-black text-[10px] font-bold px-2 py-0.5 rounded rotate-12">
                              LOCKED
                            </div>
                          </motion.div>
                        )}
                      </motion.div>
                    </AnimatePresence>

                    <div className="space-y-3">
                      <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                        <motion.div 
                          className="h-full bg-indigo-500"
                          initial={{ width: "0%" }}
                          animate={{ width: "85%" }}
                          transition={{ duration: 2, delay: 0.5 }}
                        />
                      </div>
                      <div className="flex justify-between text-[10px] text-slate-500">
                        <span>ADMISSION PROBABILITY</span>
                        <span className="text-indigo-400">85%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </GlassCard>
              
              {/* Decorative elements */}
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-indigo-500/20 blur-[80px] -z-10" />
              <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-violet-500/20 blur-[80px] -z-10" />
            </motion.div>
          </motion.div>

          <motion.p 
            variants={fadeIn}
            className="mt-8 text-sm font-mono text-slate-500 uppercase tracking-widest italic"
          >
            AI Reasoning Engine active: University locked.
          </motion.p>
        </motion.div>
      </section>

      {/* Grid Section */}
      <section className="py-24 px-6 relative">
        <div className="max-w-6xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4 tracking-tight">
              Why 90% of students fail to get their dream admit.
            </h2>
            <div className="h-1 w-20 bg-indigo-500 mx-auto rounded-full" />
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<Map className="h-6 w-6 text-red-400" />}
              title="Analysis Paralysis"
              description="Browsing 500 universities without a filter is not research. It's procrastination."
              delay={0}
            />
            <FeatureCard 
              icon={<Bot className="h-6 w-6 text-orange-400" />}
              title="Generic Advice"
              description="Chatbots give you Wikipedia answers. We give you a strategy based on YOUR GPA."
              delay={0.1}
            />
            <FeatureCard 
              icon={<Shield className="h-6 w-6 text-green-400" />}
              title="The Lock Protocol"
              description="We force you to commit. You can't start your SOP until you lock a target."
              delay={0.2}
            />
          </div>
        </div>
      </section>

      {/* Trust Footer */}
      <footer className="py-12 px-6 border-t border-white/5 bg-black/40 backdrop-blur-md">
        <div className="max-w-6xl mx-auto flex flex-col items-center gap-8">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-[0.3em]">
            Optimized for intakes in:
          </p>
          <div className="flex flex-wrap justify-center gap-8 md:gap-16 font-mono text-sm tracking-tighter text-slate-400">
            {["US", "UK", "CANADA", "GERMANY", "AUSTRALIA"].map((country) => (
              <span key={country} className="hover:text-indigo-400 transition-colors cursor-default">
                {country}
              </span>
            ))}
          </div>
          <div className="text-[10px] text-slate-600 mt-8">
            © 2026 AI COUNSELLOR • BUILT FOR THE 1%
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description, delay }: { icon: React.ReactNode; title: string; description: string; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay }}
    >
      <GlassCard className="h-full group hover:border-indigo-500/30 transition-colors duration-500">
        <div className="mb-6 p-3 w-fit rounded-xl bg-white/5 border border-white/10 group-hover:scale-110 transition-transform duration-500">
          {icon}
        </div>
        <h3 className="text-xl font-bold text-white mb-3 tracking-tight">{title}</h3>
        <p className="text-slate-400 leading-relaxed text-sm">
          {description}
        </p>
      </GlassCard>
    </motion.div>
  );
}
