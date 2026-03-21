"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getResultById, StoredResult } from "@/lib/storage";
import { useAuth } from "@/contexts/AuthContext";
import { Navbar } from "@/components/Navbar";
import { ArrowLeft, Download, ShieldCheck, Activity, Printer, ClipboardCheck, Microscope } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function DeepReportPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  
  const [result, setResult] = useState<StoredResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
      return;
    }

    const loadData = async () => {
      const data = await getResultById(id);
      if (!data) {
        router.push("/results");
      } else {
        setResult(data);
      }
      setLoading(false);
    };

    if (id) {
      loadData();
    }
  }, [id, authLoading, isAuthenticated, router]);

  if (loading || authLoading) {
    return <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center italic text-slate-400">Loading Clinical Report...</div>;
  }

  if (!result) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] neural-gradient pb-20 print-container">
      <div className="no-print">
        <Navbar />
      </div>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 lg:pt-20 print:p-0 print:max-w-full print-padding">
        {/* Actions Bar (Hidden on Print) */}
        <div className="no-print flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
          <div className="space-y-4">
            <Link href="/results" className="inline-flex items-center gap-2 text-indigo-600 font-bold text-sm hover:gap-3 transition-all">
              <ArrowLeft className="w-4 h-4" />
              Back to Archive
            </Link>
            <h1 className="text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-none">
              Clinical <span className="text-gradient">Report</span>
            </h1>
          </div>
          <div className="flex items-center gap-3">
             <button
                onClick={handlePrint}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-2xl font-bold text-xs hover:bg-indigo-700 transition-all shadow-lg active:scale-95"
              >
                <Printer className="w-4 h-4" />
                Generate Medical PDF
            </button>
          </div>
        </div>

        {/* PRINTABLE REPORT BODY */}
        <div className="bg-white rounded-[3rem] p-10 lg:p-16 shadow-2xl border border-slate-100 print:rounded-none print:border-none print:shadow-none print:p-4 print-card print-no-shadow">
          
          {/* Print Header */}
          <div className="flex justify-between items-start border-b border-slate-100 pb-10 mb-10 print:pb-6 print:mb-6">
            <div>
              <div className="flex items-center gap-3 mb-4">
                 <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200 print:shadow-none">
                    <Activity className="w-5 h-5 text-white" />
                 </div>
                 <span className="text-2xl font-black tracking-tight text-slate-900">AlzDetect</span>
              </div>
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Vision Transformer Medical Diagnostic Framework</p>
            </div>
            <div className="text-right space-y-1">
               <p className="text-sm font-bold text-slate-900">Report ID: <span className="font-mono text-slate-500">{result.id.split('-')[0].toUpperCase()}</span></p>
               <p className="text-xs text-slate-500">Date: {new Date(result.timestamp).toLocaleDateString()}</p>
               <p className="text-xs text-slate-500">Source: {result.fileName}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12 print:grid-cols-2 print:gap-8 print:mb-6 print:break-inside-avoid">
             {/* Left: AI Diagnosis */}
             <div className="space-y-8 print:space-y-6">
                 <div>
                    <h3 className="text-xs font-black text-indigo-600 uppercase tracking-widest mb-4 flex items-center gap-2">
                       <ClipboardCheck className="w-4 h-4" /> Final Diagnosis
                    </h3>
                    <div className={`px-6 py-4 rounded-2xl flex items-center justify-between border 
                       ${result.predicted_class === 'NonDemented' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                       result.predicted_class === 'VeryMildDemented' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                       result.predicted_class === 'MildDemented' ? 'bg-orange-50 text-orange-700 border-orange-100' :
                       'bg-red-50 text-red-700 border-red-100'}`}>
                        <span className="text-xl font-black">{result.predicted_class}</span>
                        <span className="text-xl font-black italic">{(result.class_probabilities[result.predicted_class] * 100).toFixed(1)}%</span>
                    </div>
                 </div>

                 <div>
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Distribution Metrics</h3>
                    <div className="space-y-4">
                      {Object.entries(result.class_probabilities)
                        .filter(([className]) => className !== result.predicted_class)
                        .sort(([, a], [, b]) => b - a)
                        .map(([className, probability]) => (
                          <div key={className} className="space-y-1">
                            <div className="flex justify-between items-center text-sm">
                              <span className="font-bold text-slate-600">{className}</span>
                              <span className="font-black text-slate-900">{(probability * 100).toFixed(1)}%</span>
                            </div>
                            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-slate-400"
                                style={{ width: `${probability * 100}%` }}
                              />
                            </div>
                          </div>
                      ))}
                    </div>
                 </div>
             </div>

             {/* Right: Vision Map */}
             <div>
                <h3 className="text-xs font-black text-indigo-600 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Microscope className="w-4 h-4" /> Neural Activation Map
                </h3>
                <div className="w-full aspect-[2/1] relative rounded-3xl overflow-hidden bg-slate-900 shadow-xl border-4 border-slate-100 print:aspect-auto print:h-[220px] print-border">
                  {result.attention_map_url ? (
                     <Image
                        src={`data:image/png;base64,${result.attention_map_url}`}
                        alt="Attention map"
                        fill
                        className="object-contain"
                        unoptimized
                     />
                  ) : (
                     <div className="absolute inset-0 flex items-center justify-center text-slate-600 text-sm">No visual data retained.</div>
                  )}
                </div>
                <p className="mt-4 text-[10px] text-slate-400 text-center uppercase tracking-widest font-bold">Generated via Manual Step-Backward Rollout</p>
             </div>
          </div>

          <div className="bg-slate-50 rounded-3xl p-6 border border-slate-100 text-sm text-slate-600 leading-relaxed font-light italic mt-10 print:mt-6 print-bg-none print:text-[11px] print:leading-snug">
            <div className="flex items-center gap-2 mb-2 not-italic font-bold text-slate-900">
               <ShieldCheck className="w-4 h-4 text-indigo-600" /> Authorized Electronic Record
            </div>
            This clinical analysis report was generated autonomously by the AlzDetect Vision Transformer module. Interpretations and proposed classifications are intended strictly for clinical assistance and validation under licensed neurological review. Not for direct diagnostic finality.
          </div>
        </div>
      </main>
    </div>
  );
}
