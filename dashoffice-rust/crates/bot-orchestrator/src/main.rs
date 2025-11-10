//\! # Bot Orchestrator
//\! 
//\! Orquestador de múltiples bots con:
//\! - Multi-tenant support (100+ bots simultáneos)
//\! - Flow engine conversacional
//\! - State machine (Redis)
//\! - Webhook handling
//\! - Context management
//\! - Event sourcing
//\! - Analytics en tiempo real

use actix_web::{web, App, HttpServer, HttpResponse, Responder};
use dashmap::DashMap;
use parking_lot::RwLock;
use redis::Client as RedisClient;
use serde::{Deserialize, Serialize};
use std::sync::Arc;
use tokio::sync::broadcast;
use tracing::{info, error, warn};
use uuid::Uuid;

mod flow_engine;
mod state_machine;
mod webhook;
mod conversation;
mod analytics;

use flow_engine::FlowEngine;
use state_machine::ConversationState;

/// Estado global del orchestrator
#[derive(Clone)]
pub struct OrchestratorState {
    /// Bots activos (bot_id -> BotInstance)
    pub bots: Arc<DashMap<Uuid, BotInstance>>,
    
    /// Conversaciones activas (conversation_id -> ConversationState)
    pub conversations: Arc<DashMap<String, ConversationState>>,
    
    /// Flow engine
    pub flow_engine: Arc<FlowEngine>,
    
    /// Redis para persistencia
    pub redis: Arc<RedisClient>,
    
    /// Event bus para analytics
    pub event_bus: broadcast::Sender<BotEvent>,
}

