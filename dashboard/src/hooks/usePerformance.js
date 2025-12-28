// usePerformance.js - Hook para optimización de performance
import { useCallback, useRef } from 'react';

export const usePerformance = () => {
    const debounceTimers = useRef({});

    const debounce = useCallback((fn, delay = 300, key = 'default') => {
        return (...args) => {
            if (debounceTimers.current[key]) {
                clearTimeout(debounceTimers.current[key]);
            }

            debounceTimers.current[key] = setTimeout(() => {
                fn(...args);
            }, delay);
        };
    }, []);

    const throttle = useCallback((fn, delay = 300) => {
        let lastCall = 0;

        return (...args) => {
            const now = Date.now();

            if (now - lastCall >= delay) {
                lastCall = now;
                fn(...args);
            }
        };
    }, []);

    return {
        debounce,
        throttle
    };
};

export default usePerformance;
