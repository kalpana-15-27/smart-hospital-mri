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
  ShieldCheck
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
    doctor_name: currentUser ? currentUser.name : 'Dr. Sarah Sharma, MD',
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
        doctor_name: currentUser.name,
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
      
      {/* Clean Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-xl font-bold text-white">Order Diagnostic MRI Scan</h1>
          <p className="text-xs text-slate-400">
            Emergency scans automatically receive priority network routing.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowNewPatientModal(!showNewPatientModal)}
          className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-sky-400 hover:text-sky-300 rounded-xl text-xs font-semibold border border-slate-700 flex items-center space-x-1.5 self-start sm:self-auto transition"
        >
          <UserPlus className="w-3.5 h-3.5" />
          <span>{showNewPatientModal ? 'Close Form' : '+ Quick Admit Patient'}</span>
        </button>
      </div>

      {/* Quick Patient Admission Drawer */}
      {showNewPatientModal && (
        <div className="bg-slate-900 border border-sky-500/40 rounded-2xl p-5 shadow-2xl space-y-3 animate-fadeIn">
          <div className="text-xs font-bold text-white flex items-center space-x-2">
            <UserPlus className="w-4 h-4 text-sky-400" />
            <span>Admit New Patient</span>
          </div>

          <form onSubmit={handleQuickPatientSubmit} className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
            <div className="sm:col-span-2">
              <label className="block text-slate-400 mb-1">Patient Full Name</label>
              <input
                type="text"
                required
                placeholder="e.g. John Doe"
                value={newPatient.name}
                onChange={(e) => setNewPatient({ ...newPatient, name: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-slate-200"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">Age</label>
              <input
                type="number"
                required
                min="0"
                max="125"
                placeholder="e.g. 48"
                value={newPatient.age}
                onChange={(e) => setNewPatient({ ...newPatient, age: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-slate-200"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">Triage Level</label>
              <select
                value={newPatient.triage_level}
                onChange={(e) => setNewPatient({ ...newPatient, triage_level: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-slate-200"
              >
                <option value="Emergency">Emergency</option>
                <option value="Urgent">Urgent</option>
                <option value="Standard">Standard</option>
              </select>
            </div>

            <div className="sm:col-span-4 flex justify-end">
              <button
                type="submit"
                className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-lg font-semibold text-xs transition"
              >
                Save & Select Patient
              </button>
            </div>
          </form>
        </div>
      )}

      {errorMsg && (
        <div className="p-3 bg-rose-950/60 border border-rose-800 text-rose-300 rounded-xl text-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Order Form (7 Cols) */}
        <div className="lg:col-span-7 bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            
            {/* Patient Select */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Select Patient</label>
              <select
                value={formData.patient_id}
                onChange={(e) => setFormData({ ...formData, patient_id: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-200 font-medium focus:border-sky-500 focus:outline-none"
              >
                {patients.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.patient_id} — {p.name} ({p.department}, {p.age}y)
                  </option>
                ))}
              </select>
            </div>

            {/* Urgency Selector - 3 Clean Visual Cards */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1.5">Urgency Level</label>
              <div className="grid grid-cols-3 gap-3">
                
                {/* Emergency */}
                <button
                  type="button"
                  onClick={() => handleUrgencyChange('EMERGENCY')}
                  className={`p-3.5 rounded-xl border text-left transition ${
                    isEmergency
                      ? 'bg-rose-950/60 border-rose-500 text-white ring-1 ring-rose-500'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-rose-400">EMERGENCY</span>
                    <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
                  </div>
                  <div className="text-[10px] text-slate-300">Fast Lane (DSCP 46)</div>
                </button>

                {/* Urgent */}
                <button
                  type="button"
                  onClick={() => handleUrgencyChange('URGENT')}
                  className={`p-3.5 rounded-xl border text-left transition ${
                    isUrgent
                      ? 'bg-amber-950/60 border-amber-500 text-white ring-1 ring-amber-500'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-amber-400">URGENT</span>
                    <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                  </div>
                  <div className="text-[10px] text-slate-300">ICU Lane (DSCP 34)</div>
                </button>

                {/* Normal */}
                <button
                  type="button"
                  onClick={() => handleUrgencyChange('NORMAL')}
                  className={`p-3.5 rounded-xl border text-left transition ${
                    formData.urgency === 'NORMAL'
                      ? 'bg-sky-950/60 border-sky-500 text-white ring-1 ring-sky-500'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-sky-400">NORMAL</span>
                    <span className="w-2 h-2 rounded-full bg-sky-400"></span>
                  </div>
                  <div className="text-[10px] text-slate-300">Standard (DSCP 0)</div>
                </button>

              </div>
            </div>

            {/* Scan Protocol */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Scan Protocol</label>
              <select
                value={formData.mri_type}
                onChange={(e) => setFormData({ ...formData, mri_type: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-200"
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
              <label className="block text-slate-300 font-semibold mb-1">Clinical Reason</label>
              <textarea
                rows={2}
                required
                value={formData.clinical_reason}
                onChange={(e) => setFormData({ ...formData, clinical_reason: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-slate-200"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className={`w-full py-3 text-white font-bold rounded-xl shadow-lg transition flex items-center justify-center space-x-2 ${
                isEmergency 
                  ? 'bg-rose-600 hover:bg-rose-500 shadow-rose-600/30' 
                  : isUrgent 
                  ? 'bg-amber-600 hover:bg-amber-500 shadow-amber-600/30' 
                  : 'bg-sky-600 hover:bg-sky-500 shadow-sky-600/30'
              }`}
            >
              <Zap className="w-4 h-4" />
              <span>{submitting ? 'Scheduling Scan...' : `Schedule ${formData.urgency} Scan`}</span>
            </button>

          </form>
        </div>

        {/* Streamlined Live Routing Preview (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          
          <div className={`rounded-2xl border p-5 shadow-xl transition space-y-4 ${
            isEmergency 
              ? 'bg-rose-950/20 border-rose-500/50' 
              : isUrgent 
              ? 'bg-amber-950/20 border-amber-500/40' 
              : 'bg-slate-900 border-slate-800'
          }`}>
            
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Network Routing Preview
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full font-mono ${
                isEmergency ? 'bg-rose-500 text-white' :
                isUrgent ? 'bg-amber-500 text-slate-950' :
                'bg-sky-500/20 text-sky-400'
              }`}>
                {isEmergency ? 'FAST LANE' : isUrgent ? 'URGENT LANE' : 'STANDARD'}
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex justify-between">
                <span className="text-slate-400">Assigned Tag:</span>
                <span className="font-mono font-bold text-white">
                  {isEmergency ? 'DSCP 46 (EF)' : isUrgent ? 'DSCP 34 (AF41)' : 'DSCP 0 (CS0)'}
                </span>
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex justify-between">
                <span className="text-slate-400">Router Behavior:</span>
                <span className="font-semibold text-emerald-400">
                  {isEmergency ? 'Bypasses Network Queues' : isUrgent ? 'Guaranteed 30% Bandwidth' : 'Standard Fair Share'}
                </span>
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex justify-between">
                <span className="text-slate-400">Destination:</span>
                <span className="font-mono text-sky-300">PACS Server (192.168.30.10:104)</span>
              </div>
            </div>

            <div className="text-[11px] text-slate-400 leading-relaxed bg-slate-950/50 p-3 rounded-xl border border-slate-800/80">
              {isEmergency
                ? 'Emergency scans are given highest priority at the core router, ensuring instant delivery even during heavy traffic.'
                : 'Routine scans are scheduled fairly without impacting emergency scans.'}
            </div>

          </div>

          {/* Success Card */}
          {createdOrder && (
            <div className="bg-emerald-950/30 border border-emerald-500/50 rounded-2xl p-4 space-y-2.5 animate-fadeIn">
              <div className="flex items-center justify-between text-xs text-emerald-400 font-bold">
                <span className="flex items-center space-x-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Order Created & Queued</span>
                </span>
                <span className="font-mono text-slate-300">{createdOrder.request_id}</span>
              </div>

              <p className="text-xs text-slate-300">
                Study placed in <strong className="text-emerald-400">{createdOrder.queue_assigned}</strong>.
              </p>

              <button
                onClick={() => setActiveTab('dashboard')}
                className="w-full mt-2 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold flex items-center justify-center space-x-1.5 transition"
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
