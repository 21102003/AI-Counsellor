"use client";

import React from "react";
import { motion } from "framer-motion";
import { Check, Upload, DollarSign, FileText, ShieldCheck } from "lucide-react";
import { ApplicationTask } from "@/hooks/useApplicationTasks";
import { cn } from "@/lib/utils";

interface TaskItemProps {
  task: ApplicationTask;
  onToggle: () => void;
  onAction?: () => void;
}

const ACTION_ICONS = {
  upload: Upload,
  generate: FileText,
  pay: DollarSign,
  verify: ShieldCheck,
};

export default function TaskItem({ task, onToggle, onAction }: TaskItemProps) {
  const ActionIcon = ACTION_ICONS[task.actionType];
  const isDone = task.status === "done";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: isDone ? 0.6 : 1, y: 0 }}
      className={cn(
        "group relative p-4 rounded-xl border transition-all duration-300",
        isDone
          ? "bg-white/[0.02] border-white/5"
          : "bg-white/[0.03] border-white/10 hover:bg-white/[0.05] hover:border-indigo-500/30"
      )}
    >
      <div className="flex items-center gap-4">
        {/* Custom Checkbox */}
        <button
          onClick={onToggle}
          className={cn(
            "flex-shrink-0 w-6 h-6 rounded-lg border-2 transition-all duration-300 flex items-center justify-center",
            isDone
              ? "bg-gradient-to-br from-emerald-500 to-emerald-600 border-emerald-500 shadow-[0_0_10px_rgba(52,211,153,0.4)]"
              : "border-white/20 hover:border-indigo-400 hover:bg-white/5"
          )}
        >
          {isDone && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <Check className="h-4 w-4 text-white" strokeWidth={3} />
            </motion.div>
          )}
        </button>

        {/* Task Content */}
        <div className="flex-1 min-w-0 relative">
          <h4
            className={cn(
              "text-sm font-medium transition-colors",
              isDone ? "text-slate-500" : "text-white"
            )}
          >
            {task.title}
          </h4>
          <p className="text-xs text-slate-500 mt-0.5 truncate">{task.description}</p>

          {/* Strikethrough Animation */}
          {isDone && (
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="absolute top-1/2 left-0 h-[2px] bg-slate-600"
            />
          )}
        </div>

        {/* Action Button */}
        {!isDone && onAction && (
          <button
            onClick={onAction}
            className="flex-shrink-0 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 hover:border-indigo-500/40 transition-all group-hover:scale-105"
          >
            <ActionIcon className="h-4 w-4 text-indigo-400" />
            <span className="text-xs font-medium text-indigo-400">{task.actionLabel}</span>
          </button>
        )}

        {/* Done Badge */}
        {isDone && (
          <div className="flex-shrink-0 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
            <span className="text-xs font-bold text-emerald-400">DONE</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}
