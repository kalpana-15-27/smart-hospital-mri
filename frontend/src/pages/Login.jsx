import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { 
  HeartPulse, 
  Lock, 
  User, 
  ShieldCheck, 
  ArrowRight, 
  AlertCircle, 
  CheckCircle2, 
  Stethoscope, 
  Shield, 
  KeyRound, 
  ChevronLeft,
  Send,
  Building2,
  Mail,
  FileCheck,
  Eye,
  EyeOff,
  Sparkles
} from 'lucide-react';

export default function Login({ onLoginSuccess, onBackToLanding }) {
  const { setCurrentUser } = useAuth();

  // Primary navigation tab: 'signin' | 'request_access'
  const [authMode, setAuthMode] = useState('signin');

  // Role selector: 'DOCTOR' | 'ADMIN'
  const [selectedRole, setSelectedRole] = useState('ADMIN');

  // Form states
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Password reset state for first-time login
  const [mustChangePassword, setMustChangePassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [tempPasswordUsed, setTempPasswordUsed] = useState('');
  const [tempToken, setTempToken] = useState('');

  // Request Access state
  const [reqName, setReqName] = useState('');
  const [reqDept, setReqDept] = useState('Radiology');
  const [reqEmail, setReqEmail] = useState('');
  const [reqStaffId, setReqStaffId] = useState('');
  const [requestSubmitted, setRequestSubmitted] = useState(false);

  const handleAutofillAdmin = () => {
    setSelectedRole('ADMIN');
    setUsername('admin1');
    setPassword('kalp1524');
    setErrorMsg('');
  };

  const handleAutofillDoctor = () => {
    setSelectedRole('DOCTOR');
    setUsername('dr_sharma');
    setPassword('sarah@15');
    setErrorMsg('');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    const trimmedUser = username.trim();
    const trimmedPass = password.trim();

    if (!trimmedUser || !trimmedPass) {
      setLoading(false);
      setErrorMsg('Please enter both username and password.');
      return;
    }

    try {
      const res = await api.login(trimmedUser, trimmedPass);

      // Verify role alignment gracefully
      const isDoctorRole = ['DOCTOR', 'RADIOLOGIST'].includes(res.user.role);
      const isAdminRole = ['ADMIN', 'NETWORK_ADMIN'].includes(res.user.role);

      if (selectedRole === 'ADMIN' && !isAdminRole) {
        throw new Error(`Account "${res.user.username}" is registered as ${res.user.role}. Please switch to the Doctor tab to sign in.`);
      }
      if (selectedRole === 'DOCTOR' && !isDoctorRole) {
        throw new Error(`Account "${res.user.username}" is registered as ${res.user.role}. Please switch to the Admin tab to sign in.`);
      }

      localStorage.setItem('token', res.access_token);
      const userProfile = {
        username: res.user.username,
        name: res.user.full_name || res.user.username,
        role: res.user.role,
        department: res.user.department || (isAdminRole ? 'Hospital Administration' : 'Radiology & Imaging'),
        badge: `${res.user.role} Verified`
      };
      setCurrentUser(userProfile);
      if (onLoginSuccess) onLoginSuccess();
    } catch (err) {
      console.warn('Login attempt response:', err);

      // Check if backend returned 403 with requires_password_change
      const detail = err.detail || {};
      if (err.status === 403 && (detail.requires_password_change || detail.temporary_token)) {
        setTempPasswordUsed(trimmedPass);
        setTempToken(detail.temporary_token || '');
        if (detail.temporary_token) {
          localStorage.setItem('token', detail.temporary_token);
        }
        setMustChangePassword(true);
        setErrorMsg('');
      } else {
        if (err.status === 401 || err.message?.includes('Incorrect username or password')) {
          setErrorMsg(
            selectedRole === 'ADMIN'
              ? 'Invalid Credentials. Please verify the admin username and password (or click the Autofill button below).'
              : 'Invalid Credentials. Please check your doctor username and password.'
          );
        } else {
          setErrorMsg(err.message || 'Invalid Credentials');
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChangeSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (newPassword.length < 6) {
      setErrorMsg('New password must be at least 6 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMsg('New passwords do not match. Please re-enter.');
      return;
    }
    if (newPassword === tempPasswordUsed) {
      setErrorMsg('New password must be different from the temporary password.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.changePassword(tempPasswordUsed, newPassword, username.trim());
      localStorage.setItem('token', res.access_token);
      const userProfile = {
        username: res.user.username,
        name: res.user.full_name || res.user.username,
        role: res.user.role,
        department: res.user.department || 'Clinical Medicine',
        badge: `${res.user.role} Verified`
      };
      setCurrentUser(userProfile);
      setSuccessMsg('Password updated successfully! Redirecting...');
      setTimeout(() => {
        if (onLoginSuccess) onLoginSuccess();
      }, 700);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to update temporary password.');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestAccessSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    try {
      await api.submitAccessRequest({
        full_name: reqName.trim(),
        department: reqDept.trim(),
        email: reqEmail.trim(),
        staff_id: reqStaffId.trim()
      });
      setRequestSubmitted(true);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to submit access request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-sky-100 to-blue-200 flex items-center justify-center p-4 sm:p-6 relative overflow-hidden font-sans">
      
      {/* Soft Ambient Background Elements */}
      <div className="absolute top-12 left-12 w-80 h-80 bg-cyan-200/50 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-12 right-12 w-96 h-96 bg-blue-300/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-white/40 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md bg-white/90 backdrop-blur-xl border border-white/60 rounded-[2.5rem] p-8 sm:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] shadow-blue-900/10 relative z-10 transition-all">
        
        {/* Top Back Button */}
        {onBackToLanding && (
          <button 
            onClick={onBackToLanding}
            className="inline-flex items-center space-x-1.5 text-xs text-blue-700/70 hover:text-blue-950 font-medium mb-4 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Back to Portal Overview</span>
          </button>
        )}

        {/* Brand Header */}
        <div className="text-center space-y-2 mb-6">
          <div className="w-14 h-14 bg-gradient-to-tr from-cyan-400 to-blue-500 rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-blue-500/20 text-white">
            <HeartPulse className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-blue-950 tracking-tight">
            Smart Hospital MRI QoS
          </h1>
          <p className="text-xs text-blue-700/70">
            Clinical Priority & Edge Access Gateway
          </p>
        </div>

        {/* Top Toggle: Sign In vs Request Access */}
        <div className="bg-blue-100/70 p-1 rounded-full flex mb-6 shadow-inner">
          <button
            type="button"
            onClick={() => {
              setAuthMode('signin');
              setErrorMsg('');
              setSuccessMsg('');
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-full transition-all text-center ${
              authMode === 'signin'
                ? 'bg-white text-blue-950 shadow-md shadow-blue-900/10'
                : 'text-blue-700/70 hover:text-blue-950'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setAuthMode('request_access');
              setErrorMsg('');
              setSuccessMsg('');
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-full transition-all text-center ${
              authMode === 'request_access'
                ? 'bg-white text-blue-950 shadow-md shadow-blue-900/10'
                : 'text-blue-700/70 hover:text-blue-950'
            }`}
          >
            Request Access
          </button>
        </div>

        {/* MODE 1: SIGN IN */}
        {authMode === 'signin' && !mustChangePassword && (
          <div className="space-y-5">
            
            {/* Role Selector: Doctor vs Admin */}
            <div>
              <label className="block text-[11px] font-semibold text-blue-950 uppercase tracking-wider mb-2">
                Select Your Role
              </label>
              <div className="grid grid-cols-2 gap-2 bg-blue-50/80 p-1.5 rounded-2xl border border-blue-200/50">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedRole('DOCTOR');
                    setErrorMsg('');
                  }}
                  className={`flex items-center justify-center space-x-2 py-2.5 px-3 rounded-xl text-xs font-semibold transition-all ${
                    selectedRole === 'DOCTOR'
                      ? 'bg-white text-blue-950 shadow-sm border border-blue-100 font-bold'
                      : 'text-blue-600/70 hover:text-blue-950'
                  }`}
                >
                  <Stethoscope className="w-4 h-4 text-cyan-600" />
                  <span>Doctor</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedRole('ADMIN');
                    setErrorMsg('');
                  }}
                  className={`flex items-center justify-center space-x-2 py-2.5 px-3 rounded-xl text-xs font-semibold transition-all ${
                    selectedRole === 'ADMIN'
                      ? 'bg-white text-blue-950 shadow-sm border border-blue-100 font-bold'
                      : 'text-blue-600/70 hover:text-blue-950'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4 text-blue-600" />
                  <span>Admin</span>
                </button>
              </div>
            </div>

            {/* Error Message */}
            {errorMsg && (
              <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl text-xs flex items-start space-x-2.5 shadow-sm">
                <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5" />
                <span className="leading-snug">{errorMsg}</span>
              </div>
            )}

            {/* Success Message */}
            {successMsg && (
              <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-2xl text-xs flex items-start space-x-2.5 shadow-sm">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                <span className="leading-snug">{successMsg}</span>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleLogin} className="space-y-4 text-xs">
              <div>
                <label className="block text-blue-950 font-semibold mb-1.5">
                  {selectedRole === 'ADMIN' ? 'Admin ID / Username' : 'Clinical Username / Doctor ID'}
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-blue-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder={selectedRole === 'ADMIN' ? 'e.g. admin1' : 'e.g. dr_sharma'}
                    className="w-full bg-white/70 border border-blue-100 rounded-2xl pl-10 pr-4 py-3 text-blue-950 placeholder:text-blue-300 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:bg-white transition-all font-medium"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-blue-950 font-semibold">Password</label>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-[11px] text-cyan-700 hover:text-blue-950 font-medium flex items-center space-x-1 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    <span>{showPassword ? 'Hide' : 'Show'}</span>
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-blue-400 absolute left-3.5 top-3.5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full bg-white/70 border border-blue-100 rounded-2xl pl-10 pr-10 py-3 text-blue-950 placeholder:text-blue-300 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:bg-white transition-all font-medium font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3.5 text-blue-400 hover:text-cyan-700 transition"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-500 hover:to-blue-600 text-white font-bold rounded-full shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:ring-2 hover:ring-cyan-400/40 transition-all duration-300 transform hover:scale-[1.01] active:scale-95 flex items-center justify-center space-x-2 mt-2 disabled:opacity-50"
              >
                <span>{loading ? 'Authenticating...' : `Sign In as ${selectedRole === 'ADMIN' ? 'Admin' : 'Doctor'}`}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {/* Clickable One-Click Autofill Credentials Pill */}
            <div className="pt-3 border-t border-blue-100 text-center">
              {selectedRole === 'ADMIN' ? (
                <button
                  type="button"
                  onClick={handleAutofillAdmin}
                  className="group inline-flex items-center space-x-2 text-[11px] text-blue-800 bg-blue-50/90 hover:bg-cyan-50 hover:text-cyan-900 px-4 py-2 rounded-full border border-blue-200/80 hover:border-cyan-300 hover:ring-2 hover:ring-cyan-400/40 transition-all duration-300 transform hover:scale-105 shadow-sm hover:shadow"
                >
                  <Shield className="w-3.5 h-3.5 text-cyan-600 group-hover:rotate-12 transition-transform" />
                  <span>
                    Bootstrap Root: <strong className="font-mono text-blue-950 font-bold">admin1</strong> / <strong className="font-mono text-blue-950 font-bold">kalp1524</strong>
                  </span>
                  <span className="text-[10px] bg-cyan-100 text-cyan-800 font-bold px-2 py-0.5 rounded-full ml-1 group-hover:bg-cyan-600 group-hover:text-white transition-colors">
                    Click to Autofill
                  </span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleAutofillDoctor}
                  className="group inline-flex items-center space-x-2 text-[11px] text-blue-800 bg-blue-50/90 hover:bg-cyan-50 hover:text-cyan-900 px-4 py-2 rounded-full border border-blue-200/80 hover:border-cyan-300 hover:ring-2 hover:ring-cyan-400/40 transition-all duration-300 transform hover:scale-105 shadow-sm hover:shadow"
                >
                  <Stethoscope className="w-3.5 h-3.5 text-cyan-600 group-hover:rotate-12 transition-transform" />
                  <span>
                    Clinical Doctor: <strong className="font-mono text-blue-950 font-bold">dr_sharma</strong> / <strong className="font-mono text-blue-950 font-bold">sarah@15</strong>
                  </span>
                  <span className="text-[10px] bg-cyan-100 text-cyan-800 font-bold px-2 py-0.5 rounded-full ml-1 group-hover:bg-cyan-600 group-hover:text-white transition-colors">
                    Click to Autofill
                  </span>
                </button>
              )}
            </div>

          </div>
        )}

        {/* MODE 1.B: FIRST LOGIN PASSWORD CHANGE MANDATORY */}
        {authMode === 'signin' && mustChangePassword && (
          <div className="space-y-5">
            <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl flex items-start space-x-2.5">
              <KeyRound className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-amber-900">First-Time Login Security</h4>
                <p className="text-[11px] text-amber-700 mt-0.5 leading-snug">
                  You are logging in with a temporary password assigned by Administration. You must set a new secure password before access is granted.
                </p>
              </div>
            </div>

            {errorMsg && (
              <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl text-xs flex items-start space-x-2.5 shadow-sm">
                <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5" />
                <span className="leading-snug">{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-2xl text-xs flex items-start space-x-2.5 shadow-sm">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                <span className="leading-snug">{successMsg}</span>
              </div>
            )}

            <form onSubmit={handlePasswordChangeSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-blue-950 font-semibold mb-1.5">New Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-blue-400 absolute left-3.5 top-3.5" />
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new strong password"
                    className="w-full bg-white/70 border border-blue-100 rounded-2xl pl-10 pr-4 py-3 text-blue-950 placeholder:text-blue-300 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:bg-white transition-all font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-blue-950 font-semibold mb-1.5">Confirm New Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-blue-400 absolute left-3.5 top-3.5" />
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter new password"
                    className="w-full bg-white/70 border border-blue-100 rounded-2xl pl-10 pr-4 py-3 text-blue-950 placeholder:text-blue-300 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:bg-white transition-all font-medium"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setMustChangePassword(false);
                    setPassword('');
                  }}
                  className="w-1/3 py-3 rounded-full border border-blue-200 text-blue-700 hover:bg-blue-50 font-semibold text-xs transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-2/3 py-3 bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-500 hover:to-blue-600 text-white font-bold rounded-full shadow-lg shadow-blue-500/25 transition flex items-center justify-center space-x-2"
                >
                  <span>{loading ? 'Updating...' : 'Set Password & Enter'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          </div>
        )}

        {/* MODE 2: REQUEST ACCESS (Replaces public signup) */}
        {authMode === 'request_access' && (
          <div className="space-y-4">
            {requestSubmitted ? (
              <div className="text-center py-6 space-y-4">
                <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
                  <FileCheck className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-blue-950">Credential Request Submitted</h3>
                  <p className="text-xs text-slate-500 mt-2 leading-relaxed max-w-xs mx-auto">
                    Your request for clinical access has been logged for hospital verification. 
                    Administration will review your staff ID and provision your account via the 
                    <strong className="text-blue-900 font-semibold"> HIREADOC</strong> system.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setRequestSubmitted(false);
                    setAuthMode('signin');
                  }}
                  className="px-6 py-2.5 rounded-full bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold border border-blue-200 transition"
                >
                  Return to Sign In
                </button>
              </div>
            ) : (
              <form onSubmit={handleRequestAccessSubmit} className="space-y-3.5 text-xs">
                <div className="p-3 bg-blue-50/80 border border-blue-100 rounded-2xl text-[11px] text-blue-800 leading-snug">
                  Clinical access is restricted to authorized hospital personnel. Public sign-up is disabled for patient privacy and HIPAA compliance.
                </div>

                <div>
                  <label className="block text-blue-950 font-semibold mb-1">Full Name & Title</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-blue-400 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      required
                      value={reqName}
                      onChange={(e) => setReqName(e.target.value)}
                      placeholder="e.g. Dr. Priya Nair, MD"
                      className="w-full bg-white/70 border border-blue-100 rounded-2xl pl-10 pr-4 py-2.5 text-blue-950 placeholder:text-blue-300 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:bg-white transition-all font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-blue-950 font-semibold mb-1">Department</label>
                  <div className="relative">
                    <Building2 className="w-4 h-4 text-blue-400 absolute left-3.5 top-3" />
                    <select
                      value={reqDept}
                      onChange={(e) => setReqDept(e.target.value)}
                      className="w-full bg-white/70 border border-blue-100 rounded-2xl pl-10 pr-4 py-2.5 text-blue-950 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:bg-white transition-all font-medium"
                    >
                      <option value="Radiology">Diagnostic Radiology</option>
                      <option value="Emergency">Trauma & Emergency Care</option>
                      <option value="Neurology">Neurology & Stroke Unit</option>
                      <option value="Cardiology">Cardiology & Vascular</option>
                      <option value="Orthopedics">Orthopedics</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-blue-950 font-semibold mb-1">Hospital Email</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-blue-400 absolute left-3.5 top-3" />
                    <input
                      type="email"
                      required
                      value={reqEmail}
                      onChange={(e) => setReqEmail(e.target.value)}
                      placeholder="doctor@hospital.org"
                      className="w-full bg-white/70 border border-blue-100 rounded-2xl pl-10 pr-4 py-2.5 text-blue-950 placeholder:text-blue-300 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:bg-white transition-all font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-blue-950 font-semibold mb-1">Staff / Medical License ID</label>
                  <div className="relative">
                    <ShieldCheck className="w-4 h-4 text-blue-400 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      required
                      value={reqStaffId}
                      onChange={(e) => setReqStaffId(e.target.value)}
                      placeholder="e.g. MED-8849-NY"
                      className="w-full bg-white/70 border border-blue-100 rounded-2xl pl-10 pr-4 py-2.5 text-blue-950 placeholder:text-blue-300 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:bg-white transition-all font-medium"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-500 hover:to-blue-600 text-white font-bold rounded-full shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center space-x-2 mt-4"
                >
                  <Send className="w-4 h-4" />
                  <span>Submit Request to Administration</span>
                </button>
              </form>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
