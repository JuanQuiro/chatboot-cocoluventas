use yew::prelude::*;
use serde::{Deserialize, Serialize};

#[derive(Clone, PartialEq, Serialize, Deserialize)]
struct Stats {
    revenue: String,
    orders: String,
    customers: String,
    bots: String,
}

#[function_component(Dashboard)]
fn dashboard() -> Html {
    let stats = Stats {
        revenue: "$125,430".to_string(),
        orders: "1,547".to_string(),
        customers: "892".to_string(),
        bots: "12".to_string(),
    };

    html! {
        <div class="min-h-screen bg-gray-50">
            // Header
            <header class="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-6 px-8 shadow-lg">
                <div class="flex items-center justify-between">
                    <div class="flex items-center space-x-4">
                        <div class="text-4xl">{"💎"}</div>
                        <div>
                            <h1 class="text-3xl font-bold">{"DashOffice"}</h1>
                            <p class="text-sm opacity-90">{"Sistema Empresarial Premium"}</p>
                        </div>
                    </div>
                    <div class="text-right">
                        <p class="text-sm opacity-90">{"Bienvenido"}</p>
                        <p class="font-semibold">{"Admin User"}</p>
                    </div>
                </div>
            </header>

            // Main Content
            <main class="p-8">
                // Quote Banner
                <div class="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 rounded-xl p-8 mb-8 shadow-xl">
                    <div class="flex items-center space-x-4">
                        <div class="text-5xl">{"🚀"}</div>
                        <div>
                            <p class="text-2xl font-bold text-white">{"Innovación que transforma negocios"}</p>
                            <p class="text-blue-100 text-sm font-medium">{"DashOffice Enterprise System"}</p>
                        </div>
                    </div>
                </div>

                // Stats Grid
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <StatCard 
                        title="Ingresos del Mes" 
                        value={stats.revenue.clone()} 
                        icon="💰"
                        trend="+12.5%"
                        color="blue"
                    />
                    <StatCard 
                        title="Órdenes" 
                        value={stats.orders.clone()} 
                        icon="📦"
                        trend="+8.2%"
                        color="green"
                    />
                    <StatCard 
                        title="Clientes" 
                        value={stats.customers.clone()} 
                        icon="👥"
                        trend="+15.3%"
                        color="purple"
                    />
                    <StatCard 
                        title="Bots Activos" 
                        value={stats.bots.clone()} 
                        icon="🤖"
                        trend="100%"
                        color="indigo"
                    />
                </div>

                // Quick Actions
                <div class="bg-white rounded-xl shadow-lg p-6 mb-8">
                    <h2 class="text-2xl font-bold mb-6 text-gray-800">{"Acciones Rápidas"}</h2>
                    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <ActionButton icon="🤖" label="Gestionar Bots" />
                        <ActionButton icon="📊" label="Ver Analytics" />
                        <ActionButton icon="👥" label="CRM Clientes" />
                        <ActionButton icon="⚙️" label="Configuración" />
                    </div>
                </div>

                // Recent Activity
                <div class="bg-white rounded-xl shadow-lg p-6">
                    <h2 class="text-2xl font-bold mb-6 text-gray-800">{"Actividad Reciente"}</h2>
                    <div class="space-y-4">
                        <ActivityItem 
                            icon="✅" 
                            title="Nueva orden recibida" 
                            time="Hace 5 minutos"
                            color="green"
                        />
                        <ActivityItem 
                            icon="💬" 
                            title="Mensaje de cliente" 
                            time="Hace 12 minutos"
                            color="blue"
                        />
                        <ActivityItem 
                            icon="🤖" 
                            title="Bot actualizado" 
                            time="Hace 1 hora"
                            color="purple"
                        />
                        <ActivityItem 
                            icon="📈" 
                            title="Reporte generado" 
                            time="Hace 2 horas"
                            color="indigo"
                        />
                    </div>
                </div>
            </main>
        </div>
    }
}

#[derive(Properties, PartialEq)]
struct StatCardProps {
    title: String,
    value: String,
    icon: String,
    trend: String,
    color: String,
}

#[function_component(StatCard)]
fn stat_card(props: &StatCardProps) -> Html {
    let border_color = match props.color.as_str() {
        "blue" => "border-blue-500",
        "green" => "border-green-500",
        "purple" => "border-purple-500",
        "indigo" => "border-indigo-500",
        _ => "border-gray-500",
    };

    html! {
        <div class={format!("bg-white rounded-lg shadow-lg p-6 border-l-4 {} transform hover:scale-105 transition-all duration-300", border_color)}>
            <div class="flex items-start justify-between">
                <div class="flex-1">
                    <p class="text-sm font-medium text-gray-600 mb-2">{&props.title}</p>
                    <p class="text-3xl font-bold text-gray-900">{&props.value}</p>
                    <p class="text-sm text-green-600 font-semibold mt-2">
                        {"↗ "}{&props.trend}
                    </p>
                </div>
                <div class="text-4xl opacity-20">{&props.icon}</div>
            </div>
        </div>
    }
}

#[derive(Properties, PartialEq)]
struct ActionButtonProps {
    icon: String,
    label: String,
}

#[function_component(ActionButton)]
fn action_button(props: &ActionButtonProps) -> Html {
    html! {
        <button class="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-4 px-6 rounded-lg shadow-lg transform hover:scale-105 transition-all duration-300 flex flex-col items-center space-y-2">
            <span class="text-3xl">{&props.icon}</span>
            <span class="text-sm">{&props.label}</span>
        </button>
    }
}

#[derive(Properties, PartialEq)]
struct ActivityItemProps {
    icon: String,
    title: String,
    time: String,
    color: String,
}

#[function_component(ActivityItem)]
fn activity_item(props: &ActivityItemProps) -> Html {
    let bg_color = match props.color.as_str() {
        "green" => "bg-green-100",
        "blue" => "bg-blue-100",
        "purple" => "bg-purple-100",
        "indigo" => "bg-indigo-100",
        _ => "bg-gray-100",
    };

    html! {
        <div class="flex items-center space-x-4 p-4 hover:bg-gray-50 rounded-lg transition-colors">
            <div class={format!("w-12 h-12 {} rounded-full flex items-center justify-center text-2xl", bg_color)}>
                {&props.icon}
            </div>
            <div class="flex-1">
                <p class="font-semibold text-gray-900">{&props.title}</p>
                <p class="text-sm text-gray-500">{&props.time}</p>
            </div>
        </div>
    }
}

#[function_component(App)]
fn app() -> Html {
    html! {
        <Dashboard />
    }
}

fn main() {
    console_error_panic_hook::set_once();
    yew::Renderer::<App>::new().render();
}
