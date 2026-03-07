import Link from "next/link";
import { ArrowLeft, Cpu, Microscope, Activity, BarChart3, Database, Layers } from "lucide-react";
import { Navbar } from "@/components/Navbar";

export default function MethodologyPage() {
    return (
        <div className="min-h-screen bg-[#F8FAFC] neural-gradient">
            <Navbar />

            <main className="max-w-4xl mx-auto px-4 py-20">
                <div className="mb-12">
                    <Link href="/research" className="inline-flex items-center gap-2 text-indigo-600 font-semibold hover:gap-3 transition-all">
                        <ArrowLeft className="w-5 h-5" />
                        Research Overview
                    </Link>
                </div>

                <section className="space-y-12">
                    <div className="space-y-4">
                        <h1 className="text-4xl font-black text-slate-900 tracking-tight">Technical Methodology</h1>
                        <p className="text-slate-500 font-light text-lg">Detailed breakdown of the AlzDetect vision transformer model and training protocol.</p>
                    </div>

                    {/* 1. DATASET */}
                    <div className="glass-card p-10 rounded-[2.5rem] space-y-6">
                        <div className="flex items-center gap-4 text-indigo-600">
                            <Database className="w-8 h-8" />
                            <h2 className="text-2xl font-bold text-slate-900">Training Dataset</h2>
                        </div>
                        <p className="text-slate-600 font-light leading-relaxed">
                            Our model was developed using a comprehensive clinical brain MRI dataset. We utilized a multi-modal approach with extreme data augmentation to improve generalization across different scanner types.
                        </p>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            {[
                                { label: "Total Samples", val: "33,600" },
                                { label: "Augment Ratio", val: "4:1" },
                                { label: "Resolution", val: "224x224" },
                                { label: "Classes", val: "4" }
                            ].map((stat, i) => (
                                <div key={i} className="bg-slate-50/50 p-4 rounded-2xl border border-slate-100 text-center">
                                    <div className="text-lg font-black text-slate-900">{stat.val}</div>
                                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{stat.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* 2. ARCHITECTURE */}
                    <div className="glass-card p-10 rounded-[2.5rem] space-y-6">
                        <div className="flex items-center gap-4 text-indigo-600">
                            <Cpu className="w-8 h-8" />
                            <h2 className="text-2xl font-bold text-slate-900">ViT-B/32 Architecture</h2>
                        </div>
                        <p className="text-slate-600 font-light leading-relaxed">
                            We leverage the Vision Transformer (ViT) architecture, specifically the Base model with 32x32 patch sizes. Unlike CNNs, which process pixels locally, ViT treats image patches as visual tokens and uses self-attention to learn relationships between them globally.
                        </p>
                        <div className="space-y-4">
                            <div className="flex gap-4">
                                <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full mt-2 shrink-0"></div>
                                <div>
                                    <span className="font-bold text-slate-800">Patch Embedding:</span>
                                    <span className="text-slate-600 font-light ml-2">MRI scans are divided into 49 non-overlapping patches.</span>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full mt-2 shrink-0"></div>
                                <div>
                                    <span className="font-bold text-slate-800">Multi-Head Self-Attention:</span>
                                    <span className="text-slate-600 font-light ml-2">Enables the model to focus on various anatomical regions simultaneously (e.g., Hippocampus vs. Cortical thinning).</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 3. XAI */}
                    <div className="glass-card p-10 rounded-[2.5rem] space-y-6">
                        <div className="flex items-center gap-4 text-indigo-600">
                            <Layers className="w-8 h-8" />
                            <h2 className="text-2xl font-bold text-slate-900">Explainability (XAI) Protocol</h2>
                        </div>
                        <p className="text-slate-600 font-light leading-relaxed">
                            The AlzDetect system does not just provide a number. It outputs an "Attention Map" which is the visualization of the model's self-attention weights projected back onto the original MRI scan.
                        </p>
                        <div className="p-8 bg-slate-900 rounded-3xl text-indigo-200 font-mono text-sm border-indigo-700/50">
                            <span className="text-slate-500 italic">// Manual Attention Rollout Equation</span><br />
                            <span className="text-indigo-400">identity = identity_matrix(n_patches)</span><br />
                            <span className="text-indigo-400">total_attention = (attention_weights + identity) / 2</span><br />
                            <span className="text-indigo-400">weighted_result = total_attention * previous_result</span>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
}
