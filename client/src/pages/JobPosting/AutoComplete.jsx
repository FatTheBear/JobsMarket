import React, { useState, useEffect, useRef } from 'react';
import './AutoComplete.css';

export const AutoComplete = ({ value, onChange }) => {
    const [suggestions, setSuggestions] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const wrapperRef = useRef(null);
    const [hasError, setHasError] = useState(false);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        if (value.trim().length < 2) {
            setSuggestions([]);
            return;
        }

        const timerId = setTimeout(() => {
            fetch(`http://localhost:5000/api/industry/search-titles?q=${value}`)
                .then(res => res.json())
                .then(result => {
                    if (result.success) {
                        setSuggestions(result.data);
                        setShowDropdown(true);
                    }
                })
                .catch(err => console.error(err));
        }, 300);

        return () => clearTimeout(timerId);
    }, [value]);

    const handleInputChange = (e) => {
        onChange(e.target.value);
        setShowDropdown(true);
    };

    const handleSelectSuggestion = (title) => {
        onChange(title);
        setSuggestions([]);
        setShowDropdown(false);
    };

    return (
        <div className="autocomplete-container" ref={wrapperRef}>
            <input
                type="text"
                className={`autocomplete-input ${hasError ? 'has-error' : ''}`}
                placeholder="Enter job title (e.g. Data Analyst)"
                value={value}
                onChange={handleInputChange}
                onFocus={() => {
                    if (suggestions.length > 0) setShowDropdown(true);
                }}
            />
            {showDropdown && suggestions.length > 0 && (
                <div className="autocomplete-dropdown">
                    {suggestions.slice(0, 6).map((title, index) => (
                        <div
                            key={index}
                            className="autocomplete-item"
                            onClick={() => handleSelectSuggestion(title)}
                        >
                            {title}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};