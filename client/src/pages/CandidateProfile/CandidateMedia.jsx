import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function CandidateMedia() {
  const navigate = useNavigate();
  const [mediaList, setMediaList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'photos', 'videos'
  const [lightboxMedia, setLightboxMedia] = useState(null); // { url, type, postId }
  const [imageErrors, setImageErrors] = useState({});
  const [activePostDetail, setActivePostDetail] = useState(null);
  const [postComments, setPostComments] = useState([]);
  const [loadingComments, setLoadingComments] = useState(false);

  // States for post interaction inside modal
  const [newCommentText, setNewCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [showRepostModal, setShowRepostModal] = useState(false);
  const [repostContent, setRepostContent] = useState('');
  const [isReposting, setIsReposting] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editPostContent, setEditPostContent] = useState('');
  const [editPostVisibility, setEditPostVisibility] = useState('public');
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  const getFullUrl = (url) => {
    if (!url) return '';
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

      setMediaList(prev => prev.map(item => {
        if (item.postId === activePostDetail.id) {
          return {
            ...item,
            post: {
              ...item.post,
              is_liked: response.data.is_liked ? 1 : 0,
              likes_count: response.data.likes_count
            }
          };
        }
        return item;
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

      setMediaList(prev => prev.map(item => {
        if (item.postId === activePostDetail.id) {
          return {
            ...item,
            post: {
              ...item.post,
              comments_count: (item.post.comments_count || 0) + 1
            }
          };
        }
        return item;
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
      setMediaList(prev => prev.filter(item => item.postId !== activePostDetail.id));
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

      setMediaList(prev => prev.map(item => {
        if (item.postId === activePostDetail.id) {
          return {
            ...item,
            post: {
              ...item.post,
              content: editPostContent,
              visibility: editPostVisibility
            }
          };
        }
        return item;
      }));

      setShowEditModal(false);
    } catch (err) {
      console.error('Failed to update post:', err);
      alert('Failed to save changes. Please try again.');
    } finally {
      setIsSavingEdit(false);
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

  useEffect(() => {
    const fetchUserPosts = async () => {
      setLoading(true);
      setError('');
      try {
        const token = localStorage.getItem('token');
        const userId = localStorage.getItem('userId');
        if (!token || !userId) {
          setError('Authentication required. Please log in.');
          return;
        }

        const response = await axios.get(`http://localhost:5000/api/posts/user/${userId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        // Extract all media files from user posts
        const extracted = [];
        response.data.forEach(post => {
          if (post.mediaList && post.mediaList.length > 0) {
            post.mediaList.forEach(m => {
              extracted.push({
                url: m.media_url,
                type: m.media_type,
                postId: post.id,
                createdAt: post.created_at,
                post: post
              });
            });
          } else if (post.media_url) {
            extracted.push({
              url: post.media_url,
              type: post.media_type || 'image',
              postId: post.id,
              createdAt: post.created_at,
              post: post
            });
          }
        });

        // Sort by date descending
        extracted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setMediaList(extracted);
      } catch (err) {
        console.error('Failed to fetch user media:', err);
        setError('Failed to load your media. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchUserPosts();
  }, []);

  const filteredMedia = mediaList.filter(item => {
    if (activeTab === 'photos') return item.type === 'image';
    if (activeTab === 'videos') return item.type === 'video';
    return true;
  });

  return (
    <div className="card border-0 shadow-sm" style={{ borderRadius: '12px', backgroundColor: '#fff' }}>
      <div className="card-header bg-white p-4 border-bottom" style={{ borderRadius: '12px 12px 0 0' }}>
        <div className="d-flex align-items-center justify-content-between mb-3">
          <div>
            <h4 className="fw-bold mb-1 text-dark" style={{ fontFamily: 'Inter, sans-serif' }}>
              <i className="far fa-images text-primary me-2.5"></i> My Media Gallery
            </h4>
            <p className="text-muted small mb-0">Review all the photos and videos you have shared with the community.</p>
          </div>
        </div>

        {/* Tabs Filter */}
        <div className="d-flex gap-2">
          <button
            onClick={() => setActiveTab('all')}
            className={`btn btn-sm px-3.5 py-1.5 fw-semibold border-0 ${activeTab === 'all' ? 'bg-primary text-white' : 'btn-light text-secondary'}`}
            style={{ borderRadius: '8px', fontSize: '0.85rem', backgroundColor: activeTab === 'all' ? '#01796F' : undefined }}
          >
            All ({mediaList.length})
          </button>
          <button
            onClick={() => setActiveTab('photos')}
            className={`btn btn-sm px-3.5 py-1.5 fw-semibold border-0 ${activeTab === 'photos' ? 'bg-primary text-white' : 'btn-light text-secondary'}`}
            style={{ borderRadius: '8px', fontSize: '0.85rem', backgroundColor: activeTab === 'photos' ? '#01796F' : undefined }}
          >
            Photos ({mediaList.filter(m => m.type === 'image').length})
          </button>
          <button
            onClick={() => setActiveTab('videos')}
            className={`btn btn-sm px-3.5 py-1.5 fw-semibold border-0 ${activeTab === 'videos' ? 'bg-primary text-white' : 'btn-light text-secondary'}`}
            style={{ borderRadius: '8px', fontSize: '0.85rem', backgroundColor: activeTab === 'videos' ? '#01796F' : undefined }}
          >
            Videos ({mediaList.filter(m => m.type === 'video').length})
          </button>
        </div>
      </div>

      <div className="card-body p-4 scrollable-media-gallery" style={{ height: 'calc(70vh - 120px)', overflowY: 'auto' }}>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="text-muted mt-2">Loading your media files...</p>
        </div>
      ) : error ? (
        <div className="alert alert-danger text-center py-4 border-0" role="alert">
          <i className="fas fa-exclamation-circle fs-4 mb-2 text-danger"></i>
          <p className="mb-0">{error}</p>
        </div>
      ) : filteredMedia.length === 0 ? (
        <div className="text-center py-5 text-muted border rounded-3 bg-light" style={{ borderStyle: 'dashed' }}>
          <i className="far fa-image fs-1 mb-3 opacity-30"></i>
          <h6 className="fw-semibold">No media found</h6>
          <p className="small mb-0">Media you upload to community posts will appear here.</p>
        </div>
      ) : (
        /* Media Grid */
        <div className="d-flex flex-wrap gap-3">
          {filteredMedia.map((item, idx) => {
            const isImage = item.type === 'image';
            const mediaSrc = getFullUrl(item.url);
            const hasError = imageErrors[idx];

            return (
              <div
                key={idx}
                onClick={() => setLightboxMedia(item)}
                className="position-relative overflow-hidden border rounded-3 bg-light cursor-pointer hover-zoom-shadow"
                style={{ 
                  transition: 'transform 0.2s, box-shadow 0.2s', 
                  width: '150px',
                  height: '150px',
                  flexShrink: 0
                }}
              >
                {isImage && !hasError ? (
                  <img
                    src={mediaSrc}
                    alt={`media-${idx}`}
                    style={{ 
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%', 
                      height: '100%', 
                      objectFit: 'cover' 
                    }}
                    onError={() => setImageErrors(prev => ({ ...prev, [idx]: true }))}
                  />
                ) : isImage && hasError ? (
                  <div className="position-absolute top-0 start-0 w-100 h-100 d-flex flex-column align-items-center justify-content-center text-muted bg-light">
                    <i className="far fa-image fs-3 mb-1"></i>
                    <span style={{ fontSize: '0.7rem' }}>Failed to load</span>
                  </div>
                ) : (
                  <div className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center bg-black">
                    <video
                      src={mediaSrc}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      muted
                      playsInline
                    />
                    <i className="fas fa-play-circle text-white position-absolute fs-3 opacity-80 shadow-sm" style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}></i>
                  </div>
                )}
                {/* Hover Overlay using inline mouse events for total styling independence */}
                <div 
                  className="position-absolute top-0 start-0 w-100 h-100 transition" 
                  style={{ 
                    zIndex: 2, 
                    backgroundColor: 'rgba(0, 0, 0, 0)',
                    transition: 'background-color 0.2s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.15)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0)'}
                />
              </div>
            );
          })}
        </div>
      )}
      </div>

      {/* Lightbox Modal */}
      {lightboxMedia && (
        <div
          className="modal-backdrop-custom"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.85)',
            zIndex: 1060,
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
              maxWidth: '650px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              display: 'flex',
              flexDirection: 'column',
              maxHeight: '90vh',
              overflow: 'hidden'
            }}
          >
            {/* Header */}
            <div className="d-flex align-items-center justify-content-between p-3 border-bottom">
              <span className="fw-bold text-dark small">
                {lightboxMedia.type === 'image' ? '📷 Photo' : '🎥 Video'}
              </span>
              <button
                type="button"
                onClick={() => setLightboxMedia(null)}
                className="btn-close"
                style={{ cursor: 'pointer' }}
                aria-label="Close"
              ></button>
            </div>

            {/* Content Display */}
            <div className="d-flex align-items-center justify-content-center flex-grow-1 p-3" style={{ minHeight: '320px', maxHeight: '55vh', backgroundColor: '#0f172a' }}>
              {lightboxMedia.type === 'image' ? (
                <img
                  src={getFullUrl(lightboxMedia.url)}
                  alt="Lightbox view"
                  className="img-fluid rounded"
                  style={{ maxHeight: '50vh', objectFit: 'contain', boxShadow: '0 4px 20px rgba(0,0,0,0.35)' }}
                />
              ) : (
                <video
                  src={getFullUrl(lightboxMedia.url)}
                  className="w-100 rounded"
                  style={{ maxHeight: '50vh', objectFit: 'contain', boxShadow: '0 4px 20px rgba(0,0,0,0.35)' }}
                  controls
                  autoPlay
                />
              )}
            </div>

            {/* Footer options */}
            <div className="d-flex align-items-center justify-content-between border-top bg-light" style={{ padding: '16px 20px' }}>
              <span className="text-muted small">
                Posted on: {new Date(lightboxMedia.createdAt).toLocaleDateString()}
              </span>
              <button
                type="button"
                onClick={() => {
                  setLightboxMedia(null);
                  setActivePostDetail(lightboxMedia.post);
                }}
                className="btn btn-sm btn-primary px-3 fw-bold border-0 d-inline-flex align-items-center gap-1.5"
                style={{ backgroundColor: '#01796F', borderRadius: '8px' }}
              >
                <i className="fas fa-external-link-alt"></i> View Original Post
              </button>
            </div>
          </div>
        </div>
      )}

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

      {/* Share / Repost Modal inside Media */}
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

      {/* Edit Post Modal inside Media */}
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
}
