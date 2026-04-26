"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { BrainCircuit, Mail, Lock, User, ArrowRight, Loader2, Sparkles } from "lucide-react";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    fullName: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (isLogin) {
        // Login Logic
        const params = new URLSearchParams();
        params.append('username', formData.email);
        params.append('password', formData.password);

        const res = await fetch("http://127.0.0.1:8001/token", {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: params
        });

        if (!res.ok) throw new Error("Invalid email or password");
        
        const data = await res.json();
        localStorage.setItem("token", data.access_token);
        router.push("/");
      } else {
        // Signup Logic
        const res = await fetch("http://127.0.0.1:8001/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password,
            full_name: formData.fullName
          })
        });

        if (!res.ok) throw new Error("Signup failed. Email might already be registered.");
        
        setIsLogin(true);
        setError("Account created! Please login.");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen text-slate-100 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/20 blur-[120px] rounded-full animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-600/10 blur-[120px] rounded-full animate-pulse delay-1000" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full glass p-10 rounded-[2.5rem] relative z-10 border border-white/10"
      >
        <div className="flex flex-col items-center mb-10">
          <motion.div 
            whileHover={{ rotate: 180 }}
            transition={{ duration: 0.5 }}
            className="p-4 bg-gradient-to-br from-indigo-500 to-cyan-500 rounded-2xl shadow-[0_0_30px_rgba(99,102,241,0.4)] mb-6"
          >
            <BrainCircuit className="w-10 h-10 text-white" />
          </motion.div>
          <h1 className="text-3xl font-black tracking-tight neon-text">MarketIntel AI</h1>
          <p className="text-slate-400 text-sm mt-2 font-medium">
            {isLogin ? "Neural uplink required to proceed" : "Initialize your tracking profile"}
          </p>
        </div>

        <AnimatePresence mode="wait">
          {error && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className={`mb-6 p-4 rounded-2xl text-xs font-bold uppercase tracking-widest border ${
                error.includes("created") 
                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" 
                  : "bg-rose-500/10 text-rose-400 border-rose-500/20 shadow-[0_0_15px_rgba(244,63,94,0.1)]"
              }`}
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit} className="space-y-5">
          {!isLogin && (
            <div className="space-y-1">
              <div className="relative group">
                <User className="absolute left-4 top-4 w-5 h-5 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                <input
                  type="text"
                  placeholder="Full Name"
                  className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all placeholder:text-slate-600 font-medium"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  required
                />
              </div>
            </div>
          )}

          <div className="space-y-1">
            <div className="relative group">
              <Mail className="absolute left-4 top-4 w-5 h-5 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
              <input
                type="email"
                placeholder="Email Address"
                className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all placeholder:text-slate-600 font-medium"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <div className="relative group">
              <Lock className="absolute left-4 top-4 w-5 h-5 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
              <input
                type="password"
                placeholder="Secure Password"
                className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all placeholder:text-slate-600 font-medium"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
              />
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-gradient-to-r from-indigo-600 to-indigo-500 text-white rounded-2xl font-bold flex items-center justify-center gap-3 shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:shadow-[0_0_30px_rgba(79,70,229,0.5)] transition-all disabled:opacity-70"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
              <>
                <span className="tracking-wide">{isLogin ? "Authenticate" : "Initialize Profile"}</span>
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </motion.button>
        </form>

        <div className="mt-10 text-center">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-xs font-bold uppercase tracking-widest text-slate-500 hover:text-indigo-400 transition-colors flex items-center justify-center gap-2 mx-auto group"
          >
            <Sparkles className="w-4 h-4 group-hover:animate-pulse" />
            {isLogin ? "New here? Create Uplink" : "Existing User? Sign In"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
