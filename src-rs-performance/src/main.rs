use axum::{extract::State, http::StatusCode, routing::{get, post}, Json, Router};
use serde::{Deserialize, Serialize};
use std::{path::PathBuf, process::Stdio, sync::Arc, time::Duration};
use tokio::{io::{AsyncBufReadExt, AsyncWriteExt, BufReader}, process::{Child, ChildStdin, Command}, sync::{Mutex, RwLock}};
use tracing::{error, info, Level};
use tracing_subscriber::EnvFilter;

#[derive(Debug, Clone, Default, Serialize)]
struct Health {
    status: &'static str,
    uptime_secs: u64,
    connected: bool,
    messages: u64,
    has_qr: bool,
    has_pairing_code: bool,
}

#[derive(Debug, Clone, Default)]
struct AppState {
    started_at: std::time::Instant,
    connected: Arc<RwLock<bool>>,
    messages: Arc<RwLock<u64>>,
    last_qr: Arc<RwLock<Option<String>>>,
    last_pairing_code: Arc<RwLock<Option<String>>>,
    bridge: Arc<BridgeHandle>,
}

#[derive(Debug)]
struct BridgeHandle {
    child: Mutex<Option<Child>>, // to manage lifetime
    stdin: Mutex<Option<ChildStdin>>, // for sending commands
}

impl BridgeHandle {
    fn new() -> Self { Self { child: Mutex::new(None), stdin: Mutex::new(None) } }
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
    #[serde(rename = "ready")] Ready,
    #[serde(rename = "qr")] QR { qr: String },
    #[serde(rename = "pairing_code")] PairingCode { code: String },
    #[serde(rename = "message")] Message { from: String, body: String },
    #[serde(rename = "error")] Error { error: String },
}

#[derive(Debug, Deserialize)]
struct SendBody { to: String, text: String }

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    // Logging
    tracing_subscriber::fmt()
        .with_env_filter(EnvFilter::try_from_default_env().unwrap_or_else(|_| EnvFilter::new("info")))
        .with_max_level(Level::INFO)
        .init();

    let api_port: u16 = std::env::var("API_PORT").ok().and_then(|v| v.parse().ok()).unwrap_or(3009);
    let use_pairing = std::env::var("USE_PAIRING_CODE").map(|v| v == "true").unwrap_or(true);
    let phone_number = std::env::var("PHONE_NUMBER").unwrap_or_else(|_| "+584244370180".to_string());

    let bridge = Arc::new(BridgeHandle::new());
    let state = Arc::new(AppState {
        started_at: std::time::Instant::now(),
        connected: Arc::new(RwLock::new(false)),
        messages: Arc::new(RwLock::new(0)),
        last_qr: Arc::new(RwLock::new(None)),
        last_pairing_code: Arc::new(RwLock::new(None)),
        bridge: bridge.clone(),
    });

    // Spawn bridge
    spawn_bridge_and_listen(state.clone(), use_pairing, phone_number.clone()).await?;

    // Build API
    let app = Router::new()
        .route("/health", get(health))
        .route("/qr", get(get_qr))
        .route("/pairing", get(get_pairing))
        .route("/send", post(send_message))
        .with_state(state);

    info!("starting api", port = api_port);
    let listener = tokio::net::TcpListener::bind(("0.0.0.0", api_port)).await?;
    axum::serve(listener, app).await?;
    Ok(())
}

