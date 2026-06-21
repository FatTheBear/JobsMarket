import React, { useState, useMemo } from 'react';
import './IndustrySelector.css';

export default function IndustrySelector({ industries = [], selectedIds = [], onToggle = () => {} }) {
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Featured industries to show first (top 5 most common)
  const featuredCount = 5;
  const featuredIndustries = industries.slice(0, featuredCount);
  
  // Filtered industries based on search
  const filteredIndustries = useMemo(() => {
    if (!searchTerm) return industries.filter(ind => !selectedIds.includes(ind.id));
    
    return industries.filter(ind => 
      !selectedIds.includes(ind.id) && 
      ind.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, industries, selectedIds]);

  const selectedIndustries = industries.filter(ind => selectedIds.includes(ind.id));

  return (
    <>
      <div className="is-field">
        <label>Industry <span>*</span></label>
        
        {/* Selected Tags */}
        <div className="is-selected-tags">
          {selectedIndustries.map(ind => (
            <span key={ind.id} className="is-tag-selected" onClick={() => onToggle(ind.id)}>
              {ind.name} ✕
            </span>
          ))}
        </div>

        {/* Featured Industries + Add Button */}
        <div className="is-featured-section">
          <label className="is-sub-label">Featured industries</label>
          <div className="is-featured-container">
            {featuredIndustries
              .filter(ind => !selectedIds.includes(ind.id))
              .map(ind => (
                <span 
                  key={ind.id} 
                  className="is-tag" 
                  onClick={() => onToggle(ind.id)}
                >
                  {ind.name} +
                </span>
              ))}
            <button 
              type="button" 
              className="is-btn-add"
              onClick={() => setShowModal(true)}
            >
              + More
            </button>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="is-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="is-modal-content" onClick={e => e.stopPropagation()}>
            <div className="is-modal-header">
              <h3>Select Industries</h3>
              <button 
                type="button" 
                className="is-modal-close"
                onClick={() => setShowModal(false)}
              >
                ✕
              </button>
            </div>

            <div className="is-modal-search">
              <input
                type="text"
                placeholder="Search industries... (e.g., 'data', 'finance')"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="is-search-input"
              />
            </div>

            <div className="is-modal-list">
              {filteredIndustries.length > 0 ? (
                filteredIndustries.map(ind => (
                  <div 
                    key={ind.id} 
                    className="is-list-item"
                    onClick={() => {
                      onToggle(ind.id);
                      // Keep modal open for multiple selections
                    }}
                  >
                    <span className="is-list-name">{ind.name}</span>
                    <span className="is-list-add">+</span>
                  </div>
                ))
              ) : (
                <div className="is-no-result">
                  No industries found for "{searchTerm}"
                </div>
              )}
            </div>

            <div className="is-modal-footer">
              <button 
                type="button" 
                className="is-btn-done"
                onClick={() => setShowModal(false)}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
