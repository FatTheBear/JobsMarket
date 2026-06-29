import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiLink, FiUsers, FiSearch, FiMapPin, FiCopy } from 'react-icons/fi';
import { HiOutlineIdentification, HiOutlineViewGridAdd } from 'react-icons/hi';
import { BiPlus } from 'react-icons/bi';
import JobCard from '../../../components/Jobs/JobCard.jsx';
import styles from './CompanyDetail.module.css';

const getImageUrl = (url) => {
    if (!url) return 'https://via.placeholder.com/130?text=No+Logo';
    if (url.startsWith('http') || url.startsWith('data:image')) return url;
    const cleanPath = url.startsWith('/') ? url : `/${url}`;
  return `http://localhost:5000${cleanPath}`;
};


const CompanyDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('home');
    const [company, setCompany] = useState(null);
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCompanyData = async () => {
            try {
                const response = await fetch(`http://localhost:5000/api/company/public/${id}`);
                const data = await response.json();

                if (response.ok) {
                    setCompany(data.company);
                    setJobs(data.jobs || []);
                }
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchCompanyData();
        }
    }, [id]);

    if (loading || !company) {
        return <div className={styles.topcvLayout}></div>;
    }

    const finalLogoUrl = getImageUrl(company.logo_url);
    const finalCoverUrl = company.cover_image_url ? getImageUrl(company.cover_image_url) : null;
    const coverStyle = finalCoverUrl
        ? { backgroundImage: `url(${finalCoverUrl})` }
        : {};

    return (
        <div className={styles.topcvLayout}>
            <div className={styles.topcvBanner} style={coverStyle}>
                <div className={styles.topcvBannerOverlay} />
            </div>

            <div className={styles.topcvMainContainer}>

                <div className={styles.topcvHeaderBox}>
                    <div className={styles.topcvHeaderTop}>
                        <div className={styles.topcvCompanyIdentity}>
                            <div className={styles.topcvLogoWrapper}>
                                <img
                                    src={finalLogoUrl}
                                    alt={company.name || 'Company Logo'}
                                    onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = 'https://via.placeholder.com/130?text=No+Logo';
                                    }}
                                />
                            </div>
                            <div>
                                <h1 className={styles.topcvName}>{company.name}</h1>
                                <div className={styles.topcvStats}>
                                    {company.website && (
                                        <div className={styles.topcvStatItem}>
                                            <FiLink />
                                            <a href={company.website} target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'none' }}>
                                                {company.website.replace(/^https?:\/\//, '')}
                                            </a>
                                        </div>
                                    )}
                                    <div className={styles.topcvStatItem}>
                                        <FiUsers /> 1000+ followers
                                    </div>
                                </div>
                            </div>
                        </div>
                        <button type="button" className={styles.topcvFollowBtn}>
                            <BiPlus size={18} /> Follow
                        </button>
                    </div>

                    <div className={styles.topcvTabs}>
                        <button
                            type="button"
                            className={`${styles.topcvTab} ${activeTab === 'home' ? styles.topcvTabActive : ''}`}
                            onClick={() => setActiveTab('home')}
                        >
                            About
                        </button>
                    </div>
                </div>

                <div className={styles.topcvBodyGrid}>

                    <div className={styles.topcvLeftCol}>
                        {activeTab === 'home' && (
                            <div className={styles.topcvCard}>
                                <h2 className={styles.topcvCardTitle}>About Company</h2>
                                <div className={styles.topcvDescText}>
                                    {company.description || 'No detailed description provided by this company.'}
                                </div>
                            </div>
                        )}

                        <div className={styles.topcvCard}>
                            <h2 className={styles.topcvCardTitle}>Open Positions</h2>
                            <div className={styles.topcvJobList}>
                                {jobs.map(job => (
                                    <JobCard
                                        key={job.id}
                                        job={{
                                            ...job,
                                            company_name: company.name,
                                            logo_url: finalLogoUrl,    
                                            //company_logo: finalLogoUrl   
                                        }}
                                        onClick={() => navigate(`/jobs/${job.id}`)}
                                    />
                                ))}
                                {jobs.length === 0 && (
                                    <div style={{ color: '#666', fontStyle: 'italic' }}>There are currently no job openings available.</div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className={styles.topcvRightCol}>
                        <div className={styles.topcvCard}>
                            <h2 className={styles.topcvCardTitle}>General Information</h2>
                            <div className={styles.topcvInfoList}>
                                <div className={styles.topcvInfoRow}>
                                    <div className={styles.topcvIconCircle}>
                                        <HiOutlineIdentification size={22} />
                                    </div>
                                    <div className={styles.topcvInfoText}>
                                        <span className={styles.topcvInfoLabel}>Tax ID</span>
                                        <span className={styles.topcvInfoValue}>{company.tax_id || 'Updating...'}</span>
                                    </div>
                                </div>

                                <div className={styles.topcvInfoRow}>
                                    <div className={styles.topcvIconCircle}>
                                        <FiUsers size={20} />
                                    </div>
                                    <div className={styles.topcvInfoText}>
                                        <span className={styles.topcvInfoLabel}>Company Size</span>
                                        <span className={styles.topcvInfoValue}>{company.size || 'Updating...'}</span>
                                    </div>
                                </div>

                                <div className={styles.topcvInfoRow}>
                                    <div className={styles.topcvIconCircle}>
                                        <HiOutlineViewGridAdd size={22} />
                                    </div>
                                    <div className={styles.topcvInfoText}>
                                        <span className={styles.topcvInfoLabel}>Industry</span>
                                        <span className={styles.topcvInfoValue}>{company.industry_name || 'Updating...'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default CompanyDetail;