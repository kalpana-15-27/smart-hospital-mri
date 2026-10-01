import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export const DEMO_USERS = [
  {
    username: 'dr_sharma',
    name: 'Dr. Sarah Sharma, MD',
    role: 'DOCTOR',
    department: 'Emergency Medicine & Trauma Center',
    badge: 'Emergency Physician (Authorized ToS/DSCP Setter)'
  },
  {
    username: 'dr_patel',
    name: 'Dr. Rajesh Patel, MD, FRCR',
    role: 'RADIOLOGIST',
    department: 'Diagnostic Radiology & PACS Core',
    badge: 'Radiology Specialist (DICOM Consumer)'
  },
  {
    username: 'netadmin_kumar',
    name: 'Anand Kumar, CCNP',
    role: 'NETWORK_ADMIN',
    department: 'Healthcare IT & Core Networks',
    badge: 'Network Administrator (L3 QoS & Router Control)'
  },
  {
    username: 'admin_dave',
    name: 'Hospital Systems Administrator',
    role: 'ADMIN',
    department: 'Hospital Governance & IT Security',
    badge: 'Super Administrator (Full System Audit)'
  }
];

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(DEMO_USERS[0]);
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [loading, setLoading] = useState(false);

  const switchUser = async (userObj) => {
    setLoading(true);
    try {
      // Perform backend login to obtain legitimate JWT
      const res = await api.login(userObj.username, 'password123');
      localStorage.setItem('token', res.access_token);
      setToken(res.access_token);
      setCurrentUser(userObj);
    } catch (err) {
      console.warn('Fallback local demo switch:', err);
      setCurrentUser(userObj);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Attempt auto-login with default doctor on start
    switchUser(DEMO_USERS[0]);
  }, []);

  return (
    <AuthContext.Provider value={{ currentUser, setCurrentUser, switchUser, loading, demoUsers: DEMO_USERS }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
