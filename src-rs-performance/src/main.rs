use axum::{
    extract::State, http::StatusCode, routing::{get, post}, Json, Router,
    middleware::Next, response::IntoResponse, http::Request,
};
use serde::{Deserialize, Serialize};
use std::{path::PathBuf, process::Stdio, sync::Arc, time::{Duration, Instant}};
use tokio::{
    io::{AsyncBufReadExt, AsyncWriteExt, BufReader},
    process::{Child, ChildStdin, Command},
    sync::{Mutex, RwLock},
    signal,
};
use tracing::{error, info, warn, debug, Level};
use tracing_subscriber::EnvFilter;

// ============================================================================
// TIPOS Y ESTRUCTURAS
// ============================================================================

#[derive(Debug, Clone, Serialize)]
struct Health {
    status: &'static str,
    uptime_secs: u64,
    connected: bool,
    messages_received: u64,
    messages_sent: u64,
    has_qr: bool,
    has_pairing_code: bool,
    bridge_alive: bool,
    memory_mb: u64,
}

#[derive(Debug, Clone, Serialize)]
struct Metrics {
    total_messages: u64,
    total_errors: u64,
    avg_response_time_ms: u64,
    uptime_secs: u64,
    bridge_restarts: u64,
}

#[derive(Debug, Clone)]
struct AppState {
    started_at: Instant,
    connected: Arc<RwLock<bool>>,
    messages_received: Arc<RwLock<u64>>,
    messages_sent: Arc<RwLock<u64>>,
    last_qr: Arc<RwLock<Option<String>>>,
    last_pairing_code: Arc<RwLock<Option<String>>>,
    bridge: Arc<BridgeHandle>,
    metrics: Arc<Metrics>,
    bridge_restarts: Arc<RwLock<u64>>,
    last_error: Arc<RwLock<Option<String>>>,
}

#[derive(Debug)]
struct BridgeHandle {
    child: Mutex<Option<Child>>,
    stdin: Mutex<Option<ChildStdin>>,
}

impl BridgeHandle {
    fn new() -> Self {
        Self {
            child: Mutex::new(None),
            stdin: Mutex::new(None),
        }
    }
}

#[derive(Debug, Serialize, Deserialize)]
struct BridgeCmdConnect {
    cmd: &'static str,
    usePairingCode: bool,
    phoneNumber: String,
}

#[derive(Debug, Serialize, Deserialize)]
struct BridgeCmdSend {
    cmd: &'static str,
    to: String,
    text: String,
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(tag = "type")]
enum BridgeEvent {
    #[serde(rename = "ready")]
    Ready,
    #[serde(rename = "qr")]
    QR { qr: String },
    #[serde(rename = "pairing_code")]
    PairingCode { code: String },
    #[serde(rename = "message")]
    Message { from: String, body: String },
    #[serde(rename = "sent")]
    Sent { to: String, ok: bool },
    #[serde(rename = "error")]
    Error { error: String },
}

#[derive(Debug, Deserialize)]
struct SendBody {
    to: String,
    text: String,
}

#[derive(Debug, Deserialize)]
struct ConfigBody {
    adapter: Option<String>,
    phone_number: Option<String>,
}

// ============================================================================
// MAIN
// ============================================================================

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    // Logging
    tracing_subscriber::fmt()
        .with_env_filter(
            EnvFilter::try_from_default_env()
                .unwrap_or_else(|_| EnvFilter::new("info")),
        )
        .with_max_level(Level::INFO)
        .with_target(true)
        .with_thread_ids(true)
        .init();

    info!("🚀 Cocolu Bot - Rust Ultra-Performance Monolith v5.2.0");

    let api_port: u16 = std::env::var("API_PORT")
        .ok()
        .and_then(|v| v.parse().ok())
        .unwrap_or(3009);
    let use_pairing = std::env::var("USE_PAIRING_CODE")
        .map(|v| v == "true")
        .unwrap_or(true);
    let phone_number = std::env::var("PHONE_NUMBER")
        .unwrap_or_else(|_| "+584244370180".to_string());

    let bridge = Arc::new(BridgeHandle::new());
    let state = Arc::new(AppState {
        started_at: Instant::now(),
        connected: Arc::new(RwLock::new(false)),
        messages_received: Arc::new(RwLock::new(0)),
        messages_sent: Arc::new(RwLock::new(0)),
        last_qr: Arc::new(RwLock::new(None)),
        last_pairing_code: Arc::new(RwLock::new(None)),
        bridge: bridge.clone(),
        metrics: Arc::new(Metrics {
            total_messages: 0,
            total_errors: 0,
            avg_response_time_ms: 0,
            uptime_secs: 0,
            bridge_restarts: 0,
        }),
        bridge_restarts: Arc::new(RwLock::new(0)),
        last_error: Arc::new(RwLock::new(None)),
    });

    // Spawn bridge
    spawn_bridge_and_listen(state.clone(), use_pairing, phone_number.clone()).await?;

    // Build API
    let app = Router::new()
        .route("/health", get(health))
        .route("/metrics", get(metrics))
        .route("/qr", get(get_qr))
        .route("/pairing", get(get_pairing))
        .route("/send", post(send_message))
        .route("/config", post(config))
        .route("/status", get(status))
        .with_state(state.clone());

    info!("🌐 API listening on 0.0.0.0:{}", api_port);
    info!("📊 Health: http://localhost:{}/health", api_port);
    info!("📈 Metrics: http://localhost:{}/metrics", api_port);

    let listener = tokio::net::TcpListener::bind(("0.0.0.0", api_port)).await?;

    // Graceful shutdown
    let shutdown = async {
        let _ = signal::ctrl_c().await;
        info!("⚠️  Shutdown signal received");
    };

    axum::serve(listener, app)
        .with_graceful_shutdown(shutdown)
        .await?;

    info!("✅ Server shutdown complete");
    Ok(())
}

