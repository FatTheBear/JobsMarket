import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../CandidateProfile/Candidate_profile.css'; // Tái sử dụng CSS đồng bộ của profile

const API_URL = 'http://localhost:5000';

// Media grid component for posts
const MediaGrid = ({ mediaList }) => {
  if (!mediaList || mediaList.length === 0) return null;
  
  const count = mediaList.length;
  
  return (
    <div className="row g-2 mb-3">
      {mediaList.map((media, idx) => {
        const isImage = media.media_type === 'image';
        const mediaSrc = `${API_URL}${media.media_url}`;
        const colClass = count === 1 ? 'col-12' : 'col-6';
        
        return (
          <div key={idx} className={colClass}>
            <div 
              className="rounded overflow-hidden border bg-light position-relative" 
              style={{ height: count === 1 ? '350px' : '200px' }}
            >
              {isImage ? (
                <img 
                  src={mediaSrc} 
                  alt="post attachment" 
                  className="w-100 h-100" 
                  style={{ objectFit: 'cover', cursor: 'pointer' }}
                  onClick={() => window.open(mediaSrc, '_blank')}
                />
              ) : (
                <video 
                  src={mediaSrc} 
                  className="w-100 h-100" 
                  style={{ objectFit: 'cover' }}
                  controls
                />
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default function CompanyPublicProfile() {
  const { id } = useParams(); // company_id
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [followLoading, setFollowLoading] = useState(false);

  // States for community posts in public view
  const [posts, setPosts] = useState([]);
  const [postsLoading, setPostsLoading] = useState(true);
  const [postsError, setPostsError] = useState('');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // States for comments functionality
  const [commentsMap, setCommentsMap] = useState({});
  const [activeCommentsPostId, setActiveCommentsPostId] = useState(null);
  const [newCommentText, setNewCommentText] = useState({});
  const [submittingComment, setSubmittingComment] = useState({});

  const currentUserId = parseInt(localStorage.getItem('userId')) || null;
  const currentUserRole = localStorage.getItem('role') || '';

  // Fetch company public profile info
  const fetchCompanyPublic = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await axios.get(`${API_URL}/api/company/public/${id}`, { headers });
      
      if (res.data) {
        setData(res.data);
      }
      setLoading(false);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to load company profile.');
      setLoading(false);
    }
  };

  // Fetch all posts to filter later
  const fetchPosts = async () => {
    setPostsLoading(true);
    setPostsError('');
    try {
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const response = await axios.get(`${API_URL}/api/posts`, { headers });
      setPosts(response.data || []);
    } catch (err) {
      console.error("Failed to fetch community posts:", err);
      setPostsError('Failed to load community posts.');
    } finally {
      setPostsLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanyPublic();
  }, [id]);

  useEffect(() => {
    fetchPosts();
  }, [id, refreshTrigger]);

  const handleFollowToggle = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please log in to follow this company.');
      return;
    }

    try {
      setFollowLoading(true);
      const res = await axios.post(`${API_URL}/api/company/${id}/follow`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (res.data) {
        // Cập nhật state cục bộ
        setData(prev => {
          const isNowFollowed = res.data.followed;
          const diff = isNowFollowed ? 1 : -1;
          return {
            ...prev,
            isFollowed: isNowFollowed,
            company: {
              ...prev.company,
              followers_count: Math.max(0, (prev.company.followers_count || 0) + diff)
            }
          };
        });
      }
      setFollowLoading(false);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Error occurred while updating follow status.');
      setFollowLoading(false);
    }
  };

  const handleLike = async (postId) => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please log in to like this post!');
      return;
    }
    try {
      const response = await axios.post(`${API_URL}/api/posts/${postId}/like`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPosts(prev => prev.map(p => {
        if (p.id === postId) {
          return {
            ...p,
            is_liked: response.data.is_liked ? 1 : 0,
            likes_count: response.data.likes_count
          };
        }
        return p;
      }));
    } catch (err) {
      console.error('Failed to toggle like:', err);
    }
  };

  const fetchComments = async (postId) => {
    try {
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const response = await axios.get(`${API_URL}/api/posts/${postId}/comments`, { headers });
      setCommentsMap(prev => ({
        ...prev,
        [postId]: response.data || []
      }));
    } catch (err) {
      console.error('Failed to load comments:', err);
    }
  };

  const toggleComments = async (postId) => {
    if (activeCommentsPostId === postId) {
      setActiveCommentsPostId(null);
      return;
    }
    setActiveCommentsPostId(postId);
    if (!commentsMap[postId]) {
      await fetchComments(postId);
    }
  };

  const handleAddComment = async (postId, e) => {
    if (e) e.preventDefault();
    const commentText = newCommentText[postId] || '';
    if (!commentText.trim()) return;

    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please log in to comment.');
      return;
    }

    setSubmittingComment(prev => ({ ...prev, [postId]: true }));
    try {
      await axios.post(`${API_URL}/api/posts/${postId}/comments`, {
        content: commentText
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNewCommentText(prev => ({ ...prev, [postId]: '' }));
      await fetchComments(postId);
      setPosts(prev => prev.map(p => {
        if (p.id === postId) {
          return {
            ...p,
            comments_count: (p.comments_count || 0) + 1
          };
        }
        return p;
      }));
    } catch (err) {
      console.error("Failed to add comment:", err);
      alert("Failed to add comment. Please try again.");
    } finally {
      setSubmittingComment(prev => ({ ...prev, [postId]: false }));
    }
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/api/posts/${postId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRefreshTrigger(prev => prev + 1);
      if (activeCommentsPostId === postId) {
        setActiveCommentsPostId(null);
      }
    } catch (err) {
      console.error("Failed to delete post:", err);
      alert("Failed to delete post. Please try again.");
    }
  };

  const formatPostTime = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString('vi-VN');
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-5 text-center">
        <div className="alert alert-danger shadow-sm max-w-500 mx-auto" role="alert">
          <i className="fas fa-exclamation-circle me-2"></i> {error}
        </div>
        <button className="btn btn-primary mt-3 px-4" onClick={() => navigate(-1)}>
          Go Back
        </button>
      </div>
    );
  }

  const { company, isFollowed, jobs } = data;

  // Parse JSON fields safely
  const scale = company.scale ? (typeof company.scale === 'string' ? JSON.parse(company.scale) : company.scale) : {};
  const culture = company.culture ? (typeof company.culture === 'string' ? JSON.parse(company.culture) : company.culture) : {};

  // Filter posts to show only those created by this company
  const companyPosts = posts.filter(post => post.company_id === parseInt(id));

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
        </div>

        <div className="row g-4">
          {/* Left Column - Overview */}
          <div className="col-12 col-lg-4">
            <div className="card border-0 shadow-sm p-4 text-center" style={{ borderRadius: '12px', background: '#fff' }}>
              <img
                src={company.logo_url || '/img/default-avatar.png'}
                alt="company logo"
                className="rounded-3 border mx-auto mb-3"
                style={{ width: '120px', height: '120px', objectFit: 'cover' }}
              />
              <h4 className="fw-bold text-dark mb-1">{company.name}</h4>
              <p className="text-primary small fw-semibold mb-3">{company.industry_name || 'Technology'}</p>
              
              <div className="d-flex justify-content-center gap-4 border-top py-2.5 my-3 text-muted small">
                <div>
                  <span className="d-block fw-bold text-dark fs-5">{jobs ? jobs.length : 0}</span>
                  Jobs Open
                </div>
              </div>
            </div>

            {/* About Company Card */}
            <div className="card border-0 shadow-sm p-4 mt-4" style={{ borderRadius: '12px', background: '#fff' }}>
              <h5 className="fw-bold text-dark mb-3"><i className="far fa-building text-primary me-2"></i>About Company</h5>
              <div className="d-flex flex-column gap-3 text-muted small">
                {company.about && <p className="mb-0" style={{ lineHeight: '1.6', whiteSpace: 'pre-line' }}>{company.about}</p>}
                <div className="border-top pt-3 d-flex flex-column gap-2">
                  {company.website && (
                    <div>
                      <strong className="text-secondary d-block">Website</strong>
                      <a href={company.website} target="_blank" rel="noopener noreferrer" className="text-primary text-decoration-none">{company.website}</a>
                    </div>
                  )}
                  {company.address && (
                    <div>
                      <strong className="text-secondary d-block">Headquarters</strong>
                      <span>{company.address}</span>
                    </div>
                  )}
                  {scale.size && (
                    <div>
                      <strong className="text-secondary d-block">Company Size</strong>
                      <span>{scale.size} employees</span>
                    </div>
                  )}
                  {company.hr_email && (
                    <div>
                      <strong className="text-secondary d-block">Contact Email</strong>
                      <span>{company.hr_email}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Culture & Jobs & Posts */}
          <div className="col-12 col-lg-8">
            {/* Company Culture */}
            <div className="card border-0 shadow-sm p-4 mb-4" style={{ borderRadius: '12px', background: '#fff' }}>
              <div className="column-card-section-title mb-4" style={{ marginTop: 0 }}>Company Culture & Work Environment</div>
              <div className="row g-3">
                <div className="col-12 col-sm-6">
                  <div className="p-3 rounded border bg-light">
                    <span className="text-muted small d-block mb-1">Key Value</span>
                    <span className="fw-bold text-dark small">{culture.key_value || 'None specified'}</span>
                  </div>
                </div>
                <div className="col-12 col-sm-6">
                  <div className="p-3 rounded border bg-light">
                    <span className="text-muted small d-block mb-1">Working Hours</span>
                    <span className="fw-bold text-dark small">{culture.working_hours || 'Flexible / Standard'}</span>
                  </div>
                </div>
                <div className="col-12 col-sm-6">
                  <div className="p-3 rounded border bg-light">
                    <span className="text-muted small d-block mb-1">Overtime Policy</span>
                    <span className="fw-bold text-dark small">{culture.overtime_policy || 'No overtime / Standard'}</span>
                  </div>
                </div>
                <div className="col-12 col-sm-6">
                  <div className="p-3 rounded border bg-light">
                    <span className="text-muted small d-block mb-1">Dress Code</span>
                    <span className="fw-bold text-dark small">{culture.dress_code || 'Casual / Smart Casual'}</span>
                  </div>
                </div>
                {culture.other_info && (
                  <div className="col-12">
                    <div className="p-3 rounded border bg-light">
                      <span className="text-muted small d-block mb-1">Additional Culture Info</span>
                      <span className="text-secondary small" style={{ whiteSpace: 'pre-line' }}>{culture.other_info}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Active Job Openings */}
              <div className="column-card-section-title mt-4">Active Job Openings</div>
              <div className="d-flex flex-column gap-3 mt-3">
                {jobs && jobs.length > 0 ? (
                  jobs.map(job => (
                    <div 
                      key={job.id} 
                      className="p-3 rounded-3 border hover-shadow transition d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center gap-3"
                      style={{ background: '#fff' }}
                    >
                      <div>
                        <h5 className="m-0 fw-bold text-dark" style={{ fontSize: '1.1rem' }}>{job.title}</h5>
                        <div className="d-flex align-items-center flex-wrap gap-2.5 mt-2 text-muted small" style={{ fontSize: '0.85rem' }}>
                          <span className="fw-semibold text-secondary">
                            <i className="fas fa-coins me-1 text-warning"></i>
                            {job.salary_min && job.salary_max 
                              ? `${(job.salary_min / 1000000).toFixed(0)} - ${(job.salary_max / 1000000).toFixed(0)}M VND` 
                              : 'Negotiable'}
                          </span>
                          <span>•</span>
                          <span><i className="fas fa-map-marker-alt me-1"></i>{job.province || 'Remote'}</span>
                          <span>•</span>
                          <span className="badge bg-secondary-subtle text-secondary">{job.job_type}</span>
                        </div>
                      </div>
                      <button 
                        type="button" 
                        onClick={() => navigate(`/jobs/${job.id}`)}
                        className="btn btn-outline-primary btn-sm rounded-pill px-3 fw-semibold"
                        style={{ color: '#01796F', borderColor: '#01796F' }}
                      >
                        View Details
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4 text-muted small">
                    <i className="far fa-folder-open d-block fs-3 mb-2"></i>
                    No active job openings found for this company.
                  </div>
                )}
              </div>

              {/* Community Posts */}
              <div className="column-card-section-title mt-5">Community Posts</div>
              <div className="d-flex flex-column gap-4 mt-3">
                {postsLoading && companyPosts.length === 0 ? (
                  <div className="text-center py-4">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading posts...</span>
                    </div>
                  </div>
                ) : postsError ? (
                  <div className="text-center py-4 text-muted small">{postsError}</div>
                ) : companyPosts.length === 0 ? (
                  <div className="text-center py-4 text-muted small bg-light rounded border">
                    <i className="far fa-paper-plane d-block fs-3 mb-2 opacity-50"></i>
                    No community posts found for this company.
                  </div>
                ) : (
                  companyPosts.map((post) => {
                    const isAuthor = post.user_id === currentUserId;
                    const isAdmin = currentUserRole === 'Admin';
                    return (
                      <div key={post.id} className="p-3 rounded-3 border" style={{ background: '#fff' }}>
                        <div className="d-flex align-items-center gap-3 mb-3">
                          <img
                            src={post.author_avatar || '/default-avatar.png'}
                            alt="author avatar"
                            className="rounded-circle shadow-sm border"
                            style={{ width: '48px', height: '48px', objectFit: 'cover' }}
                          />
                          <div>
                            <div className="d-flex align-items-center gap-2 flex-wrap">
                              <h6 className="fw-bold mb-0 text-dark" style={{ fontSize: '0.95rem' }}>{post.author_name}</h6>
                              <span 
                                className="px-2 py-0.5 rounded-pill fw-semibold" 
                                style={{ 
                                  fontSize: '0.7rem',
                                  backgroundColor: '#e8f5e9',
                                  color: '#2e7d32'
                                }}
                              >
                                Employer
                              </span>
                            </div>
                            <p className="mb-0 text-muted small fw-medium">
                              {post.author_title || 'Company'} • {formatPostTime(post.created_at)} <i className="fas fa-globe-asia ms-1"></i>
                            </p>
                          </div>

                          {/* Delete post button */}
                          {(isAuthor || isAdmin) && (
                            <button
                              onClick={() => handleDeletePost(post.id)}
                              className="btn btn-link text-muted p-1 hover-danger border-0 bg-transparent ms-auto align-self-start"
                              title="Delete post"
                            >
                              <i className="far fa-trash-alt" style={{ fontSize: '0.85rem' }}></i>
                            </button>
                          )}
                        </div>

                        {/* Post content */}
                        {post.content && (
                          <div 
                            className="post-content-text text-dark mb-3" 
                            style={{ fontSize: '0.92rem', lineHeight: '1.6', whiteSpace: 'pre-line' }}
                          >
                            {post.content}
                          </div>
                        )}

                        {/* Media attachments */}
                        <MediaGrid mediaList={post.mediaList} />

                        {/* Post Footer/Activity statistics - Fully interactive */}
                        <div className="d-flex align-items-center justify-content-between border-top pt-3 text-muted small">
                          <div className="d-flex align-items-center gap-4">
                            <button
                              type="button"
                              onClick={() => handleLike(post.id)}
                              className="btn btn-link text-decoration-none d-inline-flex align-items-center gap-1.5 p-0 border-0 bg-transparent transition-all"
                              style={{ fontSize: '0.85rem', color: post.is_liked ? '#01796F' : '#6c757d' }}
                            >
                              <i className={`${post.is_liked ? 'fas' : 'far'} fa-thumbs-up fs-6`} style={{ color: post.is_liked ? '#01796F' : undefined }}></i>
                              <span className="fw-semibold">{post.likes_count || 0} Likes</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => toggleComments(post.id)}
                              className="btn btn-link text-decoration-none d-inline-flex align-items-center gap-1.5 p-0 border-0 bg-transparent transition-all"
                              style={{ fontSize: '0.85rem', color: activeCommentsPostId === post.id ? '#01796F' : '#6c757d' }}
                            >
                              <i className="far fa-comment-dots fs-6" style={{ color: activeCommentsPostId === post.id ? '#01796F' : undefined }}></i>
                              <span className="fw-semibold">{post.comments_count || 0} Comments</span>
                            </button>
                          </div>
                          <span className="d-inline-flex align-items-center gap-1.5 text-muted small">
                            <i className="far fa-share-square fs-6"></i>
                            <span className="fw-semibold">{post.reposts_count || 0} Shares</span>
                          </span>
                        </div>

                        {/* Interactive Comments Drawer */}
                        {activeCommentsPostId === post.id && (
                          <div className="border-top mt-3 pt-3">
                            <div className="d-flex flex-column gap-2 mb-3" style={{ maxHeight: '250px', overflowY: 'auto' }}>
                              {(commentsMap[post.id] || []).length === 0 ? (
                                <p className="text-muted small mb-0 py-2">No comments yet.</p>
                              ) : (
                                (commentsMap[post.id] || []).map((comment) => (
                                  <div key={comment.id} className="d-flex gap-2 p-2 rounded bg-white border">
                                    <img 
                                      src={comment.author_avatar || '/default-avatar.png'} 
                                      alt="avatar" 
                                      className="rounded-circle border" 
                                      style={{ width: '32px', height: '32px', objectFit: 'cover' }}
                                    />
                                    <div className="flex-grow-1">
                                      <div className="d-flex justify-content-between align-items-center mb-1">
                                        <span className="fw-bold text-dark" style={{ fontSize: '0.8rem' }}>{comment.author_name}</span>
                                        <span className="text-muted" style={{ fontSize: '0.65rem' }}>{formatPostTime(comment.created_at)}</span>
                                      </div>
                                      <p className="mb-0 text-dark" style={{ fontSize: '0.82rem', whiteSpace: 'pre-line' }}>{comment.content}</p>
                                    </div>
                                  </div>
                                ))
                              )}
                            </div>
                            
                            <form onSubmit={(e) => handleAddComment(post.id, e)} className="d-flex gap-2">
                              <input 
                                type="text" 
                                className="form-control form-control-sm rounded-pill px-3"
                                placeholder="Write a comment..."
                                value={newCommentText[post.id] || ''}
                                onChange={(e) => setNewCommentText(prev => ({ ...prev, [post.id]: e.target.value }))}
                                disabled={submittingComment[post.id]}
                                style={{ fontSize: '0.85rem' }}
                              />
                              <button 
                                type="submit" 
                                className="btn btn-sm text-white rounded-pill px-3 fw-semibold border-0"
                                disabled={submittingComment[post.id] || !(newCommentText[post.id] || '').trim()}
                                style={{ fontSize: '0.8rem', backgroundColor: '#01796F' }}
                              >
                                {submittingComment[post.id] ? 'Posting...' : 'Post'}
                              </button>
                            </form>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>

            </div>

          </div>

        </div>
      </div>
    </section>
  );
}
