import React, { useState } from 'react';
import { 
  Layers, 
  Cpu, 
  Network, 
  HardDrive, 
  CheckCircle2, 
  ArrowRight,
  Server
} from 'lucide-react';

export default function OsiInspector() {
  const [selectedProfile, setSelectedProfile] = useState('EMERGENCY');

  const PROFILES = {
    EMERGENCY: {
      urgency: 'EMERGENCY',
      title: 'Emergency Trauma / Stroke Scan',
      dscp_name: 'EF (Expedited Forwarding)',
      dscp_value: 46,
      dscp_binary: '101110',
      tos_byte_hex: '0xB8',
      source_ip: '192.168.10.10',
      dest_ip: '192.168.30.10',
      vlan_name: 'VLAN 10 — Emergency Bay',
      queue: 'Queue 0: Strict Priority Fast-Lane',
      behavior: 'Bypasses all congestion buffers at the router.'
    },
    URGENT: {
      urgency: 'URGENT',
      title: 'ICU Inpatient Scan',
      dscp_name: 'AF41 (Assured Forwarding)',
      dscp_value: 34,
      dscp_binary: '100010',
      tos_byte_hex: '0x88',
      source_ip: '192.168.10.15',
      dest_ip: '192.168.30.10',
      vlan_name: 'VLAN 10 — ICU Unit',
      queue: 'Queue 1: Assured Bandwidth Queue',
      behavior: 'Guaranteed 30% of router bandwidth minimum.'
    },
    NORMAL: {
      urgency: 'NORMAL',
      title: 'Routine Outpatient Scan',
      dscp_name: 'CS0 (Best Effort)',
      dscp_value: 0,
      dscp_binary: '000000',
      tos_byte_hex: '0x00',
      source_ip: '192.168.20.10',
      dest_ip: '192.168.30.10',
      vlan_name: 'VLAN 20 — Routine Radiology',
      queue: 'Queue 2: Standard Queue',
      behavior: 'Processed fairly with 20% reserved bandwidth to prevent starvation.'
    }
  };

  const current = PROFILES[selectedProfile];

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center space-x-2">
            <Layers className="w-5 h-5 text-sky-400" />
            <span>Network Map & Packet Inspector</span>
          </h1>
          <p className="text-xs text-slate-400">
            Visualizing hospital VLAN layout and how Layer 3 packet headers carry priority tags.
          </p>
        </div>

        {/* Profile Selector */}
        <div className="flex items-center space-x-1.5 bg-slate-900 p-1.5 rounded-xl border border-slate-800 self-start sm:self-auto">
          <button
            onClick={() => setSelectedProfile('EMERGENCY')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              selectedProfile === 'EMERGENCY'
                ? 'bg-rose-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Emergency (DSCP 46)
          </button>
          <button
            onClick={() => setSelectedProfile('URGENT')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              selectedProfile === 'URGENT'
                ? 'bg-amber-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Urgent (DSCP 34)
          </button>
          <button
            onClick={() => setSelectedProfile('NORMAL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              selectedProfile === 'NORMAL'
                ? 'bg-sky-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Routine (DSCP 0)
          </button>
        </div>
      </div>

      {/* Top: Clean Hospital Network Map */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
        <div className="text-xs font-bold text-white uppercase tracking-wider">
          Hospital Network Architecture
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
          
          <div className="p-3 bg-rose-950/20 border border-rose-500/40 rounded-xl space-y-1">
            <div className="font-bold text-rose-400 text-[11px]">VLAN 10 — Emergency Bay</div>
            <div className="text-slate-200 font-semibold">Trauma Workstation</div>
            <div className="font-mono text-[10px] text-slate-400">192.168.10.10</div>
          </div>

          <div className="p-3 bg-sky-950/20 border border-sky-500/40 rounded-xl space-y-1">
            <div className="font-bold text-sky-400 text-[11px]">VLAN 20 — Routine Radiology</div>
            <div className="text-slate-200 font-semibold">Outpatient Scanner</div>
            <div className="font-mono text-[10px] text-slate-400">192.168.20.10</div>
          </div>

          <div className="p-3 bg-purple-950/20 border border-purple-500/40 rounded-xl space-y-1">
            <div className="font-bold text-purple-400 text-[11px]">VLAN 30 — PACS Storage</div>
            <div className="text-slate-200 font-semibold">Central Image Archive</div>
            <div className="font-mono text-[10px] text-slate-400">192.168.30.10 (Port 104)</div>
          </div>

          <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1">
            <div className="font-bold text-slate-400 text-[11px]">Core Priority Router</div>
            <div className="text-slate-200 font-semibold">Cisco / Linux Gateway</div>
            <div className="font-mono text-[10px] text-emerald-400">192.168.10.1 (LLQ Active)</div>
          </div>

        </div>
      </div>

      {/* Bottom: Visual Layer 3 Highlight Card */}
      <div className="bg-gradient-to-r from-sky-950/30 to-slate-900 border-2 border-sky-500/40 rounded-2xl p-6 shadow-2xl space-y-4">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-sky-900/50 pb-3">
          <div>
            <div className="text-[10px] font-bold text-sky-400 font-mono uppercase tracking-widest">
              Core Project Focus • Layer 3 (Network Layer)
            </div>
            <h2 className="text-base font-bold text-white mt-0.5">
              IPv4 Packet Header — Differentiated Services (DS) Octet
            </h2>
          </div>

          <span className="font-mono font-bold text-sky-300 bg-sky-950 px-3 py-1 rounded-full border border-sky-800 text-xs self-start sm:self-auto">
            Hex Byte: {current.tos_byte_hex}
          </span>
        </div>

        {/* The 6 DSCP Bits Visualizer */}
        <div className="bg-slate-950 p-4 rounded-xl border border-sky-900/40 space-y-3">
          <div className="flex justify-between items-center text-xs font-semibold text-slate-300">
            <span>Differentiated Services Codepoint (Bits 0 to 5):</span>
            <span className="font-mono text-emerald-400 font-bold">{current.dscp_name}</span>
          </div>

          <div className="grid grid-cols-8 gap-1.5 text-center font-mono">
            <div className="col-span-6 bg-sky-900/30 border border-sky-500 rounded-xl p-3">
              <div className="text-[10px] text-sky-300 font-semibold mb-1">6-Bit Priority Code</div>
              <div className="text-3xl font-black text-white tracking-widest my-1">{current.dscp_binary}</div>
              <div className="text-xs text-sky-300 font-semibold">Decimal: {current.dscp_value}</div>
            </div>

            <div className="col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-3">
              <div className="text-[10px] text-slate-400 font-semibold mb-1">ECN (Bits 6-7)</div>
              <div className="text-3xl font-black text-slate-400 tracking-widest my-1">00</div>
              <div className="text-xs text-slate-500">Not-ECT</div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-800 text-xs font-mono">
            <div>
              <span className="text-slate-500">Source:</span> <span className="text-slate-200">{current.source_ip}</span>
            </div>
            <div>
              <span className="text-slate-500">Destination:</span> <span className="text-slate-200">{current.dest_ip}</span>
            </div>
            <div>
              <span className="text-slate-500">Queue:</span> <span className="text-emerald-400 font-bold">{current.queue.split(':')[0]}</span>
            </div>
            <div>
              <span className="text-slate-500">VLAN:</span> <span className="text-sky-300">{current.vlan_name.split('—')[0]}</span>
            </div>
          </div>
        </div>

        <p className="text-xs text-slate-300">
          💡 <strong className="text-white">How routers read this:</strong> {current.behavior}
        </p>

      </div>

      {/* 4 Clean Supporting OSI Layers Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
        
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 space-y-1">
          <div className="text-[10px] font-bold text-purple-400 font-mono">Layer 7 — Application</div>
          <div className="text-white font-semibold">DICOM Protocol</div>
          <div className="text-[11px] text-slate-400">Transfers 3D MRI Image Study</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 space-y-1">
          <div className="text-[10px] font-bold text-blue-400 font-mono">Layer 4 — Transport</div>
          <div className="text-white font-semibold">TCP Port 104</div>
          <div className="text-[11px] text-slate-400">Guaranteed delivery to PACS</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 space-y-1">
          <div className="text-[10px] font-bold text-emerald-400 font-mono">Layer 2 — Data Link</div>
          <div className="text-white font-semibold">802.1Q VLAN Tagging</div>
          <div className="text-[11px] text-slate-400">Segregates medical traffic</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 space-y-1">
          <div className="text-[10px] font-bold text-amber-400 font-mono">Layer 1 — Physical</div>
          <div className="text-white font-semibold">Gigabit Ethernet</div>
          <div className="text-[11px] text-slate-400">Cat6 Hospital Cabling</div>
        </div>

      </div>

    </div>
  );
}