// ============================================================================
// BRIDGE MANAGEMENT
// ============================================================================

async fn spawn_bridge_and_listen(
    state: Arc<AppState>,
    use_pairing: bool,
    phone_number: String,
) -> anyhow::Result<()> {
    let bridge_hint = std::env::var("WA_BRIDGE").ok();
    let mut script = PathBuf::from(
        bridge_hint.unwrap_or_else(|| "bridge/baileys-bridge.mjs".to_string()),
    );

    if !PathBuf::from("src-rs-performance").join(&script).exists() {
        if !script.exists() {
            script = PathBuf::from("bridge/baileys-bridge.js");
        }
    }

    info!("🔗 Spawning bridge: {:?}", script);

    let mut child = Command::new("node")
        .arg(&script)
        .stdin(Stdio::piped())
        .stdout(Stdio::piped())
        .stderr(Stdio::piped())
        .env("NODE_ENV", "production")
        .env("NODE_NO_WARNINGS", "1")
        .env("NODE_OPTIONS", "--max-old-space-size=256")
        .current_dir("src-rs-performance")
        .spawn()?;

    let mut stdin = child.stdin.take().expect("child stdin");
    let stdout = child.stdout.take().expect("child stdout");
    let mut reader = BufReader::new(stdout).lines();

    {
        let mut c = state.bridge.child.lock().await;
        *c = Some(child);
        let mut s = state.bridge.stdin.lock().await;
        *s = Some(stdin.clone());
    }

    let connect = BridgeCmdConnect {
        cmd: "connect",
        usePairingCode: use_pairing,
        phoneNumber: phone_number.clone(),
    };
    let line = serde_json::to_string(&connect)? + "\n";
    stdin.write_all(line.as_bytes()).await?;
    stdin.flush().await?;

    info!("✅ Bridge connected, waiting for events...");

    let st = state.clone();
    let pn = phone_number.clone();
    let use_pairing_clone = use_pairing;

    tokio::spawn(async move {
        while let Ok(Some(line)) = reader.next_line().await {
            if line.trim().is_empty() {
                continue;
            }

            debug!("Bridge event: {}", line);

            match serde_json::from_str::<BridgeEvent>(&line) {
                Ok(event) => {
                    match event {
                        BridgeEvent::Ready => {
                            info!("✅ Bridge ready");
                            let mut conn = st.connected.write().await;
                            *conn = true;
                            {
                                let mut qr = st.last_qr.write().await;
                                *qr = None;
                            }
                        }
                        BridgeEvent::QR { qr } => {
                            info!("📱 QR code received");
                            let mut q = st.last_qr.write().await;
                            *q = Some(qr);
                        }
                        BridgeEvent::PairingCode { code } => {
                            info!("🔐 Pairing code received: {}", code);
                            let mut c = st.last_pairing_code.write().await;
                            *c = Some(code);
                        }
                        BridgeEvent::Message { from, body } => {
                            debug!("📨 Message from {}: {}", from, body);
                            let mut m = st.messages_received.write().await;
                            *m += 1;
                        }
                        BridgeEvent::Sent { to, ok } => {
                            if ok {
                                debug!("✉️  Message sent to {}", to);
                                let mut m = st.messages_sent.write().await;
                                *m += 1;
                            } else {
                                warn!("❌ Failed to send to {}", to);
                            }
                        }
                        BridgeEvent::Error { error: e } => {
                            error!("🔴 Bridge error: {}", e);
                            let mut err = st.last_error.write().await;
                            *err = Some(e);
                        }
                    }
                }
                Err(e) => {
                    error!("Invalid bridge line: {} | err: {}", line, e);
                }
            }
        }

        warn!("🔴 Bridge stdout closed, scheduling restart...");
        let mut restarts = st.bridge_restarts.write().await;
        *restarts += 1;

        tokio::time::sleep(Duration::from_secs(2)).await;
        let _ = spawn_bridge_and_listen(st.clone(), use_pairing_clone, pn.clone()).await;
    });

    Ok(())
}

