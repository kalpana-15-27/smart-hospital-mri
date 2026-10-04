import React, { useState, useEffect } from 'react';
import { 
  ArrowRight, 
  BookOpen, 
  Activity, 
  ShieldCheck, 
  Network, 
  HeartPulse, 
  Zap,
  Server,
  HardDrive,
  ArrowUp,
  LogIn
} from 'lucide-react';

export default function LandingPage({ onEnterGateway }) {
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div id="top" className="bg-gradient-to-br from-blue-50 via-sky-100 to-blue-200 relative overflow-x-hidden min-h-screen font-sans text-slate-700 selection:bg-cyan-500/20 selection:text-blue-900">
      
      {/* Background Soft Oceanic Glowing Orbs */}
      <div className="absolute top-[-5%] left-[-5%] w-[500px] h-[500px] bg-cyan-200/50 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-5%] w-[600px] h-[600px] bg-blue-300/40 rounded-full blur-[140px] pointer-events-none"></div>
      <div className="absolute top-[40%] left-[50%] -translate-x-1/2 w-[800px] h-[400px] bg-sky-200/50 rounded-full blur-[150px] pointer-events-none"></div>

      {/* Sticky Top Navigation */}
      <nav className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-xl border-b border-blue-100 shadow-sm shadow-blue-900/5">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <a href="#top" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-400 to-blue-500 flex items-center justify-center shadow-md shadow-blue-500/20 group-hover:scale-105 transition-all text-white">
              <HeartPulse className="w-6 h-6" />
            </div>
            <span className="font-bold text-lg tracking-tight text-blue-950 group-hover:text-cyan-600 transition-colors">
              Smart Hospital MRI QoS
            </span>
          </a>
          <div className="hidden md:flex space-x-8 text-sm font-semibold text-blue-900/70">
            <a href="#features" className="hover:text-blue-950 transition-colors">Features</a>
            <a href="#architecture" className="hover:text-blue-950 transition-colors">Architecture</a>
            <a href="#docs" className="hover:text-blue-950 transition-colors">Documentation</a>
          </div>
          <div>
            <button
              onClick={onEnterGateway}
              className="px-5 py-2 rounded-full bg-white border border-blue-200/80 text-blue-700 hover:text-blue-950 text-xs font-bold shadow-sm hover:shadow-md transition-all flex items-center space-x-1.5"
            >
              <LogIn className="w-3.5 h-3.5 text-cyan-500" />
              <span>Sign In</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 pt-12 pb-28 flex flex-col items-center text-center">
        <div className="inline-flex items-center space-x-2 bg-white/80 backdrop-blur-xl border border-blue-200/60 rounded-full px-4 py-1.5 mb-8 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse"></span>
          <span className="text-xs font-mono font-bold text-cyan-700 tracking-wide uppercase">
            Live Layer 3 Telemetry Active
          </span>
        </div>
        
        <h1 className="text-5xl md:text-7xl font-extrabold text-blue-950 tracking-tight leading-tight max-w-4xl mb-6">
          Intelligent MRI Traffic <br className="hidden md:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-blue-600">
            Prioritization
          </span>
        </h1>
        
        <p className="text-lg md:text-xl text-blue-900/70 max-w-2xl mb-10 leading-relaxed font-normal">
          Ensure zero-loss, ultra-low latency transmission for critical diagnostic imaging. 
          Powered by edge-enforced Differentiated Services (DiffServ) and strict priority queuing.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4">
          <button 
            onClick={onEnterGateway}
            className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-500 hover:to-blue-600 text-white font-bold shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all flex items-center justify-center space-x-2 text-sm"
          >
            <span>Enter Clinical Gateway</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          
          <a 
            href="#docs" 
            className="w-full sm:w-auto px-8 py-3.5 rounded-full border border-blue-200/80 bg-white/80 hover:bg-white text-blue-950 font-bold shadow-sm transition-all flex items-center justify-center space-x-2 text-sm"
          >
            <BookOpen className="w-4 h-4 text-cyan-600" />
            <span>View Documentation</span>
          </a>
        </div>

        {/* Floating Visualization Card */}
        <div className="w-full max-w-5xl mt-16 relative">
          <div className="bg-white/90 backdrop-blur-xl border border-white/60 rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] shadow-blue-900/10 p-6 md:p-8">
            <div className="flex items-center justify-between mb-6 border-b border-blue-100 pb-4">
              <div className="text-left">
                <h3 className="text-blue-950 font-bold text-base">Live Network Throughput</h3>
                <p className="text-xs font-mono font-medium text-cyan-600 mt-0.5">DICOM C-STORE Payload</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-mono font-bold text-blue-950">942<span className="text-sm font-normal text-slate-500"> Mbps</span></div>
                <div className="text-xs text-emerald-600 font-mono font-bold">0.00% Packet Loss</div>
              </div>
            </div>
            
            {/* Glowing Chart Mockup */}
            <div className="h-44 w-full relative flex items-end">
              <div className="absolute inset-0 grid grid-cols-6 gap-4">
                {[1,2,3,4,5,6].map(i => <div key={i} className="border-r border-blue-100/60 h-full w-full"></div>)}
              </div>
              <svg className="w-full h-full drop-shadow-md z-10" viewBox="0 0 100 40" preserveAspectRatio="none">
                <path 
                  d="M0,35 Q10,35 20,25 T40,15 T60,20 T80,5 T100,10" 
                  fill="none" 
                  stroke="#0284c7" 
                  strokeWidth="1.2" 
                  strokeLinecap="round"
                />
                <path 
                  d="M0,35 Q10,35 20,25 T40,15 T60,20 T80,5 T100,10 L100,40 L0,40 Z" 
                  fill="url(#chartGrad)" 
                  stroke="none" 
                />
                <defs>
                  <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="rgba(56, 189, 248, 0.35)" />
                    <stop offset="100%" stopColor="rgba(56, 189, 248, 0.0)" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
          </div>
        </div>
      </main>

      {/* Feature Grid */}
      <section id="features" className="relative z-10 max-w-7xl mx-auto px-6 pb-24 pt-6 scroll-mt-24">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white/90 backdrop-blur-xl border border-white/60 rounded-[2.5rem] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] shadow-blue-900/10 hover:shadow-blue-900/15 transition-all group">
            <div className="w-12 h-12 rounded-2xl bg-cyan-100 text-cyan-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-sm">
              <Network className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-blue-950 mb-3">RFC 2474 DiffServ</h3>
            <p className="text-sm text-slate-500 leading-relaxed mb-4">
              Marks medical traffic directly at the OSI Layer 3 IPv4 header using 6-bit Differentiated Services Code Points.
            </p>
            <span className="inline-block px-3 py-1 bg-cyan-50 border border-cyan-200/80 rounded-full text-[10px] font-mono font-bold text-cyan-700">
              DSCP 46 (EF) | DSCP 34 (AF41)
            </span>
          </div>

          <div className="bg-white/90 backdrop-blur-xl border border-white/60 rounded-[2.5rem] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] shadow-blue-900/10 hover:shadow-blue-900/15 transition-all group">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-sm">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-blue-950 mb-3">Zero-Loss Queuing</h3>
            <p className="text-sm text-slate-500 leading-relaxed mb-4">
              Emergency trauma scans bypass congested router buffers via Strict Priority Low-Latency Queuing (LLQ).
            </p>
            <span className="inline-block px-3 py-1 bg-rose-50 border border-rose-200/80 rounded-full text-[10px] font-mono font-bold text-rose-700">
              Transfer Delay: ~5.4s
            </span>
          </div>

          <div className="bg-white/90 backdrop-blur-xl border border-white/60 rounded-[2.5rem] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] shadow-blue-900/10 hover:shadow-blue-900/15 transition-all group">
            <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-sm">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-blue-950 mb-3">Edge Defense</h3>
            <p className="text-sm text-slate-500 leading-relaxed mb-4">
              Prevents rogue devices from hogging bandwidth. Untrusted VLAN traffic claiming priority is force-demoted.
            </p>
            <span className="inline-block px-3 py-1 bg-indigo-50 border border-indigo-200/80 rounded-full text-[10px] font-mono font-bold text-indigo-700">
              Anti-DSCP Spoofing
            </span>
          </div>
        </div>
      </section>

      {/* Architecture Section */}
      <section id="architecture" className="relative z-10 max-w-7xl mx-auto px-6 pb-24 pt-6 scroll-mt-24">
        <h2 className="text-3xl font-bold text-blue-950 mb-8 text-center">Network Architecture</h2>
        <div className="bg-white/90 backdrop-blur-xl border border-white/60 rounded-[2.5rem] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] shadow-blue-900/10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex flex-col items-center p-6 bg-blue-50/60 rounded-2xl border border-blue-100 w-full text-center">
              <Activity className="w-8 h-8 text-rose-500 mb-3" />
              <span className="text-blue-950 font-bold">MRI Scanners</span>
              <span className="text-xs text-slate-500 font-mono mt-1">VLAN 10</span>
            </div>
            <ArrowRight className="w-8 h-8 text-blue-400 hidden md:block flex-shrink-0" />
            <div className="flex flex-col items-center p-6 bg-cyan-50/90 rounded-2xl border border-cyan-300 w-full relative overflow-hidden text-center shadow-md shadow-cyan-500/10">
              <Server className="w-8 h-8 text-cyan-600 mb-3" />
              <span className="text-blue-950 font-bold">L3 QoS Gateway</span>
              <span className="text-xs text-cyan-700 font-mono font-bold mt-1">Strict Priority (LLQ)</span>
            </div>
            <ArrowRight className="w-8 h-8 text-blue-400 hidden md:block flex-shrink-0" />
            <div className="flex flex-col items-center p-6 bg-blue-50/60 rounded-2xl border border-blue-100 w-full text-center">
              <HardDrive className="w-8 h-8 text-purple-600 mb-3" />
              <span className="text-blue-950 font-bold">PACS Archive</span>
              <span className="text-xs text-slate-500 font-mono mt-1">VLAN 30</span>
            </div>
          </div>
        </div>
      </section>

      {/* Documentation Section */}
      <section id="docs" className="relative z-10 max-w-7xl mx-auto px-6 pb-28 pt-6 scroll-mt-24">
        <h2 className="text-3xl font-bold text-blue-950 mb-8 text-center">Documentation & Standards</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white/90 backdrop-blur-xl border border-white/60 rounded-[2.5rem] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] shadow-blue-900/10">
            <h3 className="text-xl font-bold text-blue-950 mb-4 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-cyan-600"/> 
              RFC Standards
            </h3>
            <ul className="space-y-4 text-sm text-slate-600">
              <li className="flex flex-col">
                <strong className="text-blue-950 mb-0.5">RFC 2474:</strong> 
                <span>Differentiated Services Field Definition in IPv4 and IPv6 Headers.</span>
              </li>
              <li className="flex flex-col">
                <strong className="text-blue-950 mb-0.5">RFC 3246:</strong> 
                <span>Expedited Forwarding (EF) Per-Hop Behavior (DSCP 46).</span>
              </li>
              <li className="flex flex-col">
                <strong className="text-blue-950 mb-0.5">RFC 2597:</strong> 
                <span>Assured Forwarding (AF) PHB Group (DSCP 34).</span>
              </li>
            </ul>
          </div>
          <div className="bg-white/90 backdrop-blur-xl border border-white/60 rounded-[2.5rem] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] shadow-blue-900/10">
            <h3 className="text-xl font-bold text-blue-950 mb-4 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-indigo-600"/> 
              Security Protocols
            </h3>
            <ul className="space-y-4 text-sm text-slate-600">
              <li className="flex flex-col">
                <strong className="text-blue-950 mb-0.5">Edge Trust Boundaries:</strong> 
                <span>Untrusted endpoints attempting to claim priority are force-remarked to DSCP 0 at the switch level.</span>
              </li>
              <li className="flex flex-col">
                <strong className="text-blue-950 mb-0.5">Anti-Spoofing:</strong> 
                <span>ACL drop rules applied to unauthorized VLANs injecting EF tags to prevent bandwidth exhaustion attacks.</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Floating Back to Top Button */}
      <a 
        href="#top" 
        className={`fixed bottom-8 right-8 p-3.5 rounded-full bg-white/90 border border-blue-200/80 shadow-lg shadow-blue-900/10 text-cyan-600 hover:scale-110 transition-all z-50 ${showScrollTop ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'}`}
      >
        <ArrowUp className="w-5 h-5" />
      </a>

    </div>
  );
}