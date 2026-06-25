import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Login.module.css';

export default function RegistrationPending() {
  const navigate = useNavigate();

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
                <div className="card-body p-5 text-center">
                  
                  <div className="mb-4">
                    <i className="fas fa-hourglass-half text-warning" style={{ fontSize: '4rem' }}></i>
                  </div>

                  <h2 className="text-uppercase mb-4" style={{ color: '#01796F' }}>
                    Registration Submitted
                  </h2>
                  
                  <p className="text-muted mb-4 fs-5">
                    Your company registration has been successfully received and is currently under review by our administrators.
                  </p>
                  
                  <p className="text-muted mb-5">
                    Once approved, you will receive an email with an activation code to access your account. Please check your inbox (and spam folder) within the next 24-48 hours.
                  </p>

                  <div className="d-flex justify-content-center">
                    <button
                      onClick={() => navigate('/')}
                      className={`btn btn-success btn-block btn-lg px-5 ${styles.gradientCustom4}`}
                    >
                      Back to Home
                    </button>
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