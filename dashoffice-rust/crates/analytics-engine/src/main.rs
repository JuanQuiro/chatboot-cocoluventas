//! # Analytics Engine
//! Motor de analytics y procesamiento de datos en tiempo real

mod aggregator;
mod metrics;
mod scheduler;

use tracing::info;
use mongodb::Client;
use aggregator::Aggregator;
use scheduler::AnalyticsScheduler;

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    dotenvy::dotenv().ok();
    tracing_subscriber::fmt().init();

    info!("📊 Starting Analytics Engine");

    // MongoDB connection
    let mongo_uri = std::env::var("MONGODB_URI")
        .unwrap_or_else(|_| "mongodb://localhost:27017".to_string());
    let mongo_client = Client::with_uri_str(&mongo_uri).await?;
    
    info!("✅ Connected to MongoDB");

    // Create aggregator
    let aggregator = Aggregator::new(mongo_client, "dashoffice".to_string());

    // Start scheduler
    let mut scheduler = AnalyticsScheduler::new(aggregator).await?;
    scheduler.start().await?;

    info!("✅ Analytics Engine running");

    // Keep running
    tokio::signal::ctrl_c().await?;
    info!("Shutting down...");
    
    scheduler.shutdown().await?;
    Ok(())
}
