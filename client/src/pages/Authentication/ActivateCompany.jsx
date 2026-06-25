import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import styles from './Login.module.css';

export default function ActivateCompany() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const urlCode = searchParams.get("code") || "";

  const [activationCode, setActivationCode] = useState(urlCode);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    setActivationCode(e.target.value.toUpperCase());
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!activationCode) {
      setError("Please enter your activation code.");
      return;
    }

    try {
      const response = await axios.post(
       'http://localhost:5000/api/auth/activate-company',
        {
          activationCode: activationCode.trim()
        }
      );

      if (response.status === 200) {
        if (response.data.token) {
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('role', 'Company');
            window.dispatchEvent(new Event("storage"));
        }
        
        setSuccess("Account activated successfully! Redirecting...");
        
        setTimeout(() => {
          navigate("/company-profile");
        }, 1500);
      }
    } catch (error) {
      setError(error.response?.data?.message || "Activation failed. Invalid or expired code.");
    }
  };

  return (
    <section
      className="vh-100 bg-image"
      style={{
        backgroundImage: 'url("https://mdbcdn.b-cdn.net/img/Photos/new-templates/search-box/img4.webp")'
      }}
    >
      <div className={`mask d-flex align-items-center h-100 ${styles.gradientCustom3}`}>
        <div className="container h-100">
          <div className="row d-flex justify-content-center align-items-center h-100">
            <div className="col-12 col-md-9 col-lg-7 col-xl-6">
              <div className="card" style={{ borderRadius: 15 }}>
                <div className="card-body p-5">
                  <h2 className="text-uppercase text-center mb-4">
                    Activate Account
                  </h2>
                  
                  {error && (
                    <div className="alert alert-danger py-2 px-3 small border-0 mb-4 text-center" role="alert">
                      <i className="fas fa-exclamation-triangle me-1"></i> {error}
                    </div>
                  )}
                  {success && (
                    <div className="alert alert-success py-2 px-3 small border-0 mb-4 text-center" role="alert">
                      <i className="fas fa-check-circle me-1"></i> {success}
                    </div>
                  )}

                  <p className="text-center mb-5 text-muted">
                    Please enter the activation code sent to your email by our administrators.
                  </p>

                  <form onSubmit={handleSubmit}>
                    <div className="form-outline mb-5">
                      <input
                        type="text"
                        id="activationInput"
                        name="activationCode"
                        value={activationCode}
                        onChange={handleChange}
                        className={`form-control form-control-lg ${styles.formControl} text-center fw-bold letter-spacing-2`}
                        placeholder="e.g., ACT-123456"
                        autoComplete="off"
                        maxLength={6}
                      />
                      <label className="form-label" htmlFor="activationInput">
                        Activation Code
                      </label>
                    </div>

                    <div className="d-flex justify-content-center mb-4">
                      <button
                        type="submit"
                        className={`btn btn-success btn-block btn-lg px-5 ${styles.gradientCustom4}`}
                      >
                        Activate & Get Started
                      </button>
                    </div>

                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}