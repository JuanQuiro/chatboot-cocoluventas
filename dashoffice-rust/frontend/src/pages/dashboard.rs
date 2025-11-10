use leptos::*;

#[component]
pub fn Dashboard() -> impl IntoView {
    let (stats, set_stats) = create_signal(DashboardStats::default());

    // Cargar stats en tiempo real
    create_effect(move |_| {
        spawn_local(async move {
            // TODO: Load from API
            set_stats(DashboardStats {
                total_bots: 12,
                active_conversations: 45,
                total_orders: 234,
                revenue_today: 15600.50,
                messages_today: 1523,
                conversion_rate: 23.5,
            });
        });
    });

    view! {
        <div class="space-y-6">
            <div>
                <h1 class="text-3xl font-bold text-gray-900">"Dashboard"</h1>
                <p class="mt-1 text-sm text-gray-500">"Visión general del sistema"</p>
            </div>

            // Stats Cards
            <div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                <StatCard
                    title="Bots Activos"
                    value=move || stats().total_bots
                    icon="🤖"
                    trend="+12%"
                    trend_up=true
                />
                <StatCard
                    title="Conversaciones"
                    value=move || stats().active_conversations
                    icon="💬"
                    trend="+8%"
                    trend_up=true
                />
                <StatCard
                    title="Órdenes Hoy"
                    value=move || stats().total_orders
                    icon="🛒"
                    trend="+15%"
                    trend_up=true
                />
                <StatCard
                    title="Ingresos Hoy"
                    value=move || format!("${:.2}", stats().revenue_today)
                    icon="💰"
                    trend="+22%"
                    trend_up=true
                />
                <StatCard
                    title="Mensajes Hoy"
                    value=move || stats().messages_today
                    icon="📨"
                    trend="+5%"
                    trend_up=true
                />
                <StatCard
                    title="Conversión"
                    value=move || format!("{:.1}%", stats().conversion_rate)
                    icon="📈"
                    trend="-2%"
                    trend_up=false
                />
            </div>

            // Charts Row
            <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <div class="bg-white rounded-lg shadow p-6">
                    <h2 class="text-lg font-semibold mb-4">"Mensajes por Hora"</h2>
                    <div class="h-64 flex items-center justify-center text-gray-400">
                        "Gráfico de línea aquí"
                    </div>
                </div>

                <div class="bg-white rounded-lg shadow p-6">
                    <h2 class="text-lg font-semibold mb-4">"Conversiones"</h2>
                    <div class="h-64 flex items-center justify-center text-gray-400">
                        "Gráfico de embudo aquí"
                    </div>
                </div>
            </div>

            // Recent Activity
            <div class="bg-white rounded-lg shadow">
                <div class="px-6 py-4 border-b">
                    <h2 class="text-lg font-semibold">"Actividad Reciente"</h2>
                </div>
                <div class="divide-y">
                    <ActivityItem
                        icon="🤖"
                        title="Nuevo bot creado"
                        description="Bot 'Ventas Coca Cola' creado"
                        time="Hace 5 minutos"
                    />
                    <ActivityItem
                        icon="🛒"
                        title="Nueva orden"
                        description="Orden #1234 por $450.00"
                        time="Hace 12 minutos"
                    />
                    <ActivityItem
                        icon="💬"
                        title="Conversación iniciada"
                        description="Cliente nuevo en WhatsApp"
                        time="Hace 15 minutos"
                    />
                </div>
            </div>
        </div>
    }
}

#[derive(Default, Clone, Copy)]
struct DashboardStats {
    total_bots: u32,
    active_conversations: u32,
    total_orders: u32,
    revenue_today: f64,
    messages_today: u32,
    conversion_rate: f64,
}

#[component]
fn StatCard<F, T>(
    title: &'static str,
    #[prop(into)] value: F,
    icon: &'static str,
    trend: &'static str,
    trend_up: bool,
) -> impl IntoView
where
    F: Fn() -> T + 'static,
    T: std::fmt::Display + 'static,
{
    view! {
        <div class="bg-white rounded-lg shadow p-6">
            <div class="flex items-center justify-between">
                <div>
                    <p class="text-sm font-medium text-gray-600">{title}</p>
                    <p class="mt-2 text-3xl font-bold text-gray-900">{move || value().to_string()}</p>
                </div>
                <div class="text-4xl">{icon}</div>
            </div>
            <div class="mt-4 flex items-center text-sm">
                <span class=move || {
                    format!(
                        "font-semibold {}",
                        if trend_up { "text-green-600" } else { "text-red-600" },
                    )
                }>{trend}</span>
                <span class="ml-2 text-gray-500">"vs. ayer"</span>
            </div>
        </div>
    }
}

#[component]
fn ActivityItem(
    icon: &'static str,
    title: &'static str,
    description: &'static str,
    time: &'static str,
) -> impl IntoView {
    view! {
        <div class="px-6 py-4 hover:bg-gray-50 transition-colors">
            <div class="flex items-start space-x-3">
                <div class="text-2xl">{icon}</div>
                <div class="flex-1 min-w-0">
                    <p class="text-sm font-medium text-gray-900">{title}</p>
                    <p class="text-sm text-gray-500">{description}</p>
                </div>
                <span class="text-xs text-gray-400">{time}</span>
            </div>
        </div>
    }
}
