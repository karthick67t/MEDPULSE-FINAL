import axios from 'axios';

// Port 8001 is the local development API. Deployments override this through
// VITE_API_URL, so no environment-specific address is baked into production.
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8001';

const api = axios.create({ baseURL: API_URL, timeout: 15000 });

export const fetchDashboardSummary = async (params = {}) => {
  const response = await api.get('/dashboard/summary', { params });
  return response.data;
};

export const fetchPatients = async (skip = 0, limit = 100, params = {}) => {
  const response = await api.get('/patients', { params: { skip, limit, ...params } });
  return response.data;
};

export const fetchPatientCount = async (params = {}) => {
  const response = await api.get('/patients/count', { params });
  return response.data;
};

export const fetchPatientDetails = async (patientId) => {
  const response = await api.get(`/patients/${patientId}`);
  return response.data;
};

export const fetchPatientExplanation = async (patientId) => {
  const response = await api.get(`/patients/${patientId}/explanation`);
  return response.data;
};

export const fetchPatientRecommendations = async (patientId) => {
  const response = await api.get(`/patients/${patientId}/recommendations`);
  return response.data;
};

export const fetchPatientInterventions = async (patientId) => {
  const response = await api.get(`/patients/${patientId}/interventions`);
  return response.data;
};

export const createIntervention = async (patientId, interventionData) => {
  const response = await api.post(`/patients/${patientId}/interventions`, interventionData);
  return response.data;
};

export const updateInterventionStatus = async (interventionId, updateData) => {
  const response = await api.patch(`/interventions/${interventionId}`, updateData);
  return response.data;
};

export const queueReminder = async (patientId, channel) => {
  const response = await api.post(`/patients/${patientId}/reminders`, null, { params: { channel } });
  return response.data;
};

export const fetchOperationsCalendar = async () => {
  const response = await api.get('/operations/calendar');
  return response.data;
};

export const fetchOperationsAnalytics = async () => {
  const response = await api.get('/operations/analytics');
  return response.data;
};

export const fetchModelMetrics = async () => {
  const response = await api.get('/model/metrics');
  return response.data;
};

export const fetchFairnessMetrics = async () => {
  const response = await api.get('/model/fairness');
  return response.data;
};

export const checkHealth = async () => {
  const response = await api.get('/health');
  return response.data;
};

export default api;
