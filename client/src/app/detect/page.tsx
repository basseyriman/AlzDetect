"use client";


import Image from "next/image";
import { useState, useEffect } from "react";
import { CloudUpload, Paperclip, X, Sparkles, Brain, Activity, ArrowLeft, ShieldCheck, Download, ClipboardCheck, Microscope, HeartPulse } from "lucide-react";
import Link from "next/link";
import axios from "axios";
import { Navbar } from "@/components/Navbar";
import { saveResult } from "@/lib/storage";
import { toast } from "sonner";

interface AnalysisResult {
  predicted_class: 'NonDemented' | 'VeryMildDemented' | 'MildDemented' | 'ModerateDemented';
  class_probabilities: {
    NonDemented: number;
    VeryMildDemented: number;
    MildDemented: number;
    ModerateDemented: number;
  };
  attention_map_visualization: string;
}

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";

export default function DetectPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [authLoading, isAuthenticated, router]);

  const [file, setFile] = useState<File | null>(null);
  

  const [imageUrl, setImageUrl] = useState<string>("");
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [suggestions, setSuggestions] = useState<string>("");
  const [displayedSuggestions, setDisplayedSuggestions] = useState<string>("");
  const [treatmentSuggestions, setTreatmentSuggestions] = useState<string>("");
  const [displayedTreatment, setDisplayedTreatment] = useState<string>("");
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [isLoadingTreatment, setIsLoadingTreatment] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalDetails, setModalDetails] = useState({ title: '', message: '', suggestion: '' });

  // Auto-scroll to result when available
  useEffect(() => {
    if (result) {
      window.scrollTo({ top: 400, behavior: 'smooth' });
    }
  }, [result]);

  if (authLoading || !isAuthenticated) {
    return <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center italic text-slate-400">Authenticating Pulse Access...</div>;
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && isValidFileType(droppedFile)) {
      setFile(droppedFile);
      setImageUrl(URL.createObjectURL(droppedFile));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && isValidFileType(selectedFile)) {
      setFile(selectedFile);
      setImageUrl(URL.createObjectURL(selectedFile));
    }
  };

  const isValidFileType = (file: File) => {
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/svg+xml'];
    return validTypes.includes(file.type);
  };

  const removeFile = () => {
    setFile(null);
    setImageUrl("");
    setResult(null);
    setSuggestions("");
    setDisplayedSuggestions("");
    setTreatmentSuggestions("");
    setDisplayedTreatment("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setIsLoading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_HOST}/model/predict`,
        formData
      );
      const analysisResult = response.data;
      await saveResult({
        fileName: file.name,
        predicted_class: analysisResult.predicted_class,
        class_probabilities: analysisResult.class_probabilities,
        attention_map_url: analysisResult.attention_map_visualization
      });
      setResult(analysisResult);
    } catch (error) {
      console.error("Error uploading file:", error);
      if (axios.isAxiosError(error) && error.response?.status === 400) {
        const detail = error.response?.data?.detail;
        if (detail && typeof detail === 'object') {
          // Validation modal for MRI check failures
          setModalDetails({
            title: detail.error || 'Invalid Scan Type',
            message: detail.message || 'The uploaded image is not supported.',
            suggestion: detail.suggestion || 'Ensure the image is a grayscale MRI slice on a dark background for accurate analysis.'
          });
          setModalOpen(true);
        } else {
          toast.error(typeof detail === 'string' ? detail : 'Invalid request. Please try again.');
        }
      } else {
        toast.error("Connection error: The server might be taking too long to respond. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const simulateTyping = (text: string, setDisplay: React.Dispatch<React.SetStateAction<string>>, delay: number = 15) => {
    if (!text) return;
    let i = 0;
    setDisplay("");
    const timer = setInterval(() => {
      setDisplay(text.substring(0, i + 1));
      i++;
      if (i >= text.length) {
        clearInterval(timer);
      }
    }, delay);
  };

  const getAISuggestions = async () => {
    setIsLoadingSuggestions(true);
    setDisplayedSuggestions("");
    try {
      const response = await axios.post('/api/suggestions', {
        prediction: result?.predicted_class,
        confidence: result?.class_probabilities[result?.predicted_class || '']
      });

      setSuggestions(response.data.suggestions);
      simulateTyping(response.data.suggestions, setDisplayedSuggestions);
    } catch (error) {
      console.error('Error getting suggestions:', error);
    } finally {
      setIsLoadingSuggestions(false);
    }
  };

  const getTreatmentSuggestions = async () => {
    setIsLoadingTreatment(true);
    setDisplayedTreatment("");
    try {
      const response = await axios.post('/api/treatment', {
        prediction: result?.predicted_class,
        confidence: result?.class_probabilities[result?.predicted_class || '']
      });

      setTreatmentSuggestions(response.data.suggestions);
      simulateTyping(response.data.suggestions, setDisplayedTreatment);
    } catch (error) {
      console.error('Error getting treatment suggestions:', error);
      if (axios.isAxiosError(error)) {
        console.error('API Error Response:', error.response?.data);
        alert(`Error: ${error.response?.data?.error || 'Failed to generate protocol'}`);
      }
    } finally {
      setIsLoadingTreatment(false);
    }
  };

  const ValidationModal = () => {
    if (!modalOpen) return null;
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md">
        <div className="bg-white/95 rounded-[2.5rem] w-full max-w-lg p-10 shadow-2xl border border-white relative overflow-hidden animate-scale-in">
          <div className="absolute top-0 left-0 w-full h-2 bg-red-500"></div>
          <div className="flex flex-col items-center text-center space-y-6">
            <div className="w-20 h-20 bg-red-50 rounded-[2rem] flex items-center justify-center text-red-500 shadow-inner">
              <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/><path d="m14.5 9-5 5"/><path d="m9.5 9 5 5"/></svg>
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-black text-slate-900 tracking-tight capitalize">
                {modalDetails.title}
              </h3>
              <p className="text-slate-500 font-medium leading-relaxed">
                {modalDetails.message}
              </p>
            </div>
            <div className="bg-slate-50 rounded-3xl p-6 w-full text-left border border-slate-100 flex gap-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-500 shrink-0 mt-0.5"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
              <p className="text-xs text-slate-600 font-bold leading-relaxed">
                <span className="text-indigo-600 uppercase tracking-widest block mb-1">Clinical Protocol:</span>
                {modalDetails.suggestion}
              </p>
            </div>
            <button
              onClick={() => setModalOpen(false)}
              className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-sm hover:bg-slate-800 transition-all uppercase tracking-widest"
            >
              Acknowledge &amp; Dismiss
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] neural-gradient pb-20">
      <ValidationModal />
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 lg:pt-20">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
          <div className="space-y-4">
            <Link href="/" className="inline-flex items-center gap-2 text-indigo-600 font-bold text-sm hover:gap-3 transition-all">
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Link>
            <h1 className="text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-none">
              Neural <span className="text-gradient">Diagnostic</span> Analysis
            </h1>
            <p className="text-slate-500 font-light max-w-xl">
              Deploying Vision Transformer Bi-32 protocols to classify neurodegenerative stages from raw MRI voxel data.
            </p>
          </div>
          <div className="flex items-center gap-3 px-6 py-3 bg-white/60 glass-morphism rounded-2xl border border-white text-[10px] font-black uppercase tracking-widest text-indigo-600 shadow-sm animate-fade-in">
            <ShieldCheck className="w-4 h-4 opacity-70" />
            HIPAA-AWARE ENTERPRISE SECURE
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
          {/* Left Column: Upload & Classification */}
          <div className="space-y-10 animate-fade-in">
            {/* 1. Upload Section */}
            <div className="glass-card rounded-[3rem] p-8 lg:p-12 space-y-10 border-white/50 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                <Microscope className="w-24 h-24" />
              </div>
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-black text-slate-900">Sequence Upload</h2>
                <p className="text-sm text-slate-400 font-medium lowercase">Supported Formats: DICOM-to-PNG, SVG, JPG, GIF</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-8">
                <div
                  className={`relative border-2 border-dashed rounded-[2.5rem] p-12 transition-all duration-500 group/drop
                    ${isDragging ? 'border-indigo-500 bg-indigo-50/50 scale-95 shadow-2xl' : 'border-slate-200'}
                    ${file ? 'bg-slate-50/30' : 'hover:bg-slate-50/80 hover:border-indigo-300'}`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <input
                    type="file"
                    onChange={handleFileChange}
                    accept="image/*"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    style={{ display: file ? 'none' : 'block' }}
                  />

                  {!file ? (
                    <div className="flex flex-col items-center justify-center space-y-6">
                      <div className="w-20 h-20 bg-indigo-600 rounded-[2rem] flex items-center justify-center text-white shadow-xl shadow-indigo-600/30 group-hover/drop:scale-110 transition-transform animate-float">
                        <CloudUpload className="w-10 h-10" />
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-bold text-slate-900 leading-none mb-2">Select Scan Volume</p>
                        <p className="text-sm text-slate-400 font-light group-hover/drop:text-indigo-500 transition-colors">Drag and drop MRI sequence or click to browse</p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between bg-white/80 backdrop-blur p-6 rounded-3xl shadow-lg ring-1 ring-slate-100 animate-fade-in">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center">
                          <Paperclip className="h-6 w-6 text-indigo-600" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm text-slate-900 font-black truncate w-40">{file.name}</span>
                          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">MRI Slice Active</span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={removeFile}
                        className="w-10 h-10 flex items-center justify-center hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-full transition-all"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={!file || isLoading}
                  className="btn-premium w-full flex items-center justify-center gap-3 text-lg py-6"
                >
                  {isLoading ? (
                    <>
                      <Activity className="animate-spin w-5 h-5" />
                      Neural Sequence Processing...
                    </>
                  ) : (
                    <>
                      Analyze Brain Scan
                      <Activity className="w-5 h-5 opacity-50" />
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* 2. Results Section (Analysis Verdict) */}
            {result && (
              <div className="glass-card rounded-[3rem] p-10 lg:p-12 space-y-10 border-white/50 animate-fade-in">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <h2 className="text-2xl font-black text-slate-900">Analysis Verdict</h2>
                    <p className="text-xs text-slate-400 font-black tracking-widest uppercase">Class Distribution Probabilities</p>
                  </div>
                  <div className={`px-6 py-2 rounded-2xl text-xs font-black tracking-widest uppercase border shadow-sm
                    ${result.predicted_class === 'NonDemented' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                      result.predicted_class === 'VeryMildDemented' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                        result.predicted_class === 'MildDemented' ? 'bg-orange-50 text-orange-600 border-orange-100' :
                          'bg-red-50 text-red-600 border-red-100'}`}>
                    {result.predicted_class}
                  </div>
                </div>

                <div className="space-y-8">
                  {/* Primary Result Focus */}
                  <div className="p-8 bg-slate-900 rounded-[2.5rem] relative overflow-hidden group">
                    <div className="absolute inset-0 bg-indigo-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <div className="relative z-10 flex justify-between items-center mb-4">
                      <span className="text-indigo-300 text-xs font-black tracking-widest uppercase">Primary Prediction</span>
                      <span className="text-white text-3xl font-black italic">
                        {(result.class_probabilities[result.predicted_class] * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-indigo-500 to-indigo-300 transition-all duration-1000"
                        style={{ width: `${result.class_probabilities[result.predicted_class] * 100}%` }}
                      />
                    </div>
                  </div>

                  {/* Secondary results */}
                  <div className="grid gap-6">
                    {Object.entries(result.class_probabilities)
                      .filter(([className]) => className !== result.predicted_class)
                      .sort(([, a], [, b]) => b - a)
                      .map(([className, probability]) => (
                        <div key={className} className="space-y-2 group/bar">
                          <div className="flex justify-between items-center">
                            <span className="text-xs font-bold text-slate-500 group-hover/bar:text-slate-900 transition-colors">{className}</span>
                            <span className="text-xs font-black text-slate-900">
                              {(probability * 100).toFixed(1)}%
                            </span>
                          </div>
                          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-slate-400 group-hover/bar:bg-indigo-400 transition-all duration-500"
                              style={{ width: `${probability * 100}%` }}
                            />
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            )}

            {/* 5. Clinical Protocol Trigger (Separate Card) */}
            {result && !treatmentSuggestions && (
              <div className="glass-card rounded-[3rem] p-8 lg:p-10 border-white/50 animate-fade-in relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                  <HeartPulse className="w-16 h-16" />
                </div>
                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
                      <Activity className="w-5 h-5" />
                    </div>
                    <h3 className="text-lg font-black text-slate-900 tracking-tight">Therapeutic Protocol</h3>
                  </div>
                  <button
                    onClick={getTreatmentSuggestions}
                    disabled={isLoadingTreatment}
                    className="w-full px-8 py-5 bg-indigo-600 text-white rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200 hover:scale-[1.02] active:scale-[0.98]"
                  >
                    {isLoadingTreatment ? (
                      <Activity className="animate-spin w-5 h-5" />
                    ) : (
                      <>
                        <HeartPulse className="w-5 h-5" />
                        Generate Clinical Protocol
                      </>
                    )}
                  </button>
                  <p className="text-[10px] text-center text-slate-400 font-bold uppercase tracking-widest">
                    Identify advanced therapeutic management strategies
                  </p>
                </div>
              </div>
            )}

            {/* 6. Expert Protocol Card (Resulting Card) */}
            {treatmentSuggestions && (
              <div className="glass-card rounded-[3rem] p-10 lg:p-12 space-y-8 animate-fade-in border-indigo-200/50 bg-gradient-to-br from-indigo-50/50 to-white relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 p-8 opacity-5">
                  <ClipboardCheck className="w-32 h-32" />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-indigo-200">
                      <HeartPulse className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-slate-900">Expert Management Protocol</h3>
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">Advanced Therapeutic Strategy</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      const content = `AlzDetect Protocol Report\n\nDiagnosis: ${result?.predicted_class}\n\nInterpretation:\n${suggestions}\n\nManagement Protocol:\n${treatmentSuggestions}`;
                      const blob = new Blob([content], { type: 'text/plain' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `alzdetect_clinical_protocol_${new Date().getTime()}.txt`;
                      a.click();
                    }}
                    className="w-12 h-12 flex items-center justify-center bg-slate-50 text-slate-400 hover:bg-indigo-50 hover:text-indigo-600 rounded-2xl transition-all border border-slate-100"
                  >
                    <Download className="w-5 h-5" />
                  </button>
                </div>

                <div className="relative">
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-indigo-500 to-violet-500 rounded-full opacity-20"></div>
                  <div className="pl-8 space-y-6">
                    <p className="text-slate-600 font-light leading-relaxed whitespace-pre-line text-sm">
                      {displayedTreatment}
                      {displayedTreatment !== treatmentSuggestions && (
                        <span className="inline-block w-1.5 h-4 bg-indigo-600 ml-2 animate-blink"></span>
                      )}
                    </p>
                  </div>
                </div>

                <div className="p-6 bg-slate-900 rounded-3xl flex items-center gap-4 text-white/70">
                  <ShieldCheck className="w-6 h-6 text-indigo-400" />
                  <p className="text-[10px] font-bold leading-tight uppercase tracking-wider">
                    This protocol is AI-generated for clinical validation and should be reviewed by a licensed clinical neurologist.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Visualization & AI Insights */}
          <div className="space-y-10 animate-fade-in" style={{ animationDelay: '200ms' }}>
            {/* 3. Scan Preview / Attention Map */}
            <div className="glass-card rounded-[3rem] p-8 lg:p-12 border-white/50 relative overflow-hidden">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-black text-slate-900">Visual Core</h2>
                <div className="flex gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Link</span>
                </div>
              </div>

              <div className="space-y-6">
                <div className={`w-full ${result?.attention_map_visualization ? 'aspect-[2/1]' : 'aspect-square'} relative rounded-[2.5rem] overflow-hidden bg-slate-950 border border-white/10 shadow-[inset_0_0_40px_rgba(168,85,247,0.15)] ring-1 ring-white/5 transition-all duration-700 group/scan`}>
                  {/* Neural Corner Brackets (Premium HUD) */}
                  <div className="absolute top-6 left-6 w-8 h-8 border-t-2 border-l-2 border-white/30 rounded-tl-sm transition-transform group-hover/scan:-translate-x-1 group-hover/scan:-translate-y-1"></div>
                  <div className="absolute top-6 right-6 w-8 h-8 border-t-2 border-r-2 border-white/30 rounded-tr-sm transition-transform group-hover/scan:translate-x-1 group-hover/scan:-translate-y-1"></div>
                  <div className="absolute bottom-6 left-6 w-8 h-8 border-b-2 border-l-2 border-white/30 rounded-bl-sm transition-transform group-hover/scan:-translate-x-1 group-hover/scan:translate-y-1"></div>
                  <div className="absolute bottom-6 right-6 w-8 h-8 border-b-2 border-r-2 border-white/30 rounded-br-sm transition-transform group-hover/scan:translate-x-1 group-hover/scan:translate-y-1"></div>

                  {/* HUD Metadata Labels */}
                  <div className="absolute top-8 left-16 text-[8px] font-mono text-white/20 tracking-[0.2em] uppercase">Neural_Scan_Active</div>
                  <div className="absolute top-8 right-16 text-[8px] font-mono text-white/20 tracking-[0.2em] uppercase text-right">ViT_B32_Transform</div>
                  <div className="absolute bottom-8 left-16 text-[8px] font-mono text-white/20 tracking-[0.2em] uppercase">Slice_Z_Depth_0.42</div>
                  <div className="absolute bottom-8 right-16 text-[8px] font-mono text-white/20 tracking-[0.2em] uppercase text-right">Mode: Diagnostic</div>

                  {result?.attention_map_visualization ? (
                    <Image
                      src={`data:image/png;base64,${result.attention_map_visualization}`}
                      alt="Attention map"
                      fill
                      className="object-contain animate-fade-in p-6"
                      unoptimized
                    />
                  ) : imageUrl ? (
                    <Image src={imageUrl} alt="Scan preview" fill className="object-contain p-6" />
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-700 space-y-4">
                      <Brain className="w-24 h-24 opacity-10 animate-pulse-slow" />
                      <p className="text-xs font-black uppercase tracking-widest opacity-30">Scan Volume Empty</p>
                    </div>
                  )}
                </div>

                {/* Premium Diagnostic Legend - Now below the scans */}
                {result?.attention_map_visualization && (
                  <div className="flex justify-center animate-fade-in">
                    <div className="px-8 py-3 bg-white/50 border border-slate-200 backdrop-blur-sm rounded-full flex items-center gap-10 shadow-sm">
                      <div className="flex items-center gap-3">
                        <div className="w-4 h-4 rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]"></div>
                        <span className="text-[11px] font-black text-slate-600 uppercase tracking-tighter">High Focus Area</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-4 h-4 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div>
                        <span className="text-[11px] font-black text-slate-600 uppercase tracking-tighter">Baseline Reference</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

            </div>

            {/* 4. Expert Interpretation Trigger (Separate Card) */}
            {result?.attention_map_visualization && !suggestions && (
              <div className="glass-card rounded-[3rem] p-8 lg:p-10 border-white/50 animate-fade-in relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                  <Sparkles className="w-16 h-16" />
                </div>
                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
                      <Microscope className="w-5 h-5" />
                    </div>
                    <h3 className="text-lg font-black text-slate-900 tracking-tight">Expert Analysis</h3>
                  </div>
                  <div className="space-y-4">
                    <p className="text-sm text-slate-500 font-light italic text-center">
                      &quot;Perform a deep neural interpretation of the identified voxel dependencies.&quot;
                    </p>
                    <button
                      onClick={getAISuggestions}
                      disabled={isLoadingSuggestions}
                      className="w-full px-8 py-5 bg-indigo-600 text-white rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200 hover:scale-[1.02] active:scale-[0.98]"
                    >
                      {isLoadingSuggestions ? (
                        <>
                          <Activity className="animate-spin w-5 h-5" />
                          De-patching Weights...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4" />
                          Extract Expert Interpretation
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* 4. Expert Insight Bubble */}
            {suggestions && (
              <div className="glass-morphism rounded-[3rem] border-white p-10 lg:p-12 space-y-8 animate-fade-in shadow-xl bg-indigo-900 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-20 transform -rotate-12">
                  <Sparkles className="w-20 h-20" />
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-indigo-900 shadow-xl">
                    <Microscope className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black italic">Expert Interpretation</h3>
                    <p className="text-[10px] font-black uppercase tracking-widest text-indigo-300">ViT-B/32 Clinical Analysis</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <p className="text-indigo-100 font-light leading-relaxed whitespace-pre-line text-sm">
                    {displayedSuggestions}
                    {displayedSuggestions !== suggestions && (
                      <span className="inline-block w-1.5 h-4 bg-white ml-2 animate-blink"></span>
                    )}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
