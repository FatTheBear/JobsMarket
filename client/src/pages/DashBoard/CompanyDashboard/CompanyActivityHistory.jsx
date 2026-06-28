import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const CompanyActivityHistory = () => {
  const navigate = useNavigate();
  const [likedPosts, setLikedPosts] = useState([]);
  const [commentedPosts, setCommentedPosts] = useState([]);
  const [sharedPosts, setSharedPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchActivityHistory = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const res = await axios.get('http://localhost:5000/api/posts/activity/history', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setLikedPosts(res.data.likes || []);
      setCommentedPosts(res.data.comments || []);
      setSharedPosts(res.data.shares || []);
    } catch (err) {
      console.error("Failed to load activity history from DB:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivityHistory();
  }, []);

  const getFullUrl = (url) => {
    if (!url) return '/default-avatar.png';
    const cleanUrl = url.trim();
    if (cleanUrl.startsWith('http://') || cleanUrl.startsWith('https://') || cleanUrl.startsWith('data:')) {
      return cleanUrl;
    }
    return `http://localhost:5000${cleanUrl.startsWith('/') ? '' : '/'}${cleanUrl}`;
  };

  const formatDateTime = (isoString) => {
    if (!isoString) return '';
    try {
      const date = new Date(isoString);
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      const seconds = String(date.getSeconds()).padStart(2, '0');
      return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
    } catch (e) {
      return isoString;
    }
  };

  const formatDateHeader = (isoString) => {
    if (!isoString) return 'Unknown Date';
    try {
      const date = new Date(isoString);
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    } catch (e) {
      return 'Unknown Date';
    }
  };

  const formatTimeOnly = (isoString) => {
    if (!isoString) return '';
    try {
      const date = new Date(isoString);
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      const seconds = String(date.getSeconds()).padStart(2, '0');
      return `${hours}:${minutes}:${seconds}`;
    } catch (e) {
      return isoString;
    }
  };

  const groupItemsByDate = (items, dateKey) => {
    const groups = {};
    items.forEach(item => {
      const dateStr = formatDateHeader(item[dateKey]);
      if (!groups[dateStr]) {
        groups[dateStr] = [];
      }
      groups[dateStr].push(item);
    });
    return Object.entries(groups);
  };

  const [activitySubTab, setActivitySubTab] = useState('likes'); // 'likes', 'comments', 'shares'
  const [activityMessage, setActivityMessage] = useState('');
  const [activityMessageType, setActivityMessageType] = useState('success');

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedYear, setSelectedYear] = useState('all'); // 'all', '2026', '2025', etc.
  const [selectedMonth, setSelectedMonth] = useState('all'); // 'all', '1', '2', etc.
  const [visibleCount, setVisibleCount] = useState(10);

  // States for Post Detail Modal in Activity History
  const [activePostDetail, setActivePostDetail] = useState(null);
  const [loadingPostDetail, setLoadingPostDetail] = useState(false);
  const [postComments, setPostComments] = useState([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [newCommentText, setNewCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [showRepostModal, setShowRepostModal] = useState(false);
  const [repostContent, setRepostContent] = useState('');
  const [isReposting, setIsReposting] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editPostContent, setEditPostContent] = useState('');
  const [editPostVisibility, setEditPostVisibility] = useState('public');
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  const handleOpenPostDetail = async (postId) => {
    setLoadingPostDetail(true);
    try {
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await axios.get(`http://localhost:5000/api/posts/detail/${postId}`, { headers });
      setActivePostDetail(res.data);
    } catch (err) {
      console.error('Failed to fetch post detail:', err);
      alert('Could not load post details.');
    } finally {
      setLoadingPostDetail(false);
    }
  };

  useEffect(() => {
    if (!activePostDetail) {
      setPostComments([]);
      return;
    }

    const fetchComments = async () => {
      setLoadingComments(true);
      try {
        const token = localStorage.getItem('token');
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const res = await axios.get(`http://localhost:5000/api/posts/${activePostDetail.id}/comments`, { headers });
        setPostComments(res.data || []);
      } catch (err) {
        console.error('Failed to load comments:', err);
      } finally {
        setLoadingComments(false);
      }
    };

    fetchComments();
  }, [activePostDetail]);

  const handleModalToggleLike = async () => {
    if (!activePostDetail) return;
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`http://localhost:5000/api/posts/${activePostDetail.id}/like`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setActivePostDetail(prev => ({
        ...prev,
        is_liked: response.data.is_liked ? 1 : 0,
        likes_count: response.data.likes_count
      }));
    } catch (err) {
      console.error('Failed to toggle like:', err);
    }
  };

  const handleModalAddComment = async (e) => {
    if (e) e.preventDefault();
    if (!newCommentText.trim() || !activePostDetail) return;

    setSubmittingComment(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post(`http://localhost:5000/api/posts/${activePostDetail.id}/comments`, {
        content: newCommentText
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setNewCommentText('');
      
      const resComments = await axios.get(`http://localhost:5000/api/posts/${activePostDetail.id}/comments`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      setPostComments(resComments.data || []);

      setActivePostDetail(prev => ({
        ...prev,
        comments_count: (prev.comments_count || 0) + 1
      }));
    } catch (err) {
      console.error('Failed to add comment:', err);
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleModalRepost = async () => {
    if (!activePostDetail) return;
    setIsReposting(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post(`http://localhost:5000/api/posts/${activePostDetail.id}/repost`, {
        content: repostContent
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Shared successfully to Community Feed!');
      setShowRepostModal(false);
      setRepostContent('');
    } catch (err) {
      console.error('Failed to repost:', err);
      alert('Failed to share post. Please try again.');
    } finally {
      setIsReposting(false);
    }
  };

  const handleModalDeletePost = async () => {
    if (!activePostDetail) return;
    if (!window.confirm("Are you sure you want to delete this post? This action cannot be undone.")) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/posts/${activePostDetail.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      alert("Post deleted successfully.");
      setActivePostDetail(null);
      fetchActivityHistory();
    } catch (err) {
      console.error('Failed to delete post:', err);
      alert("Failed to delete post. Please try again.");
    }
  };

  const handleOpenEdit = () => {
    if (!activePostDetail) return;
    setEditPostContent(activePostDetail.content || '');
    setEditPostVisibility(activePostDetail.visibility || 'public');
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    setIsSavingEdit(true);
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:5000/api/posts/${activePostDetail.id}`, {
        content: editPostContent,
        visibility: editPostVisibility
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setActivePostDetail(prev => ({
        ...prev,
        content: editPostContent,
        visibility: editPostVisibility
      }));

      setShowEditModal(false);
    } catch (err) {
      console.error('Failed to update post:', err);
      alert('Failed to save changes. Please try again.');
    } finally {
      setIsSavingEdit(false);
    }
  };

  const getAvailableYears = () => {
    const years = new Set();
    const addYearsFromList = (items, dateKey) => {
      items.forEach(item => {
        if (item[dateKey]) {
          const year = new Date(item[dateKey]).getFullYear();
          if (year) years.add(year);
        }
      });
    };
    addYearsFromList(likedPosts, 'liked_at');
    addYearsFromList(commentedPosts, 'commented_at');
    addYearsFromList(sharedPosts, 'shared_at');
    
    const yearList = Array.from(years).sort((a, b) => b - a);
    if (yearList.length === 0) {
      yearList.push(new Date().getFullYear());
    }
    return yearList;
  };

  const filterByTime = (dateString) => {
    if (!dateString) return false;
    if (selectedYear === 'all') return true;

    const date = new Date(dateString);
    const itemYear = date.getFullYear().toString();
    const itemMonth = (date.getMonth() + 1).toString();

    const matchesYear = itemYear === selectedYear;
    if (selectedMonth === 'all') {
      return matchesYear;
    }
    return matchesYear && itemMonth === selectedMonth;
  };

  const getFilteredItems = (items, type) => {
    return items.filter(item => {
      const dateField = type === 'likes' ? item.liked_at : (type === 'comments' ? item.commented_at : item.shared_at);
      const matchesTime = filterByTime(dateField);

      const searchLower = searchTerm.toLowerCase().trim();
      if (!searchLower) return matchesTime;

      const authorMatch = item.author?.toLowerCase().includes(searchLower);
      const contentMatch = item.content?.toLowerCase().includes(searchLower);
      const commentMatch = type === 'comments' && item.comment?.toLowerCase().includes(searchLower);
      const messageMatch = type === 'shares' && item.message?.toLowerCase().includes(searchLower);

      return matchesTime && (authorMatch || contentMatch || commentMatch || messageMatch);
    });
  };

  const handleTabChange = (tab) => {
    setActivitySubTab(tab);
    setVisibleCount(10);
    setSearchTerm('');
    setSelectedYear('all');
    setSelectedMonth('all');
  };

  const handleSearchChange = (val) => {
    setSearchTerm(val);
    setVisibleCount(10);
  };

  const handleUnlikePost = async (postId) => {
    const confirmUnlike = window.confirm("Are you sure you want to unlike this post?");
    if (confirmUnlike) {
      try {
        const token = localStorage.getItem('token');
        await axios.post(`http://localhost:5000/api/posts/${postId}/like`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
        await fetchActivityHistory();
        setActivityMessageType('success');
        setActivityMessage("Post unliked successfully!");
        setTimeout(() => setActivityMessage(''), 3000);
      } catch (err) {
        console.error("Failed to unlike post:", err);
        setActivityMessageType('danger');
        setActivityMessage("Failed to unlike post. Please try again.");
      }
    }
  };

  const handleDeleteCommentActivity = async (commentId) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this comment?");
    if (confirmDelete) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`http://localhost:5000/api/posts/comments/${commentId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        await fetchActivityHistory();
        setActivityMessageType('success');
        setActivityMessage("Comment deleted successfully!");
        setTimeout(() => setActivityMessage(''), 3000);
      } catch (err) {
        console.error("Failed to delete comment:", err);
        setActivityMessageType('danger');
        setActivityMessage("Failed to delete comment. Please try again.");
      }
    }
  };

  const handleRemoveShareActivity = async (postId) => {
    const confirmRemove = window.confirm("Are you sure you want to remove this share activity?");
    if (confirmRemove) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`http://localhost:5000/api/posts/${postId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        await fetchActivityHistory();
        setActivityMessageType('success');
        setActivityMessage("Share activity removed successfully!");
        setTimeout(() => setActivityMessage(''), 3000);
      } catch (err) {
        console.error("Failed to remove share activity:", err);
        setActivityMessageType('danger');
        setActivityMessage("Failed to remove share activity. Please try again.");
      }
    }
  };

  return (
    <div className="animate-fade-in d-flex flex-column gap-4">
      {activityMessage && (
        <div className={`alert alert-${activityMessageType} py-2.5 px-3 small border-0 shadow-sm animate-fade-in`} role="alert">
          <i className={activityMessageType === 'success' ? "fas fa-check-circle me-2" : "fas fa-exclamation-triangle me-2"}></i>
          {activityMessage}
        </div>
      )}

      {/* ACTIVITY HISTORY VIEW */}
      <div className="card border-0 shadow-sm animate-fade-in" style={{ borderRadius: '12px' }}>
        <div className="card-header bg-white py-3 border-bottom d-flex flex-column flex-sm-row align-items-start align-items-sm-center justify-content-between gap-2" style={{ borderRadius: '12px 12px 0 0' }}>
          <h5 className="mb-0 fw-bold text-dark"><i className="fas fa-history me-2" style={{ color: '#01796F' }}></i>Activity History</h5>
        </div>

        {/* Sub-tabs header */}
        <div className="d-flex border-bottom bg-light">
          <button
            type="button"
            className="btn btn-link flex-fill py-3 text-decoration-none fw-semibold border-0"
            style={{
              color: activitySubTab === 'likes' ? '#01796F' : '#6c757d',
              borderBottom: activitySubTab === 'likes' ? '3px solid #01796F' : 'none',
              borderRadius: 0
            }}
            onClick={() => handleTabChange('likes')}
          >
            <i className="fas fa-thumbs-up me-1"></i> Liked Posts ({likedPosts.length})
          </button>
          <button
            type="button"
            className="btn btn-link flex-fill py-3 text-decoration-none fw-semibold border-0"
            style={{
              color: activitySubTab === 'comments' ? '#01796F' : '#6c757d',
              borderBottom: activitySubTab === 'comments' ? '3px solid #01796F' : 'none',
              borderRadius: 0
            }}
            onClick={() => handleTabChange('comments')}
          >
            <i className="fas fa-comment-dots me-1"></i> Comments ({commentedPosts.length})
          </button>
          <button
            type="button"
            className="btn btn-link flex-fill py-3 text-decoration-none fw-semibold border-0"
            style={{
              color: activitySubTab === 'shares' ? '#01796F' : '#6c757d',
              borderBottom: activitySubTab === 'shares' ? '3px solid #01796F' : 'none',
              borderRadius: 0
            }}
            onClick={() => handleTabChange('shares')}
          >
            <i className="fas fa-share me-1"></i> Shared ({sharedPosts.length})
          </button>
        </div>

        {/* Static Filter Bar */}
        <div className="px-4 py-2 bg-white border-bottom">
          <div className="row g-2 align-items-center">
            <div className="col-12 col-md-5">
              <div className="input-group border rounded-pill bg-white px-3 py-1 shadow-sm d-flex align-items-center" style={{ maxWidth: '280px' }}>
                <span className="bg-transparent border-0 text-muted" style={{ fontSize: '0.85rem' }}><i className="fas fa-search"></i></span>
                <input
                  type="text"
                  className="form-control border-0 bg-transparent py-1 px-2 small text-dark"
                  style={{ outline: 'none', boxShadow: 'none', fontSize: '0.8rem' }}
                  placeholder={`Search in ${activitySubTab === 'likes' ? 'liked posts' : activitySubTab === 'comments' ? 'comments' : 'shares'}...`}
                  value={searchTerm}
                  onChange={(e) => handleSearchChange(e.target.value)}
                />
                {searchTerm && (
                  <button
                    className="btn btn-link text-muted p-0 border-0"
                    type="button"
                    onClick={() => handleSearchChange('')}
                  >
                    <i className="fas fa-times-circle" style={{ fontSize: '0.85rem' }}></i>
                  </button>
                )}
              </div>
            </div>

            <div className="col-12 col-md-7 d-flex align-items-center justify-content-md-end gap-2 flex-wrap">
              <div className="d-flex align-items-center gap-2">
                <span className="text-secondary small fw-semibold d-flex align-items-center gap-1" style={{ fontSize: '0.78rem' }}>
                  <i className="far fa-calendar-alt" style={{ color: '#01796F' }}></i> Year:
                </span>
                <select
                  value={selectedYear}
                  onChange={(e) => {
                    setSelectedYear(e.target.value);
                    if (e.target.value === 'all') setSelectedMonth('all');
                    setVisibleCount(10);
                  }}
                  className="form-select form-select-sm border rounded-pill px-2.5 shadow-sm bg-white"
                  style={{ fontSize: '0.78rem', width: 'auto', cursor: 'pointer' }}
                >
                  <option value="all">All time</option>
                  {getAvailableYears().map(year => (
                    <option key={year} value={year.toString()}>{year}</option>
                  ))}
                </select>
              </div>

              {selectedYear !== 'all' && (
                <div className="d-flex align-items-center gap-2 animate-fade-in">
                  <span className="text-secondary small fw-semibold" style={{ fontSize: '0.78rem' }}>Month:</span>
                  <select
                    value={selectedMonth}
                    onChange={(e) => {
                      setSelectedMonth(e.target.value);
                      setVisibleCount(10);
                    }}
                    className="form-select form-select-sm border rounded-pill px-2.5 shadow-sm bg-white"
                    style={{ fontSize: '0.78rem', width: 'auto', cursor: 'pointer' }}
                  >
                    <option value="all">All months</option>
                    <option value="1">January</option>
                    <option value="2">February</option>
                    <option value="3">March</option>
                    <option value="4">April</option>
                    <option value="5">May</option>
                    <option value="6">June</option>
                    <option value="7">July</option>
                    <option value="8">August</option>
                    <option value="9">September</option>
                    <option value="10">October</option>
                    <option value="11">November</option>
                    <option value="12">December</option>
                  </select>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Scrollable Card Body */}
        <div className="card-body px-4 pb-4 pt-3 scrollable-activity-history" style={{ height: 'calc(70vh - 111px)', overflowY: 'auto' }}>

          {/* Liked Posts Sub-tab */}
          {activitySubTab === 'likes' && (() => {
            const filtered = getFilteredItems(likedPosts, 'likes');
            const grouped = groupItemsByDate(filtered.slice(0, visibleCount), 'liked_at');
            return (
              <div className="liked-posts-list">
                {filtered.length === 0 ? (
                  <div className="text-center py-5 text-muted">
                    <i className="far fa-thumbs-up fs-2 mb-2 text-muted opacity-40"></i>
                    <p className="mb-0">{searchTerm || selectedYear !== 'all' || selectedMonth !== 'all' ? "No activities match your filters." : "You have no liked posts yet."}</p>
                  </div>
                ) : (
                  <div className="d-flex flex-column gap-3">
                    {grouped.map(([dateStr, items]) => (
                      <div key={dateStr} className="date-group">
                        <div className="fw-bold text-dark small mb-2.5 d-flex align-items-center gap-2 pb-1 border-bottom" style={{ fontSize: '0.82rem' }}>
                          <i className="far fa-calendar-alt" style={{ color: '#01796F' }}></i> {dateStr}
                        </div>
                        <div className="d-flex flex-column gap-2 ms-2 ps-2 border-start border-2" style={{ borderColor: '#e0f2f1' }}>
                          {items.map((post) => (
                            <div 
                              key={post.id} 
                              className="p-3 rounded border bg-light d-flex flex-column gap-1.5 hover-shadow-sm transition-all position-relative cursor-pointer" 
                              style={{ padding: '0.85rem 1.25rem' }}
                              onClick={() => handleOpenPostDetail(post.id)}
                            >
                              <div className="d-flex align-items-center gap-3">
                                <img src={getFullUrl(post.avatar)} alt="avatar" className="rounded-circle border" style={{ width: '36px', height: '36px', objectFit: 'cover' }} />
                                <div className="flex-grow-1" style={{ minWidth: 0 }}>
                                  <div className="d-flex align-items-center gap-2 flex-wrap">
                                    <h6 className="fw-bold mb-0 text-dark" style={{ fontSize: '0.88rem' }}>{post.author}</h6>
                                    <span className="text-muted small" style={{ fontSize: '0.75rem' }}>• Liked {formatTimeOnly(post.liked_at)}</span>
                                  </div>
                                  <div className="post-text text-secondary small text-truncate mt-1" style={{ fontSize: '0.8rem', maxWidth: '90%' }} title={post.content}>
                                    {post.content}
                                  </div>
                                </div>
                                <button
                                  type="button"
                                  className="btn btn-xs btn-outline-danger px-2.5 py-1 rounded-pill fw-semibold"
                                  style={{ fontSize: '0.7rem' }}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleUnlikePost(post.id);
                                  }}
                                >
                                  Unlike
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                    
                    {filtered.length > visibleCount && (
                      <div className="text-center mt-3">
                        <button
                          type="button"
                          className="btn rounded-pill px-4 py-2 fw-semibold small shadow-sm transition-all"
                          style={{ color: '#01796F', borderColor: '#01796F', backgroundColor: 'transparent' }}
                          onClick={() => setVisibleCount(prev => prev + 10)}
                        >
                          <i className="fas fa-arrow-down me-1.5"></i> Load More
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })()}

          {/* Comments Sub-tab */}
          {activitySubTab === 'comments' && (() => {
            const filtered = getFilteredItems(commentedPosts, 'comments');
            const grouped = groupItemsByDate(filtered.slice(0, visibleCount), 'commented_at');
            return (
              <div className="commented-posts-list">
                {filtered.length === 0 ? (
                  <div className="text-center py-5 text-muted">
                    <i className="far fa-comment-dots fs-2 mb-2 text-muted opacity-40"></i>
                    <p className="mb-0">{searchTerm || selectedYear !== 'all' || selectedMonth !== 'all' ? "No activities match your filters." : "You have no comment activity yet."}</p>
                  </div>
                ) : (
                  <div className="d-flex flex-column gap-3">
                    {grouped.map(([dateStr, items]) => (
                      <div key={dateStr} className="date-group">
                        <div className="fw-bold text-dark small mb-2.5 d-flex align-items-center gap-2 pb-1 border-bottom" style={{ fontSize: '0.82rem' }}>
                          <i className="far fa-calendar-alt" style={{ color: '#01796F' }}></i> {dateStr}
                        </div>
                        <div className="d-flex flex-column gap-2 ms-2 ps-2 border-start border-2" style={{ borderColor: '#e0f2f1' }}>
                          {items.map((post) => (
                            <div 
                              key={post.id} 
                              className="p-3 rounded border bg-light d-flex flex-column gap-1.5 hover-shadow-sm transition-all position-relative cursor-pointer" 
                              style={{ padding: '0.85rem 1.25rem' }}
                              onClick={() => handleOpenPostDetail(post.post_id)}
                            >
                              <div className="d-flex align-items-center gap-3">
                                <img src={getFullUrl(post.avatar)} alt="avatar" className="rounded-circle border" style={{ width: '36px', height: '36px', objectFit: 'cover' }} />
                                <div className="flex-grow-1" style={{ minWidth: 0 }}>
                                  <div className="d-flex align-items-center gap-2 flex-wrap">
                                    <h6 className="fw-bold mb-0 text-dark" style={{ fontSize: '0.88rem' }}>{post.author}</h6>
                                    <span className="text-muted small" style={{ fontSize: '0.75rem' }}>• Commented {formatTimeOnly(post.commented_at)}</span>
                                  </div>
                                  <div className="my-comment text-dark fw-semibold small mt-1" style={{ fontSize: '0.82rem' }}>
                                    <i className="fas fa-comment me-1.5" style={{ fontSize: '0.75rem', color: '#01796F' }}></i>
                                    {post.comment}
                                  </div>
                                  <div className="post-text text-muted small text-truncate mt-1" style={{ fontSize: '0.75rem', opacity: 0.8, maxWidth: '90%' }} title={post.content}>
                                    <strong>Original Post:</strong> {post.content}
                                  </div>
                                </div>
                                <button
                                  type="button"
                                  className="btn btn-xs btn-outline-danger px-2.5 py-1 rounded-pill fw-semibold"
                                  style={{ fontSize: '0.7rem' }}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteCommentActivity(post.id);
                                  }}
                                >
                                  Delete
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}

                    {filtered.length > visibleCount && (
                      <div className="text-center mt-3">
                        <button
                          type="button"
                          className="btn btn-outline-primary rounded-pill px-4 py-2 fw-semibold small shadow-sm transition-all"
                          onClick={() => setVisibleCount(prev => prev + 10)}
                        >
                          <i className="fas fa-arrow-down me-1.5"></i> Load More
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })()}

          {/* Shared Sub-tab */}
          {activitySubTab === 'shares' && (() => {
            const filtered = getFilteredItems(sharedPosts, 'shares');
            const grouped = groupItemsByDate(filtered.slice(0, visibleCount), 'shared_at');
            return (
              <div className="shared-posts-list">
                {filtered.length === 0 ? (
                  <div className="text-center py-5 text-muted">
                    <i className="far fa-share-square fs-2 mb-2 text-muted opacity-40"></i>
                    <p className="mb-0">{searchTerm || selectedYear !== 'all' || selectedMonth !== 'all' ? "No activities match your filters." : "You have no share activity yet."}</p>
                  </div>
                ) : (
                  <div className="d-flex flex-column gap-3">
                    {grouped.map(([dateStr, items]) => (
                      <div key={dateStr} className="date-group">
                        <div className="fw-bold text-dark small mb-2.5 d-flex align-items-center gap-2 pb-1 border-bottom" style={{ fontSize: '0.82rem' }}>
                          <i className="far fa-calendar-alt" style={{ color: '#01796F' }}></i> {dateStr}
                        </div>
                        <div className="d-flex flex-column gap-2 ms-2 ps-2 border-start border-2" style={{ borderColor: '#e0f2f1' }}>
                          {items.map((post) => (
                            <div 
                              key={post.id} 
                              className="p-3 rounded border bg-light d-flex flex-column gap-1.5 hover-shadow-sm transition-all position-relative cursor-pointer" 
                              style={{ padding: '0.85rem 1.25rem' }}
                              onClick={() => handleOpenPostDetail(post.id)}
                            >
                              <div className="d-flex align-items-center gap-3">
                                <img src={getFullUrl(post.avatar)} alt="avatar" className="rounded-circle border" style={{ width: '36px', height: '36px', objectFit: 'cover' }} />
                                <div className="flex-grow-1" style={{ minWidth: 0 }}>
                                  <div className="d-flex align-items-center gap-2 flex-wrap">
                                    <h6 className="fw-bold mb-0 text-dark" style={{ fontSize: '0.88rem' }}>{post.author}</h6>
                                    <span className="text-muted small" style={{ fontSize: '0.75rem' }}>• Shared {formatTimeOnly(post.shared_at)}</span>
                                  </div>
                                  {post.message && (
                                    <div className="shared-message text-dark fw-semibold small mt-1" style={{ fontSize: '0.82rem' }}>
                                      <i className="fas fa-quote-left me-1.5" style={{ fontSize: '0.7rem', color: '#01796F' }}></i>
                                      {post.message}
                                    </div>
                                  )}
                                  <div className="post-text text-muted small text-truncate mt-1" style={{ fontSize: '0.75rem', opacity: 0.8, maxWidth: '90%' }} title={post.content}>
                                    <strong>Original Post:</strong> {post.content}
                                  </div>
                                </div>
                                <button
                                  type="button"
                                  className="btn btn-xs btn-outline-danger px-2.5 py-1 rounded-pill fw-semibold"
                                  style={{ fontSize: '0.7rem' }}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleRemoveShareActivity(post.id);
                                  }}
                                >
                                  Remove
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}

                    {filtered.length > visibleCount && (
                      <div className="text-center mt-3">
                        <button
                          type="button"
                          className="btn btn-outline-primary rounded-pill px-4 py-2 fw-semibold small shadow-sm transition-all"
                          onClick={() => setVisibleCount(prev => prev + 10)}
                        >
                          <i className="fas fa-arrow-down me-1.5"></i> Load More
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })()}
        </div>
      </div>

      {/* Post Detail Modal */}
      {activePostDetail && (
        <div
          className="modal-backdrop-custom"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            zIndex: 100005,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backdropFilter: 'blur(4px)',
            padding: '20px'
          }}
        >
          <div
            className="modal-content-custom"
            style={{
              backgroundColor: '#fff',
              borderRadius: '12px',
              width: '100%',
              maxWidth: '600px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              display: 'flex',
              flexDirection: 'column',
              maxHeight: '85vh',
              overflow: 'hidden'
            }}
          >
            {/* Header */}
            <div className="d-flex align-items-center justify-content-between p-3 border-bottom">
              <h6 className="fw-bold mb-0 text-dark">Original Post</h6>
              <button
                type="button"
                onClick={() => setActivePostDetail(null)}
                className="btn-close"
                style={{ cursor: 'pointer' }}
                aria-label="Close"
              ></button>
            </div>

            {/* Body */}
            <div className="p-4" style={{ overflowY: 'auto', flexGrow: 1 }}>
              {/* Post Author info */}
              <div className="d-flex align-items-center gap-3 mb-3">
                <img
                  src={getFullUrl(activePostDetail.author_avatar)}
                  alt="author avatar"
                  className="rounded-circle border"
                  style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                />
                <div className="flex-grow-1">
                  <div className="d-flex align-items-center gap-2">
                    <span className="fw-bold text-dark small">{activePostDetail.author_name}</span>
                    <span className="badge bg-light text-muted border text-capitalize" style={{ fontSize: '0.65rem' }}>
                      {activePostDetail.user_role}
                    </span>
                  </div>
                  <span className="text-muted" style={{ fontSize: '0.7rem' }}>
                    {activePostDetail.author_title || (['company', 'hr'].includes(activePostDetail.user_role?.toLowerCase()) ? 'Company' : 'Candidate')} • {formatDateTime(activePostDetail.created_at)}
                  </span>
                </div>
                {/* Edit & Delete Actions (If owned by current user) */}
                {activePostDetail.user_id === Number(localStorage.getItem('userId')) && (
                  <div className="d-flex gap-1.5 align-self-start">
                    <button
                      onClick={handleOpenEdit}
                      className="btn btn-link text-muted p-1 hover-primary border-0 bg-transparent"
                      title="Edit post"
                    >
                      <i className="far fa-edit" style={{ fontSize: '0.85rem' }}></i>
                    </button>
                    <button
                      onClick={handleModalDeletePost}
                      className="btn btn-link text-muted p-1 hover-danger border-0 bg-transparent"
                      title="Delete post"
                    >
                      <i className="far fa-trash-alt" style={{ fontSize: '0.85rem' }}></i>
                    </button>
                  </div>
                )}
              </div>

              {/* Post Text Content */}
              {activePostDetail.content && (
                <div 
                  className="post-content-text text-dark mb-3" 
                  style={{ fontSize: '0.92rem', lineHeight: '1.6' }}
                  dangerouslySetInnerHTML={{ __html: activePostDetail.content }}
                />
              )}

              {/* Post Media Display */}
              {activePostDetail.mediaList && activePostDetail.mediaList.length > 0 && (
                <div className="mb-3 rounded overflow-hidden border bg-black text-center" style={{ maxHeight: '320px' }}>
                  {activePostDetail.mediaList[0].media_type === 'image' ? (
                    <img
                      src={getFullUrl(activePostDetail.mediaList[0].media_url)}
                      alt="post attachment"
                      className="img-fluid"
                      style={{ maxHeight: '320px', objectFit: 'contain' }}
                    />
                  ) : (
                    <video
                      src={getFullUrl(activePostDetail.mediaList[0].media_url)}
                      className="w-100"
                      style={{ maxHeight: '320px', objectFit: 'contain' }}
                      controls
                    />
                  )}
                </div>
              )}

              {/* Action Buttons (Like, Comment, Share) */}
              <div className="d-flex align-items-center justify-content-between border-top border-bottom py-1.5 mb-3">
                <button
                  onClick={handleModalToggleLike}
                  className="btn btn-link text-decoration-none d-flex align-items-center gap-1.5 px-3 py-1 border-0 bg-transparent"
                  style={{ color: activePostDetail.is_liked ? '#01796F' : '#64748b', fontSize: '0.85rem', fontWeight: '600' }}
                >
                  <i className={activePostDetail.is_liked ? "fas fa-thumbs-up" : "far fa-thumbs-up"}></i>
                  <span>{activePostDetail.likes_count || 0} Likes</span>
                </button>

                <button
                  onClick={() => document.getElementById('modal-comment-input')?.focus()}
                  className="btn btn-link text-decoration-none text-secondary d-flex align-items-center gap-1.5 px-3 py-1 border-0 bg-transparent"
                  style={{ fontSize: '0.85rem', fontWeight: '600' }}
                >
                  <i className="far fa-comment"></i>
                  <span>{activePostDetail.comments_count || 0} Comments</span>
                </button>

                <button
                  onClick={() => setShowRepostModal(true)}
                  className="btn btn-link text-decoration-none text-secondary d-flex align-items-center gap-1.5 px-3 py-1 border-0 bg-transparent"
                  style={{ fontSize: '0.85rem', fontWeight: '600' }}
                >
                  <i className="far fa-share-square"></i>
                  <span>Share</span>
                </button>
              </div>

              {/* Discussions & Comment Form */}
              <div>
                <h6 className="fw-bold mb-3 small text-dark"><i className="far fa-comments me-1"></i> Discussions</h6>
                
                {/* Input Comment Form */}
                <form onSubmit={handleModalAddComment} className="d-flex gap-2 mb-3">
                  <input
                    id="modal-comment-input"
                    type="text"
                    className="form-control form-control-sm rounded-pill px-3"
                    placeholder="Add a comment..."
                    value={newCommentText}
                    onChange={(e) => setNewCommentText(e.target.value)}
                    disabled={submittingComment}
                    style={{ fontSize: '0.85rem' }}
                  />
                  <button
                    type="submit"
                    className="btn btn-sm text-white rounded-pill px-3 fw-semibold border-0"
                    disabled={submittingComment || !newCommentText.trim()}
                    style={{ fontSize: '0.8rem', backgroundColor: '#01796F' }}
                  >
                    {submittingComment ? 'Sending...' : 'Send'}
                  </button>
                </form>

                {loadingComments ? (
                  <div className="text-center py-3 text-muted small">Loading comments...</div>
                ) : postComments.length === 0 ? (
                  <p className="text-muted small mb-0 py-2">No comments on this post yet. Be the first to comment!</p>
                ) : (
                  <div className="d-flex flex-column gap-2.5">
                    {postComments.map((comment) => (
                      <div key={comment.id} className="d-flex gap-2 py-2.5 border-bottom">
                        <img 
                          src={getFullUrl(comment.author_avatar)} 
                          alt="comment avatar" 
                          className="rounded-circle border" 
                          style={{ width: '28px', height: '28px', objectFit: 'cover' }}
                        />
                        <div className="flex-grow-1">
                          <div className="d-flex justify-content-between align-items-center mb-1">
                            <span className="fw-bold text-dark" style={{ fontSize: '0.78rem' }}>{comment.author_name}</span>
                            <span className="text-muted" style={{ fontSize: '0.62rem' }}>
                              {new Date(comment.created_at).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="mb-0 text-dark" style={{ fontSize: '0.8rem', whiteSpace: 'pre-line' }}>{comment.content}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="d-flex justify-content-end p-3 border-top bg-light">
              <button
                type="button"
                onClick={() => setActivePostDetail(null)}
                className="btn btn-sm btn-secondary px-3.5"
                style={{ borderRadius: '8px' }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Share / Repost Modal inside Activity History */}
      {showRepostModal && activePostDetail && (
        <div
          className="modal-backdrop-custom"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.4)',
            zIndex: 100006,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
        >
          <div
            className="modal-content-custom"
            style={{
              backgroundColor: '#fff',
              borderRadius: '12px',
              width: '100%',
              maxWidth: '500px',
              boxShadow: '0 20px 25px -5px rgba(0,0,0,0.15)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden'
            }}
          >
            <div className="p-3 border-bottom d-flex align-items-center justify-content-between">
              <h6 className="fw-bold mb-0 text-dark">Repost to Feed</h6>
              <button type="button" onClick={() => setShowRepostModal(false)} className="btn-close" aria-label="Close"></button>
            </div>
            <div className="p-3">
              <textarea
                className="form-control mb-3"
                rows="3"
                placeholder="What's on your mind? (Optional comment for shared post...)"
                value={repostContent}
                onChange={(e) => setRepostContent(e.target.value)}
                style={{ fontSize: '0.9rem', borderRadius: '8px' }}
              />
              <div className="p-3 rounded border bg-light">
                <span className="fw-bold text-dark small d-block mb-1">{activePostDetail.author_name}</span>
                <p className="text-secondary small mb-0 text-truncate" style={{ maxHeight: '60px' }}>
                  {activePostDetail.content ? activePostDetail.content.replace(/<[^>]*>/g, '') : 'Post Attachment'}
                </p>
              </div>
            </div>
            <div className="p-3 bg-light border-top d-flex justify-content-end gap-2">
              <button type="button" onClick={() => setShowRepostModal(false)} className="btn btn-sm btn-light border px-3">Cancel</button>
              <button
                type="button"
                onClick={handleModalRepost}
                disabled={isReposting}
                className="btn btn-sm btn-primary px-3"
                style={{ backgroundColor: '#01796F', borderColor: '#01796F' }}
              >
                {isReposting ? 'Sharing...' : 'Share Now'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Post Modal inside Activity History */}
      {showEditModal && activePostDetail && (
        <div
          className="modal-backdrop-custom"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.4)',
            zIndex: 100006,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
        >
          <div
            className="modal-content-custom"
            style={{
              backgroundColor: '#fff',
              borderRadius: '12px',
              width: '100%',
              maxWidth: '520px',
              boxShadow: '0 20px 25px -5px rgba(0,0,0,0.15)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden'
            }}
          >
            <div className="p-3 border-bottom d-flex align-items-center justify-content-between">
              <h6 className="fw-bold mb-0 text-dark">Edit Post Content</h6>
              <button type="button" onClick={() => setShowEditModal(false)} className="btn-close" aria-label="Close"></button>
            </div>
            <div className="p-3">
              <div className="mb-3">
                <label className="form-label text-secondary small fw-semibold">Post Content</label>
                <textarea
                  className="form-control"
                  rows="5"
                  value={editPostContent}
                  onChange={(e) => setEditPostContent(e.target.value)}
                  placeholder="Update your post content..."
                  style={{ fontSize: '0.9rem', borderRadius: '8px' }}
                />
              </div>
              <div>
                <label className="form-label text-secondary small fw-semibold">Visibility</label>
                <select
                  value={editPostVisibility}
                  onChange={(e) => setEditPostVisibility(e.target.value)}
                  className="form-select form-select-sm"
                  style={{ borderRadius: '6px' }}
                >
                  <option value="public">🌐 Public</option>
                  <option value="private">🔒 Private</option>
                </select>
              </div>
            </div>
            <div className="p-3 bg-light border-top d-flex justify-content-end gap-2">
              <button type="button" onClick={() => setShowEditModal(false)} className="btn btn-sm btn-light border px-3">Cancel</button>
              <button
                type="button"
                onClick={handleSaveEdit}
                disabled={isSavingEdit || !editPostContent.trim()}
                className="btn btn-sm btn-primary px-3"
                style={{ backgroundColor: '#01796F', borderColor: '#01796F' }}
              >
                {isSavingEdit ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompanyActivityHistory;
