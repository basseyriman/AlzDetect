import Link from "next/link";
import { Brain, Activity, BarChart2, ArrowRight, Shield, Zap } from "lucide-react";
import { Navbar } from "@/components/Navbar";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero */}
        <section className="pt-16 pb-24 text-center">
          <h1 className="text-5xl sm:text-6xl font-bold text-gray-900 tracking-tight mb-6">
            AI-Powered Brain MRI Analysis
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-10">
            Detect and classify cognitive stages from brain MRI scans using Vision Transformers. Get insights, attention maps, and treatment suggestions in one place.
          </p>
          <Link
            href="/detect"
            className="inline-flex items-center gap-2 px-8 py-4 bg-indigo-600 text-white text-lg font-semibold rounded-xl
              shadow-lg shadow-indigo-500/25 hover:bg-indigo-700 hover:shadow-xl hover:shadow-indigo-500/30
              transition-all duration-300 hover:-translate-y-0.5"
          >
            Start Analysis
            <ArrowRight className="w-5 h-5" />
          </Link>
        </section>

        {/* Features */}
        <section className="py-16 pb-24">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
              <div className="p-3 bg-indigo-50 rounded-xl w-fit mb-4">
                <Brain className="w-8 h-8 text-indigo-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Vision Transformer Model</h3>
              <p className="text-gray-600 text-sm">
                State-of-the-art ViT-B32 architecture fine-tuned on brain MRI scans for accurate classification.
              </p>
            </div>
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
              <div className="p-3 bg-indigo-50 rounded-xl w-fit mb-4">
                <Zap className="w-8 h-8 text-indigo-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Attention Map Visualization</h3>
              <p className="text-gray-600 text-sm">
                See where the model focuses on your scan. Get AI-powered interpretation and treatment suggestions.
              </p>
            </div>
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
              <div className="p-3 bg-indigo-50 rounded-xl w-fit mb-4">
                <Shield className="w-8 h-8 text-indigo-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Four-Stage Classification</h3>
              <p className="text-gray-600 text-sm">
                NonDemented, VeryMildDemented, MildDemented, and ModerateDemented with confidence scores.
              </p>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="pb-24 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Ready to analyze your scan?</h2>
          <p className="text-gray-600 mb-6">Upload a brain MRI image and get results in seconds.</p>
          <Link
            href="/detect"
            className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <Activity className="w-4 h-4" />
            Go to Analysis
          </Link>
        </section>
      </main>
    </div>
  );
}
