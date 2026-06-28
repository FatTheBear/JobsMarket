import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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

export default function PostCreator({ onPostCreated, placeholder = "Start a post...", onAuthRequired }) {
  const navigate = useNavigate();
  const [content, setContent] = useState('');
  const [mediaAttachments, setMediaAttachments] = useState([]); // [{ file, previewUrl, type }]
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [visibility, setVisibility] = useState('public');
  const [isRichText, setIsRichText] = useState(false);

  const fileInputRef = useRef(null);

  const isLoggedIn = !!localStorage.getItem('token');
  const [userAvatar, setUserAvatar] = useState('/img/default-avatar.png');

  const [authorName, setAuthorName] = useState('Member');

  useEffect(() => {
    if (!isLoggedIn) return;
    
    const fetchUserAvatar = async () => {
      try {
        const token = localStorage.getItem('token');
        const userId = localStorage.getItem('userId');
        const userObj = JSON.parse(localStorage.getItem('user')) || null;
        const role = userObj?.role;
        
        let url = '';
        if (role === 'Candidate') {
          url = 'http://localhost:5000/api/candidate/profile';
        } else if (role === 'Company' || role === 'HR') {
          url = `http://localhost:5000/api/company/${userId}`;
        }
        
        if (url) {
          const res = await axios.get(url, {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          const name = res.data?.display_name || res.data?.full_name || res.data?.name || res.data?.companyName || 'Member';
          setAuthorName(name);
          
          let avatar = res.data?.avatar_url || res.data?.logo_url;
          if (avatar) {
            avatar = avatar.trim();
            if (!avatar.startsWith('http') && !avatar.startsWith('data:image')) {
              avatar = `http://localhost:5000${avatar.startsWith('/') ? '' : '/'}${avatar}`;
            }
            setUserAvatar(avatar);
            localStorage.setItem('avatarUrl', avatar);
          }
        }
      } catch (err) {
        console.error('Failed to fetch user avatar in PostCreator:', err);
      }
    };
    
    fetchUserAvatar();
  }, [isLoggedIn]);
  const userObj = JSON.parse(localStorage.getItem('user')) || null;

  const openPostModal = (mediaType = null) => {
    if (!isLoggedIn) {
      if (onAuthRequired) {
        onAuthRequired('Please log in to start your post!');
      } else {
        navigate('/login');
      }
      return;
    }
    if (mediaType === 'text') {
      setIsRichText(true);
    } else {
      setIsRichText(false);
    }
    setIsModalOpen(true);
    if (mediaType === 'video' || mediaType === 'image') {
      setTimeout(() => {
        if (fileInputRef.current) {
          fileInputRef.current.accept = mediaType === 'video' ? 'video/*' : 'image/*';
          fileInputRef.current.click();
        }
      }, 100);
    }
  };

  const closePostModal = () => {
    setIsModalOpen(false);
    setIsRichText(false);
    setContent('');
    clearAllMedia();
    setError('');
  };

  const handleFileChange = (e) => {
    setError('');
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    const allowedImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    const allowedVideoTypes = ['video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/x-matroska', 'video/webm'];

    const newAttachments = [];
    let fileError = '';

    if (mediaAttachments.length + files.length > 10) {
      setError('You can upload a maximum of 10 images or videos.');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

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
      setError(fileError);
    }

    if (newAttachments.length > 0) {
      setMediaAttachments(prev => [...prev, ...newAttachments]);
    }

    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeMedia = (index) => {
    setMediaAttachments(prev => {
      const updated = [...prev];
      URL.revokeObjectURL(updated[index].previewUrl);
      updated.splice(index, 1);
      return updated;
    });
  };

  const clearAllMedia = () => {
    mediaAttachments.forEach(att => {
      URL.revokeObjectURL(att.previewUrl);
    });
    setMediaAttachments([]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!content.trim() && mediaAttachments.length === 0) {
      setError('Please write some content or attach images/videos to post.');
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      setError('You must be logged in to share a post.');
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('content', content);
      formData.append('visibility', visibility);
      mediaAttachments.forEach(att => {
        formData.append('media', att.file);
      });

      const response = await axios.post('http://localhost:5000/api/posts', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      setContent('');
      setVisibility('public');
      clearAllMedia();
      setIsModalOpen(false);

      if (onPostCreated && typeof onPostCreated === 'function') {
        onPostCreated(response.data.post);
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to create post. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mb-4">
      {/* LinkedIn-style Collapsed Input Bar */}
      <div className="card border-0 shadow-sm p-3" style={{ borderRadius: '12px', backgroundColor: '#fff' }}>
        <div className="d-flex align-items-center gap-3 mb-2.5">
          <img
            src={userAvatar}
            alt="User avatar"
            className="rounded-circle border"
            style={{ width: '48px', height: '48px', objectFit: 'cover' }}
          />
          <button
            type="button"
            onClick={() => openPostModal()}
            className="flex-grow-1 text-start border px-4 py-2.5 text-muted hover-bg-light"
            style={{
              borderRadius: '35px',
              backgroundColor: '#f8fafc',
              borderColor: '#e2e8f0',
              fontSize: '0.92rem',
              fontWeight: '500',
              cursor: 'pointer',
              color: '#64748b',
              outline: 'none',
              transition: 'background-color 0.2s ease, border-color 0.2s ease'
            }}
          >
            Start a post
          </button>
        </div>
        
        <div className="d-flex align-items-center justify-content-around border-top pt-2" style={{ fontSize: '0.9rem', fontWeight: '600' }}>
          <button
            type="button"
            onClick={() => openPostModal('video')}
            className="btn btn-link text-decoration-none d-flex align-items-center gap-2 py-2 px-3 border-0 bg-transparent text-secondary hover-bg-light rounded"
            style={{ fontSize: '0.85rem', color: '#475569', boxShadow: 'none' }}
          >
            <i className="fas fa-video text-success" style={{ fontSize: '1.05rem' }}></i>
            <span style={{ color: '#475569' }}>Video</span>
          </button>
          
          <button
            type="button"
            onClick={() => openPostModal('image')}
            className="btn btn-link text-decoration-none d-flex align-items-center gap-2 py-2 px-3 border-0 bg-transparent text-secondary hover-bg-light rounded"
            style={{ fontSize: '0.85rem', color: '#475569', boxShadow: 'none' }}
          >
            <i className="fas fa-image text-primary" style={{ fontSize: '1.05rem' }}></i>
            <span style={{ color: '#475569' }}>Photo</span>
          </button>
          
          <button
            type="button"
            onClick={() => openPostModal('text')}
            className="btn btn-link text-decoration-none d-flex align-items-center gap-2 py-2 px-3 border-0 bg-transparent text-secondary hover-bg-light rounded"
            style={{ fontSize: '0.85rem', color: '#475569', boxShadow: 'none' }}
          >
            <i className="fas fa-newspaper" style={{ color: '#b45309', fontSize: '1.05rem' }}></i>
            <span style={{ color: '#475569' }}>Write article</span>
          </button>
        </div>
      </div>

      {/* Hidden File Input used inside the modal */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*,video/*"
        multiple
        className="d-none"
      />

      {/* Modern Post Modal Popup */}
      {isModalOpen && (
        <div className="modal-backdrop-custom" style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.6)',
          zIndex: 1050,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backdropFilter: 'blur(3px)',
          padding: '20px'
        }}>
          <div className="modal-content-custom" style={{
            backgroundColor: '#fff',
            borderRadius: '12px',
            width: '100%',
            maxWidth: '550px',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)',
            display: 'flex',
            flexDirection: 'column',
            maxHeight: '90vh',
            overflow: 'hidden'
          }}>
            {/* Modal Header */}
            <div className="d-flex align-items-center justify-content-between p-3.5 border-bottom" style={{ padding: '16px 20px' }}>
              <h5 className="fw-bold mb-0 text-dark" style={{ fontSize: '1.15rem' }}>Create post</h5>
              <button
                type="button"
                onClick={closePostModal}
                className="btn-close"
                style={{ cursor: 'pointer' }}
                aria-label="Close"
              ></button>
            </div>

            {/* Modal Body */}
            <div className="p-3.5" style={{ overflowY: 'auto', flexGrow: 1, padding: '20px' }}>
              <div className="d-flex align-items-center gap-2.5 mb-3">
                <img
                  src={userAvatar}
                  alt="User avatar"
                  className="rounded-circle border"
                  style={{ width: '48px', height: '48px', objectFit: 'cover' }}
                />
                <div>
                  <h6 className="fw-bold mb-0 text-dark" style={{ fontSize: '0.95rem' }}>{authorName}</h6>
                  <select
                    value={visibility}
                    onChange={(e) => setVisibility(e.target.value)}
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

              <form onSubmit={handleSubmit}>
                {error && (
                  <div className="alert alert-danger py-2 px-3 mb-3 small border-0" role="alert" style={{ borderRadius: '8px' }}>
                    <i className="fas fa-exclamation-triangle me-1.5"></i> {error}
                  </div>
                )}

                {isRichText ? (
                  <div className="mb-3 border rounded" style={{ minHeight: '220px', overflow: 'hidden' }}>
                    <ReactQuill
                      theme="snow"
                      value={content}
                      onChange={setContent}
                      placeholder={placeholder}
                      modules={quillModules}
                      formats={quillFormats}
                      style={{ height: '200px' }}
                    />
                  </div>
                ) : (
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder={placeholder}
                    rows="5"
                    className="form-control border-0 p-0 mb-3"
                    style={{
                      fontSize: '1rem',
                      lineHeight: '1.5',
                      outline: 'none',
                      boxShadow: 'none',
                      resize: 'none',
                      minHeight: '120px',
                      color: '#1e293b'
                    }}
                    autoFocus
                  />
                )}

                {/* Media Attachments Preview */}
                {mediaAttachments.length > 0 && (
                  <div className="d-flex flex-wrap gap-2 mb-3 border-top pt-3">
                    {mediaAttachments.map((att, idx) => (
                      <div key={idx} className="position-relative border rounded overflow-hidden bg-dark" style={{ width: '80px', height: '80px' }}>
                        <button
                          type="button"
                          onClick={() => removeMedia(idx)}
                          className="btn btn-danger btn-sm rounded-circle position-absolute top-0 end-0 p-0"
                          style={{
                            width: '18px',
                            height: '18px',
                            fontSize: '10px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            zIndex: 10,
                            opacity: 0.9,
                            marginTop: '2px',
                            marginRight: '2px'
                          }}
                          title="Remove item"
                        >
                          &times;
                        </button>
                        {att.type === 'image' ? (
                          <img
                            src={att.previewUrl}
                            alt="preview"
                            className="w-100 h-100"
                            style={{ objectFit: 'cover' }}
                          />
                        ) : (
                          <div className="w-100 h-100 position-relative d-flex align-items-center justify-content-center">
                            <video
                              src={att.previewUrl}
                              className="w-100 h-100"
                              style={{ objectFit: 'cover' }}
                            />
                            <i className="fas fa-play-circle text-white position-absolute fs-4 opacity-75"></i>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </form>
            </div>

            {/* Modal Footer */}
            <div className="d-flex align-items-center justify-content-between p-3.5 border-top bg-light" style={{ padding: '16px 20px' }}>
              <div className="d-flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    if (fileInputRef.current) {
                      fileInputRef.current.accept = "image/*,video/*";
                      fileInputRef.current.click();
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
                  onClick={closePostModal}
                  className="btn btn-sm btn-light border px-3 py-2 fw-semibold text-secondary"
                  style={{ borderRadius: '8px', fontSize: '0.85rem' }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isSubmitting || (!content.trim() && mediaAttachments.length === 0)}
                  className="btn btn-primary btn-sm px-4 py-2 fw-bold d-inline-flex align-items-center gap-2"
                  style={{
                    borderRadius: '8px',
                    fontSize: '0.85rem',
                    backgroundColor: '#01796F',
                    borderColor: '#01796F'
                  }}
                >
                  {isSubmitting ? 'Posting...' : 'Post'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
