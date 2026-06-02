import axios from 'axios';

// Khi trang vừa load (dùng useEffect) để lấy dữ liệu thực từ DB
useEffect(() => {
  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("token"); // Lấy token lưu ở localStorage khi đăng nhập thành công
      const response = await axios.get("http://localhost:5000/api/candidate/profile", {
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = response.data;
      // Cập nhật state với dữ liệu thực từ DB
      setProfileData({
        displayName: data.full_name,
        jobTitle: data.headline || 'Chưa cập nhật',
        address: data.about || 'Chưa cập nhật',
        fullName: data.full_name,
        email: data.email,
        avatar: data.avatar_url || 'https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-chat/ava3.webp'
      });
      if (data.skills) setSkills(data.skills);
    } catch (error) {
      console.error("Lấy thông tin cá nhân thất bại:", error);
    }
  };

  fetchProfile();
}, []);
