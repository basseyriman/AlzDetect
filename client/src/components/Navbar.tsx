'use client'

import Link from "next/link";
import { Brain, Activity, BarChart2 } from "lucide-react";
import { usePathname } from "next/navigation";

export function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="sticky top-0 z-50 glass-morphism border-b border-slate-200/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="p-2 bg-indigo-600 rounded-xl group-hover:rotate-6 transition-transform duration-300">
                <Brain className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold text-slate-900 tracking-tight">AlzDetect</span>
            </Link>
          </div>
          <div className="flex items-center space-x-1 sm:space-x-4">
            <Link
              href="/"
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300
                ${pathname === '/' ? 'text-indigo-600 bg-indigo-50' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'}`}
            >
              Home
            </Link>
            <Link
              href="/detect"
              className={`flex items-center px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300
                ${pathname === '/detect' ? 'text-indigo-600 bg-indigo-50' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'}`}
            >
              <Activity className="h-4 w-4 mr-2" />
              Analyze Scan
            </Link>
            <Link
              href="/results"
              className={`flex items-center px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300
                ${pathname === '/results' ? 'text-indigo-600 bg-indigo-50' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'}`}
            >
              <BarChart2 className="h-4 w-4 mr-2" />
              Results
            </Link>
            <Link
              href="/research"
              className={`flex items-center px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300
                ${pathname.startsWith('/research') ? 'text-indigo-600 bg-indigo-50' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'}`}
            >
              <Brain className="h-4 w-4 mr-2" />
              Research
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
