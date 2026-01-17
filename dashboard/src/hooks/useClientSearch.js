// Custom hook para manejar la lógica de búsqueda de clientes
import { useState, useEffect, useRef } from 'react';
import { clientsService } from '../services/clientsService';

export const useClientSearch = () => {
    const [client, setClient] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);

    // Cache de todos los clientes para búsqueda local rápida
    const [allClients, setAllClients] = useState([]);
    const initialized = useRef(false);

    // 1. Cargar todos los clientes al inicio
    useEffect(() => {
        if (!initialized.current) {
            initialized.current = true;
            loadAllClients();
        }
    }, []);

    const loadAllClients = async () => {
        try {
            // Usamos getClients para traer todos (limit: -1)
            const response = await clientsService.getClients(1, -1);
            // Aseguramos que sea un array (dependiendo de si el backend devuelve { data: [...] } o [...])
            const clientsSync = Array.isArray(response) ? response : (response.data || []);
            console.log(`📦 [Hook] Loaded ${clientsSync.length} clients for local search`);
            setAllClients(clientsSync);
        } catch (error) {
            console.error('❌ [Hook] Error loading clients cache:', error);
        }
    };

    // 2. Filtrado local inteligente (Weighted Search)
    useEffect(() => {
        if (!searchQuery) {
            setResults([]);
            return;
        }

        const query = searchQuery.toLowerCase().trim();

        if (query.length < 2) {
            setResults([]);
            return;
        }

        // Algoritmo de Búsqueda Ponderada
        const filtered = allClients
            .map(client => {
                let score = 0;
                const name = (client.nombre || client.name || '').toLowerCase();
                const lastName = (client.apellido || '').toLowerCase();
                const fullName = `${name} ${lastName}`.trim();
                const cedula = (client.cedula || '').toString();
                const phone = (client.telefono || '').toString();
                const email = (client.email || '').toLowerCase();

                // 1. Coincidencia exacta de Cédula (Máxima prioridad)
                if (cedula === query) score += 100;
                else if (cedula.includes(query)) score += 60;

                // 2. Coincidencia de Nombre
                if (fullName === query) score += 90;
                else if (fullName.startsWith(query)) score += 80;
                else if (fullName.includes(query)) score += 50;

                // 3. Coincidencia de Teléfono
                if (phone.includes(query)) score += 70;

                // 4. Email
                if (email.includes(query)) score += 40;

                return { ...client, score };
            })
            .filter(client => client.score > 0) // Solo mostrar coincidencias
            .sort((a, b) => b.score - a.score) // Ordenar por relevancia
            .slice(0, 20); // Limitar a 20 resultados para rendimiento

        setResults(filtered);

    }, [searchQuery, allClients]);

    const selectClient = (selectedClient) => {
        setClient(selectedClient);
        setSearchQuery('');
        setResults([]);
    };

    const clearClient = () => {
        setClient(null);
    };

    return {
        client,
        searchQuery,
        results,
        loading, // Mantenemos loading por compatibilidad, aunque ahora es instantáneo
        setSearchQuery,
        selectClient,
        clearClient,
        refreshClients: loadAllClients // Exponemos función para recargar si creamos usuario nuevo
    };
};

export default useClientSearch;
