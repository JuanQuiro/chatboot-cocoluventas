import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import './styles/themes.css';
import './styles/typography.css';
import './styles/Override.css'; // GLOBAL OVERRIDE
import App from './App';
import errorMonitor from './services/errorMonitor';

// 🚨 INICIALIZAR ERROR MONITOR ANTES DE TODO
console.log('🚀 [INDEX] Inicializando sistema...');
errorMonitor.init();
console.log('✅ [INDEX] Error monitor activo - NO HABRÁ ERRORES SILENCIOSOS');

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <App />
);
