use leptos::*;
use leptos_router::*;

#[component]
pub fn Layout() -> impl IntoView {
    let (sidebar_open, set_sidebar_open) = create_signal(true);

    view! {
        <div class="flex h-screen bg-gray-100">
            // Sidebar
            <aside
                class=move || {
                    format!(
                        "flex flex-col w-64 bg-gray-900 text-white transition-all duration-300 {}",
                        if sidebar_open() { "" } else { "-ml-64" },
                    )
                }
            >
                <div class="flex items-center justify-between h-16 px-4 bg-gray-800">
                    <h1 class="text-xl font-bold">"DashOffice"</h1>
                    <button
                        on:click=move |_| set_sidebar_open(!sidebar_open())
                        class="p-2 rounded hover:bg-gray-700"
                    >
                        "☰"
                    </button>
                </div>

                <nav class="flex-1 px-2 py-4 space-y-2 overflow-y-auto">
                    <NavLink href="/" icon="📊">
                        "Dashboard"
                    </NavLink>
                    <NavLink href="/bots" icon="🤖">
                        "Bots"
                    </NavLink>
                    <NavLink href="/products" icon="📦">
                        "Productos"
                    </NavLink>
                    <NavLink href="/orders" icon="🛒">
                        "Órdenes"
                    </NavLink>
                    <NavLink href="/customers" icon="👥">
                        "Clientes"
                    </NavLink>
                    <NavLink href="/sellers" icon="💼">
                        "Vendedores"
                    </NavLink>
                    <NavLink href="/conversations" icon="💬">
                        "Conversaciones"
                    </NavLink>
                    <NavLink href="/analytics" icon="📈">
                        "Analytics"
                    </NavLink>
                    <NavLink href="/settings" icon="⚙️">
                        "Configuración"
                    </NavLink>
                </nav>

                <div class="p-4 border-t border-gray-700">
                    <div class="flex items-center space-x-3">
                        <div class="w-10 h-10 bg-gray-600 rounded-full"></div>
                        <div class="flex-1">
                            <p class="text-sm font-medium">"Usuario"</p>
                            <p class="text-xs text-gray-400">"admin@dashoffice.com"</p>
                        </div>
                    </div>
                </div>
            </aside>

            // Main Content
            <main class="flex-1 overflow-y-auto">
                <header class="bg-white shadow-sm">
                    <div class="flex items-center justify-between h-16 px-6">
                        <button
                            on:click=move |_| set_sidebar_open(!sidebar_open())
                            class="p-2 rounded hover:bg-gray-100 lg:hidden"
                        >
                            "☰"
                        </button>

                        <div class="flex items-center space-x-4">
                            <button class="relative p-2 rounded hover:bg-gray-100">
                                "🔔"
                                <span class="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                            </button>
                        </div>
                    </div>
                </header>

                <div class="p-6">
                    <Outlet/>
                </div>
            </main>
        </div>
    }
}

#[component]
fn NavLink(href: &'static str, icon: &'static str, children: Children) -> impl IntoView {
    view! {
        <A
            href=href
            class="flex items-center px-4 py-3 rounded-lg transition-colors hover:bg-gray-800"
            active_class="bg-gray-800 border-l-4 border-blue-500"
        >
            <span class="mr-3 text-xl">{icon}</span>
            <span class="text-sm font-medium">{children()}</span>
        </A>
    }
}
