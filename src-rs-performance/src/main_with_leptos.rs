//! Rust API Híbrida con Leptos SSR - Producción
//! Integración completa: API + Dashboard Leptos + Node.js

#[cfg(feature = "leptos-ssr")]
use axum::{
    extract::{State, Json, Path},
    http::{StatusCode, HeaderMap},
    response::{Response, IntoResponse},
    routing::get,
    Router,
};
#[cfg(feature = "leptos-ssr")]
use leptos::*;
#[cfg(feature = "leptos-ssr")]
use leptos_axum::{generate_route_list, LeptosRoutes};
#[cfg(feature = "leptos-ssr")]
use serde::Serialize;
#[cfg(feature = "leptos-ssr")]
use std::sync::Arc;
#[cfg(feature = "leptos-ssr")]
use std::time::Instant;
#[cfg(feature = "leptos-ssr")]
use tokio::sync::RwLock;
#[cfg(feature = "leptos-ssr")]
use tracing::{info, warn, Level};
#[cfg(feature = "leptos-ssr")]
use tracing_subscriber::EnvFilter;
#[cfg(feature = "leptos-ssr")]
use reqwest::Client;

// Importar módulos del dashboard Leptos
#[cfg(feature = "leptos-ssr")]
mod dashboard;

#[cfg(feature = "leptos-ssr")]
#[derive(Clone)]
struct AppState {
    started_at: Instant,
    connected: Arc<RwLock<bool>>,
    messages_received: Arc<RwLock<u64>>,
    messages_sent: Arc<RwLock<u64>>,
    adapter: Arc<RwLock<String>>,
    auth_token: String,
    node_api_url: String,
    http_client: Client,
    leptos_options: Arc<LeptosOptions>,
}

#[cfg(feature = "leptos-ssr")]
#[derive(Serialize)]
struct HealthResponse {
    status: String,
    uptime_secs: u64,
    connected: bool,
    messages_received: u64,
    messages_sent: u64,
    memory_mb: u64,
    cpu_percent: f64,
    rust_api: RustMetrics,
    node_api: Option<NodeHealth>,
}

#[cfg(feature = "leptos-ssr")]
#[derive(Serialize)]
struct RustMetrics {
    version: String,
    memory_mb: u64,
    cpu_percent: f64,
    uptime_secs: u64,
}

#[cfg(feature = "leptos-ssr")]
#[derive(Serialize)]
struct NodeHealth {
    status: String,
    uptime_secs: f64,
    version: String,
    bots: Option<serde_json::Value>,
    sellers: Option<serde_json::Value>,
    analytics: Option<serde_json::Value>,
}

#[cfg(feature = "leptos-ssr")]
#[derive(Serialize)]
struct MetricsResponse {
    rust: RustMetrics,
    node: Option<NodeHealth>,
    combined: CombinedMetrics,
}

#[cfg(feature = "leptos-ssr")]
#[derive(Serialize)]
struct CombinedMetrics {
    total_messages: u64,
    total_bots: u64,
    active_sellers: u64,
    memory_total_mb: u64,
    cpu_total_percent: f64,
}

