import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { 
  Zap, 
  Clock, 
  Send, 
  Sliders, 
  Layers, 
  PlusCircle, 
  RefreshCw,
  Activity,
  CheckCircle2,
  TrendingDown,
  ArrowRight
} from 'lucide-react';

export default function Dashboard({ setActiveTab, setSelectedPacket }) {
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
      console.error('Failed to load data:', err);
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

  const emergencyQueue = requests.filter(r => r.urgency === 'EMERGENCY');
  const urgentQueue = requests.filter(r => r.urgency === 'URGENT');
  const normalQueue = requests.filter(r => r.urgency === 'NORMAL');

  return (
    <div className="space-y-6">
      
      {/* Clean Top Header Card */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-sky-950/40 border border-slate-800 rounded-2xl p-6 relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center space-x-2">
              <span>Hospital Imaging Traffic Control</span>
            </h1>
            <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
              Prioritizing emergency medical scans over routine network traffic during peak hospital hours.
            </p>
          </div>

          <div className="flex items-center space-x-2.5">
            <button
              onClick={() => setActiveTab('order')}
              className="px-4 py-2.5 bg-gradient-to-r from-rose-600 to-red-500 hover:from-rose-500 hover:to-red-400 text-white font-semibold text-xs rounded-xl shadow-lg shadow-rose-600/20 flex items-center space-x-1.5 transition"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Order Emergency Scan</span>
            </button>
            <button
              onClick={() => setActiveTab('speedtest')}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-xl border border-slate-700 flex items-center space-x-1.5 transition"
            >
              <Zap className="w-4 h-4 text-sky-400" />
              <span>Speed Test</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4 Clean Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
            <span>Emergency Scans</span>
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse"></span>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-rose-400 font-mono">
              {stats ? stats.active_emergency_count : 0} active
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              Assigned to Fast Lane (DSCP 46)
            </div>
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
            <span>Fast-Lane Speedup</span>
            <TrendingDown className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-emerald-400 font-mono">
              93% Faster
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              Avoids network traffic jams
            </div>
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
            <span>Transfer Delay</span>
            <Clock className="w-4 h-4 text-sky-400" />
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-sky-400 font-mono">
              ~5.4s <span className="text-xs font-normal text-slate-500">vs 76s</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              Under 85% link congestion
            </div>
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
            <span>Fast-Lane Latency</span>
            <Activity className="w-4 h-4 text-purple-400" />
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-purple-400 font-mono">
              {stats ? `${stats.current_latency_ms} ms` : '9.4 ms'}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              0% packet drop rate
            </div>
          </div>
        </div>

      </div>

      {/* Interactive Controls Bar: Congestion Slider & Priority Toggle */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Congestion Slider */}
        <div className="flex-1 w-full space-y-1.5">
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-300 font-medium flex items-center space-x-1.5">
              <Sliders className="w-3.5 h-3.5 text-sky-400" />
              <span>Simulate Hospital Network Congestion:</span>
            </span>
            <span className="font-mono font-bold text-sky-400 bg-sky-950 px-2 py-0.5 rounded border border-sky-800 text-[11px]">
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
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-500"
          />
          <div className="flex justify-between text-[10px] text-slate-500 font-mono">
            <span>Quiet (0%)</span>
            <span>Moderate (50%)</span>
            <span>Heavy Congestion (95%)</span>
          </div>
        </div>

        {/* Priority Toggle */}
        <div className="flex items-center space-x-3 border-t md:border-t-0 md:border-l border-slate-800 pt-3 md:pt-0 md:pl-5 self-stretch md:self-auto justify-between md:justify-start">
          <div className="text-left">
            <div className="text-xs font-semibold text-white">Priority Routing</div>
            <div className="text-[10px] text-slate-400">
              {enablePriority ? 'Fast Lane Active' : 'Normal (FIFO)'}
            </div>
          </div>

          <button
            onClick={() => setEnablePriority(!enablePriority)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold font-mono transition ${
              enablePriority
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                : 'bg-slate-800 text-slate-400 border border-slate-700'
            }`}
          >
            {enablePriority ? 'ON' : 'OFF'}
          </button>
        </div>

      </div>

      {/* Live Result Toast if a study was just transmitted */}
      {lastResult && (
        <div className="bg-slate-900 border border-emerald-500/50 rounded-2xl p-4 space-y-2 animate-fadeIn">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-emerald-400 font-semibold text-xs">
              <CheckCircle2 className="w-4 h-4" />
              <span>Study Transmitted Successfully!</span>
            </div>
            <span className="text-[11px] font-mono text-slate-400">
              Mode: <strong className="text-white">{lastResult.scenario === 'QOS_PRIORITY' ? 'Fast Lane' : 'Standard'}</strong>
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono pt-1">
            <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
              <div className="text-[10px] text-slate-500">Duration</div>
              <div className="text-sm font-bold text-emerald-400">{lastResult.metrics.transfer_time_sec}s</div>
            </div>
            <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
              <div className="text-[10px] text-slate-500">Latency</div>
              <div className="text-sm font-bold text-sky-400">{lastResult.metrics.latency_ms}ms</div>
            </div>
            <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
              <div className="text-[10px] text-slate-500">Throughput</div>
              <div className="text-sm font-bold text-amber-400">{lastResult.metrics.throughput_mbps} Mbps</div>
            </div>
            <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
              <div className="text-[10px] text-slate-500">Packet Loss</div>
              <div className={`text-sm font-bold ${lastResult.metrics.packet_loss_pct > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                {lastResult.metrics.packet_loss_pct}%
              </div>
            </div>
          </div>
        </div>
      )}

      {/* The 3 Priority Queues */}
      <div className="space-y-4">
        
        {/* Lane 1: Emergency Express Lane */}
        <div className="bg-slate-900/90 border border-rose-600/30 rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between border-b border-rose-950/60 pb-3">
            <div className="flex items-center space-x-2.5">
              <span className="w-3 h-3 rounded-full bg-rose-500 animate-pulse"></span>
              <h2 className="text-sm font-bold text-white">Emergency Fast Lane</h2>
              <span className="bg-rose-500/20 text-rose-300 text-[10px] px-2 py-0.5 rounded-full font-mono font-bold border border-rose-500/30">
                DSCP 46
              </span>
            </div>
            <span className="text-xs text-slate-400 font-mono">
              {emergencyQueue.length} scans waiting
            </span>
          </div>

          {emergencyQueue.length === 0 ? (
            <div className="py-6 text-center text-xs text-slate-500 border border-dashed border-slate-800 rounded-xl">
              No emergency scans currently waiting.
            </div>
          ) : (
            <div className="space-y-2.5">
              {emergencyQueue.map(req => (
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
        <div className="bg-slate-900/90 border border-amber-600/30 rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between border-b border-amber-950/60 pb-3">
            <div className="flex items-center space-x-2.5">
              <span className="w-3 h-3 rounded-full bg-amber-400"></span>
              <h2 className="text-sm font-bold text-white">Urgent / ICU Lane</h2>
              <span className="bg-amber-500/20 text-amber-300 text-[10px] px-2 py-0.5 rounded-full font-mono font-bold border border-amber-500/30">
                DSCP 34
              </span>
            </div>
            <span className="text-xs text-slate-400 font-mono">
              {urgentQueue.length} scans waiting
            </span>
          </div>

          {urgentQueue.length === 0 ? (
            <div className="py-6 text-center text-xs text-slate-500 border border-dashed border-slate-800 rounded-xl">
              No urgent scans currently waiting.
            </div>
          ) : (
            <div className="space-y-2.5">
              {urgentQueue.map(req => (
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
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
            <div className="flex items-center space-x-2.5">
              <span className="w-3 h-3 rounded-full bg-sky-400"></span>
              <h2 className="text-sm font-bold text-white">Standard Lane</h2>
              <span className="bg-sky-500/20 text-sky-300 text-[10px] px-2 py-0.5 rounded-full font-mono font-bold border border-sky-500/30">
                DSCP 0
              </span>
            </div>
            <span className="text-xs text-slate-400 font-mono">
              {normalQueue.length} scans waiting
            </span>
          </div>

          {normalQueue.length === 0 ? (
            <div className="py-6 text-center text-xs text-slate-500 border border-dashed border-slate-800 rounded-xl">
              No standard scans currently waiting.
            </div>
          ) : (
            <div className="space-y-2.5">
              {normalQueue.map(req => (
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
    <div className="bg-slate-950/80 border border-slate-800/80 hover:border-slate-700 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition">
      <div className="space-y-1 min-w-0">
        <div className="flex items-center space-x-2">
          <span className="text-xs font-bold text-white truncate">{req.mri_type}</span>
          <span className="text-[10px] text-slate-400 font-mono">({req.request_id})</span>
        </div>
        <div className="text-[11px] text-slate-400 truncate max-w-xl">
          {req.clinical_reason}
        </div>
        <div className="flex items-center space-x-3 text-[10px] text-slate-500 font-mono pt-0.5">
          <span>Device: <code className="text-slate-300">{req.source_ip}</code></span>
          <span>Size: <code className="text-slate-300">{req.image_size_mb} MB</code></span>
          <span>Status: <strong className={isCompleted ? 'text-emerald-400' : 'text-amber-400'}>{req.status}</strong></span>
        </div>
      </div>

      <div className="flex items-center space-x-2 flex-shrink-0 self-start sm:self-center">
        <button
          onClick={onInspect}
          className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-sky-400 hover:text-sky-300 rounded-lg text-xs font-medium border border-slate-700 flex items-center space-x-1 transition"
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Inspect</span>
        </button>

        <button
          onClick={onTransmit}
          disabled={transmitting}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold text-white shadow flex items-center space-x-1.5 transition ${
            isEmergency ? 'bg-rose-600 hover:bg-rose-500' :
            isUrgent ? 'bg-amber-600 hover:bg-amber-500' :
            'bg-sky-600 hover:bg-sky-500'
          }`}
        >
          {transmitting ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
          <span>{transmitting ? 'Sending...' : 'Send Scan'}</span>
        </button>
      </div>
    </div>
  );
}
