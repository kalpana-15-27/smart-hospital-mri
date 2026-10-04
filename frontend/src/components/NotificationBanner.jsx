import React from 'react';
import { Zap, ShieldCheck } from 'lucide-react';

export default function NotificationBanner() {
  return (
    <div className="bg-white/70 backdrop-blur-md border-b border-blue-100 px-4 py-2 text-xs text-blue-900/80 flex items-center justify-between z-30">
      <div className="flex items-center space-x-2.5">
        <span className="flex h-2 w-2 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
        </span>
        <span className="font-bold text-blue-950">Emergency Fast-Lane System:</span>
        <span className="text-cyan-700 font-semibold">Active & Prioritizing Traffic</span>
        <span className="text-blue-300 hidden sm:inline">&bull;</span>
        <span className="text-slate-500 hidden sm:inline">Priority Router: <code className="text-cyan-700 font-mono font-bold">192.168.10.1</code></span>
      </div>
      
      <div className="hidden md:flex items-center space-x-2 text-[11px] text-slate-500">
        <span className="bg-cyan-100 text-cyan-800 border border-cyan-200/80 px-2.5 py-0.5 rounded-full font-mono font-bold">
          Layer 3 IP QoS
        </span>
        <span>Network prioritization for medical imaging</span>
      </div>
    </div>
  );
}
