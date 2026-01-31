"use client";

import { useState, useEffect, useCallback } from "react";

export interface ApplicationTask {
  id: string;
  title: string;
  description: string;
  status: "pending" | "done";
  actionType: "upload" | "generate" | "pay" | "verify";
  actionLabel: string;
}

interface UseApplicationTasksReturn {
  tasks: ApplicationTask[];
  toggleTask: (id: string) => void;
  updateTask: (id: string, updates: Partial<ApplicationTask>) => void;
  progress: number;
  isMissionComplete: boolean;
  completedCount: number;
  totalCount: number;
}

const DEFAULT_TASKS: ApplicationTask[] = [
  {
    id: "sop",
    title: "Draft Statement of Purpose",
    description: "Write a compelling SOP highlighting your achievements",
    status: "pending",
    actionType: "generate",
    actionLabel: "Generate",
  },
  {
    id: "transcript",
    title: "Upload Official Transcript",
    description: "Scan and upload your academic transcripts",
    status: "pending",
    actionType: "upload",
    actionLabel: "Upload",
  },
  {
    id: "lor",
    title: "Secure 2 Letters of Recommendation",
    description: "Request LORs from professors or supervisors",
    status: "pending",
    actionType: "verify",
    actionLabel: "Verify",
  },
  {
    id: "resume",
    title: "Update Resume/CV",
    description: "Tailor your resume for this application",
    status: "pending",
    actionType: "upload",
    actionLabel: "Upload",
  },
  {
    id: "fee",
    title: "Pay Application Fee",
    description: "Complete the application fee payment",
    status: "pending",
    actionType: "pay",
    actionLabel: "Pay Now",
  },
  {
    id: "essays",
    title: "Complete Supplemental Essays",
    description: "Answer all supplemental essay questions",
    status: "pending",
    actionType: "generate",
    actionLabel: "Write",
  },
];

export function useApplicationTasks(universityId: string): UseApplicationTasksReturn {
  const [tasks, setTasks] = useState<ApplicationTask[]>(DEFAULT_TASKS);

  // Load tasks from localStorage on mount
  useEffect(() => {
    const storageKey = `app_tasks_${universityId}`;
    const stored = localStorage.getItem(storageKey);
    if (stored) {
      try {
        setTasks(JSON.parse(stored));
      } catch (error) {
        console.error("Failed to parse stored tasks:", error);
      }
    }
  }, [universityId]);

  // Auto-save tasks to localStorage
  const saveToStorage = useCallback(
    (updatedTasks: ApplicationTask[]) => {
      const storageKey = `app_tasks_${universityId}`;
      localStorage.setItem(storageKey, JSON.stringify(updatedTasks));
    },
    [universityId]
  );

  // Toggle task completion
  const toggleTask = useCallback(
    (id: string) => {
      setTasks((prevTasks) => {
        const updatedTasks = prevTasks.map((task) => {
          if (task.id === id) {
            const newStatus = task.status === "done" ? "pending" : "done";
            
            // Play success sound (placeholder)
            if (newStatus === "done") {
              // You can add an actual sound effect here
              console.log("🎉 Task completed:", task.title);
            }

            return { ...task, status: newStatus };
          }
          return task;
        });

        saveToStorage(updatedTasks);
        return updatedTasks;
      });
    },
    [saveToStorage]
  );

  // Update specific task properties
  const updateTask = useCallback(
    (id: string, updates: Partial<ApplicationTask>) => {
      setTasks((prevTasks) => {
        const updatedTasks = prevTasks.map((task) =>
          task.id === id ? { ...task, ...updates } : task
        );
        saveToStorage(updatedTasks);
        return updatedTasks;
      });
    },
    [saveToStorage]
  );

  // Calculate progress
  const completedCount = tasks.filter((t) => t.status === "done").length;
  const totalCount = tasks.length;
  const progress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  const isMissionComplete = progress === 100;

  return {
    tasks,
    toggleTask,
    updateTask,
    progress,
    isMissionComplete,
    completedCount,
    totalCount,
  };
}
