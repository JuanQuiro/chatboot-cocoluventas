export default function StatCard(props) {
  const borderColor = () => {
    const colors = {
      blue: 'border-blue-500',
      green: 'border-green-500',
      purple: 'border-purple-500',
      indigo: 'border-indigo-500',
    };
    return colors[props.color] || 'border-gray-500';
  };

  return (
    <div class={`card-3d bg-white rounded-xl shadow-lg p-6 border-l-4 ${borderColor()}`}>
      <div class="flex items-start justify-between">
        <div class="flex-1">
          <p class="text-sm font-medium text-gray-600 mb-2">{props.title}</p>
          <p class="text-4xl font-bold text-gray-900">{props.value}</p>
          <p class="text-sm text-green-600 font-semibold mt-2">
            ↗ {props.trend}
          </p>
        </div>
        <div class="text-5xl opacity-20">{props.icon}</div>
      </div>
    </div>
  );
}
