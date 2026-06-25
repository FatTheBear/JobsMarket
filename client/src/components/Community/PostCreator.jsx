import React, { useState, useRef } from 'react';
import axios from 'axios';

export default function PostCreator({ onPostCreated, placeholder = "Share something with the community..." }) {
  const [content, setContent] = useState('');
  const [mediaAttachments, setMediaAttachments] = useState([]); // [{ file, previewUrl, type }]
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const fileInputRef = useRef(null);

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
      clearAllMedia();

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
    <div className="card border-0 shadow-sm mb-4" style={{ borderRadius: '12px' }}>
      <div className="card-body p-4">
        <form onSubmit={handleSubmit}>
          {error && (
            <div className="alert alert-danger py-2 px-3 mb-3 small border-0 shadow-sm" role="alert">
              <i className="fas fa-exclamation-triangle me-1.5"></i> {error}
            </div>
          )}

          <div className="d-flex gap-3 align-items-start mb-3">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={placeholder}
              rows="3"
              className="form-control border-0 bg-light p-3"
              style={{
                borderRadius: '10px',
                resize: 'none',
                fontSize: '0.95rem',
                lineHeight: '1.5',
                outline: 'none',
                boxShadow: 'none'
              }}
            />
          </div>

          {/* Media Preview Block (Multiple grid) */}
          {mediaAttachments.length > 0 && (
            <div className="d-flex flex-wrap gap-2 mb-3">
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

          <div className="d-flex align-items-center justify-content-between border-top pt-3">
            <div className="d-flex gap-2">
              {/* Image/video attachment button */}
              <button
                type="button"
                onClick={() => fileInputRef.current.click()}
                className="btn btn-sm btn-light border d-inline-flex align-items-center gap-1.5 px-3 py-2 fw-semibold text-secondary"
                style={{ borderRadius: '8px', fontSize: '0.85rem' }}
                title="Attach photos or videos"
              >
                <i className="far fa-images text-success fs-5"></i>
                Photo / Video
              </button>

              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*,video/*"
                multiple
                className="d-none"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting || (!content.trim() && mediaAttachments.length === 0)}
              className="btn btn-primary btn-sm px-4 py-2 fw-bold d-inline-flex align-items-center gap-2"
              style={{
                borderRadius: '8px',
                fontSize: '0.85rem',
                backgroundColor: '#01796F',
                borderColor: '#01796F'
              }}
            >
              {isSubmitting ? (
                <>
                  <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                  Posting...
                </>
              ) : (
                <>
                  <i className="fas fa-paper-plane"></i>
                  Post
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
