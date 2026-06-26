import React, { useState } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import axios from 'axios';

const CandidateActivityHistory = () => {
  const navigate = useNavigate();
  const {
    likedPosts,
    setLikedPosts,
    commentedPosts,
    setCommentedPosts,
    sharedPosts,
    setSharedPosts,
    fetchActivityHistory
  } = useOutletContext();

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

  const [activitySubTab, setActivitySubTab] = useState('likes'); // 'likes', 'comments', 'shares'
  const [activityMessage, setActivityMessage] = useState('');
  const [activityMessageType, setActivityMessageType] = useState('success');

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedYear, setSelectedYear] = useState('all'); // 'all', '2026', '2025', etc.
  const [selectedMonth, setSelectedMonth] = useState('all'); // 'all', '1', '2', etc.
  const [visibleCount, setVisibleCount] = useState(10);

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
      <div className="card border-0 shadow-sm animate-fade-in">
        <div className="card-header bg-white py-3 border-bottom d-flex flex-column flex-sm-row align-items-start align-items-sm-center justify-content-between gap-2">
          <h5 className="mb-0 fw-bold text-dark"><i className="fas fa-history me-2 text-primary"></i>Activity History</h5>
        </div>

          {/* Sub-tabs header */}
          <div className="d-flex border-bottom bg-light">
            <button
              type="button"
              className={`btn btn-link flex-fill py-3 text-decoration-none fw-semibold border-0 ${activitySubTab === 'likes' ? 'text-primary border-bottom border-primary border-3' : 'text-muted'}`}
              onClick={() => handleTabChange('likes')}
            >
              <i className="fas fa-thumbs-up me-1"></i> Liked Posts ({likedPosts.length})
            </button>
            <button
              type="button"
              className={`btn btn-link flex-fill py-3 text-decoration-none fw-semibold border-0 ${activitySubTab === 'comments' ? 'text-primary border-bottom border-primary border-3' : 'text-muted'}`}
              onClick={() => handleTabChange('comments')}
            >
              <i className="fas fa-comment-dots me-1"></i> Comments ({commentedPosts.length})
            </button>
            <button
              type="button"
              className={`btn btn-link flex-fill py-3 text-decoration-none fw-semibold border-0 ${activitySubTab === 'shares' ? 'text-primary border-bottom border-primary border-3' : 'text-muted'}`}
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
              
              <div className="col-12 col-md-7">
                <div className="d-flex flex-wrap align-items-center gap-2 justify-content-md-end">
                  <div className="d-flex align-items-center gap-2">
                    <label className="text-secondary small fw-semibold text-nowrap mb-0" style={{ fontSize: '0.8rem' }}><i className="far fa-calendar-alt text-primary me-1"></i> Year:</label>
                    <select
                      className="form-select rounded-pill px-3 py-1 small shadow-sm text-dark fw-medium border-light-subtle cursor-pointer"
                      style={{ cursor: 'pointer', fontSize: '0.8rem', width: '110px' }}
                      value={selectedYear}
                      onChange={(e) => {
                        setSelectedYear(e.target.value);
                        setSelectedMonth('all');
                        setVisibleCount(10);
                      }}
                    >
                      <option value="all">All time</option>
                      {getAvailableYears().map(y => (
                        <option key={y} value={y}>{y}</option>
                      ))}
                    </select>
                  </div>

                  {selectedYear !== 'all' && (
                    <div className="d-flex align-items-center gap-2 animate-fade-in">
                      <label className="text-secondary small fw-semibold text-nowrap mb-0" style={{ fontSize: '0.8rem' }}><i className="far fa-calendar text-primary me-1"></i> Month:</label>
                      <select
                        className="form-select rounded-pill px-3 py-1 small shadow-sm text-dark fw-medium border-light-subtle cursor-pointer"
                        style={{ cursor: 'pointer', fontSize: '0.8rem', width: '125px' }}
                        value={selectedMonth}
                        onChange={(e) => {
                          setSelectedMonth(e.target.value);
                          setVisibleCount(10);
                        }}
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
          </div>

          {/* Scrollable Card Body */}
          <div className="card-body px-4 pb-4 pt-3 scrollable-activity-history" style={{ height: 'calc(70vh - 111px)', overflowY: 'auto' }}>

            {/* Liked Posts Sub-tab */}
            {activitySubTab === 'likes' && (() => {
              const filtered = getFilteredItems(likedPosts, 'likes');
              return (
                <div className="liked-posts-list">
                  {filtered.length === 0 ? (
                    <div className="text-center py-5 text-muted">
                      <i className="far fa-thumbs-up fs-2 mb-2 text-muted opacity-40"></i>
                      <p className="mb-0">{searchTerm || selectedYear !== 'all' || selectedMonth !== 'all' ? "No activities match your filters." : "You have no liked posts yet."}</p>
                    </div>
                  ) : (
                    <div className="d-flex flex-column gap-2">
                      {filtered.slice(0, visibleCount).map((post) => (
                        <div 
                          key={post.id} 
                          className="p-3 rounded border bg-light d-flex flex-column gap-1.5 hover-shadow-sm transition-all position-relative cursor-pointer" 
                          style={{ padding: '0.85rem 1.25rem' }}
                          onClick={() => navigate(`/community?postId=${post.id}`)}
                        >
                          <div className="d-flex align-items-center gap-3">
                            <img src={post.avatar} alt="avatar" className="rounded-circle border" style={{ width: '36px', height: '36px' }} />
                            <div className="flex-grow-1" style={{ minWidth: 0 }}>
                              <div className="d-flex align-items-center gap-2 flex-wrap">
                                <h6 className="fw-bold mb-0 text-dark" style={{ fontSize: '0.88rem' }}>{post.author}</h6>
                                <span className="text-muted small" style={{ fontSize: '0.75rem' }}>• Liked {formatDateTime(post.liked_at)}</span>
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

            {/* Comments Sub-tab */}
            {activitySubTab === 'comments' && (() => {
              const filtered = getFilteredItems(commentedPosts, 'comments');
              return (
                <div className="commented-posts-list">
                  {filtered.length === 0 ? (
                    <div className="text-center py-5 text-muted">
                      <i className="far fa-comment-dots fs-2 mb-2 text-muted opacity-40"></i>
                      <p className="mb-0">{searchTerm || selectedYear !== 'all' || selectedMonth !== 'all' ? "No activities match your filters." : "You have no comment activity yet."}</p>
                    </div>
                  ) : (
                    <div className="d-flex flex-column gap-2">
                      {filtered.slice(0, visibleCount).map((post) => (
                        <div 
                          key={post.id} 
                          className="p-3 rounded border bg-light d-flex flex-column gap-1.5 hover-shadow-sm transition-all position-relative cursor-pointer" 
                          style={{ padding: '0.85rem 1.25rem' }}
                          onClick={() => navigate(`/community?postId=${post.post_id}`)}
                        >
                          <div className="d-flex align-items-center gap-3">
                            <img src={post.avatar} alt="avatar" className="rounded-circle border" style={{ width: '36px', height: '36px' }} />
                            <div className="flex-grow-1" style={{ minWidth: 0 }}>
                              <div className="d-flex align-items-center gap-2 flex-wrap">
                                <h6 className="fw-bold mb-0 text-dark" style={{ fontSize: '0.88rem' }}>{post.author}</h6>
                                <span className="text-muted small" style={{ fontSize: '0.75rem' }}>• Commented {formatDateTime(post.commented_at)}</span>
                              </div>
                              <div className="my-comment text-dark fw-semibold small mt-1" style={{ fontSize: '0.82rem' }}>
                                <i className="fas fa-comment text-primary me-1.5" style={{ fontSize: '0.75rem' }}></i>
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
              return (
                <div className="shared-posts-list">
                  {filtered.length === 0 ? (
                    <div className="text-center py-5 text-muted">
                      <i className="far fa-share-square fs-2 mb-2 text-muted opacity-40"></i>
                      <p className="mb-0">{searchTerm || selectedYear !== 'all' || selectedMonth !== 'all' ? "No activities match your filters." : "You have no share activity yet."}</p>
                    </div>
                  ) : (
                    <div className="d-flex flex-column gap-2">
                      {filtered.slice(0, visibleCount).map((post) => (
                        <div 
                          key={post.id} 
                          className="p-3 rounded border bg-light d-flex flex-column gap-1.5 hover-shadow-sm transition-all position-relative cursor-pointer" 
                          style={{ padding: '0.85rem 1.25rem' }}
                          onClick={() => navigate(`/community?postId=${post.id}`)}
                        >
                          <div className="d-flex align-items-center gap-3">
                            <img src={post.avatar} alt="avatar" className="rounded-circle border" style={{ width: '36px', height: '36px' }} />
                            <div className="flex-grow-1" style={{ minWidth: 0 }}>
                              <div className="d-flex align-items-center gap-2 flex-wrap">
                                <h6 className="fw-bold mb-0 text-dark" style={{ fontSize: '0.88rem' }}>{post.author}</h6>
                                <span className="text-muted small" style={{ fontSize: '0.75rem' }}>• Shared {formatDateTime(post.shared_at)}</span>
                              </div>
                              {post.message && (
                                <div className="shared-message text-dark fw-semibold small mt-1" style={{ fontSize: '0.82rem' }}>
                                  <i className="fas fa-quote-left text-primary me-1.5" style={{ fontSize: '0.7rem' }}></i>
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
    </div>
  );
};

export default CandidateActivityHistory;
