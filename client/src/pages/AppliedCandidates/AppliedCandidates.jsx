import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ModalContext } from '../Admin/ModalProvider';
import './AppliedCandidates.css';
import CustomDatePicker from '../../components/CustomDatePicker';

const getAvatarSrc = (avatar, apiUrl) => {
  if (!avatar) return '/default-avatar.png';
  if (avatar.startsWith('http') || avatar.startsWith('data:image')) return avatar;
  return `${apiUrl}/${avatar.replace(/^\//, '')}`;
};

export default function AppliedCandidates() {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const { showConfirm } = useContext(ModalContext);
  const [isInterviewModalOpen, setIsInterviewModalOpen] = useState(false);
  const [selectedCandidateId, setSelectedCandidateId] = useState(null);
  const [interviewDate, setInterviewDate] = useState('');
  const [interviewTime, setInterviewTime] = useState('');
  const API_URL = 'http://localhost:5000';

  useEffect(() => {
    fetchCandidates();
  }, []);

  const fetchCandidates = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/api/company/applications`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCandidates(response.data);
    } catch (err) {
      console.error("Failed to load candidates", err);
    } finally {
      setLoading(false);
    }
  };

  const onStatusChange = (applicationId, newStatus) => {
    if (newStatus === 'Interviewing') {
      setSelectedCandidateId(applicationId);
      setIsInterviewModalOpen(true);
    } else {
      handleUpdateStatus(applicationId, newStatus);
    }
  };

  const confirmInterviewSetup = () => {
    if (!interviewDate || !interviewTime) {
      alert("Please enter both interview date and time!");
      return;
    }
    
    handleUpdateStatus(selectedCandidateId, 'Interviewing', interviewDate, interviewTime);
    
    setIsInterviewModalOpen(false);
    setInterviewDate('');
    setInterviewTime('');
  };

  const handleUpdateStatus = async (applicationId, newStatus, date = null, time = null) => {
    if (newStatus !== 'Interviewing') {
      const isConfirmed = await showConfirm(`Are you sure you want to change status to ${newStatus}?`);
      if (!isConfirmed) return;
    }

    try {
      const token = localStorage.getItem('token');
      const payload = { status: newStatus };
      
      if (date && time) {
        payload.interviewDate = date;
        payload.interviewTime = time;
      }

      await axios.patch(`${API_URL}/api/company/applications/${applicationId}/status`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setCandidates(prev => prev.map(c =>
        c.application_id === applicationId ? { ...c, status: newStatus } : c
      ));
    } catch (err) {
      alert("Update failed.");
    }
  };

  const filteredCandidates = candidates.filter(c => {
    const matchesTab = activeTab === 'All' || c.status === activeTab;
    const matchesSearch = c.candidate_name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  if (loading) return <div className="p-5 text-center" style={{ color: '#01796F' }}>Loading candidates...</div>;

  return (
    <div className="applied-container">
      <h3 className="page-title">Applied Candidates</h3>

      <div className="filter-bar">
        <input
          placeholder="Search by candidate name..."
          className="search-input"
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <div className="tabs">
          {['All', 'Reviewing', 'Interviewing', 'Rejected'].map(tab => (
            <button
              key={tab}
              className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab === 'Reviewing' ? 'In-Review' : tab}
            </button>
          ))}
        </div>
      </div>

      <div className="table-wrapper">
        <table className="custom-table">
          <thead>
            <tr>
              <th>Candidate Name</th>
              <th>Applied Role</th>
              <th>Employment Type</th>
              <th>Applied Date</th>
              <th>Skills</th>
              <th className="text-center">Attachment</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredCandidates.length === 0 ? (
              <tr>
                <td colSpan="7" className="text-center py-4 text-muted">No applications found.</td>
              </tr>
            ) : (
              filteredCandidates.map((cand) => (
                <tr key={cand.application_id} onClick={() => navigate(`/candidate-detail/${cand.candidate_id}`)}>
                  <td onClick={(e) => e.stopPropagation()}>
                    <div className="d-flex align-items-center gap-3">
                      <Link to={`/candidate/${cand.candidate_id}`}>
                        <img
                          src={getAvatarSrc(cand.candidate_avatar, API_URL)}
                          alt="avatar"
                          className="rounded-circle object-fit-cover avatar-border flex-shrink-0"
                          onError={(e) => { e.target.onerror = null; e.target.src = '/default-avatar.png'; }}
                        />
                      </Link>
                      <Link to={`/candidate/${cand.candidate_id}`} className="fw-semibold text-decoration-none" style={{ color: '#01796F' }}>
                        {cand.candidate_name}
                      </Link>
                    </div>
                  </td>

                  <td>
                    <div className="fw-semibold text-dark">{cand.applied_job}</div>
                  </td>

                  <td>
                    <span className="text-muted fw-medium">{cand.employment_type}</span>
                  </td>

                  <td className="text-muted">{new Date(cand.applied_at).toLocaleDateString('en-US')}</td>

                  <td>
                    <div className="text-truncate text-muted" style={{ maxWidth: '200px' }} title={cand.skills}>
                      {cand.skills || 'No skills listed'}
                    </div>
                  </td>

                  <td className="text-center" onClick={(e) => e.stopPropagation()}>
                    <a
                      href={`${API_URL}${cand.cv_url}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-sm btn-theme-outline rounded-pill px-3 fw-medium"
                    >
                      <i className="far fa-file-pdf me-1"></i> View CV
                    </a>
                  </td>

                  <td onClick={(e) => e.stopPropagation()}>
                    <select
                      className={`custom-status-select status-${cand.status}`}
                      value={cand.status}
                      onChange={(e) => onStatusChange(cand.application_id, e.target.value)}
                    >
                      <option value="Reviewing" className="opt-review">In-Review</option>
                      <option value="Interviewing" className="opt-interview">Interviewing</option>
                      <option value="Rejected" className="opt-rejected">Rejected</option>
                    </select>
                  </td>

                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {isInterviewModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '10px', width: '400px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ marginTop: 0, color: '#01796F', marginBottom: '20px' }}>Set Interview Schedule</h3>
            
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Interview Date:</label>
              <CustomDatePicker 
                selectedDate={interviewDate}
                onChange={(date) => setInterviewDate(date)}
                placeholder="Select interview date"
              />
            </div>

            <div style={{ marginBottom: '25px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Interview Time:</label>
              <input 
                type="time" 
                value={interviewTime}
                onChange={(e) => setInterviewTime(e.target.value)}
                style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc', boxSizing: 'border-box' }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button 
                onClick={() => setIsInterviewModalOpen(false)}
                style={{ padding: '10px 20px', border: '1px solid #ccc', backgroundColor: '#f9fafb', borderRadius: '5px', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button 
                onClick={confirmInterviewSetup}
                style={{ padding: '10px 20px', border: 'none', backgroundColor: '#01796F', color: 'white', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}
              >
                Confirm & Send Email
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}