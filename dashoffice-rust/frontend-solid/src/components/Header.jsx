import { useAuth } from '../stores/auth';
import Logo from './Logo';

export default function Header() {
  const auth = useAuth();

  return (
    <header class="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-6 px-8 shadow-2xl">
      <div class="container mx-auto flex items-center justify-between">
        <Logo />
        <div class="flex items-center space-x-4">
          <div class="text-right">
            <p class="text-sm opacity-90">Bienvenido</p>
            <p class="font-bold">{auth.user()?.name || 'Admin'}</p>
          </div>
          <button 
            onClick={() => auth.logout()}
            class="px-4 py-2 bg-red-500 hover:bg-red-600 rounded-lg font-semibold transition-colors"
          >
            🚪 Salir
          </button>
        </div>
      </div>
    </header>
  );
}
