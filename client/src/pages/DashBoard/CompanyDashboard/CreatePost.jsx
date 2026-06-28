import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import PostCreator from '../../../components/Community/PostCreator';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const quillModules = {
  toolbar: [
    ['bold', 'italic'],
    [{ 'list': 'ordered' }, { 'list': 'bullet' }],
    ['blockquote', 'code-block'],
    ['link', 'image']
  ]
};

const quillFormats = [
  'bold', 'italic',
  'list', 'bullet',
  'blockquote', 'code-block',
  'link', 'image'
];

// Media grid component for posts
const MediaGrid = ({ mediaList }) => {
  if (!mediaList || mediaList.length === 0) return null;
  
  const count = mediaList.length;
  
  return (
    <div className="row g-2 mb-3">
      {mediaList.map((media, idx) => {
        const isImage = media.media_type === 'image';
        const mediaSrc = `http://localhost:5000${media.media_url}`;
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

const getFullUrl = (url) => {
  if (!url) return '/default-avatar.png';
  const cleanUrl = url.trim();
  if (cleanUrl.startsWith('http://') || cleanUrl.startsWith('https://') || cleanUrl.startsWith('data:')) {
    return cleanUrl;
  }
  return `http://localhost:5000${cleanUrl.startsWith('/') ? '' : '/'}${cleanUrl}`;
};

export default function CreatePost() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // States for comments functionality
  const [commentsMap, setCommentsMap] = useState({});
  const [activeCommentsPostId, setActiveCommentsPostId] = useState(null);
  const [newCommentText, setNewCommentText] = useState({});
  const [submittingComment, setSubmittingComment] = useState({});

  // State variables for Edit Post Modal
  const [editingPost, setEditingPost] = useState(null);
  const [editContent, setEditContent] = useState('');
  const [editVisibility, setEditVisibility] = useState('public');
  const [editMediaAttachments, setEditMediaAttachments] = useState([]); // files đính kèm cũ
  const [editNewFiles, setEditNewFiles] = useState([]); // files mới chọn thêm [{ file, previewUrl, type }]
  const [editKeepMedia, setEditKeepMedia] = useState(true); // true = giữ media cũ, false = xóa media cũ
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [editError, setEditError] = useState('');
  const editFileInputRef = React.useRef(null);

  const handleOpenEditModal = (post) => {
    setEditingPost(post);
    setEditContent(post.content || '');
    setEditVisibility(post.visibility || 'public');
    setEditMediaAttachments(post.mediaList || []);
    setEditNewFiles([]);
    setEditKeepMedia(true);
    setEditError('');
  };

  const handleCloseEditModal = () => {
    setEditingPost(null);
    setEditContent('');
    setEditVisibility('public');
    setEditMediaAttachments([]);
    editNewFiles.forEach(file => URL.revokeObjectURL(file.previewUrl));
    setEditNewFiles([]);
    setEditKeepMedia(true);
    setEditError('');
  };

  const handleEditFileChange = (e) => {
    const files = Array.from(e.target.files);
    const newAttachments = [];
    const allowedImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/jpg'];
    const allowedVideoTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'];
    let fileError = '';

    files.forEach(file => {
      const isImage = allowedImageTypes.includes(file.type);
      const isVideo = allowedVideoTypes.includes(file.type);

      if (!isImage && !isVideo) {
        fileError = 'Invalid file type! Only image and video files are allowed.';
        return;
      }

      newAttachments.push({
        file: file,
        previewUrl: URL.createObjectURL(file),
        type: isImage ? 'image' : 'video'
      });
    });

    if (fileError) {
      setEditError(fileError);
    }

    if (newAttachments.length > 0) {
      setEditKeepMedia(false);
      setEditNewFiles(prev => [...prev, ...newAttachments]);
    }

    if (editFileInputRef.current) editFileInputRef.current.value = '';
  };

  const removeEditNewMedia = (index) => {
    setEditNewFiles(prev => {
      const updated = [...prev];
      URL.revokeObjectURL(updated[index].previewUrl);
      updated.splice(index, 1);
      return updated;
    });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditError('');

    if (!editContent.trim() && editMediaAttachments.length === 0 && editNewFiles.length === 0 && !editKeepMedia) {
      setEditError('Please write some content or attach images/videos to post.');
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      setEditError('You must be logged in to edit a post.');
      return;
    }

    setIsSavingEdit(true);

    try {
      const formData = new FormData();
      formData.append('content', editContent);
      formData.append('visibility', editVisibility);
      formData.append('keepMedia', editKeepMedia ? 'true' : 'false');
      
      editNewFiles.forEach(att => {
        formData.append('media', att.file);
      });

      const response = await axios.put(`http://localhost:5000/api/posts/${editingPost.id}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      setPosts(prev => prev.map(p => p.id === editingPost.id ? response.data.post : p));
      handleCloseEditModal();
    } catch (err) {
      console.error(err);
      setEditError(err.response?.data?.message || 'Failed to update post. Please try again.');
    } finally {
      setIsSavingEdit(false);
    }
  };

  const currentUserId = parseInt(localStorage.getItem('userId')) || null;

  // Fetch all community posts
  const fetchPosts = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const response = await axios.get('http://localhost:5000/api/posts', { headers });
      setPosts(response.data || []);
    } catch (err) {
      console.error("Failed to fetch community posts:", err);
      setError('Failed to load community posts. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [refreshTrigger]);

  const handlePostCreated = () => {
    // Refresh posts feed after a new post is created
    setRefreshTrigger(prev => prev + 1);
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/posts/${postId}`, {
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

  const handleLike = async (postId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`http://localhost:5000/api/posts/${postId}/like`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Update specific post like state in local state list
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
      const response = await axios.get(`http://localhost:5000/api/posts/${postId}/comments`, { headers });
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

    setSubmittingComment(prev => ({ ...prev, [postId]: true }));
    try {
      const token = localStorage.getItem('token');
      await axios.post(`http://localhost:5000/api/posts/${postId}/comments`, {
        content: commentText
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Clear comment text field
      setNewCommentText(prev => ({ ...prev, [postId]: '' }));
      // Refetch comments
      await fetchComments(postId);
      // Increment comment count on the post
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

  // Filter posts to show only those created by the current logged-in company
  const myPosts = posts.filter(post => post.user_id === currentUserId);

  return (
    <div className="animate-fade-in d-flex flex-column gap-4 p-4" style={{ maxWidth: '800px', margin: '0 auto', fontFamily: "'Inter', sans-serif" }}>
      
      {/* Main card containing PostCreator */}
      <div className="card border-0 shadow-sm">
        <div className="card-header bg-white py-3 border-bottom d-flex align-items-center justify-content-between">
          <h5 className="mb-0 fw-bold text-dark">
            <i className="fas fa-users me-2 text-primary"></i>Community Post
          </h5>
        </div>
        
        <div className="card-body p-4">
          <PostCreator
            onPostCreated={handlePostCreated}
            placeholder="Announce new job roles, share insights about your team culture or industry updates..."
          />
        </div>
      </div>

      {/* Recent Posts Card */}
      <div className="card border-0 shadow-sm">
        <div className="card-header bg-white py-3 border-bottom d-flex align-items-center justify-content-between">
          <div className="d-flex align-items-center gap-2">
            <h5 className="mb-0 fw-bold text-dark">Recent Posts</h5>
            <span className="badge bg-light text-muted border rounded-pill d-inline-flex align-items-center py-1.5 px-2.5 fw-normal small">
              <i className="fas fa-history text-primary me-1.5" style={{ fontSize: '0.8rem' }}></i>
              Your activity
            </span>
          </div>
          <i className="fas fa-paper-plane text-primary fs-4"></i>
        </div>

        <div className="card-body p-4">
          <div className="d-flex flex-column gap-4">
            {loading && myPosts.length === 0 ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading posts...</span>
                </div>
                <p className="text-muted mt-2 small">Loading your recent posts...</p>
              </div>
            ) : error ? (
              <div className="alert alert-danger text-center p-4 border-0 shadow-sm" role="alert">
                <i className="fas fa-exclamation-circle fs-3 mb-2 text-danger"></i>
                <p className="mb-0 small">{error}</p>
              </div>
            ) : myPosts.length === 0 ? (
              <div className="text-center py-5 text-muted small border rounded bg-light">
                <i className="fas fa-paper-plane fs-3 mb-2 text-muted opacity-50"></i>
                <p className="mb-0">No posts shared yet.</p>
              </div>
            ) : (
              myPosts.map((post) => (
                <div key={post.id} className="p-3 rounded bg-light position-relative">
                  <div className="d-flex align-items-center gap-3 mb-3">
                    <img
                      src={getFullUrl(post.author_avatar)}
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

                    {/* Edit & Delete post buttons */}
                    <div className="d-flex align-items-center gap-1 ms-auto align-self-start">
                      {post.user_id === currentUserId && (
                        <button
                          onClick={() => handleOpenEditModal(post)}
                          className="btn btn-link text-muted p-1 hover-primary border-0 bg-transparent"
                          title="Edit post"
                        >
                          <i className="far fa-edit" style={{ fontSize: '0.85rem' }}></i>
                        </button>
                      )}
                      <button
                        onClick={() => handleDeletePost(post.id)}
                        className="btn btn-link text-muted p-1 hover-danger border-0 bg-transparent"
                        title="Delete post"
                      >
                        <i className="far fa-trash-alt" style={{ fontSize: '0.85rem' }}></i>
                      </button>
                    </div>
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

                  {/* Post Footer/Activity statistics - Now fully interactive */}
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
                                src={getFullUrl(comment.author_avatar)} 
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
              ))
            )}
          </div>
        </div>
      </div>
      {/* Edit Post Modal */}
      {editingPost && (
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
              maxWidth: '560px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              display: 'flex',
              flexDirection: 'column',
              maxHeight: '90vh',
              overflow: 'hidden',
              animation: 'modalFadeIn 0.3s ease'
            }}
          >
            {/* Modal Header */}
            <div className="d-flex align-items-center justify-content-between p-3.5 border-bottom" style={{ padding: '16px 20px' }}>
              <h5 className="fw-bold mb-0 text-dark" style={{ fontSize: '1.15rem' }}>Edit post</h5>
              <button
                type="button"
                onClick={handleCloseEditModal}
                className="btn-close"
                style={{ cursor: 'pointer' }}
                aria-label="Close"
              ></button>
            </div>

            {/* Modal Body */}
            <div className="p-3.5" style={{ overflowY: 'auto', flexGrow: 1, padding: '20px' }}>
              <div className="d-flex align-items-center gap-2.5 mb-3">
                <img
                  src={getFullUrl(editingPost.author_avatar)}
                  alt="User avatar"
                  className="rounded-circle border"
                  style={{ width: '48px', height: '48px', objectFit: 'cover' }}
                />
                <div>
                  <h6 className="fw-bold mb-0 text-dark" style={{ fontSize: '0.95rem' }}>{editingPost.author_name}</h6>
                  <select
                    value={editVisibility}
                    onChange={(e) => setEditVisibility(e.target.value)}
                    className="text-muted small bg-light px-2 py-0.5 rounded border"
                    style={{
                      fontSize: '0.72rem',
                      marginTop: '3px',
                      cursor: 'pointer',
                      outline: 'none',
                      borderColor: '#cbd5e1'
                    }}
                  >
                    <option value="public">🌐 Public</option>
                    <option value="private">🔒 Private</option>
                  </select>
                </div>
              </div>

              <form onSubmit={handleEditSubmit}>
                {editError && (
                  <div className="alert alert-danger py-2 px-3 mb-3 small border-0" role="alert" style={{ borderRadius: '8px' }}>
                    <i className="fas fa-exclamation-triangle me-1.5"></i> {editError}
                  </div>
                )}

                {/* Trình soạn thảo ReactQuill */}
                <div className="mb-3 border rounded" style={{ minHeight: '220px', overflow: 'hidden' }}>
                  <ReactQuill
                    theme="snow"
                    value={editContent}
                    onChange={setEditContent}
                    placeholder="Edit your post content..."
                    modules={quillModules}
                    formats={quillFormats}
                    style={{ height: '200px' }}
                  />
                </div>

                {/* Existing media files */}
                {editKeepMedia && editMediaAttachments.length > 0 && (
                  <div className="mb-3">
                    <label className="form-label fw-bold text-secondary small d-flex justify-content-between align-items-center">
                      <span>Existing Media ({editMediaAttachments.length})</span>
                      <button 
                        type="button" 
                        className="btn btn-sm btn-link text-danger text-decoration-none p-0 fw-semibold"
                        style={{ fontSize: '0.75rem' }}
                        onClick={() => setEditKeepMedia(false)}
                      >
                        <i className="far fa-trash-alt me-1"></i> Remove all old media
                      </button>
                    </label>
                    <div className="d-flex flex-wrap gap-2">
                      {editMediaAttachments.map((m, idx) => (
                        <div key={idx} className="position-relative border rounded overflow-hidden" style={{ width: '80px', height: '80px', backgroundColor: '#f1f5f9' }}>
                          {m.media_type === 'image' ? (
                            <img
                              src={`http://localhost:5000${m.media_url}`}
                              alt="old media"
                              className="w-100 h-100 object-fit-cover"
                            />
                          ) : (
                            <div className="w-100 h-100 d-flex align-items-center justify-content-center position-relative">
                              <video src={`http://localhost:5000${m.media_url}`} className="w-100 h-100 object-fit-cover" muted />
                              <i className="fas fa-play text-white position-absolute fs-6 opacity-75"></i>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* New media files preview */}
                {editNewFiles.length > 0 && (
                  <div className="mb-3">
                    <label className="form-label fw-bold text-success small">New Uploaded Media ({editNewFiles.length})</label>
                    <div className="d-flex flex-wrap gap-2">
                      {editNewFiles.map((att, idx) => (
                        <div key={idx} className="position-relative border rounded overflow-hidden" style={{ width: '80px', height: '80px', backgroundColor: '#f1f5f9' }}>
                          {att.type === 'image' ? (
                            <img
                              src={att.previewUrl}
                              alt="new preview"
                              className="w-100 h-100 object-fit-cover"
                            />
                          ) : (
                            <div className="w-100 h-100 d-flex align-items-center justify-content-center position-relative">
                              <video src={att.previewUrl} className="w-100 h-100 object-fit-cover" muted />
                              <i className="fas fa-play text-white position-absolute fs-6 opacity-75"></i>
                            </div>
                          )}
                          <button
                            type="button"
                            onClick={() => removeEditNewMedia(idx)}
                            className="btn btn-sm btn-danger position-absolute top-0 end-0 p-0 d-flex align-items-center justify-content-center rounded-circle"
                            style={{ width: '18px', height: '18px', fontSize: '0.65rem', marginTop: '2px', marginRight: '2px' }}
                          >
                            &times;
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Hidden input file for new media */}
                <input
                  type="file"
                  multiple
                  ref={editFileInputRef}
                  onChange={handleEditFileChange}
                  style={{ display: 'none' }}
                />
              </form>
            </div>

            {/* Modal Footer */}
            <div className="d-flex align-items-center justify-content-between p-3.5 border-top bg-light" style={{ padding: '16px 20px' }}>
              <div className="d-flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    if (editFileInputRef.current) {
                      editFileInputRef.current.accept = "image/*,video/*";
                      editFileInputRef.current.click();
                    }
                  }}
                  className="btn btn-sm btn-light border d-inline-flex align-items-center justify-content-center rounded-circle hover-bg-light"
                  style={{ width: '36px', height: '36px', transition: 'background-color 0.2s' }}
                  title="Add photos/videos"
                >
                  <i className="far fa-images text-success fs-5"></i>
                </button>
              </div>

              <div className="d-flex gap-2">
                <button
                  type="button"
                  onClick={handleCloseEditModal}
                  className="btn btn-sm btn-light border px-3 py-2 fw-semibold text-secondary"
                  style={{ borderRadius: '8px', fontSize: '0.85rem' }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleEditSubmit}
                  disabled={isSavingEdit || (!editContent.trim() && editMediaAttachments.length === 0 && editNewFiles.length === 0 && !editKeepMedia)}
                  className="btn btn-primary btn-sm px-4 py-2 fw-bold d-inline-flex align-items-center gap-2"
                  style={{
                    borderRadius: '8px',
                    fontSize: '0.85rem',
                    backgroundColor: '#01796F',
                    borderColor: '#01796F'
                  }}
                >
                  {isSavingEdit ? 'Saving...' : 'Save'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
