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
  },

  // ==========================================================================
  // HÀM LẤY DỮ LIỆU CHO CÁC TAB
  // ==========================================================================
  getSkills: async () => {
    const res = await API.get('/admin/skills');
    return res.data;
  },

  getIndustries: async () => {
    const res = await API.get('/admin/industries');
    return res.data;
  },

  getNews: async () => {
    const res = await API.get('/admin/news');
    return res.data;
  },

  // ==========================================================================
  // THÊM MỚI: 2 HÀM DƯỚI ĐÂY ĐỂ ĐỂ PHỤC VỤ NÚT "+ ADD" TRÊN GIAO DIỆN CATEGORIES
  // ==========================================================================
  createSkill: async (name) => {
    const res = await API.post('/admin/skills', { name });
    return res.data;
  },

  createIndustry: async (name) => {
    const res = await API.post('/admin/industries', { name });
    return res.data;
  },

  createNews: async (data) => {
  const res = await API.post('/admin/news', data);
  return res.data;
},

updateNews: async (id, data) => {
  const res = await API.put(`/admin/news/${id}`, data);
  return res.data;
},

deleteNews: async (id) => {
  const res = await API.delete(`/admin/news/${id}`);
  return res.data;
},

deleteSkill: async (id) => {
    const res = await API.delete(`/admin/skills/${id}`);
    return res.data;
  },

  deleteIndustry: async (id) => {
    const res = await API.delete(`/admin/industries/${id}`);
    return res.data;
  },

  // ==========================================================================
  // COIN EXCHANGE FEES
  // ==========================================================================
  getCoinFees: async () => {
    const res = await API.get('/admin/coin-fees');
    return res.data;
  },

  createCoinFee: async (data) => {
    const res = await API.post('/admin/coin-fees', data);
    return res.data;
  },

  updateCoinFee: async (id, data) => {
    const res = await API.put(`/admin/coin-fees/${id}`, data);
    return res.data;
  },

  deleteCoinFee: async (id) => {
    const res = await API.delete(`/admin/coin-fees/${id}`);
    return res.data;
  }
};
