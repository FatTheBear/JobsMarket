import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './SavedCandidates.css';

const API_URL = 'http://localhost:5000';

export default function SavedCandidates() {
  const [savedCandidates, setSavedCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCandidate, setSelectedCandidate] = useState(null);

  useEffect(() => {
    fetchSavedCandidates();
  }, []);

  const fetchSavedCandidates = async () => {
    try {
      const currentUserId = localStorage.getItem('userId');
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_URL}/api/company/${currentUserId}/saved-candidates`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSavedCandidates(res.data);
    } catch (error) {
      console.error("Error fetching saved candidates:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUnsave = async (candidateId, e) => {
    e.stopPropagation();
    if (!window.confirm("Bạn có chắc muốn bỏ lưu ứng viên này?")) return;
    try {
      const currentUserId = localStorage.getItem('userId');
      const token = localStorage.getItem('token');
      await axios.post(`${API_URL}/api/company/${currentUserId}/saved-candidates/${candidateId}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSavedCandidates(prev => prev.filter(c => c.candidate_id !== candidateId));
    } catch (error) {
      console.error("Error unsaving candidate:", error);
      alert("Failed to unsave candidate");
    }
  };

  const openProfile = (candidate) => setSelectedCandidate(candidate);
  const closeProfile = () => setSelectedCandidate(null);

  if (loading) return <div style={{ padding: '50px', textAlign: 'center' }}>Loading saved candidates...</div>;

  return (
    <div className="sc-container">
      <div className="sc-header">
        <div className="sc-breadcrumb">Dashboard / Saved Candidates</div>
        <h2 className="sc-title">Saved Candidates</h2>
      </div>

      <div className="sc-card sc-table-card">
        <div className="sc-table-wrapper">
          <table className="sc-data-table">
            <thead>
              <tr>
                <th>CANDIDATE</th>
                <th>HEADLINE</th>
                <th>SAVED DATE</th>
                <th>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {savedCandidates.length > 0 ? (
                savedCandidates.map((candidate) => (
                  <tr key={candidate.candidate_id} className="sc-data-row" onClick={() => openProfile(candidate)}>
                    <td>
                      <div className="sc-candidate-info">
                        <img 
                          src={candidate.avatar_url || 'https://via.placeholder.com/40'} 
                          alt="avatar" 
                          className="sc-avatar"
                        />
                        <div>
                          <div className="sc-candidate-name">{candidate.full_name}</div>
                          <div className="sc-candidate-meta">
                            {candidate.phone} • {candidate.years_of_experience ? `${candidate.years_of_experience} yrs exp` : 'No exp data'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="sc-headline">{candidate.headline || 'No headline provided'}</div>
                      <div className="sc-candidate-meta">{candidate.skills}</div>
                    </td>
                    <td>{new Date(candidate.saved_at).toLocaleDateString('vi-VN')}</td>
                    <td>
                      <button 
                        className="sc-btn-unsave"
                        onClick={(e) => handleUnsave(candidate.candidate_id, e)}
                        title="Bỏ lưu"
                      >
                        Bỏ lưu
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="sc-table-empty">
                    Chưa có ứng viên nào được lưu.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL PROFILE */}
      {selectedCandidate && (
        <div className="sc-modal-overlay" onClick={closeProfile}>
          <div className="sc-modal" onClick={(e) => e.stopPropagation()}>
            <div className="sc-modal-header">
              <div>
                <div className="sc-modal-title">{selectedCandidate.full_name}</div>
                <div className="sc-modal-subtitle">{selectedCandidate.headline}</div>
              </div>
              <button className="sc-close-btn" onClick={closeProfile}>×</button>
            </div>
            <div className="sc-modal-body">
              <div className="sc-modal-section">
                <h3>Contact Info</h3>
                <p>Phone: {selectedCandidate.phone}</p>
              </div>
              <div className="sc-modal-section">
                <h3>Candidate Profile</h3>
                <p>Skills: {selectedCandidate.skills || 'N/A'}</p>
                <p>Experience: {selectedCandidate.years_of_experience || 0} years</p>
                <p>Saved on: {new Date(selectedCandidate.saved_at).toLocaleString('vi-VN')}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
