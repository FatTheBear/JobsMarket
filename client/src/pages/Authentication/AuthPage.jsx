import React from "react";
import { Link } from "react-router-dom";
import styles from './Register.module.css';
export default function AuthPage() {
  return (
    <section
      className="vh-100 d-flex align-items-center"
      style={{
        background:
          "linear-gradient(to right, rgba(132,250,176,0.25), rgba(143,211,244,0.25))",
      }}
    >
      <div className="container-fluid px-0">
        <div className="row g-0 min-vh-100">

          {/* LEFT SIDE */}
          <div className="col-lg-6 d-none d-lg-flex align-items-center justify-content-center bg-dark text-white">
            <div className="text-center px-5">
              <h1 className="display-4 fw-bold mb-4">
                Welcome to JobsMarket
              </h1>

              <p className="fs-5 text-light opacity-75">
                Find talents, build careers, and connect opportunities in one
                modern recruitment platform.
              </p>
            </div>
          </div>

          {/* RIGHT SIDE */}
          <div className="col-lg-6 d-flex align-items-center justify-content-center">
            <div
              className="bg-white shadow p-5 w-100"
              style={{
                maxWidth: "550px",
                borderRadius: "20px",
              }}
            >
              <div className="text-center mb-5">
                <h2 className="fw-bold mb-3">Choose Your Role</h2>

                <p className="text-muted">
                  Select how you want to continue
                </p>
              </div>

              {/* Candidate Card */}
              <Link
                to="/register"
                state={{ role: "candidate" }}
                className="text-decoration-none"
              >
                <div
                  className="border rounded-4 p-4 mb-4 role-card"
                  style={{
                    transition: "0.3s",
                    cursor: "pointer",
                  }}
                >
                  <div className="d-flex align-items-center">
                    

                    <div>
                      <h4 className="fw-semibold text-dark mb-1">
                        Candidate
                      </h4>

                      <p className="text-muted mb-0">
                        Apply for jobs and build your professional profile.
                      </p>
                    </div>
                  </div>
                </div>
              </Link>

              {/* Company Card */}
              <Link
                to="/register"
                state={{ role: "company" }}
                className="text-decoration-none"
              >
                <div
                  className="border rounded-4 p-4 role-card"
                  style={{
                    transition: "0.3s",
                    cursor: "pointer",
                  }}
                >
                  <div className="d-flex align-items-center">
                    

                    <div>
                      <h4 className="fw-semibold text-dark mb-1">
                        Company
                      </h4>

                      <p className="text-muted mb-0">
                        Post jobs and find suitable candidates faster.
                      </p>
                    </div>
                  </div>
                </div>
              </Link>

              {/* LOGIN */}
              <div className="text-center mt-5">
                <p className="text-muted mb-0">
                  Already have an account?{" "}
                  <Link
                    to="/login"
                    className="fw-semibold text-decoration-none"
                  >
                    Login
                  </Link>
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}