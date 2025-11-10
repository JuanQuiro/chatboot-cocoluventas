import { Router, Route, Routes } from '@solidjs/router';
import { Show } from 'solid-js';
import { useAuth } from './stores/auth';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Bots from './pages/Bots';
import Products from './pages/Products';
import Orders from './pages/Orders';
import Customers from './pages/Customers';
import Sellers from './pages/Sellers';
import Conversations from './pages/Conversations';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';
import Login from './pages/Login';

export default function App() {
  const auth = useAuth();

  return (
    <Show
      when={auth.isAuthenticated()}
      fallback={<Login />}
    >
      <div class="min-h-screen flex flex-col">
        <Header />
        <div class="flex flex-1">
          <Sidebar />
          <main class="flex-1 overflow-auto bg-gray-50">
            <Routes>
              <Route path="/" component={Dashboard} />
              <Route path="/bots" component={Bots} />
              <Route path="/products" component={Products} />
              <Route path="/orders" component={Orders} />
              <Route path="/customers" component={Customers} />
              <Route path="/sellers" component={Sellers} />
              <Route path="/conversations" component={Conversations} />
              <Route path="/analytics" component={Analytics} />
              <Route path="/settings" component={Settings} />
            </Routes>
          </main>
        </div>
      </div>
    </Show>
  );
}
