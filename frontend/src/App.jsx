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
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import HireADoc from './pages/HireADoc';

function MainLayout() {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedPacket, setSelectedPacket] = useState(null);
  const [selectedPatientId, setSelectedPatientId] = useState(null);

  return (
    <div className="bg-gradient-to-br from-blue-50 via-sky-100 to-blue-200 relative overflow-x-hidden min-h-screen text-slate-700 flex flex-col font-sans selection:bg-cyan-500/20 selection:text-blue-900">
      
      {/* Radiant Soft Ambient Background Colors */}
      <div className="fixed top-0 right-1/4 w-[520px] h-[520px] bg-cyan-200/40 rounded-full blur-[140px] pointer-events-none -z-0" />
      <div className="fixed bottom-10 left-10 w-[550px] h-[550px] bg-blue-300/30 rounded-full blur-[150px] pointer-events-none -z-0" />
      <div className="fixed -bottom-20 left-1/3 w-[450px] h-[450px] bg-sky-200/40 rounded-full blur-[160px] pointer-events-none -z-0" />

      {/* Status Strip */}
      <NotificationBanner />

      {/* Top Frosted Glass Navbar */}
      <Navbar />

      {/* Main Layout Container */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto relative z-10">
        
        {/* Soft Glass Sidebar with RBAC HIREADOC */}
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
          {activeTab === 'hireadoc' && (
            <HireADoc onDoctorCreated={() => {}} />
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

function AppContent() {
  const { currentUser } = useAuth();
  // View states: 'landing' | 'login'
  const [authView, setAuthView] = useState('landing');

  // If user is already authenticated, show MainLayout directly
  if (currentUser) {
    return <MainLayout />;
  }

  // If user navigated to login view, show Login page
  if (authView === 'login') {
    return (
      <Login 
        onLoginSuccess={() => setAuthView('landing')}
        onBackToLanding={() => setAuthView('landing')}
      />
    );
  }

  // Default entry point: LandingPage
  return (
    <LandingPage onEnterGateway={() => setAuthView('login')} />
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}