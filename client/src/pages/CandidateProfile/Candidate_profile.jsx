import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Candidate_profile.css';
import CandidatePersonalInfoModal from './CandidatePersonalInfoModal';
import CandidateExperience, { CandidateExperienceManager } from './CandidateExperience';
import CandidateEducation, { CandidateEducationManager } from './CandidateEducation';
import CandidateSkills, { CandidateSkillsManager } from './CandidateSkills';
import CandidatePosts from './CandidatePosts';
import CandidateWallet from './CandidateWallet';
import CandidateCV from './CandidateCV';
import CandidateExportModal from './CandidateExportModal';
import CandidateAppliedJobs from './CandidateAppliedJobs';
import { useWallet } from '../../context/WalletContext';
import RechargeCoins from './RechargeCoins';


const splitFullName = (fullName = '') => {
  const parts = fullName.trim().split(' ');
  if (parts.length <= 1) {
    return { firstName: fullName, lastName: '' };
  }
  const lastName = parts.pop();
  const firstName = parts.join(' ');
  return { firstName, lastName };
};

const CandidateProfile = () => {
  const navigate = useNavigate();
  const [showEdit, setShowEdit] = useState(false);
  const [showPersonalInfo, setShowPersonalInfo] = useState(false);
  const [activeEditTab, setActiveEditTab] = useState('info'); // 'info' or 'profile'
  const [showWallet, setShowWallet] = useState(false);
  const [modalError, setModalError] = useState('');

  // Tab state & Notifications state
  const [activeTab, setActiveTab] = useState('account'); // 'account', 'settings', 'wallet', 'notifications'
  const [notifications, setNotifications] = useState([]);
  const [loadingNotis, setLoadingNotis] = useState(false);
  const [notisError, setNotisError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [activeWalletTab, setActiveWalletTab] = useState('history');
  

  // Real Wallet Data
  const { coins, transactions, fetchWalletInfo } = useWallet();

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
    nationality: '',
    portfolio: '',
    github: '',
    facebook: '',
    avatar: defaultFacebookAvatar
  });

  // Dynamic Skills State
  const [skills, setSkills] = useState([]);

  const [educations, setEducations] = useState([]);
  const [workExperiences, setWorkExperiences] = useState([]);

  const [followedBusinesses, setFollowedBusinesses] = useState([]);

  const [candidatePosts, setCandidatePosts] = useState([]);

  const [cvList, setCvList] = useState([]); // Mảng chứa danh sách CV

  // Activity History State
  const [favoriteJobs, setFavoriteJobs] = useState([]);
  const [likedPosts, setLikedPosts] = useState([]);
  const [commentedPosts, setCommentedPosts] = useState([]);
  const [sharedPosts, setSharedPosts] = useState([]);
  const [activitySubTab, setActivitySubTab] = useState('jobs'); // 'jobs', 'likes', 'comments', 'shares'

  // Hàm gọi API lấy danh sách CV
  const fetchCVs = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const res = await axios.get('http://localhost:5000/api/candidate/my-cvs', {
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
      const res = await axios.get('http://localhost:5000/api/candidate/notifications', {
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

  const handleMarkAsRead = async (notiId) => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      await axios.put(`http://localhost:5000/api/candidate/notifications/${notiId}/read`, {}, {
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
      await axios.put('http://localhost:5000/api/candidate/notifications/read-all', {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(prev => prev.map(n => ({ ...n, is_read: 1 })));
    } catch (err) {
      console.error("Lỗi đánh dấu tất cả đã đọc:", err);
    }
  };

  const handleChangeEmailClick = () => {
    alert("Change Email Request:\nPlease contact the administrator at support@jobsmarket.com to verify and update your primary email address.");
  };

  const handleChangePasswordClick = () => {
    const newPassword = window.prompt("Enter your new password:");
    if (newPassword) {
      if (newPassword.length < 6) {
        alert("Password must be at least 6 characters long!");
      } else {
        alert("Password change request submitted successfully!");
      }
    }
  };

  const handleLogoutClick = () => {
    if (window.confirm("Are you sure you want to log out?")) {
      localStorage.removeItem('token');
      navigate('/login');
    }
  };

  const handleDeleteAccountClick = () => {
    const confirmDelete = window.confirm("WARNING:\nAre you sure you want to permanently delete your account? This action CANNOT be undone.");
    if (confirmDelete) {
      alert("Account deletion request submitted to administrator. Your account will be deactivated shortly.");
      localStorage.removeItem('token');
      navigate('/login');
    }
  };

  const handleSaveProfileSettings = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) return;

    const fullNameCombined = (editProfileForm.fullName || '').trim();

    // Validate Full Name
    if (!fullNameCombined) {
      alert('Full Name is required!');
      return;
    }
    if (!lettersOnlyRegex.test(fullNameCombined)) {
      alert('Full Name can only contain letters and spaces!');
      return;
    }
    // Validate Phone Number
    if (editProfileForm.phone && editProfileForm.phone.trim() && !/^\d{10}$/.test(editProfileForm.phone.trim())) {
      alert('Phone Number must be exactly 10 digits!');
      return;
    }

    // Validate Job Title (if provided)
    if (editProfileForm.jobTitle && editProfileForm.jobTitle.trim() && !lettersOnlyRegex.test(editProfileForm.jobTitle.trim())) {
      alert('Job Title can only contain letters and spaces!');
      return;
    }

    // Validate Nationality (if provided)
    if (editProfileForm.nationality && editProfileForm.nationality.trim() && !lettersOnlyRegex.test(editProfileForm.nationality.trim())) {
      alert('Nationality can only contain letters and spaces!');
      return;
    }

    // Validate Portfolio (if provided)
    if (editProfileForm.portfolio && editProfileForm.portfolio.trim()) {
      const urlRegex = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([\/\w .-]*)*\/?$/i;
      if (!urlRegex.test(editProfileForm.portfolio.trim())) {
        alert('Portfolio must be a valid URL (e.g., https://myportfolio.com)!');
        return;
      }
    }
    // Validate GitHub (if provided)
    if (editProfileForm.github && editProfileForm.github.trim()) {
      const githubRegex = /^(https?:\/\/)?(www\.)?github\.com\/[a-zA-Z0-9_-]+\/?$/i;
      if (!githubRegex.test(editProfileForm.github.trim())) {
        alert('GitHub link must be a valid profile URL (e.g., https://github.com/username)!');
        return;
      }
    }
    // Validate Facebook (if provided)
    if (editProfileForm.facebook && editProfileForm.facebook.trim()) {
      const facebookRegex = /^(https?:\/\/)?(www\.)?facebook\.com\/[a-zA-Z0-9.-]+\/?$/i;
      if (!facebookRegex.test(editProfileForm.facebook.trim())) {
        alert('Facebook link must be a valid profile URL (e.g., https://facebook.com/username)!');
        return;
      }
    }

    try {
      const formData = new FormData();
      formData.append('full_name', fullNameCombined);
      formData.append('display_name', fullNameCombined); // Sử dụng fullName làm displayName để tương thích API
      formData.append('phone', editProfileForm.phone || '');
      formData.append('headline', editProfileForm.jobTitle || '');
      formData.append('address', editProfileForm.address || '');
      formData.append('education', JSON.stringify(educations.map(edu => ({
        school: edu.school, degree: edu.degree, startDate: edu.startDate, gradDate: edu.gradDate
      }))));
      formData.append('experience', JSON.stringify(workExperiences.map(exp => ({
        company: exp.company, role: exp.role, startDate: exp.startDate, endDate: exp.endDate
      }))));
      formData.append('skills', JSON.stringify(skills.map(skill => ({ name: skill.name, level: skill.level }))));

      if (editProfileForm.avatarFile) {
        formData.append('avatar', editProfileForm.avatarFile);
      }

      await axios.put('http://localhost:5000/api/candidate/profile', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data"
        }
      });

      const updatedForm = {
        ...editProfileForm,
        fullName: fullNameCombined,
        displayName: fullNameCombined
      };

      setProfileData(updatedForm);
      localStorage.setItem('hide_phone_' + editProfileForm.email, editProfileForm.hidePhone ? 'true' : 'false');
      alert('Account settings saved successfully!');
    } catch (err) {
      console.error("Failed to save profile settings:", err);
      alert("Error occurred while saving profile settings. Please try again.");
    }
  };


  const [showExportModal, setShowExportModal] = useState(false);
  const [showCVModal, setShowCVModal] = useState(false); // Trạng thái mở/đóng cửa sổ CV
  const [showAppliedJobsModal, setShowAppliedJobsModal] = useState(false); // Trạng thái mở/đóng lịch sử ứng tuyển

  // Temporary Form States for Modals
  const [editProfileForm, setEditProfileForm] = useState(null);

  const [showExperienceModal, setShowExperienceModal] = useState(false);
  const [currentExperience, setCurrentExperience] = useState(null);
  const [experienceForm, setExperienceForm] = useState({ role: '', company: '', startDate: '', endDate: '' });

  const [showEducationModal, setShowEducationModal] = useState(false);
  const [currentEducation, setCurrentEducation] = useState(null);
  const [educationForm, setEducationForm] = useState({ degree: '', school: '', startDate: '', gradDate: '' });

  const [showSkillModal, setShowSkillModal] = useState(false);
  const [currentSkill, setCurrentSkill] = useState(null);
  const [skillForm, setSkillForm] = useState({ name: '', level: 50 });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    const loadProfile = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/candidate/profile', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const profile = res.data;

        // Map database fields to react state
        setProfileData(prev => ({
          ...prev,
          displayName: profile.display_name || profile.full_name || prev.displayName,
          fullName: profile.full_name || prev.fullName,
          jobTitle: profile.headline || prev.jobTitle,
          address: profile.address || prev.address,
          email: profile.email || prev.email,
          phone: profile.phone || prev.phone || '',
          hidePhone: localStorage.getItem('hide_phone_' + profile.email) === 'true',
          avatar: profile.avatar_url || defaultFacebookAvatar
        }));

        if (profile.skills && Array.isArray(profile.skills)) {
          setSkills(profile.skills.map((s, idx) => ({ id: idx + 1, name: s.name, level: s.level })));
        }

        if (profile.education && Array.isArray(profile.education)) {
          const formatMonthYear = (val) => {
            if (!val) return '';
            const parts = val.split('-');
            if (parts.length === 2) {
              return `${parts[1]}/${parts[0]}`; // MM/YYYY
            }
            return val;
          };

          setEducations(profile.education.map((e, idx) => {
            let durationText = '';
            if (e.startDate && e.gradDate) {
              durationText = `${formatMonthYear(e.startDate)} - ${formatMonthYear(e.gradDate)}`;
            } else if (e.startDate) {
              durationText = `${formatMonthYear(e.startDate)} - Present`;
            } else if (e.gradDate) {
              durationText = formatMonthYear(e.gradDate);
            } else {
              durationText = 'Present';
            }

            return {
              id: idx + 1,
              degree: e.degree || 'Degree / Field of Study',
              school: e.school || 'School / Institute',
              duration: durationText,
              startDate: e.startDate,
              gradDate: e.gradDate
            };
          }));
        }

        if (profile.experience && Array.isArray(profile.experience)) {
          const formatMonthYear = (val) => {
            if (!val) return '';
            const parts = val.split('-');
            if (parts.length === 2) {
              return `${parts[1]}/${parts[0]}`; // MM/YYYY
            }
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
              endDate: e.endDate
            };
          }));
        }

        // Fetch followed companies to fill interests
        try {
          const followRes = await axios.get('http://localhost:5000/api/candidate/companies', {
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

        // Set Candidate Posts Mock Data
        setCandidatePosts([
          {
            id: 1,
            author: profile.full_name || 'Candidate',
            avatar: profile.avatar_url || defaultFacebookAvatar,
            time: '2 days ago',
            content: 'Tôi rất vui mừng được chia sẻ rằng tôi vừa hoàn thành dự án phát triển hệ thống JobsMarket phiên bản mới! Cảm ơn mọi người đã luôn hỗ trợ và đồng hành cùng tôi.',
            likes: 24,
            comments: 5,
            shares: 2
          },
          {
            id: 2,
            author: profile.full_name || 'Candidate',
            avatar: profile.avatar_url || defaultFacebookAvatar,
            time: '1 week ago',
            content: 'Chia sẻ một vài kinh nghiệm nhỏ khi làm việc với React JS và thiết kế CSS Responsive cho giao diện trang cá nhân ứng viên. Hi vọng sẽ có ích cho các bạn đang tìm hiểu.',
            likes: 58,
            comments: 14,
            shares: 7
          }
        ]);

      } catch (err) {
        console.error("Failed to load database profile, using mock fallbacks:", err);
        setFollowedBusinesses([
          { id: 991, name: 'Alice Smith', category: 'Senior UX/UI Designer', avatar: 'https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-chat/ava3.webp' },
          { id: 992, name: 'David Lee', category: 'Lead DevOps Engineer', avatar: 'https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-chat/ava4.webp' },
          { id: 993, name: 'Emma Watson', category: 'Product Manager', avatar: 'https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-chat/ava5.webp' }
        ]);
        setCandidatePosts([
          {
            id: 1,
            author: 'Candidate',
            avatar: defaultFacebookAvatar,
            time: '2 days ago',
            content: 'Tôi rất vui mừng được chia sẻ rằng tôi vừa hoàn thành dự án phát triển hệ thống JobsMarket phiên bản mới! Cảm ơn mọi người đã luôn hỗ trợ và đồng hành cùng tôi.',
            likes: 24,
            comments: 5,
            shares: 2
          },
          {
            id: 2,
            author: 'Candidate',
            avatar: defaultFacebookAvatar,
            time: '1 week ago',
            content: 'Chia sẻ một vài kinh nghiệm nhỏ khi làm việc với React JS và thiết kế CSS Responsive cho giao diện trang cá nhân ứng viên. Hi vọng sẽ có ích cho các bạn đang tìm hiểu.',
            likes: 58,
            comments: 14,
            shares: 7
          }
        ]);
      }
    };

    loadProfile();
    fetchCVs(); // lấy danh sách CV
    fetchNotifications(); // lấy danh sách thông báo ban đầu

    // Load Activity History from localStorage or seed mock data
    const localFavJobs = localStorage.getItem('activity_fav_jobs');
    const localLiked = localStorage.getItem('activity_liked_posts');
    const localCommented = localStorage.getItem('activity_commented_posts');
    const localShared = localStorage.getItem('activity_shared_posts');

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

    if (localLiked) {
      setLikedPosts(JSON.parse(localLiked));
    } else {
      const defaultLiked = [
        { id: 101, author: 'Alex Johnson', avatar: 'https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-chat/ava6.webp', content: 'Hôm nay vừa hoàn thành dự án React Native đầu tay, cảm giác thật tuyệt vời! Mọi người có kinh nghiệm gì về tối ưu hiệu năng không?', liked_at: '2 hours ago' },
        { id: 102, author: 'Sarah Green', avatar: 'https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-chat/ava5.webp', content: 'Excited to share that I am starting a new position as Lead UI Engineer at TechMarket Solutions!', liked_at: '1 day ago' }
      ];
      setLikedPosts(defaultLiked);
      localStorage.setItem('activity_liked_posts', JSON.stringify(defaultLiked));
    }

    if (localCommented) {
      setCommentedPosts(JSON.parse(localCommented));
    } else {
      const defaultCommented = [
        { id: 201, author: 'Tech Academy', avatar: 'https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-chat/ava4.webp', content: 'Khóa học Node.js nâng cao miễn phí cho cộng đồng bắt đầu tuyển sinh tuần này. Link đăng ký ở bio.', comment: 'Khóa học này vô cùng bổ ích, mình khuyên mọi người nên thử!', commented_at: '1 day ago' }
      ];
      setCommentedPosts(defaultCommented);
      localStorage.setItem('activity_commented_posts', JSON.stringify(defaultCommented));
    }

    if (localShared) {
      setSharedPosts(JSON.parse(localShared));
    } else {
      const defaultShared = [
        { id: 301, author: 'Google Developers', avatar: 'https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-chat/ava2.webp', content: 'Announcing the new features in Chrome DevTools 2026: better performance analysis, CSS debugging tools, and AI integration.', message: 'Rất nhiều cập nhật mới cực xịn từ Chrome DevTools cho anh em web dev!', shared_at: '3 days ago' }
      ];
      setSharedPosts(defaultShared);
      localStorage.setItem('activity_shared_posts', JSON.stringify(defaultShared));
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'notifications') {
      fetchNotifications();
    } else if (activeTab === 'wallet') {
      if (typeof fetchWalletInfo === 'function') {
        fetchWalletInfo();
      }
    }
  }, [activeTab]);

  // Helper: save data to server directly (bypasses React state timing issues)
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

      const currentEdu = overrideData.educations || educations;
      const currentExp = overrideData.workExperiences || workExperiences;
      const currentSkills = overrideData.skills || skills;

      formData.append('education', JSON.stringify(currentEdu.map(edu => ({
        school: edu.school, degree: edu.degree, startDate: edu.startDate, gradDate: edu.gradDate
      }))));
      formData.append('experience', JSON.stringify(currentExp.map(exp => ({
        company: exp.company, role: exp.role, startDate: exp.startDate, endDate: exp.endDate
      }))));
      formData.append('skills', JSON.stringify(currentSkills.map(s => ({ name: s.name, level: s.level }))));

      await axios.put('http://localhost:5000/api/candidate/profile', formData, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
      });
      console.log('Auto-saved successfully!');
    } catch (err) {
      console.error('Auto-save failed:', err);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) return;

    const fullNameCombined = (editProfileForm.fullName || '').trim();

    // Validate Full Name
    if (!fullNameCombined) {
      setModalError('Full Name is required!');
      return;
    }
    if (!lettersOnlyRegex.test(fullNameCombined)) {
      setModalError('Full Name can only contain letters and spaces!');
      return;
    }
    // Validate Phone Number
    if (editProfileForm.phone && editProfileForm.phone.trim() && !/^\d{10}$/.test(editProfileForm.phone.trim())) {
      setModalError('Phone Number must be exactly 10 digits!');
      return;
    }

    // Validate Job Title (if provided)
    if (editProfileForm.jobTitle && editProfileForm.jobTitle.trim() && !lettersOnlyRegex.test(editProfileForm.jobTitle.trim())) {
      setModalError('Job Title can only contain letters and spaces!');
      return;
    }

    // Validate Nationality (if provided)
    if (editProfileForm.nationality && editProfileForm.nationality.trim() && !lettersOnlyRegex.test(editProfileForm.nationality.trim())) {
      setModalError('Nationality can only contain letters and spaces!');
      return;
    }

    // Validate Portfolio (if provided)
    if (editProfileForm.portfolio && editProfileForm.portfolio.trim()) {
      const urlRegex = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([\/\w .-]*)*\/?$/i;
      if (!urlRegex.test(editProfileForm.portfolio.trim())) {
        setModalError('Portfolio must be a valid URL (e.g., https://myportfolio.com)!');
        return;
      }
    }
    // Validate GitHub (if provided)
    if (editProfileForm.github && editProfileForm.github.trim()) {
      const githubRegex = /^(https?:\/\/)?(www\.)?github\.com\/[a-zA-Z0-9_-]+\/?$/i;
      if (!githubRegex.test(editProfileForm.github.trim())) {
        setModalError('GitHub link must be a valid profile URL (e.g., https://github.com/username)!');
        return;
      }
    }
    // Validate Facebook (if provided)
    if (editProfileForm.facebook && editProfileForm.facebook.trim()) {
      const facebookRegex = /^(https?:\/\/)?(www\.)?facebook\.com\/[a-zA-Z0-9.-]+\/?$/i;
      if (!facebookRegex.test(editProfileForm.facebook.trim())) {
        setModalError('Facebook link must be a valid profile URL (e.g., https://facebook.com/username)!');
        return;
      }
    }

    try {
      // Tạo đối tượng FormData để chứa cả text và file
      const formData = new FormData();
      formData.append('full_name', fullNameCombined);
      formData.append('display_name', fullNameCombined); // Sử dụng fullName làm displayName để tương thích API
      formData.append('phone', editProfileForm.phone || '');
      formData.append('headline', editProfileForm.jobTitle || '');
      formData.append('address', editProfileForm.address || '');
      // Các trường dạng mảng thì phải chuyển thành chuỗi JSON trước khi nhét vào FormData
      formData.append('education', JSON.stringify(educations.map(edu => ({
        school: edu.school,
        degree: edu.degree,
        startDate: edu.startDate,
        gradDate: edu.gradDate
      }))));

      formData.append('experience', JSON.stringify(workExperiences.map(exp => ({
        company: exp.company,
        role: exp.role,
        startDate: exp.startDate,
        endDate: exp.endDate
      }))));

      formData.append('skills', JSON.stringify(skills.map(skill => ({ name: skill.name, level: skill.level }))));

      if (editProfileForm.avatarFile) {
        formData.append('avatar', editProfileForm.avatarFile);
      }

      await axios.put('http://localhost:5000/api/candidate/profile', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data"
        }
      });

      const updatedForm = {
        ...editProfileForm,
        fullName: fullNameCombined,
        displayName: fullNameCombined
      };

      setProfileData(updatedForm);
      localStorage.setItem('hide_phone_' + editProfileForm.email, editProfileForm.hidePhone ? 'true' : 'false');
      if (e.type !== 'autosave') {
        setShowEdit(false);
      }
    } catch (err) {
      console.error("Failed to save profile changes:", err);
      setModalError("Error occurred while saving profile. Please try again.");
    }
  };



  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type (only images allowed)
    if (!file.type.startsWith('image/')) {
      setModalError("Invalid file type! Only image files (png, jpg, jpeg, gif, webp) are allowed.");
      return;
    }

    // Validate size under 5MB (5 * 1024 * 1024 bytes)
    if (file.size > 5 * 1024 * 1024) {
      setModalError("Avatar file size must be under 5MB!");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setEditProfileForm(prev => ({
        ...prev,
        avatar: reader.result,
        avatarFile: file
      }));
    };
    reader.readAsDataURL(file);
  };

  // Event Handlers for Experience CRUD
  const parseDuration = (durationStr) => {
    let startDate = '';
    let endDate = '';
    if (durationStr) {
      const parts = durationStr.split(' - ');
      const parseMMYYYY = (val) => {
        if (!val || val === 'Present' || val === 'Hiện tại') return '';
        const subparts = val.split('/');
        if (subparts.length === 2) {
          return `${subparts[1]}-${subparts[0].padStart(2, '0')}`; // YYYY-MM
        }
        return '';
      };
      if (parts.length === 2) {
        startDate = parseMMYYYY(parts[0]);
        endDate = parseMMYYYY(parts[1]);
      } else if (parts.length === 1) {
        startDate = parseMMYYYY(parts[0]);
      }
    }
    return { startDate, endDate };
  };

  const handleOpenExperienceModal = (exp = null) => {
    setModalError('');
    if (exp) {
      setCurrentExperience(exp);
      const parsed = parseDuration(exp.duration);
      setExperienceForm({
        role: exp.role,
        company: exp.company,
        startDate: parsed.startDate,
        endDate: parsed.endDate
      });
    } else {
      setCurrentExperience(null);
      setExperienceForm({ role: '', company: '', startDate: '', endDate: '' });
    }
    setShowExperienceModal(true);
  };

  const lettersOnlyRegex = /^[\p{L}\s]*$/u;

  const handleSaveExperience = (e) => {
    e.preventDefault();

    if (experienceForm.role && !lettersOnlyRegex.test(experienceForm.role)) {
      setModalError("Job Title / Role cannot contain numbers or special characters!");
      return;
    }
    if (experienceForm.company && !lettersOnlyRegex.test(experienceForm.company)) {
      setModalError("Company Name cannot contain numbers or special characters!");
      return;
    }

    if (!experienceForm.startDate) {
      setModalError("Start Date is required!");
      return;
    }

    // Validate start year <= current year
    const startYear = parseInt(experienceForm.startDate.split('-')[0]);
    const currentYear = new Date().getFullYear();
    if (startYear > currentYear) {
      setModalError(`Start year (${startYear}) cannot be in the future (must be <= ${currentYear})!`);
      return;
    }

    // Validate end date >= start date
    if (experienceForm.endDate && experienceForm.endDate < experienceForm.startDate) {
      setModalError("End Date cannot be earlier than Start Date!");
      return;
    }

    // Format output duration text
    const formatMonthYear = (val) => {
      if (!val) return '';
      const parts = val.split('-');
      if (parts.length === 2) {
        return `${parts[1]}/${parts[0]}`; // MM/YYYY
      }
      return val;
    };

    const formattedStart = formatMonthYear(experienceForm.startDate);
    const formattedEnd = experienceForm.endDate ? formatMonthYear(experienceForm.endDate) : 'Present';
    const durationText = `${formattedStart} - ${formattedEnd}`;

    const finalExperience = {
      role: experienceForm.role,
      company: experienceForm.company,
      duration: durationText,
      startDate: experienceForm.startDate,
      endDate: experienceForm.endDate
    };

    let newWorkExperiences;
    if (currentExperience) {
      newWorkExperiences = workExperiences.map(item => item.id === currentExperience.id ? { ...item, ...finalExperience } : item);
    } else {
      const newId = workExperiences.length > 0 ? Math.max(...workExperiences.map(i => i.id)) + 1 : 1;
      newWorkExperiences = [...workExperiences, { id: newId, ...finalExperience }];
    }
    setWorkExperiences(newWorkExperiences);
    setShowExperienceModal(false);
    saveToServer({ workExperiences: newWorkExperiences });
  };

  const handleOpenEducationModal = (edu = null) => {
    setModalError('');
    if (edu) {
      setCurrentEducation(edu);
      setEducationForm({
        degree: edu.degree,
        school: edu.school,
        startDate: edu.startDate || '',
        gradDate: edu.gradDate || ''
      });
    } else {
      setCurrentEducation(null);
      setEducationForm({ degree: '', school: '', startDate: '', gradDate: '' });
    }
    setShowEducationModal(true);
  };

  const handleSaveEducation = (e) => {
    e.preventDefault();

    if (educationForm.degree && !lettersOnlyRegex.test(educationForm.degree)) {
      setModalError("Degree / Field of Study cannot contain numbers or special characters!");
      return;
    }
    if (educationForm.school && !lettersOnlyRegex.test(educationForm.school)) {
      setModalError("School / Institute cannot contain numbers or special characters!");
      return;
    }

    if (!educationForm.startDate) {
      setModalError("Start Date is required!");
      return;
    }

    const startYear = parseInt(educationForm.startDate.split('-')[0]);
    const currentYear = new Date().getFullYear();
    if (startYear > currentYear) {
      setModalError(`Start year (${startYear}) cannot be in the future (must be <= ${currentYear})!`);
      return;
    }

    if (educationForm.gradDate && educationForm.gradDate < educationForm.startDate) {
      setModalError("Graduation Date cannot be earlier than Start Date!");
      return;
    }

    const formatMonthYear = (val) => {
      if (!val) return '';
      const parts = val.split('-');
      if (parts.length === 2) {
        return `${parts[1]}/${parts[0]}`; // MM/YYYY
      }
      return val;
    };

    const formattedStart = formatMonthYear(educationForm.startDate);
    const formattedGrad = educationForm.gradDate ? formatMonthYear(educationForm.gradDate) : 'Present';
    const durationText = `${formattedStart} - ${formattedGrad}`;

    const finalEducation = {
      degree: educationForm.degree,
      school: educationForm.school,
      duration: durationText,
      startDate: educationForm.startDate,
      gradDate: educationForm.gradDate
    };

    let newEducations;
    if (currentEducation) {
      newEducations = educations.map(item => item.id === currentEducation.id ? { ...item, ...finalEducation } : item);
    } else {
      const newId = educations.length > 0 ? Math.max(...educations.map(i => i.id)) + 1 : 1;
      newEducations = [...educations, { id: newId, ...finalEducation }];
    }
    setEducations(newEducations);
    setShowEducationModal(false);
    saveToServer({ educations: newEducations });
  };

  const handleDeleteExperience = (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this experience?");
    if (confirmDelete) {
      const newWorkExperiences = workExperiences.filter(item => item.id !== id);
      setWorkExperiences(newWorkExperiences);
      saveToServer({ workExperiences: newWorkExperiences });
      alert("Experience deleted successfully!");
    }
  };

  const handleDeleteEducation = (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this education?");
    if (confirmDelete) {
      const newEducations = educations.filter(item => item.id !== id);
      setEducations(newEducations);
      saveToServer({ educations: newEducations });
      alert("Education deleted successfully!");
    }
  };

  // Event Handlers for Skill CRUD
  const handleOpenSkillModal = (skill = null) => {
    setModalError('');
    if (skill) {
      setCurrentSkill(skill);
      setSkillForm({ name: skill.name, level: skill.level });
    } else {
      setCurrentSkill(null);
      setSkillForm({ name: '', level: 50 });
    }
    setShowSkillModal(true);
  };

  const handleSaveSkill = (e) => {
    e.preventDefault();

    if (skillForm.name && !lettersOnlyRegex.test(skillForm.name)) {
      setModalError("Core Skill cannot contain numbers or special characters!");
      return;
    }

    let newSkills;
    if (currentSkill) {
      newSkills = skills.map(item => item.id === currentSkill.id ? { ...item, ...skillForm } : item);
    } else {
      const newId = skills.length > 0 ? Math.max(...skills.map(i => i.id)) + 1 : 1;
      newSkills = [...skills, { id: newId, ...skillForm }];
    }
    setSkills(newSkills);
    setShowSkillModal(false);
    saveToServer({ skills: newSkills });
  };

  const handleDeleteSkill = (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this skill?");
    if (confirmDelete) {
      const newSkills = skills.filter(item => item.id !== id);
      setSkills(newSkills);
      saveToServer({ skills: newSkills });
      alert("Skill deleted successfully!");
    }
  };

  const handleUnsaveJob = (jobId) => {
    const confirmUnsave = window.confirm("Are you sure you want to unsave this job?");
    if (confirmUnsave) {
      const updated = favoriteJobs.filter(job => job.id !== jobId);
      setFavoriteJobs(updated);
      localStorage.setItem('activity_fav_jobs', JSON.stringify(updated));
      alert("Job removed from saved list successfully!");
    }
  };

  const handleUnlikePost = (postId) => {
    const confirmUnlike = window.confirm("Are you sure you want to unlike this post?");
    if (confirmUnlike) {
      const updated = likedPosts.filter(post => post.id !== postId);
      setLikedPosts(updated);
      localStorage.setItem('activity_liked_posts', JSON.stringify(updated));
      alert("Post unliked successfully!");
    }
  };

  const handleDeleteCommentActivity = (postId) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this comment activity?");
    if (confirmDelete) {
      const updated = commentedPosts.filter(post => post.id !== postId);
      setCommentedPosts(updated);
      localStorage.setItem('activity_commented_posts', JSON.stringify(updated));
      alert("Comment activity removed from history!");
    }
  };

  const handleRemoveShareActivity = (postId) => {
    const confirmRemove = window.confirm("Are you sure you want to remove this share activity?");
    if (confirmRemove) {
      const updated = sharedPosts.filter(post => post.id !== postId);
      setSharedPosts(updated);
      localStorage.setItem('activity_shared_posts', JSON.stringify(updated));
      alert("Share activity removed from history!");
    }
  };

  return (
    <section className="profile-section">
      <div className="container py-5">
        {/* Navigation back */}
        <div className="mb-4 d-flex justify-content-between align-items-center">
          <button onClick={() => navigate('/dashboard')} className="btn btn-outline-secondary d-inline-flex align-items-center gap-1.5 fw-semibold shadow-sm rounded-pill">
            <i className="fas fa-arrow-left"></i> Back to Home
          </button>
        </div>

        <div className="row">
          {/* Left Sidebar Navigation */}
          <div className="col-12 col-lg-3 mb-4">
            <div className="card border-0 shadow-sm profile-sidebar-card">
              <div className="card-body p-3">
                <div className="nav flex-column nav-pills gap-2" id="v-pills-tab" role="tablist" aria-orientation="vertical">
                  <button
                    className={`nav-link text-start d-flex align-items-center gap-2.5 px-3 py-2.5 fw-semibold sidebar-nav-item ${activeTab === 'account' ? 'active' : ''}`}
                    onClick={() => setActiveTab('account')}
                    type="button"
                  >
                    <i className="far fa-user-circle fs-5"></i>
                    <span>My Account</span>
                  </button>

                  <button
                    className={`nav-link text-start d-flex align-items-center gap-2.5 px-3 py-2.5 fw-semibold sidebar-nav-item ${activeTab === 'settings' ? 'active' : ''}`}
                    onClick={() => {
                      setEditProfileForm({ ...profileData });
                      setModalError('');
                      setActiveTab('settings');
                    }}
                    type="button"
                  >
                    <i className="fas fa-sliders-h fs-5"></i>
                    <span>Account Settings</span>
                  </button>

                  <button
                    className={`nav-link text-start d-flex align-items-center gap-2.5 px-3 py-2.5 fw-semibold sidebar-nav-item ${activeTab === 'wallet' ? 'active' : ''}`}
                    onClick={() => {
                      setActiveTab('wallet');
                      setActiveWalletTab('history');
                    }}
                    type="button"
                  >
                    <i className="fas fa-wallet fs-5"></i>
                    <span>My Wallet</span>
                    <span className="badge rounded-pill bg-light text-primary border border-primary ms-auto small px-2 py-0.5">{coins || 0}🪙</span>
                  </button>

                  <button
                    className={`nav-link text-start d-flex align-items-center gap-2.5 px-3 py-2.5 fw-semibold sidebar-nav-item ${activeTab === 'notifications' ? 'active' : ''}`}
                    onClick={() => setActiveTab('notifications')}
                    type="button"
                  >
                    <i className="far fa-bell fs-5"></i>
                    <span>Notifications</span>
                    {notifications.filter(n => !n.is_read).length > 0 && (
                      <span className="badge rounded-pill bg-danger ms-auto small px-2 py-0.5">
                        {notifications.filter(n => !n.is_read).length}
                      </span>
                    )}
                  </button>

                  <button
                    className={`nav-link text-start d-flex align-items-center gap-2.5 px-3 py-2.5 fw-semibold sidebar-nav-item ${activeTab === 'activity' ? 'active' : ''}`}
                    onClick={() => setActiveTab('activity')}
                    type="button"
                  >
                    <i className="fas fa-history fs-5"></i>
                    <span>Activity History</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Content Area */}
          <div className="col-12 col-lg-9">


            {/* TAB 1: MY ACCOUNT */}
            {activeTab === 'account' && (
              <div className="card border-0 shadow-sm animate-fade-in profile-unified-card">
                {/* ── Profile Hero Header ── */}
                <div className="profile-hero-header p-4 border-bottom">
                  <div className="d-flex flex-column flex-md-row justify-content-between align-items-center align-items-md-start gap-3">
                    {/* Left: Avatar + Info */}
                    <div className="d-flex flex-column flex-md-row align-items-center gap-3 text-center text-md-start">
                      <div className="profile-avatar-wrap">
                        <img
                          src={profileData.avatar}
                          alt="avatar"
                          className="rounded-circle avatar-img shadow"
                          style={{ width: '96px', height: '96px', objectFit: 'cover' }}
                        />
                      </div>
                      <div>
                        <h5
                          className="mb-1 user-name-glow d-inline-flex align-items-center gap-2 fw-bold"
                          onClick={() => setShowPersonalInfo(true)}
                          title="Click to view contact information"
                          style={{ cursor: 'pointer', transition: 'all 0.2s' }}
                        >
                          {profileData.displayName}
                          <i className="far fa-address-card contact-card-icon" style={{ fontSize: '0.9rem', transition: 'all 0.2s' }}></i>
                        </h5>
                        {profileData.jobTitle && <p className="text-muted mb-1 small">{profileData.jobTitle}</p>}
                        {profileData.address && <p className="text-muted mb-2 small"><i className="fas fa-map-marker-alt me-1"></i>{profileData.address}</p>}
                        <div className="d-flex flex-wrap gap-2 justify-content-center justify-content-md-start">
                          <button
                            type="button"
                            onClick={() => setShowCVModal(true)}
                            className="btn btn-pine btn-sm d-inline-flex align-items-center gap-2 fw-semibold rounded-pill px-3"
                          >
                            <i className="far fa-file-pdf text-white"></i> Manage My CVs ({cvList.length})
                          </button>
                          <button
                            type="button"
                            onClick={() => setShowAppliedJobsModal(true)}
                            className="btn btn-pine btn-sm d-inline-flex align-items-center gap-2 fw-semibold rounded-pill px-3"
                          >
                            <i className="fas fa-history text-white"></i> Applied Jobs
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Right: Wallet Pill */}
                    <div className="mt-3 mt-md-0 flex-shrink-0">
                      <div
                        className="d-flex align-items-center gap-2 wallet-pine px-3 py-2 rounded-pill shadow-sm"
                        onClick={() => { setActiveTab('wallet'); setActiveWalletTab('history'); }}
                        style={{ cursor: 'pointer' }}
                      >
                        <span style={{ fontSize: '1.1rem' }}>🪙</span>
                        <span className="fw-bold small">{coins || 0} Coins</span>
                        <button className="btn btn-sm btn-light rounded-circle p-1 d-flex align-items-center justify-content-center" style={{ width: '26px', height: '26px' }}>
                          <i className="fas fa-wallet" style={{ fontSize: '0.75rem', color: '#01796F' }}></i>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ── Content Body ── */}
                <div className="card-body p-4">
                  <div className="row g-4">
                    {/* Left: Experience / Education / Skills */}
                    <div className="col-12 col-lg-8">
                      <div className="d-flex flex-column gap-4">
                        <CandidateExperience
                          workExperiences={workExperiences}
                          onOpenModal={handleOpenExperienceModal}
                          onDelete={handleDeleteExperience}
                          showModal={showExperienceModal}
                          onCloseModal={() => setShowExperienceModal(false)}
                          currentExperience={currentExperience}
                          experienceForm={experienceForm}
                          setExperienceForm={setExperienceForm}
                          onSave={handleSaveExperience}
                          modalError={modalError}
                        />

                        <CandidateEducation
                          educations={educations}
                          onOpenModal={handleOpenEducationModal}
                          onDelete={handleDeleteEducation}
                          showModal={showEducationModal}
                          onCloseModal={() => setShowEducationModal(false)}
                          currentEducation={currentEducation}
                          educationForm={educationForm}
                          setEducationForm={setEducationForm}
                          onSave={handleSaveEducation}
                          modalError={modalError}
                        />

                        <CandidateSkills
                          skills={skills}
                          onOpenModal={handleOpenSkillModal}
                          onDelete={handleDeleteSkill}
                          showModal={showSkillModal}
                          onCloseModal={() => setShowSkillModal(false)}
                          currentSkill={currentSkill}
                          skillForm={skillForm}
                          setSkillForm={setSkillForm}
                          onSave={handleSaveSkill}
                          modalError={modalError}
                        />
                      </div>
                    </div>

                    {/* Right: Following */}
                    <div className="col-12 col-lg-4">
                      <div className="p-3 border rounded-3 bg-light h-100">
                        <div className="d-flex align-items-center justify-content-between mb-3 pb-2 border-bottom">
                          <span className="fw-bold text-dark">Following</span>
                          <i className="fas fa-heart text-danger fs-5"></i>
                        </div>
                        <div className="d-flex flex-column gap-3">
                          {followedBusinesses.length === 0 ? (
                            <div className="text-center py-4 text-muted small">
                              <i className="far fa-heart fs-3 mb-2 text-muted opacity-50 d-block"></i>
                              Not following anyone yet.
                            </div>
                          ) : (
                            followedBusinesses.map((user) => (
                              <div key={user.id} className="d-flex flex-column gap-2 p-2 rounded border bg-white hover-shadow-sm transition-all">
                                <div className="d-flex align-items-center gap-2">
                                  <div className="d-flex align-items-center justify-content-center bg-light rounded-circle overflow-hidden border" style={{ width: '38px', height: '38px', minWidth: '38px' }}>
                                    {user.avatar ? (
                                      <img src={user.avatar} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    ) : (
                                      <i className="fas fa-user text-primary fs-6"></i>
                                    )}
                                  </div>
                                  <div style={{ minWidth: 0 }}>
                                    <h6 className="fw-bold mb-0 text-dark text-truncate" style={{ fontSize: '0.82rem' }} title={user.name}>{user.name}</h6>
                                    <p className="mb-0 text-muted text-truncate" style={{ fontSize: '0.68rem' }}>{user.category}</p>
                                  </div>
                                </div>
                                <button className="btn btn-sm btn-pine rounded-pill px-3 py-1 fw-semibold d-flex align-items-center justify-content-center gap-1 w-100" style={{ fontSize: '0.72rem' }}>
                                  <i className="fas fa-check" style={{ fontSize: '0.58rem' }}></i> Followed
                                </button>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Posts */}
                  <div className="mt-4 pt-3 border-top">
                    <CandidatePosts candidatePosts={candidatePosts} />
                  </div>
                </div>
              </div>
            )}



            {/* TAB 2: ACCOUNT SETTINGS */}
            {activeTab === 'settings' && editProfileForm && (
              <div className="card border-0 shadow-sm animate-fade-in">
                <div className="card-header bg-white py-3 border-bottom d-flex align-items-center">
                  <h5 className="mb-0 fw-bold text-dark"><i className="fas fa-sliders-h me-2 text-primary"></i>Account Settings</h5>
                </div>
                <div className="card-body p-4">


                  <form onSubmit={handleSaveProfileSettings} className="d-flex flex-column gap-4" noValidate>
                    {/* Upload Avatar */}
                    <div className="d-flex flex-column align-items-center gap-2 bg-light p-3 rounded border">
                      <img
                        src={editProfileForm.avatar}
                        alt="avatar preview"
                        className="rounded-circle shadow border"
                        style={{ width: '100px', height: '100px', objectFit: 'cover' }}
                      />
                      <label className="btn btn-sm btn-outline-primary mt-2 position-relative cursor-pointer">
                        <i className="fas fa-upload me-1.5"></i> Upload Avatar
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleAvatarChange}
                          className="position-absolute opacity-0 top-0 start-0 w-100 h-100 cursor-pointer"
                          style={{ zIndex: 2 }}
                        />
                      </label>
                      <span className="text-muted small text-center px-3">Only image formats are supported (JPG, JPEG, PNG, WEBP) and maximum file size is 5 MB.</span>
                    </div>

                    {/* General Info */}
                    <div className="row g-3">
                      <div className="col-12">
                        <label className="form-label fw-semibold text-secondary small">Full Name <span className="text-danger">*</span></label>
                        <input
                          type="text"
                          className="form-control"
                          value={editProfileForm.fullName || ''}
                          onChange={(e) => setEditProfileForm({ ...editProfileForm, fullName: e.target.value })}
                          required
                        />
                      </div>
                      <div className="col-12 col-md-6">
                        <label className="form-label fw-semibold text-secondary small">Job Title</label>
                        <input
                          type="text"
                          className="form-control"
                          value={editProfileForm.jobTitle}
                          onChange={(e) => setEditProfileForm({ ...editProfileForm, jobTitle: e.target.value })}
                        />
                      </div>
                      <div className="col-12 col-md-6">
                        <label className="form-label fw-semibold text-secondary small">Nationality</label>
                        <input
                          type="text"
                          className="form-control"
                          value={editProfileForm.nationality}
                          onChange={(e) => setEditProfileForm({ ...editProfileForm, nationality: e.target.value })}
                        />
                      </div>
                      <div className="col-12 col-md-6">
                        <label className="form-label fw-semibold text-secondary small">Phone Number</label>
                        <input
                          type="tel"
                          className="form-control"
                          value={editProfileForm.phone || ''}
                          onChange={(e) => setEditProfileForm({ ...editProfileForm, phone: e.target.value })}
                          placeholder="e.g., 0901234567"
                        />
                      </div>
                      <div className="col-12 col-md-6 d-flex align-items-center">
                        <div className="form-check form-switch mt-4">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            id="hidePhoneCheckboxSettings"
                            checked={editProfileForm.hidePhone || false}
                            onChange={(e) => setEditProfileForm({ ...editProfileForm, hidePhone: e.target.checked })}
                          />
                          <label className="form-check-label fw-semibold text-secondary small mb-0 ms-2" htmlFor="hidePhoneCheckboxSettings">
                            Hide phone in Contact Info
                          </label>
                        </div>
                      </div>
                      <div className="col-12">
                        <label className="form-label fw-semibold text-secondary small">Address / Country</label>
                        <input
                          type="text"
                          className="form-control"
                          value={editProfileForm.address}
                          onChange={(e) => setEditProfileForm({ ...editProfileForm, address: e.target.value })}
                        />
                      </div>
                    </div>

                    {/* Contact & Links */}
                    <h5 className="fw-bold border-bottom pb-2 mt-4 text-dark"><i className="fas fa-link me-2 text-primary"></i>Contact & Social Links</h5>
                    <div className="row g-3">
                      <div className="col-12 col-md-6">
                        <label className="form-label fw-semibold text-secondary small">Portfolio</label>
                        <input
                          type="url"
                          className="form-control"
                          value={editProfileForm.portfolio}
                          onChange={(e) => setEditProfileForm({ ...editProfileForm, portfolio: e.target.value })}
                          placeholder="e.g., https://myportfolio.com"
                        />
                      </div>
                      <div className="col-12 col-md-6">
                        <label className="form-label fw-semibold text-secondary small">GitHub</label>
                        <input
                          type="url"
                          className="form-control"
                          value={editProfileForm.github}
                          onChange={(e) => setEditProfileForm({ ...editProfileForm, github: e.target.value })}
                          placeholder="e.g., https://github.com/username"
                        />
                      </div>
                      <div className="col-12 col-md-6">
                        <label className="form-label fw-semibold text-secondary small">Facebook</label>
                        <input
                          type="url"
                          className="form-control"
                          value={editProfileForm.facebook}
                          onChange={(e) => setEditProfileForm({ ...editProfileForm, facebook: e.target.value })}
                          placeholder="e.g., https://facebook.com/username"
                        />
                      </div>
                    </div>

                    {/* Account Security Section */}
                    <div className="mt-4">
                      <h5 className="fw-bold border-bottom pb-2 text-dark">
                        <i className="fas fa-lock me-2 text-primary"></i>Account Security
                      </h5>
                      
                      {/* Email Row */}
                      <div className="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center py-3 gap-3">
                        <div className="flex-grow-1" style={{ maxWidth: '400px', width: '100%' }}>
                          <label className="fw-semibold text-secondary small d-block mb-1">Email Address <span className="text-danger">*</span></label>
                          <input
                            type="email"
                            className="form-control bg-light"
                            value={editProfileForm.email}
                            disabled
                          />
                        </div>
                        <button
                          type="button"
                          className="btn btn-outline-primary rounded-pill px-4 fw-semibold align-self-sm-end"
                          style={{ height: '38px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                          onClick={handleChangeEmailClick}
                        >
                          Change email
                        </button>
                      </div>

                      {/* Password Row */}
                      <div className="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center py-3 gap-3">
                        <div className="flex-grow-1" style={{ maxWidth: '400px', width: '100%' }}>
                          <label className="fw-semibold text-secondary small d-block mb-1">Password</label>
                          <input
                            type="password"
                            className="form-control bg-light"
                            value="••••••••"
                            disabled
                          />
                        </div>
                        <button
                          type="button"
                          className="btn btn-outline-primary rounded-pill px-4 fw-semibold align-self-sm-end"
                          style={{ height: '38px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                          onClick={handleChangePasswordClick}
                        >
                          Change password
                        </button>
                      </div>

                      {/* Log out of all devices Row */}
                      <div className="d-flex justify-content-between align-items-center py-3">
                        <div>
                          <span className="fw-semibold text-dark d-block">Log out of all devices</span>
                          <span className="text-muted extra-small">Log out of all active sessions on other browsers or devices.</span>
                        </div>
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-secondary rounded-pill px-3 py-1.5 fw-semibold"
                          onClick={handleLogoutClick}
                        >
                          Log out
                        </button>
                      </div>

                      {/* Delete Account Row */}
                      <div className="d-flex justify-content-between align-items-center py-3">
                        <div>
                          <span className="fw-semibold text-danger d-block">Delete my account</span>
                          <span className="text-muted extra-small text-danger opacity-75">Permanently delete your account and all associated profile data.</span>
                        </div>
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-danger rounded-pill px-3 py-1.5 fw-semibold"
                          onClick={handleDeleteAccountClick}
                        >
                          Delete Account
                        </button>
                      </div>
                    </div>

                    <div className="d-flex gap-2 justify-content-end pt-3 mt-3">
                      <button type="button" className="btn btn-light border px-4" onClick={() => setActiveTab('account')}>
                        Cancel
                      </button>
                      <button type="submit" className="btn btn-primary px-4">Save Changes</button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* TAB 3: MY WALLET */}
            {activeTab === 'wallet' && (
              <div className="card border-0 shadow-sm animate-fade-in">
                <div className="card-header bg-white py-3 border-bottom d-flex flex-column flex-sm-row align-items-start align-items-sm-center justify-content-between gap-2">
                  <h5 className="mb-0 fw-bold text-dark"><i className="fas fa-wallet me-2 text-primary"></i>My Wallet</h5>
                  <span className="fw-bold bg-light px-3 py-1.5 rounded-pill border text-primary">
                    Current Balance: <strong className="text-warning">{coins || 0} Coins 🪙</strong>
                  </span>
                </div>

                <div className="d-flex border-bottom bg-light">
                  <button
                    type="button"
                    className={`btn btn-link flex-fill py-3 text-decoration-none fw-semibold border-0 ${activeWalletTab === 'history' ? 'text-primary border-bottom border-primary border-3' : 'text-muted'}`}
                    onClick={() => setActiveWalletTab('history')}
                  >
                    <i className="fas fa-history me-1"></i> Transaction History
                  </button>
                  <button
                    type="button"
                    className={`btn btn-link flex-fill py-3 text-decoration-none fw-semibold border-0 ${activeWalletTab === 'topup' ? 'text-primary border-bottom border-primary border-3' : 'text-muted'}`}
                    onClick={() => setActiveWalletTab('topup')}
                  >
                    <i className="fas fa-coins me-1"></i> Recharge Coins
                  </button>
                </div>

                <div className="card-body p-4">
                  {activeWalletTab === 'history' && (
                    <div className="transaction-history">
                      <h6 className="fw-bold mb-3 text-dark">Recent transaction history</h6>
                      {transactions.filter(tx => tx.status === 'completed').length === 0 ? (
                        <div className="text-center py-5 text-muted">
                          <i className="fas fa-exchange-alt fs-2 mb-2 text-muted opacity-40"></i>
                          <p className="mb-0">There are no transactions yet.</p>
                        </div>
                      ) : (
                        <div className="d-flex flex-column gap-2">
                          {transactions.filter(tx => tx.status === 'completed').map((tx) => (
                            <div key={tx.id} className="d-flex justify-content-between align-items-center p-3 rounded border bg-light">
                              <div className="d-flex align-items-center gap-3">
                                <div className="rounded-circle d-flex align-items-center justify-content-center bg-white shadow-sm" style={{ width: '40px', height: '40px' }}>
                                  <i className={`fas ${tx.type === 'deposit' ? 'fa-arrow-down text-success' : 'fa-arrow-up text-danger'}`}></i>
                                </div>
                                <div>
                                  <p className="fw-bold mb-0 text-dark small">{tx.type === 'deposit' ? 'Deposit coins into wallet' : 'Spend coins for services'}</p>
                                  <p className="mb-0 text-muted small">{new Date(tx.created_at).toLocaleString()} • via {tx.payment_method}</p>
                                </div>
                              </div>
                              <div className="text-end">
                                <p className={`fw-bold mb-0 ${tx.type === 'deposit' ? 'text-success' : 'text-danger'}`}>
                                  {tx.type === 'deposit' ? '+' : ''}{tx.coins} Coins
                                </p>
                                {tx.amount_fiat > 0 && <p className="text-muted small mb-0">-{Number(tx.amount_fiat).toLocaleString()} VND</p>}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {activeWalletTab === 'topup' && (
                    <RechargeCoins />
                  )}
                </div>
              </div>
            )}

            {/* TAB 4: NOTIFICATIONS */}
            {activeTab === 'notifications' && (
              <div className="card border-0 shadow-sm animate-fade-in">
                <div className="card-header bg-white py-3 border-bottom d-flex align-items-center justify-content-between">
                  <h5 className="mb-0 fw-bold text-dark"><i className="far fa-bell me-2 text-primary"></i>Notifications</h5>
                  {notifications.length > 0 && (
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-primary rounded-pill px-3 py-1.5 fw-semibold d-flex align-items-center gap-1.5 border"
                      onClick={handleMarkAllAsRead}
                      disabled={notifications.every(n => n.is_read)}
                    >
                      <i className="fas fa-check-double"></i> Mark all as read
                    </button>
                  )}
                </div>

                <div className="card-body p-4 scrollable-notifications" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
                  {loadingNotis ? (
                    <div className="text-center py-5">
                      <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                    </div>
                  ) : notisError ? (
                    <div className="alert alert-danger" role="alert">
                      {notisError}
                    </div>
                  ) : notifications.length === 0 ? (
                    <div className="text-center py-5 text-muted">
                      <i className="far fa-bell fs-2 mb-2 text-muted opacity-40"></i>
                      <p className="mb-0">You have no notifications yet.</p>
                    </div>
                  ) : (
                    <div className="d-flex flex-column gap-3">
                      {notifications.map((noti) => (
                        <div
                          key={noti.id}
                          className={`p-3 rounded border d-flex gap-3 align-items-start transition-all cursor-pointer hover-shadow-sm notification-item ${!noti.is_read ? 'unread-bg border-primary-light' : 'bg-white'}`}
                          onClick={() => {
                            if (!noti.is_read) {
                              handleMarkAsRead(noti.id);
                            }
                          }}
                        >
                          <div className={`rounded-circle p-2.5 d-flex align-items-center justify-content-center ${!noti.is_read ? 'bg-primary-light text-primary' : 'bg-light text-secondary'}`}>
                            <i className={`fas ${noti.title.includes('Welcome') ? 'fa-gift' : noti.title.includes('Secure') ? 'fa-shield-alt' : 'fa-bell'}`}></i>
                          </div>
                          <div className="flex-grow-1" style={{ minWidth: 0 }}>
                            <div className="d-flex justify-content-between align-items-start gap-2">
                              <h6 className={`mb-1 text-dark text-truncate ${!noti.is_read ? 'fw-bold' : 'fw-medium'}`} style={{ fontSize: '0.9rem' }}>{noti.title}</h6>
                              {!noti.is_read && <span className="badge bg-danger small px-2 py-0.5 rounded-pill animate-pulse" style={{ fontSize: '0.7rem' }}>New</span>}
                            </div>
                            <p className="text-secondary mb-1 small" style={{ lineHeight: '1.4' }}>{noti.content}</p>
                            <span className="text-muted small" style={{ fontSize: '0.75rem' }}><i className="far fa-clock me-1"></i>{noti.created_at}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 5: ACTIVITY HISTORY */}
            {activeTab === 'activity' && (
              <div className="card border-0 shadow-sm animate-fade-in">
                <div className="card-header bg-white py-3 border-bottom d-flex flex-column flex-sm-row align-items-start align-items-sm-center justify-content-between gap-2">
                  <h5 className="mb-0 fw-bold text-dark"><i className="fas fa-history me-2 text-primary"></i>Activity History</h5>
                </div>

                {/* Sub-tabs header */}
                <div className="d-flex border-bottom bg-light">
                  <button
                    type="button"
                    className={`btn btn-link flex-fill py-3 text-decoration-none fw-semibold border-0 ${activitySubTab === 'jobs' ? 'text-primary border-bottom border-primary border-3' : 'text-muted'}`}
                    onClick={() => setActivitySubTab('jobs')}
                  >
                    <i className="fas fa-bookmark me-1"></i> Favorite JDs ({favoriteJobs.length})
                  </button>
                  <button
                    type="button"
                    className={`btn btn-link flex-fill py-3 text-decoration-none fw-semibold border-0 ${activitySubTab === 'likes' ? 'text-primary border-bottom border-primary border-3' : 'text-muted'}`}
                    onClick={() => setActivitySubTab('likes')}
                  >
                    <i className="fas fa-thumbs-up me-1"></i> Liked Posts ({likedPosts.length})
                  </button>
                  <button
                    type="button"
                    className={`btn btn-link flex-fill py-3 text-decoration-none fw-semibold border-0 ${activitySubTab === 'comments' ? 'text-primary border-bottom border-primary border-3' : 'text-muted'}`}
                    onClick={() => setActivitySubTab('comments')}
                  >
                    <i className="fas fa-comment-dots me-1"></i> Comments ({commentedPosts.length})
                  </button>
                  <button
                    type="button"
                    className={`btn btn-link flex-fill py-3 text-decoration-none fw-semibold border-0 ${activitySubTab === 'shares' ? 'text-primary border-bottom border-primary border-3' : 'text-muted'}`}
                    onClick={() => setActivitySubTab('shares')}
                  >
                    <i className="fas fa-share me-1"></i> Shared ({sharedPosts.length})
                  </button>
                </div>

                <div className="card-body p-4">
                  {/* Favorite Jobs Sub-tab */}
                  {activitySubTab === 'jobs' && (
                    <div className="favorite-jobs-list">
                      {favoriteJobs.length === 0 ? (
                        <div className="text-center py-5 text-muted">
                          <i className="far fa-bookmark fs-2 mb-2 text-muted opacity-40"></i>
                          <p className="mb-0">You have no saved jobs yet.</p>
                        </div>
                      ) : (
                        <div className="d-flex flex-column gap-3">
                          {favoriteJobs.map((job) => (
                            <div key={job.id} className="experience-item p-3 rounded border bg-light d-flex justify-content-between align-items-center hover-shadow-sm transition-all">
                              <div className="d-flex align-items-center gap-3">
                                <div className="rounded bg-white p-2 border d-flex align-items-center justify-content-center" style={{ width: '50px', height: '50px' }}>
                                  <i className="fas fa-briefcase text-primary fs-4"></i>
                                </div>
                                <div>
                                  <h6 className="fw-bold mb-1 text-dark" style={{ fontSize: '0.95rem' }}>{job.title}</h6>
                                  <p className="mb-1 text-secondary small fw-medium">
                                    <i className="fas fa-building me-1.5 text-muted"></i>{job.company_name}
                                  </p>
                                  <div className="d-flex gap-2">
                                    <span className="badge bg-primary-subtle text-primary border border-primary-subtle rounded-pill px-2.5 py-0.5 fw-normal" style={{ fontSize: '0.7rem' }}>
                                      {job.job_type}
                                    </span>
                                    <span className="badge bg-success-subtle text-success border border-success-subtle rounded-pill px-2.5 py-0.5 fw-normal" style={{ fontSize: '0.7rem' }}>
                                      {job.salary}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <div className="d-flex flex-column align-items-end gap-2">
                                <span className="text-muted small" style={{ fontSize: '0.75rem' }}>
                                  Saved: {new Date(job.saved_at).toLocaleDateString()}
                                </span>
                                <button
                                  type="button"
                                  className="btn btn-sm btn-outline-danger px-3 rounded-pill fw-semibold"
                                  onClick={() => handleUnsaveJob(job.id)}
                                >
                                  <i className="fas fa-trash-alt me-1"></i> Unsave
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Liked Posts Sub-tab */}
                  {activitySubTab === 'likes' && (
                    <div className="liked-posts-list">
                      {likedPosts.length === 0 ? (
                        <div className="text-center py-5 text-muted">
                          <i className="far fa-thumbs-up fs-2 mb-2 text-muted opacity-40"></i>
                          <p className="mb-0">You have no liked posts yet.</p>
                        </div>
                      ) : (
                        <div className="d-flex flex-column gap-3">
                          {likedPosts.map((post) => (
                            <div key={post.id} className="p-3 rounded border bg-light d-flex flex-column gap-2 hover-shadow-sm transition-all position-relative" style={{ padding: '1.25rem' }}>
                              <div className="d-flex align-items-center gap-3">
                                <img src={post.avatar} alt="avatar" className="rounded-circle border" style={{ width: '40px', height: '40px' }} />
                                <div className="flex-grow-1" style={{ minWidth: 0 }}>
                                  <h6 className="fw-bold mb-0 text-dark" style={{ fontSize: '0.9rem' }}>{post.author}</h6>
                                  <p className="mb-0 text-muted small" style={{ fontSize: '0.75rem' }}>Liked: {post.liked_at}</p>
                                </div>
                                <button
                                  type="button"
                                  className="btn btn-xs btn-outline-danger px-2.5 py-1 rounded-pill fw-semibold"
                                  style={{ fontSize: '0.75rem' }}
                                  onClick={() => handleUnlikePost(post.id)}
                                >
                                  Unlike
                                </button>
                              </div>
                              <div className="post-text text-secondary small mt-1" style={{ fontSize: '0.85rem', lineHeight: '1.5' }}>
                                {post.content}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Comments Sub-tab */}
                  {activitySubTab === 'comments' && (
                    <div className="commented-posts-list">
                      {commentedPosts.length === 0 ? (
                        <div className="text-center py-5 text-muted">
                          <i className="far fa-comment-dots fs-2 mb-2 text-muted opacity-40"></i>
                          <p className="mb-0">You have no comment activity yet.</p>
                        </div>
                      ) : (
                        <div className="d-flex flex-column gap-3">
                          {commentedPosts.map((post) => (
                            <div key={post.id} className="p-3 rounded border bg-light d-flex flex-column gap-3 hover-shadow-sm transition-all position-relative" style={{ padding: '1.25rem' }}>
                              <div className="d-flex align-items-center gap-3">
                                <img src={post.avatar} alt="avatar" className="rounded-circle border" style={{ width: '40px', height: '40px' }} />
                                <div className="flex-grow-1" style={{ minWidth: 0 }}>
                                  <h6 className="fw-bold mb-0 text-dark" style={{ fontSize: '0.9rem' }}>{post.author}</h6>
                                  <p className="mb-0 text-muted small" style={{ fontSize: '0.75rem' }}>Commented: {post.commented_at}</p>
                                </div>
                                <button
                                  type="button"
                                  className="btn btn-xs btn-outline-danger px-2.5 py-1 rounded-pill fw-semibold"
                                  style={{ fontSize: '0.75rem' }}
                                  onClick={() => handleDeleteCommentActivity(post.id)}
                                >
                                  Delete
                                </button>
                              </div>
                              <div className="bg-white p-2.5 rounded border small text-muted border-start border-primary border-4" style={{ fontSize: '0.85rem' }}>
                                <strong>Original Post: </strong>
                                <span className="d-inline-block w-100">{post.content}</span>
                              </div>
                              <div className="my-comment p-2.5 rounded bg-light border text-dark fw-medium small" style={{ fontSize: '0.87rem' }}>
                                <i className="fas fa-comment me-1.5 text-primary"></i> {post.comment}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Shared Sub-tab */}
                  {activitySubTab === 'shares' && (
                    <div className="shared-posts-list">
                      {sharedPosts.length === 0 ? (
                        <div className="text-center py-5 text-muted">
                          <i className="far fa-share-square fs-2 mb-2 text-muted opacity-40"></i>
                          <p className="mb-0">You have no share activity yet.</p>
                        </div>
                      ) : (
                        <div className="d-flex flex-column gap-3">
                          {sharedPosts.map((post) => (
                            <div key={post.id} className="p-3 rounded border bg-light d-flex flex-column gap-3 hover-shadow-sm transition-all position-relative" style={{ padding: '1.25rem' }}>
                              <div className="d-flex align-items-center gap-3">
                                <img src={post.avatar} alt="avatar" className="rounded-circle border" style={{ width: '40px', height: '40px' }} />
                                <div className="flex-grow-1" style={{ minWidth: 0 }}>
                                  <h6 className="fw-bold mb-0 text-dark" style={{ fontSize: '0.9rem' }}>{post.author}</h6>
                                  <p className="mb-0 text-muted small" style={{ fontSize: '0.75rem' }}>Shared: {post.shared_at}</p>
                                </div>
                                <button
                                  type="button"
                                  className="btn btn-xs btn-outline-danger px-2.5 py-1 rounded-pill fw-semibold"
                                  style={{ fontSize: '0.75rem' }}
                                  onClick={() => handleRemoveShareActivity(post.id)}
                                >
                                  Remove
                                </button>
                              </div>
                              {post.message && (
                                <div className="shared-message p-2.5 rounded bg-white border text-dark fw-semibold small" style={{ fontSize: '0.87rem' }}>
                                  <i className="fas fa-quote-left me-1.5 text-primary"></i> {post.message}
                                </div>
                              )}
                              <div className="bg-white p-2.5 rounded border small text-muted border-start border-secondary border-4" style={{ fontSize: '0.85rem' }}>
                                <strong>Original Post: </strong>
                                <span className="d-inline-block w-100">{post.content}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

          </div>
        </div>
      </div>

      {/* Modal Sub-Components */}
      <CandidatePersonalInfoModal
        show={showPersonalInfo}
        onClose={() => setShowPersonalInfo(false)}
        profileData={profileData}
      />

      {/* Manage CV Modal */}
      {showCVModal && (
        <div className="profile-modal-overlay" onClick={() => setShowCVModal(false)}>
          <div className="profile-modal-card profile-modal-large" onClick={(e) => e.stopPropagation()}>
            <div className="profile-modal-header d-flex justify-content-between align-items-center">
              <h5 className="profile-modal-title mb-0 d-flex align-items-center">
                <i className="far fa-file-pdf me-2 text-primary"></i>
                Manage My CVs
              </h5>
              <div className="d-flex align-items-center gap-3">
                <button
                  type="button"
                  className="btn btn-outline-success btn-sm d-flex align-items-center gap-2 px-3 fw-semibold rounded-pill"
                  title="Export CV from Profile"
                  onClick={() => setShowExportModal(true)}
                >
                  <i className="fas fa-file-export"></i> Auto-Generate CV
                </button>
                <button type="button" className="btn-close" aria-label="Close" onClick={() => setShowCVModal(false)}></button>
              </div>
            </div>
            <div className="profile-modal-body p-4 scrollable-modal-body" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
              <CandidateCV
                cvList={cvList}
                fetchCVs={fetchCVs}
                setModalError={setModalError}
              />
            </div>
          </div>
        </div>
      )}

      {/* Export CV Modal */}
      <CandidateExportModal
        show={showExportModal}
        onClose={() => setShowExportModal(false)}
        profileData={profileData}
        educations={educations}
        workExperiences={workExperiences}
        skills={skills}
        setModalError={setModalError}
      />

      {/* Modal Applied Jobs */}
      <CandidateAppliedJobs
        show={showAppliedJobsModal}
        onClose={() => setShowAppliedJobsModal(false)}
      />
    </section>
  );
};

export default CandidateProfile;