use leptos::*;
use leptos_meta::*;
use leptos_router::*;

mod components;
mod pages;
mod api;
mod state;

use components::*;
use pages::*;

#[component]
fn App() -> impl IntoView {
    provide_meta_context();

    view! {
        <Stylesheet id="leptos" href="/pkg/cocolu_dashboard.css"/>
        <Title text="Cocolu Bot - Dashboard"/>
        <Meta name="description" content="Dashboard profesional para Cocolu Bot"/>

        <Router>
            <Layout>
                <Routes>
                    <Route path="" view=Dashboard/>
                    <Route path="messages" view=MessagesPage/>
                    <Route path="analytics" view=AnalyticsPage/>
                    <Route path="settings" view=SettingsPage/>
                    <Route path="logs" view=LogsPage/>
                </Routes>
            </Layout>
        </Router>
    }
}

#[component]
fn Layout(children: Children) -> impl IntoView {
    view! {
        <div class="app-container">
            <Sidebar/>
            <main class="main-content">
                <Header/>
                <div class="content">
                    {children()}
                </div>
            </main>
        </div>
    }
}

#[component]
fn Dashboard() -> impl IntoView {
    view! {
        <div class="dashboard-grid">
            <StatusCard/>
            <MetricsCard/>
            <PerformanceCard/>
            <MessagesWidget/>
            <LogsWidget/>
        </div>
    }
}

fn main() {
    mount_to_body(|| view! { <App/> })
}
