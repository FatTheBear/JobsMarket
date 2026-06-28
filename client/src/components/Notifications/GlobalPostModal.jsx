import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function GlobalPostModal() {
  const [postId, setPostId] = useState(null);
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [newCommentText, setNewCommentText] = useState('');
  const [loading, setLoading] = useState(false);
  const [submittingComment, setSubmittingComment] = useState(false);

  const getFullUrl = (path) => {
    if (!path) return '/img/default-avatar.png';
    if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('blob:') || path.startsWith('data:')) {
      return path;
    }
    return `http://localhost:5000${path.startsWith('/') ? path : '/' + path}`;
  };

  const formatDateTime = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const pad = (n) => (n < 10 ? '0' + n : n);
    return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
  };

  const fetchPostDetails = async (targetId) => {
    const token = localStorage.getItem('token');
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    try {
      setLoading(true);
      const res = await axios.get(`http://localhost:5000/api/posts/${targetId}`, { headers });
      setPost(res.data);

      const resComments = await axios.get(`http://localhost:5000/api/posts/${targetId}/comments`, { headers });
      setComments(resComments.data || []);
    } catch (err) {
      console.error('Error fetching global post details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handleOpenPostDetail = (e) => {
      const id = e.detail;
      if (id) {
        setPostId(id);
        fetchPostDetails(id);
      }
    };

    window.addEventListener('openPostDetail', handleOpenPostDetail);
    return () => window.removeEventListener('openPostDetail', handleOpenPostDetail);
  }, []);

  const handleToggleLike = async () => {
    if (!post) return;
    const token = localStorage.getItem('token');
    if (!token) return alert('Please login to like this post.');

    try {
      const res = await axios.post(`http://localhost:5000/api/posts/${post.id}/like`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPost(prev => ({
        ...prev,
        is_liked: res.data.is_liked,
        likes_count: res.data.likes_count
      }));
    } catch (err) {
      console.error('Error toggling like:', err);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newCommentText.trim() || !post) return;
    const token = localStorage.getItem('token');
    if (!token) return alert('Please login to comment.');

    try {
      setSubmittingComment(true);
      await axios.post(`http://localhost:5000/api/posts/${post.id}/comments`, {
        content: newCommentText.trim()
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setNewCommentText('');
      const resComments = await axios.get(`http://localhost:5000/api/posts/${post.id}/comments`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setComments(resComments.data || []);
      setPost(prev => ({ ...prev, comments_count: (prev.comments_count || 0) + 1 }));
    } catch (err) {
      console.error('Error adding comment:', err);
    } finally {
      setSubmittingComment(false);
    }
  };

  if (!postId) return null;

  return (
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
          borderRadius: '16px',
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
        <div className="d-flex align-items-center justify-content-between p-3.5 px-4 border-bottom bg-white">
          <h6 className="fw-bold mb-0 text-dark" style={{ fontSize: '1.05rem' }}>Post Details</h6>
          <button
            type="button"
            onClick={() => { setPostId(null); setPost(null); }}
            className="btn-close"
            style={{ cursor: 'pointer' }}
            aria-label="Close"
          ></button>
        </div>

        {/* Body */}
        <div className="p-4" style={{ overflowY: 'auto', flexGrow: 1 }}>
          {loading || !post ? (
            <div className="text-center py-5 text-muted">
              <div className="spinner-border text-primary me-2" role="status"></div>
              Loading post content...
            </div>
          ) : (
            <>
              {/* Author info */}
              <div className="d-flex align-items-center gap-3 mb-3">
                <img
                  src={getFullUrl(post.author_avatar)}
                  alt="author avatar"
                  className="rounded-circle border"
                  style={{ width: '42px', height: '42px', objectFit: 'cover' }}
                />
                <div className="flex-grow-1">
                  <div className="d-flex align-items-center gap-2">
                    <span className="fw-bold text-dark small">{post.author_name}</span>
                    <span className="badge bg-light text-muted border text-capitalize" style={{ fontSize: '0.65rem' }}>
                      {post.user_role}
                    </span>
                  </div>
                  <span className="text-muted" style={{ fontSize: '0.72rem' }}>
                    {post.author_title || (['company', 'hr'].includes(post.user_role?.toLowerCase()) ? 'Company' : 'Candidate')} • {formatDateTime(post.created_at)}
                  </span>
                </div>
              </div>

              {/* Text content */}
              {post.content && (
                <div 
                  className="post-content-text text-dark mb-3" 
                  style={{ fontSize: '0.94rem', lineHeight: '1.6' }}
                  dangerouslySetInnerHTML={{ __html: post.content }}
                />
              )}

              {/* Media Display */}
              {post.mediaList && post.mediaList.length > 0 && (
                <div className="mb-3 rounded overflow-hidden border bg-black text-center" style={{ maxHeight: '340px' }}>
                  {post.mediaList[0].media_type === 'image' ? (
                    <img
                      src={getFullUrl(post.mediaList[0].media_url)}
                      alt="post attachment"
                      className="img-fluid"
                      style={{ maxHeight: '340px', objectFit: 'contain' }}
                    />
                  ) : (
                    <video
                      src={getFullUrl(post.mediaList[0].media_url)}
                      className="w-100"
                      style={{ maxHeight: '340px', objectFit: 'contain' }}
                      controls
                    />
                  )}
                </div>
              )}

              {/* Interaction Bar */}
              <div className="d-flex align-items-center justify-content-between border-top border-bottom py-2 mb-3">
                <button
                  onClick={handleToggleLike}
                  className="btn btn-link text-decoration-none d-flex align-items-center gap-2 px-3 py-1 border-0 bg-transparent"
                  style={{ color: post.is_liked ? '#01796F' : '#64748b', fontSize: '0.88rem', fontWeight: '600' }}
                >
                  <i className={post.is_liked ? "fas fa-thumbs-up" : "far fa-thumbs-up"}></i>
                  <span>{post.likes_count || 0} Likes</span>
                </button>

                <button
                  className="btn btn-link text-decoration-none text-secondary d-flex align-items-center gap-2 px-3 py-1 border-0 bg-transparent"
                  style={{ fontSize: '0.88rem', fontWeight: '600' }}
                >
                  <i className="far fa-comment"></i>
                  <span>{comments.length} Comments</span>
                </button>
              </div>

              {/* Comments Section */}
              <div className="comments-list-section">
                <h6 className="fw-semibold text-dark mb-3" style={{ fontSize: '0.9rem' }}>Comments</h6>
                {comments.length === 0 ? (
                  <p className="text-muted small text-center py-2 mb-3">No comments yet. Be the first to comment!</p>
                ) : (
                  <div className="d-flex flex-column gap-3 mb-3">
                    {comments.map((comment) => (
                      <div key={comment.id} className="d-flex gap-2.5 align-items-start">
                        <img
                          src={getFullUrl(comment.author_avatar)}
                          alt="commenter"
                          className="rounded-circle border"
                          style={{ width: '32px', height: '32px', objectFit: 'cover' }}
                        />
                        <div className="flex-grow-1 p-2.5 px-3 rounded-3 bg-light border-0">
                          <div className="d-flex align-items-center justify-content-between mb-1">
                            <span className="fw-bold text-dark" style={{ fontSize: '0.82rem' }}>{comment.author_name}</span>
                            <span className="text-muted" style={{ fontSize: '0.68rem' }}>{formatDateTime(comment.created_at)}</span>
                          </div>
                          <p className="mb-0 text-secondary" style={{ fontSize: '0.85rem', lineHeight: '1.4' }}>{comment.content}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Comment Input Form */}
                <form onSubmit={handleAddComment} className="d-flex gap-2 align-items-center pt-2 border-top">
                  <input
                    type="text"
                    className="form-control form-control-sm rounded-pill px-3"
                    placeholder="Write a comment..."
                    value={newCommentText}
                    onChange={(e) => setNewCommentText(e.target.value)}
                    style={{ fontSize: '0.85rem' }}
                  />
                  <button
                    type="submit"
                    disabled={submittingComment || !newCommentText.trim()}
                    className="btn btn-sm text-white px-3 rounded-pill fw-semibold"
                    style={{ backgroundColor: '#01796F', border: 'none', fontSize: '0.82rem' }}
                  >
                    Send
                  </button>
                </form>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
