import Link from "next/link";
import Image from "next/image";
import { Brain, Activity, ArrowRight, Shield, Zap, CheckCircle2, Cpu, BarChart3, Search } from "lucide-react";
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
                <SparklesIcon className="w-3.5 h-3.5" />
                <span>Next-Gen Alzheimer's Detection</span>
              </div>
              <h1 className="text-5xl lg:text-7xl font-extrabold text-slate-900 tracking-tight leading-[1.1]">
                AI-Powered <br />
                <span className="text-gradient">Brain MRI Analysis</span>
              </h1>
              <p className="text-xl text-slate-600 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                Detect and classify cognitive stages from brain MRI scans using state-of-the-art Vision Transformers and Explainable AI.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-4">
                <Link href="/detect" className="btn-premium">
                  Start Analysis
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
                <button className="px-8 py-4 text-slate-600 font-semibold rounded-2xl border border-slate-200 hover:bg-white transition-all flex items-center">
                  View Demo
                </button>
              </div>
            </div>

            <div className="relative animate-float lg:block">
              <div className="absolute -inset-4 bg-gradient-to-tr from-indigo-500/20 to-purple-500/20 blur-3xl opacity-50 rounded-full"></div>
              <div className="relative rounded-3xl overflow-hidden glass-morphism p-2">
                <Image
                  src="/ai_brain_scan_visualization_1772922137555.png"
                  alt="AI Brain Analysis Visualization"
                  width={600}
                  height={600}
                  className="rounded-2xl transition-transform duration-700 hover:scale-105"
                  priority
                />
              </div>
            </div>
          </div>
        </section>

        {/* 2. TRUST / CREDIBILITY STRIP */}
        <section className="py-12 border-y border-slate-100 bg-white/50 backdrop-blur-sm px-4">
          <div className="max-w-7xl mx-auto flex flex-wrap justify-center items-center gap-8 md:gap-16">
            <div className="flex items-center gap-2 text-slate-400 font-medium whitespace-nowrap">
              <Cpu className="w-5 h-5" />
              <span>Vision Transformer Architecture</span>
            </div>
            <div className="flex items-center gap-2 text-slate-400 font-medium whitespace-nowrap">
              <Search className="w-5 h-5" />
              <span>Explainable AI (XAI)</span>
            </div>
            <div className="flex items-center gap-2 text-slate-400 font-medium whitespace-nowrap">
              <Activity className="w-5 h-5" />
              <span>Medical Imaging Analysis</span>
            </div>
            <div className="flex items-center gap-2 text-slate-400 font-medium whitespace-nowrap">
              <CheckCircle2 className="w-5 h-5" />
              <span>Diagnostic Support System</span>
            </div>
          </div>
        </section>

        {/* 3. FEATURES SECTION */}
        <section className="py-32 px-4 sm:px-6 lg:px-8 bg-slate-50/50">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-20">
              <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">Diagnostic Innovation</h2>
              <p className="text-slate-600 max-w-2xl mx-auto italic">High-precision detection through advanced deep learning research.</p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  icon: <Cpu className="w-7 h-7" />,
                  title: "Vision Transformer Model",
                  desc: "Fine-tuned ViT architecture trained on expansive brain MRI datasets for maximum diagnostic accuracy.",
                  color: "indigo"
                },
                {
                  icon: <BarChart3 className="w-7 h-7" />,
                  title: "Attention Map Visualization",
                  desc: "Built-in Explainable AI heatmaps that visualize the specific brain regions influencing each prediction.",
                  color: "violet"
                },
                {
                  icon: <Activity className="w-7 h-7" />,
                  title: "Four-Stage Classification",
                  desc: "Reliable detection across NonDemented, VeryMild, Mild, and ModerateDemented cognitive stages.",
                  color: "blue"
                }
              ].map((feature, i) => (
                <div key={i} className="glass-card rounded-3xl p-10 hover:-translate-y-2 group">
                  <div className={`p-4 bg-white shadow-sm border border-slate-100 rounded-2xl w-fit mb-8 group-hover:scale-110 transition-transform`}>
                    <div className="text-indigo-600">{feature.icon}</div>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-4">{feature.title}</h3>
                  <p className="text-slate-600 leading-relaxed text-sm">
                    {feature.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 4. HOW IT WORKS SECTION */}
        <section className="py-32 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-20">
              <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">Streamlined Pipeline</h2>
              <p className="text-slate-600">Three simple steps to generate professional AI-led insights.</p>
            </div>
            <div className="relative grid md:grid-cols-3 gap-12">
              <div className="hidden md:block absolute top-[60px] left-[15%] right-[15%] h-0.5 bg-slate-100 -z-10"></div>
              {[
                { step: "01", title: "Upload MRI Scan", desc: "Select and upload DICOM or standard MRI image files securely." },
                { step: "02", title: "AI Model Analysis", desc: "Our Vision Transformer processes the scan in real-time." },
                { step: "03", title: "View Results", desc: "Gain instant classification and attention map interpretations." }
              ].map((s, i) => (
                <div key={i} className="text-center space-y-4">
                  <div className="w-16 h-16 bg-white border-2 border-indigo-100 rounded-full flex items-center justify-center mx-auto text-xl font-bold text-indigo-600 shadow-sm">
                    {s.step}
                  </div>
                  <h4 className="text-lg font-bold text-slate-900">{s.title}</h4>
                  <p className="text-slate-500 text-sm max-w-[200px] mx-auto">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 5. LIVE DEMO MOCKUP */}
        <section className="py-20 px-4">
          <div className="max-w-5xl mx-auto glass-morphism rounded-[40px] p-4 lg:p-8 shadow-2xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 -z-10"></div>
            <div className="flex items-center justify-between mb-8 px-4">
              <div className="flex space-x-2">
                <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                <div className="w-3 h-3 bg-amber-400 rounded-full"></div>
                <div className="w-3 h-3 bg-green-400 rounded-full"></div>
              </div>
              <div className="text-xs font-mono text-slate-400 bg-slate-50 px-3 py-1 rounded-full border border-slate-100">
                alz-detect-v1.0.0-PRO
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-8 items-center p-4">
              <div className="space-y-6">
                <div className="p-6 bg-white rounded-3xl border border-slate-100 shadow-sm transform transition hover:scale-[1.02]">
                  <h5 className="text-xs font-bold text-indigo-600 uppercase tracking-widest mb-4">Patient Result</h5>
                  <div className="flex justify-between items-end">
                    <div>
                      <span className="text-3xl font-black text-slate-900">Moderate</span>
                      <p className="text-slate-400 text-xs mt-1">Classification Target</p>
                    </div>
                    <div className="text-right">
                      <span className="text-2xl font-bold text-emerald-500">98.4%</span>
                      <p className="text-slate-400 text-xs mt-1">Confidence Score</p>
                    </div>
                  </div>
                </div>
                <div className="p-6 bg-white rounded-3xl border border-slate-100 shadow-sm space-y-4">
                  <h5 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Attention Significance</h5>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden flex">
                    <div className="w-[80%] bg-indigo-500 h-full"></div>
                    <div className="w-[15%] bg-purple-400 h-full"></div>
                  </div>
                  <p className="text-[10px] text-slate-400 italic">High-focus detected in temporal lobe regions.</p>
                </div>
              </div>
              <div className="relative group">
                <Image
                  src="/ai_brain_scan_visualization_1772922137555.png"
                  alt="Analysis Preview"
                  width={400}
                  height={400}
                  className="rounded-[32px] shadow-lg border-4 border-white grayscale group-hover:grayscale-0 transition-all duration-700"
                />
                <div className="absolute inset-0 bg-indigo-500/20 opacity-0 group-hover:opacity-100 transition-opacity rounded-[32px] pointer-events-none flex items-center justify-center">
                  <div className="bg-white/90 backdrop-blur p-4 rounded-2xl shadow-xl text-indigo-600 font-bold">
                    Neural Focus Active
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 6. IMPACT SECTION */}
        <section className="py-32 px-4 sm:px-6 lg:px-8 bg-indigo-900 relative rounded-[60px] mx-4 mb-20 overflow-hidden text-white">
          <div className="absolute inset-0 opacity-20 pointer-events-none">
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_120%,rgba(168,85,247,1),transparent_50%)]"></div>
          </div>
          <div className="max-w-4xl mx-auto text-center space-y-10 relative z-10">
            <h2 className="text-4xl lg:text-5xl font-black leading-tight italic opacity-95">
              "AI is a catalyst for clinical precision."
            </h2>
            <p className="text-xl text-indigo-100/80 leading-relaxed font-light">
              Early detection of Alzheimer's disease can significantly improve treatment outcomes. AlzDetect demonstrates how AI assist clinicians by analyzing MRI scans and highlighting critical anatomical regions with unprecedented clarity.
            </p>
            <div className="pt-10 flex flex-col sm:flex-row items-center justify-center gap-6">
              <Link href="/detect" className="px-10 py-5 bg-white text-indigo-900 rounded-2xl font-black shadow-2xl hover:bg-slate-50 transition-all transform hover:-translate-y-1">
                Analyze Scan Now
              </Link>
            </div>
          </div>
        </section>

        {/* 7. FOOTER */}
        <footer className="pt-20 pb-10 border-t border-slate-100">
          <div className="max-w-7xl mx-auto px-4 grid md:grid-cols-4 gap-12 mb-20">
            <div className="col-span-1 md:col-span-2 space-y-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-600 rounded-lg">
                  <Brain className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-black text-slate-800 tracking-tight">AlzDetect</span>
              </div>
              <p className="text-slate-400 max-w-sm text-sm leading-relaxed">
                Pioneering AI research for advanced medical imaging analysis and neurodegenerative stage detection.
              </p>
            </div>
            <div className="space-y-6">
              <h6 className="font-bold text-slate-800">Platform</h6>
              <ul className="space-y-4 text-slate-500 text-sm">
                <li><Link href="/" className="hover:text-indigo-600 transition-colors">Home</Link></li>
                <li><Link href="/detect" className="hover:text-indigo-600 transition-colors">Analyze Scan</Link></li>
                <li><Link href="/results" className="hover:text-indigo-600 transition-colors">Historical Results</Link></li>
              </ul>
            </div>
            <div className="space-y-6">
              <h6 className="font-bold text-slate-800">Research</h6>
              <ul className="space-y-4 text-slate-500 text-sm">
                <li><span className="hover:text-indigo-600 transition-colors cursor-pointer">Documentation</span></li>
                <li><span className="hover:text-indigo-600 transition-colors cursor-pointer">Methodology</span></li>
                <li><span className="hover:text-indigo-600 transition-colors cursor-pointer">Privacy</span></li>
              </ul>
            </div>
          </div>
          <div className="max-w-7xl mx-auto px-4 text-center text-slate-400 text-xs font-medium uppercase tracking-widest opacity-50">
            © 2026 AlzDetect Protocol — AI-Assisted Medical Diagnostic Tool
          </div>
        </footer>
      </main>
    </div>
  );
}

function SparklesIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
      <path d="M5 3v4" />
      <path d="M19 17v4" />
      <path d="M3 5h4" />
      <path d="M17 19h4" />
    </svg>
  );
}
