//\! Bot Models - Modelos relacionados con bots de WhatsApp

use super::*;

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct Bot {
    pub id: Id,
    pub tenant_id: String,
    pub name: String,
    pub phone_number: Option<String>,
    pub provider: String,
    pub status: String,
    pub config: Metadata,
    pub created_at: Timestamp,
    pub updated_at: Timestamp,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CreateBotRequest {
    pub name: String,
    pub tenant_id: String,
    pub provider: String,
    pub config: Metadata,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SendMessageRequest {
    pub bot_id: Id,
    pub to: String,
    pub message: String,
}
