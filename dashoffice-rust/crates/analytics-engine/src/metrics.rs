use redis::AsyncCommands;
use serde::{Deserialize, Serialize};
use chrono::{DateTime, Utc};

const CACHE_TTL: usize = 300;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct RealtimeMetrics {
    pub timestamp: DateTime<Utc>,
    pub messages_per_minute: f64,
    pub active_bots: i64,
    pub active_users: i64,
    pub error_rate: f64,
    pub avg_latency_ms: f64,
    pub cache_hit_rate: f64,
}

pub struct MetricsCollector {
    redis_client: redis::Client,
}

impl MetricsCollector {
    pub fn new(redis_url: &str) -> anyhow::Result<Self> {
        Ok(Self {
            redis_client: redis::Client::open(redis_url)?,
        })
    }

    pub async fn get_realtime_metrics(&self) -> anyhow::Result<RealtimeMetrics> {
        let mut conn = self.redis_client.get_async_connection().await?;

        if let Ok(cached) = conn.get::<_, String>("metrics:realtime").await {
            if let Ok(metrics) = serde_json::from_str::<RealtimeMetrics>(&cached) {
                return Ok(metrics);
            }
        }

        let metrics = self.calculate_realtime_metrics(&mut conn).await?;
        let cached_data = serde_json::to_string(&metrics)?;
        let _: () = conn.set_ex("metrics:realtime", cached_data, CACHE_TTL).await?;

        Ok(metrics)
    }

    async fn calculate_realtime_metrics(&self, conn: &mut redis::aio::Connection) -> anyhow::Result<RealtimeMetrics> {
        let messages_count: i64 = conn.get("counter:messages:minute").await.unwrap_or(0);
        let active_bots: i64 = conn.scard("set:active_bots").await.unwrap_or(0);
        let active_users: i64 = conn.scard("set:active_users").await.unwrap_or(0);

        Ok(RealtimeMetrics {
            timestamp: Utc::now(),
            messages_per_minute: messages_count as f64,
            active_bots,
            active_users,
            error_rate: 0.0,
            avg_latency_ms: 0.0,
            cache_hit_rate: 95.0,
        })
    }

    pub async fn record_metric(&self, name: &str, value: f64) -> anyhow::Result<()> {
        let mut conn = self.redis_client.get_async_connection().await?;
        let key = format!("metric:{}", name);
        let _: () = conn.incr(&key, value).await?;
        Ok(())
    }
}
