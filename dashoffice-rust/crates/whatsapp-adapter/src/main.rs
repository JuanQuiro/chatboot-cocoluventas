//\! # WhatsApp Adapter
//\! 
//\! Adaptador universal para múltiples providers de WhatsApp

use actix_web::{web, App, HttpResponse, HttpServer, Responder};
use tracing::info;

mod providers;
mod bridge;

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    tracing_subscriber::fmt()
        .with_env_filter("info")
        .init();

    info\!("📱 Starting WhatsApp Adapter");

    let port = std::env::var("WHATSAPP_PORT")
        .unwrap_or_else(|_| "3010".to_string())
        .parse::<u16>()
        .expect("Invalid port");

    HttpServer::new(|| {
        App::new()
            .route("/health", web::get().to(health_check))
            .route("/send", web::post().to(send_message))
    })
    .bind(("0.0.0.0", port))?
    .run()
    .await
}

async fn health_check() -> impl Responder {
    HttpResponse::Ok().json(serde_json::json\!({
        "status": "ok",
        "service": "whatsapp-adapter"
    }))
}

async fn send_message() -> impl Responder {
    HttpResponse::Ok().json(serde_json::json\!({
        "success": true,
        "message_id": "msg_123"
    }))
}
