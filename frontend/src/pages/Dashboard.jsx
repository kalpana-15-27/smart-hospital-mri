import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  Heart, 
  Clock, 
  Activity, 
  Moon, 
  Sliders, 
  Zap, 
  CheckCircle2, 
  Layers, 
  Send, 
  RefreshCw, 
  PlusCircle, 
  Thermometer,
  ShieldCheck,
  TrendingUp,
  ArrowRight
} from 'lucide-react';

export default function Dashboard({ setActiveTab, setSelectedPacket }) {
  const { currentUser } = useAuth();
  const [stats, setStats] = useState(null);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [transmittingId, setTransmittingId] = useState(null);
  const [backgroundLoad, setBackgroundLoad] = useState(75);
  const [enablePriority, setEnablePriority] = useState(true);
  const [lastResult, setLastResult] = useState(null);

  const loadData = async () => {
    try {
      const [statsData, queueData] = await Promise.all([
        api.getStats(),
        api.getMRIQueue()
      ]);
      setStats(statsData);
      setRequests(queueData);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleTransmit = async (reqId) => {
    setTransmittingId(reqId);
    setLastResult(null);
    try {
      const res = await api.transmitStudy(reqId, {
        background_traffic_mbps: backgroundLoad,
        enable_qos: enablePriority
      });
      setLastResult(res);
      await loadData();
    } catch (err) {
      alert('Transmission error: ' + err.message);
    } finally {
      setTransmittingId(null);
    }
  };

  const emergencyScans = requests.filter(r => r.urgency === 'EMERGENCY');
  const urgentScans = requests.filter(r => r.urgency === 'URGENT');
  const normalScans = requests.filter(r => r.urgency === 'NORMAL');

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'Good Morning';
    if (hour >= 12 && hour < 17) return 'Good Afternoon';
    if (hour >= 17 && hour < 22) return 'Good Evening';
    return 'Good Night';
  };

  return (
    <div className="space-y-6">
      
      {/* 1. Header with Greeting & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-blue-100">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-blue-950">
            {getGreeting()}, <span className="text-cyan-600 font-extrabold">{currentUser ? (currentUser.name || currentUser.username) : 'Dr. Sarah Sharma'}!</span>
          </h1>
          <p className="text-xs text-blue-700/70 mt-0.5">
            Hospital Emergency MRI Prioritization System &bull; Layer 3 IP-Based QoS Gateway
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setActiveTab('order')}
            className="px-5 py-2.5 bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-500 hover:to-blue-600 text-white rounded-full text-xs font-bold flex items-center space-x-2 transition-all shadow-md shadow-blue-500/25"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Order Emergency Scan</span>
          </button>
          
          <button
            onClick={() => setActiveTab('speedtest')}
            className="px-5 py-2.5 bg-white hover:bg-blue-50 border border-blue-200/80 text-blue-700 hover:text-blue-950 rounded-full text-xs font-bold flex items-center space-x-2 transition-all shadow-sm"
          >
            <Zap className="w-4 h-4 text-cyan-500" />
            <span>Speed Benchmark</span>
          </button>
        </div>
      </div>

      {/* 2. Health & Network QoS Statistics (4 Soft Oceanic Glass Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: MRI Throughput */}
        <div className="bg-white/90 backdrop-blur-xl border border-white/60 rounded-[2.5rem] p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] shadow-blue-900/10 flex flex-col justify-between h-36 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">Heart Rate / Throughput</span>
            <div className="w-8 h-8 rounded-xl bg-cyan-100 text-cyan-600 flex items-center justify-center">
              <Heart className="w-4 h-4 fill-cyan-400/40" />
            </div>
          </div>
          
          <div className="flex items-center justify-between my-1">
            <div>
              <span className="text-2xl font-bold text-blue-950 font-mono">76</span>
              <span className="text-xs text-slate-400 ml-1">Mbps</span>
            </div>

            {/* Cyan ECG Polyline */}
            <div className="w-20 h-8">
              <svg className="w-full h-full" viewBox="0 0 70 28" fill="none">
                <path 
                  d="M 0 14 L 15 14 L 20 6 L 27 22 L 34 2 L 40 20 L 45 14 L 70 14" 
                  stroke="#0284c7" 
                  strokeWidth="2.4" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px]">
            <span className="text-cyan-700 font-bold">Normal Range</span>
            <span className="text-slate-500 font-mono text-[10px]">Fast Lane (DSCP 46)</span>
          </div>
        </div>

        {/* Card 2: Queue Load / Steps */}
        <div className="bg-white/90 backdrop-blur-xl border border-white/60 rounded-[2.5rem] p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] shadow-blue-900/10 flex flex-col justify-between h-36">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">Steps / Queue Load</span>
            <span className="text-[10px] text-cyan-700 font-mono font-bold bg-cyan-50 px-2 py-0.5 rounded-full">Target: 8k</span>
          </div>

          <div className="flex items-center justify-between my-1">
            <div>
              <div className="text-2xl font-bold text-blue-950 font-mono">6,432</div>
              <div className="text-xs text-slate-400">packets</div>
            </div>

            {/* Circular Progress Ring with 80% */}
            <div className="relative w-12 h-12 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#e2e8f0"
                  strokeWidth="3.6"
                />
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#0284c7"
                  strokeWidth="3.6"
                  strokeDasharray="80, 100"
                  strokeLinecap="round"
                />
              </svg>
              <span className="absolute font-bold text-[10px] text-blue-950 font-mono">80%</span>
            </div>
          </div>

          <div className="text-[11px] text-slate-400">Target: 8,000 packets</div>
        </div>

        {/* Card 3: Blood Pressure / Latency */}
        <div className="bg-white/90 backdrop-blur-xl border border-white/60 rounded-[2.5rem] p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] shadow-blue-900/10 flex flex-col justify-between h-36">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">Blood Pressure / Latency</span>
            <div className="w-8 h-8 rounded-xl bg-cyan-100 text-cyan-600 flex items-center justify-center">
              <Thermometer className="w-4 h-4" />
            </div>
          </div>

          <div className="my-1">
            <span className="text-2xl font-bold text-blue-950 font-mono">118/79</span>
            <span className="text-xs text-slate-500 ml-1">mmHg &bull; <strong className="text-emerald-600 font-mono">4.2ms</strong></span>
          </div>

          <div className="flex items-center justify-between text-[11px]">
            <span className="text-cyan-700 font-bold">Stable</span>
            <span className="text-slate-500 font-mono text-[10px]">Sub-10ms QoS</span>
          </div>
        </div>

        {/* Card 4: Sleep / Buffer Delay Prevented */}
        <div className="bg-white/90 backdrop-blur-xl border border-white/60 rounded-[2.5rem] p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] shadow-blue-900/10 flex flex-col justify-between h-36">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">Buffer Delay Prevented</span>
            <div className="w-8 h-8 rounded-xl bg-cyan-100 text-cyan-600 flex items-center justify-center">
              <Moon className="w-4 h-4" />
            </div>
          </div>

          <div className="my-1">
            <span className="text-2xl font-bold text-blue-950 font-mono">7h 12m</span>
            <span className="text-xs text-slate-500 ml-1">&bull; 237ms Saved</span>
          </div>

          <div className="flex items-center justify-between text-[11px]">
            <span className="text-cyan-700 font-bold">Optimal</span>
            <span className="text-slate-500 font-mono text-[10px]">0% Drops</span>
          </div>
        </div>

      </div>

      {/* 3. Activity Overview (Waveform Card) */}
      <div className="bg-white/90 backdrop-blur-xl border border-white/60 rounded-[2.5rem] p-7 shadow-[0_8px_30px_rgb(0,0,0,0.04)] shadow-blue-900/10 space-y-3">
        <div className="flex items-center justify-between border-b border-blue-100 pb-3">
          <div>
            <h3 className="text-sm font-bold text-blue-950 tracking-tight">Activity Overview</h3>
            <p className="text-xs text-slate-500">MRI bandwidth load & QoS throughput</p>
          </div>
          <span className="text-xs font-mono font-bold text-cyan-700 bg-cyan-50 px-3 py-1 rounded-full border border-cyan-200">
            Real-Time QoS Telemetry
          </span>
        </div>

        <div className="relative pt-2 pb-2">
          {/* Y-Axis labels */}
          <div className="absolute left-0 top-2 bottom-8 flex flex-col justify-between text-[10px] text-slate-400 font-mono">
            <span>1500</span>
            <span>1000</span>
            <span>500</span>
            <span>0</span>
          </div>

          {/* SVG Waveform Curve */}
          <div className="pl-12 pr-2">
            <svg className="w-full h-28 overflow-visible" viewBox="0 0 500 80" preserveAspectRatio="none">
              <defs>
                <linearGradient id="cyanAreaSoft" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              <path
                d="M 0,72 C 60,78 120,74 180,56 C 240,38 300,24 360,12 C 420,4 460,32 500,18 L 500,80 L 0,80 Z"
                fill="url(#cyanAreaSoft)"
              />
              <path
                d="M 0,72 C 60,78 120,74 180,56 C 240,38 300,24 360,12 C 420,4 460,32 500,18"
                fill="none"
                stroke="#0284c7"
                strokeWidth="2.8"
                strokeLinecap="round"
              />
            </svg>
          </div>

          {/* X-Axis Days */}
          <div className="flex justify-between pl-12 pr-2 pt-2 text-xs text-slate-400 font-medium">
            <span>Sun</span>
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
          </div>
        </div>
      </div>

      {/* 4. Interactive Network Congestion Slider & Priority Toggle */}
      <div className="bg-white/90 backdrop-blur-xl border border-white/60 rounded-[2.5rem] p-7 shadow-[0_8px_30px_rgb(0,0,0,0.04)] shadow-blue-900/10 space-y-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex-1 w-full space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-blue-950 font-bold flex items-center space-x-2">
                <Sliders className="w-4 h-4 text-cyan-600" />
                <span>Simulate Hospital Network Congestion:</span>
              </span>
              <span className="font-mono font-bold text-cyan-800 bg-cyan-100 px-3 py-1 rounded-full border border-cyan-200 text-xs">
                {backgroundLoad}% Busy ({backgroundLoad} Mbps)
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="95"
              step="5"
              value={backgroundLoad}
              onChange={(e) => setBackgroundLoad(parseFloat(e.target.value))}
              className="w-full h-2.5 bg-blue-100 rounded-lg appearance-none cursor-pointer accent-cyan-500"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
              <span>Quiet Bay (0%)</span>
              <span>Moderate Traffic (50%)</span>
              <span>Heavy Hospital Saturation (95%)</span>
            </div>
          </div>

          <div className="flex items-center space-x-4 border-t md:border-t-0 md:border-l border-blue-100 pt-3 md:pt-0 md:pl-6">
            <div>
              <div className="text-xs font-bold text-blue-950">Priority Routing</div>
              <div className="text-[10px] text-slate-500 font-mono">
                {enablePriority ? 'Fast Lane Active' : 'Normal FIFO'}
              </div>
            </div>

            <button
              onClick={() => setEnablePriority(!enablePriority)}
              className={`px-5 py-2.5 rounded-full text-xs font-bold font-mono transition-all shadow-sm ${
                enablePriority
                  ? 'bg-gradient-to-r from-cyan-400 to-blue-500 text-white shadow-blue-500/25'
                  : 'bg-blue-50 text-slate-600 border border-blue-200'
              }`}
            >
              {enablePriority ? 'FAST LANE ON' : 'FIFO OFF'}
            </button>
          </div>
        </div>
      </div>

      {/* Live Result Toast if a study was just transmitted */}
      {lastResult && (
        <div className="bg-white/95 backdrop-blur-xl border border-emerald-300 rounded-[2.5rem] p-6 space-y-3 shadow-md shadow-emerald-500/10 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-emerald-700 font-bold text-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Study Transmitted Successfully to PACS!</span>
            </div>
            <span className="text-[11px] font-mono text-slate-600">
              Forwarding Mode: <strong className="text-blue-950">{lastResult.scenario === 'QOS_PRIORITY' ? 'Fast Lane (SPQ)' : 'Standard FIFO'}</strong>
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono pt-1">
            <div className="bg-blue-50/70 p-3 rounded-2xl border border-blue-100">
              <div className="text-[10px] text-slate-500">Transfer Time</div>
              <div className="text-sm font-bold text-emerald-600">{lastResult.metrics.transfer_time_sec}s</div>
            </div>
            <div className="bg-blue-50/70 p-3 rounded-2xl border border-blue-100">
              <div className="text-[10px] text-slate-500">Latency</div>
              <div className="text-sm font-bold text-cyan-600">{lastResult.metrics.latency_ms}ms</div>
            </div>
            <div className="bg-blue-50/70 p-3 rounded-2xl border border-blue-100">
              <div className="text-[10px] text-slate-500">Throughput</div>
              <div className="text-sm font-bold text-blue-700">{lastResult.metrics.throughput_mbps} Mbps</div>
            </div>
            <div className="bg-blue-50/70 p-3 rounded-2xl border border-blue-100">
              <div className="text-[10px] text-slate-500">Packet Drop Rate</div>
              <div className={`text-sm font-bold ${lastResult.metrics.packet_loss_pct > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                {lastResult.metrics.packet_loss_pct}%
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. The 3 Priority Queues */}
      <div className="space-y-4">
        
        {/* Lane 1: Emergency Express Lane */}
        <div className="bg-white/90 backdrop-blur-xl border border-rose-200 rounded-[2.5rem] p-7 shadow-[0_8px_30px_rgb(0,0,0,0.04)] shadow-rose-900/5 space-y-4">
          <div className="flex items-center justify-between border-b border-rose-100 pb-3">
            <div className="flex items-center space-x-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse"></span>
              <h2 className="text-sm font-bold text-blue-950">Emergency Fast Lane</h2>
              <span className="bg-rose-100 text-rose-700 text-[10px] px-2.5 py-0.5 rounded-full font-mono font-bold border border-rose-200">
                DSCP 46 (EF)
              </span>
            </div>
            <span className="text-xs text-slate-400 font-mono">
              {emergencyScans.length} scans waiting
            </span>
          </div>

          {emergencyScans.length === 0 ? (
            <div className="py-6 text-center text-xs text-slate-400 border border-dashed border-rose-200 rounded-2xl">
              No emergency scans currently waiting.
            </div>
          ) : (
            <div className="space-y-3">
              {emergencyScans.map(req => (
                <QueueItem
                  key={req.id}
                  req={req}
                  transmitting={transmittingId === req.id}
                  onTransmit={() => handleTransmit(req.id)}
                  onInspect={() => setSelectedPacket(req)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Lane 2: Urgent Lane */}
        <div className="bg-white/90 backdrop-blur-xl border border-amber-200 rounded-[2.5rem] p-7 shadow-[0_8px_30px_rgb(0,0,0,0.04)] shadow-amber-900/5 space-y-4">
          <div className="flex items-center justify-between border-b border-amber-100 pb-3">
            <div className="flex items-center space-x-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
              <h2 className="text-sm font-bold text-blue-950">Urgent / ICU Lane</h2>
              <span className="bg-amber-100 text-amber-800 text-[10px] px-2.5 py-0.5 rounded-full font-mono font-bold border border-amber-200">
                DSCP 34 (AF41)
              </span>
            </div>
            <span className="text-xs text-slate-400 font-mono">
              {urgentScans.length} scans waiting
            </span>
          </div>

          {urgentScans.length === 0 ? (
            <div className="py-6 text-center text-xs text-slate-400 border border-dashed border-amber-200 rounded-2xl">
              No urgent scans currently waiting.
            </div>
          ) : (
            <div className="space-y-3">
              {urgentScans.map(req => (
                <QueueItem
                  key={req.id}
                  req={req}
                  transmitting={transmittingId === req.id}
                  onTransmit={() => handleTransmit(req.id)}
                  onInspect={() => setSelectedPacket(req)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Lane 3: Standard Lane */}
        <div className="bg-white/90 backdrop-blur-xl border border-blue-200 rounded-[2.5rem] p-7 shadow-[0_8px_30px_rgb(0,0,0,0.04)] shadow-blue-900/5 space-y-4">
          <div className="flex items-center justify-between border-b border-blue-100 pb-3">
            <div className="flex items-center space-x-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-500"></span>
              <h2 className="text-sm font-bold text-blue-950">Standard Lane</h2>
              <span className="bg-cyan-100 text-cyan-800 text-[10px] px-2.5 py-0.5 rounded-full font-mono font-bold border border-cyan-200">
                DSCP 0 (CS0)
              </span>
            </div>
            <span className="text-xs text-slate-400 font-mono">
              {normalScans.length} scans waiting
            </span>
          </div>

          {normalScans.length === 0 ? (
            <div className="py-6 text-center text-xs text-slate-400 border border-dashed border-blue-200 rounded-2xl">
              No standard scans currently waiting.
            </div>
          ) : (
            <div className="space-y-3">
              {normalScans.map(req => (
                <QueueItem
                  key={req.id}
                  req={req}
                  transmitting={transmittingId === req.id}
                  onTransmit={() => handleTransmit(req.id)}
                  onInspect={() => setSelectedPacket(req)}
                />
              ))}
            </div>
          )}
        </div>

      </div>

    </div>
  );
}

function QueueItem({ req, transmitting, onTransmit, onInspect }) {
  const isEmergency = req.urgency === 'EMERGENCY';
  const isUrgent = req.urgency === 'URGENT';
  const isCompleted = req.status === 'COMPLETED';

  return (
    <div className="bg-blue-50/50 hover:bg-blue-50 border border-blue-100 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all">
      <div className="space-y-1 min-w-0">
        <div className="flex items-center space-x-2">
          <span className="text-xs font-bold text-blue-950 truncate">{req.mri_type}</span>
          <span className="text-[10px] text-slate-400 font-mono">({req.request_id})</span>
        </div>
        <div className="text-[11px] text-slate-500 truncate max-w-xl">
          {req.clinical_reason}
        </div>
        <div className="flex items-center space-x-3 text-[10px] text-slate-400 font-mono pt-0.5">
          <span>Device: <code className="text-cyan-700 font-semibold">{req.source_ip}</code></span>
          <span>Size: <code className="text-blue-950 font-medium">{req.image_size_mb} MB</code></span>
          <span>Status: <strong className={isCompleted ? 'text-emerald-600' : 'text-amber-600'}>{req.status}</strong></span>
        </div>
      </div>

      <div className="flex items-center space-x-2 flex-shrink-0 self-start sm:self-center">
        <button
          onClick={onInspect}
          className="px-4 py-2 bg-white hover:bg-blue-100 text-blue-700 hover:text-blue-950 rounded-full text-xs font-semibold border border-blue-200 flex items-center space-x-1.5 transition shadow-sm"
        >
          <Layers className="w-3.5 h-3.5 text-cyan-600" />
          <span>Inspect Header</span>
        </button>

        <button
          onClick={onTransmit}
          disabled={transmitting}
          className={`px-5 py-2 rounded-full text-xs font-bold text-white shadow-md flex items-center space-x-1.5 transition ${
            isEmergency ? 'bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 shadow-rose-500/25' :
            isUrgent ? 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 shadow-amber-500/25' :
            'bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-500 hover:to-blue-600 shadow-blue-500/25'
          }`}
        >
          {transmitting ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
          <span>{transmitting ? 'Transmitting...' : 'Send Scan'}</span>
        </button>
      </div>
    </div>
  );
}
