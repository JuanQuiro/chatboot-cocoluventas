use chrono::{DateTime, Utc, Duration};
use mongodb::{Client, Collection, bson::{doc, Document}};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use tracing::{info, error};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct MetricAggregation {
    pub metric_name: String,
    pub time_bucket: DateTime<Utc>,
    pub value: f64,
    pub count: i64,
    pub min: f64,
    pub max: f64,
    pub avg: f64,
    pub sum: f64,
    pub dimensions: HashMap<String, String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct TimeSeriesPoint {
    pub timestamp: DateTime<Utc>,
    pub value: f64,
}

pub struct Aggregator {
    mongo_client: Client,
    database_name: String,
}

impl Aggregator {
    pub fn new(mongo_client: Client, database_name: String) -> Self {
        Self {
            mongo_client,
            database_name,
        }
    }

    /// Agrega métricas por hora
    pub async fn aggregate_hourly(&self) -> anyhow::Result<Vec<MetricAggregation>> {
        let now = Utc::now();
        let hour_ago = now - Duration::hours(1);

        info!("Aggregating metrics from {} to {}", hour_ago, now);

        let collection: Collection<Document> = self
            .mongo_client
            .database(&self.database_name)
            .collection("analytics_events");

        let pipeline = vec![
            doc! {
                "$match": {
                    "timestamp": {
                        "$gte": hour_ago,
                        "$lt": now
                    }
                }
            },
            doc! {
                "$group": {
                    "_id": {
                        "event_type": "$event_type",
                        "hour": { "$dateToString": { "format": "%Y-%m-%d %H:00:00", "date": "$timestamp" } }
                    },
                    "count": { "$sum": 1 },
                    "total_value": { "$sum": "$value" },
                    "avg_value": { "$avg": "$value" },
                    "min_value": { "$min": "$value" },
                    "max_value": { "$max": "$value" }
                }
            },
            doc! {
                "$sort": { "_id.hour": -1 }
            },
        ];

        let mut cursor = collection.aggregate(pipeline, None).await?;
        let mut aggregations = Vec::new();

        while cursor.advance().await? {
            let doc = cursor.current();
            
            if let Ok(agg) = self.parse_aggregation_doc(doc) {
                aggregations.push(agg);
            }
        }

        info!("Aggregated {} metrics", aggregations.len());
        Ok(aggregations)
    }

    /// Agrega conversiones (órdenes completadas)
    pub async fn aggregate_conversions(&self) -> anyhow::Result<ConversionMetrics> {
        let now = Utc::now();
        let day_ago = now - Duration::days(1);

        let orders_collection: Collection<Document> = self
            .mongo_client
            .database(&self.database_name)
            .collection("orders");

        let pipeline = vec![
            doc! {
                "$match": {
                    "created_at": {
                        "$gte": day_ago,
                        "$lt": now
                    }
                }
            },
            doc! {
                "$group": {
                    "_id": "$status",
                    "count": { "$sum": 1 },
                    "total_value": { "$sum": "$total" }
                }
            },
        ];

        let mut cursor = orders_collection.aggregate(pipeline, None).await?;
        let mut metrics = ConversionMetrics::default();

        while cursor.advance().await? {
            let doc = cursor.current();
            
            if let Some(status) = doc.get_str("_id").ok() {
                let count = doc.get_i32("count").unwrap_or(0) as i64;
                let total_value = doc.get_f64("total_value").unwrap_or(0.0);

                match status {
                    "completed" => {
                        metrics.completed_orders = count;
                        metrics.total_revenue = total_value;
                    }
                    "pending" => metrics.pending_orders = count,
                    "cancelled" => metrics.cancelled_orders = count,
                    _ => {}
                }
            }
        }

        metrics.conversion_rate = if metrics.total_conversations > 0 {
            (metrics.completed_orders as f64 / metrics.total_conversations as f64) * 100.0
        } else {
            0.0
        };

        Ok(metrics)
    }

    /// Agrega mensajes por bot
    pub async fn aggregate_messages_by_bot(&self) -> anyhow::Result<Vec<BotMetrics>> {
        let now = Utc::now();
        let day_ago = now - Duration::days(1);

        let messages_collection: Collection<Document> = self
            .mongo_client
            .database(&self.database_name)
            .collection("messages");

        let pipeline = vec![
            doc! {
                "$match": {
                    "created_at": {
                        "$gte": day_ago,
                        "$lt": now
                    }
                }
            },
            doc! {
                "$group": {
                    "_id": "$bot_id",
                    "total_messages": { "$sum": 1 },
                    "unique_users": { "$addToSet": "$from_user" },
                    "avg_response_time": { "$avg": "$response_time_ms" }
                }
            },
            doc! {
                "$project": {
                    "_id": 1,
                    "total_messages": 1,
                    "unique_users_count": { "$size": "$unique_users" },
                    "avg_response_time": 1
                }
            },
        ];

        let mut cursor = messages_collection.aggregate(pipeline, None).await?;
        let mut bot_metrics = Vec::new();

        while cursor.advance().await? {
            let doc = cursor.current();
            
            if let Ok(metrics) = self.parse_bot_metrics(doc) {
                bot_metrics.push(metrics);
            }
        }

        Ok(bot_metrics)
    }

    /// Calcula KPIs del día
    pub async fn calculate_daily_kpis(&self) -> anyhow::Result<DailyKPIs> {
        let now = Utc::now();
        let day_ago = now - Duration::days(1);

        let mut kpis = DailyKPIs::default();

        // Total de mensajes
        let messages_collection: Collection<Document> = self
            .mongo_client
            .database(&self.database_name)
            .collection("messages");

        let message_count = messages_collection
            .count_documents(
                doc! { "created_at": { "$gte": day_ago, "$lt": now } },
                None,
            )
            .await?;

        kpis.total_messages = message_count as i64;

        // Conversaciones activas
        let conversations_collection: Collection<Document> = self
            .mongo_client
            .database(&self.database_name)
            .collection("conversations");

        let active_conversations = conversations_collection
            .count_documents(
                doc! { "status": "active", "updated_at": { "$gte": day_ago } },
                None,
            )
            .await?;

        kpis.active_conversations = active_conversations as i64;

        // Métricas de conversión
        let conversion_metrics = self.aggregate_conversions().await?;
        kpis.conversions = conversion_metrics.completed_orders;
        kpis.revenue = conversion_metrics.total_revenue;
        kpis.conversion_rate = conversion_metrics.conversion_rate;

        // Tiempo promedio de respuesta
        let avg_response_pipeline = vec![
            doc! {
                "$match": {
                    "created_at": { "$gte": day_ago, "$lt": now },
                    "response_time_ms": { "$exists": true }
                }
            },
            doc! {
                "$group": {
                    "_id": null,
                    "avg_response_time": { "$avg": "$response_time_ms" }
                }
            },
        ];

        let mut cursor = messages_collection.aggregate(avg_response_pipeline, None).await?;
        if cursor.advance().await? {
            let doc = cursor.current();
            kpis.avg_response_time_ms = doc.get_f64("avg_response_time").unwrap_or(0.0);
        }

        info!("Calculated daily KPIs: {:?}", kpis);
        Ok(kpis)
    }

    /// Crea series temporales para gráficos
    pub async fn create_time_series(
        &self,
        metric_name: &str,
        start: DateTime<Utc>,
        end: DateTime<Utc>,
        interval_minutes: i64,
    ) -> anyhow::Result<Vec<TimeSeriesPoint>> {
        let collection: Collection<Document> = self
            .mongo_client
            .database(&self.database_name)
            .collection("analytics_events");

        let pipeline = vec![
            doc! {
                "$match": {
                    "event_type": metric_name,
                    "timestamp": {
                        "$gte": start,
                        "$lt": end
                    }
                }
            },
            doc! {
                "$group": {
                    "_id": {
                        "$dateToString": {
                            "format": "%Y-%m-%d %H:%M:00",
                            "date": "$timestamp"
                        }
                    },
                    "value": { "$sum": "$value" }
                }
            },
            doc! {
                "$sort": { "_id": 1 }
            },
        ];

        let mut cursor = collection.aggregate(pipeline, None).await?;
        let mut series = Vec::new();

        while cursor.advance().await? {
            let doc = cursor.current();
            
            if let (Ok(timestamp_str), Ok(value)) = (
                doc.get_str("_id"),
                doc.get_f64("value"),
            ) {
                if let Ok(timestamp) = DateTime::parse_from_str(
                    &format!("{} +0000", timestamp_str),
                    "%Y-%m-%d %H:%M:%S %z",
                ) {
                    series.push(TimeSeriesPoint {
                        timestamp: timestamp.with_timezone(&Utc),
                        value,
                    });
                }
            }
        }

        Ok(series)
    }

    fn parse_aggregation_doc(&self, doc: &Document) -> anyhow::Result<MetricAggregation> {
        let id = doc.get_document("_id")?;
        let metric_name = id.get_str("event_type")?.to_string();
        let hour_str = id.get_str("hour")?;
        
        let time_bucket = DateTime::parse_from_str(
            &format!("{} +0000", hour_str),
            "%Y-%m-%d %H:%M:%S %z",
        )?
        .with_timezone(&Utc);

        Ok(MetricAggregation {
            metric_name,
            time_bucket,
            value: doc.get_f64("total_value").unwrap_or(0.0),
            count: doc.get_i64("count").unwrap_or(0),
            min: doc.get_f64("min_value").unwrap_or(0.0),
            max: doc.get_f64("max_value").unwrap_or(0.0),
            avg: doc.get_f64("avg_value").unwrap_or(0.0),
            sum: doc.get_f64("total_value").unwrap_or(0.0),
            dimensions: HashMap::new(),
        })
    }

    fn parse_bot_metrics(&self, doc: &Document) -> anyhow::Result<BotMetrics> {
        Ok(BotMetrics {
            bot_id: doc.get_str("_id")?.to_string(),
            total_messages: doc.get_i64("total_messages").unwrap_or(0),
            unique_users: doc.get_i64("unique_users_count").unwrap_or(0),
            avg_response_time_ms: doc.get_f64("avg_response_time").unwrap_or(0.0),
        })
    }
}

#[derive(Debug, Serialize, Deserialize, Default)]
pub struct ConversionMetrics {
    pub completed_orders: i64,
    pub pending_orders: i64,
    pub cancelled_orders: i64,
    pub total_revenue: f64,
    pub total_conversations: i64,
    pub conversion_rate: f64,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct BotMetrics {
    pub bot_id: String,
    pub total_messages: i64,
    pub unique_users: i64,
    pub avg_response_time_ms: f64,
}

#[derive(Debug, Serialize, Deserialize, Default)]
pub struct DailyKPIs {
    pub total_messages: i64,
    pub active_conversations: i64,
    pub conversions: i64,
    pub revenue: f64,
    pub conversion_rate: f64,
    pub avg_response_time_ms: f64,
    pub date: String,
}
