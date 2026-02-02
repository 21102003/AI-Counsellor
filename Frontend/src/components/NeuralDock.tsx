"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LayoutGrid, Compass, Heart, UserCircle } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface DockItem {
  id: string;
  icon: React.ElementType;
  label: string;
  path: string;
  color: string;
}

const DOCK_ITEMS: DockItem[] = [
  {
    id: "dashboard",
    icon: LayoutGrid,
    label: "Command",
    path: "/dashboard",
    color: "text-indigo-400",
  },
  {
    id: "discovery",
    icon: Compass,
    label: "Discovery",
    path: "/discovery",
    color: "text-emerald-400",
  },
  {
    id: "shortlist",
    icon: Heart,
    label: "Shortlist",
    path: "/discovery/review",
    color: "text-rose-400",
  },
  {
    id: "profile",
    icon: UserCircle,
    label: "Identity",
    path: "/profile",
    color: "text-purple-400",
  },
];

export default function NeuralDock() {
  const pathname = usePathname();
  const router = useRouter();
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  // 🚫 BLACKLIST: Pages where Dock should be HIDDEN
  const hiddenRoutes = ['/', '/auth', '/login', '/signup', '/onboarding'];
  if (hiddenRoutes.includes(pathname) || pathname.startsWith('/auth')) {
    return null;
  }

  const isActive = (path: string) => {
    // For shortlist, match both exact path and parent discovery path when on review
    if (path === "/discovery/review") {
      return pathname === path;
    }
    return pathname === path;
  };

  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", damping: 20, stiffness: 200, delay: 0.2 }}
      className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50"
    >
      <div className="relative bg-black/50 backdrop-blur-xl border border-white/10 rounded-full px-6 py-3 shadow-2xl shadow-black/50">
        {/* Glow Effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-emerald-500/10 rounded-full blur-xl" />
        
        {/* Dock Items */}
        <div className="relative flex items-center gap-8">
          {DOCK_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            const hovered = hoveredItem === item.id;

            return (
              <div key={item.id} className="relative flex flex-col items-center">
                {/* Tooltip */}
                <AnimatePresence>
                  {hovered && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.8 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.8 }}
                      transition={{ duration: 0.2 }}
                      className="absolute -top-14 px-3 py-1.5 bg-black/90 backdrop-blur-xl border border-white/10 rounded-lg shadow-xl"
                    >
                      <p className="text-xs font-medium text-white whitespace-nowrap">
                        {item.label}
                      </p>
                      {/* Arrow */}
                      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-black/90 border-r border-b border-white/10 rotate-45" />
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Icon Button */}
                <motion.button
                  onClick={() => router.push(item.path)}
                  onMouseEnter={() => setHoveredItem(item.id)}
                  onMouseLeave={() => setHoveredItem(null)}
                  whileHover={{ scale: 1.2, y: -4 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  className={cn(
                    "relative p-3 rounded-xl transition-colors",
                    active ? "bg-white/10" : "hover:bg-white/5"
                  )}
                >
                  {/* Active Glow */}
                  {active && (
                    <motion.div
                      layoutId="activeGlow"
                      className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-xl blur-lg"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                  
                  <Icon
                    className={cn(
                      "w-5 h-5 relative z-10 transition-colors",
                      active ? item.color : "text-slate-400"
                    )}
                  />
                </motion.button>

                {/* Active Indicator Dot */}
                <AnimatePresence>
                  {active && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0 }}
                      transition={{ duration: 0.2 }}
                      className="absolute -bottom-2 w-1.5 h-1.5 rounded-full bg-gradient-to-r from-indigo-400 to-purple-400 shadow-lg shadow-indigo-500/50 animate-pulse"
                    />
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
