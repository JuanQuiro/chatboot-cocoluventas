//\! # API Gateway
//\! 
//\! REST API principal de DashOffice

use actix_web::{web, App, HttpResponse, HttpServer, Responder};
use actix_cors::Cors;
use sqlx::PgPool;
use redis::Client as RedisClient;
use std::sync::Arc;
use tracing::{info, error};

mod routes;
mod handlers;
mod middleware;

#[derive(Clone)]
pub struct AppState {
    pub db: PgPool,
    pub redis: Arc<RedisClient>,
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    // Setup logging
    tracing_subscriber::fmt()
        .with_env_filter(
            std::env::var("RUST_LOG").unwrap_or_else(|_| "info".to_string())
        )
        .init();

    // Load config
    dotenvy::dotenv().ok();

    info\!("🦀 Starting DashOffice API Gateway");
    info\!("📊 Version: {}", shared::VERSION);

    // Database
    let database_url = std::env::var("DATABASE_URL")
        .expect("DATABASE_URL must be set");

    let db = PgPool::connect(&database_url)
        .await
        .expect("Failed to connect to database");

    info\!("✅ Database connected");

    // Redis
    let redis_url = std::env::var("REDIS_URL")
        .unwrap_or_else(|_| "redis://localhost:6379".to_string());

    let redis = RedisClient::open(redis_url)
        .expect("Failed to connect to Redis");

    info\!("✅ Redis connected");

    let state = AppState {
        db: db.clone(),
        redis: Arc::new(redis),
    };

    let host = std::env::var("HOST")
        .unwrap_or_else(|_| "0.0.0.0".to_string());

    let port = std::env::var("PORT")
        .unwrap_or_else(|_| "3009".to_string())
        .parse::<u16>()
        .expect("Invalid PORT");

    info\!("🚀 Starting server on {}:{}", host, port);

    HttpServer::new(move || {
        let cors = Cors::permissive();

        App::new()
            .wrap(cors)
            .app_data(web::Data::new(state.clone()))
            .service(
                web::scope("/api")
                    .route("/health", web::get().to(health_check))
            )
            .route("/health", web::get().to(health_check))
    })
    .bind((host.as_str(), port))?
    .workers(4)
    .run()
    .await
}

async fn health_check() -> impl Responder {
    HttpResponse::Ok().json(serde_json::json\!({
        "status": "ok",
        "version": shared::VERSION,
        "timestamp": chrono::Utc::now().timestamp(),
    }))
}
