import React from 'react';
import { X, Layers, Cpu, Network, ShieldCheck, HardDrive, Globe } from 'lucide-react';

export default function OsiPacketModal({ packet, onClose }) {
  if (!packet) return null;

  const dscpVal = packet.dscp_value !== undefined ? packet.dscp_value : 46;
  const dscpName = packet.dscp_name || (dscpVal === 46 ? 'EF' : dscpVal === 34 ? 'AF41' : 'CS0');
  const dscpBinary = packet.dscp_binary || (dscpVal === 46 ? '101110' : dscpVal === 34 ? '100010' : '000000');
  const ipPrec = packet.ip_precedence !== undefined ? packet.ip_precedence : (dscpVal === 46 ? 5 : dscpVal === 34 ? 4 : 0);
  const tosByteHex = '0x' + ((dscpVal << 2) & 0xFC).toString(16).toUpperCase().padStart(2, '0');

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden my-8">
        
        {/* Header */}
        <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <span>OSI Reference Model Packet Dissection</span>
                <span className={`text-xs px-2 py-0.5 rounded font-mono font-bold ${
                  dscpVal === 46 ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' :
                  dscpVal === 34 ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                  'bg-sky-500/20 text-sky-400 border border-sky-500/30'
                }`}>
                  DSCP {dscpName} ({dscpVal})
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Flow: <code className="text-sky-300 font-mono">{packet.source_ip || '192.168.10.10'}</code> → <code className="text-sky-300 font-mono">{packet.dest_ip || '192.168.30.10'}:104</code>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content - 7 Layers */}
        <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          
          {/* Layer 7: Application Layer */}
          <div className="bg-slate-950/60 rounded-xl border border-slate-800 p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <span className="w-6 h-6 rounded bg-purple-500/20 text-purple-400 text-xs font-bold font-mono flex items-center justify-center">L7</span>
                <span className="text-sm font-semibold text-purple-300">Application Layer</span>
              </div>
              <span className="text-xs text-slate-400 font-mono">Protocol: DICOM (C-STORE-RQ)</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs font-mono bg-slate-900/90 p-3 rounded-lg border border-slate-800">
              <div><span className="text-slate-500">Service:</span> <span className="text-slate-200">DIMSE C-STORE</span></div>
              <div><span className="text-slate-500">Modality:</span> <span className="text-slate-200">{packet.mri_type || 'MR Imaging'}</span></div>
              <div><span className="text-slate-500">Payload Size:</span> <span className="text-slate-200">{packet.image_size_mb || 350} MB</span></div>
              <div><span className="text-slate-500">Urgency:</span> <span className="text-rose-400 font-bold">{packet.urgency || 'EMERGENCY'}</span></div>
            </div>
          </div>

          {/* Layer 4: Transport Layer */}
          <div className="bg-slate-950/60 rounded-xl border border-slate-800 p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <span className="w-6 h-6 rounded bg-blue-500/20 text-blue-400 text-xs font-bold font-mono flex items-center justify-center">L4</span>
                <span className="text-sm font-semibold text-blue-300">Transport Layer</span>
              </div>
              <span className="text-xs text-slate-400 font-mono">Protocol: TCP (Transmission Control Protocol)</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs font-mono bg-slate-900/90 p-3 rounded-lg border border-slate-800">
              <div><span className="text-slate-500">Source Port:</span> <span className="text-slate-200">54820 (Ephemeral)</span></div>
              <div><span className="text-slate-500">Dest Port:</span> <span className="text-sky-300 font-bold">104 (DICOM PACS)</span></div>
              <div><span className="text-slate-500">Flags:</span> <span className="text-slate-200">[ACK, PSH]</span></div>
              <div><span className="text-slate-500">Window Size:</span> <span className="text-slate-200">65535 Bytes</span></div>
            </div>
          </div>

          {/* Layer 3: Network Layer (PRIMARY HIGHLIGHT) */}
          <div className="bg-sky-950/20 rounded-xl border-2 border-sky-500/40 p-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-sky-500 text-slate-950 text-[10px] font-bold px-3 py-0.5 rounded-bl-lg font-mono">
              CORE PROJECT FOCUS
            </div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <span className="w-6 h-6 rounded bg-sky-500 text-slate-950 text-xs font-bold font-mono flex items-center justify-center">L3</span>
                <span className="text-sm font-bold text-sky-300">Network Layer (IPv4 Header & DiffServ Field)</span>
              </div>
              <span className="text-xs text-sky-400 font-mono">RFC 2474 / RFC 3246</span>
            </div>

            {/* IP DS Field Bit Breakdown */}
            <div className="bg-slate-900 p-4 rounded-xl border border-sky-900/50 space-y-3">
              <div className="text-xs text-slate-300 font-medium flex items-center justify-between">
                <span>Differentiated Services (DS) Octet (8 Bits Total):</span>
                <span className="font-mono text-sky-300 font-bold">Byte: {tosByteHex}</span>
              </div>

              {/* Bit Grid */}
              <div className="grid grid-cols-8 gap-1 text-center font-mono text-xs">
                <div className="col-span-6 bg-sky-900/40 border border-sky-500/50 rounded-lg p-2">
                  <div className="text-[10px] text-sky-300 font-semibold mb-1">DSCP (Bits 0-5)</div>
                  <div className="text-sm font-bold text-sky-200 tracking-widest">{dscpBinary}</div>
                  <div className="text-[10px] text-sky-400 mt-1">Decimal: {dscpVal} ({dscpName})</div>
                </div>
                <div className="col-span-2 bg-slate-800/80 border border-slate-700 rounded-lg p-2">
                  <div className="text-[10px] text-slate-400 font-semibold mb-1">ECN (Bits 6-7)</div>
                  <div className="text-sm font-bold text-slate-300 tracking-widest">00</div>
                  <div className="text-[10px] text-slate-400 mt-1">Not-ECT</div>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs font-mono pt-2 border-t border-slate-800">
                <div><span className="text-slate-500">Source IP:</span> <span className="text-slate-200">{packet.source_ip || '192.168.10.10'}</span></div>
                <div><span className="text-slate-500">Dest IP:</span> <span className="text-slate-200">{packet.dest_ip || '192.168.30.10'}</span></div>
                <div><span className="text-slate-500">IP Precedence:</span> <span className="text-amber-400 font-bold">{ipPrec} ({dscpVal === 46 ? 'Critical' : dscpVal === 34 ? 'Flash Override' : 'Routine'})</span></div>
                <div><span className="text-slate-500">Assigned Queue:</span> <span className="text-emerald-400 font-bold">{packet.queue_assigned || 'Strict Priority LLQ'}</span></div>
              </div>
            </div>
          </div>

          {/* Layer 2: Data Link Layer */}
          <div className="bg-slate-950/60 rounded-xl border border-slate-800 p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <span className="w-6 h-6 rounded bg-emerald-500/20 text-emerald-400 text-xs font-bold font-mono flex items-center justify-center">L2</span>
                <span className="text-sm font-semibold text-emerald-300">Data Link Layer</span>
              </div>
              <span className="text-xs text-slate-400 font-mono">IEEE 802.1Q VLAN Tagging & Ethernet II</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs font-mono bg-slate-900/90 p-3 rounded-lg border border-slate-800">
              <div><span className="text-slate-500">Source MAC:</span> <span className="text-slate-200">00:50:56:A1:10:01</span></div>
              <div><span className="text-slate-500">Gateway MAC:</span> <span className="text-slate-200">00:1A:A2:FE:99:01</span></div>
              <div><span className="text-slate-500">802.1Q VLAN:</span> <span className="text-sky-300 font-bold">VLAN {dscpVal === 46 ? '10 (Emergency)' : '20 (Routine)'}</span></div>
              <div><span className="text-slate-500">802.1p CoS:</span> <span className="text-slate-200">{dscpVal === 46 ? '5 (Voice/Priority)' : '0 (Best Effort)'}</span></div>
            </div>
          </div>

          {/* Layer 1: Physical Layer */}
          <div className="bg-slate-950/60 rounded-xl border border-slate-800 p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <span className="w-6 h-6 rounded bg-amber-500/20 text-amber-400 text-xs font-bold font-mono flex items-center justify-center">L1</span>
                <span className="text-sm font-semibold text-amber-300">Physical Layer</span>
              </div>
              <span className="text-xs text-slate-400 font-mono">1000BASE-T Gigabit Ethernet (Cat6 UTP)</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs font-mono bg-slate-900/90 p-3 rounded-lg border border-slate-800">
              <div><span className="text-slate-500">Interface:</span> <span className="text-slate-200">GigabitEthernet 0/0.10</span></div>
              <div><span className="text-slate-500">Link Speed:</span> <span className="text-slate-200">1.0 Gbps Full-Duplex</span></div>
              <div><span className="text-slate-500">Encoding:</span> <span className="text-slate-200">PAM-5 / 4D-PAM5</span></div>
              <div><span className="text-slate-500">Medium:</span> <span className="text-slate-200">Hospital Shielded Twisted Pair</span></div>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-950 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold transition"
          >
            Close Dissection
          </button>
        </div>

      </div>
    </div>
  );
}
