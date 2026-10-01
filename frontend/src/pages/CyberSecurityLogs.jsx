import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { 
  ShieldAlert, 
  ShieldCheck, 
  Play, 
  RefreshCw, 
  HelpCircle, 
  CheckCircle2, 
  AlertTriangle,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

export default function CyberSecurityLogs() {
  const [logs, setLogs] = useState([]);
  const [simulatingAttack, setSimulatingAttack] = useState(false);
  const [attackResult, setAttackResult] = useState(null);
  const [expandedFaq, setExpandedFaq] = useState(0);

  const loadLogs = async () => {
    try {
      const data = await api.getAuditLogs(15);
      setLogs(data);
    } catch (err) {
      console.error('Failed to load audit logs:', err);
    }
  };

  useEffect(() => {
    loadLogs();
  }, []);

  const handleSimulateAttack = async () => {
    setSimulatingAttack(true);
    setAttackResult(null);
    try {
      const res = await api.testDscpSpoof('192.168.99.88', 46);
      setAttackResult(res);
      await loadLogs();
    } catch (err) {
      alert('Attack simulation error: ' + err.message);
    } finally {
      setSimulatingAttack(false);
    }
  };

  const FAQS = [
    {
      q: "Does an IP address itself create network priority?",
      a: "No. The IP address identifies the device and its VLAN. The priority is carried inside the IPv4 header's DSCP field (bits 0-5), and enforced by the router's hardware queues."
    },
    {
      q: "What prevents normal hospital traffic from starving?",
      a: "Class-Based Weighted Fair Queueing (CBWFQ). While emergency scans have strict priority up to 50 Mbps, normal traffic has a guaranteed minimum reservation of 20%, ensuring it is never starved."
    },
    {
      q: "What is DSCP Spoofing and how is it stopped?",
      a: "A rogue device could tag its packets with DSCP 46 (Emergency) to steal bandwidth. Our router enforces edge trust boundaries: packets from unauthorized VLANs claiming priority are force-reset to DSCP 0 (Standard)."
    },
    {
      q: "Does this system diagnose patients?",
      a: "No. This is strictly a network traffic prioritization system. Clinical decisions and MRI scheduling remain governed by hospital physicians."
    }
  ];

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center space-x-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <span>Security Defense & Project Guide</span>
          </h1>
          <p className="text-xs text-slate-400">
            Testing edge anti-spoofing defense and reviewing examiner defense points.
          </p>
        </div>

        <button
          onClick={loadLogs}
          className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold flex items-center space-x-1.5 self-start sm:self-auto transition"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Logs</span>
        </button>
      </div>

      {/* Hero: Anti-Spoofing Defense Simulator */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2 text-rose-400 font-bold text-xs">
              <ShieldAlert className="w-4 h-4" />
              <span>Edge Trust Defense: Anti-DSCP Spoofing</span>
            </div>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              If an unauthorized device in the guest network attempts to inject fake <code className="text-rose-400 font-mono">DSCP 46 (Emergency)</code> packets to hog bandwidth, the edge router intercepts it, issues a security alert, and resets the tag to standard.
            </p>
          </div>

          <button
            onClick={handleSimulateAttack}
            disabled={simulatingAttack}
            className="px-4 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-rose-600/20 flex items-center space-x-2 transition flex-shrink-0"
          >
            {simulatingAttack ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
            <span>{simulatingAttack ? 'Testing Defense...' : 'Test Rogue Priority Attack'}</span>
          </button>
        </div>

        {/* Attack Mitigation Feedback Card */}
        {attackResult && (
          <div className="bg-emerald-950/30 border border-emerald-500/50 rounded-xl p-4 space-y-2 animate-fadeIn text-xs">
            <div className="flex items-center space-x-2 text-emerald-400 font-bold">
              <CheckCircle2 className="w-4 h-4" />
              <span>Defense Succeeded: Attack Detected & Mitigated!</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 font-mono text-[11px] pt-1">
              <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
                <span className="text-slate-500">Rogue Device:</span> <span className="text-slate-200">{attackResult.source_ip}</span>
              </div>
              <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
                <span className="text-slate-500">Attempted Tag:</span> <span className="text-rose-400 font-bold">DSCP {attackResult.attempted_dscp}</span>
              </div>
              <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
                <span className="text-slate-500">Enforced Action:</span> <span className="text-emerald-400 font-bold">Force-Reset to DSCP 0</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Examiner Viva Voce Cheat Sheet */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
        <h2 className="text-sm font-bold text-white flex items-center space-x-2">
          <HelpCircle className="w-4 h-4 text-sky-400" />
          <span>Examiner Q&A Cheat Sheet (Viva Defense)</span>
        </h2>

        <div className="space-y-2 text-xs">
          {FAQS.map((faq, idx) => (
            <div 
              key={idx}
              className="bg-slate-950 rounded-xl border border-slate-800/80 overflow-hidden"
            >
              <button
                onClick={() => setExpandedFaq(expandedFaq === idx ? null : idx)}
                className="w-full p-3.5 text-left font-semibold text-slate-200 flex items-center justify-between hover:text-white transition"
              >
                <span>{faq.q}</span>
                {expandedFaq === idx ? <ChevronUp className="w-4 h-4 text-sky-400" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
              </button>

              {expandedFaq === idx && (
                <div className="px-3.5 pb-3.5 text-slate-400 leading-relaxed border-t border-slate-800/50 pt-2 text-[11px]">
                  <strong className="text-emerald-400">Answer:</strong> {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Compact Audit Trail Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
        <h3 className="text-xs font-bold text-white uppercase tracking-wider">
          Recent Security & Priority Audit Trail
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 font-mono text-[10px] uppercase border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3">Time</th>
                <th className="py-2.5 px-3">User / Host</th>
                <th className="py-2.5 px-3">Action</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans text-xs">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-800/40">
                  <td className="py-2 px-3 font-mono text-[10px] text-slate-400">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </td>
                  <td className="py-2 px-3 font-mono font-medium text-slate-300">
                    {log.username}
                  </td>
                  <td className="py-2 px-3 font-mono text-[11px] text-sky-300">
                    {log.action}
                  </td>
                  <td className="py-2 px-3">
                    <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold ${
                      log.status === 'SUCCESS' ? 'bg-emerald-500/20 text-emerald-400' :
                      log.status === 'ALERT' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' :
                      'bg-amber-500/20 text-amber-400'
                    }`}>
                      {log.status}
                    </span>
                  </td>
                  <td className="py-2 px-3 text-[11px] text-slate-400 truncate max-w-sm">
                    {log.details}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
