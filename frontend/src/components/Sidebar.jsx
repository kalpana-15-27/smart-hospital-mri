import React from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  UserPlus, 
  PlusCircle, 
  Zap, 
  Layers, 
  ShieldCheck,
  UserCheck,
  LogOut,
  Sparkles
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
  const { currentUser, logout } = useAuth();
  const isAdmin = currentUser?.role === 'ADMIN';

  return (
    <aside className="w-64 m-4 rounded-[2.5rem] bg-white/90 backdrop-blur-xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] shadow-blue-900/10 flex-shrink-0 flex flex-col justify-between hidden md:flex p-5">
      <div className="space-y-4">
        
        {/* Navigation Category Label */}
        <div className="px-3 text-[10px] font-bold text-blue-900/60 uppercase tracking-wider font-mono">
          Clinical Navigation
        </div>

        {/* Navigation Links */}
        <nav className="space-y-1.5">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-2xl text-left transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-400 to-blue-500 text-white shadow-md shadow-blue-500/20 font-semibold'
                    : 'text-slate-600 hover:bg-blue-50/80 hover:text-blue-950 border border-transparent'
                }`}
              >
                <div className={`p-1.5 rounded-xl ${
                  isActive ? 'bg-white/20 text-white' : 'bg-blue-100/60 text-cyan-600'
                }`}>
                  <Icon className="w-4 h-4 flex-shrink-0" />
                </div>
                <div className="min-w-0">
                  <div className={`text-xs font-semibold leading-tight truncate ${isActive ? 'text-white' : 'text-blue-950'}`}>
                    {item.label}
                  </div>
                  <div className={`text-[10px] truncate mt-0.5 font-mono ${isActive ? 'text-white/80' : 'text-slate-400'}`}>
                    {item.desc}
                  </div>
                </div>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Section: Traffic Lanes, HIREADOC & User Profile */}
      <div className="space-y-3 pt-3 border-t border-blue-100/80">
        
        {/* QoS Traffic Lanes Embedded Card */}
        <div className="p-3 bg-blue-50/70 rounded-2xl border border-blue-100 text-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-blue-900/70 uppercase tracking-wider font-mono">
              QoS Traffic Lanes
            </span>
            <span className="text-[9px] text-cyan-600 font-mono font-semibold">RFC 2474</span>
          </div>
          <div className="space-y-1.5 text-[11px]">
            <div className="flex items-center justify-between text-slate-600">
              <span className="flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
                <span className="text-blue-950 font-medium">Emergency</span>
              </span>
              <span className="font-mono text-rose-600 font-bold text-[10px] bg-rose-100/80 px-2 py-0.5 rounded-full">
                DSCP 46
              </span>
            </div>
            <div className="flex items-center justify-between text-slate-600">
              <span className="flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                <span className="text-slate-700">Urgent / ICU</span>
              </span>
              <span className="font-mono text-amber-700 font-bold text-[10px] bg-amber-100/80 px-2 py-0.5 rounded-full">
                DSCP 34
              </span>
            </div>
            <div className="flex items-center justify-between text-slate-600">
              <span className="flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-cyan-500"></span>
                <span className="text-slate-600">Standard</span>
              </span>
              <span className="font-mono text-cyan-700 font-bold text-[10px] bg-cyan-100/80 px-2 py-0.5 rounded-full">
                DSCP 0
              </span>
            </div>
          </div>
        </div>

        {/* RBAC RULE: HIREADOC Button (ONLY visible if currentUser.role === 'ADMIN') */}
        {isAdmin && (
          <button
            onClick={() => setActiveTab('hireadoc')}
            className={`w-full py-3 px-3.5 rounded-full flex items-center justify-center space-x-2 text-xs font-bold transition-all shadow-md ${
              activeTab === 'hireadoc'
                ? 'bg-blue-900 text-white shadow-blue-900/30 ring-2 ring-blue-400'
                : 'bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-500 hover:to-blue-600 text-white shadow-blue-500/25 hover:shadow-blue-500/40'
            }`}
          >
            <UserCheck className="w-4 h-4 flex-shrink-0" />
            <span className="tracking-wide">HIREADOC</span>
            <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded-full font-mono font-normal">
              Admin
            </span>
          </button>
        )}

        {/* Current User Footnote & Logout */}
        {currentUser && (
          <div className="p-2.5 rounded-2xl bg-white/60 border border-blue-100 flex items-center justify-between text-xs">
            <div className="min-w-0 pr-2">
              <div className="font-bold text-blue-950 truncate text-[11px]">
                {currentUser.name || currentUser.username}
              </div>
              <div className="text-[10px] font-mono text-cyan-600 truncate font-semibold">
                {currentUser.role}
              </div>
            </div>
            <button
              onClick={logout}
              title="Sign Out"
              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

      </div>
    </aside>
  );
}
