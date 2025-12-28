import React, { useState } from 'react';
import './CambiarContraseña.css';

const CambiarContraseña = () => {
    const [formData, setFormData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const validatePassword = (password) => {
        if (password.length < 8) {
            return 'La contraseña debe tener al menos 8 caracteres';
        }
        if (!/[A-Z]/.test(password)) {
            return 'La contraseña debe contener al menos una mayúscula';
        }
        if (!/[a-z]/.test(password)) {
            return 'La contraseña debe contener al menos una minúscula';
        }
        if (!/[0-9]/.test(password)) {
            return 'La contraseña debe contener al menos un número';
        }
        return null;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        // Validate passwords match
        if (formData.newPassword !== formData.confirmPassword) {
            setError('Las contraseñas no coinciden');
            return;
        }

        // Validate password strength
        const validationError = validatePassword(formData.newPassword);
        if (validationError) {
            setError(validationError);
            return;
        }

        setLoading(true);

        try {
            // TODO: Replace with actual API call
            // await usersService.changePassword({
            //   currentPassword: formData.currentPassword,
            //   newPassword: formData.newPassword
            // });

            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));

            setSuccess('Contraseña cambiada exitosamente');
            setFormData({
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            });
        } catch (error) {
            setError('Error al cambiar la contraseña. Verifica tu contraseña actual.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="cambiar-contraseña-page">
            <div className="page-header">
                <h1>🔐 Cambiar Contraseña</h1>
                <p>Actualiza tu contraseña de acceso</p>
            </div>

            <div className="password-form-container">
                <form onSubmit={handleSubmit} className="password-form">
                    {error && (
                        <div className="alert alert-error">
                            <span>⚠️</span>
                            <p>{error}</p>
                        </div>
                    )}

                    {success && (
                        <div className="alert alert-success">
                            <span>✅</span>
                            <p>{success}</p>
                        </div>
                    )}

                    <div className="form-group">
                        <label>Contraseña Actual *</label>
                        <input
                            type="password"
                            value={formData.currentPassword}
                            onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                            required
                            className="form-control"
                            placeholder="Ingresa tu contraseña actual"
                        />
                    </div>

                    <div className="form-group">
                        <label>Nueva Contraseña *</label>
                        <input
                            type="password"
                            value={formData.newPassword}
                            onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                            required
                            className="form-control"
                            placeholder="Ingresa tu nueva contraseña"
                        />
                    </div>

                    <div className="form-group">
                        <label>Confirmar Nueva Contraseña *</label>
                        <input
                            type="password"
                            value={formData.confirmPassword}
                            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                            required
                            className="form-control"
                            placeholder="Confirma tu nueva contraseña"
                        />
                    </div>

                    <div className="password-requirements">
                        <h3>Requisitos de la contraseña:</h3>
                        <ul>
                            <li className={formData.newPassword.length >= 8 ? 'valid' : ''}>
                                Mínimo 8 caracteres
                            </li>
                            <li className={/[A-Z]/.test(formData.newPassword) ? 'valid' : ''}>
                                Al menos una letra mayúscula
                            </li>
                            <li className={/[a-z]/.test(formData.newPassword) ? 'valid' : ''}>
                                Al menos una letra minúscula
                            </li>
                            <li className={/[0-9]/.test(formData.newPassword) ? 'valid' : ''}>
                                Al menos un número
                            </li>
                        </ul>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="btn-primary btn-large"
                    >
                        {loading ? 'Cambiando contraseña...' : 'Cambiar Contraseña'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default CambiarContraseña;
