"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Mail, 
  Lock, 
  User, 
  ArrowRight, 
  Check, 
  Loader2, 
  Hexagon, 
  Cpu,
  Github,
  Chrome
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { API } from "@/lib/api";
import SocialButton from "@/components/SocialButton";

export default function AuthPage() {
  const searchParams = useSearchParams();
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Handle OAuth callback token from URL
  useEffect(() => {
    const token = searchParams.get('token');
    const oauthProvider = searchParams.get('oauth');
    const oauthError = searchParams.get('error');
    
    if (oauthError) {
      console.error('[OAuth] Error from callback:', oauthError);
      setError(`OAuth error: ${oauthError}`);
      // Clean URL
      window.history.replaceState({}, '', '/auth');
      return;
    }
    
    if (token && oauthProvider) {
      console.log(`[OAuth] Received token from ${oauthProvider} login`);
      
      // Store the token
      localStorage.setItem('access_token', token);
      localStorage.setItem('token', token);
      
      // Verify token storage
      const storedToken = localStorage.getItem('access_token');
      console.log('[OAuth] Token stored:', !!storedToken);
      
      if (storedToken) {
        setIsSuccess(true);
        
        // Redirect to dashboard after brief delay
        setTimeout(() => {
          console.log('[OAuth] Redirecting to dashboard...');
          window.location.href = '/dashboard';
        }, 1000);
      } else {
        setError('Failed to store authentication token');
      }
      
      // Clean URL
      window.history.replaceState({}, '', '/auth');
    }
  }, [searchParams]);
  
  // Social auth loading states
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isGithubLoading, setIsGithubLoading] = useState(false);

  // Form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  
  // Validation states
  const [emailError, setEmailError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);
  const [nameError, setNameError] = useState(false);
  const [shakeFields, setShakeFields] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Reset error states
    setEmailError(false);
    setPasswordError(false);
    setNameError(false);
    setError(null);
    
    // Validation flags
    let hasError = false;
    
    // Name validation (Join mode only)
    if (!isLogin && name.trim().length < 3) {
      setNameError(true);
      hasError = true;
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim() || !emailRegex.test(email)) {
      setEmailError(true);
      hasError = true;
    }
    
    // Password validation
    if (password.length < 8) {
      setPasswordError(true);
      hasError = true;
    }
    
    // If validation fails, trigger shake animation
    if (hasError) {
      setError("Error: Invalid Credentials Protocol");
      setShakeFields(true);
      setTimeout(() => setShakeFields(false), 500);
      return;
    }
    
    // Trim whitespace from inputs
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();
    
    console.log('Form submitted', { isLogin, email: trimmedEmail, password: '***' });
    setIsLoading(true);
    setError(null);

    try {
      if (isLogin) {
        console.log('Attempting login...');
        await API.auth.login(trimmedEmail, trimmedPassword);
      } else {
        console.log('Attempting signup...');
        const trimmedName = name.trim();
        await API.auth.signup(trimmedEmail, trimmedPassword, trimmedName);
      }
      
      console.log('Authentication successful');
      
      // Verify token is stored before redirecting
      const token = localStorage.getItem('access_token') || localStorage.getItem('token');
      console.log('[Auth] Token verification:', {
        exists: !!token,
        preview: token ? token.substring(0, 30) + '...' : 'NOT FOUND',
        length: token?.length || 0
      });
      
      if (!token) {
        console.error('[Auth] CRITICAL: Authentication succeeded but token not found in storage!');
        setError('Authentication error: Token not saved. Please try again.');
        setIsLoading(false);
        return;
      }
      
      setIsSuccess(true);
      
      // Wait a bit longer to ensure token is fully persisted
      setTimeout(() => {
        const finalCheck = localStorage.getItem('access_token') || localStorage.getItem('token');
        console.log('[Auth] Final token check before redirect:', !!finalCheck);
        
        if (finalCheck) {
          console.log('[Auth] Redirecting to', isLogin ? 'dashboard' : 'onboarding');
          window.location.href = isLogin ? "/dashboard" : "/onboarding";
        } else {
          console.error('[Auth] Token disappeared before redirect!');
          setError('Token storage error. Please try again.');
          setIsSuccess(false);
          setIsLoading(false);
        }
      }, 1500);
    } catch (err: any) {
      setIsLoading(false);
      
      // Extract status code
      const status = err?.status || err?.response?.status;
      
      // Log only unexpected errors (not 409/404/401 which are handled)
      if (![409, 404, 401].includes(status)) {
        console.error('Authentication error:', JSON.stringify(err, null, 2));
      }
      
      // SCENARIO A: Duplicate Email on Signup (409)
      if (status === 409 && !isLogin) {
        setError("Account detected. Please login. 👋");
        setEmailError(true);
        setShakeFields(true);
        setTimeout(() => setShakeFields(false), 500);
        
        // Auto-switch to Login mode after 1.5s
        setTimeout(() => {
          setIsLogin(true);
          setError(null);
          setEmailError(false);
          // Email remains prefilled automatically
        }, 1500);
        return;
      }
      
      // SCENARIO B: User Not Found (404)
      if (status === 404 && isLogin) {
        setError("Identity not recognized. Please Initialize Profile.");
        setEmailError(true);
        setShakeFields(true);
        setTimeout(() => setShakeFields(false), 500);
        
        // Auto-switch to Join mode after 1.5s
        setTimeout(() => {
          setIsLogin(false);
          setError(null);
          setEmailError(false);
        }, 1500);
        return;
      }
      
      // SCENARIO C: Wrong Password (401)
      if (status === 401) {
        setError("Access Denied: Invalid Key.");
        setPasswordError(true);
        setShakeFields(true);
        setTimeout(() => setShakeFields(false), 500);
        return;
      }
      
      // SCENARIO D: Validation Error (422)
      if (status === 422) {
        const detail = err?.response?.data?.detail;
        if (Array.isArray(detail) && detail.length > 0) {
          const firstError = detail[0];
          const field = firstError.loc?.[1];
          const message = firstError.msg || 'Validation error';
          
          if (field === 'password') {
            setError(`Password: ${message}`);
            setPasswordError(true);
          } else if (field === 'email') {
            setError(`Email: ${message}`);
            setEmailError(true);
          } else {
            setError(message);
          }
          
          setShakeFields(true);
          setTimeout(() => setShakeFields(false), 500);
          return;
        }
      }
      
      // Default error handling
      let errorMessage = 'Authentication failed. Please try again.';
      
      if (typeof err === 'string') {
        errorMessage = err;
      } else if (err?.message) {
        errorMessage = err.message;
      } else if (err?.response?.data?.detail) {
        errorMessage = err.response.data.detail;
      } else if (err?.response?.data?.message) {
        errorMessage = err.response.data.message;
      }
      
      setError(errorMessage);
    }
  };

  // Social Authentication Handler
  const handleSocialLogin = async (provider: 'google' | 'github') => {
    const setLoading = provider === 'google' ? setIsGoogleLoading : setIsGithubLoading;
    
    setLoading(true);
    setError(`Connecting to ${provider.charAt(0).toUpperCase() + provider.slice(1)}...`);
    
    // Redirect to backend OAuth endpoint
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    window.location.href = `${backendUrl}/oauth/${provider}`;
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
    },
  };

  return (
    <div className="flex min-h-screen bg-[#030712] text-white selection:bg-indigo-500/30 overflow-hidden font-sans">
      {/* Left Panel - The Visual Hook */}
      <motion.div 
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="hidden lg:flex w-1/2 relative flex-col items-center justify-center p-12 overflow-hidden border-r border-white/5"
      >
        {/* Animated Background Mesh */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/20 via-black to-black animate-pulse-slow" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/10 blur-[120px] rounded-full" />
          <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-indigo-500/5 to-transparent" />
        </div>

        <div className="relative z-10 text-center space-y-8 max-w-md">
          <motion.div
            animate={{ 
              rotate: [0, 360],
              scale: [1, 1.05, 1]
            }}
            transition={{ 
              rotate: { duration: 20, repeat: Infinity, ease: "linear" },
              scale: { duration: 4, repeat: Infinity, ease: "easeInOut" }
            }}
            className="w-24 h-24 mx-auto relative flex items-center justify-center"
          >
            <div className="absolute inset-0 bg-indigo-500/20 blur-2xl rounded-full" />
            <Hexagon className="w-20 h-20 text-indigo-500 stroke-[1.5]" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Cpu className="w-8 h-8 text-cyan-400" />
            </div>
          </motion.div>

          <div className="space-y-4">
            <h2 className="text-4xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60">
              Your Strategy Awaits.
            </h2>
            <p className="text-slate-400 text-lg leading-relaxed">
              The AI has reserved a calculation node for your profile. Verify your identity to begin the simulation.
            </p>
          </div>

          <div className="pt-8">
            <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-white/[0.03] border border-white/[0.08] backdrop-blur-xl text-sm text-slate-300">
              <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              Trusted by 12,000+ students aiming for Top 50 Universities.
            </div>
          </div>
        </div>
      </motion.div>

      {/* Right Panel - The Gateway */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-6 sm:p-12 relative">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="w-full max-w-md space-y-10"
        >
          {/* Header & Toggle */}
          <div className="space-y-6">
            <motion.div variants={itemVariants} className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tight">
                {isLogin ? "Welcome Back" : "Initialize Profile"}
              </h1>
              <p className="text-slate-500 text-sm">
                Enter your credentials to access the central intelligence unit.
              </p>
            </motion.div>

            <motion.div 
              variants={itemVariants}
              className="p-1 bg-white/[0.03] border border-white/[0.08] rounded-xl flex"
            >
              <button
                onClick={() => setIsLogin(true)}
                className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all duration-300 ${
                  isLogin ? "bg-white/10 text-white shadow-xl" : "text-slate-500 hover:text-slate-300"
                }`}
              >
                Login
              </button>
              <button
                onClick={() => setIsLogin(false)}
                className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all duration-300 ${
                  !isLogin ? "bg-white/10 text-white shadow-xl" : "text-slate-500 hover:text-slate-300"
                }`}
              >
                Join
              </button>
            </motion.div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-6">
              <AnimatePresence>
                {!isLogin && (
                  <motion.div 
                    key="name-field"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="relative group mb-6"
                  >
                    <motion.div 
                      animate={shakeFields && nameError ? { x: [-10, 10, -10, 10, 0] } : {}}
                      transition={{ duration: 0.4 }}
                      className={`bg-white/[0.03] border rounded-xl p-3 group-focus-within:border-indigo-500/50 transition-all duration-300 ${
                        nameError ? "border-rose-500/50" : name.length > 2 ? "border-emerald-500/50" : "border-white/10"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <User className="w-4 h-4 text-slate-400 group-focus-within:text-indigo-400 transition-colors" />
                        <input
                          type="text"
                          placeholder="Full Name (min 3 characters)"
                          required
                          value={name}
                          onChange={(e) => {
                            setName(e.target.value);
                            if (e.target.value.length > 2) setNameError(false);
                          }}
                          className="bg-transparent border-none outline-none w-full text-white placeholder:text-slate-400 text-sm"
                        />
                        {name.length === 0 ? (
                          <div className="w-1.5 h-1.5 rounded-full bg-slate-600" />
                        ) : name.length > 2 ? (
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(34,197,94,0.6)] animate-pulse" />
                        ) : (
                          <div className="w-1.5 h-1.5 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)]" />
                        )}
                      </div>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.div variants={itemVariants} className="relative group">
                <motion.div 
                  animate={shakeFields && emailError ? { x: [-10, 10, -10, 10, 0] } : {}}
                  transition={{ duration: 0.4 }}
                  className={`bg-white/[0.03] border rounded-xl p-3 group-focus-within:border-indigo-500/50 transition-all duration-300 ${
                    emailError ? "border-rose-500/50" : email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/) ? "border-emerald-500/50" : "border-white/10"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Mail className="w-4 h-4 text-slate-400 group-focus-within:text-indigo-400 transition-colors" />
                    <input
                      type="email"
                      placeholder="Applicant Email"
                      required
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (e.target.value.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) setEmailError(false);
                      }}
                      className="bg-transparent border-none outline-none w-full text-white placeholder:text-slate-400 text-sm"
                    />
                    {email.length === 0 ? (
                      <div className="w-1.5 h-1.5 rounded-full bg-slate-600" />
                    ) : email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/) ? (
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(34,197,94,0.6)] animate-pulse" />
                    ) : (
                      <div className="w-1.5 h-1.5 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)]" />
                    )}
                  </div>
                </motion.div>
              </motion.div>

              <motion.div variants={itemVariants} className="relative group">
                <motion.div 
                  animate={shakeFields && passwordError ? { x: [-10, 10, -10, 10, 0] } : {}}
                  transition={{ duration: 0.4 }}
                  className={`bg-white/[0.03] border rounded-xl p-3 group-focus-within:border-indigo-500/50 transition-all duration-300 ${
                    passwordError ? "border-rose-500/50" : password.length >= 6 ? "border-emerald-500/50" : "border-white/10"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Lock className="w-4 h-4 text-slate-400 group-focus-within:text-indigo-400 transition-colors" />
                    <input
                      type="password"
                      placeholder="Password (min 6 characters)"
                      required
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (e.target.value.length >= 6) setPasswordError(false);
                      }}
                      className="bg-transparent border-none outline-none w-full text-white placeholder:text-slate-400 text-sm"
                    />
                    {password.length === 0 ? (
                      <div className="w-1.5 h-1.5 rounded-full bg-slate-600" />
                    ) : password.length >= 6 ? (
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(34,197,94,0.6)] animate-pulse" />
                    ) : (
                      <div className="w-1.5 h-1.5 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)]" />
                    )}
                  </div>
                </motion.div>
              </motion.div>
            </div>

            <motion.div variants={itemVariants} className="space-y-4">
              <div className="flex items-center justify-between text-xs">
                <button 
                  type="button" 
                  onClick={() => setError(isLogin ? "Password recovery coming soon" : "Switch to Login tab")}
                  className="text-slate-500 hover:text-indigo-400 transition-colors"
                >
                  {isLogin ? "Recover Access Key" : "Already have ID?"}
                </button>
              </div>

              <Button
                type="submit"
                disabled={isLoading || isSuccess}
                className={`w-full h-12 rounded-xl font-bold transition-all duration-300 ${
                  isSuccess 
                  ? "bg-green-500 text-black" 
                  : "bg-white text-black hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(255,255,255,0.15)]"
                }`}
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : isSuccess ? (
                  <Check className="w-5 h-5" />
                ) : (
                  <span className="flex items-center gap-2">
                    {isLogin ? "Access Dashboard" : "Create Applicant ID"}
                    <ArrowRight className="w-4 h-4" />
                  </span>
                )}
              </Button>
            </motion.div>
          </form>

          {/* Social Auth */}
          <motion.div variants={itemVariants} className="space-y-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/5" />
              </div>
              <div className="relative flex justify-center text-[10px] uppercase tracking-widest">
                <span className="bg-[#030712] px-4 text-slate-600">
                  Or continue with verified ID
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <SocialButton
                provider="google"
                icon={Chrome}
                isLoading={isGoogleLoading}
                onClick={() => handleSocialLogin('google')}
                disabled={isLoading || isSuccess}
              />
              <SocialButton
                provider="github"
                icon={Github}
                isLoading={isGithubLoading}
                onClick={() => handleSocialLogin('github')}
                disabled={isLoading || isSuccess}
              />
            </div>
          </motion.div>
        </motion.div>

        {/* Error Toast */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="absolute bottom-8 left-1/2 -translate-x-1/2 w-full max-w-xs p-4 bg-red-500/10 border border-red-500/20 backdrop-blur-xl rounded-xl flex items-center gap-3 text-red-400 text-sm shadow-2xl shadow-red-500/10"
            >
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              {error}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
