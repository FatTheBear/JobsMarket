import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import styles from './Register.module.css';

export default function Register() {
  const location = useLocation();
  const navigate = useNavigate();

  const selectedRole = location.state?.role || "candidate";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    // 1. Frontend Validation: Check for empty fields (Đã xóa check fullName)
    if (!email || !password || !repeatPassword) {
      return setErrorMessage("Please fill in all required fields!");
    }

    // 2. Frontend Validation: Check if passwords match
    if (password !== repeatPassword) {
      return setErrorMessage("Passwords do not match!");
    }

    // Đóng gói dữ liệu gửi xuống Backend
    const userData = {
      email,
      password,
      repeat_password: repeatPassword,
      role: selectedRole,
      accept_terms: true,
      // Nếu là role company thì gửi kèm data mặc định (vì không còn fullName để nối chuỗi)
      ...(selectedRole === 'company' && { company_name: 'My Company', industry_id: 1 })
    };

    try {
      const response = await axios.post('http://localhost:5000/api/auth/register', userData);

      if (response.status === 201) {
        navigate('/verify-otp', {
          state: {
            email: userData.email,
            role: selectedRole
            
          }
        });
      }
    } catch (error) {
      // 3. Catch Backend Errors (e.g., Email already exists)
      if (error.response && error.response.data) {
        const data = error.response.data;
        if (data.errors) {
          setErrorMessage(data.errors.join(", "));
        } else {
          setErrorMessage(data.message);
        }
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
                  <h2 className="text-uppercase text-center mb-5">
                    Create an account
                  </h2>

                  <form onSubmit={handleRegisterSubmit} noValidate>

                    <div className="form-floating mb-4">
                      <input
                        type="email"
                        id="form3Example3cg"
                        className={`form-control ${styles.formControl}`}
                        placeholder="Your Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                      <label
                        className="form-label"
                        htmlFor="form3Example3cg"
                      >
                        Your Email
                      </label>
                    </div>

                    <div className="form-floating mb-4">
                      <input
                        type="password"
                        id="form3Example4cg"
                        className={`form-control ${styles.formControl}`}
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                      <label
                        className="form-label"
                        htmlFor="form3Example4cg"
                      >
                        Password
                      </label>
                    </div>

                    <div className="form-floating mb-4">
                      <input
                        type="password"
                        id="form3Example4cdg"
                        className={`form-control ${styles.formControl}`}
                        placeholder="Repeat your password"
                        value={repeatPassword}
                        onChange={(e) => setRepeatPassword(e.target.value)}
                      />
                      <label
                        className="form-label"
                        htmlFor="form3Example4cdg"
                      >
                        Repeat your password
                      </label>
                    </div>
                    <div className="form-check d-flex justify-content-center mb-5">
                      <input
                        className="form-check-input me-2"
                        type="checkbox"
                        id="form2Example3cg"
                      />
                      <label
                        className="form-check-label"
                        htmlFor="form2Example3cg"
                      >
                        I agree all statements in{" "}
                        <a
                          href="/terms-of-service"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-body"
                        >
                          <u>Terms of service</u>
                        </a>
                      </label>
                    </div>

                    {errorMessage && (
                      <div className="alert alert-danger mb-3">
                        {errorMessage}
                      </div>
                    )}
                    <div className="d-flex justify-content-center">
                      <button
                        type="submit"
                        className={`btn btn-success btn-block btn-lg ${styles.gradientCustom4}`}
                      >
                        Register
                      </button>
                    </div>

                    <Link to="/login">
                      Already have an account? Sign In
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