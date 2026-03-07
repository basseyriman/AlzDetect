import Link from "next/link";
import { ArrowLeft, ShieldCheck, Heart, Users, Globe } from "lucide-react";
import { Navbar } from "@/components/Navbar";

export default function EthicsPage() {
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
                        <h1 className="text-4xl font-black text-slate-900 tracking-tight text-gradient">AI Ethics Ledger</h1>
                        <p className="text-slate-500 font-light">Transparency, Responsibility, and Integrity in Neuro-AI.</p>
                    </div>

                    <div className="space-y-12 text-slate-600 font-light leading-relaxed">
                        {[
                            {
                                icon: <ShieldCheck className="w-8 h-8 text-indigo-600" />,
                                title: "Transparency First",
                                content: "We believe in 'Explainable AI'. Every classification result must be accompanied by an attention map visualization, ensuring clinicians understand WHY the model reached its conclusion."
                            },
                            {
                                icon: <Heart className="w-8 h-8 text-indigo-600" />,
                                title: "Patient-Centric Design",
                                content: "AI should serve as a collaborator to human expertise. Our system is designed to reduce practitioner cognitive load, allowing more focus on patient empathy and care planning."
                            },
                            {
                                icon: <Users className="w-8 h-8 text-indigo-600" />,
                                title: "Bias Mitigation",
                                content: "We continuously audit our Vision Transformer for diagnostic bias across demographic datasets to ensure equitable diagnostic-support performance."
                            }
                        ].map((principle, i) => (
                            <div key={i} className="flex flex-col md:flex-row gap-8 items-start">
                                <div className="p-4 bg-white rounded-2xl shadow-sm border border-slate-100 shrink-0">
                                    {principle.icon}
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-xl font-bold text-slate-900">{principle.title}</h3>
                                    <p className="text-slate-500">{principle.content}</p>
                                </div>
                            </div>
                        ))}

                        <div className="p-10 bg-indigo-900 rounded-[2.5rem] text-white space-y-4 text-center relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 blur-3xl"></div>
                            <Globe className="w-12 h-12 text-indigo-300 mx-auto" />
                            <h3 className="text-2xl font-black">Our Ethical Commitment</h3>
                            <p className="text-indigo-100/70 text-sm max-w-md mx-auto">
                                To pioneering a future where AI research improves global neuro-health outcomes while upholding the highest standards of diagnostic ethics.
                            </p>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
}
