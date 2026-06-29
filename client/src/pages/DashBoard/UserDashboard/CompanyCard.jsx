import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiUsers, FiBox, FiMapPin } from 'react-icons/fi';
import styles from './CompanyCard.module.css';

const getImageUrl = (url) => {
  if (!url) return 'https://via.placeholder.com/80?text=No+Logo';
  if (url.startsWith('http')) return url;
  return `http://localhost:5000/${url.replace(/^\//, '')}`;
};


const CompanyCard = ({ company }) => {
    const navigate = useNavigate();
    const [imgError, setImgError] = useState(false);

    if (!company) {
        return null;
    }

    const handleCardClick = () => {
        navigate(`/company/${company.id}`);
    };

    const finalLogoUrl = getImageUrl(company.logo_url || company.company_logo);
    console.log("Dữ liệu truyền vào Card:", company)
    return (
        <div className={styles.cardContainer} onClick={handleCardClick}>
            <div className={styles.header}>
                <div className={styles.logoBox}>
                    <img
                        src={imgError ? 'https://via.placeholder.com/80?text=No+Logo' : getImageUrl(company?.logo_url || company?.company_logo)}
                        alt="Company Logo"
                        onError={() => setImgError(true)}
                    />
                </div>
                <h3 className={styles.companyName}>{company.name}</h3>
            </div>

            <div className={styles.infoList}>
                <div className={styles.infoItem}>
                    <FiUsers className={styles.icon} size={18} />
                    <div className={styles.infoText}>
                        <span className={styles.label}>Size:</span>
                        <span className={styles.value}>{company.size || 'N/A'}</span>
                    </div>
                </div>

                <div className={styles.infoItem}>
                    <FiBox className={styles.icon} size={18} />
                    <div className={styles.infoText}>
                        <span className={styles.label}>Industry:</span>
                        <span className={styles.value}>{company.industry_name || 'N/A'}</span>
                    </div>
                </div>

                <div className={styles.infoItem}>
                    <FiMapPin className={styles.icon} size={18} />
                    <div className={styles.infoText}>
                        <span className={styles.label}>Location:</span>
                        <span className={styles.value}>{company.address || 'N/A'}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};
export default CompanyCard;