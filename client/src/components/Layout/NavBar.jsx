
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
    { label: 'Home', path: '/dashboard' },
    { label: 'Explore', path: '/community' },
    { label: 'My Applications', path: '/applications' },
    { label: 'Saved', path: '/saved' }
  ],
  company: [
    { label: 'Explore', path: '/community' },
    { label: 'Dashboard', path: '/company/dashboard' },
    { label: 'Post a Job', path: '/company/post-job' },
    { label: 'Candidates', path: '/company/applicants' }
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
                style={{ cursor: 'pointer' }}
                onClick={() => {
                  if (role === 'candidate') {
                    navigate('/candidate/my-profile');
                  } else if (role === 'company') {
                    navigate('/company/profile');
                  } else if (role === 'admin') {
                    navigate('/admin');
                  }
                }}
                onError={(e) => {
                  console.log("NavBar - img load error for avatarUrl:", avatarUrl ? avatarUrl.substring(0, 80) + "..." : null, e && e.nativeEvent ? e.nativeEvent : e);
                  if (avatarUrl && !avatarUrl.startsWith('data:image') && avatarUrl !== '/img/default-avatar.png') {
                    // fallback to default
                    setAvatarUrl('/img/default-avatar.png');
                  }
                }}
              />

              <span
                className="nav-user-name"
                title={`Welcome, ${userName}`}
                onClick={() => {
                  if (role === 'candidate') {
                    navigate('/candidate/my-profile');
                  } else if (role === 'company') {
                    navigate('/company/profile');
                  } else if (role === 'admin') {
                    navigate('/admin');
                  }
                }}
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