async fn spawn_bridge_and_listen(state: Arc<AppState>, use_pairing: bool, phone_number: String) -> anyhow::Result<()> {
    // Allow override via WA_BRIDGE env (e.g., bridge/venom-bridge.mjs)
    let bridge_hint = std::env::var("WA_BRIDGE").ok();
    // Determine bridge path (ESM): we will run with current_dir("src-rs-performance")
    // so use relative path "bridge/baileys-bridge.mjs"
    let mut script = PathBuf::from(bridge_hint.unwrap_or_else(|| "bridge/baileys-bridge.mjs".to_string()));
    // If running from project root, ensure file exists relative to that cwd too
    if !PathBuf::from("src-rs-performance").join(&script).exists() {
        // Fallback: try absolute from current cwd
        if !script.exists() {
            // As a last resort, try old .js name
            script = PathBuf::from("bridge/baileys-bridge.js");
        }
    }

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

    // Save handles
    {
        let mut c = state.bridge.child.lock().await; *c = Some(child);
        let mut s = state.bridge.stdin.lock().await; *s = Some(stdin.clone());
    }

    // Send connect command
    let connect = BridgeCmdConnect { cmd: "connect", usePairingCode: use_pairing, phoneNumber: phone_number };
    let line = serde_json::to_string(&connect)? + "\n";
    stdin.write_all(line.as_bytes()).await?;
    stdin.flush().await?;

    // Spawn task to read events
    let st = state.clone();
    let pn = phone_number.clone();
    tokio::spawn(async move {
        while let Ok(Some(line)) = reader.next_line().await {
            if line.trim().is_empty() { continue; }
            match serde_json::from_str::<BridgeEvent>(&line) {
                Ok(event) => {
                    match event {
                        BridgeEvent::Ready => {
                            info!("bridge ready");
                            let mut conn = st.connected.write().await; *conn = true;
                            {
                                let mut qr = st.last_qr.write().await; *qr = None;
                            }
                        }
                        BridgeEvent::QR { qr } => {
                            info!("qr received");
                            let mut q = st.last_qr.write().await; *q = Some(qr);
                        }
                        BridgeEvent::PairingCode { code } => {
                            info!("pairing code received");
                            let mut c = st.last_pairing_code.write().await; *c = Some(code);
                        }
                        BridgeEvent::Message { from: _, body: _ } => {
                            let mut m = st.messages.write().await; *m += 1;
                        }
                        BridgeEvent::Error { error: e } => {
                            error!("bridge error: {}", e);
                        }
                    }
                }
                Err(e) => {
                    error!("invalid bridge line: {} | err: {}", line, e);
                }
            }
        }
        info!("bridge stdout closed, scheduling restart");
        // backoff a little and restart
        tokio::time::sleep(Duration::from_secs(2)).await;
        let _ = spawn_bridge_and_listen(st.clone(), use_pairing, pn.clone()).await;
    });

    Ok(())
}

async fn health(State(state): State<Arc<AppState>>) -> Json<Health> {
    let uptime = state.started_at.elapsed().as_secs();
    let connected = *state.connected.read().await;
    let messages = *state.messages.read().await;
    let has_qr = state.last_qr.read().await.is_some();
    let has_pairing = state.last_pairing_code.read().await.is_some();
    Json(Health { status: "ok", uptime_secs: uptime, connected, messages, has_qr, has_pairing_code: has_pairing })
}

async fn get_qr(State(state): State<Arc<AppState>>) -> Result<Json<serde_json::Value>, StatusCode> {
    if let Some(qr) = state.last_qr.read().await.clone() {
        Ok(Json(serde_json::json!({"qr": qr})))
    } else { Err(StatusCode::NOT_FOUND) }
}

async fn get_pairing(State(state): State<Arc<AppState>>) -> Result<Json<serde_json::Value>, StatusCode> {
    if let Some(code) = state.last_pairing_code.read().await.clone() {
        Ok(Json(serde_json::json!({"code": code})))
    } else { Err(StatusCode::NOT_FOUND) }
}

async fn send_message(State(state): State<Arc<AppState>>, Json(body): Json<SendBody>) -> Result<Json<serde_json::Value>, StatusCode> {
    let cmd = BridgeCmdSend { cmd: "send", to: body.to, text: body.text };
    let line = match serde_json::to_string(&cmd) { Ok(s) => s + "\n", Err(_) => return Err(StatusCode::BAD_REQUEST) };

    let mut stdin_guard = state.bridge.stdin.lock().await;
    if let Some(stdin) = stdin_guard.as_mut() {
        if let Err(e) = stdin.write_all(line.as_bytes()).await { error!("send write err: {}", e); return Err(StatusCode::INTERNAL_SERVER_ERROR); }
        if let Err(e) = stdin.flush().await { error!("send flush err: {}", e); return Err(StatusCode::INTERNAL_SERVER_ERROR); }
        Ok(Json(serde_json::json!({"success": true})))
    } else {
        Err(StatusCode::SERVICE_UNAVAILABLE)
    }
}
