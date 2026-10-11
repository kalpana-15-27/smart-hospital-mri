import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { 
  ChevronDown, 
  HeartPulse, 
  User, 
  LogOut, 
  ShieldCheck, 
  Wifi, 
  Lock, 
  X, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight,
  KeyRound,
  Stethoscope,
  RefreshCw
} from 'lucide-react';

export default function Navbar() {
  const { currentUser, setCurrentUser, demoUsers, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [allUsers, setAllUsers] = useState([]);
  const [fetchingUsers, setFetchingUsers] = useState(false);

  // WiFi-style Connect Modal State
  const [targetUser, setTargetUser] = useState(null);
  const [connectPassword, setConnectPassword] = useState('');
  const [connecting, setConnecting] = useState(false);
  const [connectError, setConnectError] = useState('');

  // Password reset state for first-time login
  const [needsNewPass, setNeedsNewPass] = useState(false);
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [tempPassUsed, setTempPassUsed] = useState('');

  // Fetch all registered users (including newly added doctors) from backend
  const loadHospitalUsers = async () => {
    setFetchingUsers(true);
    try {
      const backendUsers = await api.getUsers();
      if (backendUsers && backendUsers.length > 0) {
        // Merge with demo users to ensure unique by username
        const map = new Map();
        demoUsers.forEach(u => map.set(u.username, u));
        backendUsers.forEach(u => {
          map.set(u.username, {
            username: u.username,
            name: u.full_name || u.username,
            role: u.role,
            department: u.department,
            badge: `${u.role} Verified`,
            requires_password_change: u.requires_password_change
          });
        });
        setAllUsers(Array.from(map.values()));
      } else {
        setAllUsers(demoUsers);
      }
    } catch {
      setAllUsers(demoUsers);
    } finally {
      setFetchingUsers(false);
    }
  };

  useEffect(() => {
    loadHospitalUsers();
  }, [dropdownOpen]);

  const handleOpenConnect = (user) => {
    setDropdownOpen(false);
    setTargetUser(user);
    setConnectPassword('');
    setConnectError('');
    setNeedsNewPass(false);
    setNewPass('');
    setConfirmPass('');
  };

  const handleConnectSubmit = async (e) => {
    e.preventDefault();
    if (!targetUser) return;

    setConnecting(true);
    setConnectError('');

    try {
      const res = await api.login(targetUser.username, connectPassword.trim());
      localStorage.setItem('token', res.access_token);
      
      const userProfile = {
        username: res.user.username,
        name: res.user.full_name || res.user.username,
        role: res.user.role,
        department: res.user.department || targetUser.department,
        badge: `${res.user.role} Verified`
      };
      
      setCurrentUser(userProfile);
      setTargetUser(null);
    } catch (err) {
      const detail = err.detail || {};
      if (err.status === 403 && (detail.requires_password_change || detail.temporary_token)) {
        setTempPassUsed(connectPassword.trim());
        if (detail.temporary_token) {
          localStorage.setItem('token', detail.temporary_token);
        }
        setNeedsNewPass(true);
        setConnectError('');
      } else {
        setConnectError('Incorrect password. Connection to clinical account failed.');
      }
    } finally {
      setConnecting(false);
    }
  };

  const handleNewPassSubmit = async (e) => {
    e.preventDefault();
    if (newPass.length < 6) {
      setConnectError('Password must be at least 6 characters long.');
      return;
    }
    if (newPass !== confirmPass) {
      setConnectError('Passwords do not match.');
      return;
    }

    setConnecting(true);
    try {
      const res = await api.changePassword(tempPassUsed, newPass, targetUser.username);
      localStorage.setItem('token', res.access_token);
      
      const userProfile = {
        username: res.user.username,
        name: res.user.full_name || res.user.username,
        role: res.user.role,
        department: res.user.department || targetUser.department,
        badge: `${res.user.role} Verified`
      };
      
      setCurrentUser(userProfile);
      setTargetUser(null);
    } catch (err) {
      setConnectError(err.message || 'Failed to update temporary password.');
    } finally {
      setConnecting(false);
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-blue-100 shadow-sm shadow-blue-900/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Logo & Health-Tech Brand Identity */}
            <div className="flex items-center space-x-3.5 group cursor-pointer">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-400 to-blue-500 flex items-center justify-center shadow-md shadow-blue-500/20 text-white transition-all duration-300 transform group-hover:scale-110 group-hover:rotate-6 group-hover:shadow-lg group-hover:shadow-cyan-500/30">
                <HeartPulse className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-base tracking-tight text-blue-950 group-hover:text-cyan-700 transition-colors">
                    Smart Hospital MRI QoS
                  </span>
                  <span className="bg-emerald-100 text-emerald-700 border border-emerald-200 text-[10px] px-2.5 py-0.5 rounded-full font-mono font-bold shadow-sm animate-pulse">
                    ACTIVE
                  </span>
                </div>
                <p className="text-xs text-blue-700/70 hidden sm:block font-medium">
                  Clinical Priority Telemetry &bull; Layer 3 QoS DiffServ
                </p>
              </div>
            </div>

            {/* User Profile / Quick Switcher */}
            {currentUser && (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center space-x-2.5 bg-white hover:bg-cyan-50/50 border border-blue-200/80 hover:border-cyan-300 px-4 py-2 rounded-full text-sm transition-all duration-300 transform hover:-translate-y-0.5 hover:scale-[1.02] shadow-sm hover:shadow-lg hover:shadow-cyan-500/15 hover:ring-2 hover:ring-cyan-400/40"
                >
                  <div className={`w-2.5 h-2.5 rounded-full ring-2 ring-white animate-pulse ${
                    currentUser.role === 'DOCTOR' ? 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)]' :
                    currentUser.role === 'NETWORK_ADMIN' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]' :
                    currentUser.role === 'RADIOLOGIST' ? 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.6)]' : 
                    'bg-blue-600 shadow-[0_0_8px_rgba(37,99,235,0.6)]'
                  }`} />
                  <div className="text-left hidden md:block">
                    <div className="text-xs font-bold text-blue-950 tracking-tight">{currentUser.name}</div>
                    <div className="text-[10px] text-blue-600 font-mono font-medium">{currentUser.role}</div>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-300 ${dropdownOpen ? 'rotate-180 text-cyan-600' : ''}`} />
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-80 bg-white/95 backdrop-blur-2xl border border-cyan-100 rounded-2xl shadow-2xl shadow-blue-900/15 ring-2 ring-cyan-400/20 py-2 z-50 animate-in fade-in zoom-in-95 duration-200">
                    <div className="px-3.5 py-2 border-b border-blue-100 text-[10px] font-bold text-blue-900/60 uppercase tracking-wider font-mono flex items-center justify-between">
                      <span>Clinical Profile</span>
                      <span className="text-cyan-600 font-bold bg-cyan-50 px-2 py-0.5 rounded-full border border-cyan-200">{currentUser.role}</span>
                    </div>

                    <div className="p-3 border-b border-blue-100 text-xs bg-gradient-to-r from-blue-50/50 to-transparent">
                      <div className="font-bold text-blue-950">{currentUser.name}</div>
                      <div className="text-slate-500 text-[11px] mt-0.5">{currentUser.department || 'Clinical Staff'}</div>
                      <div className="text-[10px] font-mono text-cyan-700 mt-1 font-semibold">ID: @{currentUser.username}</div>
                    </div>

                    <div className="px-3.5 py-2 text-[10px] font-bold text-blue-900/60 uppercase tracking-wider font-mono flex items-center justify-between">
                      <span>Connect to Clinical Account</span>
                      <span className="text-xs font-mono font-normal text-slate-400">Requires Password</span>
                    </div>

                    <div className="p-1.5 space-y-1.5 max-h-60 overflow-y-auto">
                      {allUsers.map((user) => {
                        const isCurrent = currentUser.username === user.username;
                        return (
                          <button
                            key={user.username}
                            onClick={() => handleOpenConnect(user)}
                            className={`group w-full px-3 py-2 text-left text-xs flex items-center space-x-2.5 rounded-xl transition-all duration-200 transform hover:-translate-y-0.5 hover:scale-[1.01] ${
                              isCurrent 
                                ? 'bg-blue-50 text-blue-950 border border-cyan-300 ring-1 ring-cyan-400/40 font-bold shadow-sm' 
                                : 'text-slate-600 hover:bg-white hover:text-blue-950 border border-transparent hover:border-cyan-200 hover:ring-2 hover:ring-cyan-400/50 hover:shadow-md hover:shadow-cyan-500/10'
                            }`}
                          >
                            <div className="w-7 h-7 rounded-lg bg-blue-100/70 group-hover:bg-cyan-500 group-hover:text-white text-cyan-600 flex items-center justify-center flex-shrink-0 transition-colors">
                              <Wifi className="w-3.5 h-3.5 group-hover:animate-pulse" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="font-medium truncate flex items-center justify-between">
                                <span className="truncate group-hover:text-cyan-800 transition-colors">{user.name}</span>
                                {isCurrent && (
                                  <span className="text-[9px] bg-cyan-100 text-cyan-800 font-bold px-1.5 py-0.2 rounded-full ml-1">
                                    Connected
                                  </span>
                                )}
                              </div>
                              <div className="text-[10px] text-slate-400 font-mono truncate">
                                @{user.username} &bull; {user.role}
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    <div className="p-1.5 border-t border-blue-100">
                      <button
                        onClick={() => {
                          setDropdownOpen(false);
                          logout();
                        }}
                        className="w-full px-3 py-2 text-left text-xs flex items-center space-x-2 rounded-xl text-rose-600 hover:bg-rose-50 hover:ring-1 hover:ring-rose-300 hover:shadow-sm transition-all duration-200 font-medium transform hover:-translate-y-0.5"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out Current Session</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

          </div>
        </div>
      </header>

      {/* WiFi-Style Password Re-Authentication Modal */}
      {targetUser && (
        <div className="fixed inset-0 bg-blue-950/40 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white/95 backdrop-blur-2xl border border-white/70 w-full max-w-sm rounded-[2.5rem] shadow-2xl shadow-blue-950/20 overflow-hidden p-6 sm:p-7 space-y-4">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-2 border-b border-blue-100">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-xl bg-cyan-100 text-cyan-600 flex items-center justify-center shadow-sm">
                  <Wifi className="w-4 h-4 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-blue-950">Connect Account</h3>
                  <p className="text-[11px] text-slate-500">Wi-Fi Protected Clinical Gateway</p>
                </div>
              </div>
              <button
                onClick={() => setTargetUser(null)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-400 flex items-center justify-center transition"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Target Account Badge */}
            <div className="p-3.5 bg-blue-50/70 border border-blue-100 rounded-2xl flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-blue-600 shadow-sm font-bold text-xs">
                {targetUser.name ? targetUser.name.charAt(0) : 'U'}
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-bold text-xs text-blue-950 truncate">
                  {targetUser.name}
                </div>
                <div className="text-[10px] text-cyan-700 font-mono font-semibold">
                  @{targetUser.username} &bull; {targetUser.role}
                </div>
              </div>
            </div>

            {connectError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0" />
                <span className="text-[11px]">{connectError}</span>
              </div>
            )}

            {/* Standard Login Mode */}
            {!needsNewPass ? (
              <form onSubmit={handleConnectSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block text-blue-950 font-semibold mb-1.5">
                    Enter Password to Connect
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-blue-400 absolute left-3.5 top-3.5" />
                    <input
                      type="password"
                      autoFocus
                      required
                      value={connectPassword}
                      onChange={(e) => setConnectPassword(e.target.value)}
                      placeholder="Account security password"
                      className="w-full bg-white/70 border border-blue-100 rounded-2xl pl-10 pr-4 py-2.5 text-blue-950 placeholder:text-blue-300 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:bg-white transition-all font-medium"
                    />
                  </div>
                </div>

                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setTargetUser(null)}
                    className="w-1/3 py-2.5 rounded-full border border-blue-200 text-blue-700 hover:bg-blue-50 font-semibold text-xs transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={connecting}
                    className="w-2/3 py-2.5 bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-500 hover:to-blue-600 text-white font-bold rounded-full shadow-md shadow-blue-500/25 transition flex items-center justify-center space-x-1.5"
                  >
                    <span>{connecting ? 'Verifying...' : 'Connect'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </form>
            ) : (
              /* Forced Password Change for New Doctors */
              <form onSubmit={handleNewPassSubmit} className="space-y-3.5 text-xs">
                <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-[11px] text-amber-800 leading-snug">
                  Temporary password confirmed. Please set your new private password:
                </div>

                <div>
                  <label className="block text-blue-950 font-semibold mb-1">New Password</label>
                  <input
                    type="password"
                    autoFocus
                    required
                    value={newPass}
                    onChange={(e) => setNewPass(e.target.value)}
                    placeholder="New password (min 6 chars)"
                    className="w-full bg-white/70 border border-blue-100 rounded-xl px-3.5 py-2 text-blue-950 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                  />
                </div>

                <div>
                  <label className="block text-blue-950 font-semibold mb-1">Confirm New Password</label>
                  <input
                    type="password"
                    required
                    value={confirmPass}
                    onChange={(e) => setConfirmPass(e.target.value)}
                    placeholder="Re-enter password"
                    className="w-full bg-white/70 border border-blue-100 rounded-xl px-3.5 py-2 text-blue-950 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                  />
                </div>

                <button
                  type="submit"
                  disabled={connecting}
                  className="w-full py-2.5 bg-gradient-to-r from-cyan-400 to-blue-500 text-white font-bold rounded-full shadow-md transition"
                >
                  {connecting ? 'Updating...' : 'Set Password & Connect'}
                </button>
              </form>
            )}

          </div>
        </div>
      )}
    </>
  );
}
