import Link from "next/link";
import { ArrowLeft, Scale, Gavel, FileText } from "lucide-react";
import { Navbar } from "@/components/Navbar";

export default function TermsPage() {
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
                        <h1 className="text-4xl font-black text-slate-900 tracking-tight">Terms of Research</h1>
                        <p className="text-slate-500 font-light uppercase tracking-widest text-[10px] font-bold">AlzDetect Protocol Usage v1.0</p>
                    </div>

                    <div className="space-y-10 text-slate-600 font-light leading-relaxed">
                        <div className="space-y-4">
                            <h3 className="text-xl font-bold text-slate-900 flex items-center gap-3">
                                <Gavel className="w-6 h-6 text-indigo-600" />
                                Usage Agreement
                            </h3>
                            <p>
                                By utilizing the AlzDetect platform, you agree to these Terms of Research. This platform is provided strictly for academic, educational, and demonstration purposes. Any diagnostic outputs generated are support signals and not definitive clinical diagnoses.
                            </p>
                        </div>

                        <div className="space-y-4">
                            <h3 className="text-xl font-bold text-slate-900 flex items-center gap-3">
                                <Scale className="w-6 h-6 text-indigo-600" />
                                Diagnostic Responsibility
                            </h3>
                            <p>
                                Total responsibility for clinical decisions remains with the attending physician or medical professional. AlzDetect authors and contributors are not liable for decisions made based on AI-generated classification results or attention maps.
                            </p>
                        </div>

                        <div className="space-y-4">
                            <h3 className="text-xl font-bold text-slate-900 flex items-center gap-3">
                                <FileText className="w-6 h-6 text-indigo-600" />
                                Intellectual Property
                            </h3>
                            <p>
                                The AlzDetect name, custom fine-tuned ViT weights, and technical methodologies are protected under academic copyright. Use in commercial products without explicit written permission is prohibited.
                            </p>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
}
