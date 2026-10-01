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
  Stethoscope
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
    doctor_name: currentUser ? currentUser.name : 'Dr. Sarah Sharma, MD',
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
        doctor_name: currentUser ? currentUser.name : 'Dr. Sarah Sharma, MD',
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center space-x-2">
            <UserPlus className="w-5 h-5 text-sky-400" />
            <span>Patient Registration & Clinical Triage</span>
          </h1>
          <p className="text-xs text-slate-400">
            Admit patients into hospital workflow before ordering prioritized diagnostic imaging.
          </p>
        </div>
      </div>

      {/* Success Notification with instant action */}
      {lastRegistered && (
        <div className="p-4 bg-emerald-950/40 border border-emerald-500/50 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fadeIn">
          <div className="flex items-center space-x-2.5 text-xs text-emerald-300">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>
              Patient <strong>{lastRegistered.name}</strong> registered successfully with ID: <strong className="font-mono text-white">{lastRegistered.patient_id}</strong>
            </span>
          </div>

          <button
            onClick={() => handleOrderForPatient(lastRegistered)}
            className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold flex items-center space-x-1.5 self-start sm:self-auto transition shadow-lg shadow-emerald-600/20"
          >
            <span>Proceed to Order MRI Scan</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {errorMsg && (
        <div className="p-3.5 bg-rose-950/60 border border-rose-800 text-rose-300 rounded-xl text-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Form: Left 5 Cols */}
        <div className="lg:col-span-5 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="text-xs font-bold text-white flex items-center space-x-2 border-b border-slate-800 pb-3">
            <Stethoscope className="w-4 h-4 text-sky-400" />
            <span>Admit New Patient</span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Patient Full Name</label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Robert Thorne"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-sky-500 font-medium"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Age</label>
                <input
                  type="number"
                  name="age"
                  required
                  min="0"
                  max="125"
                  value={formData.age}
                  onChange={handleChange}
                  placeholder="e.g. 54"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-sky-500"
                />
              </div>
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Gender</label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-sky-500"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Hospital Department</label>
              <select
                name="department"
                value={formData.department}
                onChange={handleChange}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-sky-500"
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
              <label className="block text-slate-300 font-semibold mb-1">Assigned Physician</label>
              <input
                type="text"
                name="doctor_name"
                required
                value={formData.doctor_name}
                onChange={handleChange}
                placeholder="Dr. Physician Name"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-sky-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Triage Urgency</label>
              <select
                name="triage_level"
                value={formData.triage_level}
                onChange={handleChange}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-sky-500 font-semibold"
              >
                <option value="Emergency" className="text-rose-400">Emergency / Level 1</option>
                <option value="Urgent" className="text-amber-400">Urgent / Level 2</option>
                <option value="Standard" className="text-sky-400">Standard / Routine</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Clinical Vitals & Symptoms</label>
              <input
                type="text"
                name="vitals_summary"
                value={formData.vitals_summary}
                onChange={handleChange}
                placeholder="e.g. BP: 150/95, Acute headache, GCS: 12"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-sky-500"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-xl shadow-lg shadow-sky-600/20 transition flex items-center justify-center space-x-2"
            >
              <UserPlus className="w-4 h-4" />
              <span>{submitting ? 'Registering...' : 'Register & Admit Patient'}</span>
            </button>
          </form>
        </div>

        {/* Directory Table: Right 7 Cols */}
        <div className="lg:col-span-7 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
              <div className="text-xs font-bold text-white flex items-center space-x-2">
                <Users className="w-4 h-4 text-sky-400" />
                <span>Admitted Patients ({patients.length})</span>
              </div>
              
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search patient, ID, dept..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-sky-500 w-full sm:w-52"
                />
              </div>
            </div>

            <div className="overflow-x-auto max-h-[460px]">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-slate-400 uppercase font-mono text-[10px] sticky top-0 border-b border-slate-800">
                  <tr>
                    <th className="py-2.5 px-3">Patient ID</th>
                    <th className="py-2.5 px-3">Name & Details</th>
                    <th className="py-2.5 px-3">Triage</th>
                    <th className="py-2.5 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-sans">
                  {filteredPatients.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-800/40 transition">
                      <td className="py-3 px-3 font-mono font-bold text-sky-400 text-xs">
                        {p.patient_id}
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-semibold text-slate-200">{p.name}</div>
                        <div className="text-[10px] text-slate-400">{p.age}y {p.gender} • {p.department}</div>
                      </td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                          p.triage_level === 'Emergency' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' :
                          p.triage_level === 'Urgent' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                          'bg-sky-500/20 text-sky-400 border border-sky-500/30'
                        }`}>
                          {p.triage_level}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() => handleOrderForPatient(p)}
                          className="px-2.5 py-1 bg-sky-600/20 hover:bg-sky-600 text-sky-300 hover:text-white rounded-lg border border-sky-600/40 text-[11px] font-semibold transition inline-flex items-center space-x-1"
                        >
                          <span>Order MRI</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
