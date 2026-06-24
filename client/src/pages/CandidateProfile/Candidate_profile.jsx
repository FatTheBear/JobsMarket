import React, { useState, useEffect } from 'react';
import { useNavigate, NavLink, Outlet, useLocation } from 'react-router-dom';
import axios from 'axios';
import './Candidate_profile.css';
import { useWallet } from '../../context/WalletContext';

const axiosInstance = axios;

const formatDisplayDate = (isoDate) => {
  if (!isoDate) return '';
  const parts = isoDate.split('-');
  if (parts.length !== 3) return isoDate;
  return `${parts[2]}/${parts[1]}/${parts[0]}`;
};

const CandidateProfile = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showDropdown, setShowDropdown] = useState(false);

  // Notifications state
  const [notifications, setNotifications] = useState([]);
  const [loadingNotis, setLoadingNotis] = useState(false);
  const [notisError, setNotisError] = useState('');

  // Real Wallet Data
  const { fetchWalletInfo } = useWallet();

  const defaultFacebookAvatar = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23cccccc'><circle cx='12' cy='12' r='10' fill='%23e4e6eb'/><path d='M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z' fill='%23ffffff'/></svg>";

  // Dynamic Profile Data State
  const [profileData, setProfileData] = useState({
    displayName: '',
    jobTitle: '',
    address: '',
    fullName: '',
    email: '',
    phone: '',
    hidePhone: false,
    birthday: '',
    nationality: '',
    portfolio: '',
    github: '',
    facebook: '',
    blog: '',
    x: '',
    linkedin: '',
    avatar: defaultFacebookAvatar
  });

  // Dynamic States
  const [skills, setSkills] = useState([]);
  const [educations, setEducations] = useState([]);
  const [workExperiences, setWorkExperiences] = useState([]);
  const [languages, setLanguages] = useState([]);
  const [certifications, setCertifications] = useState([]);
  const [awards, setAwards] = useState([]);
  const [followedBusinesses, setFollowedBusinesses] = useState([]);
  const [candidatePosts, setCandidatePosts] = useState([]);
  const [cvList, setCvList] = useState([]);

  // Activity History State
  const [favoriteJobs, setFavoriteJobs] = useState([]);
  const [likedPosts, setLikedPosts] = useState([]);
  const [commentedPosts, setCommentedPosts] = useState([]);
  const [sharedPosts, setSharedPosts] = useState([]);

  const fetchCVs = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const res = await axiosInstance.get('http://localhost:5000/api/candidate/my-cvs', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCvList(res.data);
    } catch (err) {
      console.error("Lỗi lấy danh sách CV:", err);
    }
  };

  const fetchNotifications = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    setLoadingNotis(true);
    setNotisError('');
    try {
      const res = await axiosInstance.get('http://localhost:5000/api/candidate/notifications', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(res.data);
    } catch (err) {
      console.error("Lỗi lấy thông báo:", err);
      setNotisError("Failed to load notifications.");
    } finally {
      setLoadingNotis(false);
    }
  };

  const fetchActivityHistory = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const res = await axiosInstance.get('http://localhost:5000/api/posts/activity/history', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setLikedPosts(res.data.likes || []);
      setCommentedPosts(res.data.comments || []);
      setSharedPosts(res.data.shares || []);
    } catch (err) {
      console.error("Failed to load activity history from DB:", err);
    }
  };

  const handleMarkAsRead = async (notiId) => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      await axiosInstance.put(`http://localhost:5000/api/candidate/notifications/${notiId}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(prev => prev.map(n => n.id === notiId ? { ...n, is_read: 1 } : n));
    } catch (err) {
      console.error("Lỗi đánh dấu đã đọc:", err);
    }
  };

  const handleMarkAllAsRead = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      await axiosInstance.put('http://localhost:5000/api/candidate/notifications/read-all', {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(prev => prev.map(n => ({ ...n, is_read: 1 })));
    } catch (err) {
      console.error("Lỗi đánh dấu tất cả đã đọc:", err);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    const loadProfile = async () => {
      try {
        const res = await axiosInstance.get('http://localhost:5000/api/candidate/profile', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const profile = res.data;

        let calculatedAge = '';
        if (profile.birthday) {
          const birthDate = new Date(profile.birthday);
          const today = new Date();
          let age = today.getFullYear() - birthDate.getFullYear();
          const m = today.getMonth() - birthDate.getMonth();
          if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
          }
          calculatedAge = age.toString();
        }

        setProfileData(prev => ({
          ...prev,
          displayName: profile.display_name || profile.full_name || prev.displayName,
          fullName: profile.full_name || profile.display_name || prev.fullName,
          jobTitle: profile.headline || prev.jobTitle,
          address: profile.address || prev.address,
          email: profile.email || prev.email,
          phone: profile.phone || prev.phone || '',
          birthday: profile.birthday ? formatDisplayDate(profile.birthday.substring(0, 10)) : '',
          age: calculatedAge || '',
          hidePhone: localStorage.getItem('hide_phone_' + profile.email) === 'true',
          avatar: profile.avatar_url || defaultFacebookAvatar,
          portfolio: profile.portfolio || '',
          github: profile.github || '',
          facebook: profile.facebook || '',
          blog: profile.blog || '',
          x: profile.x || '',
          linkedin: profile.linkedin || '',
          about: profile.about || '',
          nationality: profile.nationality || ''
        }));

        if (profile.skills && Array.isArray(profile.skills)) {
          setSkills(profile.skills.map((s, idx) => ({ id: idx + 1, name: s.name, level: s.level })));
        }

        if (profile.education && Array.isArray(profile.education)) {
          const formatMonthYear = (val) => {
            if (!val) return '';
            const parts = val.split('-');
            if (parts.length === 2) return `${parts[1]}/${parts[0]}`;
            return val;
          };

          setEducations(profile.education.map((e, idx) => {
            let durationText = '';
            if (e.gradDate) {
              durationText = formatMonthYear(e.gradDate);
            } else if (e.startDate) {
              durationText = formatMonthYear(e.startDate);
            } else {
              durationText = 'Present';
            }

            return {
              id: idx + 1,
              degree: e.degree || 'Degree / Field of Study',
              school: e.school || 'School / Institute',
              duration: durationText,
              startDate: e.startDate,
              gradDate: e.gradDate,
              description: e.description || ''
            };
          }));
        }

        if (profile.experience && Array.isArray(profile.experience)) {
          const formatMonthYear = (val) => {
            if (!val) return '';
            const parts = val.split('-');
            if (parts.length === 2) return `${parts[1]}/${parts[0]}`;
            return val;
          };

          setWorkExperiences(profile.experience.map((e, idx) => {
            let durationText = '';
            if (e.startDate && e.endDate) {
              durationText = `${formatMonthYear(e.startDate)} - ${formatMonthYear(e.endDate)}`;
            } else if (e.startDate) {
              durationText = `${formatMonthYear(e.startDate)} - Present`;
            } else if (e.endDate) {
              durationText = formatMonthYear(e.endDate);
            } else {
              durationText = 'Present';
            }

            return {
              id: idx + 1,
              role: e.role || 'Job Title',
              company: e.company || 'Company Name',
              duration: durationText,
              startDate: e.startDate,
              endDate: e.endDate,
              description: e.description || ''
            };
          }));
        }

        try {
          const followRes = await axiosInstance.get('http://localhost:5000/api/candidate/companies', {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (followRes.data && Array.isArray(followRes.data)) {
            const followedOnly = followRes.data.filter(c => c.is_followed);
            if (followedOnly.length > 0) {
              setFollowedBusinesses(followedOnly.map(c => ({
                id: c.id,
                name: c.name,
                category: c.industry_name || 'Professional',
                avatar: c.avatar_url || ''
              })));
            } else {
              setFollowedBusinesses([
                { id: 991, name: 'Alice Smith', category: 'Senior UX/UI Designer', avatar: 'https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-chat/ava3.webp' },
                { id: 992, name: 'David Lee', category: 'Lead DevOps Engineer', avatar: 'https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-chat/ava4.webp' },
                { id: 993, name: 'Emma Watson', category: 'Product Manager', avatar: 'https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-chat/ava5.webp' }
              ]);
            }
          } else {
            setFollowedBusinesses([
              { id: 991, name: 'Alice Smith', category: 'Senior UX/UI Designer', avatar: 'https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-chat/ava3.webp' },
              { id: 992, name: 'David Lee', category: 'Lead DevOps Engineer', avatar: 'https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-chat/ava4.webp' },
              { id: 993, name: 'Emma Watson', category: 'Product Manager', avatar: 'https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-chat/ava5.webp' }
            ]);
          }
        } catch (followErr) {
          console.error("Failed to load followed candidates, using mock fallback:", followErr);
          setFollowedBusinesses([
            { id: 991, name: 'Alice Smith', category: 'Senior UX/UI Designer', avatar: 'https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-chat/ava3.webp' },
            { id: 992, name: 'David Lee', category: 'Lead DevOps Engineer', avatar: 'https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-chat/ava4.webp' },
            { id: 993, name: 'Emma Watson', category: 'Product Manager', avatar: 'https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-chat/ava5.webp' }
          ]);
        }

        try {
          const postsRes = await axiosInstance.get(`http://localhost:5000/api/posts/user/${profile.user_id}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (postsRes.data && Array.isArray(postsRes.data)) {
            setCandidatePosts(postsRes.data.map(p => ({
              id: p.id,
              user_id: p.user_id,
              author: p.author_name || profile.full_name || 'Candidate',
              avatar: p.author_avatar || profile.avatar_url || defaultFacebookAvatar,
              time: p.created_at ? new Date(p.created_at).toLocaleDateString('vi-VN') : 'Just now',
              content: p.content,
              mediaList: p.mediaList || [],
              likes: p.likes_count || 0,
              comments: p.comments_count || 0,
              shares: p.reposts_count || 0,
              is_liked: p.is_liked || 0,
              user_role: p.user_role,
              parent_post_id: p.parent_post_id,
              parent_author_id: p.parent_author_id,
              parent_content: p.parent_content,
              parent_media_url: p.parent_media_url,
              parent_media_type: p.parent_media_type,
              parent_author_name: p.parent_author_name,
              parent_author_avatar: p.parent_author_avatar,
              parent_user_role: p.parent_user_role,
              parent_author_title: p.parent_author_title,
              parent_created_at: p.parent_created_at
            })));
          }
        } catch (postsErr) {
          console.error("Failed to load user posts from DB, using empty fallback:", postsErr);
          setCandidatePosts([]);
        }

        if (profile.languages) {
          const parsed = typeof profile.languages === 'string' ? JSON.parse(profile.languages) : profile.languages;
          if (Array.isArray(parsed)) setLanguages(parsed);
        }
        if (profile.certifications) {
          const parsed = typeof profile.certifications === 'string' ? JSON.parse(profile.certifications) : profile.certifications;
          if (Array.isArray(parsed)) setCertifications(parsed);
        }
        if (profile.awards) {
          const parsed = typeof profile.awards === 'string' ? JSON.parse(profile.awards) : profile.awards;
          if (Array.isArray(parsed)) setAwards(parsed);
        }

      } catch (err) {
        console.error("Failed to load database profile, using mock fallbacks:", err);
      }
    };

    loadProfile();
    fetchCVs();
    fetchNotifications();
    fetchActivityHistory();

    const localFavJobs = localStorage.getItem('activity_fav_jobs');

    if (localFavJobs) {
      setFavoriteJobs(JSON.parse(localFavJobs));
    } else {
      const defaultJobs = [
        { id: 1, title: 'Senior React Developer', company_name: 'VNG Corporation', logo_url: '', job_type: 'Full-time', salary: '30M - 50M VND', saved_at: new Date().toISOString() },
        { id: 2, title: 'UI/UX Designer', company_name: 'FPT Software', logo_url: '', job_type: 'Remote', salary: '20M - 35M VND', saved_at: new Date(Date.now() - 86400000).toISOString() },
      ];
      setFavoriteJobs(defaultJobs);
      localStorage.setItem('activity_fav_jobs', JSON.stringify(defaultJobs));
    }
  }, []);

  const saveToServer = async (overrideData = {}) => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const formData = new FormData();
      formData.append('full_name', profileData.fullName);
      formData.append('display_name', profileData.displayName);
      formData.append('phone', profileData.phone || '');
      formData.append('headline', profileData.jobTitle || '');
      formData.append('address', profileData.address || '');
      formData.append('about', profileData.about || '');
      formData.append('nationality', profileData.nationality || '');
      formData.append('portfolio', profileData.portfolio || '');
      formData.append('github', profileData.github || '');
      formData.append('facebook', profileData.facebook || '');
      formData.append('blog', profileData.blog || '');
      formData.append('x', profileData.x || '');
      formData.append('linkedin', profileData.linkedin || '');

      const birthdayParts = (profileData.birthday || '').trim().split('/');
      const apiBirthday = birthdayParts.length === 3 ? `${birthdayParts[2]}-${birthdayParts[1]}-${birthdayParts[0]}` : '';
      formData.append('birthday', apiBirthday);

      const currentEdu = overrideData.educations || educations;
      const currentExp = overrideData.workExperiences || workExperiences;
      const currentSkills = overrideData.skills || skills;

      formData.append('education', JSON.stringify(currentEdu.map(edu => ({
        school: edu.school, degree: edu.degree, startDate: edu.startDate, gradDate: edu.gradDate, description: edu.description
      }))));
      formData.append('experience', JSON.stringify(currentExp.map(exp => ({
        company: exp.company, role: exp.role, startDate: exp.startDate, endDate: exp.endDate, description: exp.description
      }))));
      formData.append('skills', JSON.stringify(currentSkills.map(s => ({ name: s.name, level: s.level }))));

      const currentLang = overrideData.languages || languages;
      const currentCert = overrideData.certifications || certifications;
      const currentAwards = overrideData.awards || awards;

      formData.append('languages', JSON.stringify(currentLang));
      formData.append('certifications', JSON.stringify(currentCert));
      formData.append('awards', JSON.stringify(currentAwards));

      await axiosInstance.put('http://localhost:5000/api/candidate/profile', formData, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
      });
      console.log('Auto-saved successfully!');
      window.dispatchEvent(new Event('profileUpdated'));
    } catch (err) {
      console.error('Auto-save failed:', err);
    }
  };

  const getPageTitle = () => {
    const path = location.pathname;
    if (path.endsWith('/account-settings')) return 'Account Settings';
    if (path.endsWith('/notifications')) return 'Notifications';
    if (path.endsWith('/activity-history')) return 'Activity History';
    if (path.endsWith('/applied-jobs')) return 'Applied Jobs';
    if (path.endsWith('/manage-cvs')) return 'Manage CVs';
    return 'My Profile';
  };

  return (
    <section className="profile-section">
      <div className="container py-5">
        {/* Navigation back & Dropdown */}
        <div className="mb-4 d-flex justify-content-between align-items-center">
          <button
            onClick={() => navigate('/dashboard')}
            className="btn btn-link text-secondary text-decoration-none d-inline-flex align-items-center gap-2 fw-semibold p-0"
            style={{ fontSize: '0.95rem' }}
          >
            <i className="fas fa-chevron-left" style={{ fontSize: '0.8rem' }}></i> Back to dashboard
          </button>

          {/* Right Dropdown menu instead of Sidebar */}
          <div className="profile-menu-dropdown">
            <button
              type="button"
              className="dropdown-toggle-custom"
              onClick={() => setShowDropdown(!showDropdown)}
            >
              <i className="far fa-user-circle"></i>
              <span>{getPageTitle()}</span>
              <i className={`fas fa-chevron-${showDropdown ? 'up' : 'down'}`}></i>
            </button>
            {showDropdown && (
              <div className="dropdown-menu dropdown-menu-right show dropdown-menu-custom position-absolute end-0 mt-2" style={{ zIndex: 1000, minWidth: '220px' }}>
                <NavLink
                  to="/candidate/my-profile"
                  end
                  className={({ isActive }) => `dropdown-item dropdown-item-custom w-100 text-start ${isActive ? 'active' : ''}`}
                  onClick={() => setShowDropdown(false)}
                >
                  <i className="far fa-user-circle me-2"></i> My Profile
                </NavLink>
                <NavLink
                  to="/candidate/my-profile/account-settings"
                  className={({ isActive }) => `dropdown-item dropdown-item-custom w-100 text-start ${isActive ? 'active' : ''}`}
                  onClick={() => setShowDropdown(false)}
                >
                  <i className="fas fa-sliders-h me-2"></i> Account Settings
                </NavLink>
                <NavLink
                  to="/candidate/my-profile/activity-history"
                  className={({ isActive }) => `dropdown-item dropdown-item-custom w-100 text-start ${isActive ? 'active' : ''}`}
                  onClick={() => setShowDropdown(false)}
                >
                  <i className="fas fa-history me-2"></i> Activity History
                </NavLink>
                <NavLink
                  to="/candidate/my-profile/notifications"
                  className={({ isActive }) => `dropdown-item dropdown-item-custom w-100 text-start ${isActive ? 'active' : ''}`}
                  onClick={() => setShowDropdown(false)}
                >
                  <i className="far fa-bell me-2"></i> Notifications
                  {notifications.filter(n => !n.is_read).length > 0 && (
                    <span className="badge rounded-pill bg-danger ms-2">
                      {notifications.filter(n => !n.is_read).length}
                    </span>
                  )}
                </NavLink>
                <NavLink
                  to="/candidate/my-profile/applied-jobs"
                  className={({ isActive }) => `dropdown-item dropdown-item-custom w-100 text-start ${isActive ? 'active' : ''}`}
                  onClick={() => setShowDropdown(false)}
                >
                  <i className="fas fa-briefcase me-2"></i> Applied Jobs
                </NavLink>
                <NavLink
                  to="/candidate/my-profile/manage-cvs"
                  className={({ isActive }) => `dropdown-item dropdown-item-custom w-100 text-start ${isActive ? 'active' : ''}`}
                  onClick={() => setShowDropdown(false)}
                >
                  <i className="far fa-file-pdf me-2"></i> Manage CVs
                </NavLink>
              </div>
            )}
          </div>
        </div>

        <div className="row">
          <div className="col-12">
            <Outlet
              context={{
                profileData,
                setProfileData,
                skills,
                setSkills,
                educations,
                setEducations,
                workExperiences,
                setWorkExperiences,
                languages,
                setLanguages,
                certifications,
                setCertifications,
                awards,
                setAwards,
                candidatePosts,
                setCandidatePosts,
                notifications,
                setNotifications,
                loadingNotis,
                notisError,
                fetchNotifications,
                saveToServer,
                favoriteJobs,
                setFavoriteJobs,
                likedPosts,
                setLikedPosts,
                commentedPosts,
                setCommentedPosts,
                sharedPosts,
                setSharedPosts,
                fetchActivityHistory,
                cvList,
                fetchCVs,
                handleMarkAsRead,
                handleMarkAllAsRead
              }}
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default CandidateProfile;