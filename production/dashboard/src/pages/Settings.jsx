import React, { useState, useEffect } from 'react';
import '../styles/Settings.css';

export default function Settings() {
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [editingKey, setEditingKey] = useState(null);
  const [editingValue, setEditingValue] = useState('');
  const [newKey, setNewKey] = useState('');
  const [newValue, setNewValue] = useState('');

  // Cargar configuración
  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/settings');
      const data = await response.json();
      
      if (data.success) {
        setSettings(data.settings);
        setError(null);
      } else {
        setError(data.error || 'Error al cargar configuración');
      }
    } catch (err) {
      setError('Error al conectar con el servidor');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSetting = async (key, value) => {
    try {
      const response = await fetch(`/api/settings/${key}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ value })
      });

      const data = await response.json();
      
      if (data.success) {
        setSuccess(`✅ ${key} actualizado correctamente`);
        setEditingKey(null);
        fetchSettings();
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(data.error || 'Error al actualizar');
      }
    } catch (err) {
      setError('Error al conectar con el servidor');
      console.error(err);
    }
  };

  const handleAddSetting = async () => {
    if (!newKey.trim() || !newValue.trim()) {
      setError('Clave y valor son requeridos');
      return;
    }

    try {
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings: { [newKey]: newValue } })
      });

      const data = await response.json();
      
      if (data.success) {
        setSuccess(`✅ ${newKey} agregado correctamente`);
        setNewKey('');
        setNewValue('');
        fetchSettings();
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(data.error || 'Error al agregar');
      }
    } catch (err) {
      setError('Error al conectar con el servidor');
      console.error(err);
    }
  };

  const handleDeleteSetting = async (key) => {
    if (!window.confirm(`¿Estás seguro de que deseas eliminar ${key}?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/settings/${key}`, {
        method: 'DELETE'
      });

      const data = await response.json();
      
      if (data.success) {
        setSuccess(`✅ ${key} eliminado correctamente`);
        fetchSettings();
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(data.error || 'Error al eliminar');
      }
    } catch (err) {
      setError('Error al conectar con el servidor');
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="settings-container">
        <div className="loading">Cargando configuración...</div>
      </div>
    );
  }

  return (
    <div className="settings-container">
      <div className="settings-header">
        <h1>⚙️ Configuración del Bot</h1>
        <p>Gestiona las variables de entorno (.env) del bot</p>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {/* Sección: Agregar nueva variable */}
      <div className="settings-section">
        <h2>➕ Agregar Nueva Variable</h2>
        <div className="add-setting-form">
          <input
            type="text"
            placeholder="Nombre de la variable (ej: BOT_ADAPTER)"
            value={newKey}
            onChange={(e) => setNewKey(e.target.value.toUpperCase())}
            className="input-field"
          />
          <input
            type="text"
            placeholder="Valor (ej: meta)"
            value={newValue}
            onChange={(e) => setNewValue(e.target.value)}
            className="input-field"
          />
          <button onClick={handleAddSetting} className="btn btn-primary">
            Agregar Variable
          </button>
        </div>
      </div>

      {/* Sección: Variables existentes */}
      <div className="settings-section">
        <h2>📋 Variables Actuales</h2>
        <div className="settings-list">
          {Object.entries(settings).length === 0 ? (
            <p className="no-settings">No hay variables configuradas</p>
          ) : (
            Object.entries(settings).map(([key, data]) => (
              <div key={key} className="setting-item">
                <div className="setting-key">
                  <span className="key-name">{key}</span>
                  {data.isSensitive && <span className="sensitive-badge">🔒 Sensible</span>}
                </div>
                
                {editingKey === key ? (
                  <div className="setting-edit">
                    <input
                      type="text"
                      value={editingValue}
                      onChange={(e) => setEditingValue(e.target.value)}
                      className="input-field"
                      autoFocus
                    />
                    <button
                      onClick={() => handleUpdateSetting(key, editingValue)}
                      className="btn btn-success btn-sm"
                    >
                      Guardar
                    </button>
                    <button
                      onClick={() => setEditingKey(null)}
                      className="btn btn-secondary btn-sm"
                    >
                      Cancelar
                    </button>
                  </div>
                ) : (
                  <div className="setting-value">
                    <code>{data.value}</code>
                    <div className="setting-actions">
                      <button
                        onClick={() => {
                          setEditingKey(key);
                          setEditingValue(data.original || data.value);
                        }}
                        className="btn btn-edit btn-sm"
                      >
                        ✏️ Editar
                      </button>
                      <button
                        onClick={() => handleDeleteSetting(key)}
                        className="btn btn-danger btn-sm"
                      >
                        🗑️ Eliminar
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Sección: Información importante */}
      <div className="settings-section info-section">
        <h2>ℹ️ Información Importante</h2>
        <ul className="info-list">
          <li><strong>BOT_ADAPTER</strong>: Selecciona el adaptador (meta, baileys, etc.)</li>
          <li><strong>META_JWT_TOKEN</strong>: Token de autenticación de Meta Business API</li>
          <li><strong>META_NUMBER_ID</strong>: ID del número de WhatsApp Business</li>
          <li><strong>META_VERIFY_TOKEN</strong>: Token para verificar webhooks de Meta</li>
          <li><strong>PORT</strong>: Puerto en el que corre el bot (por defecto 3008)</li>
          <li className="warning">⚠️ Los cambios se guardan inmediatamente en el archivo .env</li>
          <li className="warning">⚠️ Algunos cambios pueden requerir reiniciar el contenedor</li>
        </ul>
      </div>
    </div>
  );
}
