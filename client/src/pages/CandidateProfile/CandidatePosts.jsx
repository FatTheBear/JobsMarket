import React, { useState, useEffect } from 'react';
import axios from 'axios';
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
      <div className="post-media-wrap single-media rounded overflow-hidden bg-black mb-3 border text-center" style={{ maxHeight: '350px', cursor: 'pointer' }} onClick={() => onMediaClick ? onMediaClick(0) : null}>
        {isImage ? (
          <img
            src={mediaSrc}
            alt="attached media"
            className="img-fluid"
            style={{ maxHeight: '350px', objectFit: 'contain' }}
          />
        ) : (
          <video
            src={mediaSrc}
            className="w-100"
            style={{ maxHeight: '350px', objectFit: 'contain' }}
            muted
            playsInline
          />
        )}
      </div>
    );
  }

  if (count === 2) {
    return (
      <div className="post-media-grid grid-2 rounded overflow-hidden mb-3 border bg-black" style={{ height: '220px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px' }}>
        <div style={{ minHeight: 0, overflow: 'hidden', height: '100%' }}>{renderMediaItem(mediaList[0], 0)}</div>
        <div style={{ minHeight: 0, overflow: 'hidden', height: '100%' }}>{renderMediaItem(mediaList[1], 1)}</div>
      </div>
    );
  }

  if (count === 3) {
    return (
      <div className="post-media-grid grid-3 rounded overflow-hidden mb-3 border bg-black" style={{ height: '260px', display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '4px' }}>
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
    <div className="post-media-grid grid-4 rounded overflow-hidden mb-3 border bg-black" style={{ height: '260px', display: 'grid', gridTemplateColumns: '1fr 1fr', gridTemplateRows: '1fr 1fr', gap: '4px' }}>
      <div style={{ minHeight: 0, overflow: 'hidden', height: '100%' }}>{renderMediaItem(mediaList[0], 0)}</div>
      <div style={{ minHeight: 0, overflow: 'hidden', height: '100%' }}>{renderMediaItem(mediaList[1], 1)}</div>
      <div style={{ minHeight: 0, overflow: 'hidden', height: '100%' }}>{renderMediaItem(mediaList[2], 2)}</div>
      <div className="position-relative w-100 h-100" style={{ minHeight: 0, overflow: 'hidden', height: '100%' }}>
        {renderMediaItem(mediaList[3], 3)}
        {remaining > 0 && (
          <div
            className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center text-white fw-bold fs-5"
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

  return date.toLocaleDateString('vi-VN');
};

const getFullUrl = (url) => {
  if (!url) return '/default-avatar.png';
  const cleanUrl = url.trim();
  if (cleanUrl.startsWith('http://') || cleanUrl.startsWith('https://') || cleanUrl.startsWith('data:')) {
    return cleanUrl;
  }
  return `http://localhost:5000${cleanUrl.startsWith('/') ? '' : '/'}${cleanUrl}`;
};

const CandidatePosts = ({ candidatePosts, setCandidatePosts }) => {
  const [lightboxMedia, setLightboxMedia] = useState(null);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editingCommentText, setEditingCommentText] = useState('');

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

      // Update the post in local state
      if (setCandidatePosts) {
        setCandidatePosts(prev => prev.map(p => p.id === editingPost.id ? response.data.post : p));
      }
      handleCloseEditModal();
    } catch (err) {
      console.error(err);
      setEditError(err.response?.data?.message || 'Failed to update post. Please try again.');
    } finally {
      setIsSavingEdit(false);
    }
  };

  const handleCommentDelete = async (postId, commentId) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/posts/comments/${commentId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setCommentsMap(prev => ({
        ...prev,
        [postId]: prev[postId].filter(c => c.id !== commentId)
      }));

      if (setCandidatePosts) {
        setCandidatePosts(prev => prev.map(post => {
          if (post.id === postId) {
            return { ...post, comments: Math.max(0, (post.comments || 0) - 1) };
          }
          return post;
        }));
      }
    } catch (err) {
      console.error('Failed to delete comment:', err);
      alert('Failed to delete comment. Please try again.');
    }
  };

  const handleCommentEditSubmit = async (postId, commentId) => {
    if (!editingCommentText || !editingCommentText.trim()) return;

    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:5000/api/posts/comments/${commentId}`, {
        content: editingCommentText.trim()
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setCommentsMap(prev => ({
        ...prev,
        [postId]: prev[postId].map(c => c.id === commentId ? { ...c, content: editingCommentText.trim() } : c)
      }));

      setEditingCommentId(null);
    } catch (err) {
      console.error('Failed to update comment:', err);
      alert('Failed to edit comment. Please try again.');
    }
  };

  const [commentsMap, setCommentsMap] = useState({});
  const [activeCommentsPostId, setActiveCommentsPostId] = useState(null);
  const [newCommentText, setNewCommentText] = useState({});
  const [submittingComment, setSubmittingComment] = useState({});
  const [activeReplyFormCommentId, setActiveReplyFormCommentId] = useState(null);
  const [newReplyText, setNewReplyText] = useState({});
  const [submittingReply, setSubmittingReply] = useState({});

  // Repost Modal states
  const [repostTargetPost, setRepostTargetPost] = useState(null);
  const [repostContent, setRepostContent] = useState('');
  const [isSubmittingRepost, setIsSubmittingRepost] = useState(false);

  const isLoggedIn = !!localStorage.getItem('token');
  const currentUserId = parseInt(localStorage.getItem('userId')) || null;
  const currentUserRole = localStorage.getItem('role') || '';

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

      if (setCandidatePosts) {
        setCandidatePosts(prev => prev.map(post => {
          if (post.id === postId) {
            return {
              ...post,
              is_liked: response.data.is_liked ? 1 : 0,
              likes: response.data.likes_count
            };
          }
          return post;
        }));
      }
    } catch (err) {
      console.error('Failed to toggle like:', err);
    }
  };

  const toggleComments = async (postId) => {
    if (activeCommentsPostId === postId) {
      setActiveCommentsPostId(null);
      return;
    }

    setActiveCommentsPostId(postId);

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

      setNewCommentText(prev => ({ ...prev, [postId]: '' }));

      setCommentsMap(prev => ({
        ...prev,
        [postId]: [...(prev[postId] || []), response.data.comment]
      }));

      if (setCandidatePosts) {
        setCandidatePosts(prev => prev.map(post => {
          if (post.id === postId) {
            return {
              ...post,
              comments: (post.comments || 0) + 1
            };
          }
          return post;
        }));
      }
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

      setNewReplyText(prev => ({ ...prev, [parentCommentId]: '' }));
      setActiveReplyFormCommentId(null);

      setCommentsMap(prev => ({
        ...prev,
        [postId]: [...(prev[postId] || []), response.data.comment]
      }));

      if (setCandidatePosts) {
        setCandidatePosts(prev => prev.map(post => {
          if (post.id === postId) {
            return {
              ...post,
              comments: (post.comments || 0) + 1
            };
          }
          return post;
        }));
      }
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

      if (setCandidatePosts) {
        const newPost = {
          id: response.data.post.id,
          author: response.data.post.author_name || 'Candidate',
          avatar: response.data.post.author_avatar || '/default-avatar.png',
          time: 'Just now',
          content: response.data.post.content,
          mediaList: response.data.post.mediaList || [],
          likes: 0,
          comments: 0,
          shares: 0,
          is_liked: 0,
          user_role: response.data.post.user_role,
          parent_post_id: response.data.post.parent_post_id,
          parent_content: response.data.post.parent_content,
          parent_media_url: response.data.post.parent_media_url,
          parent_media_type: response.data.post.parent_media_type,
          parent_author_name: response.data.post.parent_author_name,
          parent_author_avatar: response.data.post.parent_author_avatar,
          parent_user_role: response.data.post.parent_user_role,
          parent_author_title: response.data.post.parent_author_title,
          parent_created_at: response.data.post.parent_created_at
        };
        setCandidatePosts(prev => [newPost, ...prev]);

        setCandidatePosts(prev => prev.map(post => {
          if (post.id === repostTargetPost.id || post.id === repostTargetPost.parent_post_id) {
            return {
              ...post,
              shares: (post.shares || 0) + 1
            };
          }
          return post;
        }));
      }

      setRepostTargetPost(null);
    } catch (err) {
      console.error('Failed to share post:', err);
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

      if (setCandidatePosts) {
        setCandidatePosts(prev => prev.filter(post => post.id !== postId));
      }
    } catch (err) {
      console.error('Failed to delete post:', err);
      alert(err.response?.data?.message || 'Failed to delete post.');
    }
  };

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

  return (
    <div className="col-12 mb-0">
      <div className="p-0">
        <div className="d-flex align-items-center justify-content-between mb-3">
          <div className="d-flex align-items-center gap-2">
            <span className="fs-5 fw-bold text-dark mb-0">Recent Posts</span>
            <span className="badge bg-light text-muted border rounded-pill d-inline-flex align-items-center py-1.5 px-2.5 fw-normal small">
              <i className="fas fa-history text-primary me-1.5" style={{ fontSize: '0.8rem' }}></i>
              Your activity
            </span>
          </div>
          <i className="fas fa-paper-plane text-primary fs-4"></i>
        </div>

          <div className="d-flex flex-column gap-4">
            {candidatePosts.length === 0 ? (
              <div className="text-center py-5 text-muted small border rounded bg-light">
                <i className="fas fa-paper-plane fs-3 mb-2 text-muted opacity-50"></i>
                <p className="mb-0">No posts shared yet.</p>
              </div>
            ) : (
              candidatePosts.map((post) => (
                <div key={post.id} className="p-3 rounded candidate-post-card bg-light" style={{ maxWidth: '650px', margin: '0 auto', width: '100%' }}>
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <div className="d-flex align-items-center gap-3">
                      <img
                        src={getFullUrl(post.avatar)}
                        alt="author avatar"
                        className="rounded-circle shadow-sm border"
                        style={{ width: '48px', height: '48px', objectFit: 'cover' }}
                      />
                      <div>
                        <h6 className="fw-bold mb-0 text-dark" style={{ fontSize: '0.95rem' }}>{post.author}</h6>
                        <p className="mb-0 text-muted small fw-medium">
                          Full Stack Developer • {post.time} <i className="fas fa-globe-asia ms-1"></i>
                        </p>
                      </div>
                    </div>
                    {((post.user_id === currentUserId) || currentUserRole === 'Admin') && (
                      <div className="d-flex align-items-center gap-1">
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
                    )}
                  </div>

                  {post.content && (
                    <div 
                      className="post-text text-dark mb-3" 
                      style={{ fontSize: '0.92rem', lineHeight: '1.6' }}
                      dangerouslySetInnerHTML={{ __html: post.content }}
                    />
                  )}

                  {/* Post Media Attachment Grid */}
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
                              src={getFullUrl(post.parent_author_avatar)}
                              alt="parent avatar"
                              className="rounded-circle"
                              style={{ width: '32px', height: '32px', objectFit: 'cover' }}
                            />
                            <div>
                              <div className="d-flex align-items-center gap-1.5 flex-wrap">
                                <span className="fw-bold text-dark small">{post.parent_author_name}</span>
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
                  <div className="d-flex align-items-center justify-content-between text-muted pb-2 mb-2 border-bottom" style={{ fontSize: '0.78rem' }}>
                    <div>
                      <i className="fas fa-thumbs-up text-primary me-1.5"></i>
                      <span>{post.likes || 0} Likes</span>
                    </div>
                    <div className="d-flex gap-3">
                      <span>{post.comments || 0} Comments</span>
                      <span>{post.shares || 0} Shares</span>
                    </div>
                  </div>

                  {/* Action buttons (Like, Comment, Share) */}
                  <div className="d-flex align-items-center justify-content-around text-muted border-bottom pb-2 mb-2">
                    <button
                      onClick={() => handleLike(post.id)}
                      className={`btn-action d-inline-flex align-items-center gap-2 hover-bg-light border-0 bg-transparent text-muted ${post.is_liked ? 'text-primary liked' : ''}`}
                      style={{ fontSize: '0.85rem', cursor: 'pointer' }}
                    >
                      <i className={post.is_liked ? "fas fa-thumbs-up text-primary" : "far fa-thumbs-up"}></i>
                      Like
                    </button>
                    <button
                      onClick={() => toggleComments(post.id)}
                      className={`btn-action d-inline-flex align-items-center gap-2 hover-bg-light border-0 bg-transparent text-muted ${activeCommentsPostId === post.id ? 'text-primary' : ''}`}
                      style={{ fontSize: '0.85rem', cursor: 'pointer' }}
                    >
                      <i className="far fa-comment"></i>
                      Comment
                    </button>
                    <button
                      onClick={() => handleRepostClick(post)}
                      className="btn-action d-inline-flex align-items-center gap-2 hover-bg-light border-0 bg-transparent text-muted"
                      style={{ fontSize: '0.85rem', cursor: 'pointer' }}
                    >
                      <i className="fas fa-retweet"></i>
                      Share
                    </button>
                  </div>

                  {/* Comments Drawer/Collapse Section */}
                  {activeCommentsPostId === post.id && (
                    <div className="comments-drawer mt-3 pt-3">

                      {/* Write Comment Form */}
                      {isLoggedIn ? (
                        <form onSubmit={(e) => handleCommentSubmit(e, post.id)} className="d-flex gap-2 mb-3">
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
                            className="btn btn-sm btn-primary rounded-pill px-3 fw-bold border-0"
                            style={{ fontSize: '0.8rem', backgroundColor: '#01796F' }}
                          >
                            {submittingComment[post.id] ? '...' : 'Send'}
                          </button>
                        </form>
                      ) : (
                        <p className="text-muted small mb-3 italic">Please log in to leave a comment.</p>
                      )}

                      {/* Comments List */}
                      <div className="d-flex flex-column gap-2" style={{ maxHeight: '400px', overflowY: 'auto' }}>
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
                                <div className="comment-item p-2.5 rounded bg-light d-flex gap-2 align-items-start">
                                  <img
                                    src={getFullUrl(comment.author_avatar)}
                                    alt="comment avatar"
                                    className="rounded-circle border"
                                    style={{ width: '32px', height: '32px', objectFit: 'cover' }}
                                  />
                                  <div className="flex-grow-1">
                                    <div className="d-flex align-items-center justify-content-between flex-wrap gap-2">
                                      <div className="d-flex align-items-center gap-1.5 flex-wrap">
                                        <span className="fw-bold text-dark small" style={{ fontSize: '0.85rem' }}>{comment.author_name}</span>
                                        <span className={`role-badge mini ${getRoleBadgeClass(comment.user_role)}`}>
                                          {comment.user_role?.toLowerCase() === 'candidate' ? 'Candidate' : 'Employer'}
                                        </span>
                                      </div>
                                      <div className="d-flex align-items-center gap-2">
                                        {comment.user_id === currentUserId && (
                                          <button
                                            type="button"
                                            className="btn btn-link text-muted p-0 hover-primary border-0 bg-transparent"
                                            title="Edit comment"
                                            onClick={() => {
                                              setEditingCommentId(comment.id);
                                              setEditingCommentText(comment.content);
                                            }}
                                          >
                                            <i className="fas fa-pencil-alt" style={{ fontSize: '0.7rem' }}></i>
                                          </button>
                                        )}
                                        {((comment.user_id === currentUserId) || currentUserRole === 'Admin') && (
                                          <button
                                            type="button"
                                            className="btn btn-link text-muted p-0 hover-danger border-0 bg-transparent"
                                            title="Delete comment"
                                            onClick={() => handleCommentDelete(post.id, comment.id)}
                                          >
                                            <i className="far fa-trash-alt" style={{ fontSize: '0.7rem' }}></i>
                                          </button>
                                        )}
                                      </div>
                                    </div>
                                    {editingCommentId === comment.id ? (
                                      <div className="mt-1 d-flex flex-column gap-1.5">
                                        <input
                                          type="text"
                                          className="form-control form-control-sm"
                                          value={editingCommentText}
                                          onChange={(e) => setEditingCommentText(e.target.value)}
                                          autoFocus
                                        />
                                        <div className="d-flex gap-2 justify-content-end mt-1">
                                          <button 
                                            type="button" 
                                            className="btn btn-sm btn-light border py-0 px-2"
                                            style={{ fontSize: '0.7rem' }}
                                            onClick={() => setEditingCommentId(null)}
                                          >
                                            Cancel
                                          </button>
                                          <button 
                                            type="button" 
                                            className="btn btn-sm btn-primary py-0 px-2 border-0"
                                            style={{ fontSize: '0.7rem', backgroundColor: '#01796F' }}
                                            onClick={() => handleCommentEditSubmit(post.id, comment.id)}
                                            disabled={!editingCommentText.trim() || editingCommentText.trim() === comment.content}
                                          >
                                            Save
                                          </button>
                                        </div>
                                      </div>
                                    ) : (
                                      <p className="mb-0 text-dark mt-1" style={{ fontSize: '0.82rem', lineHeight: '1.4' }}>{comment.content}</p>
                                    )}
                                    <div className="d-flex align-items-center gap-2 mt-1 text-muted" style={{ fontSize: '0.68rem' }}>
                                      <span>{formatPostTime(comment.created_at)}</span>
                                      <span>•</span>
                                      <button
                                        type="button"
                                        className="btn btn-link p-0 border-0 text-decoration-none fw-semibold hover-text-primary bg-transparent"
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
                                        className="btn btn-link p-0 text-muted border-0 text-decoration-none fw-semibold hover-text-primary bg-transparent"
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
                                          src={getFullUrl(reply.author_avatar)}
                                          alt="reply avatar"
                                          className="rounded-circle border"
                                          style={{ width: '26px', height: '26px', objectFit: 'cover' }}
                                        />
                                        <div className="flex-grow-1">
                                          <div className="d-flex align-items-center justify-content-between flex-wrap gap-2">
                                            <div className="d-flex align-items-center gap-1.5 flex-wrap">
                                              <span className="fw-bold text-dark small" style={{ fontSize: '0.8rem' }}>{reply.author_name}</span>
                                              <span className={`role-badge mini ${getRoleBadgeClass(reply.user_role)}`} style={{ fontSize: '0.55rem', padding: '1px 5px' }}>
                                                {reply.user_role?.toLowerCase() === 'candidate' ? 'Candidate' : 'Employer'}
                                              </span>
                                            </div>
                                            <div className="d-flex align-items-center gap-2">
                                              {reply.user_id === currentUserId && (
                                                <button
                                                  type="button"
                                                  className="btn btn-link text-muted p-0 hover-primary border-0 bg-transparent"
                                                  title="Edit comment"
                                                  onClick={() => {
                                                    setEditingCommentId(reply.id);
                                                    setEditingCommentText(reply.content);
                                                  }}
                                                >
                                                  <i className="fas fa-pencil-alt" style={{ fontSize: '0.65rem' }}></i>
                                                </button>
                                              )}
                                              {((reply.user_id === currentUserId) || currentUserRole === 'Admin') && (
                                                <button
                                                  type="button"
                                                  className="btn btn-link text-muted p-0 hover-danger border-0 bg-transparent"
                                                  title="Delete comment"
                                                  onClick={() => handleCommentDelete(post.id, reply.id)}
                                                >
                                                  <i className="far fa-trash-alt" style={{ fontSize: '0.65rem' }}></i>
                                                </button>
                                              )}
                                            </div>
                                          </div>
                                          {editingCommentId === reply.id ? (
                                            <div className="mt-1 d-flex flex-column gap-1.5">
                                              <input
                                                type="text"
                                                className="form-control form-control-sm"
                                                value={editingCommentText}
                                                onChange={(e) => setEditingCommentText(e.target.value)}
                                                autoFocus
                                              />
                                              <div className="d-flex gap-2 justify-content-end mt-1">
                                                <button 
                                                  type="button" 
                                                  className="btn btn-sm btn-light border py-0 px-2"
                                                  style={{ fontSize: '0.65rem' }}
                                                  onClick={() => setEditingCommentId(null)}
                                                >
                                                  Cancel
                                                </button>
                                                <button 
                                                  type="button" 
                                                  className="btn btn-sm btn-primary py-0 px-2 border-0"
                                                  style={{ fontSize: '0.65rem', backgroundColor: '#01796F' }}
                                                  onClick={() => handleCommentEditSubmit(post.id, reply.id)}
                                                  disabled={!editingCommentText.trim() || editingCommentText.trim() === reply.content}
                                                >
                                                  Save
                                                </button>
                                              </div>
                                            </div>
                                          ) : (
                                            <p className="mb-0 text-dark mt-0.5" style={{ fontSize: '0.8rem', lineHeight: '1.4' }}>{reply.content}</p>
                                          )}
                                          <div className="d-flex align-items-center gap-2 mt-1 text-muted" style={{ fontSize: '0.65rem' }}>
                                            <span>{formatPostTime(reply.created_at)}</span>
                                            <span>•</span>
                                            <button
                                              type="button"
                                              className="btn btn-link p-0 border-0 text-decoration-none fw-semibold hover-text-primary bg-transparent"
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
                                              className="btn btn-link p-0 text-muted border-0 text-decoration-none fw-semibold hover-text-primary bg-transparent"
                                              style={{ fontSize: '0.65rem', boxShadow: 'none' }}
                                              onClick={() => {
                                                setActiveReplyFormCommentId(comment.id);
                                                setNewReplyText(prev => ({
                                                  ...prev,
                                                  [comment.id]: `@${reply.author_name} `
                                                }));
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
                                      className="btn btn-sm btn-primary rounded-pill px-3 fw-bold border-0"
                                      style={{ fontSize: '0.75rem', backgroundColor: '#01796F' }}
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
              ))
            )}
          </div>
        </div>

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
      {/* Repost/Share Modal */}
      {repostTargetPost && (
        <div className="profile-modal-overlay" style={{ zIndex: 100005 }} onClick={() => setRepostTargetPost(null)}>
          <div className="profile-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="profile-modal-header">
              <h5 className="profile-modal-title"><i className="fas fa-retweet text-primary me-2"></i>Repost to Community</h5>
              <button type="button" className="profile-modal-close-btn" onClick={() => setRepostTargetPost(null)}>&times;</button>
            </div>
            <form onSubmit={handleRepostSubmit}>
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
                      src={getFullUrl(repostTargetPost.avatar)}
                      alt="parent avatar"
                      className="rounded-circle"
                      style={{ width: '28px', height: '28px', objectFit: 'cover' }}
                    />
                    <div>
                      <span className="fw-bold text-dark small d-block">{repostTargetPost.author}</span>
                      <span className="text-muted" style={{ fontSize: '0.62rem' }}>
                        Member
                      </span>
                    </div>
                  </div>
                  {repostTargetPost.content && (
                    <p className="text-secondary small mb-0 text-truncate" style={{ maxHeight: '60px' }}>
                      {repostTargetPost.content}
                    </p>
                  )}
                  {repostTargetPost.mediaList && repostTargetPost.mediaList.length > 0 && (
                    <span className="text-primary small d-block mt-1">
                      <i className={repostTargetPost.mediaList[0].media_type === 'image' ? 'far fa-image' : 'far fa-play-circle'}></i> Attachment included
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
                  src={getFullUrl(editingPost.avatar)}
                  alt="User avatar"
                  className="rounded-circle border"
                  style={{ width: '48px', height: '48px', objectFit: 'cover' }}
                />
                <div>
                  <h6 className="fw-bold mb-0 text-dark" style={{ fontSize: '0.95rem' }}>{editingPost.author}</h6>
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
};

export default CandidatePosts;
