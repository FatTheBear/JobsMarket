import { Link, useNavigate, useLocation } from 'react-router-dom';
import './NavBar.css';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';

// 1. Khai báo state để React quản lý (giá trị mặc định là guest)


// 1. Cấu hình Menu cho tất cả các trạng thái (Kể cả Khách chưa đăng nhập)
const API_URL = 'http://localhost:5000';
const MENU_CONFIG = {
  guest: [
    { label: 'Home', path: '/' },
    { label: 'Find Jobs', path: '/companies' },
    { label: 'Career Hub', path: '/community' },
    { label: 'Career Guide', path: '/guide' },

  ],
  candidate: [
    { label: 'Home', path: '/dashboard' },
    { label: 'Find Jobs', path: '/companies' },
    { label: 'Career Hub', path: '/community' },
    { label: 'Career Guide', path: '/guide' },
  ],
  company: [
    { label: 'Home', path: '/company/dashboard' },
    { label: 'Find Candidates', path: '/company/applicants' },
    { label: 'Hiring Hub', path: '/community' },
    { label: 'Hiring Insights', path: '/company/post-job' },
   
  ],
  admin: [
    { label: 'Home', path: '/admin' },
    { label: 'Industry', path: '/admin/users' },
    { label: 'Posts', path: '/admin/approvals' }
  ]
};

