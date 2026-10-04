import React, { useState } from 'react';
import { 
  Layers, 
  Cpu, 
  Network, 
  HardDrive, 
  CheckCircle2, 
  ArrowRight,
  Server,
  Activity,
  Terminal,
  ShieldAlert
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div className="flex items-center space-x-3.5">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-400 to-blue-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-blue-950 tracking-tight">
              Network Map & Packet Header Dissection
            </h1>
            <p className="text-xs text-blue-700/70">
              Visualizing hospital VLAN layout and how Layer 3 packet headers carry DiffServ markings
            </p>
          </div>
        </div>

        {/* Profile Selector (Pill Styled) */}
        <div className="flex items-center space-x-2 bg-white/90 p-1.5 rounded-full border border-blue-200/80 self-start sm:self-auto shadow-sm">
          <button
            onClick={() => setSelectedProfile('EMERGENCY')}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
              selectedProfile === 'EMERGENCY'
                ? 'bg-rose-100 text-rose-700 border border-rose-300 shadow-sm'
                : 'text-slate-600 hover:text-blue-950'
            }`}
          >
            Emergency (DSCP 46)
          </button>
          <button
            onClick={() => setSelectedProfile('URGENT')}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
              selectedProfile === 'URGENT'
                ? 'bg-amber-100 text-amber-800 border border-amber-300 shadow-sm'
                : 'text-slate-600 hover:text-blue-950'
            }`}
          >
            Urgent (DSCP 34)
          </button>
          <button
            onClick={() => setSelectedProfile('NORMAL')}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
              selectedProfile === 'NORMAL'
                ? 'bg-cyan-100 text-cyan-800 border border-cyan-300 shadow-sm'
                : 'text-slate-600 hover:text-blue-950'
            }`}
          >
            Routine (DSCP 0)
          </button>
        </div>
      </div>

      {/* Top: Hospital Network Architecture (Soft Glass Cards) */}
      <div className="bg-white/90 backdrop-blur-xl border border-white/60 rounded-[2.5rem] p-7 shadow-[0_8px_30px_rgb(0,0,0,0.04)] shadow-blue-900/10 space-y-4">
        <div className="flex items-center justify-between border-b border-blue-100 pb-3">
          <div className="text-xs font-bold text-blue-950 uppercase tracking-wider font-mono flex items-center space-x-2">
            <Network className="w-4 h-4 text-cyan-600" />
            <span>Hospital Network Architecture & VLAN Segmentation</span>
          </div>
          <span className="text-[10px] text-cyan-700 font-mono font-bold bg-cyan-50 px-2.5 py-0.5 rounded-full border border-cyan-200">
            IEEE 802.1Q Segregated
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
          
          <div className="p-4 bg-rose-50/60 border border-rose-200 rounded-2xl space-y-1.5 shadow-sm">
            <div className="font-bold text-rose-700 text-[11px] font-mono flex items-center justify-between">
              <span>VLAN 10</span>
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
            </div>
            <div className="text-blue-950 font-bold">Trauma Workstation</div>
            <div className="font-mono text-[10px] text-slate-500">192.168.10.10</div>
            <div className="text-[10px] text-rose-600 font-mono font-medium">Emergency Bays / ICU</div>
          </div>

          <div className="p-4 bg-cyan-50/60 border border-cyan-200 rounded-2xl space-y-1.5 shadow-sm">
            <div className="font-bold text-cyan-700 text-[11px] font-mono flex items-center justify-between">
              <span>VLAN 20</span>
              <span className="w-2 h-2 rounded-full bg-cyan-500"></span>
            </div>
            <div className="text-blue-950 font-bold">Outpatient Scanner</div>
            <div className="font-mono text-[10px] text-slate-500">192.168.20.10</div>
            <div className="text-[10px] text-cyan-600 font-mono font-medium">Routine Diagnostics</div>
          </div>

          <div className="p-4 bg-indigo-50/60 border border-indigo-200 rounded-2xl space-y-1.5 shadow-sm">
            <div className="font-bold text-indigo-700 text-[11px] font-mono flex items-center justify-between">
              <span>VLAN 30</span>
              <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
            </div>
            <div className="text-blue-950 font-bold">PACS Storage Server</div>
            <div className="font-mono text-[10px] text-slate-500">192.168.30.10:104</div>
            <div className="text-[10px] text-indigo-600 font-mono font-medium">Central DICOM Archive</div>
          </div>

          <div className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-2xl space-y-1.5 shadow-sm">
            <div className="font-bold text-emerald-700 text-[11px] font-mono flex items-center justify-between">
              <span>Core Gateway</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            </div>
            <div className="text-blue-950 font-bold">Priority Router</div>
            <div className="font-mono text-[10px] text-slate-500">192.168.10.1</div>
            <div className="text-[10px] text-emerald-600 font-mono font-medium">Hardware SPQ Active</div>
          </div>

        </div>
      </div>

      {/* Cyber Terminal Style: Layer 3 IPv4 DS Field Dissection */}
      <div className="bg-white/90 backdrop-blur-xl border border-white/60 rounded-[2.5rem] p-7 sm:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] shadow-blue-900/10 space-y-5">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-blue-100 pb-3">
          <div>
            <div className="text-[10px] font-bold text-cyan-700 font-mono uppercase tracking-widest flex items-center space-x-1.5">
              <Terminal className="w-3.5 h-3.5" />
              <span>Core Project Focus &bull; Layer 3 (Network Layer)</span>
            </div>
            <h2 className="text-lg font-bold text-blue-950 mt-1">
              IPv4 Packet Header &mdash; Differentiated Services (DS) Octet
            </h2>
          </div>

          <span className="font-mono font-bold text-blue-950 bg-blue-100/80 px-4 py-1.5 rounded-full border border-blue-200 text-xs self-start sm:self-auto shadow-sm">
            Hex Octet: <strong className="text-cyan-700 font-mono">{current.tos_byte_hex}</strong>
          </span>
        </div>

        {/* 6 DSCP Bits Visualizer in Nested Clinical Terminal Card */}
        <div className="bg-blue-50/60 p-6 rounded-2xl border border-blue-100 space-y-4">
          <div className="flex justify-between items-center text-xs font-semibold text-blue-950">
            <span>Differentiated Services Codepoint (Bits 0 to 5):</span>
            <span className="font-mono text-cyan-800 font-bold bg-cyan-100 px-3 py-1 rounded-full border border-cyan-200">
              {current.dscp_name}
            </span>
          </div>

          <div className="grid grid-cols-8 gap-3 text-center font-mono">
            <div className="col-span-6 bg-white border border-cyan-200 rounded-2xl p-5 shadow-sm">
              <div className="text-[11px] text-cyan-700 font-bold mb-1 uppercase tracking-wider">6-Bit DSCP Priority Codepoint</div>
              <div className="text-4xl font-black text-blue-950 tracking-widest my-1">{current.dscp_binary}</div>
              <div className="text-xs text-slate-500 font-semibold mt-1">Decimal Value: <span className="text-cyan-700 font-bold font-mono">{current.dscp_value}</span></div>
            </div>

            <div className="col-span-2 bg-white/70 border border-blue-100 rounded-2xl p-5 shadow-sm">
              <div className="text-[11px] text-slate-400 font-bold mb-1 uppercase tracking-wider">ECN (Bits 6-7)</div>
              <div className="text-4xl font-black text-slate-300 tracking-widest my-1">00</div>
              <div className="text-xs text-slate-400">Not-ECT</div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-blue-200/60 text-xs font-mono">
            <div className="bg-white/80 p-3 rounded-xl border border-blue-100">
              <span className="text-slate-400 block text-[10px]">Source IP:</span> 
              <span className="text-blue-950 font-bold">{current.source_ip}</span>
            </div>
            <div className="bg-white/80 p-3 rounded-xl border border-blue-100">
              <span className="text-slate-400 block text-[10px]">Destination IP:</span> 
              <span className="text-blue-950 font-bold">{current.dest_ip}</span>
            </div>
            <div className="bg-white/80 p-3 rounded-xl border border-blue-100">
              <span className="text-slate-400 block text-[10px]">Active Queue:</span> 
              <span className="text-cyan-700 font-bold">{current.queue.split(':')[0]}</span>
            </div>
            <div className="bg-white/80 p-3 rounded-xl border border-blue-100">
              <span className="text-slate-400 block text-[10px]">Ingress VLAN:</span> 
              <span className="text-blue-900 font-bold">{current.vlan_name.split('—')[0]}</span>
            </div>
          </div>
        </div>

        <div className="bg-cyan-50/70 p-4 rounded-2xl border border-cyan-200 text-xs text-slate-600 flex items-start space-x-2.5">
          <span className="text-cyan-600 font-bold text-base leading-none">💡</span>
          <div>
            <strong className="text-blue-950">Router Hardware Execution: </strong>
            <span>{current.behavior}</span>
          </div>
        </div>

      </div>

      {/* 4 Supporting OSI Layers Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
        
        <div className="bg-white/90 backdrop-blur-xl border border-white/60 rounded-[2.5rem] p-5 space-y-1.5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] shadow-blue-900/10">
          <div className="text-[10px] font-bold text-indigo-600 font-mono">Layer 7 &mdash; Application</div>
          <div className="text-blue-950 font-bold">DICOM Protocol</div>
          <div className="text-[11px] text-slate-500">Transfers 3D MRI Image Study</div>
        </div>

        <div className="bg-white/90 backdrop-blur-xl border border-white/60 rounded-[2.5rem] p-5 space-y-1.5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] shadow-blue-900/10">
          <div className="text-[10px] font-bold text-cyan-600 font-mono">Layer 4 &mdash; Transport</div>
          <div className="text-blue-950 font-bold">TCP Port 104</div>
          <div className="text-[11px] text-slate-500">Guaranteed delivery to PACS</div>
        </div>

        <div className="bg-white/90 backdrop-blur-xl border border-white/60 rounded-[2.5rem] p-5 space-y-1.5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] shadow-blue-900/10">
          <div className="text-[10px] font-bold text-emerald-600 font-mono">Layer 2 &mdash; Data Link</div>
          <div className="text-blue-950 font-bold">802.1Q VLAN Tagging</div>
          <div className="text-[11px] text-slate-500">Segregates medical traffic</div>
        </div>

        <div className="bg-white/90 backdrop-blur-xl border border-white/60 rounded-[2.5rem] p-5 space-y-1.5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] shadow-blue-900/10">
          <div className="text-[10px] font-bold text-amber-600 font-mono">Layer 1 &mdash; Physical</div>
          <div className="text-blue-950 font-bold">Gigabit Ethernet</div>
          <div className="text-[11px] text-slate-500">Cat6 Hospital Cabling</div>
        </div>

      </div>

    </div>
  );
}
