import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './HomePage.module.css';

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <div className={styles.container}>

      <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
        <div className="container-fluid">
          <a className="navbar-brand ms-3" href="#">JobsMarket</a>
          <button className="btn btn-outline-light ms-auto me-3" onClick={() => navigate('/login')}>
            Sign In
          </button>
        </div>
      </nav>


      <div className={styles.heroSection}>
        <h1 className={styles.title}>Find Your Dream Job</h1>
        <p className={styles.subtitle}>
          Connecting top talent with leading enterprises.
          An intelligent recruitment platform for both candidates and employers.
        </p>
        <button
          className={`btn btn-primary ${styles.button}`}
          onClick={() => navigate('/auth')}
        >
          Get Started
        </button>
      </div>
    </div>
  );
}