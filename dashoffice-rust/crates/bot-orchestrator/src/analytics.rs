//\! Analytics en tiempo real

use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BotAnalytics {
    pub bot_id: uuid::Uuid,
    pub total_conversations: u64,
    pub active_conversations: u64,
    pub messages_sent_today: u64,
    pub messages_received_today: u64,
    pub avg_response_time_ms: u64,
    pub conversion_rate: f64,
}
