"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { University } from "@/lib/api";

interface ShortlistContextType {
  shortlist: University[];
  addToShortlist: (university: University) => void;
  removeFromShortlist: (universityId: number) => void;
  isShortlisted: (universityId: number) => boolean;
  clearShortlist: () => void;
}

const ShortlistContext = createContext<ShortlistContextType | undefined>(undefined);

export const ShortlistProvider = ({ children }: { children: ReactNode }) => {
  const [shortlist, setShortlist] = useState<University[]>([]);

  // Load shortlist from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("university_shortlist");
      if (saved) {
        try {
          setShortlist(JSON.parse(saved));
        } catch (error) {
          console.error("Failed to parse shortlist from localStorage:", error);
        }
      }
    }
  }, []);

  // Save shortlist to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("university_shortlist", JSON.stringify(shortlist));
    }
  }, [shortlist]);

  const addToShortlist = (university: University) => {
    setShortlist((prev) => {
      // Check if already in shortlist
      if (prev.find((u) => u.id === university.id)) {
        return prev;
      }
      return [...prev, university];
    });
  };

  const removeFromShortlist = (universityId: number) => {
    setShortlist((prev) => prev.filter((u) => u.id !== universityId));
  };

  const isShortlisted = (universityId: number) => {
    return shortlist.some((u) => u.id === universityId);
  };

  const clearShortlist = () => {
    setShortlist([]);
    if (typeof window !== "undefined") {
      localStorage.removeItem("university_shortlist");
    }
  };

  return (
    <ShortlistContext.Provider
      value={{
        shortlist,
        addToShortlist,
        removeFromShortlist,
        isShortlisted,
        clearShortlist,
      }}
    >
      {children}
    </ShortlistContext.Provider>
  );
};

export const useShortlist = () => {
  const context = useContext(ShortlistContext);
  if (context === undefined) {
    throw new Error("useShortlist must be used within a ShortlistProvider");
  }
  return context;
};
