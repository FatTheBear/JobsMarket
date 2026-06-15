import React, { useState } from 'react';
import { Plus, Eye, Trash2, Edit } from 'lucide-react';


const AdminNews = ({
  newsList,
  onRefresh,
  onCreate,
  onEdit,
  onDelete
}) => {
  const [search, setSearch] = useState('');
  const handleDelete = (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this article?");

    if (confirmDelete) {
      onDelete(id);
    }
  };
  const filteredNews = (newsList || []).filter((item) =>
    item.title?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px'
        }}
      >
        <h1 className="admin-title">
          News & Articles Management
        </h1>

        <div style={{ marginBottom: '16px' }}>
          <input
            type="text"
            placeholder="Search article..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: '320px',
              padding: '10px 14px',
              borderRadius: '8px',
              border: '1px solid #334155',
              background: '#0f172a',
              color: '#fff'
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            className="admin-btn-primary"
            style={{ background: '#059669' }}
            onClick={onRefresh}
          >
            Refresh
          </button>

          <button
            className="admin-btn-primary"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
            onClick={onCreate}
          >
            <Plus size={18} />
            Create Article
          </button>
        </div>
      </div>

      <div className="table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th style={{ width: '60px' }}>ID</th>
              <th>Thumbnail</th>
              <th>Title</th>
              <th>Category</th>
              <th style={{ width: '120px' }}>Views</th>
              <th style={{ width: '140px' }}>Status</th>
              <th>Featured</th>
              <th>Published</th>
              <th>Created</th>
              <th
                style={{
                  width: '150px',
                  textAlign: 'center'
                }}
              >
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {filteredNews.length > 0 ? (
              filteredNews.map((news) => (
                <tr key={news.id}>
                  <td>#{news.id}</td>

                  <td>
                    <img
                      src={
                        news.thumbnail_url
                          ? (news.thumbnail_url.startsWith("http")
                            ? news.thumbnail_url
                            : `http://localhost:5000${news.thumbnail_url}`)
                          : "https://picsum.photos/80/50"
                      }
                      alt="thumb"
                      style={{
                        width: "200px",
                        height: "130px",
                        objectFit: "cover",
                        borderRadius: "6px"
                      }}
                    />
                  </td>

                  <td>
                    <div
                      style={{
                        fontWeight: '600',
                        color: '#fff',
                        maxWidth: '250px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {news.title}
                    </div>

                    {news.slug && (
                      <div
                        style={{
                          fontSize: '12px',
                          color: '#64748b'
                        }}
                      >
                        /{news.slug}
                      </div>
                    )}
                  </td>

                  <td>
                    <span style={{ color: '#38bdf8' }}>
                      {news.category_name || 'General'}
                    </span>
                  </td>

                  <td>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <Eye
                        size={14}
                        color="#94a3b8"
                      />

                      {news.view_count || 0}
                    </div>
                  </td>

                  <td>
                    <span
                      className={`status-badge ${(news.status || 'Draft').toLowerCase()}`}
                    >
                      {news.status || 'Draft'}
                    </span>
                  </td>


                  <td>
                    {news.is_featured ? (
                      <span className="status-badge approved">
                        Featured
                      </span>
                    ) : (
                      "-"
                    )}
                  </td>

                  <td>
                    {news.published_at
                      ? new Date(news.published_at).toLocaleDateString()
                      : "-"}
                  </td>


                  <td>
                    {new Date(news.created_at).toLocaleDateString()}
                  </td>
                  <td>
                    <div
                      style={{
                        display: 'flex',
                        gap: '12px',
                        justifyContent: 'center'
                      }}
                    >
                      <button
                        className="action-btn edit"
                        onClick={() => onEdit(news)}
                      >
                        <Edit size={16} />
                        Edit
                      </button>

                      <button
                        className="action-btn delete"
                        onClick={() => handleDelete(news.id)}
                      >
                        <Trash2 size={16} />
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="10"
                  style={{
                    textAlign: 'center',
                    padding: '32px',
                    color: '#94a3b8'
                  }}
                >
                  No articles found.
                  Start creating your first post!
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminNews;