//\! Venom-bot Provider
//\! Provider más popular en LATAM para WhatsApp

use super::WhatsAppProvider;
use async_trait::async_trait;
use reqwest::Client;
use serde::{Deserialize, Serialize};
use anyhow::{Result, Context};

#[derive(Debug, Clone)]
pub struct VenomProvider {
    client: Client,
    bridge_url: String,
    session_name: String,
}

#[derive(Debug, Serialize)]
struct SendRequest {
    session_name: String,
    to: String,
    message: String,
    options: serde_json::Value,
}

#[derive(Debug, Serialize)]
struct SendMediaRequest {
    session_name: String,
    to: String,
    media_url: String,
    media_type: String,
    caption: Option<String>,
    filename: Option<String>,
}

#[derive(Debug, Deserialize)]
struct SendResponse {
    success: bool,
    message_id: Option<String>,
    error: Option<String>,
    timestamp: Option<String>,
}

#[derive(Debug, Deserialize)]
struct QRResponse {
    qr_code: Option<String>,
    is_ready: bool,
    session_name: String,
}

#[derive(Debug, Deserialize)]
struct StatusResponse {
    exists: bool,
    connected: bool,
    state: Option<String>,
    messages_sent: Option<u64>,
    messages_received: Option<u64>,
    uptime: Option<u64>,
}

impl VenomProvider {
    pub fn new(bridge_url: String, session_name: String) -> Self {
        Self {
            client: Client::new(),
            bridge_url,
            session_name,
        }
    }

    async fn ensure_session(&self) -> Result<()> {
        // Verificar que la sesión exista
        let status_url = format\!("{}/status/{}", self.bridge_url, self.session_name);
        let response = self.client
            .get(&status_url)
            .send()
            .await
            .context("Failed to check session status")?;

        if \!response.status().is_success() {
            anyhow::bail\!("Session check failed: {}", response.status());
        }

        Ok(())
    }
}

#[async_trait]
impl WhatsAppProvider for VenomProvider {
    async fn send_message(&self, to: String, message: String) -> Result<String> {
        let url = format\!("{}/send", self.bridge_url);
        
        let payload = SendRequest {
            session_name: self.session_name.clone(),
            to,
            message,
            options: serde_json::json\!({}),
        };

        let response = self.client
            .post(&url)
            .json(&payload)
            .send()
            .await
            .context("Failed to send message to Venom bridge")?;

        if \!response.status().is_success() {
            let status = response.status();
            let error_text = response.text().await.unwrap_or_default();
            anyhow::bail\!("Venom bridge error {}: {}", status, error_text);
        }

        let result: SendResponse = response.json()
            .await
            .context("Failed to parse Venom response")?;

        if \!result.success {
            anyhow::bail\!("Venom send failed: {}", result.error.unwrap_or_default());
        }

        Ok(result.message_id.unwrap_or_else(|| "unknown".to_string()))
    }

    async fn send_media(&self, to: String, media_url: String, media_type: String) -> Result<String> {
        let url = format\!("{}/send-media", self.bridge_url);
        
        let payload = SendMediaRequest {
            session_name: self.session_name.clone(),
            to,
            media_url,
            media_type,
            caption: None,
            filename: None,
        };

        let response = self.client
            .post(&url)
            .json(&payload)
            .send()
            .await
            .context("Failed to send media to Venom bridge")?;

        let result: SendResponse = response.json()
            .await
            .context("Failed to parse Venom media response")?;

        if \!result.success {
            anyhow::bail\!("Venom send media failed: {}", result.error.unwrap_or_default());
        }

        Ok(result.message_id.unwrap_or_else(|| "unknown".to_string()))
    }

    async fn get_qr(&self) -> Result<String> {
        let url = format\!("{}/qr/{}", self.bridge_url, self.session_name);
        
        let response = self.client
            .get(&url)
            .send()
            .await
            .context("Failed to get QR from Venom bridge")?;

        let result: QRResponse = response.json()
            .await
            .context("Failed to parse QR response")?;

        result.qr_code.ok_or_else(|| anyhow::anyhow\!("QR code not available"))
    }

    async fn get_status(&self) -> Result<String> {
        let url = format\!("{}/status/{}", self.bridge_url, self.session_name);
        
        let response = self.client
            .get(&url)
            .send()
            .await
            .context("Failed to get status from Venom bridge")?;

        let result: StatusResponse = response.json()
            .await
            .context("Failed to parse status response")?;

        if result.connected {
            Ok("connected".to_string())
        } else if result.exists {
            Ok("disconnected".to_string())
        } else {
            Ok("not_initialized".to_string())
        }
    }

    async fn disconnect(&self) -> Result<()> {
        let url = format\!("{}/session/{}", self.bridge_url, self.session_name);
        
        self.client
            .delete(&url)
            .send()
            .await
            .context("Failed to disconnect from Venom bridge")?;

        Ok(())
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_venom_provider_creation() {
        let provider = VenomProvider::new(
            "http://localhost:3013".to_string(),
            "test_session".to_string()
        );
        assert_eq\!(provider.session_name, "test_session");
    }
}
