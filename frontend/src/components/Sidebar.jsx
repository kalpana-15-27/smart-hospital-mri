import React from 'react';
import { 
  LayoutDashboard, 
  UserPlus,
  PlusCircle, 
  Zap, 
  Layers, 
  ShieldCheck
} from 'lucide-react';

const NAV_ITEMS = [
  { 
    id: 'dashboard', 
    label: 'Overview & Queues', 
    icon: LayoutDashboard, 
    desc: 'Live traffic & fast-lane status' 
  },
  { 
    id: 'patients', 
    label: 'Patient Registration', 
    icon: UserPlus, 
    desc: 'Triage & admit clinical patients' 
  },
  { 
    id: 'order', 
    label: 'Order MRI Scan', 
    icon: PlusCircle, 
    desc: 'Schedule scan with fast-lane tag' 
  },
  { 
    id: 'speedtest', 
    label: 'Speed Test: Priority vs FIFO', 
    icon: Zap, 
    desc: 'Compare transfer speeds' 
  },
  { 
    id: 'visualizer', 
    label: 'Network & Packet Inspector', 
    icon: Layers, 
    desc: 'VLAN map & Layer 3 header' 
  },
  { 
    id: 'security', 
    label: 'Security & Project Guide', 
    icon: ShieldCheck, 
    desc: 'Anti-spoof test & viva answers' 
  }
];

export default function Sidebar({ activeTab, setActiveTab }) {
  return (
    <aside className="w-64 bg-slate-900/70 border-r border-slate-800/80 flex-shrink-0 flex flex-col justify-between hidden md:flex p-3">
      <div className="space-y-1.5">
        <div className="px-3 py-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
          Main Menu
        </div>

        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-left transition-all ${
                isActive
                  ? 'bg-gradient-to-r from-sky-600 to-indigo-600 text-white shadow-lg shadow-sky-600/20 font-semibold'
                  : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
              }`}
            >
              <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
              <div className="min-w-0">
                <div className="text-xs font-medium leading-tight truncate">{item.label}</div>
                <div className={`text-[10px] truncate mt-0.5 ${isActive ? 'text-sky-100' : 'text-slate-500'}`}>
                  {item.desc}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Simplified, Clean Traffic Lane Legend */}
      <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80 text-xs space-y-2">
        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          Traffic Priority Lanes
        </div>
        <div className="space-y-1.5 text-[11px]">
          <div className="flex items-center justify-between text-slate-300">
            <span className="flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-500"></span>
              <span>Emergency</span>
            </span>
            <span className="font-mono text-rose-400 font-bold text-[10px]">DSCP 46</span>
          </div>
          <div className="flex items-center justify-between text-slate-300">
            <span className="flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-400"></span>
              <span>Urgent / ICU</span>
            </span>
            <span className="font-mono text-amber-400 font-bold text-[10px]">DSCP 34</span>
          </div>
          <div className="flex items-center justify-between text-slate-300">
            <span className="flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-sky-400"></span>
              <span>Standard</span>
            </span>
            <span className="font-mono text-sky-400 font-bold text-[10px]">DSCP 0</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
