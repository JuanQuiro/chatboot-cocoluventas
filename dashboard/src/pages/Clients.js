
import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import clientsApi from '../services/clientsApi';
import CreateClientModal from '../components/CreateClientModal';
import './Products.css'; // Reusing styles for table-list layout

const Clients = () => {
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const fetchClients = useCallback(async () => {
        try {
            const response = await clientsApi.getAll();
            if (response.success) {
                setClients(response.data);
            } else {
                toast.error('Error al cargar clientes');
            }
        } catch (error) {
            console.error('Error fetching clients:', error);
            toast.error(`Error: ${error.message || 'No se pudieron cargar los clientes'}`);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchClients();
    }, [fetchClients]);

    const handleClientCreated = (newClient) => {
        setClients(prev => [newClient, ...prev]);
        // Optionally refresh full list
        fetchClients();
    };

    if (loading) return <div className="loading">Cargando clientes...</div>;

    return (
        <div className="page-container">
            <div className="page-header">
                <h2>👥 Gestión de Clientes</h2>
                <button
                    className="btn-primary"
                    onClick={() => setIsModalOpen(true)}
                >
                    + Nuevo Cliente
                </button>
            </div>

            <div className="table-container">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Cédula</th>
                            <th>Nombre</th>
                            <th>Teléfono</th>
                            <th>Email</th>
                            <th>Estado</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {clients.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="text-center">No hay clientes registrados</td>
                            </tr>
                        ) : (
                            clients.map(client => (
                                <tr key={client.id}>
                                    <td>{client.cedula}</td>
                                    <td>{client.nombre} {client.apellido}</td>
                                    <td>{client.telefono || '-'}</td>
                                    <td>{client.email || '-'}</td>
                                    <td>
                                        <span className={`status-badge ${client.activo ? 'active' : 'inactive'}`}>
                                            {client.activo ? 'Activo' : 'Inactivo'}
                                        </span>
                                    </td>
                                    <td>
                                        <button className="btn-icon" title="Editar">✏️</button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <CreateClientModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onClientCreated={handleClientCreated}
            />
        </div>
    );
};

export default Clients;
