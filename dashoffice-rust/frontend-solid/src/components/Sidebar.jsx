import { A } from '@solidjs/router';

export default function Sidebar() {
  const links = [
    { href: '/', icon: '📊', label: 'Dashboard' },
    { href: '/bots', icon: '🤖', label: 'Bots' },
    { href: '/products', icon: '📦', label: 'Productos' },
    { href: '/orders', icon: '🛒', label: 'Órdenes' },
    { href: '/customers', icon: '👥', label: 'Clientes' },
    { href: '/sellers', icon: '💼', label: 'Vendedores' },
    { href: '/conversations', icon: '💬', label: 'Conversaciones' },
    { href: '/analytics', icon: '📈', label: 'Analytics' },
    { href: '/settings', icon: '⚙️', label: 'Configuración' },
  ];

  return (
    <aside class="w-64 bg-white shadow-xl min-h-screen">
      <nav class="p-4 space-y-2">
        {links.map(link => (
          <A
            href={link.href}
            class="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-blue-50 transition-colors"
            activeClass="bg-blue-100 text-blue-700 font-semibold"
          >
            <span class="text-2xl">{link.icon}</span>
            <span>{link.label}</span>
          </A>
        ))}
      </nav>
    </aside>
  );
}
