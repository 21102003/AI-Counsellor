"use client";

import React from "react";
import { motion } from "framer-motion";
import { Loader2, LucideIcon } from "lucide-react";

interface SocialButtonProps {
  provider: 'google' | 'github';
  icon: LucideIcon;
  isLoading: boolean;
  onClick: () => void;
  disabled?: boolean;
}

export default function SocialButton({ 
  provider, 
  icon: Icon, 
  isLoading, 
  onClick,
  disabled = false
}: SocialButtonProps) {
  const isGoogle = provider === 'google';
  
  return (
    <motion.button
      type="button"
      onClick={onClick}
      disabled={isLoading || disabled}
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      className={`
        relative flex items-center justify-center gap-2 h-11 rounded-xl 
        text-sm font-medium transition-all duration-300 overflow-hidden
        disabled:cursor-not-allowed disabled:opacity-50
        ${isGoogle 
          ? "bg-white/[0.03] border border-white/[0.08] text-white hover:bg-white hover:text-black hover:border-white" 
          : "bg-white/[0.03] border border-white/[0.08] text-white hover:bg-white/5"
        }
      `}
    >
      {/* Background animation on hover (Google only) */}
      {isGoogle && (
        <motion.div
          className="absolute inset-0 bg-white"
          initial={{ x: "-100%" }}
          whileHover={{ x: 0 }}
          transition={{ duration: 0.3 }}
        />
      )}
      
      {/* Content */}
      <div className="relative z-10 flex items-center gap-2">
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Icon className="w-4 h-4" />
        )}
        
        {!isLoading && (
          <span className="capitalize">{provider}</span>
        )}
      </div>
    </motion.button>
  );
}
