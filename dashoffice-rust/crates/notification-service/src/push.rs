use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct PushNotification {
    pub title: String,
    pub body: String,
}

pub struct PushService;

impl PushService {
    pub fn new() -> Self {
        Self
    }
    
    pub async fn send(&self, notif: PushNotification) -> anyhow::Result<()> {
        Ok(())
    }
}