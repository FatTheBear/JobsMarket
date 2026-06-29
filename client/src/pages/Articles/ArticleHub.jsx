import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './ArticleHub.css';

const API_URL = 'http://localhost:5000';

function formatDate(dateStr) {
  if (!dateStr) return '';
  return new Date(String(dateStr).replace(' ', 'T')).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function resolveImage(url, fallbackSeed) {
  if (url) {
    return url.startsWith('http') ? url : `${API_URL}${url}`;
  }
  return `https://picsum.photos/seed/${fallbackSeed}/800/450`;
}

export default function ArticleHub({ title, subtitle, category }) {
  const navigate = useNavigate();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams();
    if (category) params.set('category', category);

    fetch(`${API_URL}/api/public/news?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => setArticles(Array.isArray(data) ? data : []))
      .catch((err) => console.error('Failed to load articles:', err))
      .finally(() => setLoading(false));
  }, [category]);

  const featured = articles.find((a) => a.is_featured) || articles[0];
  const sideArticles = articles.filter((a) => a.id !== featured?.id).slice(0, 3);
  const restArticles = articles.filter(
    (a) => a.id !== featured?.id && !sideArticles.some((s) => s.id === a.id)
  );

  const openArticle = (id) => navigate(`/news-detail/${id}`);

  if (loading) {
    return <div className="article-hub"><p className="article-hub-empty">Loading articles...</p></div>;
  }

  if (!articles.length) {
    return (
      <div className="article-hub">
        <div className="article-hub-hero">
          <h1>{title}</h1>
          <p>{subtitle}</p>
        </div>
        <p className="article-hub-empty">No articles published yet. Run <code>node seed.js</code> on the server.</p>
      </div>
    );
  }

  return (
    <div className="article-hub">
      <div className="article-hub-hero">
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </div>

      {featured && (
        <div className="article-hub-featured">
          <div className="article-hub-featured-card" onClick={() => openArticle(featured.id)}>
            <img src={resolveImage(featured.thumbnail_url, featured.slug)} alt={featured.title} />
            <div className="article-hub-featured-body">
              <span className="article-category">{featured.category_name || category}</span>
              <h2>{featured.title}</h2>
              <p className="article-excerpt">{featured.short_description}</p>
              <span className="article-meta">{formatDate(featured.published_at || featured.created_at)}</span>
            </div>
          </div>

          <div className="article-hub-side-list">
            {sideArticles.map((item) => (
              <div key={item.id} className="article-hub-side-item" onClick={() => openArticle(item.id)}>
                <img src={resolveImage(item.thumbnail_url, item.slug)} alt={item.title} />
                <div>
                  <span className="article-category">{item.category_name || category}</span>
                  <h4>{item.title}</h4>
                  <span className="article-meta">{formatDate(item.published_at || item.created_at)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {restArticles.length > 0 && (
        <div className="article-hub-grid">
          {restArticles.map((item) => (
            <div key={item.id} className="article-hub-card" onClick={() => openArticle(item.id)}>
              <img src={resolveImage(item.thumbnail_url, item.slug)} alt={item.title} />
              <div className="article-hub-card-body">
                <span className="article-category">{item.category_name || category}</span>
                <h3>{item.title}</h3>
                <p className="article-excerpt">{item.short_description}</p>
                <span className="article-meta">{formatDate(item.published_at || item.created_at)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
