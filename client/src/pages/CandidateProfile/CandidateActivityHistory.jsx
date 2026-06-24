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
                      <div 
                        key={post.id} 
                        className="p-3 rounded border bg-light d-flex flex-column gap-2 hover-shadow-sm transition-all position-relative cursor-pointer" 
                        style={{ padding: '1.25rem' }}
                        onClick={() => navigate(`/community?postId=${post.id}`)}
                      >
                        <div className="d-flex align-items-center gap-3">
                          <img src={post.avatar} alt="avatar" className="rounded-circle border" style={{ width: '40px', height: '40px' }} />
                          <div className="flex-grow-1" style={{ minWidth: 0 }}>
                            <h6 className="fw-bold mb-0 text-dark" style={{ fontSize: '0.9rem' }}>{post.author}</h6>
                            <p className="mb-0 text-muted small" style={{ fontSize: '0.75rem' }}>Liked: {formatDateTime(post.liked_at)}</p>
                          </div>
                          <button
                            type="button"
                            className="btn btn-xs btn-outline-danger px-2.5 py-1 rounded-pill fw-semibold"
                            style={{ fontSize: '0.75rem' }}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleUnlikePost(post.id);
                            }}
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
                      <div 
                        key={post.id} 
                        className="p-3 rounded border bg-light d-flex flex-column gap-3 hover-shadow-sm transition-all position-relative cursor-pointer" 
                        style={{ padding: '1.25rem' }}
                        onClick={() => navigate(`/community?postId=${post.post_id}`)}
                      >
                        <div className="d-flex align-items-center gap-3">
                          <img src={post.avatar} alt="avatar" className="rounded-circle border" style={{ width: '40px', height: '40px' }} />
                          <div className="flex-grow-1" style={{ minWidth: 0 }}>
                            <h6 className="fw-bold mb-0 text-dark" style={{ fontSize: '0.9rem' }}>{post.author}</h6>
                            <p className="mb-0 text-muted small" style={{ fontSize: '0.75rem' }}>Commented: {formatDateTime(post.commented_at)}</p>
                          </div>
                          <button
                            type="button"
                            className="btn btn-xs btn-outline-danger px-2.5 py-1 rounded-pill fw-semibold"
                            style={{ fontSize: '0.75rem' }}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteCommentActivity(post.id);
                            }}
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
                      <div 
                        key={post.id} 
                        className="p-3 rounded border bg-light d-flex flex-column gap-3 hover-shadow-sm transition-all position-relative cursor-pointer" 
                        style={{ padding: '1.25rem' }}
                        onClick={() => navigate(`/community?postId=${post.id}`)}
                      >
                        <div className="d-flex align-items-center gap-3">
                          <img src={post.avatar} alt="avatar" className="rounded-circle border" style={{ width: '40px', height: '40px' }} />
                          <div className="flex-grow-1" style={{ minWidth: 0 }}>
                            <h6 className="fw-bold mb-0 text-dark" style={{ fontSize: '0.9rem' }}>{post.author}</h6>
                            <p className="mb-0 text-muted small" style={{ fontSize: '0.75rem' }}>Shared: {formatDateTime(post.shared_at)}</p>
                          </div>
                          <button
                            type="button"
                            className="btn btn-xs btn-outline-danger px-2.5 py-1 rounded-pill fw-semibold"
                            style={{ fontSize: '0.75rem' }}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveShareActivity(post.id);
                            }}
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
    </div>
  );
};

export default CandidateActivityHistory;
