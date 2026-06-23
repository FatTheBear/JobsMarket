import React from 'react';
import { useNavigate } from 'react-router-dom';
import PostCreator from '../../../components/Community/PostCreator';

export default function CreatePost() {
  const navigate = useNavigate();

  const handlePostCreated = () => {
    // Redirect to the community feed to let them see their new post
    navigate('/community');
  };

  return (
    <div className="container py-4" style={{ maxWidth: '750px', fontFamily: 'Outfit, sans-serif' }}>
      
      {/* Back button */}
      <button
        onClick={() => navigate('/company/dashboard')}
        className="btn btn-link text-secondary text-decoration-none d-inline-flex align-items-center gap-2 fw-semibold p-0 mb-4"
        style={{ fontSize: '0.9rem' }}
      >
        <i className="fas fa-chevron-left" style={{ fontSize: '0.75rem' }}></i> Back to Dashboard
      </button>

      {/* Header */}
      <div className="mb-4">
        <h3 className="fw-bold text-dark">
          <i className="fas fa-bullhorn text-primary me-2"></i>
          Create Community Post
        </h3>
        <p className="text-muted">Share updates, announcements, or company culture posts to engage with potential candidates.</p>
      </div>

      {/* Post Creator component */}
      <PostCreator
        onPostCreated={handlePostCreated}
        placeholder="Announce new job roles, share insights about your team culture or industry updates..."
      />

      {/* Tip Card */}
      <div className="card border-0 shadow-sm mt-3" style={{ borderRadius: '12px', background: '#f8fafc' }}>
        <div className="card-body p-4">
          <h6 className="fw-bold text-dark mb-2">💡 Tips for a Great Company Post:</h6>
          <ul className="text-muted small mb-0 ps-3 d-flex flex-column gap-2" style={{ lineHeight: '1.5' }}>
            <li>Include high-quality pictures of your office workspace or team gatherings to show company culture.</li>
            <li>Use friendly, professional and welcoming language.</li>
            <li>Highlight details about growth opportunities, learning curves, and benefits.</li>
            <li>You can embed short video clips to make your post more engaging for candidates.</li>
          </ul>
        </div>
      </div>

    </div>
  );
}
