import React, { useState, useEffect } from 'react';
import './IndustrySkill.css';

export const IndustrySkill = ({ selectedIndustryIds, selectedSkillIds, onChange }) => {
   const [showSkillModal, setShowSkillModal] = useState(false);
    const [skillObjects, setSkillObjects] = useState([]);
    const [fetchedSkills, setFetchedSkills] = useState([]);
    const [tempSkills, setTempSkills] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {

        if (showSkillModal && selectedIndustryIds.length > 0) {
            const indIds = selectedIndustryIds.join(','); 

            fetch(`http://localhost:5000/api/industry/skills?industryIds=${indIds}`)
                .then(res => res.json())
                .then(data => {
                    if (data.success) setFetchedSkills(data.data);
                })
                .catch(err => console.error(err));
        } else if (selectedIndustryIds.length === 0) {
            setFetchedSkills([]);
        }
    }, [showSkillModal, selectedIndustryIds]);

    const openSkillModal = () => {
        setTempSkills(skillObjects);
        setSearchTerm('');
        setShowSkillModal(true);
    };

    const saveSkillModal = () => {
        setSkillObjects(tempSkills);
        onChange('selected_skills', tempSkills.map(s => s.id));
        setShowSkillModal(false);
    };

    const toggleTempSkill = (skill) => {
        if (tempSkills.some(s => s.id === skill.id)) {
            setTempSkills(prev => prev.filter(s => s.id !== skill.id));
        } else {
            setTempSkills(prev => [...prev, skill]);
        }
    };

    const removeSkillObject = (id) => {
        const updated = skillObjects.filter(s => s.id !== id);
        setSkillObjects(updated);
        onChange('selected_skills', updated.map(s => s.id));
    };

    const filteredSkills = fetchedSkills.filter(s => 
        s.skill_name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    return (
        <>
            <div className="jp-field">
                <label>Professional Skills</label>
                <button 
                    type="button" 
                    className="selector-action-btn" 
                    onClick={openSkillModal}
                    /* ĐÃ FIX: Dùng selectedIndustryIds thay vì indObjects */
                    disabled={selectedIndustryIds.length === 0}
                >
                    + Select Skills
                </button>
                <div className="tags-wrapper">
                    {skillObjects.map(skill => (
                        <span key={skill.id} className="picked-tag" onClick={() => removeSkillObject(skill.id)}>
                            {skill.skill_name} ✕
                        </span>
                    ))}
                </div>
            </div>

            {showSkillModal && (
                <div className="modal-backdrop">
                    <div className="modal-box" style={{ width: '600px' }}>
                        <div className="modal-top">
                            <h3>Select Skills</h3>
                            <button type="button" className="close-x-btn" onClick={() => setShowSkillModal(false)}>✕</button>
                        </div>
                        <div className="modal-mid" style={{ flexDirection: 'column', padding: '20px' }}>
                            <input 
                                type="text" 
                                className="search-input" 
                                placeholder="Search skills..." 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            
                            <div style={{ marginBottom: '20px' }}>
                                <h4 style={{marginTop: 0, fontSize: '14px', color: '#555'}}>Selected:</h4>
                                <div className="tags-wrapper">
                                    {tempSkills.map(skill => (
                                        <span key={skill.id} className="picked-tag" onClick={() => toggleTempSkill(skill)}>
                                            {skill.skill_name} ✕
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <div style={{ flex: 1, overflowY: 'auto', borderTop: '1px solid #eee', paddingTop: '16px' }}>
                                <div className="tags-wrapper">
                                    {filteredSkills.map(skill => {
                                        if (tempSkills.some(s => s.id === skill.id)) return null;
                                        return (
                                            <button 
                                                key={skill.id} 
                                                type="button"
                                                className="list-item-tag" 
                                                onClick={() => toggleTempSkill(skill)}
                                            >
                                                {skill.skill_name} +
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                        <div className="modal-bottom">
                            <button type="button" className="btn-outline" onClick={() => setShowSkillModal(false)}>Cancel</button>
                            <button type="button" className="btn-fill" onClick={saveSkillModal}>Save</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};