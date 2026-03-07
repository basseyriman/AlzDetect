"use client";

import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Download, Printer, Trash2, ArrowLeft, Database, Search, Filter, FileText, Activity } from "lucide-react";
import { useState, useEffect } from "react";
import { StoredResult, getResults, clearResults } from "@/lib/storage";

export default function Results() {
  const [results, setResults] = useState<StoredResult[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<string>("all");
  const [selectedResults, setSelectedResults] = useState<Set<string>>(new Set());

  useEffect(() => {
    setResults(getResults());
    const handleStorageChange = () => {
      setResults(getResults());
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const exportToCSV = () => {
    const headers = [
      "Date", "File Name", "Predicted Class", "Confidence",
      "NonDemented Probability", "VeryMildDemented Probability", "MildDemented Probability", "ModerateDemented Probability"
    ].join(",");

    const rows = results.map(result => [
      new Date(result.timestamp).toLocaleString(),
      result.fileName,
      result.predicted_class,
      (result.class_probabilities[result.predicted_class] * 100).toFixed(1) + "%",
      (result.class_probabilities.NonDemented * 100).toFixed(1) + "%",
      (result.class_probabilities.VeryMildDemented * 100).toFixed(1) + "%",
      (result.class_probabilities.MildDemented * 100).toFixed(1) + "%",
      (result.class_probabilities.ModerateDemented * 100).toFixed(1) + "%"
    ].join(","));

    const csv = [headers, ...rows].join("\n");
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('href', url);
    a.setAttribute('download', `alzdetect_archive_${new Date().getTime()}.csv`);
    a.click();
  };

  const handlePrint = () => {
    if (selectedResults.size === 0) {
      alert('Please select at least one result to print');
      return;
    }
    // ... (Keep existing print logic as is, it's functional and hidden from UI styling)
    const selectedItems = results.filter(result => selectedResults.has(result.id));
    const printContent = `
      <html>
        <head>
          <title>AlzDetect Analysis Reports</title>
          <style>
            @media print { .page-break { page-break-before: always; margin-top: 0; } @page { margin: 0; size: A4; } body { margin: 0; } .report-page { page-break-after: always; height: 100vh; padding: 40px; box-sizing: border-box; position: relative; } .report-page:last-child { page-break-after: avoid; } }
            body { font-family: system-ui, -apple-system, sans-serif; margin: 0; }
            .report-page { padding: 40px; position: relative; min-height: 100vh; box-sizing: border-box; }
            .header { text-align: center; margin-bottom: 30px; }
            .title { font-size: 24px; font-weight: bold; color: #1e293b; margin-bottom: 10px; }
            .date { color: #64748b; margin-bottom: 20px; }
            .section { margin-bottom: 20px; }
            .section-title { font-size: 18px; font-weight: 600; color: #334155; margin-bottom: 10px; }
            .prediction { display: inline-block; padding: 4px 12px; border-radius: 9999px; font-size: 14px; font-weight: 500; }
            .probability-bar { width: 100%; height: 8px; background: #f1f5f9; border-radius: 4px; margin: 4px 0; }
            .probability-fill { height: 100%; border-radius: 4px; }
            .footer { margin-top: 40px; text-align: center; color: #64748b; font-size: 12px; position: absolute; bottom: 40px; left: 0; right: 0; }
          </style>
        </head>
        <body>
          ${selectedItems.map((result) => `
            <div class="report-page">
              <div class="header">
                <div class="title">AlzDetect Analysis Report</div>
                <div class="date">Generated on ${new Date().toLocaleString()}</div>
              </div>
              <div class="section">
                <div class="section-title">Scan Information</div>
                <p>File Name: ${result.fileName}</p>
                <p>Analysis Date: ${new Date(result.timestamp).toLocaleString()}</p>
              </div>
              <div class="section">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                  <div class="section-title" style="margin: 0;">Analysis Results</div>
                  <div style="text-align: right;">
                    <p style="margin-bottom: 4px;">Prediction: <span class="prediction" style="
                      ${result.predicted_class === 'NonDemented' ? 'background: #dcfce7; color: #166534;' :
        result.predicted_class === 'VeryMildDemented' ? 'background: #fef9c3; color: #854d0e;' :
          result.predicted_class === 'MildDemented' ? 'background: #ffedd5; color: #9a3412;' :
            'background: #fee2e2; color: #991b1b;'}">${result.predicted_class}</span></p>
                    <p style="margin: 0;">Confidence: ${(result.class_probabilities[result.predicted_class] * 100).toFixed(1)}%</p>
                  </div>
                </div>
              </div>
              <div class="section">
                <div class="section-title">Other Class Probabilities</div>
                ${Object.entries(result.class_probabilities)
        .filter(([className]) => className !== result.predicted_class)
        .sort(([, a], [, b]) => b - a)
        .map(([className, probability]) => `
                    <div style="margin-bottom: 12px;">
                      <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                        <span>${className}</span>
                        <span>${(probability * 100).toFixed(1)}%</span>
                      </div>
                      <div class="probability-bar">
                        <div class="probability-fill" style="width: ${probability * 100}%; ${className === 'NonDemented' ? 'background: #22c55e;' :
            className === 'VeryMildDemented' ? 'background: #eab308;' :
              className === 'MildDemented' ? 'background: #f97316;' :
                'background: #ef4444;'
          }"></div>
                      </div>
                    </div>
                  `).join('')}
              </div>
              <div class="footer">Generated by AlzDetect - AI MRI Protocol</div>
            </div>
          `).join('')}
        </body>
      </html>
    `;
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => { printWindow.print(); printWindow.close(); }, 250);
    }
  };

  const toggleSelectAll = () => {
    if (selectedResults.size === filteredResults.length) {
      setSelectedResults(new Set());
    } else {
      setSelectedResults(new Set(filteredResults.map(r => r.id)));
    }
  };

  const filteredResults = selectedFilter === "all"
    ? results
    : results.filter(result => result.predicted_class === selectedFilter);

  return (
    <div className="min-h-screen bg-[#F8FAFC] neural-gradient pb-20">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 lg:pt-20">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
          <div className="space-y-4">
            <Link href="/" className="inline-flex items-center gap-2 text-indigo-600 font-bold text-sm hover:gap-3 transition-all">
              <ArrowLeft className="w-4 h-4" />
              Back to Portal
            </Link>
            <h1 className="text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-none">
              Analysis <span className="text-gradient">Historical</span> Archive
            </h1>
            <p className="text-slate-500 font-light max-w-xl">
              Reviewing encrypted diagnostic local session history and Vision Transformer classification logs.
            </p>
          </div>
          <div className="flex items-center gap-3 px-6 py-3 bg-white/60 glass-morphism rounded-2xl border border-white text-[10px] font-black uppercase tracking-widest text-indigo-600 shadow-sm animate-fade-in">
            <Database className="w-4 h-4 opacity-70" />
            Local Diagnostic DB Active
          </div>
        </div>

        {results.length > 0 ? (
          <div className="space-y-10 animate-fade-in">
            {/* 1. Actions Bar */}
            <div className="glass-morphism rounded-[2.5rem] border-white p-6 shadow-xl bg-white/40">
              <div className="flex flex-wrap items-center justify-between gap-6">
                <div className="flex items-center gap-6">
                  <div className="relative group">
                    <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-hover:text-indigo-600 transition-colors" />
                    <select
                      value={selectedFilter}
                      onChange={(e) => setSelectedFilter(e.target.value)}
                      className="pl-12 pr-6 py-3 bg-white border border-slate-100 rounded-2xl text-xs font-bold text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer hover:bg-slate-50 transition-all appearance-none uppercase tracking-widest"
                    >
                      <option value="all">Total Archive</option>
                      <option value="NonDemented">Non-Demented</option>
                      <option value="VeryMildDemented">Very Mild</option>
                      <option value="MildDemented">Mild</option>
                      <option value="ModerateDemented">Moderate</option>
                    </select>
                  </div>
                  <div className="h-8 w-[1px] bg-slate-200"></div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Displaying result set <span className="text-indigo-600">{filteredResults.length}</span> / {results.length}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={handlePrint}
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-white text-slate-600 rounded-2xl font-bold text-xs border border-slate-100 hover:bg-indigo-50 hover:text-indigo-600 transition-all shadow-sm active:scale-95"
                  >
                    <Printer className="w-4 h-4" />
                    Batch Print
                  </button>
                  <button
                    onClick={exportToCSV}
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-2xl font-bold text-xs hover:bg-indigo-700 transition-all shadow-lg active:scale-95"
                  >
                    <Download className="w-4 h-4" />
                    Export CSV
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm('Delete total local archive? This cannot be undone.')) {
                        clearResults();
                        setResults([]);
                      }
                    }}
                    className="flex items-center justify-center w-12 h-12 bg-red-50 text-red-500 rounded-2xl hover:bg-red-100 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* 2. Archive Table View */}
            <div className="glass-card rounded-[3rem] p-4 lg:p-10 border-white/50 shadow-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-slate-100">
                      <th className="py-6 px-4">
                        <input
                          type="checkbox"
                          checked={selectedResults.size === filteredResults.length && filteredResults.length > 0}
                          onChange={toggleSelectAll}
                          className="w-5 h-5 rounded-lg border-slate-200 text-indigo-600 focus:ring-indigo-500 cursor-pointer transition-all"
                        />
                      </th>
                      <th className="py-6 px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Temporal Log</th>
                      <th className="py-6 px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Source Volume</th>
                      <th className="py-6 px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Protocol Output</th>
                      <th className="py-6 px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Confidence</th>
                      <th className="py-6 px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Neural Breakdown</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {filteredResults.map((result) => (
                      <tr key={result.id} className="group hover:bg-slate-50/50 transition-colors">
                        <td className="py-8 px-4">
                          <input
                            type="checkbox"
                            checked={selectedResults.has(result.id)}
                            onChange={() => {
                              const newSelected = new Set(selectedResults);
                              if (newSelected.has(result.id)) { newSelected.delete(result.id); } else { newSelected.add(result.id); }
                              setSelectedResults(newSelected);
                            }}
                            className="w-5 h-5 rounded-lg border-slate-200 text-indigo-600 focus:ring-indigo-500 cursor-pointer transition-all"
                          />
                        </td>
                        <td className="py-8 px-4">
                          <div className="flex flex-col">
                            <span className="text-sm font-bold text-slate-900">{new Date(result.timestamp).toLocaleDateString()}</span>
                            <span className="text-[10px] font-medium text-slate-400">{new Date(result.timestamp).toLocaleTimeString()}</span>
                          </div>
                        </td>
                        <td className="py-8 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-all">
                              <FileText className="w-5 h-5" />
                            </div>
                            <span className="text-sm font-black text-slate-600 truncate max-w-[120px]">{result.fileName}</span>
                          </div>
                        </td>
                        <td className="py-8 px-4 text-center">
                          <span className={`inline-flex px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border
                              ${result.predicted_class === 'NonDemented' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                              result.predicted_class === 'VeryMildDemented' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                                result.predicted_class === 'MildDemented' ? 'bg-orange-50 text-orange-600 border-orange-100' :
                                  'bg-red-50 text-red-600 border-red-100'}`}>
                            {result.predicted_class}
                          </span>
                        </td>
                        <td className="py-8 px-4 text-center">
                          <div className="inline-flex flex-col items-center">
                            <span className="text-xl font-black italic text-slate-900 leading-none">
                              {(result.class_probabilities[result.predicted_class] * 100).toFixed(1)}
                              <span className="text-[10px] opacity-40 ml-0.5">%</span>
                            </span>
                          </div>
                        </td>
                        <td className="py-8 px-4 pr-10">
                          <div className="flex gap-2 min-w-[160px]">
                            {Object.entries(result.class_probabilities)
                              .sort(([, a], [, b]) => b - a)
                              .map(([className, probability], i) => (
                                <div
                                  key={className}
                                  className="h-8 flex-1 bg-slate-50 rounded-lg relative overflow-hidden flex flex-col justify-end group/bar"
                                  title={`${className}: ${(probability * 100).toFixed(1)}%`}
                                >
                                  <div
                                    className={`absolute bottom-0 inset-x-0 transition-all duration-1000 ${className === result.predicted_class ? 'bg-indigo-500' : 'bg-slate-300'
                                      }`}
                                    style={{ height: `${probability * 100}%` }}
                                  />
                                  <div className="absolute inset-0 opacity-0 group-hover/bar:bg-indigo-600/10 group-hover/bar:opacity-100 transition-opacity"></div>
                                </div>
                              ))}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : (
          <div className="glass-card rounded-[3rem] p-12 lg:p-20 text-center space-y-8 border-white animate-fade-in">
            <div className="w-24 h-24 bg-slate-50 rounded-[2.5rem] flex items-center justify-center text-slate-300 mx-auto border border-slate-100 shadow-inner">
              <Search className="w-10 h-10" />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-black text-slate-900 tracking-tight leading-none italic">Archive Empty</h3>
              <p className="text-slate-500 font-light max-w-xs mx-auto text-sm leading-relaxed">No diagnostic sessions found in local browser storage. Initiate a new sequence to begin data logging.</p>
            </div>
            <Link href="/detect" className="btn-premium px-10 py-5 inline-flex items-center gap-3">
              <Activity className="w-5 h-5" />
              Start AI Analysis Pulse
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
