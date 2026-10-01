import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import NotificationBanner from './components/NotificationBanner';
import OsiPacketModal from './components/OsiPacketModal';

// Streamlined Pages
import Dashboard from './pages/Dashboard';
import PatientRegistration from './pages/PatientRegistration';
import MRIRequest from './pages/MRIRequest';
import QoSDashboard from './pages/QoSDashboard';
import OsiInspector from './pages/OsiInspector';
import CyberSecurityLogs from './pages/CyberSecurityLogs';

function MainLayout() {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedPacket, setSelectedPacket] = useState(null);
  const [selectedPatientId, setSelectedPatientId] = useState(null);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Sleek Status Strip */}
      <NotificationBanner />

      {/* Top Navbar */}
      <Navbar />

      {/* Main Layout Container */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        
        {/* Streamlined 6-Tab Sidebar */}
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* Dynamic Page Views */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {activeTab === 'dashboard' && (
            <Dashboard setActiveTab={setActiveTab} setSelectedPacket={setSelectedPacket} />
          )}
          {activeTab === 'patients' && (
            <PatientRegistration 
              setActiveTab={setActiveTab} 
              onSelectPatient={(pId) => {
                setSelectedPatientId(pId);
                setActiveTab('order');
              }}
            />
          )}
          {activeTab === 'order' && (
            <MRIRequest 
              setActiveTab={setActiveTab} 
              setSelectedPacket={setSelectedPacket} 
              selectedPatientId={selectedPatientId}
            />
          )}
          {activeTab === 'speedtest' && (
            <QoSDashboard />
          )}
          {activeTab === 'visualizer' && (
            <OsiInspector />
          )}
          {activeTab === 'security' && (
            <CyberSecurityLogs />
          )}
        </main>
      </div>

      {/* Universal OSI Packet Dissection Modal */}
      {selectedPacket && (
        <OsiPacketModal 
          packet={selectedPacket} 
          onClose={() => setSelectedPacket(null)} 
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainLayout />
    </AuthProvider>
  );
}
