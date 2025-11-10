/* @refresh reload */
import { render } from 'solid-js/web';
import { Router } from '@solidjs/router';
import { AuthProvider } from './stores/auth';
import App from './App';
import './index.css';

const root = document.getElementById('root');

render(
  () => (
    <AuthProvider>
      <Router>
        <App />
      </Router>
    </AuthProvider>
  ),
  root
);
