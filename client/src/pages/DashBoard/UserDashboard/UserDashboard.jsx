import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from "./UserDashboard.module.css";

export default function MainDashboard() {
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate('/login');
  };

  return (
    <div className={styles.container}>
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
        <div className="container-fluid">
          <a className="navbar-brand ms-3" href="#">JobsMarket Dashboard</a>
          <button 
            className="btn btn-outline-light ms-auto me-3" 
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      </nav>

      <div className={styles.heroSection}>
        <h1 className={styles.title}>Welcome Back! 🎉</h1>
        <p className={styles.subtitle}>
          You have successfully logged in. 
          Explore new opportunities, manage your applications, and update your profile.
        </p>
        <button 
          className={`btn btn-primary ${styles.button}`}
          onClick={() => console.log("Feature coming soon!")}
        >
          Explore Jobs
        </button>
      </div>
    </div>
  );
}