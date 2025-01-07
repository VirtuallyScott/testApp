import axios from 'axios';

const API_URL = '/api/v1';

// Add request interceptor to include auth token
axios.interceptors.request.use(config => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add response interceptor to handle 401 errors
axios.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const fetchHealthStatus = async () => {
  const response = await axios.get(`${API_URL}/health`);
  return response.data;
};

export const fetchReadinessStatus = async () => {
  const response = await axios.get(`${API_URL}/ready`);
  return response.data;
};

export const fetchVersion = async () => {
  const response = await axios.get(`${API_URL}/version`);
  return response.data;
};
