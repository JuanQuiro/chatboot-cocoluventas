import { createSignal } from 'solid-js';

export default function Logo() {
  return (
    <div class="flex items-center space-x-4">
      <div class="text-5xl animate-float">💎</div>
      <div>
        <h1 class="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          DashOffice
        </h1>
        <p class="text-sm text-gray-500 font-medium">Sistema Empresarial</p>
      </div>
    </div>
  );
}
