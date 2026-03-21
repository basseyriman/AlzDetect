"use client";

import { useAuth } from "@/contexts/AuthContext";
import { getResults, StoredResult } from "@/lib/storage";
import { useState, useEffect } from "react";
import { 
  Activity, 
  Brain, 
  Clock, 
  History, 
  ArrowRight, 
  FileText,
  TrendingUp,
  Award,
  ShieldCheck,
  Plus
} from "lucide-react";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";

export default function DashboardPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [results, setResults] = useState<StoredResult[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    lastClass: "N/A",
    avgConfidence: 0,
    mostFrequent: "N/A"
  });

  useEffect(() => {
    const fetchAndCalculate = async () => {
      const historicalResults = await getResults();
      setResults(historicalResults);

      if (historicalResults.length > 0) {
        const last = historicalResults[0];
        const avgConf = historicalResults.reduce((acc, curr) => acc + (curr.class_probabilities[curr.predicted_class] || 0), 0) / historicalResults.length;
        
        const counts: Record<string, number> = {};
        historicalResults.forEach(r => {
          counts[r.predicted_class] = (counts[r.predicted_class] || 0) + 1;
        });
        const mostFreq = Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];

        setStats({
          total: historicalResults.length,
          lastClass: last.predicted_class,
          avgConfidence: avgConf,
          mostFrequent: mostFreq
        });
      }
    };

    fetchAndCalculate();
  }, []);

  if (authLoading) return <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center italic text-slate-400">Initializing Portal...</div>;
  if (!isAuthenticated) return <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center italic text-slate-400">Unauthorized Access.</div>;

  return (
    <div className="min-h-screen bg-[#F8FAFC] neural-gradient pb-20">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 lg:pt-20">
        {/* Header Column */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12 animate-fade-in">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white border border-slate-100 rounded-full text-[10px] font-black uppercase tracking-widest text-indigo-600 shadow-sm italic">
              <ShieldCheck className="w-3.5 h-3.5" />
              Verified Account Active
            </div>
            <h1 className="text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-none">
              Welcome back, <br />
              <span className="text-gradient lowercase italic">@{user?.email?.split('@')[0]}</span>
            </h1>
            <p className="text-slate-500 font-light max-w-xl">
              Diagnosis Pulse Overview: Accessing historical Vision Transformer logs and anatomical focus indices.
            </p>
          </div>
          <Link 
            href="/detect" 
            className="btn-premium px-8 py-4 flex items-center gap-3 shadow-2xl shadow-indigo-600/20 group"
          >
            <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-500" />
            Analyze New Volume
          </Link>
        </div>

        {/* Primary Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12 animate-fade-in" style={{ animationDelay: '100ms' }}>
          {[
            { label: "Total Neural Scans", val: stats.total, icon: <History className="w-6 h-6" />, color: "indigo" },
            { label: "Latest Diagnostic", val: stats.lastClass, icon: <Activity className="w-6 h-6" />, color: "emerald", isText: true },
            { label: "Avg Analysis Confidence", val: `${(stats.avgConfidence * 100).toFixed(1)}%`, icon: <TrendingUp className="w-6 h-6" />, color: "violet" },
            { label: "Most Frequent Stage", val: stats.mostFrequent, icon: <Award className="w-6 h-6" />, color: "amber", isText: true }
          ].map((stat, i) => (
            <div key={i} className="glass-card rounded-[2.5rem] p-8 border-white group hover:-translate-y-2 transition-all duration-500 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-slate-900/5 blur-[40px] rounded-full translate-x-12 -translate-y-12"></div>
              <div className="flex items-center justify-between mb-8">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg transition-transform group-hover:scale-110
                  ${stat.color === 'indigo' ? 'bg-indigo-600 text-white shadow-indigo-200' : 
                    stat.color === 'emerald' ? 'bg-emerald-500 text-white shadow-emerald-200' : 
                    stat.color === 'violet' ? 'bg-violet-600 text-white shadow-violet-200' : 
                    'bg-amber-500 text-white shadow-amber-200'}`}>
                  {stat.icon}
                </div>
                <div className="h-1.5 w-8 bg-slate-100 rounded-full"></div>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
                <div className={`font-black tracking-tight leading-none overflow-hidden text-ellipsis
                  ${stat.isText ? 'text-xl italic text-slate-900' : 'text-3xl text-slate-900'}`}>
                  {stat.val}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Dashboard Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Recent History Table Preview */}
          <div className="lg:col-span-2 space-y-8 animate-fade-in" style={{ animationDelay: '200ms' }}>
            <div className="flex items-center justify-between px-4">
              <div className="flex items-center gap-3">
                <History className="w-5 h-5 text-indigo-600" />
                <h2 className="text-xl font-black text-slate-900 tracking-tight italic">Temporal Log Preview</h2>
              </div>
              <Link href="/results" className="text-xs font-black text-indigo-600 hover:gap-2 flex items-center gap-1 transition-all uppercase tracking-widest">
                Full Archive <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {results.length > 0 ? (
              <div className="glass-card rounded-[3rem] p-4 border-white shadow-2xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-slate-100">
                        <th className="py-6 px-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Time</th>
                        <th className="py-6 px-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Volume</th>
                        <th className="py-6 px-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">Output</th>
                        <th className="py-6 px-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Confidence</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {results.slice(0, 5).map((result) => (
                        <tr key={result.id} className="group hover:bg-slate-50/50 transition-colors">
                          <td className="py-6 px-4">
                            <span className="text-[10px] font-black text-slate-900">{new Date(result.timestamp).toLocaleDateString()}</span>
                          </td>
                          <td className="py-6 px-4">
                            <div className="flex items-center gap-2">
                              <FileText className="w-3.5 h-3.5 text-slate-300" />
                              <span className="text-[11px] font-bold text-slate-600 truncate max-w-[100px]">{result.fileName}</span>
                            </div>
                          </td>
                          <td className="py-6 px-4 text-center">
                            <span className={`inline-block px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest
                              ${result.predicted_class === 'NonDemented' ? 'bg-emerald-50 text-emerald-600' :
                                result.predicted_class === 'VeryMildDemented' ? 'bg-amber-50 text-amber-600' :
                                  'bg-red-50 text-red-600'}`}>
                              {result.predicted_class}
                            </span>
                          </td>
                          <td className="py-6 px-4">
                            <div className="flex items-center gap-2">
                              <div className="flex-1 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-indigo-500 rounded-full"
                                  style={{ width: `${(result.class_probabilities[result.predicted_class] || 0) * 100}%` }}
                                />
                              </div>
                              <span className="text-[10px] font-black italic">{(result.class_probabilities[result.predicted_class] * 100).toFixed(0)}%</span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="glass-card rounded-[3rem] p-20 text-center space-y-6 border-white bg-slate-50/50">
                <Brain className="w-12 h-12 text-slate-200 mx-auto" />
                <p className="text-sm font-light text-slate-400 italic">No diagnostic signals detected yet.</p>
                <Link href="/detect" className="btn-premium px-8 py-3 text-xs inline-flex">Initialize Pulse</Link>
              </div>
            )}
          </div>

          {/* Right Column: Information Cards */}
          <div className="space-y-10 animate-fade-in" style={{ animationDelay: '300ms' }}>
            <div className="glass-card rounded-[3rem] p-10 border-white bg-slate-900 text-white space-y-8 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12 group-hover:rotate-0 transition-transform duration-700">
                <Activity className="w-20 h-20" />
              </div>
              <div className="space-y-4 relative z-10">
                <h3 className="text-xl font-bold italic">Neural Diagnostic Integrity</h3>
                <p className="text-xs text-slate-400 font-light leading-relaxed">
                  The AlzDetect protocol utilizes pre-trained Vision Transformer weights (ViT-B/32) specifically optimized for neurodegenerative classification in high-resolution MRI data.
                </p>
                <div className="pt-4 flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400">Sequence Online</span>
                </div>
              </div>
              <div className="pt-6 border-t border-white/10 flex justify-between items-center group/btn">
                <Link href="/research" className="text-[10px] font-black uppercase tracking-widest hover:text-indigo-400 transition-colors flex items-center gap-2">
                  View Methodology <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>

            <div className="glass-card rounded-[3rem] p-10 border-white bg-indigo-50/50 space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-indigo-600 shadow-sm border border-indigo-100">
                  <Clock className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Protocol Usage</h3>
              </div>
              <div className="space-y-4">
                <p className="text-xs text-slate-500 leading-relaxed font-light">
                  Daily analysis volume is monitored for clinical consistency. Ensure all sequences are processed through the secure neural buffer.
                </p>
                <div className="p-4 bg-indigo-600 rounded-2xl flex items-center justify-between text-white">
                  <span className="text-[9px] font-black uppercase tracking-widest opacity-70">Diagnostic Tokens</span>
                  <span className="text-sm font-black italic">Unlimited Access</span>
                </div>
              </div>
            </div>
            <div className="glass-card rounded-[3rem] p-10 border-emerald-500/20 bg-gradient-to-br from-emerald-50 to-white space-y-6 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity translate-x-4 -translate-y-4">
                <ShieldCheck className="w-24 h-24 text-emerald-600" />
              </div>
              <div className="flex items-center gap-3 relative z-10">
                <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600 shadow-sm border border-emerald-200">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Enterprise Security</h3>
              </div>
              <div className="space-y-4 relative z-10">
                <p className="text-xs text-slate-600 leading-relaxed font-bold">
                  All diagnostic sequences and extracted attention maps are secured via <span className="text-emerald-700 font-black">End-to-End Encryption (E2EE)</span> and Supabase RLS.
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-[9px] font-black uppercase tracking-widest rounded-lg border border-emerald-200 shadow-sm">HIPAA Architecture Ready</span>
                  <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-[9px] font-black uppercase tracking-widest rounded-lg border border-emerald-200 shadow-sm">PostgreSQL Protected</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
