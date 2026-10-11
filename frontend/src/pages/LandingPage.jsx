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
  LogIn,
  Layers,
  Radio,
  Sliders,
  CheckCircle2,
  Cpu,
  Eye,
  Check,
  Flame
} from 'lucide-react';

export default function LandingPage({ onEnterGateway }) {
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [activeTabVisual, setActiveTabVisual] = useState('ef'); // 'ef', 'af', 'cs'
  const [scanSpeed, setScanSpeed] = useState('normal'); // 'normal' or 'fast'

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
      <div className="fixed top-[-5%] left-[-5%] w-[520px] h-[520px] bg-cyan-200/40 rounded-full blur-[140px] pointer-events-none -z-0"></div>
      <div className="fixed bottom-[-10%] right-[-5%] w-[620px] h-[620px] bg-blue-300/35 rounded-full blur-[160px] pointer-events-none -z-0"></div>
      <div className="fixed top-[35%] left-[45%] -translate-x-1/2 w-[800px] h-[450px] bg-sky-200/45 rounded-full blur-[180px] pointer-events-none -z-0"></div>

      {/* Sticky Top Navigation */}
      <nav className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-xl border-b border-blue-100 shadow-sm shadow-blue-900/5">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <a href="#top" className="flex items-center space-x-3 group cursor-pointer">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-400 to-blue-500 flex items-center justify-center shadow-md shadow-blue-500/20 group-hover:scale-110 group-hover:rotate-6 group-hover:shadow-lg group-hover:shadow-cyan-500/30 transition-all duration-300 text-white">
              <HeartPulse className="w-6 h-6 animate-pulse" />
            </div>
            <span className="font-bold text-lg tracking-tight text-blue-950 group-hover:text-cyan-600 transition-colors">
              Smart Hospital MRI QoS
            </span>
          </a>
          
          <div className="hidden md:flex space-x-8 text-sm font-semibold text-blue-900/70">
            <a href="#features" className="hover:text-cyan-700 transition-colors">Features</a>
            <a href="#architecture" className="hover:text-cyan-700 transition-colors">Architecture</a>
            <a href="#scanner" className="hover:text-cyan-700 transition-colors">Live Scanner</a>
            <a href="#docs" className="hover:text-cyan-700 transition-colors">Documentation</a>
          </div>
          
          <div>
            <button
              onClick={onEnterGateway}
              className="px-5 py-2 rounded-full bg-white hover:bg-cyan-50 border border-blue-200/80 hover:border-cyan-300 hover:ring-2 hover:ring-cyan-400/40 text-blue-700 hover:text-blue-950 text-xs font-bold shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5 hover:scale-105 flex items-center space-x-1.5"
            >
              <LogIn className="w-3.5 h-3.5 text-cyan-500" />
              <span>Sign In</span>
            </button>
          </div>
        </div>
      </nav>

      {/* 2-Column Hero Section with Interactive Animated MRI Scanner on the Right */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 pt-10 pb-20">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-8">
          
          {/* Left Column: Heading, Telemetry, and Action Buttons */}
          <div className="lg:w-1/2 text-left space-y-6">
            
            {/* Live Telemetry Pill */}
            <div className="inline-flex items-center space-x-2 bg-white/80 backdrop-blur-xl border border-blue-200/80 hover:border-cyan-300 rounded-full px-4 py-1.5 shadow-sm transition-all hover:scale-105">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-500 animate-ping"></span>
              <span className="text-xs font-mono font-bold text-cyan-700 tracking-wide uppercase">
                Live Layer 3 Telemetry Active &bull; RFC 2474
              </span>
            </div>
            
            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-blue-950 tracking-tight leading-[1.15]">
              Intelligent MRI <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 via-sky-600 to-blue-600">
                Traffic Prioritization
              </span>
            </h1>
            
            {/* Subtitle */}
            <p className="text-base sm:text-lg text-blue-900/75 leading-relaxed font-normal max-w-xl">
              Guarantee zero-loss, ultra-low latency transmission for critical neuroimaging and emergency stroke DICOM scans. Powered by edge-enforced Differentiated Services (DiffServ) and strict priority queuing.
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-3.5 sm:space-y-0 sm:space-x-4 pt-2">
              <button 
                onClick={onEnterGateway}
                className="px-8 py-3.5 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-500 hover:to-blue-600 text-white font-bold shadow-lg shadow-blue-500/25 hover:shadow-2xl hover:shadow-cyan-500/40 hover:ring-2 hover:ring-cyan-300 transition-all duration-300 transform hover:-translate-y-1 hover:scale-105 flex items-center justify-center space-x-2 text-sm"
              >
                <span>Enter Clinical Gateway</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              
              <a 
                href="#docs" 
                className="px-8 py-3.5 rounded-full border border-blue-200/80 bg-white/80 hover:bg-white text-blue-950 font-bold shadow-sm hover:shadow-lg hover:border-cyan-300 hover:ring-2 hover:ring-cyan-400/30 transition-all duration-300 transform hover:-translate-y-1 hover:scale-105 flex items-center justify-center space-x-2 text-sm"
              >
                <BookOpen className="w-4 h-4 text-cyan-600" />
                <span>View Documentation</span>
              </a>
            </div>

            {/* 3 Live Mini Telemetry Badges */}
            <div className="grid grid-cols-3 gap-3 pt-4 border-t border-blue-100/80">
              <div className="bg-white/60 backdrop-blur-md rounded-2xl p-3 border border-white/80 hover:border-rose-300 hover:ring-2 hover:ring-rose-400/40 transition-all">
                <div className="text-[10px] font-mono text-slate-400 uppercase">Emergency Tag</div>
                <div className="text-xs font-bold text-rose-600 font-mono mt-0.5 flex items-center space-x-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></span>
                  <span>DSCP 46 (EF)</span>
                </div>
              </div>

              <div className="bg-white/60 backdrop-blur-md rounded-2xl p-3 border border-white/80 hover:border-cyan-300 hover:ring-2 hover:ring-cyan-400/40 transition-all">
                <div className="text-[10px] font-mono text-slate-400 uppercase">Transfer Speed</div>
                <div className="text-xs font-bold text-cyan-700 font-mono mt-0.5">
                  5.4s <span className="text-[10px] text-slate-500">(92.9% faster)</span>
                </div>
              </div>

              <div className="bg-white/60 backdrop-blur-md rounded-2xl p-3 border border-white/80 hover:border-emerald-300 hover:ring-2 hover:ring-emerald-400/40 transition-all">
                <div className="text-[10px] font-mono text-slate-400 uppercase">Packet Drop</div>
                <div className="text-xs font-bold text-emerald-600 font-mono mt-0.5">
                  0.00% Zero-Loss
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: ANIMATED HIGH-TECH 3D MRI SCANNER & HOLOGRAPHIC NEURO-TELEMETRY */}
          <div className="lg:w-1/2 w-full flex justify-center">
            <div 
              onMouseEnter={() => setScanSpeed('fast')}
              onMouseLeave={() => setScanSpeed('normal')}
              className="group relative w-full max-w-lg rounded-[2.5rem] bg-white/80 backdrop-blur-2xl border border-white/80 hover:border-cyan-300 hover:ring-4 hover:ring-cyan-400/50 hover:shadow-[0_20px_60px_-10px_rgba(6,182,212,0.35)] transition-all duration-500 transform hover:-translate-y-2 p-6 overflow-hidden cursor-pointer"
            >
              
              {/* Top Scanner HUD Header */}
              <div className="flex items-center justify-between pb-3 border-b border-blue-100 relative z-20">
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
                  <span className="text-xs font-bold text-blue-950 tracking-tight">
                    LIVE MRI SCANNER • 10.0T Gantry
                  </span>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-rose-100 text-rose-700 border border-rose-200 animate-pulse">
                  DSCP 46 EF FAST-LANE
                </span>
              </div>

              {/* Central Interactive Scanner Gantry & Brain Hologram */}
              <div className="relative my-6 h-64 flex items-center justify-center overflow-hidden rounded-3xl bg-gradient-to-b from-blue-950 via-slate-900 to-blue-950 shadow-inner">
                
                {/* Background Digital Grid Matrix */}
                <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:16px_16px]"></div>

                {/* Concentric Rotating Outer Scanner Calibration Rings */}
                <div className={`absolute w-52 h-52 rounded-full border-2 border-dashed border-cyan-400/30 ${scanSpeed === 'fast' ? 'animate-spin' : 'animate-spin-slow'} transition-all`}></div>
                <div className={`absolute w-44 h-44 rounded-full border border-sky-400/40 ${scanSpeed === 'fast' ? 'animate-spin-reverse-slow' : 'animate-spin-reverse-slow'}`}></div>
                <div className="absolute w-36 h-36 rounded-full border-2 border-cyan-500/50 shadow-[0_0_20px_rgba(6,182,212,0.4)]"></div>

                {/* Laser Scanning Beam moving vertically */}
                <div className="absolute inset-x-4 h-0.5 bg-cyan-400 shadow-[0_0_15px_#38bdf8] animate-scan-beam z-10 pointer-events-none">
                  <div className="absolute top-0 inset-x-0 h-8 bg-gradient-to-t from-cyan-400/25 to-transparent -translate-y-full"></div>
                </div>

                {/* Holographic Wireframe Brain / Neuro-Imaging Scan SVG */}
                <div className="relative z-10 w-28 h-28 text-cyan-300 drop-shadow-[0_0_12px_rgba(56,189,248,0.7)] transform group-hover:scale-110 transition-transform duration-500">
                  <svg viewBox="0 0 100 100" fill="none" className="w-full h-full stroke-current">
                    {/* Left Hemisphere Outline */}
                    <path 
                      d="M 50,20 C 35,20 22,30 22,45 C 22,55 28,62 32,68 C 36,74 40,82 50,82" 
                      strokeWidth="2.5" 
                      strokeLinecap="round" 
                    />
                    {/* Right Hemisphere Outline */}
                    <path 
                      d="M 50,20 C 65,20 78,30 78,45 C 78,55 72,62 68,68 C 64,74 60,82 50,82" 
                      strokeWidth="2.5" 
                      strokeLinecap="round" 
                    />
                    {/* Cerebral Cortex Convolutions */}
                    <path d="M 32,32 Q 42,36 38,48 Q 30,52 38,60" strokeWidth="1.8" strokeDasharray="3 2" />
                    <path d="M 68,32 Q 58,36 62,48 Q 70,52 62,60" strokeWidth="1.8" strokeDasharray="3 2" />
                    <path d="M 50,22 L 50,80" strokeWidth="1.5" strokeDasharray="2 2" stroke="#38bdf8" />
                    
                    {/* Synaptic Pulsing Nodes */}
                    <circle cx="38" cy="38" r="3" fill="#38bdf8" className="animate-ping" />
                    <circle cx="62" cy="42" r="3" fill="#38bdf8" className="animate-ping" style={{ animationDelay: '0.6s' }} />
                    <circle cx="50" cy="55" r="3.5" fill="#f43f5e" className="animate-ping" style={{ animationDelay: '1.2s' }} />
                  </svg>
                </div>

                {/* Floating Telemetry HUD Badges */}
                <div className="absolute top-3 left-3 bg-blue-900/80 backdrop-blur-md border border-cyan-400/40 rounded-xl px-2.5 py-1 text-[10px] font-mono text-cyan-300 shadow-md animate-gentle-float">
                  LLQ Latency: <strong className="text-white">4.2ms</strong>
                </div>

                <div className="absolute bottom-3 right-3 bg-blue-900/80 backdrop-blur-md border border-cyan-400/40 rounded-xl px-2.5 py-1 text-[10px] font-mono text-cyan-300 shadow-md animate-gentle-float" style={{ animationDelay: '1.5s' }}>
                  DICOM Volume: <strong className="text-white">350 MB</strong>
                </div>

                {/* Orbiting Live QoS Packets */}
                <div className="absolute -top-1 right-12 px-2 py-0.5 rounded-full bg-rose-500/90 text-white text-[9px] font-mono font-bold animate-pulse shadow-[0_0_10px_rgba(244,63,94,0.8)]">
                  DSCP 46 [EF]
                </div>
              </div>

              {/* Bottom Real-Time Telemetry Bar & ECG */}
              <div className="space-y-2 pt-1 relative z-20">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-500">Live Throughput Pipeline</span>
                  <span className="text-cyan-700 font-bold">942 Mbps • Zero Drops</span>
                </div>

                {/* ECG Heartbeat Waveform Strip */}
                <div className="w-full h-7 bg-blue-50/70 rounded-xl border border-blue-100 overflow-hidden flex items-center px-2">
                  <svg className="w-full h-5" viewBox="0 0 240 20" fill="none">
                    <path
                      d="M 0 10 L 40 10 L 48 3 L 56 17 L 64 2 L 72 16 L 80 10 L 130 10 L 138 3 L 146 17 L 154 2 L 162 16 L 170 10 L 240 10"
                      stroke="#0284c7"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
                
                <div className="text-[10px] text-center text-slate-400 font-mono">
                  Hover over scanner to accelerate telemetry diagnostics
                </div>
              </div>

            </div>
          </div>

        </div>
      </main>

      {/* Downside Interactive MRI Scanner Modality & Architecture Station */}
      <section id="scanner" className="relative z-10 max-w-7xl mx-auto px-6 pb-24 pt-6 scroll-mt-24">
        
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center space-x-2 bg-cyan-100/80 text-cyan-800 px-3.5 py-1 rounded-full text-xs font-semibold mb-2">
            <Radio className="w-3.5 h-3.5 text-cyan-600 animate-pulse" />
            <span>Interactive L3 Modality Pipeline</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold text-blue-950 tracking-tight">
            End-to-End Hospital MRI Flow
          </h2>
          <p className="text-sm text-slate-500 mt-2">
            Hover over each modality node below to see high-intensity highlighting, Layer 3 DSCP markings, and router queuing behaviors.
          </p>
        </div>

        {/* The 3 Connected Station Cards with High Intensity Hover Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
          
          {/* Node 1: MRI Scanner Station (VLAN 10) */}
          <div className="group bg-white/90 backdrop-blur-xl border border-white/60 hover:border-rose-400 hover:ring-4 hover:ring-rose-400/60 rounded-[2.5rem] p-7 shadow-[0_8px_30px_rgb(0,0,0,0.04)] shadow-blue-900/10 hover:shadow-[0_20px_50px_-5px_rgba(244,63,94,0.35)] transition-all duration-300 transform hover:-translate-y-3 hover:scale-[1.02] flex flex-col justify-between cursor-pointer relative overflow-hidden">
            <div className="absolute top-0 right-0 w-28 h-28 bg-rose-500/10 rounded-full blur-2xl group-hover:bg-rose-500/20 transition-all"></div>
            
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-rose-100 group-hover:bg-rose-500 text-rose-600 group-hover:text-white flex items-center justify-center transition-all duration-300 transform group-hover:scale-110 group-hover:rotate-6 shadow-md">
                  <Activity className="w-6 h-6 animate-pulse" />
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-rose-100 text-rose-700 border border-rose-200">
                  SOURCE NODE
                </span>
              </div>
              
              <h3 className="text-lg font-bold text-blue-950 group-hover:text-rose-700 transition-colors">
                Emergency MRI Scanner
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Hospital Trauma Suite Siemens Magnetom 10.0T. Authorized emergency physician marks imaging order.
              </p>

              <div className="mt-4 p-3 bg-rose-50/70 rounded-2xl border border-rose-100 space-y-1.5 text-xs font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-500">Source IP:</span>
                  <span className="font-bold text-blue-950">192.168.10.10</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Subnet VLAN:</span>
                  <span className="font-bold text-rose-700">VLAN 10 (Emergency)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">L3 Marking:</span>
                  <span className="font-bold text-rose-600 bg-rose-100 px-1.5 py-0.2 rounded">DSCP 46 (EF)</span>
                </div>
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-rose-100 flex items-center justify-between text-xs">
              <span className="font-bold text-rose-700">Live Modality Active</span>
              <span className="text-[10px] font-mono text-slate-400">Stream: 350 MB</span>
            </div>
          </div>

          {/* Node 2: Cisco L3 QoS Gateway (RFC 2474 / RFC 3246) */}
          <div className="group bg-white/90 backdrop-blur-xl border border-white/60 hover:border-cyan-400 hover:ring-4 hover:ring-cyan-400/60 rounded-[2.5rem] p-7 shadow-[0_8px_30px_rgb(0,0,0,0.04)] shadow-blue-900/10 hover:shadow-[0_20px_50px_-5px_rgba(6,182,212,0.35)] transition-all duration-300 transform hover:-translate-y-3 hover:scale-[1.02] flex flex-col justify-between cursor-pointer relative overflow-hidden">
            <div className="absolute top-0 right-0 w-28 h-28 bg-cyan-500/10 rounded-full blur-2xl group-hover:bg-cyan-500/20 transition-all"></div>
            
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-cyan-100 group-hover:bg-cyan-500 text-cyan-600 group-hover:text-white flex items-center justify-center transition-all duration-300 transform group-hover:scale-110 group-hover:rotate-6 shadow-md">
                  <Server className="w-6 h-6 animate-pulse" />
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-100 text-cyan-800 border border-cyan-200">
                  ROUTER ENGINE
                </span>
              </div>
              
              <h3 className="text-lg font-bold text-blue-950 group-hover:text-cyan-700 transition-colors">
                Cisco 2911 QoS Gateway
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Hardware DiffServ router executing Strict Priority LLQ scheduling. Zero buffer delay for trauma scans.
              </p>

              <div className="mt-4 p-3 bg-cyan-50/70 rounded-2xl border border-cyan-100 space-y-1.5 text-xs font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-500">Gateway IP:</span>
                  <span className="font-bold text-blue-950">192.168.10.1</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Scheduler:</span>
                  <span className="font-bold text-cyan-700">Strict LLQ + CBWFQ</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">QoS Latency:</span>
                  <span className="font-bold text-emerald-600 bg-emerald-100 px-1.5 py-0.2 rounded">4.2 ms Guaranteed</span>
                </div>
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-cyan-100 flex items-center justify-between text-xs">
              <span className="font-bold text-cyan-700">Bandwidth: 1 Gbps</span>
              <span className="text-[10px] font-mono text-slate-400">RFC 3246 EF</span>
            </div>
          </div>

          {/* Node 3: PACS Storage Core Archive (VLAN 30) */}
          <div className="group bg-white/90 backdrop-blur-xl border border-white/60 hover:border-purple-400 hover:ring-4 hover:ring-purple-400/60 rounded-[2.5rem] p-7 shadow-[0_8px_30px_rgb(0,0,0,0.04)] shadow-blue-900/10 hover:shadow-[0_20px_50px_-5px_rgba(168,85,247,0.35)] transition-all duration-300 transform hover:-translate-y-3 hover:scale-[1.02] flex flex-col justify-between cursor-pointer relative overflow-hidden">
            <div className="absolute top-0 right-0 w-28 h-28 bg-purple-500/10 rounded-full blur-2xl group-hover:bg-purple-500/20 transition-all"></div>
            
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-purple-100 group-hover:bg-purple-600 text-purple-600 group-hover:text-white flex items-center justify-center transition-all duration-300 transform group-hover:scale-110 group-hover:rotate-6 shadow-md">
                  <HardDrive className="w-6 h-6 animate-pulse" />
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-purple-100 text-purple-800 border border-purple-200">
                  DESTINATION SCP
                </span>
              </div>
              
              <h3 className="text-lg font-bold text-blue-950 group-hover:text-purple-700 transition-colors">
                Core PACS Archive
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Hospital Central DICOM Storage Provider. High-availability cluster archiving trauma neuroscans.
              </p>

              <div className="mt-4 p-3 bg-purple-50/70 rounded-2xl border border-purple-100 space-y-1.5 text-xs font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-500">Destination IP:</span>
                  <span className="font-bold text-blue-950">192.168.30.10</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">DICOM Port:</span>
                  <span className="font-bold text-purple-700">TCP 104 (C-STORE)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Ingest Status:</span>
                  <span className="font-bold text-emerald-600 bg-emerald-100 px-1.5 py-0.2 rounded">Instant Ingest</span>
                </div>
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-purple-100 flex items-center justify-between text-xs">
              <span className="font-bold text-purple-700">Storage: 48 TB RAID-6</span>
              <span className="text-[10px] font-mono text-slate-400">VLAN 30 Core</span>
            </div>
          </div>

        </div>

      </section>

      {/* Feature Grid with Hover Float & Glow */}
      <section id="features" className="relative z-10 max-w-7xl mx-auto px-6 pb-24 pt-6 scroll-mt-24">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <div className="group bg-white/90 backdrop-blur-xl border border-white/60 hover:border-cyan-300 hover:ring-2 hover:ring-cyan-400/50 rounded-[2.5rem] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] shadow-blue-900/10 hover:shadow-2xl hover:shadow-cyan-500/20 transition-all duration-300 transform hover:-translate-y-2 hover:scale-[1.015] cursor-pointer">
            <div className="w-12 h-12 rounded-2xl bg-cyan-100 group-hover:bg-cyan-500 text-cyan-600 group-hover:text-white flex items-center justify-center mb-6 transition-all duration-300 transform group-hover:scale-110 group-hover:rotate-6 shadow-sm">
              <Network className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-blue-950 group-hover:text-cyan-800 transition-colors mb-3">RFC 2474 DiffServ</h3>
            <p className="text-sm text-slate-500 leading-relaxed mb-4">
              Marks medical traffic directly at the OSI Layer 3 IPv4 header using 6-bit Differentiated Services Code Points.
            </p>
            <span className="inline-block px-3 py-1 bg-cyan-50 border border-cyan-200/80 rounded-full text-[10px] font-mono font-bold text-cyan-700">
              DSCP 46 (EF) | DSCP 34 (AF41)
            </span>
          </div>

          <div className="group bg-white/90 backdrop-blur-xl border border-white/60 hover:border-rose-300 hover:ring-2 hover:ring-rose-400/50 rounded-[2.5rem] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] shadow-blue-900/10 hover:shadow-2xl hover:shadow-rose-500/20 transition-all duration-300 transform hover:-translate-y-2 hover:scale-[1.015] cursor-pointer">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 group-hover:bg-rose-500 text-rose-600 group-hover:text-white flex items-center justify-center mb-6 transition-all duration-300 transform group-hover:scale-110 group-hover:rotate-6 shadow-sm">
              <Zap className="w-6 h-6 animate-pulse" />
            </div>
            <h3 className="text-xl font-bold text-blue-950 group-hover:text-rose-800 transition-colors mb-3">Zero-Loss Queuing</h3>
            <p className="text-sm text-slate-500 leading-relaxed mb-4">
              Emergency trauma scans bypass congested router buffers via Strict Priority Low-Latency Queuing (LLQ).
            </p>
            <span className="inline-block px-3 py-1 bg-rose-50 border border-rose-200/80 rounded-full text-[10px] font-mono font-bold text-rose-700">
              Transfer Delay: ~5.4s
            </span>
          </div>

          <div className="group bg-white/90 backdrop-blur-xl border border-white/60 hover:border-indigo-300 hover:ring-2 hover:ring-indigo-400/50 rounded-[2.5rem] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] shadow-blue-900/10 hover:shadow-2xl hover:shadow-indigo-500/20 transition-all duration-300 transform hover:-translate-y-2 hover:scale-[1.015] cursor-pointer">
            <div className="w-12 h-12 rounded-2xl bg-indigo-100 group-hover:bg-indigo-600 text-indigo-600 group-hover:text-white flex items-center justify-center mb-6 transition-all duration-300 transform group-hover:scale-110 group-hover:rotate-6 shadow-sm">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-blue-950 group-hover:text-indigo-800 transition-colors mb-3">Edge Defense</h3>
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
        <div className="bg-white/90 backdrop-blur-xl border border-white/60 hover:border-cyan-300 hover:ring-2 hover:ring-cyan-400/30 rounded-[2.5rem] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] shadow-blue-900/10 hover:shadow-2xl transition-all duration-300">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            
            <div className="flex flex-col items-center p-6 bg-blue-50/60 hover:bg-white rounded-2xl border border-blue-100 hover:border-rose-300 hover:ring-2 hover:ring-rose-400/40 w-full text-center transition-all duration-300 transform hover:-translate-y-1 hover:scale-105 shadow-sm">
              <Activity className="w-8 h-8 text-rose-500 mb-3 animate-pulse" />
              <span className="text-blue-950 font-bold">MRI Scanners</span>
              <span className="text-xs text-slate-500 font-mono mt-1">VLAN 10 • 192.168.10.10</span>
            </div>

            <ArrowRight className="w-8 h-8 text-cyan-500 hidden md:block flex-shrink-0 animate-pulse" />
            
            <div className="flex flex-col items-center p-6 bg-cyan-50/90 hover:bg-white rounded-2xl border border-cyan-300 hover:border-cyan-400 hover:ring-2 hover:ring-cyan-400/60 w-full relative overflow-hidden text-center shadow-md shadow-cyan-500/10 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 hover:scale-105">
              <Server className="w-8 h-8 text-cyan-600 mb-3" />
              <span className="text-blue-950 font-bold">L3 QoS Gateway</span>
              <span className="text-xs text-cyan-700 font-mono font-bold mt-1">Strict Priority (LLQ)</span>
            </div>

            <ArrowRight className="w-8 h-8 text-cyan-500 hidden md:block flex-shrink-0 animate-pulse" />
            
            <div className="flex flex-col items-center p-6 bg-blue-50/60 hover:bg-white rounded-2xl border border-blue-100 hover:border-purple-300 hover:ring-2 hover:ring-purple-400/40 w-full text-center transition-all duration-300 transform hover:-translate-y-1 hover:scale-105 shadow-sm">
              <HardDrive className="w-8 h-8 text-purple-600 mb-3" />
              <span className="text-blue-950 font-bold">PACS Archive</span>
              <span className="text-xs text-slate-500 font-mono mt-1">VLAN 30 • 192.168.30.10</span>
            </div>

          </div>
        </div>
      </section>

      {/* Documentation Section */}
      <section id="docs" className="relative z-10 max-w-7xl mx-auto px-6 pb-28 pt-6 scroll-mt-24">
        <h2 className="text-3xl font-bold text-blue-950 mb-8 text-center">Documentation & Standards</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          <div className="bg-white/90 backdrop-blur-xl border border-white/60 hover:border-cyan-300 hover:ring-2 hover:ring-cyan-400/30 rounded-[2.5rem] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] shadow-blue-900/10 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
            <h3 className="text-xl font-bold text-blue-950 mb-4 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-cyan-600"/> 
              RFC Standards
            </h3>
            <ul className="space-y-4 text-sm text-slate-600">
              <li className="flex flex-col">
                <strong className="text-blue-950 mb-0.5 font-bold">RFC 2474:</strong> 
                <span>Differentiated Services Field Definition in IPv4 and IPv6 Headers.</span>
              </li>
              <li className="flex flex-col">
                <strong className="text-blue-950 mb-0.5 font-bold">RFC 3246:</strong> 
                <span>Expedited Forwarding (EF) Per-Hop Behavior (DSCP 46).</span>
              </li>
              <li className="flex flex-col">
                <strong className="text-blue-950 mb-0.5 font-bold">RFC 2597:</strong> 
                <span>Assured Forwarding (AF) PHB Group (DSCP 34).</span>
              </li>
            </ul>
          </div>

          <div className="bg-white/90 backdrop-blur-xl border border-white/60 hover:border-indigo-300 hover:ring-2 hover:ring-indigo-400/30 rounded-[2.5rem] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] shadow-blue-900/10 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
            <h3 className="text-xl font-bold text-blue-950 mb-4 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-indigo-600"/> 
              Security Protocols
            </h3>
            <ul className="space-y-4 text-sm text-slate-600">
              <li className="flex flex-col">
                <strong className="text-blue-950 mb-0.5 font-bold">Edge Trust Boundaries:</strong> 
                <span>Untrusted endpoints attempting to claim priority are force-remarked to DSCP 0 at the switch level.</span>
              </li>
              <li className="flex flex-col">
                <strong className="text-blue-950 mb-0.5 font-bold">Anti-Spoofing:</strong> 
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