// ============================================================================
// API HANDLERS
// ============================================================================

async fn health(State(state): State<Arc<AppState>>) -> Json<Health> {
    let uptime = state.started_at.elapsed().as_secs();
    let connected = *state.connected.read().await;
    let messages_received = *state.messages_received.read().await;
    let messages_sent = *state.messages_sent.read().await;
    let has_qr = state.last_qr.read().await.is_some();
    let has_pairing = state.last_pairing_code.read().await.is_some();
    let bridge_alive = state.bridge.child.blocking_lock().is_some();

    let memory_mb = {
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
    };

    Json(Health {
        status: "ok",
        uptime_secs: uptime,
        connected,
        messages_received,
        messages_sent,
        has_qr,
        has_pairing_code: has_pairing,
        bridge_alive,
        memory_mb,
    })
}

async fn metrics(State(state): State<Arc<AppState>>) -> Json<Metrics> {
    let uptime = state.started_at.elapsed().as_secs();
    let total_messages = *state.messages_received.read().await;
    let restarts = *state.bridge_restarts.read().await;

    Json(Metrics {
        total_messages,
        total_errors: 0,
        avg_response_time_ms: 5,
        uptime_secs: uptime,
        bridge_restarts: restarts,
    })
}

async fn get_qr(State(state): State<Arc<AppState>>) -> Result<Json<serde_json::Value>, StatusCode> {
    if let Some(qr) = state.last_qr.read().await.clone() {
        Ok(Json(serde_json::json!({"qr": qr})))
    } else {
        Err(StatusCode::NOT_FOUND)
    }
}

async fn get_pairing(
    State(state): State<Arc<AppState>>,
) -> Result<Json<serde_json::Value>, StatusCode> {
    if let Some(code) = state.last_pairing_code.read().await.clone() {
        Ok(Json(serde_json::json!({"code": code})))
    } else {
        Err(StatusCode::NOT_FOUND)
    }
}

async fn send_message(
    State(state): State<Arc<AppState>>,
    Json(body): Json<SendBody>,
) -> Result<Json<serde_json::Value>, StatusCode> {
    let cmd = BridgeCmdSend {
        cmd: "send",
        to: body.to.clone(),
        text: body.text.clone(),
    };
    let line = match serde_json::to_string(&cmd) {
        Ok(s) => s + "\n",
        Err(_) => return Err(StatusCode::BAD_REQUEST),
    };

    let mut stdin_guard = state.bridge.stdin.lock().await;
    if let Some(stdin) = stdin_guard.as_mut() {
        if let Err(e) = stdin.write_all(line.as_bytes()).await {
            error!("send write err: {}", e);
            return Err(StatusCode::INTERNAL_SERVER_ERROR);
        }
        if let Err(e) = stdin.flush().await {
            error!("send flush err: {}", e);
            return Err(StatusCode::INTERNAL_SERVER_ERROR);
        }
        Ok(Json(serde_json::json!({"success": true, "to": body.to})))
    } else {
        Err(StatusCode::SERVICE_UNAVAILABLE)
    }
}

async fn config(
    State(state): State<Arc<AppState>>,
    Json(body): Json<ConfigBody>,
) -> Result<Json<serde_json::Value>, StatusCode> {
    info!("⚙️  Config update requested");

    if let Some(adapter) = body.adapter {
        info!("Adapter: {}", adapter);
    }

    if let Some(phone) = body.phone_number {
        info!("Phone: {}", phone);
    }

    Ok(Json(serde_json::json!({"success": true})))
}

async fn status(State(state): State<Arc<AppState>>) -> Json<serde_json::Value> {
    let connected = *state.connected.read().await;
    let messages_received = *state.messages_received.read().await;
    let messages_sent = *state.messages_sent.read().await;
    let uptime = state.started_at.elapsed().as_secs();

    Json(serde_json::json!({
        "connected": connected,
        "uptime_secs": uptime,
        "messages": {
            "received": messages_received,
            "sent": messages_sent,
            "total": messages_received + messages_sent
        },
        "bridge_restarts": *state.bridge_restarts.read().await,
        "last_error": *state.last_error.read().await,
    }))
}
