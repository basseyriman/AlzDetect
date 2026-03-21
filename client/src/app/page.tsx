import Link from "next/link";
import Image from "next/image";
import { Brain, Activity, ArrowRight, Cpu, BarChart3, Search, Database, Globe, Layers, Sparkles, CheckCircle2 } from "lucide-react";
import { Navbar } from "@/components/Navbar";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] neural-gradient overflow-x-hidden">
      <Navbar />

      <main>
        {/* 1. HERO SECTION */}
        <section className="relative pt-20 pb-20 lg:pt-32 lg:pb-40 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8 text-center lg:text-left z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 border border-indigo-100 rounded-full text-indigo-600 text-xs font-semibold animate-fade-in">
                <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                <span>Next-Generation Alzheimer&apos;s Diagnostic Platform</span>
              </div>
              <h1 className="text-5xl lg:text-7xl font-extrabold text-slate-900 tracking-tight leading-[1.1]">
                AI-Powered <br />
                <span className="text-gradient">Brain MRI Analysis</span>
              </h1>
              <p className="text-xl text-slate-600 max-w-xl mx-auto lg:mx-0 leading-relaxed font-light">
                Detect and classify cognitive stages from brain MRI scans using Vision Transformers and Explainable AI. AlzDetect is an enterprise-grade system designed to assist in early detection through advanced deep learning analysis.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-4">
                <Link href="/detect" className="btn-premium flex items-center gap-2">
                  Start AI Analysis
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link href="/demo" className="px-8 py-4 text-slate-600 font-semibold rounded-2xl border border-slate-200 hover:bg-white hover:shadow-sm transition-all flex items-center gap-2">
                  View Demo
                </Link>
              </div>
            </div>

            <div className="relative animate-float lg:block">
              <div className="absolute -inset-4 bg-gradient-to-tr from-indigo-500/20 to-purple-500/20 blur-3xl opacity-50 rounded-full"></div>
              <div className="relative group">
                <Image
                  src="/ai_brain.png"
                  alt="AI Brain Analysis Visualization"
                  width={600}
                  height={600}
                  className="rounded-[2.5rem] transition-transform duration-1000 group-hover:scale-105 shadow-2xl"
                  priority
                />
                <div className="absolute inset-0 rounded-[2.5rem] bg-gradient-to-t from-indigo-900/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
              </div>
            </div>
          </div>
        </section>

        {/* 2. CREDIBILITY SECTION */}
        <section className="py-12 border-y border-slate-100 bg-white/50 backdrop-blur-sm px-4">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12 lg:gap-16 opacity-70 hover:opacity-100 transition-opacity">
              {[
                { icon: <Cpu className="w-5 h-5" />, text: "Vision Transformer Deep Learning Architecture" },
                { icon: <Layers className="w-5 h-5" />, text: "Explainable AI (XAI) with Attention Map Visualization" },
                { icon: <Activity className="w-5 h-5" />, text: "Inspired by Neural Disease Detection Advancements" },
                { icon: <Search className="w-5 h-5" />, text: "High-Resolution Medical Imaging Analysis" }
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2.5 text-slate-500 text-xs font-bold tracking-widest uppercase">
                  <span className="text-indigo-600">{item.icon}</span>
                  <span>{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 3. METRICS SECTION (New) */}
        <section className="py-32 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[500px] bg-indigo-50/30 blur-[120px] rounded-full -z-10 animate-pulse-slow"></div>
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-24">
              <h2 className="text-sm font-black text-indigo-600 uppercase tracking-widest mb-6 px-4 py-1.5 bg-indigo-50 rounded-full w-fit mx-auto">Clinical Evaluation</h2>
              <h3 className="text-4xl lg:text-5xl font-bold text-slate-900 mb-6">AlzDetect in Numbers</h3>
              <p className="text-slate-500 max-w-2xl mx-auto font-light leading-relaxed">Quantifying the performance and training reach of our AI diagnostic system.</p>
            </div>
            <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-8">
              {[
                { label: "Experimental Evaluation Accuracy", val: "98.9%", icon: <Sparkles className="w-6 h-6" /> },
                { label: "MRI Training Dataset Images", val: "33,000+", icon: <Database className="w-6 h-6" /> },
                { label: "Independent Test Evaluation MRI", val: "6,000+", icon: <Search className="w-6 h-6" /> },
                { label: "Cognitive Success Rate Support", val: "0.98+", icon: <BarChart3 className="w-6 h-6" /> },
                { label: "Classified Alzheimer's Stages", val: "4", icon: <Layers className="w-6 h-6" /> }
              ].map((m, i) => (
                <div key={i} className="glass-card rounded-3xl p-8 text-center group transition-all duration-500 hover:bg-white">
                  <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-6 text-indigo-600 group-hover:scale-110 transition-transform">
                    {m.icon}
                  </div>
                  <div className="text-3xl font-black text-slate-900 mb-2 group-hover:text-indigo-600 transition-colors">{m.val}</div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-normal px-2">
                    {m.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 4. FEATURES SECTION */}
        <section className="py-32 px-4 sm:px-6 lg:px-8 bg-slate-50/50">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-24">
              <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">Diagnostic Innovation</h2>
              <p className="text-slate-600 max-w-2xl mx-auto font-light italic">High-precision detection through enterprise-grade deep learning models.</p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  icon: <Cpu className="w-7 h-7" />,
                  title: "Vision Transformer Model",
                  desc: "State-of-the-art ViT-B/32 architecture fine-tuned on brain MRI scans for high-accuracy classification.",
                  color: "indigo"
                },
                {
                  icon: <Sparkles className="w-7 h-7" />,
                  title: "Explainable AI (XAI)",
                  desc: "Visual heatmaps reveal which brain regions influence model predictions, improving clinical interpretability.",
                  color: "violet"
                },
                {
                  icon: <Activity className="w-7 h-7" />,
                  title: "Four-Stage Classification",
                  desc: "Reliable detection across NonDemented, VeryMild, Mild, and ModerateDemented cognitive stages.",
                  color: "blue"
                }
              ].map((feature, i) => (
                <div key={i} className="glass-card rounded-3xl p-10 hover:-translate-y-2 group relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 blur-[50px] rounded-full"></div>
                  <div className={`p-4 bg-white shadow-sm border border-slate-100 rounded-2xl w-fit mb-8 group-hover:scale-110 group-hover:shadow-indigo-500/10 transition-all`}>
                    <div className="text-indigo-600">{feature.icon}</div>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-4">{feature.title}</h3>
                  <p className="text-slate-600 leading-relaxed text-sm font-light">
                    {feature.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 5. HOW IT WORKS SECTION */}
        <section className="py-32 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-24">
              <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">The AlzDetect Process</h2>
              <p className="text-slate-600 font-light italic">From raw imaging to definitive AI-powered insights.</p>
            </div>
            <div className="relative grid md:grid-cols-3 gap-16">
              <div className="hidden md:block absolute top-[60px] left-[15%] right-[15%] h-[2px] bg-gradient-to-r from-transparent via-indigo-100 to-transparent -z-10"></div>
              {[
                { step: "01", icon: <Database className="w-6 h-6" />, title: "Upload MRI Scan", desc: "Securely upload high-resolution DICOM or standard brain MRI images." },
                { step: "02", icon: <Cpu className="w-6 h-6" />, title: "AI Neural Analysis", desc: "Our Vision Transformer architecture processes the scan in real-time." },
                { step: "03", icon: <CheckCircle2 className="w-6 h-6" />, title: "View Final Results", desc: "Receive stage classification, confidence scores, and attention maps." }
              ].map((s, i) => (
                <div key={i} className="text-center space-y-6 group">
                  <div className="relative w-24 h-24 bg-white border border-indigo-50 rounded-[2rem] flex items-center justify-center mx-auto shadow-sm group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                    <span className="absolute -top-3 -right-3 w-8 h-8 bg-indigo-600 text-white rounded-xl flex items-center justify-center text-xs font-black shadow-lg shadow-indigo-600/30">
                      {s.step}
                    </span>
                    <div className="text-indigo-500">{s.icon}</div>
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-lg font-bold text-slate-900">{s.title}</h4>
                    <p className="text-slate-500 text-sm max-w-[200px] mx-auto font-light leading-relaxed">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 6. LIVE DEMO MOCKUP */}
        <section className="py-20 px-4">
          <div className="max-w-6xl mx-auto glass-morphism rounded-[3rem] p-4 lg:p-10 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-6 lg:p-10 z-50 pointer-events-none">
              <div className="px-4 py-2 bg-slate-900 text-white text-[10px] font-black tracking-widest uppercase rounded-xl shadow-lg border border-slate-700 animate-pulse">
                System Live: 1.0.4-PRO
              </div>
            </div>
            <div className="grid lg:grid-cols-5 gap-10 items-start">
              {/* Sidebar Controls Mock */}
              <div className="lg:col-span-2 space-y-6">
                <div className="p-8 bg-white/60 rounded-[2rem] border border-white shadow-sm space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Diagnostic Verdict</label>
                    <div className="flex items-center justify-between">
                      <span className="text-4xl font-black text-indigo-600 italic">Moderate</span>
                      <div className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-lg text-xs font-bold ring-1 ring-indigo-200">Stage Identified</div>
                    </div>
                  </div>
                  <div className="h-[1px] bg-slate-100 italic"></div>
                  <div className="space-y-4">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-slate-500 uppercase tracking-wider">Classification Confidence</span>
                      <span className="text-emerald-500">98.4%</span>
                    </div>
                    <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden flex shadow-inner">
                      <div className="w-[98.4%] bg-gradient-to-r from-indigo-500 to-emerald-400 h-full rounded-full"></div>
                    </div>
                  </div>
                  <Link href="/detect" className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-sm flex items-center justify-center gap-3 hover:bg-indigo-600 transition-all shadow-xl shadow-slate-900/10">
                    <Activity className="w-4 h-4" />
                    Run New Analysis
                  </Link>
                </div>
                <div className="p-6 bg-slate-50 border border-slate-100 rounded-[2rem] space-y-4">
                  <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Anatomical Focus Active</h5>
                  <div className="flex gap-2">
                    <span className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-[10px] font-bold text-slate-500">Temporal Lobe</span>
                    <span className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-[10px] font-bold text-slate-500">Hippocampus</span>
                    <span className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-[10px] font-bold text-slate-500">Axial View</span>
                  </div>
                </div>
              </div>
              {/* Image Preview Mock */}
              <div className="lg:col-span-3 h-full">
                <div className="relative rounded-[2.5rem] overflow-hidden shadow-2xl h-[450px]">
                  <Image
                    src="/ai_brain.png"
                    alt="Demo Analysis"
                    fill
                    className="object-cover transition-all duration-1000 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-indigo-500/10 mix-blend-overlay"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-48 h-48 border-[3px] border-indigo-400 opacity-30 rounded-full animate-ping"></div>
                    <div className="absolute w-64 h-[2px] bg-indigo-500/50 shadow-[0_0_20px_rgba(99,102,241,0.5)] animate-scan-y top-0"></div>
                  </div>
                  <div className="absolute bottom-6 left-6 right-6 p-4 bg-white/90 backdrop-blur rounded-2xl border border-white flex items-center gap-4">
                    <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shrink-0">
                      <Brain className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-xs font-black text-slate-900">Neural Attention Mapping Signal Detect High</p>
                      <p className="text-[10px] text-slate-500 font-medium">Coordinate System: 142.3 - 88.1 - 44.5 | Voxel Data Intensity High</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 7. IMPACT SECTION */}
        <section className="py-32 px-4 sm:px-6 lg:px-8 bg-indigo-900 relative rounded-[5rem] mx-4 lg:mx-10 mb-24 overflow-hidden text-white shadow-3xl">
          <div className="absolute inset-0 opacity-20 pointer-events-none">
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_120%,rgba(168,85,247,0.5),transparent_50%)]"></div>
            <div className="grid grid-cols-10 h-full">
              {Array.from({ length: 100 }).map((_, i) => (
                <div key={i} className="border-[0.5px] border-indigo-400 opacity-10"></div>
              ))}
            </div>
          </div>
          <div className="max-w-4xl mx-auto text-center space-y-12 relative z-10">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-800/50 border border-indigo-700/50 rounded-full text-indigo-300 text-xs font-black tracking-widest uppercase">
              <Globe className="w-3.5 h-3.5" />
              Global Health Impact
            </div>
            <h2 className="text-4xl lg:text-5xl font-black leading-tight tracking-tight">
              Alzheimer’s affects over <span className="text-indigo-300">55 million people</span> globally.
            </h2>
            <p className="text-xl text-indigo-100/70 leading-relaxed font-light">
              Early detection can significantly improve treatment planning and patient outcomes. AlzDetect demonstrates how advanced deep learning models such as Vision Transformers assist clinicians by analyzing complex medical imaging data with unprecedented clarity.
            </p>
            <div className="pt-10 flex flex-col sm:flex-row items-center justify-center gap-6">
              <Link href="/detect" className="px-12 py-5 bg-white text-indigo-900 rounded-[2rem] font-black shadow-2xl hover:bg-indigo-50 transition-all transform hover:-translate-y-1 active:scale-95">
                Analyze Scan Now
              </Link>
              <Link href="/research/methodology" className="px-12 py-5 bg-indigo-800/30 text-white rounded-[2rem] border border-indigo-700 font-bold hover:bg-indigo-800 transition-all text-center">
                System Architecture
              </Link>
            </div>
          </div>
        </section>

        {/* 8. FINAL CTA SECTION */}
        <section className="py-24 text-center px-4">
          <div className="max-w-4xl mx-auto space-y-8">
            <h2 className="text-4xl lg:text-6xl font-black text-slate-900 italic tracking-tight leading-none">
              Ready to analyze <br /> your MRI scan?
            </h2>
            <p className="text-slate-500 font-light max-w-sm mx-auto italic">Generate diagnostic-support insights in seconds using the AlzDetect protocol.</p>
            <div className="flex justify-center pt-8">
              <Link href="/detect" className="btn-premium px-12 py-6 text-xl">
                Start AI Analysis
              </Link>
            </div>
          </div>
        </section>

        {/* 9. FOOTER */}
        <footer className="pt-32 pb-12 border-t border-slate-100 bg-[#F8FAFC]">
          <div className="max-w-7xl mx-auto px-4 grid md:grid-cols-4 gap-12 lg:gap-24 mb-24">
            <div className="col-span-1 md:col-span-2 space-y-8">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-indigo-600 rounded-[1.25rem] shadow-lg shadow-indigo-600/30">
                  <Brain className="w-7 h-7 text-white" />
                </div>
                <div>
                  <span className="text-3xl font-black text-slate-900 tracking-tight leading-none">AlzDetect</span>
                  <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mt-1">Medical AI Protocol</p>
                </div>
              </div>
              <p className="text-slate-400 max-w-sm text-sm leading-relaxed font-light lowercase font-mono">
                PIONEERING MACHINE LEARNING INFRASTRUCTURE FOR ADVANCED MEDICAL IMAGING ANALYSIS AND NEURODEGENERATIVE STAGE CLASSIFICATION.
              </p>
              <div className="flex gap-4">
                <div className="w-10 h-10 bg-white border border-slate-100 rounded-xl flex items-center justify-center hover:bg-indigo-50 transition-colors cursor-pointer group">
                  <Activity className="w-5 h-5 text-slate-400 group-hover:text-indigo-600" />
                </div>
                <div className="w-10 h-10 bg-white border border-slate-100 rounded-xl flex items-center justify-center hover:bg-indigo-50 transition-colors cursor-pointer group">
                  <Globe className="w-5 h-5 text-slate-400 group-hover:text-indigo-600" />
                </div>
              </div>
            </div>
            <div className="space-y-8">
              <h6 className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Platform</h6>
              <ul className="space-y-5 text-slate-500 text-sm font-medium">
                <li><Link href="/" className="hover:text-indigo-600 transition-all flex items-center gap-2"><span>Home Portal</span></Link></li>
                <li><Link href="/detect" className="hover:text-indigo-600 transition-all flex items-center gap-2"><span>Diagnostic Analysis</span></Link></li>
                <li><Link href="/results" className="hover:text-indigo-600 transition-all flex items-center gap-2"><span>Historical Data</span></Link></li>
              </ul>
            </div>
            <div className="space-y-8">
              <h6 className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Documentation</h6>
              <ul className="space-y-5 text-slate-500 text-sm font-medium">
                <li><Link href="/research/methodology" className="hover:text-indigo-600 transition-all cursor-pointer">Methodology Spec</Link></li>
                <li><Link href="/research/documentation" className="hover:text-indigo-600 transition-all cursor-pointer">Clinical Protocol</Link></li>
                <li><Link href="/privacy" className="hover:text-indigo-600 transition-all cursor-pointer">Security Ledger</Link></li>
              </ul>
            </div>
          </div>
          <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-6 text-slate-400 text-[10px] font-black uppercase tracking-widest opacity-60">
            <p>© 2026 AlzDetect Protocol — AI-Assisted Medical Diagnostic Tool</p>
            <div className="flex gap-8">
              <Link href="/privacy">Privacy Policy</Link>
              <Link href="/terms">Terms of Service</Link>
              <Link href="/ethics">Ethics Ledger</Link>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
