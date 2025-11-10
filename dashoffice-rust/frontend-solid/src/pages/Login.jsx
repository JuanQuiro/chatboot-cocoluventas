import { createSignal } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import { useAuth } from '../stores/auth';

export default function Login() {
  const [email, setEmail] = createSignal('');
  const [password, setPassword] = createSignal('');
  const auth = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    await auth.login(email(), password());
    navigate('/');
  };

  return (
    <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 to-purple-600">
      <div class="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <h1 class="text-3xl font-bold text-center mb-8">DashOffice</h1>
        <form onSubmit={handleSubmit} class="space-y-6">
          <input
            type="email"
            placeholder="Email"
            value={email()}
            onInput={(e) => setEmail(e.target.value)}
            class="w-full px-4 py-3 border rounded-lg"
          />
          <input
            type="password"
            placeholder="Password"
            value={password()}
            onInput={(e) => setPassword(e.target.value)}
            class="w-full px-4 py-3 border rounded-lg"
          />
          <button class="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700">
            Iniciar Sesión
          </button>
        </form>
      </div>
    </div>
  );
}
