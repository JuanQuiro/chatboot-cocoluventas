import React, { useState, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import '../styles/Messages.css';

export default function Messages() {
    const [messages, setMessages] = useState({ received: [], sent: [], errors: [] });
    const [selectedMessage, setSelectedMessage] = useState(null);
    const [selectedType, setSelectedType] = useState(null);
    const [loading, setLoading] = useState(true);
    const [lastUpdate, setLastUpdate] = useState(null);

    const fetchMessages = async () => {
        try {
            const res = await fetch('/api/open/messages');

            // Si la API no existe (404), usar datos vacíos
            if (!res.ok) {
                setMessages({ received: [], sent: [], errors: [] });
                setLastUpdate(new Date());
                setLoading(false);
                return;
            }

            const json = await res.json();
            if (json.success) {
                setMessages(json.data || { received: [], sent: [], errors: [] });
                setLastUpdate(new Date());
            }
        } catch (error) {
            console.error('Error fetching messages:', error);
            setMessages({ received: [], sent: [], errors: [] });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMessages();

        // SSE connection for real-time updates
        const eventSource = new EventSource('/api/events');
        eventSource.addEventListener('messages', (evt) => {
            try {
                const data = JSON.parse(evt.data);
                setMessages(data);
                setLastUpdate(new Date());
            } catch (e) {
                console.error('Error parsing SSE:', e);
            }
        });

        return () => eventSource.close();
    }, []);

    const statsLastHour = () => {
        const oneHourAgo = Date.now() - 3600000;
        const inHour = messages.received.filter(m => new Date(m.timestamp).getTime() >= oneHourAgo).length;
        const outHour = messages.sent.filter(m => new Date(m.timestamp).getTime() >= oneHourAgo).length;
        const errHour = messages.errors.filter(m => new Date(m.timestamp).getTime() >= oneHourAgo).length;
        return { inHour, outHour, errHour };
    };

    const { inHour, outHour, errHour } = statsLastHour();

    return (
        <div className="messages-page">
            <div className="page-header">
                <div>
                    <h1>💬 Mensajes del Bot</h1>
                    <p className="subtitle">Monitor de mensajes en tiempo real</p>
                </div>
                <div className="header-actions">
                    {lastUpdate && (
                        <span className="last-update">
                            Última actualización: {lastUpdate.toLocaleTimeString()}
                        </span>
                    )}
                    <button onClick={fetchMessages} className="btn-refresh" disabled={loading}>
                        <RefreshCw className={loading ? 'spinning' : ''} size={16} />
                        Actualizar
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="stats-grid">
                <div className="stat-card received">
                    <div className="stat-icon">📥</div>
                    <div className="stat-content">
                        <div className="stat-label">Recibidos</div>
                        <div className="stat-value">{messages.received.length}</div>
                        <div className="stat-detail">+{inHour} última hora</div>
                    </div>
                </div>
                <div className="stat-card sent">
                    <div className="stat-icon">📤</div>
                    <div className="stat-content">
                        <div className="stat-label">Enviados</div>
                        <div className="stat-value">{messages.sent.length}</div>
                        <div className="stat-detail">+{outHour} última hora</div>
                    </div>
                </div>
                <div className="stat-card errors">
                    <div className="stat-icon">⚠️</div>
                    <div className="stat-content">
                        <div className="stat-label">Errores</div>
                        <div className="stat-value">{messages.errors.length}</div>
                        <div className="stat-detail">+{errHour} última hora</div>
                    </div>
                </div>
            </div>

            {/* Messages Tables */}
            <div className="messages-grid">
                {/* Received Messages */}
                <div className="message-section">
                    <h2>📥 Recibidos <span className="badge">{messages.received.length}</span></h2>
                    <div className="table-container">
                        <table className="messages-table">
                            <thead>
                                <tr>
                                    <th>Hora</th>
                                    <th>De</th>
                                    <th>Tipo</th>
                                    <th>Mensaje</th>
                                </tr>
                            </thead>
                            <tbody>
                                {messages.received.slice().reverse().map((msg, idx) => (
                                    <tr
                                        key={idx}
                                        onClick={() => { setSelectedMessage(msg); setSelectedType('received'); }}
                                        className={selectedMessage === msg ? 'selected' : ''}
                                    >
                                        <td>{new Date(msg.timestamp).toLocaleTimeString()}</td>
                                        <td>{msg.from || '-'}</td>
                                        <td><span className="pill pill-in">Texto</span></td>
                                        <td className="text-preview">{msg.body || '-'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Sent Messages */}
                <div className="message-section">
                    <h2>📤 Enviados <span className="badge">{messages.sent.length}</span></h2>
                    <div className="table-container">
                        <table className="messages-table">
                            <thead>
                                <tr>
                                    <th>Hora</th>
                                    <th>Para</th>
                                    <th>Estado</th>
                                    <th>Mensaje</th>
                                </tr>
                            </thead>
                            <tbody>
                                {messages.sent.slice().reverse().map((msg, idx) => (
                                    <tr
                                        key={idx}
                                        onClick={() => { setSelectedMessage(msg); setSelectedType('sent'); }}
                                        className={selectedMessage === msg ? 'selected' : ''}
                                    >
                                        <td>{new Date(msg.timestamp).toLocaleTimeString()}</td>
                                        <td>{msg.to || '-'}</td>
                                        <td><span className="pill pill-out">{msg.status || 'enviado'}</span></td>
                                        <td className="text-preview">{msg.body || '-'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Error Messages */}
                <div className="message-section">
                    <h2>⚠️ Errores <span className="badge">{messages.errors.length}</span></h2>
                    <div className="table-container">
                        <table className="messages-table">
                            <thead>
                                <tr>
                                    <th>Hora</th>
                                    <th>Contexto</th>
                                    <th colSpan="2">Error</th>
                                </tr>
                            </thead>
                            <tbody>
                                {messages.errors.slice().reverse().map((err, idx) => (
                                    <tr
                                        key={idx}
                                        onClick={() => { setSelectedMessage(err); setSelectedType('errors'); }}
                                        className={selectedMessage === err ? 'selected' : ''}
                                    >
                                        <td>{new Date(err.timestamp).toLocaleTimeString()}</td>
                                        <td>{err.context || '-'}</td>
                                        <td className="error-text" colSpan="2">{err.error || '-'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Message Detail Panel */}
            {selectedMessage && (
                <div className="message-detail">
                    <div className="detail-header">
                        <h3>🔍 Detalle del Mensaje ({selectedType})</h3>
                        <button onClick={() => setSelectedMessage(null)} className="btn-close">×</button>
                    </div>
                    <pre className="detail-content">
                        {JSON.stringify(selectedMessage, null, 2)}
                    </pre>
                </div>
            )}
        </div>
    );
}