#[cfg(feature = "leptos-ssr")]
#[tokio::main]
async fn main() -> anyhow::Result<()> {
    tracing_subscriber::fmt()
        .with_env_filter(EnvFilter::new("info"))
        .with_max_level(Level::INFO)
        .init();

    info!("🚀 Cocolu Bot - Rust Hybrid API v6.0.0 with Leptos SSR");
    info!("🔗 Integración completa: API + Dashboard Leptos + Node.js");

    let api_port: u16 = std::env::var("API_PORT")
        .ok()
        .and_then(|v| v.parse().ok())
        .unwrap_or(3009);

    let node_port: u16 = std::env::var("NODE_PORT")
        .ok()
        .and_then(|v| v.parse().ok())
        .unwrap_or(3008);

    let node_api_url = format!("http://127.0.0.1:{}", node_port);

    let auth_token = std::env::var("AUTH_TOKEN")
        .unwrap_or_else(|_| "cocolu_secret_token_2025".to_string());

    let http_client = Client::builder()
        .timeout(std::time::Duration::from_secs(5))
        .build()?;

    // Configurar Leptos
    let conf = get_configuration(None).unwrap();
    let leptos_options = conf.leptos_options;
    let routes = generate_route_list(dashboard::App);

    let state = AppState {
        started_at: Instant::now(),
        connected: Arc::new(RwLock::new(true)),
        messages_received: Arc::new(RwLock::new(0)),
        messages_sent: Arc::new(RwLock::new(0)),
        adapter: Arc::new(RwLock::new("meta".to_string())),
        auth_token,
        node_api_url,
        http_client,
        #[cfg(feature = "leptos-ssr")]
        leptos_options: Arc::new(leptos_options),
        #[cfg(not(feature = "leptos-ssr"))]
        leptos_options: Arc::new(leptos::LeptosOptions::default()),
    };

    let node_api_url_clone = state.node_api_url.clone();

    // Construir router con Leptos + API
    let app = Router::new()
        // API endpoints (antes de Leptos para evitar conflictos)
        .route("/api/health", get(health))
        .route("/api/status", get(status))
        .route("/api/metrics", get(metrics))
        .route("/api/health/combined", get(combined_health))
        .route("/api/stats", get(stats))
        // Rutas Leptos (SSR) - solo si está habilitado
        #[cfg(feature = "leptos-ssr")]
        {
            app = app.leptos_routes_with_handler(routes, move |cx| {
                dashboard::App(cx)
            });
        }
        .with_state(state);

    info!("🌐 Rust API + Leptos SSR listening on 0.0.0.0:{}", api_port);
    info!("🔗 Node.js API expected on {}", node_api_url_clone);
    info!("📊 Dashboard Leptos: http://localhost:{}/", api_port);
    info!("🔐 Auth required for API endpoints");

    let listener = tokio::net::TcpListener::bind(("0.0.0.0", api_port)).await?;

    let shutdown = async {
        let _ = tokio::signal::ctrl_c().await;
        info!("⚠️  Shutdown signal received");
    };

    axum::serve(listener, app)
        .with_graceful_shutdown(shutdown)
        .await?;

    info!("✅ Server shutdown complete");
    Ok(())
}

#[cfg(feature = "leptos-ssr")]
async fn fetch_node_health(client: &Client, url: &str) -> Option<NodeHealth> {
    match client
        .get(&format!("{}/api/health", url))
        .timeout(std::time::Duration::from_secs(2))
        .send()
        .await
    {
        Ok(resp) => {
            if resp.status().is_success() {
                match resp.json::<serde_json::Value>().await {
                    Ok(data) => {
                        Some(NodeHealth {
                            status: data.get("status")
                                .and_then(|v| v.as_str())
                                .unwrap_or("unknown")
                                .to_string(),
                            uptime_secs: data.get("uptime")
                                .and_then(|v| v.as_f64())
                                .unwrap_or(0.0),
                            version: data.get("version")
                                .and_then(|v| v.as_str())
                                .unwrap_or("unknown")
                                .to_string(),
                            bots: data.get("bots").cloned(),
                            sellers: data.get("sellers").cloned(),
                            analytics: data.get("analytics").cloned(),
                        })
                    }
                    Err(e) => {
                        warn!("Error parsing Node.js health response: {}", e);
                        None
                    }
                }
            } else {
                warn!("Node.js API returned non-200 status: {}", resp.status());
                None
            }
        }
        Err(e) => {
            warn!("Failed to connect to Node.js API: {}", e);
            None
        }
    }
}

#[cfg(feature = "leptos-ssr")]
async fn health(State(state): State<AppState>) -> Json<HealthResponse> {
    let uptime = state.started_at.elapsed().as_secs();
    let connected = *state.connected.read().await;
    let messages_received = *state.messages_received.read().await;
    let messages_sent = *state.messages_sent.read().await;
    let memory_mb = get_memory_usage();

    let rust_metrics = RustMetrics {
        version: "6.0.0".to_string(),
        memory_mb,
        cpu_percent: 0.0,
        uptime_secs: uptime,
    };

    let node_health = fetch_node_health(&state.http_client, &state.node_api_url).await;

    Json(HealthResponse {
        status: "ok".to_string(),
        uptime_secs: uptime,
        connected,
        messages_received,
        messages_sent,
        memory_mb,
        cpu_percent: 0.0,
        rust_api: rust_metrics,
        node_api: node_health,
    })
}

