'use client'

import Link from "next/link";
import { Brain, Activity, BarChart2, LogOut, User, LayoutDashboard } from "lucide-react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

export function Navbar() {
  const pathname = usePathname();
  const { isAuthenticated, signOut, user } = useAuth();

  return (
    <nav className="sticky top-0 z-50 glass-morphism border-b border-slate-200/50 bg-white/70">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="p-2 bg-indigo-600 rounded-xl group-hover:rotate-6 transition-transform duration-300 shadow-lg shadow-indigo-600/20">
                <Brain className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold text-slate-900 tracking-tight">AlzDetect</span>
            </Link>
          </div>
          <div className="flex items-center space-x-1 sm:space-x-2">
            <Link
              href="/"
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300
                ${pathname === '/' ? 'text-indigo-600 bg-indigo-50' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'}`}
            >
              Home
            </Link>
            
            {isAuthenticated ? (
              <>
                <Link
                  href="/dashboard"
                  className={`flex items-center px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300
                    ${pathname === '/dashboard' ? 'text-indigo-600 bg-indigo-50' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'}`}
                >
                  <LayoutDashboard className="h-4 w-4 mr-2" />
                  Dashboard
                </Link>
                <Link
                  href="/detect"
                  className={`flex items-center px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300
                    ${pathname === '/detect' ? 'text-indigo-600 bg-indigo-50' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'}`}
                >
                  <Activity className="h-4 w-4 mr-2" />
                  Analyze
                </Link>
                <Link
                  href="/results"
                  className={`flex items-center px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300
                    ${pathname === '/results' ? 'text-indigo-600 bg-indigo-50' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'}`}
                >
                  <BarChart2 className="h-4 w-4 mr-2" />
                  Archive
                </Link>
                <div className="h-8 w-[1px] bg-slate-200 mx-2 hidden sm:block"></div>
                <div className="flex items-center gap-3 pl-2">
                  <div className="hidden lg:flex flex-col items-end">
                    <span className="text-[10px] font-black text-slate-900 truncate max-w-[100px]">{user?.email}</span>
                    <span className="text-[8px] font-black text-indigo-600 uppercase tracking-widest">Active Member</span>
                  </div>
                  <button
                    onClick={signOut}
                    className="p-2.5 bg-slate-100 hover:bg-red-50 text-slate-500 hover:text-red-500 rounded-xl transition-all shadow-sm"
                    title="Sign Out"
                  >
                    <LogOut className="h-4 w-4" />
                  </button>
                </div>
              </>
            ) : (
              <Link
                href="/login"
                className="btn-premium px-6 py-2.5 text-sm flex items-center gap-2 ml-4"
              >
                <User className="w-4 h-4" />
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
