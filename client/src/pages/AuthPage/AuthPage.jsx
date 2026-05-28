import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminApi } from '../../services/adminApi';
import styles from './AuthPage.module.css';

export default function AuthPage({ defaultMode = 'login' }) {
  const [mode, setMode] = useState(defaultMode); // 'login' or 'register'
  const navigate = useNavigate();

  // Login States
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  // Register States
  const [regRole, setRegRole] = useState('Candidate'); // 'Candidate' or 'HR'
  const [regFullName, setRegFullName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regDob, setRegDob] = useState('');
  const [regPhone, setRegPhone] = useState('');
  
  // HR Specific States
  const [regCompanyName, setRegCompanyName] = useState('');
  const [regIndustryId, setRegIndustryId] = useState('1'); // Default industry ID
  const [regLoading, setRegLoading] = useState(false);

  // Handle Login Submit
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoginLoading(true);
    try {
      const res = await adminApi.login({ email: loginEmail, password: loginPassword });
      if (res && res.data && res.data.token) {
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('role', res.data.role);

        if (res.data.role === 'Admin') {
          navigate('/admin');
        } else {
          navigate('/');
        }
      } else if (res && res.token) {
        localStorage.setItem('token', res.token);
        localStorage.setItem('role', res.role);

        if (res.role === 'Admin') {
          navigate('/admin');
        } else {
          navigate('/');
        }
      } else {
        alert("Login failed! Please check your credentials.");
      }
    } catch (err) {
      console.error(err);
      const errMsg = err.response?.data?.message || "Incorrect email or password!";
      alert(errMsg);
    } finally {
      setLoginLoading(false);
    }
  };

  // Handle Register Submit
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    
    if (regPassword !== regConfirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    setRegLoading(true);

    const payload = {
      email: regEmail,
      password: regPassword,
      role: regRole,
      full_name: regRole === 'Candidate' ? regFullName : undefined,
      company_name: regRole === 'HR' ? regCompanyName : undefined,
      industry_id: regRole === 'HR' ? parseInt(regIndustryId) : undefined,
    };

    try {
      const res = await adminApi.register(payload);
      alert(res.message || "Registration successful! You can now log in.");
      setMode('login');
      // Autofill email for easier login
      setLoginEmail(regEmail);
      setLoginPassword('');
    } catch (err) {
      console.error(err);
      const errMsg = err.response?.data?.message || "Registration failed. Please try again.";
      alert(errMsg);
    } finally {
      setRegLoading(false);
    }
  };

  return (
    <section className={`h-100 ${styles['h-custom']} ${styles['gradient-custom-2']} d-flex align-items-center py-5`}>
      <div className="container py-2 h-100">
        <div className="row d-flex justify-content-center align-items-center h-100">
          <div className="col-12 col-xl-11">
            
            <div
              className={`card ${styles['card-registration']} ${styles['card-registration-2']} shadow-lg border-0`}
              style={{ borderRadius: 20, overflow: 'hidden' }}
            >
              <div className="card-body p-0">
                <div className="row g-0">
                  
                  {/* MODE: LOGIN */}
                  {mode === 'login' && (
                    <>
                      {/* Left Column: Login Form */}
                      <div className="col-lg-6 d-flex align-items-center bg-white">
                        <div className="p-4 p-md-5 w-100">
                          <div className="text-center mb-4">
                            <span className="fs-1">💼</span>
                            <h2 className="fw-bold mt-2 text-dark" style={{ letterSpacing: '-0.5px' }}>Welcome Back</h2>
                            <p className="text-muted small">Please sign in to access your JobsMarket profile</p>
                          </div>

                          <form onSubmit={handleLoginSubmit}>
                            <div className="mb-3">
                              <label className="form-label text-muted small fw-semibold">Email Address</label>
                              <div className="input-group">
                                <span className="input-group-text bg-light border-end-0 text-muted">✉️</span>
                                <input
                                  type="email"
                                  className="form-control form-control-lg border-start-0 bg-light fs-6"
                                  placeholder="name@domain.com"
                                  value={loginEmail}
                                  onChange={(e) => setLoginEmail(e.target.value)}
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
                                  className="form-control form-control-lg border-start-0 bg-light fs-6"
                                  placeholder="••••••••"
                                  value={loginPassword}
                                  onChange={(e) => setLoginPassword(e.target.value)}
                                  required
                                />
                              </div>
                            </div>

                            <button
                              type="submit"
                              className="btn btn-primary btn-lg w-100 fw-bold py-3 mt-2 shadow-sm border-0"
                              style={{ backgroundColor: '#4835d4', borderRadius: '10px' }}
                              disabled={loginLoading}
                            >
                              {loginLoading ? 'Signing In...' : 'Sign In'}
                            </button>

                            <div className="text-center mt-4">
                              <p className="text-muted small mb-0">
                                Don't have an account?{' '}
                                <button
                                  type="button"
                                  className="btn btn-link text-decoration-none p-0 fw-bold small"
                                  style={{ color: '#4835d4' }}
                                  onClick={() => setMode('register')}
                                >
                                  Register here
                                </button>
                              </p>
                            </div>
                          </form>
                        </div>
                      </div>

                      {/* Right Column: Welcoming Panel */}
                      <div className={`col-lg-6 text-white d-flex align-items-center ${styles['bg-indigo']}`}>
                        <div className="p-4 p-md-5 text-center w-100">
                          <h3 className="fw-bold mb-4 fs-2">The Breakthrough Recruitment Experience</h3>
                          <p className="lead fs-6 mb-5" style={{ opacity: 0.9 }}>
                            JobsMarket connects top-tier candidates with industry-leading employers through an intelligent, fast, and secure recruitment matching system.
                          </p>
                          <div className="row g-3 text-start">
                            <div className="col-12 d-flex align-items-center bg-white bg-opacity-10 p-3 rounded-3">
                              <span className="fs-3 me-3">🚀</span>
                              <div>
                                <h6 className="mb-0 fw-bold">Intelligent Matching</h6>
                                <p className="mb-0 small text-white-50">Match perfectly with roles that fit your skills.</p>
                              </div>
                            </div>
                            <div className="col-12 d-flex align-items-center bg-white bg-opacity-10 p-3 rounded-3">
                              <span className="fs-3 me-3">🏢</span>
                              <div>
                                <h6 className="mb-0 fw-bold">Verified Corporate Profiles</h6>
                                <p className="mb-0 small text-white-50">Direct connection with transparent hiring managers.</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  {/* MODE: REGISTER */}
                  {mode === 'register' && (
                    <>
                      {/* Left Column: Account registration */}
                      <div className="col-lg-6 bg-white">
                        <div className="p-4 p-md-5">
                          <h3 className="fw-bold mb-4 text-dark" style={{ color: '#4835d4' }}>
                            Create Account
                          </h3>
                          
                          <form onSubmit={handleRegisterSubmit}>
                            <div className="mb-3">
                              <label className="form-label text-muted small fw-semibold">I want to register as a:</label>
                              <div className="d-flex gap-3">
                                <div className="form-check">
                                  <input
                                    className="form-check-input"
                                    type="radio"
                                    name="regRole"
                                    id="roleCandidate"
                                    checked={regRole === 'Candidate'}
                                    onChange={() => setRegRole('Candidate')}
                                  />
                                  <label className="form-check-label fw-bold text-dark small" htmlFor="roleCandidate">
                                    👤 Candidate (Ứng viên)
                                  </label>
                                </div>
                                <div className="form-check">
                                  <input
                                    className="form-check-input"
                                    type="radio"
                                    name="regRole"
                                    id="roleHR"
                                    checked={regRole === 'HR'}
                                    onChange={() => setRegRole('HR')}
                                  />
                                  <label className="form-check-label fw-bold text-dark small" htmlFor="roleHR">
                                    🏢 HR / Employer (Nhà tuyển dụng)
                                  </label>
                                </div>
                              </div>
                            </div>

                            {regRole === 'Candidate' ? (
                              <div className="mb-3">
                                <label className="form-label text-muted small fw-semibold">Full Name</label>
                                <input
                                  type="text"
                                  className="form-control border bg-light"
                                  placeholder="Nguyen Van A"
                                  value={regFullName}
                                  onChange={(e) => setRegFullName(e.target.value)}
                                  required
                                />
                              </div>
                            ) : (
                              <div className="mb-3 animate-fade-in">
                                <label className="form-label text-muted small fw-semibold">Company Name</label>
                                <input
                                  type="text"
                                  className="form-control border bg-light"
                                  placeholder="Aptech Corp"
                                  value={regCompanyName}
                                  onChange={(e) => setRegCompanyName(e.target.value)}
                                  required
                                />
                              </div>
                            )}

                            <div className="row">
                              <div className="col-md-6 mb-3">
                                <label className="form-label text-muted small fw-semibold">Date of Birth</label>
                                <input
                                  type="date"
                                  className="form-control border bg-light text-muted small"
                                  value={regDob}
                                  onChange={(e) => setRegDob(e.target.value)}
                                />
                              </div>
                              <div className="col-md-6 mb-3">
                                <label className="form-label text-muted small fw-semibold">Phone Number</label>
                                <input
                                  type="tel"
                                  className="form-control border bg-light"
                                  placeholder="0987654321"
                                  value={regPhone}
                                  onChange={(e) => setRegPhone(e.target.value)}
                                />
                              </div>
                            </div>

                            <div className="mb-3">
                              <label className="form-label text-muted small fw-semibold">Email Address</label>
                              <input
                                type="email"
                                className="form-control border bg-light"
                                placeholder="name@domain.com"
                                value={regEmail}
                                onChange={(e) => setRegEmail(e.target.value)}
                                required
                              />
                            </div>

                            <div className="row">
                              <div className="col-md-6 mb-3">
                                <label className="form-label text-muted small fw-semibold">Password</label>
                                <input
                                  type="password"
                                  className="form-control border bg-light"
                                  placeholder="••••••••"
                                  value={regPassword}
                                  onChange={(e) => setRegPassword(e.target.value)}
                                  required
                                />
                              </div>
                              <div className="col-md-6 mb-3">
                                <label className="form-label text-muted small fw-semibold">Confirm Password</label>
                                <input
                                  type="password"
                                  className="form-control border bg-light"
                                  placeholder="••••••••"
                                  value={regConfirmPassword}
                                  onChange={(e) => setRegConfirmPassword(e.target.value)}
                                  required
                                />
                              </div>
                            </div>

                            {regRole === 'HR' && (
                              <div className="mb-3 animate-fade-in">
                                <label className="form-label text-muted small fw-semibold">Industry / Sector</label>
                                <select
                                  className="form-select border bg-light"
                                  value={regIndustryId}
                                  onChange={(e) => setRegIndustryId(e.target.value)}
                                >
                                  <option value="1">Information Technology (IT)</option>
                                  <option value="2">Finance & Banking</option>
                                  <option value="3">Marketing & Design</option>
                                  <option value="4">Education & Research</option>
                                </select>
                              </div>
                            )}

                            <div className="form-check mb-4 mt-3">
                              <input className="form-check-input" type="checkbox" id="termsCheck" required />
                              <label className="form-check-label text-muted small" htmlFor="termsCheck">
                                I agree to the <a href="#!" className="text-decoration-none fw-bold" style={{ color: '#4835d4' }}>Terms and Conditions</a>
                              </label>
                            </div>

                            <div className="d-flex align-items-center justify-content-between">
                              <button
                                type="button"
                                className="btn btn-link text-decoration-none p-0 fw-bold small"
                                style={{ color: '#4835d4' }}
                                onClick={() => setMode('login')}
                              >
                                Already have an account? Sign In
                              </button>
                              <button
                                type="submit"
                                className="btn btn-primary btn-lg fw-bold px-5 shadow-sm border-0"
                                style={{ backgroundColor: '#4835d4', borderRadius: '8px' }}
                                disabled={regLoading}
                              >
                                {regLoading ? 'Registering...' : 'Register'}
                              </button>
                            </div>
                          </form>
                        </div>
                      </div>

                      {/* Right Column: Professional Profile Info Panel */}
                      <div className={`col-lg-6 text-white d-flex align-items-center ${styles['bg-indigo']}`}>
                        <div className="p-4 p-md-5 w-100">
                          <h3 className="fw-bold mb-4 fs-3">Join JobsMarket Today</h3>
                          <p className="mb-4 small" style={{ opacity: 0.9 }}>
                            Fill in your registration details to unlock candidate profile building tools, HR company creation portals, and immediate job matching boards.
                          </p>

                          <div className="d-flex flex-column gap-3 mt-4 text-start">
                            <div className="bg-white bg-opacity-10 p-3 rounded-3">
                              <span className="fs-4 d-block mb-1">🎯 For Candidates</span>
                              <p className="mb-0 small text-white-50">Create your rich CV, highlight skills, and apply to top IT, marketing, or design roles with 1-click applications.</p>
                            </div>
                            <div className="bg-white bg-opacity-10 p-3 rounded-3">
                              <span className="fs-4 d-block mb-1">👔 For Employers</span>
                              <p className="mb-0 small text-white-50">Register your company, post unlimited jobs, set up customized test tags, and filter applicants effortlessly.</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                  
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}