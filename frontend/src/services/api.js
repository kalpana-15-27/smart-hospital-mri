const API_BASE = '/api/v1';

async function fetchWithAuth(url, options = {}) {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...(options.headers || {})
  };

  const response = await fetch(`${API_BASE}${url}`, {
    ...options,
    headers
  });

  if (!response.ok) {
    let errorDetail = 'API request failed';
    try {
      const errJson = await response.json();
      errorDetail = errJson.detail || JSON.stringify(errJson);
    } catch (e) {
      errorDetail = response.statusText;
    }
    throw new Error(errorDetail);
  }

  return response.json();
}

export const api = {
  // Auth
  login: (username, password) => 
    fetchWithAuth('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password })
    }),
  getCurrentUser: () => fetchWithAuth('/auth/me'),
  getUsers: () => fetchWithAuth('/auth/users'),

  // Patients
  getPatients: () => fetchWithAuth('/patients'),
  getPatient: (id) => fetchWithAuth(`/patients/${id}`),
  createPatient: (data) => 
    fetchWithAuth('/patients', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  // MRI
  getMRIQueue: () => fetchWithAuth('/mri/queue'),
  getMRIRequest: (id) => fetchWithAuth(`/mri/${id}`),
  createMRIRequest: (data) => 
    fetchWithAuth('/mri/request', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
  transmitStudy: (id, { background_traffic_mbps, enable_qos }) => 
    fetchWithAuth(`/mri/${id}/transmit`, {
      method: 'POST',
      body: JSON.stringify({ background_traffic_mbps, enable_qos })
    }),
  updatePriority: (id, urgency) => 
    fetchWithAuth(`/mri/${id}/priority?urgency=${urgency}`, {
      method: 'POST'
    }),

  // Network & Devices
  getDevices: () => fetchWithAuth('/network/devices'),
  getQoSEvents: (limit = 50) => fetchWithAuth(`/network/qos-events?limit=${limit}`),
  getMetrics: (limit = 50) => fetchWithAuth(`/network/metrics?limit=${limit}`),
  sendProbe: (dest_ip, port, dscp_value) => 
    fetchWithAuth(`/network/probe?dest_ip=${dest_ip}&port=${port}&dscp_value=${dscp_value}`, {
      method: 'POST'
    }),

  // Analytics & Dashboards
  getStats: () => fetchWithAuth('/analytics/stats'),
  getComparison: () => fetchWithAuth('/analytics/comparison'),
  getDscpDistribution: () => fetchWithAuth('/analytics/dscp-distribution'),

  // Audit Logs
  getAuditLogs: (limit = 100) => fetchWithAuth(`/audit/logs?limit=${limit}`),

  // Simulation & Attacks
  runCongestionSuite: () => fetchWithAuth('/simulation/run-congestion-suite', { method: 'POST' }),
  testDscpSpoof: (source_ip, attempted_dscp) => 
    fetchWithAuth(`/simulation/dscpspoof-test?source_ip=${source_ip}&attempted_dscp=${attempted_dscp}`, { method: 'POST' })
};
