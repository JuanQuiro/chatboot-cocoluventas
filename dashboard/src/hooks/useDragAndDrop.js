// useDragAndDrop.js - Hook para drag & drop
import { useState, useCallback } from 'react';

export const useDragAndDrop = (items, onReorder) => {
    const [draggedItem, setDraggedItem] = useState(null);
    const [draggedOverItem, setDraggedOverItem] = useState(null);

    const handleDragStart = useCallback((e, item) => {
        setDraggedItem(item);
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/html', e.target);
    }, []);

    const handleDragOver = useCallback((e, item) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';

        if (draggedItem && item.id !== draggedItem.id) {
            setDraggedOverItem(item);
        }
    }, [draggedItem]);

    const handleDragEnd = useCallback(() => {
        if (draggedItem && draggedOverItem) {
            const draggedIndex = items.findIndex(item => item.id === draggedItem.id);
            const targetIndex = items.findIndex(item => item.id === draggedOverItem.id);

            if (draggedIndex !== -1 && targetIndex !== -1) {
                const newItems = [...items];
                const [removed] = newItems.splice(draggedIndex, 1);
                newItems.splice(targetIndex, 0, removed);

                if (onReorder) {
                    onReorder(newItems);
                }
            }
        }

        setDraggedItem(null);
        setDraggedOverItem(null);
    }, [draggedItem, draggedOverItem, items, onReorder]);

    const handleDragLeave = useCallback(() => {
        setDraggedOverItem(null);
    }, []);

    return {
        draggedItem,
        draggedOverItem,
        handleDragStart,
        handleDragOver,
        handleDragEnd,
        handleDragLeave
    };
};

export default useDragAndDrop;
