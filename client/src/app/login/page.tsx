"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Brain, ArrowRight, Mail, Lock, Sparkles, ShieldCheck, Loader2, AlertCircle } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [signupSuccess, setSignupSuccess] = useState(false);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        
        // Supabase returns a user on signup even if email confirmation is required
        if (data.user) {
          setSignupSuccess(true);
          toast.success("Clinical ID Prepared");
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          if (error.message.includes("Email not confirmed")) {
            setError("Your Clinical ID is not yet active. Please check your email for the activation link.");
            toast.error("Activation Required");
          } else {
            throw error;
          }
        } else {
          toast.success("Portal Access Granted");
        }
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (signupSuccess) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] neural-gradient flex flex-col justify-center items-center p-6 text-center">
        <div className="w-full max-w-md space-y-8 animate-fade-in glass-card rounded-[3rem] p-12 border-white shadow-2xl">
          <div className="p-6 bg-emerald-500 rounded-[2rem] inline-block shadow-2xl shadow-emerald-500/20">
            <Mail className="w-12 h-12 text-white" />
          </div>
          <div className="space-y-4">
            <h2 className="text-3xl font-black text-slate-900 tracking-tight italic">Activation Required</h2>
            <p className="text-slate-500 font-light leading-relaxed">
              We&apos;ve sent a secure activation link to <span className="font-bold text-slate-900">{email}</span>.
            </p>
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-400">
              Please verify your email to initialize your clinical profile.
            </div>
          </div>
          <button 
            onClick={() => { setSignupSuccess(false); setIsSignUp(false); }}
            className="text-sm font-black text-indigo-600 hover:text-indigo-700 uppercase tracking-widest mt-8 italic"
          >
            Back to Portal Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] neural-gradient flex flex-col justify-center items-center p-6">
      {/* Background Decorative Elements */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/10 blur-[120px] rounded-full animate-pulse-slow"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-violet-500/10 blur-[120px] rounded-full animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="w-full max-w-md space-y-10 animate-fade-in">
        <div className="text-center space-y-6">
          <Link href="/" className="inline-flex items-center gap-4 group">
            <div className="p-4 bg-indigo-600 rounded-[1.5rem] shadow-2xl shadow-indigo-600/20 group-hover:rotate-6 transition-all duration-500">
              <Brain className="w-8 h-8 text-white" />
            </div>
            <div className="text-left">
              <h1 className="text-3xl font-black text-slate-900 tracking-tight leading-none">AlzDetect</h1>
              <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mt-1">Production Environment</p>
            </div>
          </Link>
          <div className="space-y-2">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight italic">
              {isSignUp ? "Create Clinical ID" : "Neural Portal Login"}
            </h2>
            <p className="text-slate-500 text-sm font-light leading-relaxed">
              {isSignUp ? "Join the clinical diagnostic network." : "Access the diagnostic archive and Vision Transformer."}
            </p>
          </div>
        </div>

        <div className="glass-card rounded-[3rem] p-10 border-white shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
            <ShieldCheck className="w-24 h-24" />
          </div>

          <form onSubmit={handleAuth} className="space-y-6 relative z-10">
            {error && (
              <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 text-xs font-bold animate-shake">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div className="space-y-2 group/input">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Medical Email</label>
                <div className="relative">
                  <Mail className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within/input:text-indigo-500 transition-colors" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="dr.name@hospital.com"
                    className="w-full pl-14 pr-6 py-5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2 group/input">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Secure Key</label>
                <div className="relative">
                  <Lock className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within/input:text-indigo-500 transition-colors" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-14 pr-6 py-5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-premium w-full flex items-center justify-center gap-3 py-6 group/btn disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  {isSignUp ? "Initialize Clinical ID" : "Access Diagnostic Portal"}
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-slate-100 text-center">
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-xs font-black text-slate-400 uppercase tracking-widest hover:text-indigo-600 transition-colors italic"
            >
              {isSignUp ? "Already have an ID? Login" : "New Clinician? Create ID"}
            </button>
          </div>
        </div>

        <div className="flex flex-col items-center space-y-4 pt-4">
          <div className="flex items-center gap-2 px-4 py-2 bg-white/40 glass-morphism rounded-xl border border-white text-[9px] font-black uppercase tracking-widest text-slate-500">
            <Sparkles className="w-3 h-3 text-indigo-500" />
            Supabase Edge Authentication Active
          </div>
          <p className="text-[10px] text-slate-400 font-medium italic text-center max-w-xs">
            TECHNICAL EVIDENCE: System utilizes Supabase GoTrue for secure identity management and RLS policy enforcement.
          </p>
        </div>
      </div>
    </div>
  );
}
