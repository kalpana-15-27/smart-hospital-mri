import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  PlusCircle, 
  Zap, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight,
  UserPlus,
  ShieldCheck,
  Activity,
  Layers,
  Sparkles,
  Server
} from 'lucide-react';

export default function MRIRequest({ setActiveTab, setSelectedPacket, selectedPatientId }) {
  const { currentUser } = useAuth();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [createdOrder, setCreatedOrder] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [showNewPatientModal, setShowNewPatientModal] = useState(false);

  // New Patient Quick Form State
  const [newPatient, setNewPatient] = useState({
    name: '',
    age: '',
    gender: 'Male',
    department: 'Emergency & Trauma',
    doctor_name: currentUser ? (currentUser.name || currentUser.username) : 'Dr. Sarah Sharma, MD',
    triage_level: 'Emergency'
  });

  const [formData, setFormData] = useState({
    patient_id: selectedPatientId || '',
    mri_type: 'Emergency Brain Trauma & Stroke Protocol',
    clinical_reason: 'Acute stroke symptoms, sudden hemiparesis. Urgent scan needed for thrombolysis decision.',
    urgency: 'EMERGENCY',
    source_ip: '192.168.10.10',
    image_size_mb: 350
  });

  const loadPatients = async () => {
    try {
      const data = await api.getPatients();
      setPatients(data);
      if (selectedPatientId) {
        setFormData(prev => ({ ...prev, patient_id: selectedPatientId }));
      } else if (data.length > 0 && !formData.patient_id) {
        setFormData(prev => ({ ...prev, patient_id: data[0].id }));
      }
    } catch (err) {
      console.error('Failed to load patients:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPatients();
  }, [selectedPatientId]);

  const handleUrgencyChange = (newUrgency) => {
    const defaultIp = newUrgency === 'EMERGENCY' ? '192.168.10.10' :
                      newUrgency === 'URGENT' ? '192.168.10.15' : '192.168.20.10';
    setFormData({
      ...formData,
      urgency: newUrgency,
      source_ip: defaultIp
    });
  };

  const handleQuickPatientSubmit = async (e) => {
    e.preventDefault();
    try {
      const created = await api.createPatient({
        ...newPatient,
        age: parseInt(newPatient.age, 10)
      });
      await loadPatients();
      setFormData(prev => ({ ...prev, patient_id: created.id }));
      setShowNewPatientModal(false);
      setNewPatient({
        name: '',
        age: '',
        gender: 'Male',
        department: 'Emergency & Trauma',
        doctor_name: currentUser ? (currentUser.name || currentUser.username) : 'Dr. Sarah Sharma, MD',
        triage_level: 'Emergency'
      });
    } catch (err) {
      alert('Error registering patient: ' + err.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg('');
    setCreatedOrder(null);

    try {
      const payload = {
        patient_id: parseInt(formData.patient_id, 10),
        mri_type: formData.mri_type,
        clinical_reason: formData.clinical_reason,
        urgency: formData.urgency,
        source_ip: formData.source_ip,
        image_size_mb: parseFloat(formData.image_size_mb)
      };

      const res = await api.createMRIRequest(payload);
      setCreatedOrder(res);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to submit MRI request');
    } finally {
      setSubmitting(false);
    }
  };

  const isEmergency = formData.urgency === 'EMERGENCY';
  const isUrgent = formData.urgency === 'URGENT';

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div className="flex items-center space-x-3.5">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-400 to-blue-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
            <PlusCircle className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-blue-950 tracking-tight">
              Order Diagnostic MRI Scan
            </h1>
            <p className="text-xs text-blue-700/70">
              Physician-authorized imaging requests with automated Layer 3 DiffServ QoS marking
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowNewPatientModal(!showNewPatientModal)}
          className="px-5 py-2.5 bg-white border border-blue-200/80 text-blue-700 hover:text-blue-950 rounded-full text-xs font-bold flex items-center space-x-2 self-start sm:self-auto transition-all shadow-sm hover:shadow"
        >
          <UserPlus className="w-4 h-4 text-cyan-500" />
          <span>{showNewPatientModal ? 'Close Drawer' : '+ Quick Admit Patient'}</span>
        </button>
      </div>

      {/* Quick Patient Admission Glass Drawer */}
      {showNewPatientModal && (
        <div className="bg-white/95 backdrop-blur-xl border border-cyan-200 rounded-[2.5rem] p-7 shadow-lg shadow-cyan-900/10 space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between border-b border-blue-100 pb-3">
            <div className="text-xs font-bold text-blue-950 flex items-center space-x-2">
              <UserPlus className="w-4 h-4 text-cyan-600" />
              <span>Quick Patient Admission</span>
            </div>
            <span className="text-[10px] text-cyan-700 font-mono font-bold bg-cyan-50 px-2.5 py-0.5 rounded-full border border-cyan-200">
              Auto-assigns to active order
            </span>
          </div>

          <form onSubmit={handleQuickPatientSubmit} className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
            <div className="sm:col-span-2">
              <label className="block text-blue-950 font-semibold mb-1.5">Patient Full Name</label>
              <input
                type="text"
                required
                placeholder="e.g. John Doe"
                value={newPatient.name}
                onChange={(e) => setNewPatient({ ...newPatient, name: e.target.value })}
                className="w-full bg-white/70 border border-blue-100 rounded-2xl px-4 py-2.5 text-blue-950 placeholder:text-blue-300 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:bg-white transition-all font-medium"
              />
            </div>
            <div>
              <label className="block text-blue-950 font-semibold mb-1.5">Age</label>
              <input
                type="number"
                required
                min="0"
                max="125"
                placeholder="e.g. 48"
                value={newPatient.age}
                onChange={(e) => setNewPatient({ ...newPatient, age: e.target.value })}
                className="w-full bg-white/70 border border-blue-100 rounded-2xl px-4 py-2.5 text-blue-950 placeholder:text-blue-300 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:bg-white transition-all font-mono font-medium"
              />
            </div>
            <div>
              <label className="block text-blue-950 font-semibold mb-1.5">Triage Level</label>
              <select
                value={newPatient.triage_level}
                onChange={(e) => setNewPatient({ ...newPatient, triage_level: e.target.value })}
                className="w-full bg-white/70 border border-blue-100 rounded-2xl px-4 py-2.5 text-blue-950 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:bg-white transition-all font-medium cursor-pointer"
              >
                <option value="Emergency">Emergency</option>
                <option value="Urgent">Urgent</option>
                <option value="Standard">Standard</option>
              </select>
            </div>

            <div className="sm:col-span-4 flex justify-end">
              <button
                type="submit"
                className="px-6 py-2.5 bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-500 hover:to-blue-600 text-white rounded-full font-bold text-xs transition-all shadow-md shadow-blue-500/25"
              >
                Save & Select Patient
              </button>
            </div>
          </form>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl text-xs flex items-center space-x-3 shadow-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-500" />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Order Form (7 Cols Glass Card) */}
        <div className="lg:col-span-7 bg-white/90 backdrop-blur-xl border border-white/60 rounded-[2.5rem] p-7 sm:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] shadow-blue-900/10 space-y-5">
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            
            {/* Patient Select */}
            <div>
              <label className="block text-blue-950 font-semibold mb-1.5">Select Patient</label>
              <select
                value={formData.patient_id}
                onChange={(e) => setFormData({ ...formData, patient_id: e.target.value })}
                className="w-full bg-white/70 border border-blue-100 rounded-2xl px-4 py-3 text-blue-950 font-medium focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:bg-white transition-all cursor-pointer"
              >
                {patients.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.patient_id} — {p.name} ({p.department}, {p.age}y)
                  </option>
                ))}
              </select>
            </div>

            {/* Urgency Selector - 3 Interactive Glowing Soft Glass Cards */}
            <div>
              <label className="block text-blue-950 font-semibold mb-2">
                Urgency Level & Priority Classification
              </label>
              <div className="grid grid-cols-3 gap-3">
                
                {/* Emergency (Glowing Rose Glass Card) */}
                <button
                  type="button"
                  onClick={() => handleUrgencyChange('EMERGENCY')}
                  className={`p-4 rounded-2xl border text-left transition-all duration-300 transform hover:-translate-y-1.5 hover:scale-[1.02] relative overflow-hidden ${
                    isEmergency
                      ? 'bg-rose-50/90 border-rose-300 ring-2 ring-rose-500 shadow-xl shadow-rose-500/25 -translate-y-0.5'
                      : 'bg-white/60 hover:bg-white border-blue-100 hover:border-rose-200 hover:ring-2 hover:ring-rose-400/50 hover:shadow-lg hover:shadow-rose-500/15 text-slate-600'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className={`font-bold tracking-tight text-xs ${isEmergency ? 'text-rose-700' : 'text-slate-700'}`}>
                      EMERGENCY
                    </span>
                    <span className={`w-2.5 h-2.5 rounded-full ${
                      isEmergency ? 'bg-rose-500 animate-pulse ring-2 ring-rose-200' : 'bg-slate-300'
                    }`}></span>
                  </div>
                  <div className={`text-[10px] font-mono font-semibold ${isEmergency ? 'text-rose-900' : 'text-slate-500'}`}>
                    Fast Lane (DSCP 46)
                  </div>
                  <div className={`text-[9px] mt-1 font-mono ${isEmergency ? 'text-rose-600' : 'text-slate-400'}`}>
                    Expedited Forwarding
                  </div>
                </button>

                {/* Urgent (Glowing Amber Glass Card) */}
                <button
                  type="button"
                  onClick={() => handleUrgencyChange('URGENT')}
                  className={`p-4 rounded-2xl border text-left transition-all duration-300 transform hover:-translate-y-1.5 hover:scale-[1.02] relative overflow-hidden ${
                    isUrgent
                      ? 'bg-amber-50/90 border-amber-300 ring-2 ring-amber-500 shadow-xl shadow-amber-500/25 -translate-y-0.5'
                      : 'bg-white/60 hover:bg-white border-blue-100 hover:border-amber-200 hover:ring-2 hover:ring-amber-400/50 hover:shadow-lg hover:shadow-amber-500/15 text-slate-600'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className={`font-bold tracking-tight text-xs ${isUrgent ? 'text-amber-700' : 'text-slate-700'}`}>
                      URGENT
                    </span>
                    <span className={`w-2.5 h-2.5 rounded-full ${
                      isUrgent ? 'bg-amber-500 animate-pulse ring-2 ring-amber-200' : 'bg-slate-300'
                    }`}></span>
                  </div>
                  <div className={`text-[10px] font-mono font-semibold ${isUrgent ? 'text-amber-900' : 'text-slate-500'}`}>
                    ICU Lane (DSCP 34)
                  </div>
                  <div className={`text-[9px] mt-1 font-mono ${isUrgent ? 'text-amber-600' : 'text-slate-400'}`}>
                    Assured Forwarding AF41
                  </div>
                </button>

                {/* Normal (Glowing Cyan Glass Card) */}
                <button
                  type="button"
                  onClick={() => handleUrgencyChange('NORMAL')}
                  className={`p-4 rounded-2xl border text-left transition-all duration-300 transform hover:-translate-y-1.5 hover:scale-[1.02] relative overflow-hidden ${
                    formData.urgency === 'NORMAL'
                      ? 'bg-cyan-50/90 border-cyan-300 ring-2 ring-cyan-500 shadow-xl shadow-cyan-500/25 -translate-y-0.5'
                      : 'bg-white/60 hover:bg-white border-blue-100 hover:border-cyan-200 hover:ring-2 hover:ring-cyan-400/50 hover:shadow-lg hover:shadow-cyan-500/15 text-slate-600'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className={`font-bold tracking-tight text-xs ${formData.urgency === 'NORMAL' ? 'text-cyan-700' : 'text-slate-700'}`}>
                      NORMAL
                    </span>
                    <span className={`w-2.5 h-2.5 rounded-full ${
                      formData.urgency === 'NORMAL' ? 'bg-cyan-500 animate-pulse ring-2 ring-cyan-200' : 'bg-slate-300'
                    }`}></span>
                  </div>
                  <div className={`text-[10px] font-mono font-semibold ${formData.urgency === 'NORMAL' ? 'text-cyan-900' : 'text-slate-500'}`}>
                    Standard (DSCP 0)
                  </div>
                  <div className={`text-[9px] mt-1 font-mono ${formData.urgency === 'NORMAL' ? 'text-cyan-600' : 'text-slate-400'}`}>
                    Best Effort FIFO
                  </div>
                </button>

              </div>
            </div>

            {/* Scan Protocol */}
            <div>
              <label className="block text-blue-950 font-semibold mb-1.5">Scan Protocol & DICOM Volume</label>
              <select
                value={formData.mri_type}
                onChange={(e) => setFormData({ ...formData, mri_type: e.target.value })}
                className="w-full bg-white/70 hover:bg-white border border-blue-100 hover:border-cyan-200 hover:ring-2 hover:ring-cyan-400/30 rounded-2xl px-4 py-3 text-blue-950 font-medium focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:bg-white transition-all cursor-pointer"
              >
                <option value="Emergency Brain Trauma & Stroke Protocol">Emergency Brain Trauma & Stroke Protocol (350 MB)</option>
                <option value="Cardiac Stress & Viability MRI">Cardiac Stress & Viability MRI (280 MB)</option>
                <option value="Spine Multi-Planar MRI">Spine Multi-Planar MRI (240 MB)</option>
                <option value="Abdominal Contrast MRI">Abdominal Contrast MRI (320 MB)</option>
                <option value="General Outpatient Knee MRI">General Outpatient Knee MRI (200 MB)</option>
              </select>
            </div>

            {/* Clinical Reason */}
            <div>
              <label className="block text-blue-950 font-semibold mb-1.5">Clinical Reason & Observations</label>
              <textarea
                rows={2}
                required
                value={formData.clinical_reason}
                onChange={(e) => setFormData({ ...formData, clinical_reason: e.target.value })}
                className="w-full bg-white/70 hover:bg-white border border-blue-100 hover:border-cyan-200 hover:ring-2 hover:ring-cyan-400/30 rounded-2xl px-4 py-3 text-blue-950 placeholder:text-blue-300 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:bg-white transition-all font-medium"
              />
            </div>

            {/* Submit Button (Pill Styled with Hover Float & Glow) */}
            <button
              type="submit"
              disabled={submitting}
              className={`w-full py-3.5 rounded-full font-bold transition-all duration-300 transform hover:-translate-y-1 hover:scale-[1.01] active:scale-95 flex items-center justify-center space-x-2 mt-2 text-white shadow-lg ${
                isEmergency 
                  ? 'bg-gradient-to-r from-rose-500 to-rose-600 shadow-rose-500/25 hover:shadow-2xl hover:shadow-rose-500/50 hover:ring-2 hover:ring-rose-300' 
                  : isUrgent 
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 shadow-amber-500/25 hover:shadow-2xl hover:shadow-amber-500/50 hover:ring-2 hover:ring-amber-300' 
                  : 'bg-gradient-to-r from-cyan-400 to-blue-500 shadow-blue-500/25 hover:shadow-2xl hover:shadow-cyan-500/50 hover:ring-2 hover:ring-cyan-300'
              }`}
            >
              <Zap className="w-4 h-4 animate-pulse" />
              <span>{submitting ? 'Scheduling Scan...' : `Schedule ${formData.urgency} Scan`}</span>
            </button>

          </form>
        </div>

        {/* Streamlined Live Routing Preview (5 Cols Glass Card) */}
        <div className="lg:col-span-5 space-y-4">
          
          <div className="bg-white/90 backdrop-blur-xl border border-white/60 rounded-[2.5rem] p-7 shadow-[0_8px_30px_rgb(0,0,0,0.04)] shadow-blue-900/10 space-y-4">
            
            <div className="flex items-center justify-between border-b border-blue-100 pb-3">
              <span className="text-xs font-bold text-blue-950 uppercase tracking-wider font-mono flex items-center space-x-2">
                <Layers className="w-4 h-4 text-cyan-600" />
                <span>Layer 3 QoS Telemetry</span>
              </span>
              <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full font-mono ${
                isEmergency 
                  ? 'bg-rose-100 text-rose-700 border border-rose-200' :
                isUrgent 
                  ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                  'bg-cyan-100 text-cyan-800 border border-cyan-200'
              }`}>
                {isEmergency ? 'FAST LANE' : isUrgent ? 'URGENT LANE' : 'STANDARD'}
              </span>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="bg-blue-50/70 p-3.5 rounded-2xl border border-blue-100 flex items-center justify-between">
                <span className="text-slate-500">Assigned DiffServ:</span>
                <span className="font-mono font-bold text-blue-950">
                  {isEmergency ? 'DSCP 46 (EF - Expedited)' : isUrgent ? 'DSCP 34 (AF41 - Assured)' : 'DSCP 0 (CS0 - Best Effort)'}
                </span>
              </div>

              <div className="bg-blue-50/70 p-3.5 rounded-2xl border border-blue-100 flex items-center justify-between">
                <span className="text-slate-500">Router Queuing:</span>
                <span className="font-semibold text-emerald-700 font-mono text-[11px]">
                  {isEmergency ? 'Strict Priority Queue (SPQ)' : isUrgent ? 'CBWFQ 30% Bandwidth' : 'Standard FIFO Fair-Share'}
                </span>
              </div>

              <div className="bg-blue-50/70 p-3.5 rounded-2xl border border-blue-100 flex items-center justify-between">
                <span className="text-slate-500">PACS Gateway:</span>
                <span className="font-mono text-cyan-700 font-semibold">192.168.30.10:104</span>
              </div>
            </div>

            <div className="text-[11px] text-slate-500 leading-relaxed bg-blue-50/50 p-3.5 rounded-2xl border border-blue-100">
              {isEmergency
                ? 'Emergency scans bypass routine queue delays, guaranteeing instantaneous transmission to the Radiologist workstation even under heavy simulated network congestion.'
                : 'Routine diagnostic transfers share remaining bandwidth equitably without degrading emergency medical pathways.'}
            </div>

          </div>

          {/* Success Card */}
          {createdOrder && (
            <div className="bg-white/90 backdrop-blur-xl border border-emerald-300 rounded-[2.5rem] p-6 space-y-3 shadow-md shadow-emerald-500/10 animate-in fade-in duration-300">
              <div className="flex items-center justify-between text-xs text-emerald-700 font-bold">
                <span className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Study Queued in PACS</span>
                </span>
                <span className="font-mono text-blue-950 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-100">
                  {createdOrder.request_id}
                </span>
              </div>

              <p className="text-xs text-slate-600">
                Study placed in <strong className="text-emerald-700 font-mono">{createdOrder.queue_assigned}</strong>.
              </p>

              <button
                onClick={() => setActiveTab('dashboard')}
                className="w-full mt-2 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-full text-xs font-bold flex items-center justify-center space-x-2 transition shadow-md shadow-emerald-500/20"
              >
                <span>View in Queue</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
