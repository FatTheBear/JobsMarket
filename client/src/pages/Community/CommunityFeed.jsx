import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import PostCreator from '../../components/Community/PostCreator';
import './CommunityFeed.css';

const MediaGrid = ({ mediaList, onMediaClick }) => {
  if (!mediaList || mediaList.length === 0) return null;

  const count = mediaList.length;

  const renderMediaItem = (item, idx, customStyle = {}) => {
    const isImage = item.media_type === 'image';
    const mediaSrc = `http://localhost:5000${item.media_url}`;

    if (isImage) {
      return (
        <img
          key={idx}
          src={mediaSrc}
          alt={`media-${idx}`}
          className="w-100 h-100"
          style={{ objectFit: 'cover', cursor: 'pointer', ...customStyle }}
          onClick={() => onMediaClick ? onMediaClick(idx) : window.open(mediaSrc, '_blank')}
        />
      );
    } else {
      return (
        <div 
          key={idx}
          className="position-relative w-100 h-100 bg-black" 
          style={{ cursor: 'pointer', ...customStyle }}
          onClick={() => onMediaClick ? onMediaClick(idx) : null}
        >
          <video
            src={mediaSrc}
            className="w-100 h-100"
            style={{ objectFit: 'cover' }}
            muted
            playsInline
          />
          <div className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center bg-black bg-opacity-25 hover-bg-opacity-40 transition">
            <i className="fas fa-play-circle text-white fs-1 opacity-90"></i>
          </div>
        </div>
      );
    }
  };

  if (count === 1) {
    const item = mediaList[0];
    const isImage = item.media_type === 'image';
    const mediaSrc = `http://localhost:5000${item.media_url}`;
    return (
      <div className="post-media-wrap single-media rounded overflow-hidden bg-black mb-3 border text-center" style={{ maxHeight: '380px', cursor: 'pointer' }} onClick={() => onMediaClick ? onMediaClick(0) : null}>
        {isImage ? (
          <img
            src={mediaSrc}
            alt="attached media"
            className="img-fluid"
            style={{ maxHeight: '380px', objectFit: 'contain' }}
          />
        ) : (
          <video
            src={mediaSrc}
            className="w-100"
            style={{ maxHeight: '380px', objectFit: 'contain' }}
            muted
            playsInline
          />
        )}
      </div>
    );
  }

  if (count === 2) {
    return (
      <div className="post-media-grid grid-2 rounded overflow-hidden mb-3 border bg-black" style={{ height: '240px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px' }}>
        <div style={{ minHeight: 0, overflow: 'hidden', height: '100%' }}>{renderMediaItem(mediaList[0], 0)}</div>
        <div style={{ minHeight: 0, overflow: 'hidden', height: '100%' }}>{renderMediaItem(mediaList[1], 1)}</div>
      </div>
    );
  }

  if (count === 3) {
    return (
      <div className="post-media-grid grid-3 rounded overflow-hidden mb-3 border bg-black" style={{ height: '300px', display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '4px' }}>
        <div style={{ height: '100%', minHeight: 0, overflow: 'hidden' }}>
          {renderMediaItem(mediaList[0], 0)}
        </div>
        <div style={{ display: 'grid', gridTemplateRows: '1fr 1fr', gap: '4px', height: '100%', minHeight: 0 }}>
          <div style={{ height: '100%', minHeight: 0, overflow: 'hidden' }}>
            {renderMediaItem(mediaList[1], 1)}
          </div>
          <div style={{ height: '100%', minHeight: 0, overflow: 'hidden' }}>
            {renderMediaItem(mediaList[2], 2)}
          </div>
        </div>
      </div>
    );
  }

  const remaining = count - 4;
  return (
    <div className="post-media-grid grid-4 rounded overflow-hidden mb-3 border bg-black" style={{ height: '300px', display: 'grid', gridTemplateColumns: '1fr 1fr', gridTemplateRows: '1fr 1fr', gap: '4px' }}>
      <div style={{ minHeight: 0, overflow: 'hidden', height: '100%' }}>{renderMediaItem(mediaList[0], 0)}</div>
      <div style={{ minHeight: 0, overflow: 'hidden', height: '100%' }}>{renderMediaItem(mediaList[1], 1)}</div>
      <div style={{ minHeight: 0, overflow: 'hidden', height: '100%' }}>{renderMediaItem(mediaList[2], 2)}</div>
      <div className="position-relative w-100 h-100" style={{ minHeight: 0, overflow: 'hidden', height: '100%' }}>
        {renderMediaItem(mediaList[3], 3)}
        {remaining > 0 && (
          <div 
            className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center text-white fw-bold fs-4"
            style={{ backgroundColor: 'rgba(0,0,0,0.6)', cursor: 'pointer' }}
            onClick={() => onMediaClick ? onMediaClick(3) : null}
          >
            +{remaining}
          </div>
        )}
      </div>
    </div>
  );
};

