import React from 'react';
import { useOutletContext } from 'react-router-dom';

const CandidateRecentPosts = () => {
  const { candidatePosts = [] } = useOutletContext();

  return (
    <div className="card border-0 shadow-sm animate-fade-in">
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
          {candidatePosts.length === 0 ? (
            <div className="text-center py-5 text-muted small border rounded bg-light">
              <i className="fas fa-paper-plane fs-3 mb-2 text-muted opacity-50"></i>
              <p className="mb-0">No posts shared yet.</p>
            </div>
          ) : (
            candidatePosts.map((post) => (
              <div key={post.id} className="p-3 rounded candidate-post-card bg-light">
                <div className="d-flex align-items-center gap-3 mb-3">
                  <img
                    src={post.avatar}
                    alt="author avatar"
                    className="rounded-circle shadow-sm border"
                    style={{ width: '48px', height: '48px' }}
                  />
                  <div>
                    <h6 className="fw-bold mb-0 text-dark" style={{ fontSize: '0.95rem' }}>{post.author}</h6>
                    <p className="mb-0 text-muted small fw-medium">
                      Full Stack Developer • {post.time} <i className="fas fa-globe-asia ms-1"></i>
                    </p>
                  </div>
                </div>

                <div className="post-text text-dark mb-3" style={{ fontSize: '0.92rem', lineHeight: '1.6', whiteSpace: 'pre-line' }}>
                  {post.content}
                </div>

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
  );
};

export default CandidateRecentPosts;
