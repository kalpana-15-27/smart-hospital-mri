import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ChevronDown, HeartPulse, User } from 'lucide-react';

export default function Navbar() {
  const { currentUser, switchUser, demoUsers } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <header className="bg-slate-900/95 backdrop-blur border-b border-slate-800 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Clean Title */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-sky-500/20 text-white font-bold">
              <HeartPulse className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-base tracking-tight text-white">Hospital MRI Priority System</span>
                <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] px-2 py-0.5 rounded-full font-mono font-bold">
                  Active
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Network priority for emergency medical scans
              </p>
            </div>
          </div>

          {/* User Profile / Quick Switcher */}
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center space-x-2.5 bg-slate-800/80 hover:bg-slate-800 border border-slate-700 px-3 py-1.5 rounded-xl text-sm transition"
            >
              <div className={`w-2.5 h-2.5 rounded-full ${
                currentUser.role === 'DOCTOR' ? 'bg-rose-500' :
                currentUser.role === 'NETWORK_ADMIN' ? 'bg-emerald-500' :
                currentUser.role === 'RADIOLOGIST' ? 'bg-amber-500' : 'bg-sky-500'
              }`} />
              <div className="text-left hidden md:block">
                <div className="text-xs font-semibold text-slate-200">{currentUser.name}</div>
                <div className="text-[10px] text-slate-400 font-mono">{currentUser.role}</div>
              </div>
              <ChevronDown className="w-4 h-4 text-slate-400" />
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-72 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl py-2 z-50">
                <div className="px-3.5 py-1.5 border-b border-slate-800 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  Switch Active Role
                </div>
                {demoUsers.map((user) => (
                  <button
                    key={user.username}
                    onClick={() => {
                      switchUser(user);
                      setDropdownOpen(false);
                    }}
                    className={`w-full px-3.5 py-2 text-left text-xs flex items-center space-x-2.5 hover:bg-slate-800 transition ${
                      currentUser.username === user.username ? 'bg-sky-950/40 text-sky-400 font-semibold' : 'text-slate-300'
                    }`}
                  >
                    <User className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    <div>
                      <div className="text-slate-200">{user.name}</div>
                      <div className="text-[10px] text-slate-400">{user.department}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </header>
  );
}