const getRoleBadgeClass = (role) => {
  const r = role?.toLowerCase();
  if (r === 'candidate') return 'candidate';
  if (r === 'company' || r === 'hr' || r === 'employer') return 'company';
  return 'system';
};

export default function CommunityFeed() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // State variables for comments
  const [commentsMap, setCommentsMap] = useState({}); // { postId: [comments] }
  const [activeCommentsPostId, setActiveCommentsPostId] = useState(null); // which post is showing comments
  const [newCommentText, setNewCommentText] = useState({}); // { postId: 'text' }
  const [submittingComment, setSubmittingComment] = useState({});
  const [activeReplyFormCommentId, setActiveReplyFormCommentId] = useState(null);
  const [newReplyText, setNewReplyText] = useState({});
  const [submittingReply, setSubmittingReply] = useState({});

  // State variables for Repost Modal
  const [repostTargetPost, setRepostTargetPost] = useState(null);
  const [repostContent, setRepostContent] = useState('');
  const [isSubmittingRepost, setIsSubmittingRepost] = useState(false);

  // State variables for Lightbox Modal
  const [lightboxMedia, setLightboxMedia] = useState(null);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!lightboxMedia) return;
      if (e.key === 'Escape') setLightboxMedia(null);
      if (e.key === 'ArrowRight' && lightboxMedia.length > 1) {
        setLightboxIndex(prev => (prev === lightboxMedia.length - 1 ? 0 : prev + 1));
      }
      if (e.key === 'ArrowLeft' && lightboxMedia.length > 1) {
        setLightboxIndex(prev => (prev === 0 ? lightboxMedia.length - 1 : prev - 1));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxMedia]);

  const isLoggedIn = !!localStorage.getItem('token');
  const currentUserId = parseInt(localStorage.getItem('userId')) || null;
  const currentUserRole = localStorage.getItem('role') || '';

  const fetchPosts = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      
      const response = await axios.get('http://localhost:5000/api/posts', { headers });
      setPosts(response.data);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch community posts. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handlePostCreated = (newPost) => {
    // Add the newly created post to the top of the feed
    setPosts((prev) => [newPost, ...prev]);
  };

  const handleLike = async (postId) => {
    if (!isLoggedIn) {
      alert('Please log in to like this post!');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`http://localhost:5000/api/posts/${postId}/like`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Update post state
      setPosts(prev => prev.map(post => {
        if (post.id === postId) {
          return {
            ...post,
            is_liked: response.data.is_liked ? 1 : 0,
            likes_count: response.data.likes_count
          };
        }
        return post;
      }));
    } catch (err) {
      console.error(err);
    }
  };

  const toggleComments = async (postId) => {
    if (activeCommentsPostId === postId) {
      setActiveCommentsPostId(null);
      return;
    }

    setActiveCommentsPostId(postId);

    // Fetch comments if not loaded yet
    if (!commentsMap[postId]) {
      try {
        const token = localStorage.getItem('token');
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const response = await axios.get(`http://localhost:5000/api/posts/${postId}/comments`, { headers });
        setCommentsMap(prev => ({
          ...prev,
          [postId]: response.data
        }));
      } catch (err) {
        console.error('Failed to load comments:', err);
      }
    }
  };

  const handleCommentLike = async (postId, commentId) => {
    if (!isLoggedIn) {
      alert('Please log in to like this comment!');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`http://localhost:5000/api/posts/comments/${commentId}/like`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setCommentsMap(prev => ({
        ...prev,
        [postId]: prev[postId].map(comment => {
          if (comment.id === commentId) {
            return {
              ...comment,
              is_liked: response.data.is_liked ? 1 : 0,
              likes_count: response.data.likes_count
            };
          }
          return comment;
        })
      }));
    } catch (err) {
      console.error('Failed to like comment:', err);
    }
  };

  const handleCommentSubmit = async (e, postId) => {
    e.preventDefault();
    const commentText = newCommentText[postId];
    if (!commentText || !commentText.trim()) return;

    if (!isLoggedIn) {
      alert('Please log in to leave a comment!');
      return;
    }

    setSubmittingComment(prev => ({ ...prev, [postId]: true }));

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`http://localhost:5000/api/posts/${postId}/comments`, {
        content: commentText.trim()
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Clear input
      setNewCommentText(prev => ({ ...prev, [postId]: '' }));

      // Append new comment to mapping
      setCommentsMap(prev => ({
        ...prev,
        [postId]: [...(prev[postId] || []), response.data.comment]
      }));

      // Increment comments count on post
      setPosts(prev => prev.map(post => {
        if (post.id === postId) {
          return {
            ...post,
            comments_count: (post.comments_count || 0) + 1
          };
        }
        return post;
      }));
    } catch (err) {
      console.error('Failed to post comment:', err);
    } finally {
      setSubmittingComment(prev => ({ ...prev, [postId]: false }));
    }
  };

  const handleReplySubmit = async (e, postId, parentCommentId) => {
    e.preventDefault();
    const replyText = newReplyText[parentCommentId];
    if (!replyText || !replyText.trim()) return;

    if (!isLoggedIn) {
      alert('Please log in to leave a reply!');
      return;
    }

    setSubmittingReply(prev => ({ ...prev, [parentCommentId]: true }));

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`http://localhost:5000/api/posts/${postId}/comments`, {
        content: replyText.trim(),
        parent_comment_id: parentCommentId
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Clear input and close reply form
      setNewReplyText(prev => ({ ...prev, [parentCommentId]: '' }));
      setActiveReplyFormCommentId(null);

      // Append new reply to mapping
      setCommentsMap(prev => ({
        ...prev,
        [postId]: [...(prev[postId] || []), response.data.comment]
      }));

      // Increment comments count on post
      setPosts(prev => prev.map(post => {
        if (post.id === postId) {
          return {
            ...post,
            comments_count: (post.comments_count || 0) + 1
          };
        }
        return post;
      }));
    } catch (err) {
      console.error('Failed to post reply:', err);
    } finally {
      setSubmittingReply(prev => ({ ...prev, [parentCommentId]: false }));
    }
  };

  const handleRepostClick = (post) => {
    if (!isLoggedIn) {
      alert('Please log in to share this post!');
      return;
    }
    setRepostTargetPost(post);
    setRepostContent('');
  };

  const handleRepostSubmit = async (e) => {
    e.preventDefault();
    if (!repostTargetPost) return;

    setIsSubmittingRepost(true);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`http://localhost:5000/api/posts/${repostTargetPost.id}/repost`, {
        content: repostContent
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Insert new repost at the top of the feed
      setPosts(prev => [response.data.post, ...prev]);

      // Increment repost count on the original post in feed list
      setPosts(prev => prev.map(post => {
        if (post.id === repostTargetPost.id || post.id === repostTargetPost.parent_post_id) {
          return {
            ...post,
            reposts_count: (post.reposts_count || 0) + 1
          };
        }
        return post;
      }));

      setRepostTargetPost(null);
    } catch (err) {
      console.error(err);
      alert('Failed to share post. Please try again.');
    } finally {
      setIsSubmittingRepost(false);
    }
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/posts/${postId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Remove from feed
      setPosts(prev => prev.filter(post => post.id !== postId));
    } catch (err) {
      console.error('Failed to delete post:', err);
      alert(err.response?.data?.message || 'Failed to delete post.');
    }
  };

  const formatPostTime = (timeStr) => {
    if (!timeStr) return '';
    const date = new Date(timeStr);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString();
  };

  return (
    <div className="community-feed-layout container py-5" style={{ maxWidth: '650px', margin: '0 auto' }}>
      <div className="row justify-content-center">
        <div className="col-12">
          
          {/* Feed Header */}
          <div className="community-header mb-4 text-center text-lg-start">
            <h2 className="fw-bold text-dark"><i className="fas fa-users text-primary me-2"></i>Community Hub</h2>
            <p className="text-muted">Stay connected, share thoughts, and explore updates from candidates and employers.</p>
          </div>

          {/* Create Post Section (For logged in users) */}
          {isLoggedIn ? (
            <PostCreator onPostCreated={handlePostCreated} placeholder="Share job tips, career news or updates with the community..." />
          ) : (
            <div className="card border-0 shadow-sm mb-4 text-center py-4 px-3" style={{ borderRadius: '12px', background: 'linear-gradient(135deg, #f8fffe 0%, #edf7f6 100%)' }}>
              <h5 className="fw-bold text-dark mb-2">Join the Community</h5>
              <p className="text-muted small mb-3">Sign in to share updates, comment on posts, and interact with other professionals.</p>
              <a href="/login" className="btn btn-primary btn-sm px-4 py-2 fw-bold" style={{ backgroundColor: '#01796F', borderColor: '#01796F', alignSelf: 'center', borderRadius: '8px' }}>Log In to Post</a>
            </div>
          )}

          {/* Posts Feed */}
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading Feed...</span>
              </div>
              <p className="text-muted mt-2">Loading community posts...</p>
            </div>
          ) : error ? (
            <div className="alert alert-danger text-center p-4 border-0 shadow-sm" role="alert">
              <i className="fas fa-exclamation-circle fs-3 mb-2 text-danger"></i>
              <p className="mb-0">{error}</p>
            </div>
          ) : posts.length === 0 ? (
            <div className="card border-0 shadow-sm text-center py-5 text-muted" style={{ borderRadius: '12px' }}>
              <i className="fas fa-users fs-2 mb-3 text-muted opacity-40"></i>
              <h5 className="fw-semibold">No posts yet</h5>
              <p className="small mb-0">Be the first to share an update with the community!</p>
            </div>
          ) : (
            <div className="d-flex flex-column gap-4">
              {posts.map((post) => {
                const isAuthor = post.user_id === currentUserId;
                const isAdmin = currentUserRole === 'Admin';
                const hasMedia = !!post.media_url;

                return (
                  <div key={post.id} className="card border-0 shadow-sm post-card" style={{ borderRadius: '12px' }}>
                    <div className="card-body p-4">
                      
                      {/* Post Header */}
                      <div className="d-flex justify-content-between align-items-start mb-3">
                        <div className="d-flex align-items-center gap-3">
                          <img
                            src={post.author_avatar || '/default-avatar.png'}
                            alt="avatar"
                            className="rounded-circle border cursor-pointer"
                            style={{ width: '48px', height: '48px', objectFit: 'cover' }}
                            onClick={() => {
                              if (post.user_role?.toLowerCase() === 'candidate') {
                                navigate(`/candidate/${post.user_id}`);
                              } else if (post.company_id) {
                                navigate(`/company/${post.company_id}`);
                              }
                            }}
                          />
                          <div>
                            <div className="d-flex align-items-center gap-2 flex-wrap">
                              <h6 
                                className="fw-bold mb-0 text-dark cursor-pointer hover-text-primary" 
                                style={{ fontSize: '0.95rem' }}
                                onClick={() => {
                                  if (post.user_role?.toLowerCase() === 'candidate') {
                                    navigate(`/candidate/${post.user_id}`);
                                  } else if (post.company_id) {
                                    navigate(`/company/${post.company_id}`);
                                  }
                                }}
                              >
                                {post.author_name}
                              </h6>
                              <span className={`role-badge ${getRoleBadgeClass(post.user_role)}`}>
                                {post.user_role?.toLowerCase() === 'candidate' ? 'Candidate' : 'Employer'}
                              </span>
                            </div>
                            <p className="mb-0 text-muted" style={{ fontSize: '0.75rem' }}>
                              {post.author_title || (post.user_role?.toLowerCase() === 'candidate' ? 'Member' : 'Company')} • {formatPostTime(post.created_at)}
                            </p>
                          </div>
                        </div>

                        {/* Options Menu (Delete Button) */}
                        {(isAuthor || isAdmin) && (
                          <button
                            onClick={() => handleDeletePost(post.id)}
                            className="btn btn-link text-muted p-1 hover-danger border-0 bg-transparent"
                            title="Delete post"
                          >
                            <i className="far fa-trash-alt" style={{ fontSize: '0.85rem' }}></i>
                          </button>
                        )}
                      </div>

                      {/* Post Content */}
                      {post.content && (
                        <div className="post-content-text text-dark mb-3" style={{ fontSize: '0.92rem', lineHeight: '1.6', whiteSpace: 'pre-line' }}>
                          {post.content}
                        </div>
                      )}

                      {/* Post Media Attachment */}
                      <MediaGrid 
                        mediaList={post.mediaList} 
                        onMediaClick={(idx) => { setLightboxMedia(post.mediaList); setLightboxIndex(idx); }} 
                      />

                      {/* Repost Shared Content Block */}
                      {post.parent_post_id && (
                        <div className="repost-quote-box p-3 rounded border bg-light mb-3">
                          {post.parent_author_name ? (
                            <>
                              <div className="d-flex align-items-center gap-2 mb-2">
                                <img
                                  src={post.parent_author_avatar || '/default-avatar.png'}
                                  alt="parent avatar"
                                  className="rounded-circle cursor-pointer"
                                  style={{ width: '32px', height: '32px', objectFit: 'cover' }}
                                  onClick={() => {
                                    if (post.parent_user_role?.toLowerCase() === 'candidate' && post.parent_author_id) {
                                      navigate(`/candidate/${post.parent_author_id}`);
                                    } else if (post.parent_company_id) {
                                      navigate(`/company/${post.parent_company_id}`);
                                    }
                                  }}
                                />
                                <div>
                                  <div className="d-flex align-items-center gap-1.5 flex-wrap">
                                    <span 
                                      className="fw-bold text-dark small cursor-pointer hover-text-primary"
                                      onClick={() => {
                                        if (post.parent_user_role?.toLowerCase() === 'candidate' && post.parent_author_id) {
                                          navigate(`/candidate/${post.parent_author_id}`);
                                        } else if (post.parent_company_id) {
                                          navigate(`/company/${post.parent_company_id}`);
                                        }
                                      }}
                                    >
                                      {post.parent_author_name}
                                    </span>
                                    <span className={`role-badge mini ${getRoleBadgeClass(post.parent_user_role)}`}>
                                      {post.parent_user_role?.toLowerCase() === 'candidate' ? 'Candidate' : 'Employer'}
                                    </span>
                                  </div>
                                  <span className="text-muted" style={{ fontSize: '0.65rem' }}>
                                    {post.parent_author_title || 'Member'} • {formatPostTime(post.parent_created_at)}
                                  </span>
                                </div>
                              </div>
                              {post.parent_content && (
                                <div className="post-content-text text-secondary small mb-2" style={{ lineHeight: '1.5', whiteSpace: 'pre-line' }}>
                                  {post.parent_content}
                                </div>
                              )}
                              {post.parent_media_url && (
                                <MediaGrid 
                                  mediaList={[{ media_url: post.parent_media_url, media_type: post.parent_media_type }]} 
                                  onMediaClick={() => { setLightboxMedia([{ media_url: post.parent_media_url, media_type: post.parent_media_type }]); setLightboxIndex(0); }} 
                                />
                              )}
                            </>
                          ) : (
                            <p className="text-muted small mb-0 italic"><i className="fas fa-exclamation-triangle me-1"></i> Original post was deleted.</p>
                          )}
                        </div>
                      )}

                      {/* Interaction Counts bar */}
                      <div className="d-flex align-items-center justify-content-between text-muted pb-2.5 mb-2 border-bottom" style={{ fontSize: '0.78rem' }}>
                        <div>
                          <i className="fas fa-thumbs-up text-primary me-1.5"></i>
                          <span>{post.likes_count || 0} Likes</span>
                        </div>
                        <div className="d-flex gap-3">
                          <span>{post.comments_count || 0} Comments</span>
                          <span>{post.reposts_count || 0} Shares</span>
                        </div>
                      </div>

                      {/* Action buttons (Like, Comment, Share) */}
                      <div className="d-flex align-items-center justify-content-around text-muted">
                        <button
                          onClick={() => handleLike(post.id)}
                          className={`btn-action d-inline-flex align-items-center gap-2 hover-bg-light ${post.is_liked ? 'text-primary liked' : ''}`}
                        >
                          <i className={post.is_liked ? "fas fa-thumbs-up" : "far fa-thumbs-up"}></i>
                          Like
                        </button>
                        <button
                          onClick={() => toggleComments(post.id)}
                          className={`btn-action d-inline-flex align-items-center gap-2 hover-bg-light ${activeCommentsPostId === post.id ? 'text-primary' : ''}`}
                        >
                          <i className="far fa-comment"></i>
                          Comment
                        </button>
                        <button
                          onClick={() => handleRepostClick(post)}
                          className="btn-action d-inline-flex align-items-center gap-2 hover-bg-light"
                        >
                          <i className="fas fa-retweet"></i>
                          Share
                        </button>
                      </div>

                      {/* Comments Drawer/Collapse Section */}
                      {activeCommentsPostId === post.id && (
                        <div className="comments-drawer mt-3 pt-3 border-top">
                          
                          {/* Write Comment Form */}
                          {isLoggedIn ? (
                            <form onSubmit={(e) => handleCommentSubmit(e, post.id)} className="d-flex gap-2.5 mb-3">
                              <input
                                id={`comment-input-${post.id}`}
                                type="text"
                                value={newCommentText[post.id] || ''}
                                onChange={(e) => setNewCommentText(prev => ({ ...prev, [post.id]: e.target.value }))}
                                placeholder="Write a comment..."
                                className="form-control form-control-sm rounded-pill px-3"
                                style={{ fontSize: '0.85rem' }}
                              />
                              <button
                                type="submit"
                                disabled={submittingComment[post.id] || !(newCommentText[post.id] || '').trim()}
                                className="btn btn-sm btn-primary rounded-pill px-3 fw-bold"
                                style={{ fontSize: '0.8rem', backgroundColor: '#01796F', borderColor: '#01796F' }}
                              >
                                {submittingComment[post.id] ? '...' : 'Send'}
                              </button>
                            </form>
                          ) : (
                            <p className="text-muted small mb-3 italic">Please log in to leave a comment.</p>
                          )}

                          {/* Comments List */}
                          <div className="d-flex flex-column gap-2.5" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                            {!commentsMap[post.id] ? (
                              <div className="text-center py-2">
                                <div className="spinner-border spinner-border-sm text-secondary" role="status"></div>
                              </div>
                            ) : commentsMap[post.id].length === 0 ? (
                              <p className="text-muted small text-center my-2">No comments yet. Start the conversation!</p>
                            ) : (() => {
                              const postComments = commentsMap[post.id];
                              const mainComments = postComments.filter(c => !c.parent_comment_id);
                              const replyComments = postComments.filter(c => c.parent_comment_id);

                              return mainComments.map((comment) => {
                                const replies = replyComments.filter(r => r.parent_comment_id === comment.id);

                                return (
                                  <div key={comment.id} className="d-flex flex-column gap-1 mb-2">
                                    {/* Main Comment */}
                                    <div className="comment-item p-2.5 rounded bg-light d-flex gap-2.5 align-items-start">
                                      <img
                                        src={comment.author_avatar || '/default-avatar.png'}
                                        alt="comment avatar"
                                        className="rounded-circle border cursor-pointer"
                                        style={{ width: '32px', height: '32px', objectFit: 'cover' }}
                                        onClick={() => {
                                          if (comment.user_role?.toLowerCase() === 'candidate') {
                                            navigate(`/candidate/${comment.user_id}`);
                                          } else if (comment.company_id) {
                                            navigate(`/company/${comment.company_id}`);
                                          }
                                        }}
                                      />
                                      <div className="flex-grow-1">
                                        <div className="d-flex align-items-center gap-1.5 flex-wrap">
                                          <span 
                                            className="fw-bold text-dark small cursor-pointer hover-text-primary" 
                                            style={{ fontSize: '0.85rem' }}
                                            onClick={() => {
                                              if (comment.user_role?.toLowerCase() === 'candidate') {
                                                navigate(`/candidate/${comment.user_id}`);
                                              } else if (comment.company_id) {
                                                navigate(`/company/${comment.company_id}`);
                                              }
                                            }}
                                          >
                                            {comment.author_name}
                                          </span>
                                          <span className={`role-badge mini ${getRoleBadgeClass(comment.user_role)}`}>
                                            {comment.user_role?.toLowerCase() === 'candidate' ? 'Candidate' : 'Employer'}
                                          </span>
                                        </div>
                                        <p className="mb-0 text-dark mt-1" style={{ fontSize: '0.82rem', lineHeight: '1.4' }}>{comment.content}</p>
                                        <div className="d-flex align-items-center gap-2 mt-1 text-muted" style={{ fontSize: '0.68rem' }}>
                                          <span>{formatPostTime(comment.created_at)}</span>
                                          <span>•</span>
                                          <button 
                                            type="button" 
                                            className="btn btn-link p-0 border-0 text-decoration-none fw-semibold hover-text-primary" 
                                            style={{ 
                                              fontSize: '0.68rem', 
                                              boxShadow: 'none',
                                              color: comment.is_liked ? '#01796F' : '#64748b'
                                            }}
                                            onClick={() => handleCommentLike(post.id, comment.id)}
                                          >
                                            {comment.is_liked ? 'Liked' : 'Like'}
                                            {comment.likes_count > 0 && (
                                              <span className="ms-1 fw-bold" style={{ fontSize: '0.65rem' }}>
                                                <i className="fas fa-thumbs-up me-0.5"></i> {comment.likes_count}
                                              </span>
                                            )}
                                          </button>
                                          <span>•</span>
                                          <button 
                                            type="button" 
                                            className="btn btn-link p-0 text-muted border-0 text-decoration-none fw-semibold hover-text-primary" 
                                            style={{ fontSize: '0.68rem', boxShadow: 'none' }}
                                            onClick={() => {
                                              setActiveReplyFormCommentId(prev => (prev === comment.id ? null : comment.id));
                                              setNewReplyText(prev => ({ ...prev, [comment.id]: '' }));
                                            }}
                                          >
                                            Reply
                                          </button>
                                        </div>
                                      </div>
                                    </div>
                                    {/* Replies List */}
                                    {replies.length > 0 && (
                                      <div className="d-flex flex-column gap-2 ms-4 ps-2 border-start mt-1">
                                        {replies.map((reply) => (
                                          <div key={reply.id} className="comment-item p-2 rounded bg-light d-flex gap-2 align-items-start" style={{ opacity: 0.95 }}>
                                            <img
                                              src={reply.author_avatar || '/default-avatar.png'}
                                              alt="reply avatar"
                                              className="rounded-circle border cursor-pointer"
                                              style={{ width: '26px', height: '26px', objectFit: 'cover' }}
                                              onClick={() => {
                                                if (reply.user_role?.toLowerCase() === 'candidate') {
                                                  navigate(`/candidate/${reply.user_id}`);
                                                } else if (reply.company_id) {
                                                  navigate(`/company/${reply.company_id}`);
                                                }
                                              }}
                                            />
                                            <div className="flex-grow-1">
                                              <div className="d-flex align-items-center gap-1.5 flex-wrap">
                                                <span 
                                                  className="fw-bold text-dark small cursor-pointer hover-text-primary" 
                                                  style={{ fontSize: '0.8rem' }}
                                                  onClick={() => {
                                                    if (reply.user_role?.toLowerCase() === 'candidate') {
                                                      navigate(`/candidate/${reply.user_id}`);
                                                    } else if (reply.company_id) {
                                                      navigate(`/company/${reply.company_id}`);
                                                    }
                                                  }}
                                                >
                                                  {reply.author_name}
                                                </span>
                                                <span className={`role-badge mini ${getRoleBadgeClass(reply.user_role)}`} style={{ fontSize: '0.55rem', padding: '1px 5px' }}>
                                                  {reply.user_role?.toLowerCase() === 'candidate' ? 'Candidate' : 'Employer'}
                                                </span>
                                              </div>
                                              <p className="mb-0 text-dark mt-0.5" style={{ fontSize: '0.8rem', lineHeight: '1.4' }}>{reply.content}</p>
                                              <div className="d-flex align-items-center gap-2 mt-1 text-muted" style={{ fontSize: '0.65rem' }}>
                                                <span>{formatPostTime(reply.created_at)}</span>
                                                <span>•</span>
                                                <button 
                                                  type="button" 
                                                  className="btn btn-link p-0 border-0 text-decoration-none fw-semibold hover-text-primary" 
                                                  style={{ 
                                                    fontSize: '0.65rem', 
                                                    boxShadow: 'none',
                                                    color: reply.is_liked ? '#01796F' : '#64748b'
                                                  }}
                                                  onClick={() => handleCommentLike(post.id, reply.id)}
                                                >
                                                  {reply.is_liked ? 'Liked' : 'Like'}
                                                  {reply.likes_count > 0 && (
                                                    <span className="ms-1 fw-bold" style={{ fontSize: '0.62rem' }}>
                                                      <i className="fas fa-thumbs-up me-0.5"></i> {reply.likes_count}
                                                    </span>
                                                  )}
                                                </button>
                                                <span>•</span>
                                                <button 
                                                  type="button" 
                                                  className="btn btn-link p-0 text-muted border-0 text-decoration-none fw-semibold hover-text-primary" 
                                                  style={{ fontSize: '0.65rem', boxShadow: 'none' }}
                                                  onClick={() => {
                                                    // Open/set the reply form for the parent (main) comment
                                                    setActiveReplyFormCommentId(comment.id);
                                                    // Pre-populate with @username mention
                                                    setNewReplyText(prev => ({
                                                      ...prev,
                                                      [comment.id]: `@${reply.author_name} `
                                                    }));
                                                    // Focus the input field after render
                                                    setTimeout(() => {
                                                      const inputEl = document.getElementById(`reply-input-${comment.id}`);
                                                      if (inputEl) {
                                                        inputEl.focus();
                                                      }
                                                    }, 50);
                                                  }}
                                                >
                                                  Reply
                                                </button>
                                              </div>
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    )}

                                    {/* Active Reply Form for this Main Comment */}
                                    {activeReplyFormCommentId === comment.id && isLoggedIn && (
                                      <form onSubmit={(e) => handleReplySubmit(e, post.id, comment.id)} className="d-flex gap-2 ms-4 ps-2 border-start mt-1">
                                        <input
                                          id={`reply-input-${comment.id}`}
                                          type="text"
                                          value={newReplyText[comment.id] || ''}
                                          onChange={(e) => setNewReplyText(prev => ({ ...prev, [comment.id]: e.target.value }))}
                                          placeholder={`Reply to ${comment.author_name}...`}
                                          className="form-control form-control-sm rounded-pill px-3"
                                          style={{ fontSize: '0.8rem' }}
                                          autoFocus
                                        />
                                        <button
                                          type="submit"
                                          disabled={submittingReply[comment.id] || !(newReplyText[comment.id] || '').trim()}
                                          className="btn btn-sm btn-primary rounded-pill px-3 fw-bold"
                                          style={{ fontSize: '0.75rem', backgroundColor: '#01796F', borderColor: '#01796F' }}
                                        >
                                          {submittingReply[comment.id] ? '...' : 'Reply'}
                                        </button>
                                      </form>
                                    )}
                                  </div>
                                );
                              });
                            })()}
                          </div>
                        </div>
                      )}

                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </div>
      </div>

      {/* Repost/Share Modal */}
      {repostTargetPost && (
        <div className="profile-modal-overlay" style={{ zIndex: 100005 }} onClick={() => setRepostTargetPost(null)}>
          <div className="profile-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="profile-modal-header">
              <h5 className="profile-modal-title"><i className="fas fa-retweet text-primary me-2"></i>Repost to Community</h5>
              <button type="button" className="profile-modal-close-btn" onClick={() => setRepostTargetPost(null)}>&times;</button>
            </div>
            <form onSubmit={repostRepostSubmit => handleRepostSubmit(repostRepostSubmit)}>
              <div className="profile-modal-body p-4 d-flex flex-column gap-3">
                
                {/* Repost thoughts input */}
                <div>
                  <label className="form-label fw-semibold text-secondary small">Add your thoughts (Optional)</label>
                  <textarea
                    value={repostContent}
                    onChange={(e) => setRepostContent(e.target.value)}
                    placeholder="e.g. This is really useful!, Check this out..."
                    rows="3"
                    className="form-control"
                    style={{ resize: 'none', fontSize: '0.88rem' }}
                  />
                </div>

                {/* Quoted post display preview */}
                <div className="border rounded p-3 bg-light">
                  <div className="d-flex align-items-center gap-2 mb-2">
                    <img
                      src={repostTargetPost.author_avatar || '/default-avatar.png'}
                      alt="parent avatar"
                      className="rounded-circle"
                      style={{ width: '28px', height: '28px', objectFit: 'cover' }}
                    />
                    <div>
                      <span className="fw-bold text-dark small d-block">{repostTargetPost.author_name}</span>
                      <span className="text-muted" style={{ fontSize: '0.62rem' }}>
                        {repostTargetPost.author_title || 'Member'}
                      </span>
                    </div>
                  </div>
                  {repostTargetPost.content && (
                    <p className="text-secondary small mb-0 text-truncate" style={{ maxHeight: '60px' }}>
                      {repostTargetPost.content}
                    </p>
                  )}
                  {repostTargetPost.media_url && (
                    <span className="text-primary small d-block mt-1">
                      <i className={repostTargetPost.media_type === 'image' ? 'far fa-image' : 'far fa-play-circle'}></i> Attachment included
                    </span>
                  )}
                </div>

              </div>
              <div className="profile-modal-footer p-3 border-top d-flex gap-2 justify-content-end bg-white">
                <button type="button" className="btn btn-light btn-sm border" onClick={() => setRepostTargetPost(null)}>Cancel</button>
                <button
                  type="submit"
                  disabled={isSubmittingRepost}
                  className="btn btn-primary btn-sm px-3 fw-bold"
                  style={{ backgroundColor: '#01796F', borderColor: '#01796F' }}
                >
                  {isSubmittingRepost ? 'Sharing...' : 'Share Now'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Lightbox Modal */}
      {lightboxMedia && (
        <div 
          className="position-fixed top-0 start-0 w-100 h-100 d-flex flex-column align-items-center justify-content-center"
          style={{ 
            backgroundColor: 'rgba(0, 0, 0, 0.95)', 
            zIndex: 999999,
            backdropFilter: 'blur(10px)',
            userSelect: 'none'
          }}
        >
          {/* Close Button */}
          <button 
            onClick={() => setLightboxMedia(null)}
            className="btn position-absolute border-0 text-white p-3 hover-opacity-100 transition"
            style={{ 
              top: '20px', 
              right: '20px', 
              fontSize: '2.5rem', 
              lineHeight: 1, 
              opacity: 0.8,
              zIndex: 1000002
            }}
            title="Close (Esc)"
          >
            &times;
          </button>

          {/* Prev Button */}
          {lightboxMedia.length > 1 && (
            <button 
              onClick={() => setLightboxIndex(prev => (prev === 0 ? lightboxMedia.length - 1 : prev - 1))}
              className="btn position-absolute border-0 text-white p-3 hover-opacity-100 transition"
              style={{ 
                left: '20px', 
                top: '50%', 
                transform: 'translateY(-50%)', 
                fontSize: '3rem', 
                opacity: 0.7,
                zIndex: 1000001
              }}
            >
              &#10094;
            </button>
          )}

          {/* Next Button */}
          {lightboxMedia.length > 1 && (
            <button 
              onClick={() => setLightboxIndex(prev => (prev === lightboxMedia.length - 1 ? 0 : prev + 1))}
              className="btn position-absolute border-0 text-white p-3 hover-opacity-100 transition"
              style={{ 
                right: '20px', 
                top: '50%', 
                transform: 'translateY(-50%)', 
                fontSize: '3rem', 
                opacity: 0.7,
                zIndex: 1000001
              }}
            >
              &#10095;
            </button>
          )}

          {/* Media Display */}
          <div className="d-flex align-items-center justify-content-center p-4 w-100 h-100" style={{ maxWidth: '90%', maxHeight: '85%' }}>
            {lightboxMedia[lightboxIndex].media_type === 'image' ? (
              <img 
                src={`http://localhost:5000${lightboxMedia[lightboxIndex].media_url}`}
                alt="zoom-view"
                className="img-fluid rounded shadow-lg"
                style={{ 
                  maxHeight: '80vh', 
                  maxWidth: '85vw',
                  objectFit: 'contain',
                  transition: 'transform 0.3s ease'
                }}
              />
            ) : (
              <video 
                src={`http://localhost:5000${lightboxMedia[lightboxIndex].media_url}`}
                controls
                autoPlay
                className="rounded shadow-lg"
                style={{ 
                  maxHeight: '80vh', 
                  maxWidth: '85vw',
                  objectFit: 'contain'
                }}
              />
            )}
          </div>

          {/* Media Info / Counter */}
          <div className="position-absolute bottom-0 text-white-50 text-center pb-4 small w-100">
            {lightboxIndex + 1} / {lightboxMedia.length}
          </div>
        </div>
      )}
    </div>
  );
}
