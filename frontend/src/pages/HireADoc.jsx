import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { 
  UserPlus, 
  ShieldCheck, 
  Key, 
  Building2, 
  User, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  Lock, 
  RefreshCw,
  Users,
  BadgeAlert,
  ArrowRight,
  Inbox,
  Check,
  X,
  Mail,
  FileCheck
} from 'lucide-react';

export default function HireADoc({ onDoctorCreated }) {
  const [fullName, setFullName] = useState('');
  const [department, setDepartment] = useState('Emergency Medicine & Trauma');
  const [username, setUsername] = useState('');
  const [tempPassword, setTempPassword] = useState('DocTemp@2026');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successData, setSuccessData] = useState(null);
  
  // Hospital Directory state
  const [existingDoctors, setExistingDoctors] = useState([]);
  const [fetchingUsers, setFetchingUsers] = useState(false);

  // Access Requests state
  const [accessRequests, setAccessRequests] = useState([]);
  const [fetchingRequests, setFetchingRequests] = useState(false);
  const [reviewingId, setReviewingId] = useState(null);
  const [activeSubTab, setActiveSubTab] = useState('provision'); // 'provision' | 'requests'

  // Generate random secure temporary password
  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%';
    let res = 'Doc@';
    for (let i = 0; i < 6; i++) {
      res += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setTempPassword(res);
  };

  const loadData = async () => {
    setFetchingUsers(true);
    setFetchingRequests(true);
    try {
      const [users, requests] = await Promise.all([
        api.getUsers().catch(() => []),
        api.getAccessRequests().catch(() => [])
      ]);
      setExistingDoctors(users || []);
      setAccessRequests(requests || []);
    } catch (err) {
      console.warn('Error loading HIREADOC data:', err);
    } finally {
      setFetchingUsers(false);
      setFetchingRequests(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleHireDoctor = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSuccessData(null);

    try {
      const payload = {
        full_name: fullName.trim(),
        department: department.trim(),
        username: username.trim().toLowerCase(),
        password: tempPassword.trim()
      };

      const res = await api.adminCreateDoctor(payload);
      setSuccessData({
        ...res,
        temp_pass: tempPassword.trim()
      });

      // Clear input fields
      setFullName('');
      setUsername('');
      generateRandomPassword();

      // Refresh users & requests
      loadData();

      if (onDoctorCreated) {
        onDoctorCreated(res);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to provision doctor account.');
    } finally {
      setLoading(false);
    }
  };

  // Accept a pending request: approves it and auto-fills the provisioning form
  const handleAcceptRequest = async (req) => {
    setReviewingId(req.id);
    setErrorMsg('');
    try {
      await api.reviewAccessRequest(req.id, 'APPROVE', 'Approved by Hospital Administrator');
      
      // Auto-populate the provisioning form with doctor's info
      setFullName(req.full_name);
      setDepartment(req.department);
      
      // Auto-suggest clean clinical username
      const cleanName = req.full_name.toLowerCase().replace(/dr\.?|\s+|,md|,do/gi, '').trim().replace(/[^a-z0-9]/g, '');
      setUsername(`dr_${cleanName || 'physician'}`);
      generateRandomPassword();
      
      setActiveSubTab('provision');
      loadData();
    } catch (err) {
      setErrorMsg(err.message || 'Could not approve access request.');
    } finally {
      setReviewingId(null);
    }
  };

  // Reject a pending request
  const handleRejectRequest = async (reqId) => {
    setReviewingId(reqId);
    setErrorMsg('');
    try {
      await api.reviewAccessRequest(reqId, 'REJECT', 'Declined by Hospital Administrator');
      loadData();
    } catch (err) {
      setErrorMsg(err.message || 'Could not reject access request.');
    } finally {
      setReviewingId(null);
    }
  };

  const pendingRequests = accessRequests.filter(r => r.status === 'PENDING');

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 bg-blue-100/70 text-blue-800 px-3.5 py-1 rounded-full text-xs font-semibold mb-2">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
            <span>Hospital Administration &bull; RBAC Controller</span>
          </div>
          <h1 className="text-3xl font-bold text-blue-950 tracking-tight">
            Doctor Provisioning (HIREADOC)
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Accept pending access requests and issue clinical credentials with mandatory first-login password rotation.
          </p>
        </div>

        <button
          onClick={loadData}
          disabled={fetchingUsers || fetchingRequests}
          className="inline-flex items-center space-x-2 px-4 py-2 rounded-full border border-blue-200/80 bg-white/80 hover:bg-white text-xs font-semibold text-blue-700 shadow-sm transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${fetchingUsers || fetchingRequests ? 'animate-spin' : ''}`} />
          <span>Sync Hospital Directory</span>
        </button>
      </div>

      {/* Sub-tabs: Provision Form vs Access Requests */}
      <div className="flex space-x-3 border-b border-blue-100 pb-3">
        <button
          onClick={() => setActiveSubTab('provision')}
          className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all duration-300 transform hover:-translate-y-1 hover:scale-105 flex items-center space-x-2 ${
            activeSubTab === 'provision'
              ? 'bg-gradient-to-r from-cyan-400 to-blue-500 text-white shadow-md shadow-blue-500/20 ring-2 ring-cyan-300'
              : 'bg-white/80 text-blue-900 hover:bg-white border border-blue-100 hover:ring-2 hover:ring-cyan-300/60 shadow-sm'
          }`}
        >
          <UserPlus className="w-4 h-4" />
          <span>Provision New Physician</span>
        </button>

        <button
          onClick={() => setActiveSubTab('requests')}
          className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all duration-300 transform hover:-translate-y-1 hover:scale-105 flex items-center space-x-2 relative ${
            activeSubTab === 'requests'
              ? 'bg-gradient-to-r from-cyan-400 to-blue-500 text-white shadow-md shadow-blue-500/20 ring-2 ring-cyan-300'
              : 'bg-white/80 text-blue-900 hover:bg-white border border-blue-100 hover:ring-2 hover:ring-cyan-300/60 shadow-sm'
          }`}
        >
          <Inbox className="w-4 h-4" />
          <span>Access Requests From Portal</span>
          {pendingRequests.length > 0 && (
            <span className="bg-rose-500 text-white text-[10px] font-mono px-2 py-0.2 rounded-full animate-pulse shadow-sm">
              {pendingRequests.length}
            </span>
          )}
        </button>
      </div>

      {/* VIEW 1: ACCESS REQUESTS TABLE (Accept / Reject) */}
      {activeSubTab === 'requests' && (
        <div className="bg-white/90 backdrop-blur-xl border border-white/60 rounded-[2.5rem] p-7 sm:p-9 shadow-[0_8px_30px_rgb(0,0,0,0.04)] shadow-blue-900/10 space-y-6">
          <div className="flex items-center justify-between border-b border-blue-100 pb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-cyan-100 text-cyan-600 flex items-center justify-center shadow-sm">
                <Inbox className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h2 className="text-base font-bold text-blue-950">Portal Clinical Access Inquiries</h2>
                <p className="text-xs text-slate-500">Review doctors requesting access from the Login portal</p>
              </div>
            </div>
            <span className="text-xs font-mono font-bold text-blue-950 bg-blue-100/70 px-3 py-1 rounded-full">
              {pendingRequests.length} Pending
            </span>
          </div>

          {errorMsg && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {accessRequests.length === 0 ? (
            <div className="text-center py-12 space-y-2">
              <FileCheck className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="text-sm font-semibold text-blue-950">No access requests logged yet</p>
              <p className="text-xs text-slate-500">
                When prospective clinicians click "Request Access" on the portal login page, their submissions will appear here for Admin review.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {accessRequests.map((req) => {
                const isPending = req.status === 'PENDING';
                const isApproved = req.status === 'APPROVED';
                return (
                  <div
                    key={req.id}
                    className={`p-5 rounded-2xl border transition-all duration-300 transform hover:-translate-y-1 hover:scale-[1.01] flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                      isPending 
                        ? 'bg-blue-50/70 hover:bg-white border-blue-200 hover:border-cyan-300 hover:ring-2 hover:ring-cyan-400/50 hover:shadow-xl hover:shadow-cyan-500/15' 
                        : isApproved 
                        ? 'bg-emerald-50/50 hover:bg-white border-emerald-200 hover:ring-2 hover:ring-emerald-400/50 hover:shadow-md opacity-80' 
                        : 'bg-slate-50 border-slate-200 opacity-60'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-bold text-blue-950">{req.full_name}</span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white border border-blue-100 text-blue-700 font-semibold shadow-sm">
                          Staff ID: {req.staff_id}
                        </span>
                        <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                          isPending ? 'bg-amber-100 text-amber-800' :
                          isApproved ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-700'
                        }`}>
                          {req.status}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 flex items-center space-x-3">
                        <span className="flex items-center space-x-1">
                          <Building2 className="w-3.5 h-3.5 text-blue-400" />
                          <span>{req.department}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <Mail className="w-3.5 h-3.5 text-blue-400" />
                          <span>{req.email}</span>
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        Submitted: {new Date(req.created_at).toLocaleString()}
                      </div>
                    </div>

                    {/* Action buttons */}
                    {isPending ? (
                      <div className="flex items-center space-x-2 flex-shrink-0">
                        <button
                          onClick={() => handleRejectRequest(req.id)}
                          disabled={reviewingId === req.id}
                          className="px-4 py-2 rounded-full border border-rose-200 hover:border-rose-300 text-rose-700 hover:bg-rose-50 text-xs font-semibold transition-all duration-200 transform hover:-translate-y-0.5 hover:scale-105 flex items-center space-x-1 hover:shadow-sm"
                        >
                          <X className="w-3.5 h-3.5" />
                          <span>Reject</span>
                        </button>
                        <button
                          onClick={() => handleAcceptRequest(req)}
                          disabled={reviewingId === req.id}
                          className="px-5 py-2 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white text-xs font-bold transition-all duration-200 transform hover:-translate-y-0.5 hover:scale-105 shadow-md shadow-emerald-500/20 hover:shadow-xl hover:shadow-emerald-500/40 hover:ring-2 hover:ring-emerald-300 flex items-center space-x-1"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Accept & Provision</span>
                        </button>
                      </div>
                    ) : (
                      <div className="text-[11px] font-mono text-slate-500">
                        {req.notes || (isApproved ? 'Accepted' : 'Declined')}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* VIEW 2: PROVISIONING FORM & DIRECTORY */}
      {activeSubTab === 'provision' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Form Panel (7 cols) */}
          <div className="lg:col-span-7 bg-white/90 backdrop-blur-xl border border-white/60 rounded-[2.5rem] p-7 sm:p-9 shadow-[0_8px_30px_rgb(0,0,0,0.04)] shadow-blue-900/10">
            
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-400 to-blue-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
                <UserPlus className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-blue-950">Provision New Physician</h2>
                <p className="text-xs text-slate-500">Assign role privileges and Layer 3 DSCP marking clearance</p>
              </div>
            </div>

            {/* Mandatory Security Callout */}
            <div className="p-4 bg-amber-50/90 border border-amber-200/80 rounded-2xl text-xs text-amber-900 mb-6 flex items-start space-x-3 shadow-sm">
              <BadgeAlert className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="leading-relaxed">
                <strong className="font-semibold text-amber-950 block mb-0.5">Strict Security Enforcement</strong>
                Passwords assigned here are flagged as <span className="font-mono font-bold bg-amber-200/70 px-1.5 py-0.5 rounded text-[11px]">temporary</span>. 
                The doctor will be <span className="underline decoration-amber-500 font-medium">strictly blocked</span> from clinical systems and MRI queues until they rotate to their personal secret password on initial login.
              </div>
            </div>

            {errorMsg && (
              <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl text-xs flex items-center space-x-2.5 mb-6">
                <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {successData && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs space-y-2 mb-6 shadow-sm">
                <div className="flex items-center space-x-2 font-bold text-emerald-900">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Doctor Account Successfully Provisioned!</span>
                </div>
                <p className="text-[11px] text-emerald-700">
                  Provide these initial credentials to <strong>{successData.full_name}</strong>:
                </p>
                <div className="bg-white/80 p-3 rounded-xl border border-emerald-200 font-mono text-[11px] space-y-1">
                  <div>Username: <strong className="text-blue-950">@{successData.username}</strong></div>
                  <div>Temporary Password: <strong className="text-rose-600">{successData.temp_pass}</strong></div>
                  <div>Department: <span className="text-slate-600">{successData.department}</span></div>
                  <div className="text-[10px] text-amber-600 mt-1">Requires Password Change: YES (Enforced)</div>
                </div>
              </div>
            )}

            <form onSubmit={handleHireDoctor} className="space-y-4 text-xs">
              <div>
                <label className="block text-blue-950 font-semibold mb-1.5">
                  Doctor Full Name & Title
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-blue-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Dr. Maya Lin, MD"
                    className="w-full bg-white/70 border border-blue-100 rounded-2xl pl-10 pr-4 py-3 text-blue-950 placeholder:text-blue-300 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:bg-white transition-all font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-blue-950 font-semibold mb-1.5">
                  Clinical Department
                </label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-blue-400 absolute left-3.5 top-3.5" />
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full bg-white/70 border border-blue-100 rounded-2xl pl-10 pr-4 py-3 text-blue-950 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:bg-white transition-all font-medium"
                  >
                    <option value="Emergency Medicine & Trauma">Emergency Medicine & Trauma (DSCP 46 Clearance)</option>
                    <option value="Diagnostic Radiology & PACS">Diagnostic Radiology & PACS (DSCP 34 Clearance)</option>
                    <option value="Neurology & Critical Stroke Care">Neurology & Critical Stroke Care (DSCP 46 Clearance)</option>
                    <option value="Pediatric Critical Care">Pediatric Critical Care</option>
                    <option value="Orthopedic Surgery">Orthopedic Surgery</option>
                    <option value="General Outpatient">General Outpatient (DSCP 0 Standard)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-blue-950 font-semibold mb-1.5">
                  Login Username (Unique ID)
                </label>
                <div className="relative">
                  <Key className="w-4 h-4 text-blue-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="e.g. dr_mayalin"
                    className="w-full bg-white/70 border border-blue-100 rounded-2xl pl-10 pr-4 py-3 text-blue-950 placeholder:text-blue-300 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:bg-white transition-all font-mono font-medium"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-blue-950 font-semibold">
                    Initial Temporary Password
                  </label>
                  <button
                    type="button"
                    onClick={generateRandomPassword}
                    className="text-[11px] text-cyan-600 hover:text-cyan-700 font-semibold flex items-center space-x-1"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>Generate New</span>
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-blue-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    required
                    value={tempPassword}
                    onChange={(e) => setTempPassword(e.target.value)}
                    className="w-full bg-white/70 border border-blue-100 rounded-2xl pl-10 pr-4 py-3 text-blue-950 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:bg-white transition-all font-mono font-bold"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-500 hover:to-blue-600 text-white font-bold rounded-full shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all flex items-center justify-center space-x-2 mt-4 disabled:opacity-50"
              >
                <span>{loading ? 'Creating Credentials in Database...' : 'Provision Doctor Account'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

          </div>

          {/* Directory Panel (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            
            <div className="bg-white/90 backdrop-blur-xl border border-white/60 rounded-[2.5rem] p-7 shadow-[0_8px_30px_rgb(0,0,0,0.04)] shadow-blue-900/10">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-blue-100">
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4 text-blue-600" />
                  <h3 className="text-sm font-bold text-blue-950">Hospital Clinical Directory</h3>
                </div>
                <span className="text-[11px] font-mono font-bold text-blue-700 bg-blue-100/70 px-2.5 py-0.5 rounded-full">
                  {existingDoctors.length} Users
                </span>
              </div>

              <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
                {existingDoctors.map((doc) => (
                  <div 
                    key={doc.id || doc.username}
                    className="p-3.5 rounded-2xl bg-blue-50/50 border border-blue-100 hover:bg-blue-50 transition flex items-center justify-between"
                  >
                    <div className="min-w-0 pr-2">
                      <div className="text-xs font-bold text-blue-950 truncate">
                        {doc.full_name || doc.username}
                      </div>
                      <div className="text-[11px] text-slate-500 truncate mt-0.5">
                        {doc.department || 'General Staff'}
                      </div>
                      <div className="text-[10px] font-mono text-blue-600/80 mt-0.5">
                        @{doc.username}
                      </div>
                    </div>

                    <div className="text-right flex-shrink-0">
                      <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold tracking-tight ${
                        doc.role === 'ADMIN' 
                          ? 'bg-purple-100 text-purple-700 border border-purple-200'
                          : 'bg-cyan-100 text-cyan-800 border border-cyan-200'
                      }`}>
                        {doc.role}
                      </span>
                      <div className="mt-1">
                        {doc.requires_password_change ? (
                          <span className="text-[9px] font-medium text-amber-600 bg-amber-100/80 px-2 py-0.5 rounded-full inline-block">
                            Pending Rotation
                          </span>
                        ) : (
                          <span className="text-[9px] font-medium text-emerald-600 bg-emerald-100/80 px-2 py-0.5 rounded-full inline-block">
                            Verified
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {existingDoctors.length === 0 && !fetchingUsers && (
                  <div className="text-center py-8 text-xs text-slate-400">
                    No users retrieved yet.
                  </div>
                )}
              </div>
            </div>

            {/* Quick RBAC Reference */}
            <div className="bg-white/80 backdrop-blur-md border border-white/60 rounded-3xl p-5 text-xs space-y-2 shadow-sm">
              <h4 className="font-bold text-blue-950 text-xs flex items-center space-x-1.5">
                <ShieldCheck className="w-4 h-4 text-cyan-500" />
                <span>RBAC Policy Matrix</span>
              </h4>
              <div className="text-[11px] text-slate-500 space-y-1.5 leading-relaxed">
                <div>&bull; <strong className="text-blue-900">ADMIN:</strong> User provisioning, global traffic logs, security rules.</div>
                <div>&bull; <strong className="text-blue-900">DOCTOR:</strong> Patient admission, MRI scan requests, emergency DSCP tagging.</div>
                <div>&bull; <strong className="text-blue-900">RADIOLOGIST:</strong> PACS study inspection, DICOM image queue.</div>
              </div>
            </div>

          </div>

        </div>
      )}

    </div>
  );
}
