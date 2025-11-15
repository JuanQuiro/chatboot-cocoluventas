use axum::{
    extract::State,
    routing::get,
    Json, Router,
    response::Html,
};
use serde::Serialize;
use std::sync::Arc;
use std::time::Instant;
use tokio::sync::RwLock;
use tracing::{info, Level};
use tracing_subscriber::EnvFilter;

#[derive(Clone)]
struct AppState {
    started_at: Instant,
    connected: Arc<RwLock<bool>>,
    messages: Arc<RwLock<u64>>,
}

#[derive(Serialize)]
struct HealthResponse {
    status: String,
    uptime_secs: u64,
    connected: bool,
    messages: u64,
    memory_mb: u64,
}

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    tracing_subscriber::fmt()
        .with_env_filter(EnvFilter::new("info"))
        .with_max_level(Level::INFO)
        .init();

    info!("🚀 Cocolu Bot - Rust Ultra-Performance v5.2.0");

    let state = AppState {
        started_at: Instant::now(),
        connected: Arc::new(RwLock::new(true)),
        messages: Arc::new(RwLock::new(0)),
    };

    let app = Router::new()
        .route("/", get(dashboard))
        .route("/health", get(health))
        .with_state(state);

    info!("🌐 API listening on 0.0.0.0:3009");
    info!("📊 Health: http://localhost:3009/health");

    let listener = tokio::net::TcpListener::bind("0.0.0.0:3009").await?;
    
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

async fn dashboard() -> Html<&'static str> {
    Html(
        r#"
        <!DOCTYPE html>
        <html>
        <head>
            <title>🤖 Cocolu Bot - Rust</title>
            <style>
                body { font-family: Arial; margin: 40px; background: #f0f0f0; }
                .container { background: white; padding: 20px; border-radius: 8px; }
                h1 { color: #333; }
                .status { padding: 10px; background: #e8f5e9; border-radius: 4px; }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>🤖 Cocolu Bot - Rust Ultra-Performance</h1>
                <p>WhatsApp Bot powered by Rust + Axum</p>
                <div class="status">
                    <p><strong>Status:</strong> ✅ Running</p>
                    <p><strong>API:</strong> <a href="/health">/health</a></p>
                </div>
            </div>
        </body>
        </html>
        "#,
    )
}

async fn health(State(state): State<AppState>) -> Json<HealthResponse> {
    let uptime = state.started_at.elapsed().as_secs();
    let connected = *state.connected.read().await;
    let messages = *state.messages.read().await;

    let memory_mb = if let Ok(status) = std::fs::read_to_string("/proc/self/status") {
        status
            .lines()
            .find(|l| l.starts_with("VmRSS:"))
            .and_then(|l| l.split_whitespace().nth(1))
            .and_then(|s| s.parse::<u64>().ok())
            .unwrap_or(0)
            / 1024
    } else {
        0
    };

    Json(HealthResponse {
        status: "ok".to_string(),
        uptime_secs: uptime,
        connected,
        messages,
        memory_mb,
    })
}
