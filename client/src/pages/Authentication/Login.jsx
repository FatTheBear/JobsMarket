import React from 'react';
import { Link } from 'react-router-dom';
import styles from './Login.module.css';
export default function Login() {
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

              <form>

                {/* Email */}
                <div className="form-outline mb-4">
                  <input
                    type="email"
                    id="loginEmail"
                    className={`form-control form-control-lg ${styles.formControl}`}
                    placeholder=" "
                  />
                  <label
                    className="form-label"
                    htmlFor="loginEmail"
                  >
                    Your Email
                  </label>
                </div>

                {/* Password */}
                <div className="form-outline mb-4">
                  <input
                    type="password"
                    id="loginPassword"
                    className={`form-control form-control-lg ${styles.formControl}`}
                    placeholder=" "
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

