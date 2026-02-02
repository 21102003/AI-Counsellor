"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { 
  ChevronRight, 
  Lock, 
  Shield, 
  Map, 
  Zap, 
  ArrowRight, 
  CheckCircle2, 
  Bot,
  BrainCircuit,
  Globe
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { NeuralBackground } from "@/components/NeuralBackground";

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
        background: `radial-gradient(600px circle at ${position.x}px ${position.y}px, rgba(79, 70, 229, 0.15), transparent 80%)`,
      }}
    />
  );
};

const AuroraBackground = () => (
  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[1200px] h-[600px] pointer-events-none -z-10">
    <div className="absolute inset-0 bg-gradient-to-b from-indigo-100 via-violet-50 to-transparent blur-[120px] opacity-60 rounded-full" />
    <div className="absolute top-0 left-1/4 w-1/2 h-1/2 bg-teal-50 blur-[100px] opacity-40 animate-pulse" />
  </div>
);

const GlassCard = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`bg-white/5 border border-white/10 shadow-lg shadow-black/20 backdrop-blur-md rounded-2xl p-6 hover:-translate-y-1 transition-all ${className}`}>
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
    <div className="min-h-screen bg-slate-50 text-slate-600 font-sans selection:bg-indigo-100 overflow-x-hidden">
      <Spotlight />
      
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-6 overflow-hidden">
        {/* Neural Background Animation */}
        <div className="absolute inset-0 z-0">
          <NeuralBackground theme="dark" nodeCount={30} connectionDistance={180} enableMouseInteraction={true} />
        </div>
        
        <motion.div 
          className="relative z-10 max-w-4xl mx-auto text-center flex flex-col items-center justify-center"
          variants={stagger}
          initial="initial"
          animate="animate"
        >
          <motion.div variants={fadeIn} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 text-white border border-white/10 text-sm font-medium mb-8 backdrop-blur-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-400"></span>
            </span>
            The unfair advantage for study abroad
          </motion.div>

          <motion.h1 
            variants={fadeIn}
            className="text-5xl md:text-7xl font-bold tracking-tight mb-8 leading-[1.1] text-white"
          >
            Admissions isn't a lottery.<br />
            It's{" "}
            <span className="text-indigo-300">
              Engineering
            </span>
            .
          </motion.h1>

          <motion.p 
            variants={fadeIn}
            className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto mb-12 leading-relaxed font-medium">
            Stop drowning in forums and generic advice. The AI Counsellor builds a data-backed strategy, shortlists 3 perfect universities, and locks your path to acceptance.
          </motion.p>

          <motion.div 
            variants={fadeIn}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Button 
              size="lg"
              onClick={() => {
                console.log('Start My Master Plan clicked');
                router.push('/auth');
              }}
              className="h-14 px-10 bg-indigo-600 text-white hover:bg-indigo-700 hover:scale-105 shadow-[0_0_20px_rgba(79,70,229,0.5)] ring-2 ring-white/50 ring-offset-2 ring-offset-transparent transition-all duration-300 font-semibold rounded-full group text-lg"
            >
              Start My Master Plan
              <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Button>
          </motion.div>
        </motion.div>
      </section>

      {/* Grid Section */}
      <section className="py-24 px-6 relative bg-slate-50">
        <div className="max-w-6xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-4 tracking-tight">
              Why 90% of students fail to get their dream admit.
            </h2>
            <div className="h-1 w-20 bg-indigo-500 mx-auto rounded-full" />
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<Map className="h-6 w-6 text-orange-500" />}
              title="Analysis Paralysis"
              description="Browsing 500 universities without a filter is not research. It's procrastination."
              delay={0}
            />
            <FeatureCard 
              icon={<Bot className="h-6 w-6 text-indigo-500" />}
              title="Generic Advice"
              description="Chatbots give you Wikipedia answers. We give you a strategy based on YOUR GPA."
              delay={0.1}
            />
            <FeatureCard 
              icon={<Shield className="h-6 w-6 text-emerald-500" />}
              title="The Lock Protocol"
              description="We force you to commit. You can't start your SOP until you lock a target."
              delay={0.2}
            />
          </div>
        </div>
      </section>

      {/* Trust Footer */}
      <footer className="py-12 px-6 border-t border-white/10 bg-[#0B1120]">
        <div className="max-w-6xl mx-auto flex flex-col items-center gap-8">
          <p className="text-xs font-medium text-slate-400 uppercase tracking-[0.3em]">
            Optimized for intakes in:
          </p>
          <div className="flex flex-wrap justify-center gap-8 md:gap-16 font-mono text-sm tracking-tighter text-slate-400">
            {["US", "UK", "CANADA", "GERMANY", "AUSTRALIA"].map((country) => (
              <span key={country} className="hover:text-indigo-400 transition-colors cursor-default text-slate-500">
                {country}
              </span>
            ))}
          </div>
          <div className="text-[10px] text-slate-500 mt-8">
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
      <div className="h-full bg-white border border-slate-200 shadow-lg shadow-slate-200/50 rounded-2xl p-6 group hover:shadow-xl hover:scale-[1.02] hover:border-indigo-300 transition-all duration-300">
        <div className="mb-6 p-3 w-fit rounded-xl bg-slate-50 border border-slate-200 group-hover:scale-110 transition-transform duration-500">
          {icon}
        </div>
        <h3 className="text-xl font-bold text-slate-900 mb-3 tracking-tight">{title}</h3>
        <p className="text-slate-600 leading-relaxed text-sm">
          {description}
        </p>
      </div>
    </motion.div>
  );
}
