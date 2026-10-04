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
  ChevronUp,
  Terminal,
  Lock,
  Shield
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
      a: "No. The IP address identifies the device and its trusted VLAN boundary. Priority is carried inside the IPv4 header's DSCP field (bits 0-5), and enforced by the router's hardware queues."
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div className="flex items-center space-x-3.5">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-400 to-blue-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-blue-950 tracking-tight">
              Security Defense & Examiner Guide
            </h1>
            <p className="text-xs text-blue-700/70">
              Validating edge trust boundaries, anti-spoofing defense, and viva defense topics
            </p>
          </div>
        </div>

        <button
          onClick={loadLogs}
          className="px-5 py-2.5 bg-white border border-blue-200/80 text-blue-700 hover:text-blue-950 rounded-full text-xs font-bold flex items-center space-x-2 self-start sm:self-auto transition-all shadow-sm hover:shadow"
        >
          <RefreshCw className="w-3.5 h-3.5 text-cyan-500" />
          <span>Refresh Logs</span>
        </button>
      </div>

      {/* Hero: Anti-Spoofing Defense Simulator (Soft Glass Card) */}
      <div className="bg-white/90 backdrop-blur-xl border border-white/60 rounded-[2.5rem] p-7 sm:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] shadow-blue-900/10 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-blue-100 pb-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2 text-rose-600 font-bold text-xs font-mono">
              <ShieldAlert className="w-4 h-4 text-rose-500" />
              <span>Edge Trust Boundary Defense: Anti-DSCP Spoofing</span>
            </div>
            <p className="text-xs text-slate-500 max-w-2xl leading-relaxed">
              If an unauthorized device in the guest network attempts to inject fake <code className="text-rose-600 font-mono font-bold">DSCP 46 (Emergency)</code> packets to hog bandwidth, the edge router intercepts it, issues a security alert, and resets the tag to standard.
            </p>
          </div>

          <button
            onClick={handleSimulateAttack}
            disabled={simulatingAttack}
            className="px-6 py-3 bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white rounded-full font-bold text-xs shadow-lg shadow-rose-500/25 hover:shadow-rose-500/40 flex items-center space-x-2 transition-all flex-shrink-0 disabled:opacity-50"
          >
            {simulatingAttack ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
            <span>{simulatingAttack ? 'Testing Defense...' : 'Test Rogue Priority Attack'}</span>
          </button>
        </div>

        {/* Attack Mitigation Feedback Card */}
        {attackResult && (
          <div className="bg-emerald-50/90 border border-emerald-200 rounded-2xl p-5 space-y-2.5 animate-in fade-in duration-200 text-xs shadow-sm">
            <div className="flex items-center space-x-2 text-emerald-800 font-bold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Defense Succeeded: Attack Detected & Mitigated!</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-[11px] pt-1">
              <div className="bg-white/80 p-3 rounded-xl border border-emerald-100">
                <span className="text-slate-400 block text-[10px]">Rogue Device IP:</span>
                <span className="text-blue-950 font-bold">{attackResult.source_ip}</span>
              </div>
              <div className="bg-white/80 p-3 rounded-xl border border-emerald-100">
                <span className="text-slate-400 block text-[10px]">Attempted Unauthorized Tag:</span>
                <span className="text-rose-600 font-bold">DSCP {attackResult.attempted_dscp}</span>
              </div>
              <div className="bg-white/80 p-3 rounded-xl border border-emerald-100">
                <span className="text-slate-400 block text-[10px]">Enforced Edge Action:</span>
                <span className="text-emerald-700 font-bold">Force-Reset to DSCP 0</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Examiner Viva Voce Cheat Sheet (Soft Glass Card) */}
      <div className="bg-white/90 backdrop-blur-xl border border-white/60 rounded-[2.5rem] p-7 sm:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] shadow-blue-900/10 space-y-4">
        <div className="flex items-center justify-between border-b border-blue-100 pb-3">
          <h2 className="text-xs font-bold text-blue-950 uppercase tracking-wider font-mono flex items-center space-x-2">
            <HelpCircle className="w-4 h-4 text-cyan-600" />
            <span>Examiner Q&A Cheat Sheet (Viva Voce Defense)</span>
          </h2>
          <span className="text-[10px] text-cyan-700 font-mono font-bold bg-cyan-50 px-2.5 py-0.5 rounded-full border border-cyan-200">
            Academic Key Concepts
          </span>
        </div>

        <div className="space-y-2.5 text-xs">
          {FAQS.map((faq, idx) => (
            <div 
              key={idx}
              className="bg-blue-50/50 rounded-2xl border border-blue-100 overflow-hidden transition-all"
            >
              <button
                onClick={() => setExpandedFaq(expandedFaq === idx ? null : idx)}
                className="w-full p-4 text-left font-semibold text-blue-950 flex items-center justify-between hover:text-cyan-700 transition"
              >
                <span>{faq.q}</span>
                {expandedFaq === idx ? <ChevronUp className="w-4 h-4 text-cyan-600" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
              </button>

              {expandedFaq === idx && (
                <div className="px-4 pb-4 text-slate-600 leading-relaxed border-t border-blue-100 pt-3 text-[11px] animate-in fade-in duration-150">
                  <strong className="text-cyan-700 font-mono font-bold">Defense Answer: </strong> {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Security Audit Trail Table (Soft Glass Card) */}
      <div className="bg-white/90 backdrop-blur-xl border border-white/60 rounded-[2.5rem] p-7 sm:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] shadow-blue-900/10 space-y-4">
        <div className="flex items-center justify-between border-b border-blue-100 pb-3">
          <h3 className="text-xs font-bold text-blue-950 uppercase tracking-wider font-mono flex items-center space-x-2">
            <Terminal className="w-4 h-4 text-cyan-600" />
            <span>Security & Priority Audit Trail</span>
          </h3>
          <span className="text-[10px] text-slate-500 font-mono">Real-time syslog stream</span>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-blue-100">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-blue-50/80 text-blue-900/70 font-mono text-[10px] uppercase border-b border-blue-100 tracking-wider">
              <tr>
                <th className="py-3 px-3.5">Timestamp</th>
                <th className="py-3 px-3.5">Host / Identity</th>
                <th className="py-3 px-3.5">Action Event</th>
                <th className="py-3 px-3.5">Defense State</th>
                <th className="py-3 px-3.5">Diagnostic Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-blue-50 font-sans text-xs">
              {logs.map((log) => {
                const isAlert = log.status === 'ALERT' || log.status === 'DENIED';
                const isSuccess = log.status === 'SUCCESS';
                return (
                  <tr key={log.id} className="hover:bg-blue-50/60 transition-all">
                    <td className="py-2.5 px-3.5 font-mono text-[10px] text-slate-500">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </td>
                    <td className="py-2.5 px-3.5 font-mono font-medium text-blue-950">
                      {log.username}
                    </td>
                    <td className="py-2.5 px-3.5 font-mono text-[11px] text-cyan-700 font-bold">
                      {log.action}
                    </td>
                    <td className="py-2.5 px-3.5">
                      <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold inline-flex items-center space-x-1 ${
                        isSuccess ? 'bg-emerald-100 text-emerald-800 border border-emerald-200 shadow-sm' :
                        isAlert ? 'bg-rose-100 text-rose-700 border border-rose-200 shadow-[0_0_8px_rgba(244,63,94,0.3)] animate-pulse' :
                        'bg-indigo-100 text-indigo-800 border border-indigo-200 shadow-[0_0_8px_rgba(99,102,241,0.25)]'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          isSuccess ? 'bg-emerald-500' :
                          isAlert ? 'bg-rose-500' : 'bg-indigo-500'
                        }`}></span>
                        <span>{log.status}</span>
                      </span>
                    </td>
                    <td className="py-2.5 px-3.5 text-[11px] text-slate-600 truncate max-w-sm font-mono">
                      {log.details}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
