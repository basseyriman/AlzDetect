import Link from "next/link";
import { Brain, ArrowLeft, Cpu, Layers, Sparkles, Microscope, Database, Shield } from "lucide-react";
import { Navbar } from "@/components/Navbar";

export default function ResearchPage() {
    return (
        <div className="min-h-screen bg-[#F8FAFC] neural-gradient">
            <Navbar />

            <main className="max-w-7xl mx-auto px-4 py-20">
                <div className="mb-12">
                    <Link href="/" className="inline-flex items-center gap-2 text-indigo-600 font-semibold hover:gap-3 transition-all">
                        <ArrowLeft className="w-5 h-5" />
                        Back to Portal
                    </Link>
                </div>

                <div className="grid lg:grid-cols-2 gap-16 items-center mb-24">
                    <div className="space-y-8">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 border border-indigo-100 rounded-full text-indigo-600 text-xs font-bold uppercase tracking-wider">
                            Research Overview
                        </div>
                        <h1 className="text-5xl font-black text-slate-900 tracking-tight leading-tight">
                            Pioneering <span className="text-gradient">Vision Transformers</span> in Neuro-Diagnosis
                        </h1>
                        <p className="text-lg text-slate-600 font-light leading-relaxed">
                            AlzDetect represents a shift from traditional Convolutional Neural Networks (CNNs) to global-attention based architectures. Our research focuses on leveraging the "patch-based" spatial understanding of Transformers to identify subtle structural biomarkers in MRI scans associated with early-stage Alzheimer's.
                        </p>
                        <div className="grid sm:grid-cols-2 gap-6">
                            <div className="p-6 bg-white rounded-3xl border border-slate-100 shadow-sm">
                                <Database className="w-8 h-8 text-indigo-600 mb-4" />
                                <h3 className="font-bold text-slate-900 mb-2">Massive Datasets</h3>
                                <p className="text-sm text-slate-500 font-light">Trained on over 33,000 augmented MRI images for robust feature extraction.</p>
                            </div>
                            <div className="p-6 bg-white rounded-3xl border border-slate-100 shadow-sm">
                                <Brain className="w-8 h-8 text-indigo-600 mb-4" />
                                <h3 className="font-bold text-slate-900 mb-2">Global Attention</h3>
                                <p className="text-sm text-slate-500 font-light">Global context awareness captures long-range dependencies across brain tissues.</p>
                            </div>
                        </div>
                    </div>
                    <div className="relative">
                        <div className="absolute -inset-4 bg-indigo-500/10 blur-3xl rounded-full"></div>
                        <div className="relative glass-card rounded-[3rem] p-12 text-center space-y-8 border-white/40">
                            <Microscope className="w-20 h-20 text-indigo-600 mx-auto animate-float" />
                            <h2 className="text-2xl font-bold text-slate-900">Current Research Focus</h2>
                            <div className="space-y-4 text-left">
                                {[
                                    "Cross-voxel temporal dependency modeling",
                                    "Hybrid ViT-CNN feature fusion analysis",
                                    "Real-time explainable attribution maps",
                                    "Differential diagnosis via multi-head attention"
                                ].map((item, i) => (
                                    <div key={i} className="flex items-center gap-3 text-sm text-slate-600 font-medium">
                                        <Sparkles className="w-4 h-4 text-indigo-400" />
                                        {item}
                                    </div>
                                ))}
                            </div>
                            <Link href="/research/methodology" className="btn-premium w-full flex items-center justify-center gap-2">
                                Explore Methodology
                            </Link>
                        </div>
                    </div>
                </div>

                <section className="grid md:grid-cols-3 gap-8 mb-24">
                    {[
                        { title: "Methodology", path: "/research/methodology", icon: <Layers className="w-6 h-6" />, desc: "Deep dive into the ViT-B/32 architecture & training logs." },
                        { title: "Documentation", path: "/research/documentation", icon: <Cpu className="w-6 h-6" />, desc: "Technical guide on deploying and testing the model." },
                        { title: "AI Ethics", path: "/ethics", icon: <Shield className="w-6 h-6" />, desc: "Research ethics, data privacy, and diagnostic integrity." }
                    ].map((item, i) => (
                        <Link href={item.path} key={i} className="glass-card p-10 rounded-[2.5rem] group hover:-translate-y-2 transition-all">
                            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-slate-100 text-indigo-600 mb-6 group-hover:scale-110 transition-transform">
                                {item.icon}
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-3">{item.title}</h3>
                            <p className="text-slate-500 text-sm font-light leading-relaxed">{item.desc}</p>
                        </Link>
                    ))}
                </section>
            </main>
        </div>
    );
}
