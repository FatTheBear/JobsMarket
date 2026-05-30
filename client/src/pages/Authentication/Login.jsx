import { Link, useNavigate } from 'react-router-dom';
import styles from './Login.module.css';
import React, { useState } from 'react';
export default function Login() {

const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    // 1. Frontend Validation: Check for empty fields
    if (!email.trim() || !password.trim()) {
      return setErrorMessage("Please enter both email and password!");
    }

    try {
      const response = await axios.post('http://localhost:5000/login', {
        email,
        password
      });

      if (response.status === 200) {
        navigate('/dashboard'); 
      }
    } catch (error) {
      // 2. Catch Backend Errors
      if (error.response && error.response.data) {
        setErrorMessage(error.response.data.message || "Invalid email or password!");
      } else {
        setErrorMessage("Connection error! Please ensure the server is running.");
      }
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

                  {/* Title */}
                  <h2 className="text-uppercase text-center mb-5">
                    Login
                  </h2>
                  {errorMessage && (
                    <div style={{ color: 'red', textAlign: 'center', marginBottom: '15px', fontWeight: 'bold' }}>
                      {errorMessage}
                    </div>
                  )}
                  <form>

                    {/* Email */}
                    <div className="form-floating mb-4">
                      <input
                        type="email"
                        id="loginEmail"
                        className={`form-control ${styles.formControl}`}
                        placeholder="Your Email"
                      />
                      <label
                        className="form-label"
                        htmlFor="loginEmail"
                      >
                        Your Email
                      </label>
                    </div>

                    {/* Password */}
                    <div className="form-floating mb-4">
                      <input
                        type="password"
                        id="loginPassword"
                        className={`form-control ${styles.formControl}`}
                        placeholder="Password"
                      />
                      <label
                        className="form-label"
                        htmlFor="loginPassword"
                      >
                        Password
                      </label>
                    </div>


                    {/* Remember me */}
                    <div className="form-check d-flex justify-content-center mb-4">
                      <input
                        className="form-check-input me-2"
                        type="checkbox"
                        id="rememberMe"
                      />

                      <label
                        className="form-check-label"
                        htmlFor="rememberMe"
                      >
                        Remember me
                      </label>
                    </div>

                    {/* Button */}
                    <div className="d-flex justify-content-center">
                      <button
                        type="submit"
                        className={`btn btn-success btn-block btn-lg ${styles.gradientCustom4}`}
                      >
                        Login
                      </button>
                    </div>

                    {/* Bottom text */}
                    <Link to="/register">
                      Don't have an account? Register here!
                    </Link>

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

