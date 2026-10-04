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
    let rawJson = null;
    try {
      rawJson = await response.json();
      errorDetail = rawJson.detail || JSON.stringify(rawJson);
    } catch (e) {
      errorDetail = response.statusText;
    }
    const message = typeof errorDetail === 'string' ? errorDetail : (errorDetail?.message || JSON.stringify(errorDetail));
    const err = new Error(message);
    err.status = response.status;
    err.detail = rawJson?.detail || errorDetail;
    throw err;
  }

  return response.json();
}

export const api = {
  // Auth & Admin
  login: (username, password) => 
    fetchWithAuth('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password })
    }),
  changePassword: (old_password, new_password, username) =>
    fetchWithAuth('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ old_password, new_password, username })
    }),
  adminCreateDoctor: (data) =>
    fetchWithAuth('/admin/users', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
  getCurrentUser: () => fetchWithAuth('/auth/me'),
  getUsers: () => fetchWithAuth('/auth/users'),
  submitAccessRequest: (data) =>
    fetchWithAuth('/admin/access-requests', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
  getAccessRequests: () => fetchWithAuth('/admin/access-requests'),
  reviewAccessRequest: (id, action, notes) =>
    fetchWithAuth(`/admin/access-requests/${id}/action`, {
      method: 'POST',
      body: JSON.stringify({ action, notes })
    }),

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
