import React, { useState } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useWallet } from '../../context/WalletContext';
import RechargeCoins from './RechargeCoins';

const CandidateActivityHistory = () => {
  const navigate = useNavigate();
  const {
    favoriteJobs,
    setFavoriteJobs,
    likedPosts,
    setLikedPosts,
    commentedPosts,
    setCommentedPosts,
    sharedPosts,
    setSharedPosts,
    fetchActivityHistory
  } = useOutletContext();

  const { coins, transactions } = useWallet();

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

  const [activeTab, setActiveTab] = useState('wallet'); // 'wallet' or 'activity'
  const [activeWalletTab, setActiveWalletTab] = useState('history'); // 'history' or 'topup'
  const [activitySubTab, setActivitySubTab] = useState('jobs'); // 'jobs', 'likes', 'comments', 'shares'
  const [activityMessage, setActivityMessage] = useState('');
  const [activityMessageType, setActivityMessageType] = useState('success');

  const handleUnsaveJob = (jobId) => {
    const confirmUnsave = window.confirm("Are you sure you want to unsave this job?");
    if (confirmUnsave) {
      const updated = favoriteJobs.filter(job => job.id !== jobId);
      setFavoriteJobs(updated);
      localStorage.setItem('activity_fav_jobs', JSON.stringify(updated));
      setActivityMessageType('success');
      setActivityMessage("Job removed from saved list successfully!");
      setTimeout(() => setActivityMessage(''), 3000);
    }
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
      {/* Tab Selector for Wallet vs Activity */}
      <div className="card border-0 shadow-sm">
        <div className="d-flex border-bottom bg-white rounded-top">
          <button
            type="button"
            className={`btn btn-link flex-fill py-3 text-decoration-none fw-bold border-0 ${activeTab === 'wallet' ? 'text-primary border-bottom border-primary border-3' : 'text-muted'}`}
            onClick={() => setActiveTab('wallet')}
          >
            <i className="fas fa-wallet me-2"></i>My Wallet
          </button>
          <button
            type="button"
            className={`btn btn-link flex-fill py-3 text-decoration-none fw-bold border-0 ${activeTab === 'activity' ? 'text-primary border-bottom border-primary border-3' : 'text-muted'}`}
            onClick={() => setActiveTab('activity')}
          >
            <i className="fas fa-history me-2"></i>Activity History
          </button>
        </div>
      </div>

      {/* WALLET VIEW */}
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

      {/* ACTIVITY HISTORY VIEW */}
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
      )}
    </div>
  );
};

export default CandidateActivityHistory;
