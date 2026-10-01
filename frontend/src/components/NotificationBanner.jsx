import React from 'react';
import { Zap, ShieldCheck } from 'lucide-react';

export default function NotificationBanner() {
  return (
    <div className="bg-slate-900/90 border-b border-slate-800 px-4 py-2 text-xs text-slate-300 flex items-center justify-between">
      <div className="flex items-center space-x-2.5">
        <span className="flex h-2 w-2 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </span>
        <span className="font-semibold text-white">Emergency Fast-Lane System:</span>
        <span className="text-emerald-400 font-medium">Active & Prioritizing Traffic</span>
        <span className="text-slate-600 hidden sm:inline">•</span>
        <span className="text-slate-400 hidden sm:inline">Priority Router: <code className="text-sky-300 font-mono">192.168.10.1</code></span>
      </div>
      
      <div className="hidden md:flex items-center space-x-2 text-[11px] text-slate-400">
        <span className="bg-sky-500/10 text-sky-300 border border-sky-500/20 px-2 py-0.5 rounded font-mono">
          Layer 3 IP QoS
        </span>
        <span>Network prioritization for medical imaging</span>
      </div>
    </div>
  );
}
