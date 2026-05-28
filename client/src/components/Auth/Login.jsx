import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminApi } from '../../services/adminApi';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await adminApi.login({ email, password });

      if (res && res.data && res.data.token) {
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('role', res.data.role);

        res.data.role === 'Admin'
          ? navigate('/admin')
          : navigate('/');
      } else {
        alert("Login failed!");
      }

    } catch (err) {
      const errorMsg =
        err.response?.data?.message ||
        "Incorrect email or password!";

      alert(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="d-flex align-items-center justify-content-center min-vh-100 bg-light py-5">
      <div 
        className="card shadow-lg border-0 p-4 p-md-5" 
        style={{ maxWidth: '420px', width: '90%', borderRadius: '16px' }}
      >
        {/* Brand Header */}
        <div className="text-center mb-4">
          <span className="fs-1" role="img" aria-label="brand">💼</span>
          <h2 className="fw-bold mt-2 text-dark" style={{ letterSpacing: '-0.5px' }}>Welcome Back</h2>
          <p className="text-muted small">Sign in to access your JobsMarket profile</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin}>
          <div className="mb-3">
            <label className="form-label text-muted small fw-semibold">Email Address</label>
            <div className="input-group">
              <span className="input-group-text bg-light border-end-0 text-muted">✉️</span>
              <input
                type="email"
                className="form-control bg-light border-start-0 fs-6 py-2.5"
                placeholder="name@domain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="form-label text-muted small fw-semibold">Password</label>
            <div className="input-group">
              <span className="input-group-text bg-light border-end-0 text-muted">🔒</span>
              <input
                type="password"
                className="form-control bg-light border-start-0 fs-6 py-2.5"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-lg w-100 fw-bold py-2.5 shadow-sm border-0"
            style={{ backgroundColor: '#4835d4', borderRadius: '10px' }}
            disabled={loading}
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>

          {/* Switch to Register link */}
          <div className="text-center mt-4">
            <p className="text-muted small mb-0">
              Don't have an account?{' '}
              <a 
                href="/auth" 
                className="text-decoration-none fw-bold" 
                style={{ color: '#4835d4' }}
              >
                Register here
              </a>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;