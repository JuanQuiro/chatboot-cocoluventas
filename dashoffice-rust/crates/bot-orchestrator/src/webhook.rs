//\! Webhook Handlers - Manejo de webhooks de diferentes providers

use actix_web::{web, HttpResponse, Responder};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

use super::{OrchestratorState, IncomingMessage};

/// Webhook de Venom
#[derive(Debug, Deserialize)]
pub struct VenomWebhook {
    pub session_name: String,
    pub from: String,
    pub message: String,
    pub timestamp: Option<chrono::DateTime<chrono::Utc>>,
}

pub async fn handle_venom_webhook(
    state: web::Data<OrchestratorState>,
    payload: web::Json<VenomWebhook>,
) -> impl Responder {
    tracing::info\!("🕷️ Venom webhook from {}", payload.from);
    
    // Encontrar bot por session_name
    let bot = state.bots.iter()
        .find(|entry| {
            if let Some(config) = entry.value().provider_config.get("session_name") {
                config.as_str() == Some(&payload.session_name)
            } else {
                false
            }
        });
    
    if let Some(bot_entry) = bot {
        let bot_id = *bot_entry.key();
        
        let msg = IncomingMessage {
            bot_id,
            from: payload.from.clone(),
            message: payload.message.clone(),
            message_type: "text".to_string(),
            timestamp: payload.timestamp.unwrap_or_else(chrono::Utc::now),
        };
        
        // Procesar en background
        let state_clone = state.into_inner();
        tokio::spawn(async move {
            if let Err(e) = super::process_message(&state_clone, msg).await {
                tracing::error\!("Error processing Venom webhook: {}", e);
            }
        });
        
        HttpResponse::Ok().json(serde_json::json\!({ "status": "ok" }))
    } else {
        HttpResponse::NotFound().json(serde_json::json\!({ "error": "Bot not found" }))
    }
}

/// Webhook de WWebJS
#[derive(Debug, Deserialize)]
pub struct WWebJSWebhook {
    pub session_id: String,
    pub from: String,
    pub body: String,
    pub timestamp: Option<i64>,
}

pub async fn handle_wwebjs_webhook(
    state: web::Data<OrchestratorState>,
    payload: web::Json<WWebJSWebhook>,
) -> impl Responder {
    tracing::info\!("🌐 WWebJS webhook from {}", payload.from);
    
    let bot = state.bots.iter()
        .find(|entry| {
            if let Some(config) = entry.value().provider_config.get("session_id") {
                config.as_str() == Some(&payload.session_id)
            } else {
                false
            }
        });
    
    if let Some(bot_entry) = bot {
        let bot_id = *bot_entry.key();
        
        let timestamp = payload.timestamp
            .and_then(|ts| chrono::DateTime::from_timestamp(ts, 0))
            .unwrap_or_else(chrono::Utc::now);
        
        let msg = IncomingMessage {
            bot_id,
            from: payload.from.clone(),
            message: payload.body.clone(),
            message_type: "text".to_string(),
            timestamp,
        };
        
        let state_clone = state.into_inner();
        tokio::spawn(async move {
            if let Err(e) = super::process_message(&state_clone, msg).await {
                tracing::error\!("Error processing WWebJS webhook: {}", e);
            }
        });
        
        HttpResponse::Ok().json(serde_json::json\!({ "status": "ok" }))
    } else {
        HttpResponse::NotFound().json(serde_json::json\!({ "error": "Bot not found" }))
    }
}

/// Webhook de Baileys
pub async fn handle_baileys_webhook(
    state: web::Data<OrchestratorState>,
    payload: web::Json<serde_json::Value>,
) -> impl Responder {
    tracing::info\!("⚡ Baileys webhook");
    
    // TODO: Parsear formato de Baileys
    
    HttpResponse::Ok().json(serde_json::json\!({ "status": "ok" }))
}
