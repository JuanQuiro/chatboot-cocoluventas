import React from 'react';

const ProviderFlag = ({ countryCode, name, minimal = false }) => {
    // Simple mapping for flags (could be replaced by a library or image assets)
    const getFlagEmoji = (code) => {
        if (!code) return '🏳️';
        const codePoints = code
            .toUpperCase()
            .split('')
            .map(char => 127397 + char.charCodeAt());
        return String.fromCodePoint(...codePoints);
    };

    const flag = getFlagEmoji(countryCode);

    if (minimal) {
        return <span title={name} className="text-lg cursor-help">{flag}</span>;
    }

    return (
        <div className="flex items-center gap-1 text-xs text-gray-600 bg-gray-50 px-2 py-1 rounded border border-gray-100">
            <span className="text-base">{flag}</span>
            <span className="font-medium truncate max-w-[100px]">{name}</span>
        </div>
    );
};

export default ProviderFlag;