#[cfg(feature = "leptos-ssr")]
async fn combined_health(State(state): State<AppState>) -> Json<MetricsResponse> {
    let uptime = state.started_at.elapsed().as_secs();
    let memory_mb = get_memory_usage();
    let messages_received = *state.messages_received.read().await;
    let messages_sent = *state.messages_sent.read().await;

    let rust_metrics = RustMetrics {
        version: "6.0.0".to_string(),
        memory_mb,
        cpu_percent: 0.0,
        uptime_secs: uptime,
    };

    let node_health = fetch_node_health(&state.http_client, &state.node_api_url).await;

    let combined = CombinedMetrics {
        total_messages: messages_received + messages_sent + 
            node_health.as_ref()
                .and_then(|n| n.analytics.as_ref())
                .and_then(|a| a.get("totalMessages").and_then(|v| v.as_u64()))
                .unwrap_or(0),
        total_bots: node_health.as_ref()
            .and_then(|n| n.bots.as_ref())
            .and_then(|b| b.get("totalBots").and_then(|v| v.as_u64()))
            .unwrap_or(0),
        active_sellers: node_health.as_ref()
            .and_then(|n| n.sellers.as_ref())
            .and_then(|s| s.get("activeSellers").and_then(|v| v.as_u64()))
            .unwrap_or(0),
        memory_total_mb: memory_mb + 
            (node_health.as_ref()
                .and_then(|_| Some(250))
                .unwrap_or(0)),
        cpu_total_percent: 0.0,
    };

    Json(MetricsResponse {
        rust: rust_metrics,
        node: node_health,
        combined,
    })
}

#[cfg(feature = "leptos-ssr")]
async fn status(
    State(state): State<AppState>,
    headers: HeaderMap,
) -> Result<Json<serde_json::Value>, StatusCode> {
    verify_auth(&state, &headers)?;

    let uptime = state.started_at.elapsed().as_secs();
    let memory_mb = get_memory_usage();
    let messages_received = *state.messages_received.read().await;
    let messages_sent = *state.messages_sent.read().await;

    let rust_metrics = RustMetrics {
        version: "6.0.0".to_string(),
        memory_mb,
        cpu_percent: 0.0,
        uptime_secs: uptime,
    };

    let node_health = fetch_node_health(&state.http_client, &state.node_api_url).await;

    Ok(Json(serde_json::json!({
        "status": "ok",
        "uptime_secs": uptime,
        "rust_api": rust_metrics,
        "node_api": node_health,
        "total_messages": messages_received + messages_sent,
        "timestamp": chrono::Local::now().to_rfc3339()
    })))
}

#[cfg(feature = "leptos-ssr")]
async fn metrics(
    State(state): State<AppState>,
    headers: HeaderMap,
) -> Result<Json<MetricsResponse>, StatusCode> {
    verify_auth(&state, &headers)?;
    Ok(combined_health(State(state)).await)
}

#[cfg(feature = "leptos-ssr")]
async fn stats(
    State(state): State<AppState>,
    headers: HeaderMap,
) -> Result<Json<serde_json::Value>, StatusCode> {
    verify_auth(&state, &headers)?;

    let uptime = state.started_at.elapsed().as_secs();
    let messages_received = *state.messages_received.read().await;
    let messages_sent = *state.messages_sent.read().await;

    let node_health = fetch_node_health(&state.http_client, &state.node_api_url).await;

    Ok(Json(serde_json::json!({
        "rust": {
            "uptime_secs": uptime,
            "messages": {
                "received": messages_received,
                "sent": messages_sent,
                "total": messages_received + messages_sent
            },
            "memory_mb": get_memory_usage(),
        },
        "node": node_health,
        "timestamp": chrono::Local::now().to_rfc3339()
    })))
}

#[cfg(feature = "leptos-ssr")]
fn get_memory_usage() -> u64 {
    if let Ok(status) = std::fs::read_to_string("/proc/self/status") {
        status
            .lines()
            .find(|l| l.starts_with("VmRSS:"))
            .and_then(|l| l.split_whitespace().nth(1))
            .and_then(|s| s.parse::<u64>().ok())
            .unwrap_or(0)
            / 1024
    } else {
        0
    }
}

#[cfg(feature = "leptos-ssr")]
fn verify_auth(state: &AppState, headers: &HeaderMap) -> Result<(), StatusCode> {
    let auth_header = headers
        .get("Authorization")
        .and_then(|v| v.to_str().ok())
        .unwrap_or("");

    let token = auth_header.strip_prefix("Bearer ").unwrap_or("");

    if token == state.auth_token {
        Ok(())
    } else {
        Err(StatusCode::UNAUTHORIZED)
    }
}

