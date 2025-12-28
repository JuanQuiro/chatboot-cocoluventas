import React, { useState, useEffect, useRef } from 'react';
import './SearchInput.css';

const SearchInput = ({
    placeholder = "Buscar...",
    onSearch,
    debounceMs = 300,
    icon = "🔍"
}) => {
    const [value, setValue] = useState('');
    const timeoutRef = useRef(null);

    useEffect(() => {
        // Clear previous timeout
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        // Set new timeout
        timeoutRef.current = setTimeout(() => {
            if (onSearch) {
                onSearch(value);
            }
        }, debounceMs);

        // Cleanup
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, [value, debounceMs, onSearch]);

    const handleClear = () => {
        setValue('');
    };

    return (
        <div className="search-input-container">
            <span className="search-icon">{icon}</span>
            <input
                type="text"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder={placeholder}
                className="search-input !w-full"
            />
            {value && (
                <button
                    onClick={handleClear}
                    className="clear-btn"
                    type="button"
                >
                    ✕
                </button>
            )}
        </div>
    );
};

export default SearchInput;
