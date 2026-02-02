"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Brain } from "lucide-react";

export const TypewriterLogo = () => {
  const [isHovered, setIsHovered] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const text = "AI COUNSELLOR";

  const handleHoverStart = () => {
    setIsHovered(true);
    setIsTyping(true);
  };

  const handleHoverEnd = () => {
    setIsHovered(false);
  };

  const handleAnimationComplete = () => {
    setIsTyping(false);
  };

  // Container animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05, // Delay between each letter
        delayChildren: 0.1, // Initial delay before starting
      },
    },
  };

  // Individual letter animation variants
  const letterVariants = {
    hidden: { 
      opacity: 0,
      y: 10,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.1,
      },
    },
  };

  // Cursor blink animation
  const cursorVariants = {
    blink: {
      opacity: [0, 0, 1, 1],
      transition: {
        duration: 0.8,
        repeat: Infinity,
        repeatType: "loop" as const,
      },
    },
  };

  return (
    <div
      className="flex items-center gap-3 cursor-pointer select-none"
      onMouseEnter={handleHoverStart}
      onMouseLeave={handleHoverEnd}
    >
      {/* Brain Icon with subtle pulse on hover */}
      <motion.div
        className="relative"
        animate={isHovered ? { scale: [1, 1.1, 1] } : { scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="absolute inset-0 bg-indigo-600 rounded-lg blur-md opacity-20" />
        <div className="relative p-2 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg">
          <Brain className="w-5 h-5 text-white" />
        </div>
      </motion.div>

      {/* Typewriter Text */}
      <div className="relative flex items-center">
        <AnimatePresence mode="wait">
          {isHovered ? (
            // Typing animation on hover
            <motion.div
              key="typing"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              onAnimationComplete={handleAnimationComplete}
              className="flex font-bold text-xl text-indigo-900"
            >
              {text.split("").map((char, index) => (
                <motion.span
                  key={`${char}-${index}`}
                  variants={letterVariants}
                  className="inline-block"
                >
                  {char === " " ? "\u00A0" : char}
                </motion.span>
              ))}
              
              {/* Blinking Cursor */}
              {isTyping && (
                <motion.span
                  variants={cursorVariants}
                  animate="blink"
                  className="inline-block ml-0.5 text-indigo-600"
                >
                  |
                </motion.span>
              )}
            </motion.div>
          ) : (
            // Static text when not hovering
            <motion.div
              key="static"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="font-bold text-xl text-indigo-900"
            >
              {text}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default TypewriterLogo;
