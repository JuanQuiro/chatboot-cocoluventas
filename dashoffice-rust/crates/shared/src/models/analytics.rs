//\! Analytics Models

use super::*;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Analytics {
    pub total_messages: u64,
    pub total_conversations: u64,
    pub total_orders: u64,
    pub total_revenue: f64,
    pub active_bots: u64,
    pub active_users: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DailyMetrics {
    pub date: String,
    pub messages_sent: u64,
    pub messages_received: u64,
    pub conversations_started: u64,
    pub orders_created: u64,
    pub revenue: f64,
}
