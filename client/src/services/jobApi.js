import axios from 'axios';

const API_URL = 'http://localhost:5000/api/jobs';

// Hàm lấy token từ localStorage 
const getHeaders = () => {
    const token = localStorage.getItem('token');
    return { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
    };
};

export const jobApi = {
    // Hàm gửi request POST kèm body và header chứa token của HR
    createJob: (jobData) => axios.post(`${API_URL}/create`, jobData, { headers: getHeaders() }),
};