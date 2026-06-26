import React from 'react';

const NewsDetailModal = ({ news, onClose }) => {
    return (
        <div className="modal-overlay" onClick={onClose}>
            <div
                className="modal-content"
                onClick={(e) => e.stopPropagation()}
                style={{
                    maxWidth: '700px',
                    maxHeight: '85vh',
                    overflowY: 'auto',
                    background: '#ffffff',
                    color: '#1e293b',
                    padding: '24px',
                    borderRadius: '12px'
                }}
            >
                <h2>{news.title}</h2>
                <p style={{ color: '#888', fontSize: '13px' }}>
                    /{news.slug} — {news.category_name || 'General'} — {news.status}
                </p>

                {news.thumbnail_url && (
                    <img
                        src={
                            news.thumbnail_url.startsWith("http")
                                ? news.thumbnail_url
                                : `http://localhost:5000${news.thumbnail_url}`
                        }
                        alt="thumbnail"
                        style={{ width: '100%', maxHeight: '300px', objectFit: 'cover', borderRadius: '8px', margin: '12px 0' }}
                    />
                )}

                <p><strong>Short description:</strong> {news.short_description}</p>

                <div
                    style={{ marginTop: '16px', lineHeight: '1.6' }}
                    dangerouslySetInnerHTML={{ __html: news.content }}
                />

                <button className="admin-btn-primary" onClick={onClose} style={{ marginTop: '20px' }}>
                    Close
                </button>
            </div>
        </div>
    );
};

export default NewsDetailModal;