export default function NavBar() {
  console.log("navRENDER");
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    const token = localStorage.getItem("token");
    return !!token && token !== "undefined" && token !== "null";
  });
  const [role, setRole] = useState(() => {
    const userObj = JSON.parse(localStorage.getItem("user")) || null;
    const rawRole = userObj?.role;
    const roleMap = {
      HR: "company",
      Candidate: "candidate",
      Admin: "admin",
    };

    return roleMap[rawRole] || "guest";
  });

  const [userName, setUserName] = useState('User');
  const [avatarUrl, setAvatarUrl] = useState('/img/default-avatar.png');
  //const navigate = useNavigate();
  const navigate = useNavigate();
  const location = useLocation();

 useEffect(() => {
    const fetchProfileData = async () => {
      const token = localStorage.getItem('token');
      const userObj = JSON.parse(localStorage.getItem('user')) || null;
      const rawRole = userObj?.role;

      const hasToken = !!token && token !== 'undefined' && token !== 'null';
      setIsLoggedIn(hasToken);
      const roleMap = { HR: 'company', Candidate: 'candidate', Admin: 'admin' };
      const currentRole = hasToken ? (roleMap[rawRole] || 'candidate') : 'guest';
      setRole(currentRole);

      if (hasToken) {
        try {
          let url = '';
          if (currentRole === 'candidate') {
            url = `${API_URL}/api/candidate/profile`;
          } else if (currentRole === 'company') {
            const userId = localStorage.getItem('userId');
            url = `${API_URL}/api/company/${userId}`;
          }

          if (url) {
            const response = await axios.get(url, {
              headers: { Authorization: `Bearer ${token}` },
            });
            const profile = response.data;
            console.log("NavBar - Profile data received:", {
              name: profile.name,
              displayName: profile.display_name,
              fullName: profile.full_name,
              companyName: profile.companyName,
              avatar_url: profile.avatar_url,
              logo_url: profile.logo_url ? profile.logo_url.substring(0, 50) + "..." : null
            });
            
            setUserName(profile.display_name || profile.full_name || profile.name || profile.companyName || 'User');
            
            let avatar = profile.avatar_url || profile.logo_url;
            if (avatar) avatar = avatar.trim();
            console.log("NavBar - raw avatar selected:", avatar ? avatar.substring(0, 50) + "..." : null);
            if (avatar && !avatar.startsWith('http') && !avatar.startsWith('data:image')) {
              avatar = `${API_URL}${avatar}`;
            }
            console.log("NavBar - final avatarUrl to set:", avatar ? avatar.substring(0, 50) + "..." : null);
            setAvatarUrl(avatar || '/img/default-avatar.png');
          } else {
            setUserName(rawRole === 'HR' ? 'Company User' : 'Admin');
          }
        } catch (err) {
          console.error("Profile fetch failed:", err);
          if (err.response && (err.response.status === 401 || err.response.status === 403)) {
            localStorage.clear();
            setIsLoggedIn(false);
            setRole('guest');
            setUserName('User');
            setAvatarUrl('/img/default-avatar.png');
          }
        }
      }
    };

    fetchProfileData();

    const avatarHandler = (ev) => {
      (async () => {
        try {
          const received = ev?.detail?.avatar;
          console.log('NavBar - profileUpdatedWithAvatar received:', received ? (received.substring ? received.substring(0, 100) : received) : received);
          if (!received) return;
          let final = received;
          if (!final.startsWith('http') && !final.startsWith('data:')) {
            final = final.startsWith('/') ? `${API_URL}${final}` : `${API_URL}/${final}`;
          }
          console.log('NavBar - profileUpdatedWithAvatar final avatarUrl (pre-fetch):', final.substring ? final.substring(0, 200) : final);

          // If it's a data URL, set directly
          if (final.startsWith('data:')) {
            setAvatarUrl(final);
            return;
          }

          // Try fetching the image to validate accessibility and create a blob URL.
          let primaryFailed = false;
          try {
            const resp = await fetch(final, { cache: 'no-store' });
            if (resp.ok) {
              const blob = await resp.blob();
              const objectUrl = URL.createObjectURL(blob);
              console.log('NavBar - fetched avatar successfully, using object URL');
              setAvatarUrl(objectUrl);
              return;
            } else {
              console.warn('NavBar - fetch failed for avatar:', resp.status, resp.statusText);
              primaryFailed = true;
            }
          } catch (fetchErr) {
            console.warn('NavBar - fetch error for avatarUrl:', fetchErr && fetchErr.message ? fetchErr.message : fetchErr);
            primaryFailed = true;
          }

          // If primary path failed, attempt alternate location under /uploads/avatars/
          if (primaryFailed && !final.includes('/uploads/avatars/')) {
            try {
              const filename = final.split('/').pop();
              const alt = `${API_URL}/uploads/avatars/${filename}`;
              console.log('NavBar - attempting alternate avatar URL:', alt);
              const altResp = await fetch(alt, { cache: 'no-store' });
              if (altResp.ok) {
                const blob = await altResp.blob();
                const objectUrl = URL.createObjectURL(blob);
                console.log('NavBar - fetched avatar from alternate path, using object URL');
                setAvatarUrl(objectUrl);
                return;
              } else {
                console.warn('NavBar - alternate fetch failed:', altResp.status, altResp.statusText);
              }
            } catch (altErr) {
              console.warn('NavBar - alternate fetch error for avatarUrl:', altErr && altErr.message ? altErr.message : altErr);
            }
          }

          // Fallback: set direct URL so browser will attempt to load it (and onError will handle)
          setAvatarUrl(final);
        } catch (e) {
          console.error('NavBar - avatarHandler error', e);
        }
      })();
    };

    window.addEventListener('profileUpdated', fetchProfileData);
    window.addEventListener('profileUpdatedWithAvatar', avatarHandler);
    return () => {
      window.removeEventListener('profileUpdated', fetchProfileData);
      window.removeEventListener('profileUpdatedWithAvatar', avatarHandler);
    };
  }, []);
  
  const menuItems = MENU_CONFIG[role] || [];
  console.log("NavBar rendering - role:", role, "menuItems:", menuItems);
  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
    window.location.reload();
  };
  const handleProfileNavigation = () => {
    if (role === 'candidate') navigate('/candidate/my-profile');
    else if (role === 'company') navigate('/company/profile');
    else if (role === 'admin') navigate('/admin');
  };

  return (
    <nav className="minimal-navbar">
      {/* TRÁI: Logo (Bấm vào để về trang chủ) */}
      <div className="nav-brand" onClick={() => navigate('/')}>
        <span className="brand-logo">J</span>
        <span className="brand-text">JobsMarket</span>
      </div>

      
      <div className="nav-menu">
        {menuItems.map((item, index) => {
          const isActive = location.pathname === item.path; 
          return (
            <button
              key={index}
              className={`nav-link ${isActive ? 'active' : ''}`}
              onClick={() => navigate(item.path)}
            >
              {item.label}

              {isActive && (
                <motion.div
                  layoutId="nav-indicator"
                  className="active-indicator"
                  transition={{ type: "spring", stiffness: 120, damping: 20 }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* PHẢI: Khối hiển thị User hoặc Nút Login */}
      <div className="nav-profile-section">
        {isLoggedIn ? (
          // --- HIỂN THỊ KHI ĐÃ ĐĂNG NHẬP ---
          <>
            <div className="nav-user-info">
              <div className="nav-notification">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#5a5a5a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                  <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                </svg>
                <span className="notification-dot"></span>
              </div>

              <img
                src={avatarUrl}
                alt="Avatar"
                className="nav-avatar"
                onClick={handleProfileNavigation}
                onError={(e) => {
                  if (avatarUrl && !avatarUrl.startsWith('data:image') && avatarUrl !== '/img/default-avatar.png') {
                    setAvatarUrl('/img/default-avatar.png');
                  }
                }}
              />

              <span
                className="nav-user-name"
                title={`Welcome, ${userName}`}
                onClick={handleProfileNavigation}
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
            <button className="nav-link-guest" onClick={() => navigate('/auth')}>
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