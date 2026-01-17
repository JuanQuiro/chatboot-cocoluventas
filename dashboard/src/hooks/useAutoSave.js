// useAutoSave.js - Hook para auto-guardado con localStorage
import { useEffect, useCallback, useRef } from 'react';

const AUTOSAVE_KEY = 'crearVenta_draft';
const AUTOSAVE_INTERVAL = 30000; // 30 segundos

export const useAutoSave = (data, enabled = true) => {
    const intervalRef = useRef(null);

    const saveDraft = useCallback(() => {
        if (!enabled || !data) return;

        try {
            const draft = {
                ...data,
                savedAt: new Date().toISOString()
            };
            localStorage.setItem(AUTOSAVE_KEY, JSON.stringify(draft));
            console.log('Draft auto-saved at:', draft.savedAt);
        } catch (error) {
            console.error('Error saving draft:', error);
        }
    }, [data, enabled]);

    const loadDraft = useCallback(() => {
        try {
            const savedDraft = localStorage.getItem(AUTOSAVE_KEY);
            if (savedDraft) {
                const draft = JSON.parse(savedDraft);
                return draft;
            }
        } catch (error) {
            console.error('Error loading draft:', error);
        }
        return null;
    }, []);

    const clearDraft = useCallback(() => {
        try {
            localStorage.removeItem(AUTOSAVE_KEY);
            console.log('Draft cleared');
        } catch (error) {
            console.error('Error clearing draft:', error);
        }
    }, []);

    const hasDraft = useCallback(() => {
        return localStorage.getItem(AUTOSAVE_KEY) !== null;
    }, []);

    // Auto-save interval
    useEffect(() => {
        if (enabled) {
            intervalRef.current = setInterval(saveDraft, AUTOSAVE_INTERVAL);

            return () => {
                if (intervalRef.current) {
                    clearInterval(intervalRef.current);
                }
            };
        }
    }, [enabled, saveDraft]);

    // Save on unmount
    useEffect(() => {
        return () => {
            if (enabled && data) {
                saveDraft();
            }
        };
    }, [enabled, data, saveDraft]);

    return {
        saveDraft,
        loadDraft,
        clearDraft,
        hasDraft
    };
};

export default useAutoSave;
