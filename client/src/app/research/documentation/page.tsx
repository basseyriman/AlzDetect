import Link from "next/link";
import { ArrowLeft, Cpu, Terminal, AlertCircle } from "lucide-react";
import { Navbar } from "@/components/Navbar";

export default function DocumentationPage() {
    return (
        <div className="min-h-screen bg-[#F8FAFC] neural-gradient">
            <Navbar />

            <main className="max-w-4xl mx-auto px-4 py-20">
                <div className="mb-12">
                    <Link href="/research" className="inline-flex items-center gap-2 text-indigo-600 font-semibold hover:gap-3 transition-all">
                        <ArrowLeft className="w-5 h-5" />
                        Architecture Overview
                    </Link>
                </div>

                <div className="space-y-16">
                    <div className="space-y-4">
                        <h1 className="text-4xl font-black text-slate-900 tracking-tight">Technical Documentation</h1>
                        <p className="text-slate-500 font-light text-lg">Detailed guide for clinical analysts and developers on how to interact with the AlzDetect system.</p>
                    </div>

                    {/* QUICK START */}
                    <section className="space-y-6">
                        <h2 className="text-2xl font-bold text-slate-900 border-l-4 border-indigo-600 pl-4">System Overview</h2>
                        <p className="text-slate-600 font-light leading-relaxed">
                            AlzDetect is built with a decoupled architecture: a **FastAPI** backend handling the deep learning inference and a **Next.js** frontend for the diagnostic dashboard.
                        </p>
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="p-8 bg-white rounded-3xl border border-slate-100 shadow-sm space-y-4">
                                <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
                                    <Cpu className="w-6 h-6" />
                                </div>
                                <h3 className="font-bold text-slate-900">Inference Engine</h3>
                                <p className="text-sm text-slate-500 font-light leading-relaxed">Python-based environment running TensorFlow and Vit-Keras for high-performance MRI processing.</p>
                            </div>
                            <div className="p-8 bg-white rounded-3xl border border-slate-100 shadow-sm space-y-4">
                                <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
                                    <Terminal className="w-6 h-6" />
                                </div>
                                <h3 className="font-bold text-slate-900">Diagnostic API</h3>
                                <p className="text-sm text-slate-500 font-light leading-relaxed">RESTful endpoints for file upload, disease classification, and attention map retrieval.</p>
                            </div>
                        </div>
                    </section>

                    {/* DIAGNOSTIC PROTOCOL */}
                    <section className="space-y-8 glass-card p-10 rounded-[3rem]">
                        <h2 className="text-2xl font-bold text-slate-900">Diagnostic Protocol</h2>
                        <div className="space-y-8">
                            {[
                                { title: "Image Normalization", desc: "Inputs must be resized to 224x224 and normalized to a range of 0 to 1 before entering the transformer patches." },
                                { title: "Attention Heatmapping", desc: "The attention maps are generated via a 16-layer attention rollout and overlayed with a customized JET colormap." },
                                { title: "Decision Support", desc: "Results are presented with classification probabilities across four dementia stages." }
                            ].map((step, i) => (
                                <div key={i} className="flex gap-6">
                                    <div className="w-8 h-8 bg-indigo-600 text-white rounded-lg flex items-center justify-center shrink-0 text-xs font-black">
                                        {(i + 1).toString().padStart(2, '0')}
                                    </div>
                                    <div className="space-y-2">
                                        <h4 className="font-bold text-slate-900">{step.title}</h4>
                                        <p className="text-slate-500 font-light text-sm leading-relaxed">{step.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* WARNINGS */}
                    <section className="p-8 bg-amber-50 rounded-[2rem] border border-amber-100 flex gap-6">
                        <AlertCircle className="w-8 h-8 text-amber-600 shrink-0" />
                        <div className="space-y-2">
                            <h4 className="font-black text-amber-900 uppercase tracking-widest text-[10px]">Diagnostic Prototype Warning</h4>
                            <p className="text-amber-800 text-sm font-light leading-relaxed italic">
                                AlzDetect is a technical prototype designed for demonstration purposes. It is not intended for clinical use or primary diagnosis without verification by a certified medical professional.
                            </p>
                        </div>
                    </section>
                </div>
            </main>
        </div>
    );
}
