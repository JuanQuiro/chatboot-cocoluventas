// Custom Hooks - Clean Architecture
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { metaApi, messagesApi, dashboardApi } from '../services/api';
import toast from 'react-hot-toast';

// Meta Config Hook
export function useMetaConfig() {
    const queryClient = useQueryClient();

    const { data: config, isLoading, error } = useQuery({
        queryKey: ['meta-config'],
        queryFn: metaApi.getConfig,
        staleTime: 30000
    });

    const saveMutation = useMutation({
        mutationFn: metaApi.saveConfig,
        onSuccess: () => {
            queryClient.invalidateQueries(['meta-config']);
            toast.success('✅ Configuración guardada');
        },
        onError: (error) => {
            toast.error(error.response?.data?.error || 'Error guardando configuración');
        }
    });

    const testMutation = useMutation({
        mutationFn: metaApi.testMessage,
        onSuccess: () => {
            toast.success('✅ Mensaje de prueba enviado');
        },
        onError: (error) => {
            toast.error(error.response?.data?.error || 'Error enviando test');
        }
    });

    return {
        config,
        isLoading,
        error,
        saveConfig: saveMutation.mutate,
        testMessage: testMutation.mutate,
        isSaving: saveMutation.isPending,
        isTesting: testMutation.isPending
    };
}

// Messages Hook
export function useMessages() {
    return useQuery({
        queryKey: ['messages'],
        queryFn: messagesApi.getAll,
        refetchInterval: 5000, // Poll every 5s
        staleTime: 0
    });
}

// Dashboard Hook
export function useDashboard() {
    return useQuery({
        queryKey: ['dashboard-summary'],
        queryFn: dashboardApi.getSummary,
        refetchInterval: 10000,
        staleTime: 5000
    });
}

// Health Hook
export function useHealth() {
    return useQuery({
        queryKey: ['health'],
        queryFn: dashboardApi.getHealth,
        refetchInterval: 30000,
        staleTime: 10000
    });
}

// Meta Billing Hook
export function useMetaBilling(params = {}) {
    return useQuery({
        queryKey: ['meta-billing', params],
        queryFn: () => metaApi.getBilling(params),
        staleTime: 60000 // 1 minute
    });
}
