"use client";

import React, { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import { 
  Filter, 
  ChevronLeft, 
  ChevronRight, 
  Search, 
  Lock, 
  X, 
  Trash2,
  Check,
  Loader2,
  Menu
} from "lucide-react";
import { useRouter } from "next/navigation";
import { API, University } from "@/lib/api";
import { ProtectedRoute } from "@/lib/auth-context";
import { useShortlist } from "@/lib/shortlist-context";
import { UniversitySuperCard } from "./components";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { 
  ToggleGroup, 
  ToggleGroupItem 
} from "@/components/ui/toggle-group";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function DiscoveryPage() {
  const router = useRouter();
  const { shortlist, addToShortlist, removeFromShortlist, isShortlisted, clearShortlist } = useShortlist();
  const [universities, setUniversities] = useState<University[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [budget, setBudget] = useState([60000]);
  const [riskType, setRiskType] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [selectedUniForLock, setSelectedUniForLock] = useState<University | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [selectedRegions, setSelectedRegions] = useState<string[]>(['USA', 'UK', 'Canada', 'Germany']); // All regions selected by default

  useEffect(() => {
    // Verify token exists before loading data
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') || localStorage.getItem('token') : null;
    console.log('[Discovery] Component mounted, token exists:', !!token);
    
    if (!token) {
      console.warn('[Discovery] No token found, redirecting to auth');
      window.location.href = '/auth';
      return;
    }
    
    loadUniversities();
  }, []);

  const loadUniversities = async () => {
    console.log('[Discovery] Loading universities...');
    try {
      const data = await API.universities.getRecommendations();
      console.log('[Discovery] Universities loaded:', data.length);
      setUniversities(data);
    } catch (error) {
      console.error('[Discovery] Failed to load universities:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper to toggle region selection
  const toggleRegion = (country: string) => {
    setSelectedRegions(prev => 
      prev.includes(country) 
        ? prev.filter(r => r !== country) // Uncheck
        : [...prev, country] // Check
    );
  };

  const filteredUniversities = useMemo(() => {
    return universities.filter(uni => {
      const matchesSearch = uni.name.toLowerCase().includes(search.toLowerCase()) || 
                           (uni.location?.toLowerCase() || "").includes(search.toLowerCase());
      const matchesBudget = uni.tuition_fee <= budget[0];
      const matchesRisk = riskType === "all" || (uni.match_tier?.toLowerCase() || "") === riskType.toLowerCase();
      const matchesRegion = selectedRegions.length === 0 || selectedRegions.includes(uni.country);
      return matchesSearch && matchesBudget && matchesRisk && matchesRegion;
    });
  }, [search, budget, riskType, universities, selectedRegions]);

  const toggleShortlist = (uni: University) => {
    if (isShortlisted(uni.id)) {
      removeFromShortlist(uni.id);
    } else {
      addToShortlist(uni);
    }
  };

  const handleLockUniversity = async () => {
    if (!selectedUniForLock) return;
    
    try {
      await API.universities.lock(selectedUniForLock.id);
      setSelectedUniForLock(null);
      // Redirect to applications page
      window.location.href = "/applications";
    } catch (error) {
      console.error("Failed to lock university:", error);
    }
  };

  return (
    <ProtectedRoute>
    <div className="min-h-screen bg-[#030712] text-slate-400 font-sans selection:bg-indigo-500/30 overflow-hidden flex flex-col">
      {/* Header */}
      <header className="h-16 border-b border-white/5 bg-black/40 backdrop-blur-md flex items-center justify-between px-4 md:px-6 z-40 mt-16 md:mt-20">
        <div className="flex items-center gap-2 md:gap-4">
          {/* Mobile Hamburger Menu */}
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="block md:hidden p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20 hover:bg-indigo-500/20 transition-colors"
          >
            <Menu className="w-4 h-4 text-indigo-400" />
          </button>
          
          <div className="hidden md:flex p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
            <Filter className="w-4 h-4 text-indigo-400" />
          </div>
          <div>
            <h1 className="text-xs md:text-sm font-bold text-white uppercase tracking-widest">Discovery</h1>
            <p className="text-[9px] md:text-[10px] text-slate-500 font-mono">
              {isLoading ? "SCANNING..." : `${filteredUniversities.length} FOUND`}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 md:gap-6">
          <div className="relative w-32 md:w-64">
            <Search className="absolute left-2 md:left-3 top-1/2 -translate-y-1/2 w-3 md:w-3.5 h-3 md:h-3.5 text-slate-500" />
            <Input 
              placeholder="Search..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-white/5 border-white/10 pl-7 md:pl-9 h-8 md:h-9 text-[10px] md:text-xs text-white placeholder:text-slate-500 focus:ring-indigo-500/50"
            />
          </div>
          <div className="hidden md:block h-8 w-px bg-white/5" />
          <div className="hidden md:flex items-center gap-2">
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-tighter">System Health:</span>
            <div className="flex gap-0.5">
              {[1, 2, 3].map(i => <div key={i} className="w-1 h-3 rounded-full bg-emerald-500/50 animate-pulse" />)}
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden relative">
        {/* Sidebar Filters */}
        <AnimatePresence initial={false}>
          {isSidebarOpen && (
            <>
              {/* Mobile Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsSidebarOpen(false)}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
              />
              
              {/* Sidebar Drawer */}
              <motion.aside
                initial={{ x: -300, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -300, opacity: 0 }}
                className="fixed md:relative w-72 md:w-64 lg:w-72 h-full border-r border-white/5 bg-[#0B1120] backdrop-blur-xl p-4 md:p-6 pt-6 md:pt-28 flex flex-col gap-6 md:gap-8 z-50 overflow-y-auto"
              >
              <div className="space-y-6">
                {/* Budget Simulator */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <Label className="text-xs font-bold text-white uppercase tracking-wider">Budget Simulator</Label>
                    <Badge variant="outline" className="text-[10px] border-white/10 text-indigo-400">
                      {budget[0] > 45000 ? "Stretch" : "Affordable"}
                    </Badge>
                  </div>
                  <Slider 
                    defaultValue={[60000]} 
                    max={60000} 
                    step={1000}
                    min={0}
                    value={budget}
                    onValueChange={setBudget}
                    className="py-4"
                  />
                  <div className="flex justify-between font-mono text-[10px] text-slate-500">
                    <span>$0</span>
                    <span className="text-white font-semibold">${budget[0].toLocaleString()}</span>
                  </div>
                </div>

                {/* Risk Tolerance */}
                <div className="space-y-4">
                  <Label className="text-xs font-bold text-white uppercase tracking-wider">Risk Tolerance</Label>
                  <ToggleGroup 
                    type="single" 
                    value={riskType} 
                    onValueChange={(val) => val && setRiskType(val)}
                    className="grid grid-cols-2 gap-2"
                  >
                    <ToggleGroupItem value="all" className="text-[10px] uppercase h-8 data-[state=on]:bg-indigo-500/20 data-[state=on]:text-indigo-400 border border-white/5">All</ToggleGroupItem>
                    <ToggleGroupItem value="safe" className="text-[10px] uppercase h-8 data-[state=on]:bg-emerald-500/20 data-[state=on]:text-emerald-400 border border-white/5">Safe</ToggleGroupItem>
                    <ToggleGroupItem value="target" className="text-[10px] uppercase h-8 data-[state=on]:bg-amber-500/20 data-[state=on]:text-amber-400 border border-white/5">Target</ToggleGroupItem>
                    <ToggleGroupItem value="dream" className="text-[10px] uppercase h-8 data-[state=on]:bg-rose-500/20 data-[state=on]:text-rose-400 border border-white/5">Dream</ToggleGroupItem>
                  </ToggleGroup>
                </div>

                {/* Location Filter */}
                <div className="space-y-4">
                  <Label className="text-xs font-bold text-white uppercase tracking-wider">Target Regions</Label>
                  <div className="space-y-2">
                    {[
                      { code: "US", name: "North America", flag: "🇺🇸", country: "USA" },
                      { code: "GB", name: "United Kingdom", flag: "🇬🇧", country: "UK" },
                      { code: "CA", name: "Canada", flag: "🇨🇦", country: "Canada" },
                      { code: "DE", name: "Germany", flag: "🇩🇪", country: "Germany" }
                    ].map(region => (
                      <label 
                        key={region.country} 
                        className="flex items-center justify-between p-2.5 rounded-lg bg-white/[0.03] border border-white/5 text-[10px] cursor-pointer hover:bg-white/10 transition-colors group"
                        onClick={() => toggleRegion(region.country)}
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex items-center justify-center w-8 h-8 rounded-md bg-black/30 border border-white/10 text-sm font-bold text-slate-400">
                            {region.code}
                          </div>
                          <span className="text-slate-300 group-hover:text-white transition-colors">{region.name}</span>
                        </div>
                        <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center transition-colors ${
                          selectedRegions.includes(region.country) 
                            ? 'bg-indigo-500/20 border-indigo-400/50' 
                            : 'bg-black/20 border-white/20'
                        }`}>
                          {selectedRegions.includes(region.country) && (
                            <Check className="w-2.5 h-2.5 text-indigo-400" />
                          )}
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-auto">
                <Button variant="ghost" className="w-full text-[10px] text-slate-500 uppercase tracking-widest hover:text-white" onClick={() => {
                  setBudget([0, 60000]);
                  setRiskType("all");
                  setSearch("");
                  setSelectedRegions(['USA', 'UK', 'Canada', 'Germany']); // Reset to all regions
                }}>
                  Reset Protocol
                </Button>
              </div>
            </motion.aside>
            </>
          )}
        </AnimatePresence>

        {/* Toggle Sidebar Button - Desktop Only */}
        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="hidden md:block absolute left-0 top-1/2 -translate-y-1/2 z-30 p-1 bg-indigo-500/10 border border-white/5 rounded-r-lg hover:bg-indigo-500/20 transition-colors"
        >
          {isSidebarOpen ? <ChevronLeft className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
        </button>

        {/* Main Grid */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar relative">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-6 md:mb-8 gap-4">
              <div>
                <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight mb-2">Marketplace Results</h2>
                <p className="text-[10px] md:text-xs text-slate-500">Showing {filteredUniversities.length} institutions matching your profile.</p>
              </div>
              <div className="flex gap-2">
                <Badge variant="secondary" className="bg-white/5 text-slate-400 text-[10px] border-white/5">
                  GPA: 3.5
                </Badge>
                <Badge variant="secondary" className="bg-white/5 text-slate-400 text-[10px] border-white/5">
                  GRE: 320
                </Badge>
              </div>
            </div>

            <LayoutGroup>
              <motion.div 
                layout
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-24"
              >
                <AnimatePresence mode="popLayout">
                  {filteredUniversities.map((uni) => (
                    <UniversitySuperCard 
                      key={uni.id} 
                      university={uni} 
                      onLock={setSelectedUniForLock}
                      onShortlist={toggleShortlist}
                      isShortlisted={isShortlisted(uni.id)}
                    />
                  ))}
                </AnimatePresence>
              </motion.div>
            </LayoutGroup>

            {filteredUniversities.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-6">
                  <X className="w-8 h-8 text-slate-600" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">No Matches Found</h3>
                <p className="text-xs text-slate-500 max-w-xs">Your current parameters are too restrictive. Try broadening your budget or risk tolerance.</p>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Sticky Bottom Bar - Shortlist Portfolio */}
      <AnimatePresence>
        {shortlist.length > 0 && (
          <motion.footer
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            exit={{ y: 100 }}
            className="fixed bottom-0 left-0 right-0 h-auto md:h-20 border-t border-white/10 bg-black/60 backdrop-blur-2xl z-50 px-4 md:px-8 py-4 md:py-0 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 md:gap-0"
          >
            <div className="flex items-center gap-4 md:gap-6">
              <div>
                <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block mb-1">Portfolio</span>
                <h4 className="text-xs md:text-sm font-bold text-white">{shortlist.length} Universities</h4>
              </div>
              <div className="h-10 w-px bg-white/10" />
              <div className="flex -space-x-2 overflow-x-auto max-w-[150px] md:max-w-none">
                {shortlist.map((uni) => (
                  <motion.div 
                    layoutId={`shortlist-${uni.id}`}
                    key={uni.id}
                    className="w-10 h-10 rounded-full bg-slate-800 border-2 border-[#030712] flex items-center justify-center text-sm shadow-xl group relative cursor-pointer"
                  >
                    {uni.flag}
                    <button 
                      className="absolute -top-1 -right-1 bg-rose-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => toggleShortlist(uni)}
                    >
                      <X className="w-2 h-2" />
                    </button>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="flex gap-2 md:gap-4">
              <Button variant="ghost" className="flex-1 md:flex-none text-[10px] md:text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 h-10" onClick={clearShortlist}>
                <Trash2 className="w-3 md:w-3.5 h-3 md:h-3.5 mr-1 md:mr-2" />
                Clear
              </Button>
              <Button 
                className="flex-1 md:flex-none bg-white text-black hover:bg-white/90 text-[10px] md:text-xs font-bold px-4 md:px-8 rounded-full h-10"
                onClick={() => router.push("/discovery/review")}
              >
                Review Selection
              </Button>
            </div>
          </motion.footer>
        )}
      </AnimatePresence>

      {/* Critical Warning Modal */}
      <Dialog open={!!selectedUniForLock} onOpenChange={() => setSelectedUniForLock(null)}>
        <DialogContent className="bg-[#030712] border-white/10 text-slate-400 max-w-md">
          <DialogHeader>
            <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-4">
              <Lock className="w-6 h-6 text-amber-500" />
            </div>
            <DialogTitle className="text-xl font-bold text-white tracking-tight">Confirm Strategy Lock?</DialogTitle>
            <DialogDescription className="text-slate-400 text-sm py-2">
              Locking <span className="text-white font-bold">{selectedUniForLock?.name}</span> will generate your specific application roadmap. This action signals intent and allocates AI resources to this target.
            </DialogDescription>
          </DialogHeader>
          <div className="p-4 bg-white/5 border border-white/10 rounded-xl space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500">Target Semester</span>
              <span className="text-white font-mono">FALL 2026</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500">Strategy Complexity</span>
              <span className="text-amber-400 font-mono">HIGH (TARGET ADMIT)</span>
            </div>
          </div>
          <DialogFooter className="mt-6 flex gap-3">
            <Button variant="ghost" className="flex-1 hover:bg-white/5 border border-transparent hover:border-white/5" onClick={() => setSelectedUniForLock(null)}>
              Cancel
            </Button>
            <Button 
              className="flex-1 bg-white text-black font-bold hover:bg-white/90 shadow-[0_0_20px_rgba(255,255,255,0.1)]"
              onClick={handleLockUniversity}
            >
              Execute Lock
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {isLoading && (
        <div className="fixed inset-0 bg-[#030712]/90 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
            <p className="text-slate-400 text-sm font-mono">Loading universities...</p>
          </div>
        </div>
      )}
    </div>
    </ProtectedRoute>
  );
}
