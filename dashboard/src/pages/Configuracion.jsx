// Configuracion.jsx - Configuración del sistema
import React, { useState, useEffect } from 'react';
import { useToast } from '../components/common/Toast';
import './Configuracion.css';

const Configuracion = () => {
    const toast = useToast();
    const [loading, setLoading] = useState(false);

    const [companyConfig, setCompanyConfig] = useState({
        name: '',
        rif: '',
        address: '',
        phone: '',
        email: '',
        logo: ''
    });

    const [taxConfig, setTaxConfig] = useState({
        ivaRate: 16,
        applyIvaByDefault: false,
        taxId: ''
    });

    const [paymentMethods, setPaymentMethods] = useState([
        { id: 1, name: 'Efectivo (USD)', enabled: true, type: 'cash' },
        { id: 2, name: 'Zelle (USD)', enabled: true, type: 'digital' },
        { id: 3, name: 'Punto de Venta (VES)', enabled: true, type: 'card' },
        { id: 4, name: 'Pago Móvil (VES)', enabled: true, type: 'digital' },
        { id: 5, name: 'Transferencia (VES)', enabled: true, type: 'digital' }
    ]);

    const [currencyConfig, setCurrencyConfig] = useState({
        defaultCurrency: 'USD',
        exchangeRate: 36.5,
        autoUpdateRate: false
    });

    const [notificationConfig, setNotificationConfig] = useState({
        emailNotifications: true,
        lowStockAlerts: true,
        paymentReminders: true,
        dailyReports: false
    });

    useEffect(() => {
        loadConfiguration();
    }, []);

    const loadConfiguration = async () => {
        // Simular carga desde API
        // En producción: await configService.getConfig();
        setLoading(false);
    };

    const handleSaveCompany = async () => {
        setLoading(true);
        try {
            // await configService.updateCompany(companyConfig);
            toast.success('Configuración de empresa guardada');
        } catch (error) {
            toast.error('Error al guardar configuración');
        } finally {
            setLoading(false);
        }
    };

    const handleSaveTax = async () => {
        setLoading(true);
        try {
            // await configService.updateTax(taxConfig);
            toast.success('Configuración de impuestos guardada');
        } catch (error) {
            toast.error('Error al guardar configuración');
        } finally {
            setLoading(false);
        }
    };

    const handleSavePaymentMethods = async () => {
        setLoading(true);
        try {
            // await configService.updatePaymentMethods(paymentMethods);
            toast.success('Métodos de pago guardados');
        } catch (error) {
            toast.error('Error al guardar métodos de pago');
        } finally {
            setLoading(false);
        }
    };

    const handleSaveCurrency = async () => {
        setLoading(true);
        try {
            // await configService.updateCurrency(currencyConfig);
            toast.success('Configuración de moneda guardada');
        } catch (error) {
            toast.error('Error al guardar configuración');
        } finally {
            setLoading(false);
        }
    };

    const handleSaveNotifications = async () => {
        setLoading(true);
        try {
            // await configService.updateNotifications(notificationConfig);
            toast.success('Configuración de notificaciones guardada');
        } catch (error) {
            toast.error('Error al guardar configuración');
        } finally {
            setLoading(false);
        }
    };

    const togglePaymentMethod = (id) => {
        setPaymentMethods(paymentMethods.map(pm =>
            pm.id === id ? { ...pm, enabled: !pm.enabled } : pm
        ));
    };

    return (
        <div className="configuracion-page">
            <div className="page-header">
                <h1>⚙️ Configuración del Sistema</h1>
                <p>Administra la configuración general del sistema</p>
            </div>

            <div className="config-sections">
                {/* Configuración de Empresa */}
                <div className="config-section">
                    <div className="section-header">
                        <h2>🏢 Información de la Empresa</h2>
                        <button onClick={handleSaveCompany} className="btn-primary" disabled={loading}>
                            💾 Guardar
                        </button>
                    </div>
                    <div className="form-grid">
                        <div className="form-group">
                            <label>Nombre de la Empresa *</label>
                            <input
                                type="text"
                                value={companyConfig.name}
                                onChange={(e) => setCompanyConfig({ ...companyConfig, name: e.target.value })}
                                className="form-control"
                                placeholder="Mi Empresa S.A."
                            />
                        </div>
                        <div className="form-group">
                            <label>RIF/NIT</label>
                            <input
                                type="text"
                                value={companyConfig.rif}
                                onChange={(e) => setCompanyConfig({ ...companyConfig, rif: e.target.value })}
                                className="form-control"
                                placeholder="J-12345678-9"
                            />
                        </div>
                        <div className="form-group full-width">
                            <label>Dirección</label>
                            <input
                                type="text"
                                value={companyConfig.address}
                                onChange={(e) => setCompanyConfig({ ...companyConfig, address: e.target.value })}
                                className="form-control"
                                placeholder="Calle Principal, Ciudad"
                            />
                        </div>
                        <div className="form-group">
                            <label>Teléfono</label>
                            <input
                                type="tel"
                                value={companyConfig.phone}
                                onChange={(e) => setCompanyConfig({ ...companyConfig, phone: e.target.value })}
                                className="form-control"
                                placeholder="+58 412-1234567"
                            />
                        </div>
                        <div className="form-group">
                            <label>Email</label>
                            <input
                                type="email"
                                value={companyConfig.email}
                                onChange={(e) => setCompanyConfig({ ...companyConfig, email: e.target.value })}
                                className="form-control"
                                placeholder="contacto@empresa.com"
                            />
                        </div>
                    </div>
                </div>

                {/* Configuración de Impuestos */}
                <div className="config-section">
                    <div className="section-header">
                        <h2>📄 Configuración de Impuestos</h2>
                        <button onClick={handleSaveTax} className="btn-primary" disabled={loading}>
                            💾 Guardar
                        </button>
                    </div>
                    <div className="form-grid">
                        <div className="form-group">
                            <label>Tasa de IVA (%)</label>
                            <input
                                type="number"
                                step="0.01"
                                value={taxConfig.ivaRate}
                                onChange={(e) => setTaxConfig({ ...taxConfig, ivaRate: parseFloat(e.target.value) })}
                                className="form-control"
                            />
                        </div>
                        <div className="form-group">
                            <label className="checkbox-label">
                                <input
                                    type="checkbox"
                                    checked={taxConfig.applyIvaByDefault}
                                    onChange={(e) => setTaxConfig({ ...taxConfig, applyIvaByDefault: e.target.checked })}
                                />
                                <span>Aplicar IVA por defecto en ventas</span>
                            </label>
                        </div>
                    </div>
                </div>

                {/* Métodos de Pago */}
                <div className="config-section">
                    <div className="section-header">
                        <h2>💳 Métodos de Pago</h2>
                        <button onClick={handleSavePaymentMethods} className="btn-primary" disabled={loading}>
                            💾 Guardar
                        </button>
                    </div>
                    <div className="payment-methods-list">
                        {paymentMethods.map(pm => (
                            <div key={pm.id} className="payment-method-item">
                                <label className="checkbox-label">
                                    <input
                                        type="checkbox"
                                        checked={pm.enabled}
                                        onChange={() => togglePaymentMethod(pm.id)}
                                    />
                                    <span>{pm.name}</span>
                                </label>
                                <span className={`method-type ${pm.type}`}>{pm.type}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Configuración de Moneda */}
                <div className="config-section">
                    <div className="section-header">
                        <h2>💱 Configuración de Moneda</h2>
                        <button onClick={handleSaveCurrency} className="btn-primary" disabled={loading}>
                            💾 Guardar
                        </button>
                    </div>
                    <div className="form-grid">
                        <div className="form-group">
                            <label>Moneda Principal</label>
                            <select
                                value={currencyConfig.defaultCurrency}
                                onChange={(e) => setCurrencyConfig({ ...currencyConfig, defaultCurrency: e.target.value })}
                                className="form-control"
                            >
                                <option value="USD">USD - Dólar Americano</option>
                                <option value="VES">VES - Bolívar</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Tasa de Cambio (USD → VES)</label>
                            <input
                                type="number"
                                step="0.01"
                                value={currencyConfig.exchangeRate}
                                onChange={(e) => setCurrencyConfig({ ...currencyConfig, exchangeRate: parseFloat(e.target.value) })}
                                className="form-control"
                            />
                        </div>
                        <div className="form-group">
                            <label className="checkbox-label">
                                <input
                                    type="checkbox"
                                    checked={currencyConfig.autoUpdateRate}
                                    onChange={(e) => setCurrencyConfig({ ...currencyConfig, autoUpdateRate: e.target.checked })}
                                />
                                <span>Actualizar tasa automáticamente (BCV)</span>
                            </label>
                        </div>
                    </div>
                </div>

                {/* Notificaciones */}
                <div className="config-section">
                    <div className="section-header">
                        <h2>🔔 Notificaciones</h2>
                        <button onClick={handleSaveNotifications} className="btn-primary" disabled={loading}>
                            💾 Guardar
                        </button>
                    </div>
                    <div className="notifications-list">
                        <label className="checkbox-label">
                            <input
                                type="checkbox"
                                checked={notificationConfig.emailNotifications}
                                onChange={(e) => setNotificationConfig({ ...notificationConfig, emailNotifications: e.target.checked })}
                            />
                            <span>Notificaciones por Email</span>
                        </label>
                        <label className="checkbox-label">
                            <input
                                type="checkbox"
                                checked={notificationConfig.lowStockAlerts}
                                onChange={(e) => setNotificationConfig({ ...notificationConfig, lowStockAlerts: e.target.checked })}
                            />
                            <span>Alertas de Stock Bajo</span>
                        </label>
                        <label className="checkbox-label">
                            <input
                                type="checkbox"
                                checked={notificationConfig.paymentReminders}
                                onChange={(e) => setNotificationConfig({ ...notificationConfig, paymentReminders: e.target.checked })}
                            />
                            <span>Recordatorios de Pago</span>
                        </label>
                        <label className="checkbox-label">
                            <input
                                type="checkbox"
                                checked={notificationConfig.dailyReports}
                                onChange={(e) => setNotificationConfig({ ...notificationConfig, dailyReports: e.target.checked })}
                            />
                            <span>Reportes Diarios</span>
                        </label>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Configuracion;
