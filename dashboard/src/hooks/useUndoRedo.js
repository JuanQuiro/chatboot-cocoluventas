// useUndoRedo.js - Sistema de Undo/Redo
import { useState, useCallback, useEffect } from 'react';

export const useUndoRedo = (initialState, maxHistory = 50) => {
    const [history, setHistory] = useState([initialState]);
    const [currentIndex, setCurrentIndex] = useState(0);

    const currentState = history[currentIndex];

    // Agregar nuevo estado
    const setState = useCallback((newState) => {
        setHistory(prev => {
            const newHistory = prev.slice(0, currentIndex + 1);
            newHistory.push(newState);

            // Limitar historial
            if (newHistory.length > maxHistory) {
                newHistory.shift();
                return newHistory;
            }

            return newHistory;
        });
        setCurrentIndex(prev => Math.min(prev + 1, maxHistory - 1));
    }, [currentIndex, maxHistory]);

    // Undo
    const undo = useCallback(() => {
        if (currentIndex > 0) {
            setCurrentIndex(prev => prev - 1);
            return true;
        }
        return false;
    }, [currentIndex]);

    // Redo
    const redo = useCallback(() => {
        if (currentIndex < history.length - 1) {
            setCurrentIndex(prev => prev + 1);
            return true;
        }
        return false;
    }, [currentIndex, history.length]);

    // Limpiar historial
    const clearHistory = useCallback(() => {
        setHistory([initialState]);
        setCurrentIndex(0);
    }, [initialState]);

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
                e.preventDefault();
                if (e.shiftKey) {
                    redo();
                } else {
                    undo();
                }
            }

            if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
                e.preventDefault();
                redo();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [undo, redo]);

    return {
        state: currentState,
        setState,
        undo,
        redo,
        canUndo: currentIndex > 0,
        canRedo: currentIndex < history.length - 1,
        clearHistory,
        historyLength: history.length,
        currentIndex
    };
};

export default useUndoRedo;
