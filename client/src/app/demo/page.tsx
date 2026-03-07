import Link from "next/link";
import { ArrowLeft, Play, Activity, Cpu, Sparkles, Brain, CheckCircle2 } from "lucide-react";
import { Navbar } from "@/components/Navbar";

export default function DemoPage() {
    return (
        <div className="min-h-screen bg-[#F8FAFC] neural-gradient">
            <Navbar />

            <main className="max-w-7xl mx-auto px-4 py-20 text-center">
                <div className="mb-12 text-left">
                    <Link href="/" className="inline-flex items-center gap-2 text-indigo-600 font-semibold hover:gap-3 transition-all">
                        <ArrowLeft className="w-5 h-5" />
                        Back to Portal
                    </Link>
                </div>

                <div className="max-w-4xl mx-auto space-y-12 mb-20">
                    <div className="space-y-6">
                        <div className="inline-flex items-center justify-center w-20 h-20 bg-indigo-600 rounded-[2rem] shadow-2xl shadow-indigo-600/30 mb-4 animate-pulse-slow">
                            <Play className="w-8 h-8 text-white fill-white ml-1" />
                        </div>
                        <h1 className="text-5xl lg:text-6xl font-black text-slate-900 tracking-tight">System Live Demo</h1>
                        <p className="text-xl text-slate-500 font-light leading-relaxed">
                            Explore the end-to-end diagnostic pipeline of the AlzDetect AI system. Witness how MRI images are transformed into intelligent diagnostic support signals.
                        </p>
                    </div>
                    <div className="flex justify-center gap-6">
                        <Link href="/detect" className="btn-premium px-12 py-5 text-lg">
                            Analyze Your Scan
                        </Link>
                    </div>
                </div>

                {/* DEMO INTERFACE PREVIEW */}
                <section className="mb-32">
                    <div className="glass-morphism rounded-[3rem] p-10 max-w-5xl mx-auto border-white/50 shadow-3xl text-left bg-white/40 overflow-hidden relative group">
                        <div className="absolute inset-0 bg-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                        <div className="flex flex-col lg:flex-row gap-12 items-center">
                            <div className="lg:w-1/2 space-y-8">
                                <div className="space-y-2">
                                    <h3 className="text-3xl font-black text-slate-900 tracking-tight">Interactive Playground</h3>
                                    <p className="text-slate-500 font-light">Experience the full power of Vision Transformers.</p>
                                </div>
                                <div className="space-y-6">
                                    {[
                                        { icon: <Activity className="w-5 h-5" />, title: "Real-time Processing", desc: "MRI analysis in under 5 seconds." },
                                        { icon: <Cpu className="w-5 h-5" />, title: "Model Confidence", desc: "Detailed probability distribution across classes." },
                                        { icon: <Sparkles className="w-5 h-5" />, title: "Attention Visuals", desc: "Dynamic heatmaps for clinical validation." }
                                    ].map((feat, i) => (
                                        <div key={i} className="flex gap-4 p-4 rounded-2xl border border-white hover:bg-white hover:shadow-sm transition-all">
                                            <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 shrink-0">
                                                {feat.icon}
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-slate-900 text-sm">{feat.title}</h4>
                                                <p className="text-xs text-slate-400 font-light mt-1">{feat.desc}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="lg:w-1/2 relative">
                                <div className="relative rounded-[2.5rem] overflow-hidden border-8 border-white shadow-2xl animate-float">
                                    <img src="/ai_brain.png" alt="Demo Brain" className="w-full grayscale hover:grayscale-0 transition-all duration-1000" />
                                    <div className="absolute inset-0 bg-indigo-500/10 flex items-center justify-center">
                                        <Brain className="w-16 h-16 text-white opacity-40" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* GUIDED STEPS */}
                <section className="grid md:grid-cols-4 gap-12 mb-20 text-left">
                    {[
                        { title: "Select Scan", desc: "Choose a high-res axial MRI slice for analysis." },
                        { title: "Tokenize", desc: "The system splits the MRI into 49 visual tokens." },
                        { title: "Layer Attention", desc: "Multi-head attention maps neural dependencies." },
                        { title: "Final Insights", desc: "Confidence scores and stage classification results." }
                    ].map((step, i) => (
                        <div key={i} className="space-y-4">
                            <div className="text-4xl font-black text-indigo-100 italic">{(i + 1).toString().padStart(2, '0')}</div>
                            <h4 className="text-lg font-bold text-slate-900">{step.title}</h4>
                            <p className="text-slate-500 text-sm font-light leading-relaxed">{step.desc}</p>
                        </div>
                    ))}
                </section>
            </main>
        </div>
    );
}
