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
        disabled:cursor-not-allowed disabled:opacity-50 shadow-md
        ${
          isGoogle
            ? "bg-[#EA4335] text-white hover:bg-red-600"
            : "bg-gray-900 text-white hover:bg-black"
        }
      `}
    >
      
      {/* Content */}
      <div className="flex items-center gap-2">
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
