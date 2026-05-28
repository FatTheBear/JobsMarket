import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import styles from './AuthPage.module.css';

export default function AuthPage() {
  const location = useLocation();
  const navigate = useNavigate();
  
  const selectedRole = location.state?.role || "candidate";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();

    const userData = {
      email: email,
      password: password,
      fullName: fullName,
      role: selectedRole
    };

    try {
      const response = await axios.post("http://localhost:5000/api/auth/register", userData);
      
      if (response.status === 200 || response.status === 201) {
        navigate("/login");
      }
    } catch (error) {
      console.error("Registration failed:", error);
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

                  <form>
                    <div className="form-outline mb-4">
                      <input
                        type="text"
                        id="form3Example1cg"
                        className={`form-control form-control-lg ${styles.formControl}`}
                      />
                      <label
                        className="form-label"
                        htmlFor="form3Example1cg"
                      >
                        Your Name
                      </label>
                    </div>

                    <div className="form-outline mb-4">
                      <input
                        type="email"
                        id="form3Example3cg"
                        className={`form-control form-control-lg ${styles.formControl}`}
                      />
                      <label
                        className="form-label"
                        htmlFor="form3Example3cg"
                      >
                        Your Email
                      </label>
                    </div>

                    <div className="form-outline mb-4">
                      <input
                        type="password"
                        id="form3Example4cg"
                        className={`form-control form-control-lg ${styles.formControl}`}
                      />
                      <label
                        className="form-label"
                        htmlFor="form3Example4cg"
                      >
                        Password
                      </label>
                    </div>

                    <div className="form-outline mb-4">
                      <input
                        type="password"
                        id="form3Example4cdg"
                        className={`form-control form-control-lg ${styles.formControl}`}
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
                        <a href="#!" className="text-body">
                          <u>Terms of service</u>
                        </a>
                      </label>
                    </div>

                    <div className="d-flex justify-content-center">
                      <button
                        type="button"
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

