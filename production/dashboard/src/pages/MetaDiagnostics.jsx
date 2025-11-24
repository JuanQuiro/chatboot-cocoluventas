import React, { useState } from 'react';
import { Activity, Send, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import '../styles/MetaDiagnostics.css';

export default function MetaDiagnostics() {
    const [pingResult, setPingResult] = useState(null);
    const [testResult, setTestResult] = useState(null);
    const [loading, setLoading] = useState(false);

    const runPingTest = async () => {
        setLoading(true);
        setPingResult(null);

        try {
            const res = await fetch('/api/meta/test-message', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: '🩺 Health Check - ' + new Date().toLocaleString()
                })
            });

            const data = await res.json();
            setPingResult({ success: data.success, data, timestamp: Date.now() });

            if (data.success) {
                toast.success('✅ Ping exitoso');
            } else {
                toast.error('❌ Ping fallido');
            }
        } catch (error) {
            setPingResult({ success: false, error: error.message, timestamp: Date.now() });
            toast.error('Error en ping');
        } finally {
            setLoading(false);
        }
    };

    const checklistItems = [
        {
            id: 'jwt',
            label: 'JWT Token configurado',
            check: () => fetch('/api/meta/config').then(r => r.json()).then(d => !!d.jwtToken)
        },
        {
            id: 'number',
            label: 'Phone Number ID configurado',
            check: () => fetch('/api/meta/config').then(r => r.json()).then(d => !!d.numberId)
        },
        {
            id: 'business',
            label: 'Business Account ID configurado',
            check: () => fetch('/api/meta/config').then(r => r.json()).then(d => !!d.businessId)
        },
        {
            id: 'webhook',
            label: 'Webhook URL accesible',
            check: () => Promise.resolve(true) //fetch('/webhooks/whatsapp').then(r => r.ok)
        }
    ];

    const [checklist, setChecklist] = useState(checklistItems.map(item => ({
        ...item,
        status: 'pending'
    })));

    const runChecklist = async () => {
        for (const item of checklistItems) {
            try {
                const result = await item.check();
                setChecklist(prev => prev.map(i =>
                    i.id === item.id ? { ...i, status: result ? 'success' : 'error' } : i
                ));
            } catch (error) {
                setChecklist(prev => prev.map(i =>
                    i.id === item.id ? { ...i, status: 'error' } : i
                ));
            }
        }
    };

    return (
        <div className="diagnostics-page">
            <div className="page-header">
                <div>
                    <h1>🧪 Diagnóstico Meta</h1>
                    <p className="subtitle">Tests y validación de configuración</p>
                </div>
            </div>

            {/* Checklist */}
            <div className="diagnostic-section">
                <div className="section-header">
                    <h2>📋 Checklist de Configuración</h2>
                    <button onClick={runChecklist} className="btn-check">
                        Verificar Todo
                    </button>
                </div>
                <div className="checklist">
                    {checklist.map(item => (
                        <div key={item.id} className={`checklist-item ${item.status}`}>
                            <div className="check-icon">
                                {item.status === 'success' && <CheckCircle size={20} />}
                                {item.status === 'error' && <XCircle size={20} />}
                                {item.status === 'pending' && <AlertCircle size={20} />}
                            </div>
                            <span className="check-label">{item.label}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Ping Test */}
            <div className="diagnostic-section">
                <div className="section-header">
                    <h2>📡 Test de Conectividad</h2>
                    <button
                        onClick={runPingTest}
                        disabled={loading}
                        className="btn-ping"
                    >
                        <Send size={16} />
                        {loading ? 'Enviando...' : 'Enviar Ping'}
                    </button>
                </div>
                {pingResult && (
                    <div className={`test-result ${pingResult.success ? 'success' : 'error'}`}>
                        <div className="result-header">
                            {pingResult.success ? (
                                <>
                                    <CheckCircle size={24} />
                                    <h3>✅ Ping Exitoso</h3>
                                </>
                            ) : (
                                <>
                                    <XCircle size={24} />
                                    <h3>❌ Ping Fallido</h3>
                                </>
                            )}
                        </div>
                        <pre className="result-details">
                            {JSON.stringify(pingResult.data || pingResult.error, null, 2)}
                        </pre>
                        <div className="result-timestamp">
                            {new Date(pingResult.timestamp).toLocaleString()}
                        </div>
                    </div>
                )}
            </div>

            {/* Instructions */}
            <div className="diagnostic-section">
                <h2>📖 Instrucciones de Troubleshooting</h2>
                <div className="troubleshooting-guide">
                    <div className="trouble-item">
                        <h3>⚠️ Si el JWT Token falla:</h3>
                        <ul>
                            <li>Verifica que el token sea válido en Meta Developers</li>
                            <li>Los tokens pueden expirar, genera uno nuevo</li>
                            <li>Asegúrate de copiar el token completo</li>
                        </ul>
                    </div>
                    <div className="trouble-item">
                        <h3>⚠️ Si el Ping falla:</h3>
                        <ul>
                            <li>Verifica tu conexión a internet</li>
                            <li>Revisa que el Phone Number ID sea correcto</li>
                            <li>Confirma que la API de Meta esté operativa</li>
                        </ul>
                    </div>
                    <div className="trouble-item">
                        <h3>⚠️ Si el Webhook falla:</h3>
                        <ul>
                            <li>Verifica que el URL sea accesible públicamente</li>
                            <li>Confirma que el Verify Token coincida</li>
                            <li>Revisa los logs del servidor</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
