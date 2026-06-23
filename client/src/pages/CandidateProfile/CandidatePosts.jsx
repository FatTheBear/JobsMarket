import React, { useState, useEffect } from 'react';

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

const CandidatePosts = ({ candidatePosts }) => {
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

  return (
    <div className="col-12 mb-4">
      <div className="card border-0 shadow-sm analytics-card">
        <div className="card-body p-4">
          <div className="d-flex align-items-center justify-content-between mb-4 border-bottom pb-2">
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
                <div key={post.id} className="p-3.5 rounded border bg-light">
                  <div className="d-flex align-items-center gap-3 mb-3">
                    <img
                      src={post.avatar}
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

                  {post.content && (
                    <div className="post-text text-dark mb-3" style={{ fontSize: '0.92rem', lineHeight: '1.6', whiteSpace: 'pre-line' }}>
                      {post.content}
                    </div>
                  )}

                  {/* Post Media Attachment Grid */}
                  <MediaGrid 
                    mediaList={post.mediaList} 
                    onMediaClick={(idx) => { setLightboxMedia(post.mediaList); setLightboxIndex(idx); }} 
                  />

                  <div className="d-flex align-items-center justify-content-between border-top pt-3 text-muted small">
                    <div className="d-flex align-items-center gap-4">
                      <span className="d-inline-flex align-items-center gap-1.5 hover-text-primary cursor-pointer transition-all">
                        <i className="far fa-thumbs-up fs-6"></i>
                        <span className="fw-semibold">{post.likes} Likes</span>
                      </span>
                      <span className="d-inline-flex align-items-center gap-1.5 hover-text-primary cursor-pointer transition-all">
                        <i className="far fa-comment-dots fs-6"></i>
                        <span className="fw-semibold">{post.comments} Comments</span>
                      </span>
                    </div>
                    <span className="d-inline-flex align-items-center gap-1.5 hover-text-primary cursor-pointer transition-all">
                      <i className="far fa-share-square fs-6"></i>
                      <span className="fw-semibold">{post.shares} Shares</span>
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
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
    </div>
  );
};

export default CandidatePosts;
