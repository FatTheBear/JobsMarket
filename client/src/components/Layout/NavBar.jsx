
import { useNavigate, useLocation } from 'react-router-dom';
import './NavBar.css';
import React, { useState, useEffect } from 'react'; // 

// 1. Khai báo state để React quản lý (giá trị mặc định là guest)


// 1. Cấu hình Menu cho tất cả các trạng thái (Kể cả Khách chưa đăng nhập)
const MENU_CONFIG = {
  guest: [
    { label: 'Find Jobs', path: '/jobs' },
    { label: 'Companies', path: '/companies' },
    { label: 'Career Guide', path: '/guide' }
  ],
  candidate: [
    { label: 'Find Jobs', path: '/jobs' },
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

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [role, setRole] = useState('guest');
  const [userName, setUserName] = useState('User');
  const [avatarUrl, setAvatarUrl] = useState('/default-avatar.png');
  const navigate = useNavigate();
  const location = useLocation();

  // Tạm thời comment logic localStorage lại, dùng state cứng
  // const [isLoggedIn, setIsLoggedIn] = useState(true); // Ép cứng là true để xem nó còn giật không
  // const [role, setRole] = useState('company');        // Ép cứng role để test menu
  //2. useEffect để lấy dữ liệu từ localStorage đúng 1 lần khi load trang
  useEffect(() => {
    const token = localStorage.getItem("token");
    const isLoggedIn = !!token;
    const rawRole = localStorage.getItem("role");
    const roleMap = {

      HR: "company",

      Candidate: "candidate",

      Admin: "admin",

    };
    const role = isLoggedIn ? (roleMap[rawRole] || "candidate") : "guest";
    const menuItems = MENU_CONFIG[role] || [];
    const handleLogout = () => {
      localStorage.clear();
      navigate('/');
      window.location.reload();
    };
  }, []);
}
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
              onError={(e) => { e.target.src = '/default-avatar.png' }}
            />
            <span className="nav-user-name">{userName}</span>
          </div>
          <button className="nav-logout-btn" onClick={handleLogout} title="Log out">
            Sign out
          </button>
        </>
      ) : (
        // --- HIỂN THỊ KHI CHƯA ĐĂNG NHẬP (TRANG LANDING PAGE) ---
        <>
          <button className="nav-link" onClick={() => navigate('/auth')}>
            For Employers
          </button>
          {/* Nút Sign In điều hướng tới /auth như bạn yêu cầu */}
          <button className="nav-signin-btn" onClick={() => navigate('/auth')}>
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