import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { 
  Network, 
  Server, 
  Cpu, 
  ShieldCheck, 
  Layers, 
  Radio, 
  CheckCircle2, 
  AlertTriangle,
  HardDrive
} from 'lucide-react';

export default function NetworkTopology() {
  const [devices, setDevices] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDevices = async () => {
      try {
        const data = await api.getDevices();
        setDevices(data);
        if (data.length > 0) {
          setSelectedDevice(data[0]);
        }
      } catch (err) {
        console.error('Failed to load devices:', err);
      } finally {
        setLoading(false);
      }
    };
    loadDevices();
  }, []);

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="border-b border-slate-800 pb-4">
        <h1 className="text-xl font-bold text-white flex items-center space-x-2">
          <Network className="w-5 h-5 text-sky-400" />
          <span>Hospital Network Architecture & VLAN Segmentation</span>
        </h1>
        <p className="text-xs text-slate-400">
          Layer 2 Switching (802.1Q Trunking), Layer 3 Inter-VLAN Routing & DiffServ QoS Edge Boundaries.
        </p>
      </div>

      {/* SVG Interactive Topology Diagram */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-800 pb-3">
          <span className="font-semibold text-white">Interactive Network Map (Click node to inspect)</span>
          <span className="font-mono text-sky-400">802.1Q Gigabit Backbone</span>
        </div>

        {/* Visual VLAN Diagram */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          
          {/* VLAN 10 Card */}
          <div className="bg-rose-950/20 border border-rose-500/40 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-rose-400 font-mono">VLAN 10</span>
              <span className="text-[10px] bg-rose-500/20 text-rose-300 px-2 py-0.5 rounded font-mono font-bold">
                EF (DSCP 46)
              </span>
            </div>
            <div className="text-xs font-semibold text-white">Emergency & Clinical</div>
            <div className="text-[11px] font-mono text-slate-400">192.168.10.0/24</div>
            <div className="space-y-1.5 pt-2 border-t border-rose-900/40 text-xs">
              <div 
                onClick={() => setSelectedDevice(devices.find(d => d.ip_address === '192.168.10.10'))}
                className="p-2 rounded bg-slate-950/80 hover:bg-slate-800 cursor-pointer border border-slate-800 text-[11px] font-mono flex items-center justify-between"
              >
                <span>EMERGENCY-WS-01</span>
                <span className="text-rose-400 font-bold">.10</span>
              </div>
              <div 
                onClick={() => setSelectedDevice(devices.find(d => d.ip_address === '192.168.10.15'))}
                className="p-2 rounded bg-slate-950/80 hover:bg-slate-800 cursor-pointer border border-slate-800 text-[11px] font-mono flex items-center justify-between"
              >
                <span>ICU-NODE-01</span>
                <span className="text-amber-400 font-bold">.15</span>
              </div>
            </div>
          </div>

          {/* VLAN 20 Card */}
          <div className="bg-sky-950/20 border border-sky-500/40 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-sky-400 font-mono">VLAN 20</span>
              <span className="text-[10px] bg-sky-500/20 text-sky-300 px-2 py-0.5 rounded font-mono font-bold">
                CS0 (DSCP 0)
              </span>
            </div>
            <div className="text-xs font-semibold text-white">Routine Radiology</div>
            <div className="text-[11px] font-mono text-slate-400">192.168.20.0/24</div>
            <div className="space-y-1.5 pt-2 border-t border-sky-900/40 text-xs">
              <div 
                onClick={() => setSelectedDevice(devices.find(d => d.ip_address === '192.168.20.10'))}
                className="p-2 rounded bg-slate-950/80 hover:bg-slate-800 cursor-pointer border border-slate-800 text-[11px] font-mono flex items-center justify-between"
              >
                <span>ROUTINE-RAD-01</span>
                <span className="text-sky-400 font-bold">.10</span>
              </div>
            </div>
          </div>

          {/* VLAN 30 Card (PACS & MRI Core) */}
          <div className="bg-purple-950/20 border border-purple-500/40 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-purple-400 font-mono">VLAN 30</span>
              <span className="text-[10px] bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded font-mono font-bold">
                CORE PACS
              </span>
            </div>
            <div className="text-xs font-semibold text-white">PACS & MRI Storage</div>
            <div className="text-[11px] font-mono text-slate-400">192.168.30.0/24</div>
            <div className="space-y-1.5 pt-2 border-t border-purple-900/40 text-xs">
              <div 
                onClick={() => setSelectedDevice(devices.find(d => d.ip_address === '192.168.30.10'))}
                className="p-2 rounded bg-slate-950/80 hover:bg-slate-800 cursor-pointer border border-slate-800 text-[11px] font-mono flex items-center justify-between"
              >
                <span>CORE-PACS-SERVER</span>
                <span className="text-purple-400 font-bold">.10 (TCP:104)</span>
              </div>
              <div 
                onClick={() => setSelectedDevice(devices.find(d => d.ip_address === '192.168.30.20'))}
                className="p-2 rounded bg-slate-950/80 hover:bg-slate-800 cursor-pointer border border-slate-800 text-[11px] font-mono flex items-center justify-between"
              >
                <span>SIEMENS-3T-MRI</span>
                <span className="text-purple-400 font-bold">.20</span>
              </div>
            </div>
          </div>

          {/* VLAN 40 Card */}
          <div className="bg-slate-950/40 border border-slate-700 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 font-mono">VLAN 40</span>
              <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded font-mono">
                ADMIN
              </span>
            </div>
            <div className="text-xs font-semibold text-white">Hospital Administration</div>
            <div className="text-[11px] font-mono text-slate-400">192.168.40.0/24</div>
            <div className="space-y-1.5 pt-2 border-t border-slate-800 text-xs">
              <div 
                onClick={() => setSelectedDevice(devices.find(d => d.ip_address === '192.168.40.10'))}
                className="p-2 rounded bg-slate-950/80 hover:bg-slate-800 cursor-pointer border border-slate-800 text-[11px] font-mono flex items-center justify-between"
              >
                <span>BILLING-WS-01</span>
                <span className="text-slate-400 font-bold">.10</span>
              </div>
            </div>
          </div>

        </div>

        {/* Central Router / Gateway Node Box */}
        <div className="p-4 bg-slate-950 rounded-xl border border-sky-800/50 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-lg bg-sky-500/20 text-sky-400 border border-sky-500/30">
              <Cpu className="w-6 h-6" />
            </div>
            <div>
              <div className="text-sm font-bold text-white flex items-center space-x-2">
                <span>Cisco 2911 / Linux Traffic Control Core QoS Gateway</span>
                <span className="bg-emerald-500/20 text-emerald-300 text-[10px] px-2 py-0.5 rounded font-mono font-bold">
                  LLQ + CBWFQ ACTIVE
                </span>
              </div>
              <div className="text-xs text-slate-400 font-mono mt-0.5">
                Sub-Interfaces: Gi0/0.10 (192.168.10.1) • Gi0/0.20 (192.168.20.1) • Gi0/0.30 (192.168.30.1) • Gi0/0.40 (192.168.40.1)
              </div>
            </div>
          </div>

          <div className="text-right font-mono text-xs text-slate-400">
            <div>Scheduler: <strong className="text-sky-300">Strict LLQ (50%) + CBWFQ (30%) + WFQ (20%)</strong></div>
            <div>Trust Policy: <strong className="text-emerald-400">Untrusted Edge DSCP Remarking Enforced</strong></div>
          </div>
        </div>

      </div>

      {/* Selected Node Inspector */}
      {selectedDevice && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-2">
              <HardDrive className="w-4 h-4 text-sky-400" />
              <h3 className="text-sm font-bold text-white font-mono">
                Node Inspector: {selectedDevice.device_name}
              </h3>
            </div>
            <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-mono font-bold ${
              selectedDevice.is_trusted 
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
            }`}>
              {selectedDevice.is_trusted ? 'TRUSTED CLINICAL ENDPOINT' : 'UNTRUSTED / EDGE DEMOTION'}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
              <div className="text-[10px] text-slate-500">IPv4 Address</div>
              <div className="text-sky-300 font-bold text-sm">{selectedDevice.ip_address}</div>
            </div>
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
              <div className="text-[10px] text-slate-500">Hardware MAC</div>
              <div className="text-slate-200">{selectedDevice.mac_address}</div>
            </div>
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
              <div className="text-[10px] text-slate-500">VLAN Mapping</div>
              <div className="text-amber-400 font-bold">{selectedDevice.vlan_name} (ID: {selectedDevice.vlan_id})</div>
            </div>
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
              <div className="text-[10px] text-slate-500">Device Type / Role</div>
              <div className="text-slate-200">{selectedDevice.device_type}</div>
            </div>
          </div>

          {selectedDevice.description && (
            <p className="text-xs text-slate-300 italic pt-1">
              Description: {selectedDevice.description}
            </p>
          )}
        </div>
      )}

    </div>
  );
}
