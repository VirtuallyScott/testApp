import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

export const fetchHealthStatus = async () => {
  const response = await axios.get(`${API_URL}/health`);
  return response.data;
};

export const fetchReadinessStatus = async () => {
  const response = await axios.get(`${API_URL}/ready`);
  return response.data;
};
