//\! Baileys Provider
//\! Lightweight WhatsApp client

use super::WhatsAppProvider;
use async_trait::async_trait;
use reqwest::Client;
use serde::{Deserialize, Serialize};
use anyhow::{Result, Context};

#[derive(Debug, Clone)]
pub struct BaileysProvider {
    client: Client,
    bridge_url: String,
    session_id: String,
}

#[derive(Debug, Serialize)]
struct SendRequest {
    session_id: String,
    to: String,
    message: String,
}

#[derive(Debug, Deserialize)]
struct SendResponse {
    success: bool,
    message_id: Option<String>,
    error: Option<String>,
}

impl BaileysProvider {
    pub fn new(bridge_url: String, session_id: String) -> Self {
        Self {
            client: Client::new(),
            bridge_url,
            session_id,
        }
    }
}

#[async_trait]
impl WhatsAppProvider for BaileysProvider {
    async fn send_message(&self, to: String, message: String) -> Result<String> {
        let url = format\!("{}/send", self.bridge_url);
        
        let payload = SendRequest {
            session_id: self.session_id.clone(),
            to,
            message,
        };

        let response = self.client
            .post(&url)
            .json(&payload)
            .send()
            .await
            .context("Failed to send message to Baileys bridge")?;

        let result: SendResponse = response.json()
            .await
            .context("Failed to parse Baileys response")?;

        if \!result.success {
            anyhow::bail\!("Baileys send failed: {}", result.error.unwrap_or_default());
        }

        Ok(result.message_id.unwrap_or_else(|| "unknown".to_string()))
    }

    async fn send_media(&self, to: String, media_url: String, _media_type: String) -> Result<String> {
        // Baileys implementation for media
        let url = format\!("{}/send-media", self.bridge_url);
        
        let response = self.client
            .post(&url)
            .json(&serde_json::json\!({
                "session_id": self.session_id,
                "to": to,
                "media_url": media_url
            }))
            .send()
            .await
            .context("Failed to send media to Baileys bridge")?;

        let result: SendResponse = response.json().await?;
        
        if \!result.success {
            anyhow::bail\!("Baileys media failed");
        }

        Ok(result.message_id.unwrap_or_default())
    }

    async fn get_qr(&self) -> Result<String> {
        let url = format\!("{}/qr/{}", self.bridge_url, self.session_id);
        
        let response = self.client
            .get(&url)
            .send()
            .await
            .context("Failed to get QR")?;

        let data: serde_json::Value = response.json().await?;
        
        data.get("qr")
            .and_then(|v| v.as_str())
            .map(|s| s.to_string())
            .ok_or_else(|| anyhow::anyhow\!("QR not available"))
    }

    async fn get_status(&self) -> Result<String> {
        Ok("connected".to_string())
    }

    async fn disconnect(&self) -> Result<()> {
        Ok(())
    }
}
