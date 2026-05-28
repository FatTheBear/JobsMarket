import React from 'react';
import styles from './AuthPage.module.css';

export default function AuthPage() {
  return (
    <section className={`h-100 ${styles['h-custom']} ${styles['gradient-custom-2']}`}>
      <div className="container py-5 h-100">
        <div className="row d-flex justify-content-center align-items-center h-100">
          <div className="col-12">
            
            <div
              className={`card ${styles['card-registration']} ${styles['card-registration-2']}`}
              style={{ borderRadius: 15 }}
            >
              <div className="card-body p-0">
                <div className="row g-0">
             
                  <div className="col-lg-6">
                    <div className="p-5">
                      <h3 className="fw-normal mb-5" style={{ color: '#4835d4' }}>
                        Account Information
                      </h3>
                      
                      <div className="mb-4 pb-2">
                        <label className="form-label text-muted">Full Name</label>
                        <input type="text" className="form-control form-control-lg border" />
                      </div>

                      <div className="row">
                        <div className="col-md-6 mb-4 pb-2">
                          <label className="form-label text-muted">Date of Birth</label>
                          <input type="date" className="form-control form-control-lg border" />
                        </div>
                        <div className="col-md-6 mb-4 pb-2">
                          <label className="form-label text-muted">Phone Number</label>
                          <input type="tel" className="form-control form-control-lg border" />
                        </div>
                      </div>

                      <div className="mb-4 pb-2">
                        <label className="form-label text-muted">Email Address</label>
                        <input type="email" className="form-control form-control-lg border" />
                      </div>

                      <div className="row">
                        <div className="col-md-6 mb-4 pb-2 mb-md-0 pb-md-0">
                          <label className="form-label text-muted">Password</label>
                          <input type="password" className="form-control form-control-lg border" />
                        </div>
                        <div className="col-md-6">
                          <label className="form-label text-muted">Confirm Password</label>
                          <input type="password" className="form-control form-control-lg border" />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className={`col-lg-6 text-white ${styles['bg-indigo']}`}>
                    <div className="p-5">
                      <h3 className="fw-normal mb-5">Professional Profile</h3>
                      
                      <div className="mb-4 pb-2">
                        <label className="form-label text-white">Current Level (Student, Fresher, etc.)</label>
                        <input type="text" className="form-control form-control-lg border border-light text-white" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }} />
                      </div>

                      <div className="mb-4 pb-2">
                        <label className="form-label text-white">Expected Job Title</label>
                        <input type="text" className="form-control form-control-lg border border-light text-white" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }} placeholder="e.g. Python Developer" />
                      </div>

                      <div className="row">
                        <div className="col-md-5 mb-4 pb-2">
                          <label className="form-label text-white">Location</label>
                          <input type="text" className="form-control form-control-lg border border-light text-white" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }} placeholder="Ho Chi Minh City" />
                        </div>
                        <div className="col-md-7 mb-4 pb-2">
                          <label className="form-label text-white">Expected Salary</label>
                          <input type="text" className="form-control form-control-lg border border-light text-white" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }} placeholder="Negotiable" />
                        </div>
                      </div>

                      <div className="mb-4">
                        <label className="form-label text-white">LinkedIn / Portfolio URL</label>
                        <input type="url" className="form-control form-control-lg border border-light text-white" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }} placeholder="https://" />
                      </div>

                      <div className="form-check d-flex justify-content-start mb-4 pb-3 mt-4">
                        <input className="form-check-input me-3" type="checkbox" defaultValue="" id="form2Example3c" />
                        <label className="form-check-label text-white" htmlFor="form2Example3c">
                          I do accept the <a href="#!" className="text-white"><u>Terms and Conditions</u></a> of your site.
                        </label>
                      </div>

                      <button
                        type="button"
                        className="btn btn-light btn-lg text-dark fw-bold px-5"
                      >
                        Register
                      </button>

                    </div>
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