//\! State Machine - Gestión de estado de conversaciones

use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use uuid::Uuid;
use chrono::{DateTime, Utc};

/// Estado de una conversación
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ConversationState {
    pub id: String,
    pub bot_id: Uuid,
    pub user_phone: String,
    pub current_flow_id: Option<Uuid>,
    pub current_step_id: Option<String>,
    pub context: HashMap<String, serde_json::Value>,
    pub message_history: Vec<ConversationMessage>,
    pub created_at: DateTime<Utc>,
    pub last_activity: DateTime<Utc>,
    pub metadata: HashMap<String, serde_json::Value>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ConversationMessage {
    pub role: String,
    pub content: String,
    pub timestamp: DateTime<Utc>,
}

impl ConversationState {
    pub fn new(id: String, bot_id: Uuid, user_phone: String) -> Self {
        let now = Utc::now();
        Self {
            id,
            bot_id,
            user_phone,
            current_flow_id: None,
            current_step_id: None,
            context: HashMap::new(),
            message_history: Vec::new(),
            created_at: now,
            last_activity: now,
            metadata: HashMap::new(),
        }
    }
    
    pub fn add_message(&mut self, role: &str, content: &str) {
        self.message_history.push(ConversationMessage {
            role: role.to_string(),
            content: content.to_string(),
            timestamp: Utc::now(),
        });
    }
    
    pub fn set_variable(&mut self, key: &str, value: serde_json::Value) {
        self.context.insert(key.to_string(), value);
    }
    
    pub fn get_variable(&self, key: &str) -> Option<&serde_json::Value> {
        self.context.get(key)
    }
    
    pub fn update_last_activity(&mut self) {
        self.last_activity = Utc::now();
    }
}
