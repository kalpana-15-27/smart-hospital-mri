import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  ListOrdered, 
  Send, 
  Layers, 
  RefreshCw, 
  Sliders, 
  Zap, 
  CheckCircle2, 
  Clock, 
  Activity, 
  ShieldAlert, 
  ArrowUpCircle,
  HelpCircle
} from 'lucide-react';

export default function MRIQueue({ setSelectedPacket }) {
  const { currentUser } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [transmittingId, setTransmittingId] = useState(null);
  const [backgroundLoad, setBackgroundLoad] = useState(65);
  const [enableQoS, setEnableQoS] = useState(true);
  const [lastTransmissionResult, setLastTransmissionResult] = useState(null);

  const loadQueue = async () => {
    try {
      const data = await api.getMRIQueue();
      setRequests(data);
    } catch (err) {
      console.error('Failed to load queue:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQueue();
    const interval = setInterval(loadQueue, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleTransmit = async (reqId) => {
    setTransmittingId(reqId);
    setLastTransmissionResult(null);
    try {
      const res = await api.transmitStudy(reqId, {
        background_traffic_mbps: backgroundLoad,
        enable_qos: enableQoS
      });
      setLastTransmissionResult(res);
      await loadQueue();
    } catch (err) {
      alert('Transmission error: ' + err.message);
    } finally {
      setTransmittingId(null);
    }
  };

  const handlePriorityChange = async (reqId, newUrgency) => {
    try {
      await api.updatePriority(reqId, newUrgency);
      await loadQueue();
    } catch (err) {
      alert('Failed to update priority: ' + err.message);
    }
  };

  const emergencyRequests = requests.filter(r => r.urgency === 'EMERGENCY');
  const urgentRequests = requests.filter(r => r.urgency === 'URGENT');
  const normalRequests = requests.filter(r => r.urgency === 'NORMAL');

  return (
    <div className="space-y-6">
      
      {/* Header & Controls Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <h1 className="text-xl font-bold text-white flex items-center space-x-2">
              <ListOrdered className="w-5 h-5 text-sky-400" />
              <span>Layer 3 Priority Queue Manager</span>
            </h1>
            <p className="text-xs text-slate-400">
              Router Queue Scheduling: Strict Priority Low-Latency Queueing (LLQ) + Class-Based Weighted Fair Queueing (CBWFQ)
            </p>
          </div>

          <button
            onClick={loadQueue}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold flex items-center space-x-1.5 self-start md:self-auto transition"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh Queue</span>
          </button>
        </div>

        {/* Interactive Network Congestion & QoS Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-1">
          
          {/* Background Congestion Slider */}
          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-300 font-semibold flex items-center space-x-1.5">
                <Sliders className="w-3.5 h-3.5 text-sky-400" />
                <span>Simulated Link Congestion:</span>
              </span>
              <span className="font-mono font-bold text-sky-400 bg-sky-950/80 px-2 py-0.5 rounded border border-sky-800">
                {backgroundLoad} Mbps / 100 Mbps ({backgroundLoad}%)
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
              <span>0 Mbps (Idle)</span>
              <span>50 Mbps (Moderate)</span>
              <span>95 Mbps (Severe Congestion)</span>
            </div>
          </div>

          {/* QoS Policy Toggle */}
          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold text-white">DiffServ QoS Enforcement</div>
              <div className="text-[10px] text-slate-400">
                {enableQoS ? 'RFC 3246 LLQ Active (Emergency Expedited)' : 'Disabled: FIFO / Best-Effort for all'}
              </div>
            </div>
            <button
              onClick={() => setEnableQoS(!enableQoS)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold font-mono transition ${
                enableQoS
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                  : 'bg-slate-800 text-slate-400 border border-slate-700'
              }`}
            >
              {enableQoS ? 'QoS ENABLED' : 'FIFO ONLY'}
            </button>
          </div>

          {/* Quick Explanation */}
          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 flex items-center space-x-3 text-xs text-slate-300">
            <Zap className="w-5 h-5 text-rose-400 flex-shrink-0" />
            <div className="text-[11px] leading-tight text-slate-400">
              Click <strong className="text-white">"Transmit Study"</strong> below to simulate packet transfer across the router with real queue telemetry.
            </div>
          </div>

        </div>
      </div>

      {/* Last Transmission Result Toast/Card */}
      {lastTransmissionResult && (
        <div className="bg-slate-900 border border-emerald-500/50 rounded-2xl p-5 shadow-2xl space-y-3 animate-fadeIn">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center space-x-2 text-emerald-400 font-bold text-xs">
              <CheckCircle2 className="w-4 h-4" />
              <span>DICOM Transmission Complete • Scenario: {lastTransmissionResult.scenario}</span>
            </div>
            <span className="font-mono text-xs text-slate-400">{lastTransmissionResult.mri_request.request_id}</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs font-mono">
            <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
              <div className="text-[10px] text-slate-500">Transfer Time</div>
              <div className="text-base font-bold text-emerald-400">{lastTransmissionResult.metrics.transfer_time_sec} s</div>
            </div>
            <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
              <div className="text-[10px] text-slate-500">Queue Latency</div>
              <div className="text-base font-bold text-sky-400">{lastTransmissionResult.metrics.latency_ms} ms</div>
            </div>
            <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
              <div className="text-[10px] text-slate-500">Jitter</div>
              <div className="text-base font-bold text-slate-200">{lastTransmissionResult.metrics.jitter_ms} ms</div>
            </div>
            <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
              <div className="text-[10px] text-slate-500">Throughput</div>
              <div className="text-base font-bold text-amber-400">{lastTransmissionResult.metrics.throughput_mbps} Mbps</div>
            </div>
            <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
              <div className="text-[10px] text-slate-500">Packet Loss</div>
              <div className={`text-base font-bold ${lastTransmissionResult.metrics.packet_loss_pct > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                {lastTransmissionResult.metrics.packet_loss_pct}%
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3 Queues Container */}
      <div className="space-y-6">
        
        {/* Queue 0: Emergency Strict Priority Queue (LLQ) */}
        <div className="bg-slate-900 border-2 border-rose-600/40 rounded-2xl p-5 shadow-xl space-y-4 relative overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-rose-900/30 pb-3">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-rose-500/20 text-rose-400 border border-rose-500/30">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-white flex items-center space-x-2">
                  <span>Queue 0: Emergency Strict Priority (LLQ)</span>
                  <span className="bg-rose-500 text-white text-[10px] px-2 py-0.5 rounded-full font-mono font-bold animate-pulse">
                    DSCP EF (46)
                  </span>
                </h2>
                <p className="text-xs text-slate-400">
                  Expedited Forwarding (RFC 3246). Bypasses congestion buffers. 0% drops guaranteed.
                </p>
              </div>
            </div>

            <span className="font-mono text-xs text-rose-400 font-bold self-start sm:self-auto">
              {emergencyRequests.length} Active Studies
            </span>
          </div>

          {emergencyRequests.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-500 border border-dashed border-slate-800 rounded-xl">
              No active emergency studies in Queue 0.
            </div>
          ) : (
            <div className="space-y-3">
              {emergencyRequests.map((req) => (
                <QueueCard
                  key={req.id}
                  req={req}
                  transmitting={transmittingId === req.id}
                  onTransmit={() => handleTransmit(req.id)}
                  onInspect={() => setSelectedPacket(req)}
                  onPriorityChange={handlePriorityChange}
                />
              ))}
            </div>
          )}
        </div>

        {/* Queue 1: Urgent Assured Bandwidth Queue (CBWFQ) */}
        <div className="bg-slate-900 border border-amber-600/40 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-900/30 pb-3">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30">
                <Activity className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-white flex items-center space-x-2">
                  <span>Queue 1: Urgent / ICU Assured Queue (CBWFQ)</span>
                  <span className="bg-amber-500/20 text-amber-300 text-[10px] px-2 py-0.5 rounded-full font-mono font-bold border border-amber-500/40">
                    DSCP AF41 (34)
                  </span>
                </h2>
                <p className="text-xs text-slate-400">
                  Assured Forwarding (RFC 2597). Dedicated minimum 30% link bandwidth.
                </p>
              </div>
            </div>

            <span className="font-mono text-xs text-amber-400 font-bold self-start sm:self-auto">
              {urgentRequests.length} Active Studies
            </span>
          </div>

          {urgentRequests.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-500 border border-dashed border-slate-800 rounded-xl">
              No active urgent studies in Queue 1.
            </div>
          ) : (
            <div className="space-y-3">
              {urgentRequests.map((req) => (
                <QueueCard
                  key={req.id}
                  req={req}
                  transmitting={transmittingId === req.id}
                  onTransmit={() => handleTransmit(req.id)}
                  onInspect={() => setSelectedPacket(req)}
                  onPriorityChange={handlePriorityChange}
                />
              ))}
            </div>
          )}
        </div>

        {/* Queue 2: Routine Best Effort Queue (WFQ) */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-sky-500/20 text-sky-400 border border-sky-500/30">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-white flex items-center space-x-2">
                  <span>Queue 2: Routine Best Effort Queue (WFQ)</span>
                  <span className="bg-sky-500/20 text-sky-300 text-[10px] px-2 py-0.5 rounded-full font-mono font-bold border border-sky-500/40">
                    DSCP CS0 (0)
                  </span>
                </h2>
                <p className="text-xs text-slate-400">
                  Standard Class Selector 0 (RFC 2474). Starvation-protected minimum 20% bandwidth share.
                </p>
              </div>
            </div>

            <span className="font-mono text-xs text-sky-400 font-bold self-start sm:self-auto">
              {normalRequests.length} Active Studies
            </span>
          </div>

          {normalRequests.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-500 border border-dashed border-slate-800 rounded-xl">
              No active routine studies in Queue 2.
            </div>
          ) : (
            <div className="space-y-3">
              {normalRequests.map((req) => (
                <QueueCard
                  key={req.id}
                  req={req}
                  transmitting={transmittingId === req.id}
                  onTransmit={() => handleTransmit(req.id)}
                  onInspect={() => setSelectedPacket(req)}
                  onPriorityChange={handlePriorityChange}
                />
              ))}
            </div>
          )}
        </div>

      </div>

    </div>
  );
}

function QueueCard({ req, transmitting, onTransmit, onInspect, onPriorityChange }) {
  const isEmergency = req.urgency === 'EMERGENCY';
  const isUrgent = req.urgency === 'URGENT';
  const isCompleted = req.status === 'COMPLETED';

  return (
    <div className={`p-4 rounded-xl border transition-all ${
      isEmergency 
        ? 'bg-slate-950/80 border-rose-500/30 hover:border-rose-500/60' 
        : isUrgent 
        ? 'bg-slate-950/80 border-amber-500/30 hover:border-amber-500/60' 
        : 'bg-slate-950/80 border-slate-800 hover:border-slate-700'
    }`}>
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        
        {/* Left: Study Details */}
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="font-mono font-bold text-xs text-sky-400">{req.request_id}</span>
            <span className="text-slate-600">•</span>
            <span className="text-xs font-semibold text-white">{req.mri_type}</span>
            <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold ${
              isEmergency ? 'bg-rose-500/20 text-rose-400' :
              isUrgent ? 'bg-amber-500/20 text-amber-400' :
              'bg-sky-500/20 text-sky-400'
            }`}>
              {req.urgency}
            </span>
          </div>

          <p className="text-[11px] text-slate-400 line-clamp-1 max-w-xl">
            {req.clinical_reason}
          </p>

          <div className="flex flex-wrap items-center gap-3 text-[10px] font-mono text-slate-400 pt-1">
            <span>Src IP: <strong className="text-slate-200">{req.source_ip}</strong></span>
            <span>DSCP: <strong className="text-sky-300">{req.dscp_name} ({req.dscp_value})</strong></span>
            <span>Binary: <strong className="text-emerald-400">{req.dscp_binary}</strong></span>
            <span>Volume: <strong className="text-slate-200">{req.image_size_mb} MB</strong></span>
            <span>Status: <strong className={isCompleted ? 'text-emerald-400' : 'text-amber-400'}>{req.status}</strong></span>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex flex-wrap items-center gap-2 self-start lg:self-center">
          
          <button
            onClick={onInspect}
            className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-sky-400 rounded-lg text-xs font-semibold border border-slate-700 flex items-center space-x-1 transition"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Inspect OSI</span>
          </button>

          {/* Quick Dynamic Priority Switcher for Presentation Demo */}
          <select
            value={req.urgency}
            onChange={(e) => onPriorityChange(req.id, e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-[11px] text-slate-300 font-mono focus:outline-none focus:border-sky-500"
          >
            <option value="EMERGENCY">Set EMERGENCY (EF 46)</option>
            <option value="URGENT">Set URGENT (AF41 34)</option>
            <option value="NORMAL">Set NORMAL (CS0 0)</option>
          </select>

          <button
            onClick={onTransmit}
            disabled={transmitting}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold text-white shadow-lg flex items-center space-x-1.5 transition ${
              isEmergency 
                ? 'bg-rose-600 hover:bg-rose-500 shadow-rose-600/30' 
                : isUrgent 
                ? 'bg-amber-600 hover:bg-amber-500 shadow-amber-600/30' 
                : 'bg-sky-600 hover:bg-sky-500 shadow-sky-600/30'
            }`}
          >
            {transmitting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
            <span>{transmitting ? 'Transmitting...' : 'Transmit Study'}</span>
          </button>

        </div>

      </div>

      {/* Transfer Metrics If Completed */}
      {isCompleted && req.actual_transfer_sec > 0 && (
        <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex flex-wrap gap-4 text-[11px] font-mono text-slate-400">
          <div>Duration: <span className="text-emerald-400 font-bold">{req.actual_transfer_sec}s</span></div>
          <div>Latency: <span className="text-sky-300 font-bold">{req.latency_ms}ms</span></div>
          <div>Packet Loss: <span className={req.packet_loss_pct > 0 ? 'text-rose-400 font-bold' : 'text-emerald-400 font-bold'}>{req.packet_loss_pct}%</span></div>
          <div>Throughput: <span className="text-amber-400 font-bold">{req.throughput_mbps} Mbps</span></div>
        </div>
      )}
    </div>
  );
}
