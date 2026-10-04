import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  UserPlus, 
  Users, 
  CheckCircle2, 
  AlertCircle, 
  Search, 
  ArrowRight,
  Stethoscope,
  Activity,
  Heart,
  Thermometer,
  ShieldCheck,
  Building2,
  Calendar,
  FileText
} from 'lucide-react';

export default function PatientRegistration({ setActiveTab, onSelectPatient }) {
  const { currentUser } = useAuth();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [lastRegistered, setLastRegistered] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: 'Male',
    department: 'Emergency Medicine & Trauma',
    doctor_name: currentUser ? (currentUser.name || currentUser.username) : 'Dr. Sarah Sharma, MD',
    triage_level: 'Emergency',
    vitals_summary: 'BP: 145/95, HR: 98 bpm, Acute Stroke Suspicion'
  });

  const loadPatients = async () => {
    try {
      const data = await api.getPatients();
      setPatients(data);
    } catch (err) {
      console.error('Failed to load patients:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPatients();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg('');
    setLastRegistered(null);

    try {
      const payload = {
        ...formData,
        age: parseInt(formData.age, 10)
      };
      const res = await api.createPatient(payload);
      setLastRegistered(res);
      setFormData({
        name: '',
        age: '',
        gender: 'Male',
        department: 'Emergency Medicine & Trauma',
        doctor_name: currentUser ? (currentUser.name || currentUser.username) : 'Dr. Sarah Sharma, MD',
        triage_level: 'Emergency',
        vitals_summary: ''
      });
      await loadPatients();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to register patient');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOrderForPatient = (patient) => {
    if (onSelectPatient) {
      onSelectPatient(patient.id);
    } else {
      setActiveTab('order');
    }
  };

  const filteredPatients = patients.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.patient_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.department.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div className="flex items-center space-x-3.5">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-400 to-blue-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
            <UserPlus className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-blue-950 tracking-tight">
              Patient Registration & Clinical Triage
            </h1>
            <p className="text-xs text-blue-700/70">
              Admit patients into hospital workflow before assigning prioritized diagnostic imaging
            </p>
          </div>
        </div>

        {/* Quick Triage Stats Pill Badge */}
        <div className="flex items-center space-x-3">
          <div className="bg-white/90 backdrop-blur-xl border border-white/60 rounded-full px-4 py-2 flex items-center space-x-2 text-xs shadow-sm shadow-blue-900/5">
            <span className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse"></span>
            <span className="text-slate-500 font-mono text-[11px]">Total Admitted:</span>
            <span className="text-blue-950 font-bold font-mono text-sm">{patients.length}</span>
          </div>
        </div>
      </div>

      {/* Health Vitals Quick Preview Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* Heart Rate / Vitals */}
        <div className="bg-white/90 backdrop-blur-xl border border-white/60 rounded-[2.5rem] p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] shadow-blue-900/10 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">Triage Level 1</span>
            <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center">
              <Heart className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-3xl font-bold text-blue-950 font-mono">
              {patients.filter(p => p.triage_level === 'Emergency').length}
            </span>
            <span className="text-xs text-rose-600 font-mono font-bold">Emergency</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center space-x-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
            <span>Immediate L3 QoS (DSCP 46)</span>
          </div>
        </div>

        {/* Urgent ICU */}
        <div className="bg-white/90 backdrop-blur-xl border border-white/60 rounded-[2.5rem] p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] shadow-blue-900/10 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">Triage Level 2</span>
            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-3xl font-bold text-blue-950 font-mono">
              {patients.filter(p => p.triage_level === 'Urgent').length}
            </span>
            <span className="text-xs text-amber-700 font-mono font-bold">Urgent / ICU</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center space-x-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
            <span>AF41 Guaranteed (DSCP 34)</span>
          </div>
        </div>

        {/* Standard / Routine */}
        <div className="bg-white/90 backdrop-blur-xl border border-white/60 rounded-[2.5rem] p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] shadow-blue-900/10 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">Triage Level 3</span>
            <div className="w-8 h-8 rounded-xl bg-cyan-100 text-cyan-600 flex items-center justify-center">
              <Thermometer className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-3xl font-bold text-blue-950 font-mono">
              {patients.filter(p => p.triage_level === 'Standard').length}
            </span>
            <span className="text-xs text-cyan-700 font-mono font-bold">Routine</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center space-x-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-500"></span>
            <span>Best Effort CS0 (DSCP 0)</span>
          </div>
        </div>

        {/* Security / VLAN Status */}
        <div className="bg-white/90 backdrop-blur-xl border border-white/60 rounded-[2.5rem] p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] shadow-blue-900/10 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">Trusted Subnet</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-2xl font-bold text-blue-950 font-mono">VLAN 10</span>
            <span className="text-xs text-emerald-600 font-mono font-bold">Verified</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1 font-mono">192.168.10.0/24 Subnet</div>
        </div>
      </div>

      {/* Success Notification with instant action */}
      {lastRegistered && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-[2rem] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in duration-300">
          <div className="flex items-center space-x-3 text-xs text-emerald-800">
            <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 flex-shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <div className="text-emerald-950 font-bold text-sm">Patient Registered Successfully!</div>
              <div className="text-emerald-800 text-xs">
                Patient <strong>{lastRegistered.name}</strong> assigned ID: <span className="font-mono text-cyan-700 font-bold">{lastRegistered.patient_id}</span> ({lastRegistered.department})
              </div>
            </div>
          </div>

          <button
            onClick={() => handleOrderForPatient(lastRegistered)}
            className="px-5 py-2.5 bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-500 hover:to-blue-600 text-white rounded-full text-xs font-bold flex items-center space-x-2 self-start sm:self-auto transition-all shadow-md shadow-blue-500/20"
          >
            <span>Proceed to Order MRI Scan</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl text-xs flex items-center space-x-3 shadow-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-500" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Main Grid: Form (5 Cols) + Directory Table (7 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Admission Form (Soft Glass Card) */}
        <div className="lg:col-span-5 bg-white/90 backdrop-blur-xl border border-white/60 rounded-[2.5rem] p-7 shadow-[0_8px_30px_rgb(0,0,0,0.04)] shadow-blue-900/10 space-y-5">
          <div className="flex items-center justify-between border-b border-blue-100 pb-3">
            <div className="text-sm font-bold text-blue-950 flex items-center space-x-2">
              <Stethoscope className="w-4 h-4 text-cyan-600" />
              <span>Admit New Patient</span>
            </div>
            <span className="text-[10px] font-mono text-blue-700 bg-blue-100/70 px-2.5 py-0.5 rounded-full font-bold">
              HL7/FHIR Intake
            </span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block text-blue-950 font-semibold mb-1.5">Patient Full Name</label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Robert Thorne"
                className="w-full bg-white/70 border border-blue-100 rounded-2xl px-4 py-3 text-blue-950 placeholder:text-blue-300 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:bg-white transition-all font-medium"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-blue-950 font-semibold mb-1.5">Age</label>
                <input
                  type="number"
                  name="age"
                  required
                  min="0"
                  max="125"
                  value={formData.age}
                  onChange={handleChange}
                  placeholder="e.g. 54"
                  className="w-full bg-white/70 border border-blue-100 rounded-2xl px-4 py-3 text-blue-950 placeholder:text-blue-300 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:bg-white transition-all font-mono font-medium"
                />
              </div>
              <div>
                <label className="block text-blue-950 font-semibold mb-1.5">Gender</label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="w-full bg-white/70 border border-blue-100 rounded-2xl px-4 py-3 text-blue-950 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:bg-white transition-all font-medium cursor-pointer"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-blue-950 font-semibold mb-1.5">Hospital Department</label>
              <select
                name="department"
                value={formData.department}
                onChange={handleChange}
                className="w-full bg-white/70 border border-blue-100 rounded-2xl px-4 py-3 text-blue-950 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:bg-white transition-all font-medium cursor-pointer"
              >
                <option value="Emergency Medicine & Trauma">Emergency Medicine & Trauma (VLAN 10)</option>
                <option value="Intensive Care Unit (ICU)">Intensive Care Unit (ICU) (VLAN 10)</option>
                <option value="Neurology / Stroke Center">Neurology / Stroke Center (VLAN 10)</option>
                <option value="Orthopedics & Spine">Orthopedics & Spine (VLAN 20)</option>
                <option value="Outpatient Radiology">Outpatient Radiology (VLAN 20)</option>
                <option value="Cardiology">Cardiology (VLAN 20)</option>
              </select>
            </div>

            <div>
              <label className="block text-blue-950 font-semibold mb-1.5">Assigned Physician</label>
              <input
                type="text"
                name="doctor_name"
                required
                value={formData.doctor_name}
                onChange={handleChange}
                placeholder="Dr. Physician Name"
                className="w-full bg-white/70 border border-blue-100 rounded-2xl px-4 py-3 text-blue-950 placeholder:text-blue-300 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:bg-white transition-all font-medium"
              />
            </div>

            <div>
              <label className="block text-blue-950 font-semibold mb-1.5">Triage Urgency</label>
              <select
                name="triage_level"
                value={formData.triage_level}
                onChange={handleChange}
                className="w-full bg-white/70 border border-blue-100 rounded-2xl px-4 py-3 text-blue-950 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:bg-white transition-all font-bold cursor-pointer"
              >
                <option value="Emergency" className="text-rose-600 font-bold">Emergency / Level 1 (DSCP 46)</option>
                <option value="Urgent" className="text-amber-600 font-bold">Urgent / Level 2 (DSCP 34)</option>
                <option value="Standard" className="text-cyan-700 font-bold">Standard / Routine (DSCP 0)</option>
              </select>
            </div>

            <div>
              <label className="block text-blue-950 font-semibold mb-1.5">Clinical Vitals & Symptoms</label>
              <input
                type="text"
                name="vitals_summary"
                value={formData.vitals_summary}
                onChange={handleChange}
                placeholder="e.g. BP: 150/95, Acute headache, GCS: 12"
                className="w-full bg-white/70 border border-blue-100 rounded-2xl px-4 py-3 text-blue-950 placeholder:text-blue-300 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:bg-white transition-all font-mono text-[11px]"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-500 hover:to-blue-600 text-white rounded-full font-bold shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all flex items-center justify-center space-x-2 mt-2 disabled:opacity-50"
            >
              <UserPlus className="w-4 h-4" />
              <span>{submitting ? 'Registering Patient...' : 'Register & Admit Patient'}</span>
            </button>
          </form>
        </div>

        {/* Directory Table (Soft Glass Card with Overflow) */}
        <div className="lg:col-span-7 bg-white/90 backdrop-blur-xl border border-white/60 rounded-[2.5rem] p-7 shadow-[0_8px_30px_rgb(0,0,0,0.04)] shadow-blue-900/10 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-blue-100 pb-3">
              <div className="text-sm font-bold text-blue-950 flex items-center space-x-2">
                <Users className="w-4 h-4 text-cyan-600" />
                <span>Admitted Patients Directory</span>
                <span className="bg-blue-100 text-blue-700 text-[10px] px-2.5 py-0.5 rounded-full font-mono font-bold">
                  {patients.length} records
                </span>
              </div>
              
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-blue-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  placeholder="Search patient, ID, dept..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-white/70 border border-blue-100 rounded-xl pl-9 pr-3.5 py-2 text-xs text-blue-950 placeholder:text-blue-300 focus:outline-none focus:ring-2 focus:ring-cyan-400 w-full sm:w-56 transition-all font-medium"
                />
              </div>
            </div>

            <div className="overflow-x-auto max-h-[460px] rounded-2xl border border-blue-100">
              <table className="w-full text-left text-xs">
                <thead className="bg-blue-50/80 text-blue-900/70 uppercase font-mono text-[10px] tracking-wider sticky top-0 border-b border-blue-100 backdrop-blur-md">
                  <tr>
                    <th className="py-3 px-3.5">Patient ID</th>
                    <th className="py-3 px-3.5">Name & Details</th>
                    <th className="py-3 px-3.5">Triage Level</th>
                    <th className="py-3 px-3.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-blue-50 font-sans">
                  {filteredPatients.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="py-8 text-center text-slate-400">
                        No admitted patients found.
                      </td>
                    </tr>
                  ) : (
                    filteredPatients.map((p) => (
                      <tr key={p.id} className="hover:bg-blue-50/60 transition-all">
                        <td className="py-3 px-3.5 font-mono font-bold text-cyan-700 text-xs">
                          {p.patient_id}
                        </td>
                        <td className="py-3 px-3.5">
                          <div className="font-bold text-blue-950 tracking-tight">{p.name}</div>
                          <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                            {p.age}y &bull; {p.gender} &bull; <span className="text-blue-700">{p.department}</span>
                          </div>
                        </td>
                        <td className="py-3 px-3.5">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono inline-flex items-center space-x-1.5 ${
                            p.triage_level === 'Emergency' 
                              ? 'bg-rose-100 text-rose-700 border border-rose-200' :
                            p.triage_level === 'Urgent' 
                              ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                              'bg-cyan-100 text-cyan-800 border border-cyan-200'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${
                              p.triage_level === 'Emergency' ? 'bg-rose-500 animate-pulse' :
                              p.triage_level === 'Urgent' ? 'bg-amber-500' : 'bg-cyan-500'
                            }`}></span>
                            <span>{p.triage_level}</span>
                          </span>
                        </td>
                        <td className="py-3 px-3.5 text-right">
                          <button
                            onClick={() => handleOrderForPatient(p)}
                            className="px-3.5 py-1.5 bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-500 hover:to-blue-600 text-white rounded-full text-[11px] font-bold transition-all inline-flex items-center space-x-1.5 shadow-sm shadow-blue-500/20"
                          >
                            <span>Order MRI</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
