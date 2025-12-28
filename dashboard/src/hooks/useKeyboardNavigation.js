// useKeyboardNavigation.js - Hook para navegación con teclado en listas
import { useState, useEffect, useCallback } from 'react';

export const useKeyboardNavigation = (items, onSelect) => {
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const [isActive, setIsActive] = useState(false);

    const handleKeyDown = useCallback((e) => {
        if (!isActive || items.length === 0) return;

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setSelectedIndex(prev =>
                    prev < items.length - 1 ? prev + 1 : prev
                );
                break;

            case 'ArrowUp':
                e.preventDefault();
                setSelectedIndex(prev => prev > 0 ? prev - 1 : 0);
                break;

            case 'Enter':
                e.preventDefault();
                if (selectedIndex >= 0 && selectedIndex < items.length) {
                    onSelect(items[selectedIndex]);
                    setSelectedIndex(-1);
                }
                break;

            case 'Escape':
                e.preventDefault();
                setIsActive(false);
                setSelectedIndex(-1);
                break;

            default:
                break;
        }
    }, [isActive, items, selectedIndex, onSelect]);

    useEffect(() => {
        if (isActive) {
            window.addEventListener('keydown', handleKeyDown);
            return () => window.removeEventListener('keydown', handleKeyDown);
        }
    }, [isActive, handleKeyDown]);

    // Reset index when items change
    useEffect(() => {
        setSelectedIndex(-1);
    }, [items]);

    const activate = () => setIsActive(true);
    const deactivate = () => {
        setIsActive(false);
        setSelectedIndex(-1);
    };

    return {
        selectedIndex,
        isActive,
        activate,
        deactivate,
        setSelectedIndex
    };
};

export default useKeyboardNavigation;
