import Link from "next/link";
import { ArrowLeft, Shield, Lock, Eye, CheckCircle2 } from "lucide-react";
import { Navbar } from "@/components/Navbar";

export default function PrivacyPage() {
    return (
        <div className="min-h-screen bg-[#F8FAFC] neural-gradient">
            <Navbar />

            <main className="max-w-3xl mx-auto px-4 py-20">
                <div className="mb-12">
                    <Link href="/" className="inline-flex items-center gap-2 text-indigo-600 font-semibold hover:gap-3 transition-all">
                        <ArrowLeft className="w-5 h-5" />
                        Back to Portal
                    </Link>
                </div>

                <section className="space-y-12 bg-white/60 glass-morphism p-12 rounded-[3.5rem] border-white">
                    <div className="space-y-4 text-center">
                        <h1 className="text-4xl font-black text-slate-900 tracking-tight">Privacy Policy</h1>
                        <p className="text-slate-500 font-light">Last updated: March 7, 2026</p>
                    </div>

                    <div className="space-y-10 text-slate-600 font-light leading-relaxed">
                        <div className="space-y-4">
                            <h3 className="text-xl font-bold text-slate-900">Research Data Integrity</h3>
                            <p>
                                AlzDetect is a research-driven diagnostic prototype. We prioritize the security and privacy of uploaded medical imaging data. Any MRI images uploaded for analysis are processed exclusively for classification purposes and are not stored in any permanent medical records through this platform.
                            </p>
                        </div>

                        <div className="grid sm:grid-cols-2 gap-8">
                            <div className="space-y-3">
                                <div className="flex items-center gap-2 text-indigo-600 font-bold">
                                    <Lock className="w-4 h-4" />
                                    Secure Handling
                                </div>
                                <p className="text-sm">End-to-end encryption for all MRI scan uploads during the analysis phase.</p>
                            </div>
                            <div className="space-y-3">
                                <div className="flex items-center gap-2 text-indigo-600 font-bold">
                                    <Eye className="w-4 h-4" />
                                    Anonymized Processing
                                </div>
                                <p className="text-sm">Metadata and patient identifiers are stripped before the Vision Transformer analysis.</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h3 className="text-xl font-bold text-slate-900">Information We Collect</h3>
                            <p>
                                We collect basic usage metrics and anonymized classification results to improve the underlying Vision Transformer model. This information is used strictly for academic research and model refinement.
                            </p>
                        </div>

                        <div className="p-8 bg-indigo-50/50 rounded-3xl border border-indigo-100/50 space-y-4">
                            <h4 className="font-bold text-indigo-900 text-sm">HIPAA Compliance Disclosure</h4>
                            <p className="text-indigo-800 text-xs italic">
                                While AlzDetect follows best practices for medical data security, this instance is a research demonstration and should not be used for HIPAA-regulated patient workflows without enterprise-grade deployment.
                            </p>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
}
