import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminApi } from '../../api/adminApi';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await adminApi.login({ email, password });

      if (res && res.data && res.data.token) {
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('role', res.data.role);

        res.data.role === 'Admin'
          ? navigate('/admin')
          : navigate('/');
      } else {
        alert("Đăng nhập thất bại!");
      }

    } catch (err) {
      const errorMsg =
        err.response?.data?.message ||
        "Email hoặc mật khẩu không đúng!";

      alert(errorMsg);
    }
  };

  return (
    <form onSubmit={handleLogin}>
      <input
        type="email"
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        required
      />

      <input
        type="password"
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        required
      />

      <button type="submit">Đăng nhập</button>
    </form>
  );
};

export default Login;