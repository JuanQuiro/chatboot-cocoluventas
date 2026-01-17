import React from 'react';

const NotesSection = ({ notes, setNotes }) => {
    return (
        <div className="form-section">
            <h2>📝 Notas</h2>
            <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="form-control"
                rows="3"
                placeholder="Notas adicionales..."
            />
        </div>
    );
};

export default NotesSection;
