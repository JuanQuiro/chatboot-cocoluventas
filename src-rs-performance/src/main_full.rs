use axum::{
    extract::{State, Json},
    http::{StatusCode, HeaderMap},
    response::Html,
    routing::{get, post},
    Router,
};
use serde::{Deserialize, Serialize};
use std::sync::Arc;
use std::time::Instant;
use tokio::sync::RwLock;
use tracing::{info, Level};
use tracing_subscriber::EnvFilter;
use std::collections::HashMap;

#[derive(Clone)]
struct AppState {
    started_at: Instant,
    connected: Arc<RwLock<bool>>,
    messages_received: Arc<RwLock<u64>>,
    messages_sent: Arc<RwLock<u64>>,
    adapter: Arc<RwLock<String>>,
    auth_token: String,
}

#[derive(Serialize)]
struct HealthResponse {
    status: String,
    uptime_secs: u64,
    connected: bool,
    messages_received: u64,
    messages_sent: u64,
    memory_mb: u64,
    cpu_percent: f64,
}

#[derive(Serialize)]
struct AdapterInfo {
    name: String,
    status: String,
    connected: bool,
    messages_received: u64,
    messages_sent: u64,
}

#[derive(Serialize)]
struct SystemStatus {
    status: String,
    uptime_secs: u64,
    adapters: Vec<AdapterInfo>,
    total_messages: u64,
    memory_mb: u64,
    cpu_percent: f64,
    timestamp: String,
}

#[derive(Deserialize)]
struct MessagePayload {
    to: String,
    text: String,
}

#[derive(Serialize)]
struct MessageResponse {
    success: bool,
    message_id: String,
    timestamp: String,
}

#[derive(Serialize)]
struct ErrorResponse {
    error: String,
    code: u16,
}

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    tracing_subscriber::fmt()
        .with_env_filter(EnvFilter::new("info"))
        .with_max_level(Level::INFO)
        .init();

    info!("🚀 Cocolu Bot - Rust Ultra-Performance v5.2.0");

    let api_port: u16 = std::env::var("API_PORT")
        .ok()
        .and_then(|v| v.parse().ok())
        .unwrap_or(3009);

    let auth_token = std::env::var("AUTH_TOKEN")
        .unwrap_or_else(|_| "cocolu_secret_token_2025".to_string());

    let state = AppState {
        started_at: Instant::now(),
        connected: Arc::new(RwLock::new(true)),
        messages_received: Arc::new(RwLock::new(0)),
        messages_sent: Arc::new(RwLock::new(0)),
        adapter: Arc::new(RwLock::new("meta".to_string())),
        auth_token,
    };

    let app = Router::new()
        .route("/", get(dashboard))
        .route("/health", get(health))
        .route("/api/status", get(status))
        .route("/api/adapters", get(adapters))
        .route("/api/messages", post(send_message))
        .route("/api/stats", get(stats))
        .with_state(state);

    info!("🌐 API listening on 0.0.0.0:{}", api_port);
    info!("📊 Dashboard: http://localhost:{}/", api_port);
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

// Middleware para verificar autenticación
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

