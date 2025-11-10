//\! Conversation Models

use super::*;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ConversationModel {
    pub id: String,
    pub bot_id: Id,
    pub user_phone: String,
    pub status: String,
    pub message_count: i32,
    pub started_at: Timestamp,
    pub ended_at: Option<Timestamp>,
}
