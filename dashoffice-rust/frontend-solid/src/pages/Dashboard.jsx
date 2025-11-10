import { createSignal, onMount } from 'solid-js';
import StatCard from '../components/StatCard';

export default function Dashboard() {
  const [stats] = createSignal({
    revenue: '$125,430',
    orders: '1,547',
    customers: '892',
    bots: '12'
  });

  return (
    <div class="p-8 space-y-8">
      {/* Quote Banner */}
      <div class="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 rounded-2xl p-8 shadow-2xl">
        <div class="flex items-center space-x-4">
          <div class="text-6xl">🚀</div>
          <div>
            <p class="text-3xl font-bold text-white">Innovación que transforma negocios</p>
            <p class="text-blue-100 mt-2">DashOffice Enterprise System</p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Ingresos del Mes"
          value={stats().revenue}
          icon="💰"
          trend="+12.5%"
          color="blue"
        />
        <StatCard 
          title="Órdenes"
          value={stats().orders}
          icon="📦"
          trend="+8.2%"
          color="green"
        />
        <StatCard 
          title="Clientes"
          value={stats().customers}
          icon="👥"
          trend="+15.3%"
          color="purple"
        />
        <StatCard 
          title="Bots Activos"
          value={stats().bots}
          icon="🤖"
          trend="100%"
          color="indigo"
        />
      </div>

      {/* Activity */}
      <div class="bg-white rounded-2xl shadow-2xl p-8">
        <h2 class="text-3xl font-bold mb-6">Actividad Reciente</h2>
        <div class="space-y-4">
          <div class="flex items-center space-x-4 p-4 hover:bg-gray-50 rounded-xl">
            <div class="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-2xl">✅</div>
            <div>
              <p class="font-bold">Nueva orden recibida</p>
              <p class="text-sm text-gray-500">Hace 5 minutos</p>
            </div>
          </div>
          <div class="flex items-center space-x-4 p-4 hover:bg-gray-50 rounded-xl">
            <div class="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-2xl">💬</div>
            <div>
              <p class="font-bold">Mensaje de cliente</p>
              <p class="text-sm text-gray-500">Hace 12 minutos</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
