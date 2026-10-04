import React from 'react';
import { X, Layers, Cpu, Network, ShieldCheck, HardDrive, Globe, Terminal } from 'lucide-react';

export default function OsiPacketModal({ packet, onClose }) {
  if (!packet) return null;

  const dscpVal = packet.dscp_value !== undefined ? packet.dscp_value : 46;
  const dscpName = packet.dscp_name || (dscpVal === 46 ? 'EF' : dscpVal === 34 ? 'AF41' : 'CS0');
  const dscpBinary = packet.dscp_binary || (dscpVal === 46 ? '101110' : dscpVal === 34 ? '100010' : '000000');
  const ipPrec = packet.ip_precedence !== undefined ? packet.ip_precedence : (dscpVal === 46 ? 5 : dscpVal === 34 ? 4 : 0);
  const tosByteHex = '0x' + ((dscpVal << 2) & 0xFC).toString(16).toUpperCase().padStart(2, '0');

  return (
    <div className="fixed inset-0 bg-blue-950/40 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white/95 backdrop-blur-2xl border border-white/70 w-full max-w-4xl rounded-[2.5rem] shadow-2xl shadow-blue-950/20 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-7 py-5 bg-blue-50/70 border-b border-blue-100 flex items-center justify-between">
          <div className="flex items-center space-x-3.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-400 to-blue-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-blue-950 flex items-center space-x-2.5">
                <span>OSI Reference Model Packet Dissection</span>
                <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-mono font-bold ${
                  dscpVal === 46 ? 'bg-rose-100 text-rose-700 border border-rose-200' :
                  dscpVal === 34 ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                  'bg-cyan-100 text-cyan-800 border border-cyan-200'
                }`}>
                  DSCP {dscpName} ({dscpVal})
                </span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Flow: <code className="text-cyan-700 font-mono font-bold">{packet.source_ip || '192.168.10.10'}</code> &rarr; <code className="text-cyan-700 font-mono font-bold">{packet.dest_ip || '192.168.30.10'}:104</code>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white hover:bg-rose-50 border border-blue-200 flex items-center justify-center text-slate-400 hover:text-rose-600 transition shadow-sm"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content - 7 Layers with Nested Soft Glass Cards */}
        <div className="p-7 space-y-4 max-h-[75vh] overflow-y-auto">
          
          {/* Layer 7: Application Layer */}
          <div className="bg-blue-50/50 rounded-2xl border border-blue-100 p-4 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <span className="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-700 text-xs font-bold font-mono flex items-center justify-center border border-indigo-200">L7</span>
                <span className="text-xs font-bold text-blue-950">Application Layer</span>
              </div>
              <span className="text-[11px] text-slate-500 font-mono">DICOM Protocol (C-STORE-RQ)</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs font-mono bg-white/80 p-3 rounded-xl border border-blue-100">
              <div><span className="text-slate-400 block text-[10px]">Service:</span> <span className="text-blue-950 font-medium">DIMSE C-STORE</span></div>
              <div><span className="text-slate-400 block text-[10px]">Modality:</span> <span className="text-blue-950 font-medium">{packet.mri_type || 'MR Imaging'}</span></div>
              <div><span className="text-slate-400 block text-[10px]">Payload:</span> <span className="text-blue-950 font-medium">{packet.image_size_mb || 350} MB</span></div>
              <div><span className="text-slate-400 block text-[10px]">Urgency:</span> <span className="text-rose-600 font-bold">{packet.urgency || 'EMERGENCY'}</span></div>
            </div>
          </div>

          {/* Layer 4: Transport Layer */}
          <div className="bg-blue-50/50 rounded-2xl border border-blue-100 p-4 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <span className="w-6 h-6 rounded-lg bg-cyan-100 text-cyan-700 text-xs font-bold font-mono flex items-center justify-center border border-cyan-200">L4</span>
                <span className="text-xs font-bold text-blue-950">Transport Layer</span>
              </div>
              <span className="text-[11px] text-slate-500 font-mono">TCP (Transmission Control Protocol)</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs font-mono bg-white/80 p-3 rounded-xl border border-blue-100">
              <div><span className="text-slate-400 block text-[10px]">Source Port:</span> <span className="text-blue-950 font-medium">54820 (Client)</span></div>
              <div><span className="text-slate-400 block text-[10px]">Dest Port:</span> <span className="text-cyan-700 font-bold">104 (PACS DICOM)</span></div>
              <div><span className="text-slate-400 block text-[10px]">TCP Flags:</span> <span className="text-blue-950 font-medium">[ACK, PSH]</span></div>
              <div><span className="text-slate-400 block text-[10px]">Window Size:</span> <span className="text-blue-950 font-medium">65535 Bytes</span></div>
            </div>
          </div>

          {/* Layer 3: Network Layer (PRIMARY HIGHLIGHT) */}
          <div className="bg-cyan-50/80 rounded-2xl border border-cyan-200 p-5 space-y-3 relative overflow-hidden shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <span className="w-6 h-6 rounded-lg bg-gradient-to-tr from-cyan-400 to-blue-500 text-white text-xs font-bold font-mono flex items-center justify-center">L3</span>
                <span className="text-xs font-bold text-blue-950">Network Layer (IPv4 Header & DiffServ Field)</span>
              </div>
              <span className="text-[10px] text-cyan-800 font-mono bg-cyan-100 px-2.5 py-0.5 rounded-full border border-cyan-200 font-bold">
                RFC 2474 / RFC 3246
              </span>
            </div>

            {/* IP DS Field Bit Breakdown */}
            <div className="bg-white/90 p-4 rounded-xl border border-cyan-100 space-y-3 shadow-sm">
              <div className="text-xs text-blue-950 font-semibold flex items-center justify-between">
                <span>Differentiated Services (DS) Octet:</span>
                <span className="font-mono text-cyan-800 font-bold bg-cyan-50 px-2.5 py-0.5 rounded-full border border-cyan-200">Byte: {tosByteHex}</span>
              </div>

              {/* Bit Grid */}
              <div className="grid grid-cols-8 gap-2 text-center font-mono text-xs">
                <div className="col-span-6 bg-cyan-50 border border-cyan-200 rounded-xl p-3">
                  <div className="text-[10px] text-cyan-700 font-bold mb-1 uppercase tracking-wider">DSCP (Bits 0-5)</div>
                  <div className="text-2xl font-black text-blue-950 tracking-widest">{dscpBinary}</div>
                  <div className="text-[10px] text-cyan-700 font-bold mt-1">Decimal: {dscpVal} ({dscpName})</div>
                </div>
                <div className="col-span-2 bg-slate-50 border border-slate-200 rounded-xl p-3">
                  <div className="text-[10px] text-slate-400 font-bold mb-1 uppercase tracking-wider">ECN (Bits 6-7)</div>
                  <div className="text-2xl font-black text-slate-400 tracking-widest">00</div>
                  <div className="text-[10px] text-slate-400 mt-1">Not-ECT</div>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs font-mono pt-2 border-t border-blue-100">
                <div><span className="text-slate-400 block text-[10px]">Source IP:</span> <span className="text-blue-950 font-bold">{packet.source_ip || '192.168.10.10'}</span></div>
                <div><span className="text-slate-400 block text-[10px]">Dest IP:</span> <span className="text-blue-950 font-bold">{packet.dest_ip || '192.168.30.10'}</span></div>
                <div><span className="text-slate-400 block text-[10px]">IP Precedence:</span> <span className="text-amber-700 font-bold">{ipPrec}</span></div>
                <div><span className="text-slate-400 block text-[10px]">Router Queue:</span> <span className="text-emerald-700 font-bold">{packet.queue_assigned || 'Strict Priority LLQ'}</span></div>
              </div>
            </div>
          </div>

          {/* Layer 2: Data Link Layer */}
          <div className="bg-blue-50/50 rounded-2xl border border-blue-100 p-4 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <span className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-700 text-xs font-bold font-mono flex items-center justify-center border border-emerald-200">L2</span>
                <span className="text-xs font-bold text-blue-950">Data Link Layer</span>
              </div>
              <span className="text-[11px] text-slate-500 font-mono">IEEE 802.1Q VLAN Tagging & Ethernet II</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs font-mono bg-white/80 p-3 rounded-xl border border-blue-100">
              <div><span className="text-slate-400 block text-[10px]">Source MAC:</span> <span className="text-blue-950 font-medium">00:50:56:A1:10:01</span></div>
              <div><span className="text-slate-400 block text-[10px]">Gateway MAC:</span> <span className="text-blue-950 font-medium">00:1A:A2:FE:99:01</span></div>
              <div><span className="text-slate-400 block text-[10px]">802.1Q VLAN:</span> <span className="text-cyan-700 font-bold">VLAN {dscpVal === 46 ? '10 (Emergency)' : '20 (Routine)'}</span></div>
              <div><span className="text-slate-400 block text-[10px]">802.1p CoS:</span> <span className="text-blue-950 font-medium">{dscpVal === 46 ? '5 (Critical)' : '0 (Best Effort)'}</span></div>
            </div>
          </div>

          {/* Layer 1: Physical Layer */}
          <div className="bg-blue-50/50 rounded-2xl border border-blue-100 p-4 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <span className="w-6 h-6 rounded-lg bg-amber-100 text-amber-800 text-xs font-bold font-mono flex items-center justify-center border border-amber-200">L1</span>
                <span className="text-xs font-bold text-blue-950">Physical Layer</span>
              </div>
              <span className="text-[11px] text-slate-500 font-mono">1000BASE-T Gigabit Ethernet (Cat6 UTP)</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs font-mono bg-white/80 p-3 rounded-xl border border-blue-100">
              <div><span className="text-slate-400 block text-[10px]">Interface:</span> <span className="text-blue-950 font-medium">GigabitEthernet 0/0.10</span></div>
              <div><span className="text-slate-400 block text-[10px]">Link Speed:</span> <span className="text-blue-950 font-medium">1.0 Gbps Full-Duplex</span></div>
              <div><span className="text-slate-400 block text-[10px]">Line Encoding:</span> <span className="text-blue-950 font-medium">PAM-5 / 4D-PAM5</span></div>
              <div><span className="text-slate-400 block text-[10px]">Medium:</span> <span className="text-blue-950 font-medium">Cat6 Hospital STP</span></div>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="px-7 py-4 bg-blue-50/70 border-t border-blue-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-500 hover:to-blue-600 text-white rounded-full text-xs font-bold transition-all shadow-md shadow-blue-500/25"
          >
            Close Dissection
          </button>
        </div>

      </div>
    </div>
  );
}
