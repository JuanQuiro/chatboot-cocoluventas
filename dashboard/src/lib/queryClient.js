// QueryClient configuration with resilience
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: 3,
            retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
            staleTime: 5000,
            cacheTime: 300000, // 5 minutes
            refetchOnWindowFocus: true,
            refetchOnReconnect: true,
            onError: (error) => {
                console.error('Query error:', error);
            }
        },
        mutations: {
            retry: 1,
            onError: (error) => {
                console.error('Mutation error:', error);
            }
        }
    }
});
