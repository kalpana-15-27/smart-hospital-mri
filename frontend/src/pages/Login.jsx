import React, { useState } from 'react';
import { useAuth, DEMO_USERS } from '../context/AuthContext';
import { api } from '../services/api';
import { HeartPulse, Lock, User, ShieldCheck, ArrowRight, AlertCircle } from 'lucide-react';

export default function Login({ onLoginSuccess }) {
  const { setCurrentUser, switchUser } = useAuth();
  const [username, setUsername] = useState('dr_sharma');
  const [password, setPassword] = useState('password123');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await api.login(username, password);
      localStorage.setItem('token', res.access_token);
      const userProfile = DEMO_USERS.find(u => u.username === res.user.username) || {
        username: res.user.username,
        name: res.user.full_name,
        role: res.user.role,
        department: res.user.department,
        badge: `${res.user.role} Verified`
      };
      setCurrentUser(userProfile);
      if (onLoginSuccess) onLoginSuccess();
    } catch (err) {
      setErrorMsg(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (demoUser) => {
    setUsername(demoUser.username);
    setPassword('password123');
    switchUser(demoUser);
    if (onLoginSuccess) onLoginSuccess();
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6">
        
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 bg-gradient-to-tr from-sky-600 to-cyan-400 rounded-2xl flex items-center justify-center mx-auto shadow-xl shadow-sky-500/20 text-white">
            <HeartPulse className="w-8 h-8" />
          </div>
          <h1 className="text-xl font-extrabold text-white tracking-tight">
            SMART HOSPITAL MRI QoS
          </h1>
          <p className="text-xs text-slate-400">
            OSI Layer 3 IP-Based DiffServ Prioritization Gateway
          </p>
        </div>

        {errorMsg && (
          <div className="p-3 bg-rose-950/60 border border-rose-800 text-rose-300 rounded-xl text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Username / Clinical ID</label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-slate-200 focus:outline-none focus:border-sky-500 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-slate-200 focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-xl shadow-lg shadow-sky-600/30 transition flex items-center justify-center space-x-2"
          >
            <span>{loading ? 'Authenticating...' : 'Sign In to Gateway'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Quick Demo Logins for Evaluation Presentation */}
        <div className="pt-2 border-t border-slate-800 space-y-2">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider text-center">
            Demo 1-Click Role Access
          </div>
          <div className="grid grid-cols-2 gap-2">
            {DEMO_USERS.map((u) => (
              <button
                key={u.username}
                onClick={() => handleQuickLogin(u)}
                className="p-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-xl text-left transition text-[11px]"
              >
                <div className="font-semibold text-slate-200 truncate">{u.name.split(',')[0]}</div>
                <div className="text-[10px] text-sky-400 font-mono">{u.role}</div>
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
