import React, { useState, useEffect } from 'react';
import axios from 'axios';
import JobCard from '../../../components/Jobs/JobCard';
import styles from './FindJob.module.css';

const API_URL = 'http://localhost:5000';

export default function FindJob() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [industries, setIndustries] = useState([]);
  const [tempCategories, setTempCategories] = useState([]);
  const [tempIndustries, setTempIndustries] = useState([]);
  const [selectedIndustries, setSelectedIndustries] = useState([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const catRes = await axios.get(`${API_URL}/api/industry/categories`);
        if (catRes.data && catRes.data.success) {
          setCategories(catRes.data.data);
        }
      } catch (error) {
        console.error(error);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchFilteredIndustries = async () => {
      if (tempCategories.length > 0) {
        try {
          const catIds = tempCategories.map(c => c.id).join(',');
          const indRes = await axios.get(`${API_URL}/api/industry?categoryIds=${catIds}`);
          const indData = indRes.data.data || indRes.data;
          
          if (indData) {
            setIndustries(indData);
            setTempIndustries(prev => 
              prev.filter(child => indData.some(ind => ind.id === child.id))
            );
          }
        } catch (error) {
          console.error(error);
        }
      } else {
        setIndustries([]);
        setTempIndustries([]);
      }
    };
    
    fetchFilteredIndustries();
  }, [tempCategories]);

  useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true);
      try {
        const industryIds = selectedIndustries.map(ind => ind.id).join(',');
        const url = industryIds 
          ? `${API_URL}/api/jobs?industries=${industryIds}`
          : `${API_URL}/api/jobs`;
          console.log("👉 URL FRONTEND THỰC SỰ GỬI ĐI:", url);
          
        const response = await axios.get(url);
        setJobs(response.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, [selectedIndustries]);

  const toggleCategory = (cat) => {
    setTempCategories(prev => 
      prev.some(c => c.id === cat.id) 
        ? prev.filter(c => c.id !== cat.id)
        : [...prev, cat]
    );
  };

  const toggleIndustry = (ind) => {
    setTempIndustries(prev => 
      prev.some(i => i.id === ind.id)
        ? prev.filter(i => i.id !== ind.id)
        : [...prev, ind]
    );
  };

  const handleSaveFilter = () => {
    if (tempIndustries.length > 0) {
      setSelectedIndustries(tempIndustries);
    } 
    else if (tempCategories.length > 0) {
      setSelectedIndustries(industries);
    } 
    else {
      setSelectedIndustries([]);
    }
    
    setIsDropdownOpen(false); 
  };

  const handleCancelFilter = () => {
    setTempCategories([]);
    setTempIndustries(selectedIndustries);
    setIsDropdownOpen(false);
  };

  return (
    <div className={styles.findJobWrapper}>
      <div className={styles.findJobContainer}>
        <div className={styles.findJobHeader}>
          
          <div className={styles.findJobFilters}>
            <div className={styles.filterDropdown}>
              <button 
                type="button"
                className={styles.dropdownToggleBtn}
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                <span className={styles.dropdownLabel}>
                  {selectedIndustries.length > 0 
                    ? `Industries (${selectedIndustries.length})` 
                    : 'All Industries'}
                </span>
                <span className={styles.dropdownCaret}>▼</span>
              </button>

              {isDropdownOpen && (
                <div className={styles.dropdownMenu}>
                  <div className={styles.dropdownBody}>
                    <div className={styles.paneLeft}>
                      <h4>Categories</h4>
                      {categories.map(cat => (
                        <label key={cat.id} className={styles.checkRow}>
                          <input
                            type="checkbox"
                            checked={tempCategories.some(c => c.id === cat.id)}
                            onChange={() => toggleCategory(cat)}
                          />
                          {cat.name}
                        </label>
                      ))}
                    </div>
                    
                    <div className={styles.paneRight}>
                      <h4>Industries</h4>
                      {industries.map(ind => (
                        <label key={ind.id} className={styles.checkRow}>
                          <input
                            type="checkbox"
                            checked={tempIndustries.some(c => c.id === ind.id)}
                            onChange={() => toggleIndustry(ind)}
                          />
                          {ind.name}
                        </label>
                      ))}
                    </div>
                  </div>
                  
                  <div className={styles.dropdownFooter}>
                    <button type="button" className={styles.btnCancel} onClick={handleCancelFilter}>
                      Cancel
                    </button>
                    <button type="button" className={styles.btnSave} onClick={handleSaveFilter}>
                      Find
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className={styles.findJobList}>
          {loading ? (
            <div className={styles.loadingState}>Loading...</div>
          ) : jobs.length > 0 ? (
            jobs.map(job => (
              <JobCard 
                key={job.id}
                job={job}
                onClick={() => window.location.href = `/jobs/${job.id}`}
              />
            ))
          ) : (
            <div className={styles.emptyState}>No jobs found.</div>
          )}
        </div>
      </div>
    </div>
  );
}