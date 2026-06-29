import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import '../../Articles/ArticleDetail.css';

const API_URL = 'http://localhost:5000';

export default function NewsDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [news, setNews] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`${API_URL}/api/public/news/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error('Article not found');
        return res.json();
      })
      .then(setNews)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(String(dateStr).replace(' ', 'T')).toLocaleDateString('en-GB', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const handleBack = () => {
    if (news?.category_name === 'Hiring Insights') {
      navigate('/company/hiring-insights');
    } else if (news?.category_name === 'Career Guide') {
      navigate('/guide');
    } else {
      navigate(-1);
    }
  };

  if (loading) {
    return <div className="article-detail-loading">Loading article...</div>;
  }

  if (!news || news.message) {
    return (
      <div className="article-detail">
        <button type="button" className="article-detail-back" onClick={() => navigate(-1)}>← Back</button>
        <p>Article not found or not published yet.</p>
      </div>
    );
  }

  const imageSrc = news.thumbnail_url
    ? (news.thumbnail_url.startsWith('http') ? news.thumbnail_url : `${API_URL}${news.thumbnail_url}`)
    : `https://picsum.photos/seed/${news.slug}/900/500`;

  return (
    <article className="article-detail">
      <button type="button" className="article-detail-back" onClick={handleBack}>
        ← Back to {news.category_name || 'articles'}
      </button>

      <header className="article-detail-header">
        <span className="article-category">{news.category_name || 'Article'}</span>
        <h1>{news.title}</h1>
        <div className="article-detail-meta">
          <span>{formatDate(news.published_at || news.created_at)}</span>
          <span>JobsMarket Editorial</span>
          {news.view_count != null && <span>{news.view_count} views</span>}
        </div>
      </header>

      <img
        src={imageSrc}
        alt={news.title}
        className="article-detail-hero-img"
        onError={(e) => {
          e.target.src = `https://picsum.photos/seed/${news.slug}/900/500`;
        }}
      />

      {news.short_description && (
        <p className="article-lead" style={{ fontSize: '1.2rem', color: '#475569', lineHeight: 1.7, marginBottom: 28 }}>
          {news.short_description}
        </p>
      )}

      <div
        className="article-detail-content"
        dangerouslySetInnerHTML={{ __html: news.content || '<p>No content available.</p>' }}
      />
    </article>
  );
}