/// Instancia de un bot
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BotInstance {
    pub id: Uuid,
    pub tenant_id: String,
    pub name: String,
    pub phone_number: Option<String>,
    pub provider: String,
    pub provider_config: serde_json::Value,
    pub flows: FlowConfig,
    pub settings: BotSettings,
    pub stats: BotStats,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FlowConfig {
    pub welcome_flow_id: Option<Uuid>,
    pub menu_flow_id: Option<Uuid>,
    pub fallback_flow_id: Option<Uuid>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BotSettings {
    pub business_hours_enabled: bool,
    pub timezone: String,
    pub auto_reply_delay_ms: u64,
    pub max_conversation_timeout_seconds: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct BotStats {
    pub messages_sent: u64,
    pub messages_received: u64,
    pub conversations_active: u64,
    pub conversations_total: u64,
    pub last_message_at: Option<chrono::DateTime<chrono::Utc>>,
}

/// Eventos del sistema
#[derive(Debug, Clone, Serialize)]
pub enum BotEvent {
    MessageReceived {
        bot_id: Uuid,
        from: String,
        message: String,
        timestamp: chrono::DateTime<chrono::Utc>,
    },
    MessageSent {
        bot_id: Uuid,
        to: String,
        message: String,
        timestamp: chrono::DateTime<chrono::Utc>,
    },
    ConversationStarted {
        conversation_id: String,
        bot_id: Uuid,
        user_phone: String,
    },
    ConversationEnded {
        conversation_id: String,
        reason: String,
    },
    FlowTransition {
        conversation_id: String,
        from_step: String,
        to_step: String,
    },
}

/// Mensaje entrante desde WhatsApp
#[derive(Debug, Deserialize)]
pub struct IncomingMessage {
    pub bot_id: Uuid,
    pub from: String,
    pub message: String,
    pub message_type: String,
    pub timestamp: chrono::DateTime<chrono::Utc>,
}

/// Respuesta a enviar
#[derive(Debug, Serialize)]
pub struct OutgoingMessage {
    pub to: String,
    pub message: String,
    pub message_type: String,
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    // Setup logging
    tracing_subscriber::fmt()
        .with_env_filter(
            std::env::var("RUST_LOG").unwrap_or_else(|_| "info".to_string())
        )
        .init();

    info\!("🤖 Starting Bot Orchestrator");

    // Load config
    dotenvy::dotenv().ok();

    // Redis connection
    let redis_url = std::env::var("REDIS_URL")
        .unwrap_or_else(|_| "redis://localhost:6379".to_string());
    
    let redis = RedisClient::open(redis_url)
        .expect("Failed to connect to Redis");
    
    info\!("✅ Redis connected");

    // Event bus para analytics
    let (event_tx, _event_rx) = broadcast::channel(1000);

    // Flow engine
    let flow_engine = Arc::new(FlowEngine::new());

    // Estado global
    let state = OrchestratorState {
        bots: Arc::new(DashMap::new()),
        conversations: Arc::new(DashMap::new()),
        flow_engine,
        redis: Arc::new(redis),
        event_bus: event_tx.clone(),
    };

    // Cargar bots desde base de datos
    load_bots_from_db(&state).await;

    // Analytics worker
    spawn_analytics_worker(event_tx.subscribe());

    // Cleanup worker (limpiar conversaciones inactivas)
    spawn_cleanup_worker(state.clone());

    let port = std::env::var("BOT_PORT")
        .unwrap_or_else(|_| "3011".to_string())
        .parse::<u16>()
        .expect("Invalid BOT_PORT");

    info\!("🚀 Starting server on port {}", port);

    HttpServer::new(move || {
        App::new()
            .app_data(web::Data::new(state.clone()))
            .route("/health", web::get().to(health_check))
            .route("/webhook/venom", web::post().to(webhook::handle_venom_webhook))
            .route("/webhook/wwebjs", web::post().to(webhook::handle_wwebjs_webhook))
            .route("/webhook/baileys", web::post().to(webhook::handle_baileys_webhook))
            .route("/bots", web::get().to(list_bots))
            .route("/bots/{bot_id}", web::get().to(get_bot))
            .route("/bots/{bot_id}/stats", web::get().to(get_bot_stats))
            .route("/conversations/{conversation_id}", web::get().to(get_conversation))
            .route("/message", web::post().to(handle_incoming_message))
    })
    .bind(("0.0.0.0", port))?
    .workers(4)
    .run()
    .await
}

async fn health_check(state: web::Data<OrchestratorState>) -> impl Responder {
    let active_bots = state.bots.len();
    let active_conversations = state.conversations.len();

    HttpResponse::Ok().json(serde_json::json\!({
        "status": "ok",
        "service": "bot-orchestrator",
        "active_bots": active_bots,
        "active_conversations": active_conversations,
        "uptime": "TODO",
        "memory_mb": get_memory_usage(),
    }))
}

async fn list_bots(state: web::Data<OrchestratorState>) -> impl Responder {
    let bots: Vec<_> = state.bots.iter()
        .map(|entry| entry.value().clone())
        .collect();

    HttpResponse::Ok().json(serde_json::json\!({
        "total": bots.len(),
        "bots": bots
    }))
}

async fn get_bot(
    state: web::Data<OrchestratorState>,
    path: web::Path<Uuid>,
) -> impl Responder {
    let bot_id = path.into_inner();

    match state.bots.get(&bot_id) {
        Some(bot) => HttpResponse::Ok().json(bot.clone()),
        None => HttpResponse::NotFound().json(serde_json::json\!({
            "error": "Bot not found"
        }))
    }
}

async fn get_bot_stats(
    state: web::Data<OrchestratorState>,
    path: web::Path<Uuid>,
) -> impl Responder {
    let bot_id = path.into_inner();

    match state.bots.get(&bot_id) {
        Some(bot) => HttpResponse::Ok().json(bot.stats.clone()),
        None => HttpResponse::NotFound().json(serde_json::json\!({
            "error": "Bot not found"
        }))
    }
}

async fn get_conversation(
    state: web::Data<OrchestratorState>,
    path: web::Path<String>,
) -> impl Responder {
    let conversation_id = path.into_inner();

    match state.conversations.get(&conversation_id) {
        Some(conv) => HttpResponse::Ok().json(conv.clone()),
        None => HttpResponse::NotFound().json(serde_json::json\!({
            "error": "Conversation not found"
        }))
    }
}

async fn handle_incoming_message(
    state: web::Data<OrchestratorState>,
    msg: web::Json<IncomingMessage>,
) -> impl Responder {
    info\!("📨 Incoming message from {} to bot {}", msg.from, msg.bot_id);

    // Verificar que el bot existe
    if \!state.bots.contains_key(&msg.bot_id) {
        return HttpResponse::NotFound().json(serde_json::json\!({
            "error": "Bot not found"
        }));
    }

    // Procesar mensaje en background
    let state_clone = state.clone();
    let msg_clone = msg.into_inner();
    
    tokio::spawn(async move {
        if let Err(e) = process_message(state_clone.as_ref(), msg_clone).await {
            error\!("Error processing message: {}", e);
        }
    });

    HttpResponse::Accepted().json(serde_json::json\!({
        "status": "accepted",
        "message": "Processing"
    }))
}

async fn process_message(
    state: &OrchestratorState,
    msg: IncomingMessage,
) -> anyhow::Result<()> {
    // 1. Obtener o crear conversación
    let conversation_id = format\!("{}:{}", msg.bot_id, msg.from);
    
    let mut conversation = state.conversations
        .entry(conversation_id.clone())
        .or_insert_with(|| {
            info\!("🆕 New conversation: {}", conversation_id);
            
            // Emitir evento
            let _ = state.event_bus.send(BotEvent::ConversationStarted {
                conversation_id: conversation_id.clone(),
                bot_id: msg.bot_id,
                user_phone: msg.from.clone(),
            });
            
            ConversationState::new(conversation_id.clone(), msg.bot_id, msg.from.clone())
        });

    // 2. Actualizar contexto
    conversation.add_message("user", &msg.message);
    conversation.update_last_activity();

    // 3. Ejecutar flow engine
    let response = state.flow_engine
        .process(&mut conversation, &msg.message)
        .await?;

    // 4. Enviar respuesta
    if let Some(response_text) = response {
        send_message_to_whatsapp(state, &msg.bot_id, &msg.from, &response_text).await?;
        
        conversation.add_message("bot", &response_text);
        
        // Emitir evento
        let _ = state.event_bus.send(BotEvent::MessageSent {
            bot_id: msg.bot_id,
            to: msg.from.clone(),
            message: response_text,
            timestamp: chrono::Utc::now(),
        });
    }

    // 5. Persistir en Redis
    persist_conversation_state(state, &conversation).await?;

    // 6. Actualizar stats del bot
    if let Some(mut bot) = state.bots.get_mut(&msg.bot_id) {
        bot.stats.messages_received += 1;
        bot.stats.last_message_at = Some(chrono::Utc::now());
    }

    Ok(())
}

async fn send_message_to_whatsapp(
    state: &OrchestratorState,
    bot_id: &Uuid,
    to: &str,
    message: &str,
) -> anyhow::Result<()> {
    // TODO: Llamar al WhatsApp Adapter (port 3010)
    info\!("📤 Sending to {}: {}", to, message);
    
    // Por ahora simulado
    Ok(())
}

async fn persist_conversation_state(
    state: &OrchestratorState,
    conversation: &ConversationState,
) -> anyhow::Result<()> {
    // TODO: Guardar en Redis
    Ok(())
}

async fn load_bots_from_db(state: &OrchestratorState) {
    // TODO: Cargar desde PostgreSQL
    info\!("📚 Loading bots from database...");
    
    // Ejemplo: crear bot de prueba
    let test_bot = BotInstance {
        id: Uuid::new_v4(),
        tenant_id: "test_tenant".to_string(),
        name: "Test Bot".to_string(),
        phone_number: Some("+1234567890".to_string()),
        provider: "venom".to_string(),
        provider_config: serde_json::json\!({
            "bridge_url": "http://localhost:3013",
            "session_name": "test_bot"
        }),
        flows: FlowConfig {
            welcome_flow_id: None,
            menu_flow_id: None,
            fallback_flow_id: None,
        },
        settings: BotSettings {
            business_hours_enabled: false,
            timezone: "UTC".to_string(),
            auto_reply_delay_ms: 500,
            max_conversation_timeout_seconds: 3600,
        },
        stats: BotStats::default(),
    };
    
    state.bots.insert(test_bot.id, test_bot.clone());
    info\!("✅ Loaded {} bots", state.bots.len());
}

fn spawn_analytics_worker(mut event_rx: broadcast::Receiver<BotEvent>) {
    tokio::spawn(async move {
        info\!("📊 Analytics worker started");
        
        while let Ok(event) = event_rx.recv().await {
            // Procesar eventos para analytics
            match event {
                BotEvent::MessageReceived { .. } => {
                    // Incrementar contador
                }
                BotEvent::MessageSent { .. } => {
                    // Incrementar contador
                }
                BotEvent::ConversationStarted { .. } => {
                    // Registrar nueva conversación
                }
                _ => {}
            }
        }
    });
}

fn spawn_cleanup_worker(state: OrchestratorState) {
    tokio::spawn(async move {
        info\!("🧹 Cleanup worker started");
        
        let mut interval = tokio::time::interval(tokio::time::Duration::from_secs(300));
        
        loop {
            interval.tick().await;
            
            // Limpiar conversaciones inactivas (>1 hora)
            let now = chrono::Utc::now();
            let timeout = chrono::Duration::hours(1);
            
            state.conversations.retain(|_id, conv| {
                let elapsed = now - conv.last_activity;
                if elapsed > timeout {
                    info\!("🧹 Cleaning inactive conversation: {}", conv.id);
                    false
                } else {
                    true
                }
            });
        }
    });
}

fn get_memory_usage() -> u64 {
    #[cfg(target_os = "linux")]
    {
        std::fs::read_to_string("/proc/self/status")
            .ok()
            .and_then(|content| {
                content
                    .lines()
                    .find(|line| line.starts_with("VmRSS:"))
                    .and_then(|line| {
                        line.split_whitespace()
                            .nth(1)
                            .and_then(|s| s.parse::<u64>().ok())
                    })
            })
            .map(|kb| kb / 1024)
            .unwrap_or(0)
    }
    #[cfg(not(target_os = "linux"))]
    {
        0
    }
}
