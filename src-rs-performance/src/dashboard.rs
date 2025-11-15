//! Dashboard Leptos - Componentes y App principal

use leptos::*;
use leptos_meta::*;
use leptos_router::*;
use serde::{Deserialize, Serialize};

#[component]
pub fn App(cx: Scope) -> impl IntoView {
    provide_meta_context(cx);

    view! { cx,
        <Stylesheet id="leptos" href="/pkg/cocolu_dashboard.css"/>
        <Title text="Cocolu Bot - Dashboard"/>
        <Meta name="description" content="Dashboard profesional para Cocolu Bot"/>

        <Router>
            <Layout>
                <Routes>
                    <Route path="" view=Dashboard/>
                    <Route path="metrics" view=MetricsPage/>
                    <Route path="analytics" view=AnalyticsPage/>
                </Routes>
            </Layout>
        </Router>
    }
}

#[component]
fn Layout(cx: Scope, children: Children) -> impl IntoView {
    view! { cx,
        <div class="app-container" style="font-family: system-ui, -apple-system, sans-serif;">
            <Sidebar/>
            <main class="main-content" style="margin-left: 250px; padding: 20px;">
                <Header/>
                <div class="content">
                    {children(cx)}
                </div>
            </main>
        </div>
    }
}

#[component]
fn Sidebar(cx: Scope) -> impl IntoView {
    view! { cx,
        <aside style="position: fixed; left: 0; top: 0; width: 250px; height: 100vh; background: #1f2937; color: white; padding: 20px;">
            <h2 style="margin-bottom: 30px; color: #818cf8;">"🤖 Cocolu Bot"</h2>
            <nav style="display: flex; flex-direction: column; gap: 10px;">
                <A href="/" style="color: white; text-decoration: none; padding: 10px; border-radius: 6px; hover:background: #374151;">
                    "📊 Dashboard"
                </A>
                <A href="/metrics" style="color: white; text-decoration: none; padding: 10px; border-radius: 6px; hover:background: #374151;">
                    "📈 Métricas"
                </A>
                <A href="/analytics" style="color: white; text-decoration: none; padding: 10px; border-radius: 6px; hover:background: #374151;">
                    "📊 Analytics"
                </A>
            </nav>
        </aside>
    }
}

#[component]
fn Header(cx: Scope) -> impl IntoView {
    view! { cx,
        <header style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h1 style="margin: 0; color: #1f2937;">"Cocolu Bot Dashboard"</h1>
            <p style="margin: 5px 0 0 0; color: #6b7280;">"Sistema híbrido Rust + Node.js"</p>
        </header>
    }
}

#[component]
fn Dashboard(cx: Scope) -> impl IntoView {
    let (metrics, set_metrics) = create_signal(cx, None::<MetricsData>);
    
    // Cargar métricas al montar (SSR - se carga en servidor)
    // En SSR, los datos se pueden cargar directamente desde el servidor
    // Por ahora, mostramos datos estáticos o cargamos vía API en el cliente

    view! { cx,
        <div class="dashboard-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px;">
            <StatusCard metrics=metrics/>
            <MetricsCard metrics=metrics/>
            <PerformanceCard metrics=metrics/>
        </div>
    }
}

#[component]
fn StatusCard(cx: Scope, metrics: ReadSignal<Option<MetricsData>>) -> impl IntoView {
    view! { cx,
        <div class="card" style="background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h3 style="margin: 0 0 15px 0; color: #1f2937;">"🦀 Rust API"</h3>
            <Show when=move || metrics().is_some() fallback=move |_| view! { cx, <p>"Cargando..."</p> }>
                {move || {
                    metrics().map(|m| view! { cx,
                        <div>
                            <p>"Versión: " {m.rust.version}</p>
                            <p>"RAM: " {m.rust.memory_mb} " MB"</p>
                            <p>"Uptime: " {m.rust.uptime_secs} " segundos"</p>
                        </div>
                    })
                }}
            </Show>
        </div>
    }
}

#[component]
fn MetricsCard(cx: Scope, metrics: ReadSignal<Option<MetricsData>>) -> impl IntoView {
    view! { cx,
        <div class="card" style="background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h3 style="margin: 0 0 15px 0; color: #1f2937;">"📊 Métricas Combinadas"</h3>
            <Show when=move || metrics().is_some() fallback=move |_| view! { cx, <p>"Cargando..."</p> }>
                {move || {
                    metrics().map(|m| view! { cx,
                        <div>
                            <p>"Total Mensajes: " {m.combined.total_messages}</p>
                            <p>"Total Bots: " {m.combined.total_bots}</p>
                            <p>"Vendedores Activos: " {m.combined.active_sellers}</p>
                            <p>"RAM Total: " {m.combined.memory_total_mb} " MB"</p>
                        </div>
                    })
                }}
            </Show>
        </div>
    }
}

#[component]
fn PerformanceCard(cx: Scope, metrics: ReadSignal<Option<MetricsData>>) -> impl IntoView {
    view! { cx,
        <div class="card" style="background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h3 style="margin: 0 0 15px 0; color: #1f2937;">"⚡ Performance"</h3>
            <Show when=move || metrics().is_some() fallback=move |_| view! { cx, <p>"Cargando..."</p> }>
                {move || {
                    metrics().map(|m| view! { cx,
                        <div>
                            <p>"CPU: " {m.combined.cpu_total_percent} "%"</p>
                            <p>"Estado: " <span style="color: green;">"✅ Operativo"</span></p>
                        </div>
                    })
                }}
            </Show>
        </div>
    }
}

#[component]
fn MetricsPage(cx: Scope) -> impl IntoView {
    view! { cx,
        <div>
            <h2>"📈 Métricas Detalladas"</h2>
            <p>"Página de métricas en desarrollo..."</p>
        </div>
    }
}

#[component]
fn AnalyticsPage(cx: Scope) -> impl IntoView {
    view! { cx,
        <div>
            <h2>"📊 Analytics"</h2>
            <p>"Página de analytics en desarrollo..."</p>
        </div>
    }
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct MetricsData {
    pub rust: RustMetrics,
    pub node: Option<NodeHealth>,
    pub combined: CombinedMetrics,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct RustMetrics {
    pub version: String,
    pub memory_mb: u64,
    pub cpu_percent: f64,
    pub uptime_secs: u64,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct NodeHealth {
    pub status: String,
    pub uptime_secs: f64,
    pub version: String,
    pub bots: Option<serde_json::Value>,
    pub sellers: Option<serde_json::Value>,
    pub analytics: Option<serde_json::Value>,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct CombinedMetrics {
    pub total_messages: u64,
    pub total_bots: u64,
    pub active_sellers: u64,
    pub memory_total_mb: u64,
    pub cpu_total_percent: f64,
}

