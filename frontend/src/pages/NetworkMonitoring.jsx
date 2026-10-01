import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { 
  Activity, 
  Wifi, 
  Radio, 
  Send, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldAlert, 
  HardDrive, 
  RefreshCw,
  Cpu
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line, Doughnut, Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function NetworkMonitoring() {
  const [metrics, setMetrics] = useState([]);
  const [events, setEvents] = useState([]);
  const [dscpData, setDscpData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [probeResult, setProbeResult] = useState(null);
  const [probeDscp, setProbeDscp] = useState(46);

  const loadNetworkData = async () => {
    try {
      const [mList, eList, dList] = await Promise.all([
        api.getMetrics(20),
        api.getQoSEvents(25),
        api.getDscpDistribution()
      ]);
      setMetrics(mList.reverse());
      setEvents(eList);
      setDscpData(dList);
    } catch (err) {
      console.error('Failed to load network telemetry:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNetworkData();
    const interval = setInterval(loadNetworkData, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleSendProbe = async () => {
    try {
      const res = await api.sendProbe('127.0.0.1', 10400, probeDscp);
      setProbeResult(res);
      await loadNetworkData();
    } catch (err) {
      alert('Failed to emit probe: ' + err.message);
    }
  };

  // Line Chart Data: Latency & Throughput
  const lineLabels = metrics.map((m, idx) => `T-${metrics.length - idx}`);
  const latencyChartData = {
    labels: lineLabels.length > 0 ? lineLabels : ['T-1', 'T-2', 'T-3', 'T-4', 'T-5'],
    datasets: [
      {
        label: 'Latency (ms)',
        data: metrics.length > 0 ? metrics.map(m => m.latency_ms) : [8.2, 9.4, 8.8, 10.1, 9.2],
        borderColor: '#38bdf8',
        backgroundColor: 'rgba(56, 189, 248, 0.1)',
        fill: true,
        tension: 0.3,
      },
      {
        label: 'Packet Loss (%)',
        data: metrics.length > 0 ? metrics.map(m => m.packet_loss_pct) : [0, 0, 0, 0.2, 0],
        borderColor: '#f43f5e',
        backgroundColor: 'rgba(244, 63, 94, 0.1)',
        fill: true,
        tension: 0.3,
      }
    ]
  };

  const throughputChartData = {
    labels: lineLabels.length > 0 ? lineLabels : ['T-1', 'T-2', 'T-3', 'T-4', 'T-5'],
    datasets: [
      {
        label: 'Throughput (Mbps)',
        data: metrics.length > 0 ? metrics.map(m => m.throughput_mbps) : [88.5, 92.0, 85.0, 91.2, 86.4],
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        fill: true,
        tension: 0.3,
      }
    ]
  };

  // Donut Chart: DSCP Distribution
  const doughnutData = {
    labels: ['DSCP 46 (EF)', 'DSCP 34 (AF41)', 'DSCP 0 (CS0)'],
    datasets: [
      {
        data: dscpData.length > 0 
          ? [
              dscpData.find(d => d.name.includes('EF'))?.count || 1,
              dscpData.find(d => d.name.includes('AF41'))?.count || 1,
              dscpData.find(d => d.name.includes('CS0'))?.count || 2
            ]
          : [2, 1, 3],
        backgroundColor: ['#ef4444', '#f59e0b', '#0284c7'],
        borderColor: '#0f172a',
        borderWidth: 2,
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: { color: '#94a3b8', font: { size: 11 } }
      }
    },
    scales: {
      x: {
        ticks: { color: '#64748b', font: { size: 10 } },
        grid: { color: '#1e293b' }
      },
      y: {
        ticks: { color: '#64748b', font: { size: 10 } },
        grid: { color: '#1e293b' }
      }
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center space-x-2">
            <Activity className="w-5 h-5 text-sky-400" />
            <span>Network Monitoring & DSCP Telemetry</span>
          </h1>
          <p className="text-xs text-slate-400">
            Real-time Layer 3 flow telemetry, queue delay tracking, and hardware socket probe injector.
          </p>
        </div>

        <div className="flex items-center space-x-2 self-start sm:self-auto">
          <button
            onClick={loadNetworkData}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Latency & Packet Loss Line Chart */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-bold text-white uppercase tracking-wider">Queue Latency & Loss</h2>
            <span className="text-[10px] font-mono text-sky-400">ms / % drops</span>
          </div>
          <div className="h-60">
            <Line data={latencyChartData} options={chartOptions} />
          </div>
        </div>

        {/* Throughput Line Chart */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-bold text-white uppercase tracking-wider">Link Throughput</h2>
            <span className="text-[10px] font-mono text-emerald-400">Mbps Wire Speed</span>
          </div>
          <div className="h-60">
            <Line data={throughputChartData} options={chartOptions} />
          </div>
        </div>

        {/* DSCP Class Distribution Donut */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xs font-bold text-white uppercase tracking-wider">DSCP Class Breakdown</h2>
              <span className="text-[10px] font-mono text-slate-400">RFC 2474</span>
            </div>
            <div className="h-52 flex items-center justify-center">
              <Doughnut 
                data={doughnutData} 
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { legend: { position: 'bottom', labels: { color: '#94a3b8', font: { size: 10 } } } }
                }} 
              />
            </div>
          </div>
        </div>

      </div>

      {/* Socket Probe Transmitter & QoS Event Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Live Socket Probe Emitter (Left 4 cols) */}
        <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="border-b border-slate-800 pb-3">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-2">
              <Radio className="w-4 h-4 text-sky-400" />
              <span>Live Socket IP_TOS Injector</span>
            </h3>
            <p className="text-[11px] text-slate-400 mt-1">
              Emits raw UDP packet with real socket `IP_TOS` bitmask to Wireshark port 10400.
            </p>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Select DSCP Tag to Inject</label>
              <select
                value={probeDscp}
                onChange={(e) => setProbeDscp(parseInt(e.target.value, 10))}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 font-mono focus:outline-none focus:border-sky-500"
              >
                <option value={46}>DSCP 46 (EF - Expedited Forwarding / Emergency)</option>
                <option value={34}>DSCP 34 (AF41 - Assured Forwarding / Urgent)</option>
                <option value={0}>DSCP 0 (CS0 - Best Effort / Routine)</option>
              </select>
            </div>

            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 font-mono text-[11px] space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-500">Destination:</span>
                <span className="text-slate-300">127.0.0.1:10400</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">ToS Byte:</span>
                <span className="text-sky-300 font-bold">
                  0x{((probeDscp << 2) & 0xFC).toString(16).toUpperCase().padStart(2, '0')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Binary:</span>
                <span className="text-emerald-400">{(probeDscp).toString(2).padStart(6, '0')}00</span>
              </div>
            </div>

            <button
              onClick={handleSendProbe}
              className="w-full py-2.5 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-lg shadow-lg shadow-sky-600/30 transition flex items-center justify-center space-x-2"
            >
              <Send className="w-4 h-4" />
              <span>Emit Socket Probe</span>
            </button>

            {probeResult && (
              <div className="p-3 bg-emerald-950/40 border border-emerald-500/50 rounded-lg text-emerald-300 text-[11px] font-mono space-y-1">
                <div className="font-bold flex items-center space-x-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Probe Dispatched Successfully</span>
                </div>
                <div>Status: {probeResult.status}</div>
                <div>ToS Hex: {probeResult.tos_byte_hex}</div>
              </div>
            )}
          </div>
        </div>

        {/* Live QoS Events & Classification Log Stream (Right 8 cols) */}
        <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Live QoS Classification & Forwarding Stream
            </h3>
            <span className="text-[10px] text-slate-500 font-mono">Edge Router Log</span>
          </div>

          <div className="overflow-x-auto max-h-[360px]">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 uppercase font-mono text-[10px] sticky top-0 border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-3">Timestamp</th>
                  <th className="py-2.5 px-3">Event Type</th>
                  <th className="py-2.5 px-3">Source IP</th>
                  <th className="py-2.5 px-3">DSCP Marked</th>
                  <th className="py-2.5 px-3">Queue Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-sans">
                {events.map((ev) => (
                  <tr key={ev.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-2.5 px-3 font-mono text-[10px] text-slate-400">
                      {new Date(ev.timestamp).toLocaleTimeString()}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold ${
                        ev.is_spoofed_attempt ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40' :
                        ev.event_type.includes('STUDY') ? 'bg-emerald-500/20 text-emerald-400' :
                        'bg-sky-500/20 text-sky-400'
                      }`}>
                        {ev.event_type}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-mono text-[11px] text-slate-300">
                      {ev.source_ip}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-[11px]">
                      <span className={`font-bold ${
                        ev.dscp_marked === 46 ? 'text-rose-400' :
                        ev.dscp_marked === 34 ? 'text-amber-400' : 'text-sky-400'
                      }`}>
                        DSCP {ev.dscp_marked}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-[11px] text-slate-300">
                      <div>{ev.action_taken}</div>
                      {ev.details && <div className="text-[10px] text-slate-500 font-mono">{ev.details}</div>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>

    </div>
  );
}