async fn dashboard() -> Html<&'static str> {
    Html(
        r#"
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>🤖 Cocolu Bot - Rust Dashboard</title>
            <style>
                * { margin: 0; padding: 0; box-sizing: border-box; }
                body { 
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    min-height: 100vh;
                    padding: 20px;
                }
                .container { max-width: 1200px; margin: 0 auto; }
                header {
                    background: white;
                    padding: 20px;
                    border-radius: 8px;
                    margin-bottom: 20px;
                    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                }
                h1 { color: #333; margin-bottom: 10px; }
                .status-badge {
                    display: inline-block;
                    padding: 8px 16px;
                    background: #4caf50;
                    color: white;
                    border-radius: 20px;
                    font-size: 14px;
                    font-weight: bold;
                }
                .grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                    gap: 20px;
                    margin-bottom: 20px;
                }
                .card {
                    background: white;
                    padding: 20px;
                    border-radius: 8px;
                    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                }
                .card h2 { color: #667eea; font-size: 18px; margin-bottom: 15px; }
                .metric {
                    display: flex;
                    justify-content: space-between;
                    padding: 10px 0;
                    border-bottom: 1px solid #eee;
                }
                .metric:last-child { border-bottom: none; }
                .metric-label { color: #666; }
                .metric-value { font-weight: bold; color: #333; }
                .endpoints {
                    background: white;
                    padding: 20px;
                    border-radius: 8px;
                    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                }
                .endpoint {
                    padding: 10px;
                    margin: 5px 0;
                    background: #f5f5f5;
                    border-left: 4px solid #667eea;
                    border-radius: 4px;
                    font-family: monospace;
                    font-size: 13px;
                }
                .auth-info {
                    background: #fff3cd;
                    padding: 15px;
                    border-radius: 4px;
                    margin-top: 20px;
                    border-left: 4px solid #ffc107;
                }
                .auth-info strong { color: #856404; }
            </style>
        </head>
        <body>
            <div class="container">
                <header>
                    <h1>🤖 Cocolu Bot - Rust Ultra-Performance</h1>
                    <span class="status-badge">✅ Running</span>
                </header>

                <div class="grid">
                    <div class="card">
                        <h2>📊 Sistema</h2>
                        <div class="metric">
                            <span class="metric-label">Status</span>
                            <span class="metric-value">✅ OK</span>
                        </div>
                        <div class="metric">
                            <span class="metric-label">Versión</span>
                            <span class="metric-value">5.2.0</span>
                        </div>
                        <div class="metric">
                            <span class="metric-label">Adaptador</span>
                            <span class="metric-value">Meta</span>
                        </div>
                    </div>

                    <div class="card">
                        <h2>💾 Recursos</h2>
                        <div class="metric">
                            <span class="metric-label">RAM</span>
                            <span class="metric-value">~3 MB</span>
                        </div>
                        <div class="metric">
                            <span class="metric-label">CPU</span>
                            <span class="metric-value">0.0%</span>
                        </div>
                        <div class="metric">
                            <span class="metric-label">Uptime</span>
                            <span class="metric-value">Estable</span>
                        </div>
                    </div>

                    <div class="card">
                        <h2>📱 Mensajes</h2>
                        <div class="metric">
                            <span class="metric-label">Recibidos</span>
                            <span class="metric-value">0</span>
                        </div>
                        <div class="metric">
                            <span class="metric-label">Enviados</span>
                            <span class="metric-value">0</span>
                        </div>
                        <div class="metric">
                            <span class="metric-label">Total</span>
                            <span class="metric-value">0</span>
                        </div>
                    </div>
                </div>

                <div class="endpoints">
                    <h2>🔗 Endpoints API</h2>
                    <div class="endpoint">GET /health - Estado del bot</div>
                    <div class="endpoint">GET /api/status - Status detallado</div>
                    <div class="endpoint">GET /api/adapters - Adaptadores disponibles</div>
                    <div class="endpoint">POST /api/messages - Enviar mensaje (requiere auth)</div>
                    <div class="endpoint">GET /api/stats - Estadísticas (requiere auth)</div>
                </div>

                <div class="auth-info">
                    <strong>🔐 Autenticación:</strong><br>
                    Usa header: <code>Authorization: Bearer cocolu_secret_token_2025</code>
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
    let messages_received = *state.messages_received.read().await;
    let messages_sent = *state.messages_sent.read().await;

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
        messages_received,
        messages_sent,
        memory_mb,
        cpu_percent: 0.0,
    })
}

async fn status(
    State(state): State<AppState>,
    headers: HeaderMap,
) -> Result<Json<SystemStatus>, StatusCode> {
    verify_auth(&state, &headers)?;

    let uptime = state.started_at.elapsed().as_secs();
    let connected = *state.connected.read().await;
    let messages_received = *state.messages_received.read().await;
    let messages_sent = *state.messages_sent.read().await;
    let adapter_name = state.adapter.read().await.clone();

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

    let adapters = vec![AdapterInfo {
        name: adapter_name,
        status: if connected { "connected" } else { "disconnected" }.to_string(),
        connected,
        messages_received,
        messages_sent,
    }];

    Ok(Json(SystemStatus {
        status: "ok".to_string(),
        uptime_secs: uptime,
        adapters,
        total_messages: messages_received + messages_sent,
        memory_mb,
        cpu_percent: 0.0,
        timestamp: chrono::Local::now().to_rfc3339(),
    }))
}

async fn adapters(
    State(state): State<AppState>,
    headers: HeaderMap,
) -> Result<Json<Vec<AdapterInfo>>, StatusCode> {
    verify_auth(&state, &headers)?;

    let connected = *state.connected.read().await;
    let messages_received = *state.messages_received.read().await;
    let messages_sent = *state.messages_sent.read().await;
    let adapter_name = state.adapter.read().await.clone();

    Ok(Json(vec![AdapterInfo {
        name: adapter_name,
        status: if connected { "connected" } else { "disconnected" }.to_string(),
        connected,
        messages_received,
        messages_sent,
    }]))
}

async fn send_message(
    State(state): State<AppState>,
    headers: HeaderMap,
    Json(payload): Json<MessagePayload>,
) -> Result<Json<MessageResponse>, StatusCode> {
    verify_auth(&state, &headers)?;

    let mut sent = state.messages_sent.write().await;
    *sent += 1;

    Ok(Json(MessageResponse {
        success: true,
        message_id: format!("msg_{}", *sent),
        timestamp: chrono::Local::now().to_rfc3339(),
    }))
}

async fn stats(
    State(state): State<AppState>,
    headers: HeaderMap,
) -> Result<Json<serde_json::Value>, StatusCode> {
    verify_auth(&state, &headers)?;

    let uptime = state.started_at.elapsed().as_secs();
    let messages_received = *state.messages_received.read().await;
    let messages_sent = *state.messages_sent.read().await;

    Ok(Json(serde_json::json!({
        "uptime_secs": uptime,
        "messages": {
            "received": messages_received,
            "sent": messages_sent,
            "total": messages_received + messages_sent
        },
        "timestamp": chrono::Local::now().to_rfc3339()
    })))
}
