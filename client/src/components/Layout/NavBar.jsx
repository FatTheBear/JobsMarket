
import { Link, useNavigate, useLocation } from 'react-router-dom';
import './NavBar.css';
import React, { useState, useEffect } from 'react';
import axios from 'axios';

// 1. Khai báo state để React quản lý (giá trị mặc định là guest)


// 1. Cấu hình Menu cho tất cả các trạng thái (Kể cả Khách chưa đăng nhập)
const API_URL = 'http://localhost:5000';
const MENU_CONFIG = {
  guest: [
    { label: 'Explore', path: '/community' },
    { label: 'Companies', path: '/companies' },
    { label: 'Career Guide', path: '/guide' }
  ],
  candidate: [
    { label: 'Explore', path: '/community' },
    { label: 'My Applications', path: '/applications' },
    { label: 'Saved', path: '/saved' }
  ],
  company: [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Post a Job', path: '/company/jobs/create' },
    { label: 'Candidates', path: '/manage-candidates' }
  ],
  admin: [
    { label: 'Dashboard', path: '/admin' },
    { label: 'Users', path: '/admin/users' },
    { label: 'Approvals', path: '/admin/approvals' }
  ]
};

export default function NavBar() {
  console.log("navRENDER");
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    const token = localStorage.getItem("token");
    return !!token && token !== "undefined" && token !== "null";
  });
  const [role, setRole] = useState(() => {
    const rawRole = localStorage.getItem("role");
    const roleMap = {

      HR: "company",

      Candidate: "candidate",

      Admin: "admin",

    };

    return roleMap[rawRole] || "guest";
  });

  const [userName, setUserName] = useState('User');
  const [avatarUrl, setAvatarUrl] = useState('/default-avatar.png');
  //const navigate = useNavigate();
  const navigate = useNavigate();
  const location = useLocation();

 useEffect(() => {
    const fetchProfileData = async () => {
      const token = localStorage.getItem('token');
      const rawRole = localStorage.getItem('role');

      setIsLoggedIn(!!token);
      const roleMap = { HR: 'company', Candidate: 'candidate', Admin: 'admin' };
      const currentRole = token ? (roleMap[rawRole] || 'candidate') : 'guest';
      setRole(currentRole);

      if (token) {
        try {
          let url = '';
          if (currentRole === 'candidate') {
            url = `${API_URL}/api/candidate/profile`;
          } else if (currentRole === 'company') {
            url = `${API_URL}/api/company/profile`;
          }

          if (url) {
            const response = await axios.get(url, {
              headers: { Authorization: `Bearer ${token}` },
            });
            const profile = response.data;
            
            setUserName(profile.full_name || profile.name || profile.companyName || 'User');
            
            let avatar = profile.avatar_url || profile.logo_url;
            if (avatar && !avatar.startsWith('http')) {
              avatar = `${API_URL}${avatar}`;
            }
            setAvatarUrl(avatar || '/default-avatar.png');
          } else {
            setUserName(rawRole === 'HR' ? 'Company User' : 'Admin');
          }
        } catch (err) {
          console.error(err);
        }
      }
    };

    fetchProfileData();

    window.addEventListener('profileUpdated', fetchProfileData);
    return () => window.removeEventListener('profileUpdated', fetchProfileData);
  }, []);
  
  const menuItems = MENU_CONFIG[role] || [];
  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
    window.location.reload();
  };

  return (
    <nav className="minimal-navbar">
      {/* TRÁI: Logo (Bấm vào để về trang chủ) */}
      <div className="nav-brand" onClick={() => navigate('/')}>
        <span className="brand-logo">J</span>
        <span className="brand-text">JobsMarket</span>
      </div>

      {/* GIỮA: Menu thay đổi linh hoạt theo Role */}
      <div className="nav-menu">
        {menuItems.map((item, index) => (
          <button
            key={index}
            className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}
            onClick={() => navigate(item.path)}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* PHẢI: Khối hiển thị User hoặc Nút Login */}
      <div className="nav-profile-section">
        {isLoggedIn ? (
          // --- HIỂN THỊ KHI ĐÃ ĐĂNG NHẬP ---
          <>
            <div className="nav-user-info">
              <img
                src={avatarUrl}
                alt="Avatar"
                className="nav-avatar"
                onError={() => {
                  if (avatarUrl !== '/default-avatar.png') {
                    setAvatarUrl('/default-avatar.png');
                  }
                }}
              />

              <span
                className="nav-user-name"
                title={`Welcome, ${userName}`}
                onClick={() => navigate('/candidate/my-profile')}
                style={{ cursor: 'pointer' }}
              >
                {userName}
              </span>
            </div>
            <button className="nav-logout-btn" onClick={handleLogout} title="Log out">
              Log out
            </button>
          </>
        ) : (
          // --- HIỂN THỊ KHI CHƯA ĐĂNG NHẬP (TRANG LANDING PAGE) ---
          <>
            <button className="nav-link" onClick={() => navigate('/auth')}>
              Get Started
            </button>

            <button className="nav-signin-btn" onClick={() => navigate('/login')}>
              Sign In
            </button>
          </>
        )}
      </div>
    </nav>
  );
}


// export default function Navbar() {
//   const navigate = useNavigate();

//   const token = localStorage.getItem("token");
//   const role = localStorage.getItem("role") || "guest";

//   const menu = [];

//   return (
//     <div>
//       <button onClick={() => navigate("/")}>Home</button>
//     </div>
//   );
// }