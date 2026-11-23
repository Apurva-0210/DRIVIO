import axios from 'axios';
import { API_URL } from '../config/env';

const api = axios.create({
  baseURL: API_URL,
  timeout: 30000,
});

api.interceptors.request.use((config) => {
  const t = localStorage.getItem('token');
  if (t) config.headers.Authorization = `Bearer ${t}`;
  return config;
});

api.interceptors.response.use(
  (response) => {
    const body = response.data;
    if (
      body &&
      typeof body === 'object' &&
      !Array.isArray(body) &&
      body.success === true &&
      Object.prototype.hasOwnProperty.call(body, 'data') &&
      !Object.prototype.hasOwnProperty.call(body, 'token')
    ) {
      response.data = body.data;
    }
    return response;
  },
  (error) => {
    if (!error.response) {
      error.message =
        'Cannot reach API server at ' + API_URL + '. Ensure backend is running (port 5001).';
    }
    return Promise.reject(error);
  }
);

export async function checkApiHealth() {
  const start = Date.now();
  try {
    const res = await axios.get(`${API_URL}/health`, { timeout: 4000 });
    const latency = Date.now() - start;
    return {
      connected: true,
      latency,
      data: res.data,
      url: API_URL
    };
  } catch (err) {
    return {
      connected: false,
      latency: Date.now() - start,
      error: err.message,
      url: API_URL
    };
  }
}

export default api;
