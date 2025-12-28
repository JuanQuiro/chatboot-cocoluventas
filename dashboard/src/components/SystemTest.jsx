/**
 * System Test Component
 * Verifica que todos los sistemas estén funcionando
 */

import React, { useEffect, useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useTypography } from '../contexts/TypographyContext';
import { useAuth } from '../contexts/AuthContext';

const SystemTest = () => {
    const [tests, setTests] = useState({});
    
    // Test contexts
    const testContexts = () => {
        const results = {};
        
        try {
            const theme = useTheme();
            results.theme = theme ? '✅ OK' : '❌ Fallo';
        } catch (e) {
            results.theme = '❌ Error: ' + e.message;
        }
        
        try {
            const typography = useTypography();
            results.typography = typography ? '✅ OK' : '❌ Fallo';
        } catch (e) {
            results.typography = '❌ Error: ' + e.message;
        }
        
        try {
            const auth = useAuth();
            results.auth = auth ? '✅ OK' : '❌ Fallo';
        } catch (e) {
            results.auth = '❌ Error: ' + e.message;
        }
        
        setTests(results);
    };
    
    useEffect(() => {
        testContexts();
    }, []);
    
    return (
        <div style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            background: 'white',
            padding: '15px',
            borderRadius: '8px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            zIndex: 9999,
            fontSize: '12px',
            fontFamily: 'monospace',
            border: '2px solid #e5e7eb'
        }}>
            <div style={{ fontWeight: 'bold', marginBottom: '10px' }}>
                🔍 System Status
            </div>
            <div>Theme: {tests.theme || '⏳ Testing...'}</div>
            <div>Typography: {tests.typography || '⏳ Testing...'}</div>
            <div>Auth: {tests.auth || '⏳ Testing...'}</div>
        </div>
    );
};

// Wrapper para usar fuera del contexto
const SystemTestWrapper = () => {
    try {
        return <SystemTest />;
    } catch (e) {
        return (
            <div style={{
                position: 'fixed',
                bottom: '20px',
                right: '20px',
                background: '#fee2e2',
                color: '#991b1b',
                padding: '15px',
                borderRadius: '8px',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                zIndex: 9999,
                fontSize: '12px',
                fontFamily: 'monospace'
            }}>
                ❌ Test Error: {e.message}
            </div>
        );
    }
};

export default SystemTestWrapper;
