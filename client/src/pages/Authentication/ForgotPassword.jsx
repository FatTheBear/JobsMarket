import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import styles from './Login.module.css';

const API_URL = 'http://localhost:5000/api/auth';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!email.trim()) {
      setError('Please enter your email.');
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/forgot-password/request`, {
        email: email.trim()
      });
      setSuccess(res.data.message || 'OTP sent successfully.');
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/forgot-password/request`, {
        email: email.trim()
      });
      setSuccess(res.data.message || 'OTP resent successfully.');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend OTP.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!otp.trim() || otp.trim().length !== 6) {
      setError('OTP must be 6 digits.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    const hasLetter = /[a-zA-Z]/.test(newPassword);
    const hasNumber = /\d/.test(newPassword);
    if (newPassword.length < 8 || !hasLetter || !hasNumber) {
      setError('Password must be at least 8 characters and contain both letters and numbers.');
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/forgot-password/confirm`, {
        email: email.trim(),
        otp: otp.trim(),
        newPassword
      });
      setSuccess(res.data.message || 'Password reset successfully.');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password.');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (e) => {
    setOtp(e.target.value.replace(/\D/g, '').slice(0, 6));
  };

  return (
    <section
      className="vh-100 bg-image"
      style={{
        backgroundImage:
          'url("https://mdbcdn.b-cdn.net/img/Photos/new-templates/search-box/img4.webp")'
      }}
    >
      <div className={`mask d-flex align-items-center h-100 ${styles.gradientCustom3}`}>
        <div className="container h-100">
          <div className="row d-flex justify-content-center align-items-center h-100">
            <div className="col-12 col-md-9 col-lg-7 col-xl-6">
              <div className="card" style={{ borderRadius: 15 }}>
                <div className="card-body p-5">
                  <h2 className="text-uppercase text-center mb-4">
                    {step === 1 ? 'Forgot Password' : 'Reset Password'}
                  </h2>

                  {error && (
                    <div style={{ color: 'red', textAlign: 'center', marginBottom: '15px', fontWeight: 'bold' }}>
                      {error}
                    </div>
                  )}
                  {success && (
                    <div style={{ color: '#01796F', textAlign: 'center', marginBottom: '15px', fontWeight: 'bold' }}>
                      {success}
                    </div>
                  )}

                  {step === 1 ? (
                    <form onSubmit={handleSendOtp}>
                      <p className="text-center text-muted mb-4">
                        Enter your registered email. We will send you a 6-digit OTP to reset your password.
                      </p>

                      <div className="form-floating mb-4">
                        <input
                          type="email"
                          id="forgotEmail"
                          className={`form-control ${styles.formControl}`}
                          placeholder="Your Email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                        />
                        <label htmlFor="forgotEmail">Your Email</label>
                      </div>

                      <div className="d-flex justify-content-center mb-3">
                        <button
                          type="submit"
                          className={`btn btn-success btn-block btn-lg ${styles.gradientCustom4}`}
                          disabled={loading}
                        >
                          {loading ? 'Sending...' : 'Send OTP'}
                        </button>
                      </div>
                    </form>
                  ) : (
                    <form onSubmit={handleResetPassword}>
                      <p className="text-center text-muted mb-4">
                        OTP sent to <strong>{email}</strong>
                      </p>

                      <div className="form-floating mb-4">
                        <input
                          type="text"
                          id="forgotOtp"
                          className={`form-control ${styles.formControl}`}
                          placeholder="OTP Code"
                          value={otp}
                          onChange={handleOtpChange}
                          autoComplete="off"
                        />
                        <label htmlFor="forgotOtp">OTP Code</label>
                      </div>

                      <div className="form-floating mb-4">
                        <input
                          type="password"
                          id="newPassword"
                          className={`form-control ${styles.formControl}`}
                          placeholder="New Password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                        />
                        <label htmlFor="newPassword">New Password</label>
                      </div>

                      <div className="form-floating mb-4">
                        <input
                          type="password"
                          id="confirmPassword"
                          className={`form-control ${styles.formControl}`}
                          placeholder="Confirm Password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                        <label htmlFor="confirmPassword">Confirm Password</label>
                      </div>

                      <div className="d-flex justify-content-center mb-3">
                        <button
                          type="submit"
                          className={`btn btn-success btn-block btn-lg ${styles.gradientCustom4}`}
                          disabled={loading}
                        >
                          {loading ? 'Processing...' : 'Reset Password'}
                        </button>
                      </div>

                      <div className="text-center mb-3">
                        <span
                          onClick={!loading ? handleResendOtp : undefined}
                          style={{
                            cursor: loading ? 'not-allowed' : 'pointer',
                            color: '#393f81',
                            textDecoration: 'underline'
                          }}
                        >
                          Resend OTP
                        </span>
                      </div>

                      <div className="text-center">
                        <button
                          type="button"
                          className="btn btn-link"
                          onClick={() => {
                            setStep(1);
                            setOtp('');
                            setNewPassword('');
                            setConfirmPassword('');
                            setError('');
                            setSuccess('');
                          }}
                        >
                          Change email
                        </button>
                      </div>
                    </form>
                  )}

                  <div className="text-center mt-3">
                    <Link to="/login">Back to Login</Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
