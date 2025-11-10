import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function PrivateRoute({ children }) {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Cargando...</p>
                </div>
            </div>
        );
    }

    return isAuthenticated() ? children : <Navigate to="/login" />;
}

export default PrivateRoute;
