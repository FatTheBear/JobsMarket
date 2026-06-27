import React, { useState, useEffect } from 'react';
import './IndustrySelector.css';

export default function IndustrySelector({ onChange = () => {} }) {
    const [showModal, setShowModal] = useState(false);
    const [categories, setCategories] = useState([]);
    const [industries, setIndustries] = useState([]);
    const [tempCategories, setTempCategories] = useState([]);
    const [tempIndustries, setTempIndustries] = useState([]);
    const [finalIndustries, setFinalIndustries] = useState([]);

    useEffect(() => {
        if (showModal && categories.length === 0) {
            fetch('http://localhost:5000/api/industry/categories')
                .then(res => res.json())
                .then(data => {
                    if (data.success) setCategories(data.data);
                });
        }
    }, [showModal, categories.length]);

    useEffect(() => {
        if (tempCategories.length > 0) {
            const catIds = tempCategories.map(c => c.id).join(',');
            fetch(`http://localhost:5000/api/industry?categoryIds=${catIds}`)
                .then(res => res.json())
                .then(data => {
                    if (data.success) {
                        setIndustries(data.data);
                        setTempIndustries(prev => 
                            prev.filter(child => data.data.some(ind => ind.id === child.id))
                        );
                    }
                });
        } else {
            setIndustries([]);
            setTempIndustries([]);
        }
    }, [tempCategories]);

    const openModal = () => {
        setTempCategories([]);
        setTempIndustries(finalIndustries);
        setShowModal(true);
    };

    const saveModal = () => {
        setFinalIndustries(tempIndustries);
        onChange(tempIndustries.map(i => i.id));
        setShowModal(false);
    };

    const toggleCategory = (cat) => {
        if (tempCategories.some(c => c.id === cat.id)) {
            setTempCategories(prev => prev.filter(c => c.id !== cat.id));
        } else {
            if (tempCategories.length >= 3) return;
            setTempCategories(prev => [...prev, cat]);
        }
    };

    const toggleIndustry = (ind) => {
        if (tempIndustries.some(i => i.id === ind.id)) {
            setTempIndustries(prev => prev.filter(i => i.id !== ind.id));
        } else {
            if (tempIndustries.length >= 6) return;
            setTempIndustries(prev => [...prev, ind]);
        }
    };

    const removeIndustry = (id) => {
        const updated = finalIndustries.filter(i => i.id !== id);
        setFinalIndustries(updated);
        onChange(updated.map(i => i.id));
    };

    return (
        <div className="is-wrapper">
            <div className="is-field">
                <label>Industry <span>*</span></label>
                <button type="button" className="is-action-btn" onClick={openModal}>
                    + Select Industry
                </button>
                <div className="is-tags-container">
                    {finalIndustries.map(ind => (
                        <span key={ind.id} className="is-tag-picked" onClick={() => removeIndustry(ind.id)}>
                            {ind.name} ✕
                        </span>
                    ))}
                </div>
            </div>

            {showModal && (
                <div className="is-modal-overlay">
                    <div className="is-modal-box">
                        <div className="is-modal-header">
                            <h3>Select Industry</h3>
                            <button type="button" className="is-close-btn" onClick={() => setShowModal(false)}>✕</button>
                        </div>
                        <div className="is-modal-body">
                            <div className="is-pane-left">
                                <h4>Categories (Max 3)</h4>
                                {categories.map(cat => (
                                    <label key={cat.id} className="is-check-row">
                                        <input
                                            type="checkbox"
                                            checked={tempCategories.some(c => c.id === cat.id)}
                                            onChange={() => toggleCategory(cat)}
                                        />
                                        {cat.name}
                                    </label>
                                ))}
                            </div>
                            <div className="is-pane-right">
                                <h4>Industries (Max 6)</h4>
                                {industries.map(ind => (
                                    <label key={ind.id} className="is-check-row">
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
                        <div className="is-modal-footer">
                            <button type="button" className="is-btn-cancel" onClick={() => setShowModal(false)}>Cancel</button>
                            <button type="button" className="is-btn-save" onClick={saveModal}>Save</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}