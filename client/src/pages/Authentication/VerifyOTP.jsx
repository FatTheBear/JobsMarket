import React, { useState } from 'react';
import styles from './Login.module.css';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function VerifyOTP() {
  const [otp, setOtp] = useState('');
  const location = useLocation();
  const userEmail = location.state?.email;
  const userRole = location.state?.role;
  const navigate = useNavigate();
  const [error, setError] = useState("");
  

  const handleChange = (e) => {
    const numericValue = e.target.value.replace(/\D/g, '');
    if (numericValue.length <= 6) {
      setOtp(numericValue);
    }
  };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (!userEmail) {
            setError("Missing email. Please register again.");
            return;
        }

        if (!otp) {
            setError("Please enter OTP");
            return;
        }

        try {
            const response = await axios.post(
                'http://localhost:5000/api/auth/verify-otp',
                {
                    email: userEmail,
                    otp: otp.toString().trim()
                }
            );

            if (response.status === 200) {
                localStorage.setItem('token', response.data.token);

                const apiRole = response.data.user?.role;
                const roleLower = apiRole ? apiRole.toLowerCase() : '';

                if (roleLower === "company" || roleLower === "hr") {
                    navigate("/company-profile");
                } else {
                    navigate("/setup-profile");
                }
            }

        } catch (error) {
            setError(error.response?.data?.message || "Verify failed");
        }
    };

  const handleResendOTP = async () => {
     try {
            if (!userEmail) {
                setError("Missing email");
                return;
            }

            await axios.post(
                'http://localhost:5000/api/auth/resend-otp',
                { email: userEmail }
            );

            alert("OTP resent successfully!");
        } catch (error) {
            setError(error.response?.data?.message || "Resend failed");
        }
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
                    Verify Email
                  </h2>
                  
                  <p className="text-center mb-5">
                    Please enter the 6-digit OTP sent to your email.
                  </p>

                  <form onSubmit={handleSubmit}>
                    <div className="form-outline mb-4">
                      <input
                        type="text"
                        id="otpInput"
                        name="otp"
                        value={otp}
                        onChange={handleChange}
                        className={`form-control form-control-lg ${styles.formControl}`}
                        placeholder=" "
                        autoComplete="off"
                      />
                      <label
                        className="form-label"
                        htmlFor="otpInput"
                      >
                        OTP Code
                      </label>
                    </div>

                    <div className="d-flex justify-content-center mb-4">
                      <button
                        type="submit"
                        className={`btn btn-success btn-block btn-lg ${styles.gradientCustom4}`}
                      >
                        Verify OTP
                      </button>
                    </div>

                    <div className="text-center">
                      <p className="text-muted mb-0">
                        Didn't receive the code?{' '}
                        <span 
                          onClick={handleResendOTP}
                          style={{ cursor: 'pointer', color: '#393f81', textDecoration: 'underline' }}
                        >
                          Resend OTP
                        </span>
                      </p>
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