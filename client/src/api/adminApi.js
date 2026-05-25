import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5000/api', // Trỏ về /api gốc
  headers: { 'Content-Type': 'application/json' }
});

// Gắn token vào header cho mọi request (nếu đã đăng nhập)
API.interceptors.request.use((req) => {
  const token = localStorage.getItem('token');
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

export const adminApi = {
  login: async (credentials) => {
    return await API.post('/auth/login', credentials);
  },

  getStats: async () => {
    const res = await API.get('/admin/dashboard-stats');
    return res.data;
  },
  getUsers: async () => {
    const res = await API.get('/admin/users');
    return res.data;
  },
  updateUserStatus: async (id, status) => {
    const res = await API.put(`/admin/users/${id}/status`, { status });
    return res.data;
  },
  getPendingJobs: async () => {
    const res = await API.get('/admin/pending-jobs');
    return res.data;
  },
  updateJobStatus: async (id, status) => {
    const res = await API.put(`/admin/jobs/${id}/status`, { status });
    return res.data;
  }
};