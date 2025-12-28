// useInfiniteScroll.js - Hook para infinite scroll
import { useState, useEffect, useCallback, useRef } from 'react';

export const useInfiniteScroll = (fetchMore, hasMore = true) => {
    const [isLoading, setIsLoading] = useState(false);
    const observerRef = useRef(null);
    const loadMoreRef = useRef(null);

    const handleObserver = useCallback((entries) => {
        const target = entries[0];

        if (target.isIntersecting && hasMore && !isLoading) {
            setIsLoading(true);
            fetchMore().finally(() => setIsLoading(false));
        }
    }, [fetchMore, hasMore, isLoading]);

    useEffect(() => {
        const option = {
            root: null,
            rootMargin: '20px',
            threshold: 0
        };

        observerRef.current = new IntersectionObserver(handleObserver, option);

        if (loadMoreRef.current) {
            observerRef.current.observe(loadMoreRef.current);
        }

        return () => {
            if (observerRef.current) {
                observerRef.current.disconnect();
            }
        };
    }, [handleObserver]);

    return {
        loadMoreRef,
        isLoading
    };
};

export default useInfiniteScroll;
