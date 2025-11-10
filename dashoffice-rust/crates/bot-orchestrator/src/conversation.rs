//\! Conversation Management

use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Conversation {
    pub id: Uuid,
    pub bot_id: Uuid,
    pub user_id: String,
    pub status: ConversationStatus,
    pub started_at: chrono::DateTime<chrono::Utc>,
    pub ended_at: Option<chrono::DateTime<chrono::Utc>>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum ConversationStatus {
    Active,
    Paused,
    Ended,
    Abandoned,
}
