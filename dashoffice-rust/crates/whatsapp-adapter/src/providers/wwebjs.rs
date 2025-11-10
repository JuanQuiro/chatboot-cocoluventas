//\! WhatsApp-Web.js Provider
//\! Provider más popular en GitHub (15K+ stars)

use super::WhatsAppProvider;
use async_trait::async_trait;
use reqwest::Client;
use serde::{Deserialize, Serialize};
use anyhow::{Result, Context};

#[derive(Debug, Clone)]
pub struct WWebJSProvider {
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

#[derive(Debug, Serialize)]
struct SendMediaRequest {
    session_id: String,
    to: String,
    media_url: String,
    caption: Option<String>,
    filename: Option<String>,
}

#[derive(Debug, Deserialize)]
struct SendResponse {
    success: bool,
    message_id: Option<String>,
    timestamp: Option<i64>,
    error: Option<String>,
}

#[derive(Debug, Deserialize)]
struct QRResponse {
    qr_code: Option<String>,
    ready: bool,
    authenticated: bool,
}

#[derive(Debug, Deserialize)]
struct StatusResponse {
    exists: bool,
    ready: bool,
    authenticated: bool,
    state: Option<String>,
    messages_sent: Option<u64>,
    messages_received: Option<u64>,
}

impl WWebJSProvider {
    pub fn new(bridge_url: String, session_id: String) -> Self {
        Self {
            client: Client::new(),
            bridge_url,
            session_id,
        }
    }
}

#[async_trait]
impl WhatsAppProvider for WWebJSProvider {
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
            .context("Failed to send message to WWebJS bridge")?;

        if \!response.status().is_success() {
            let status = response.status();
            let error_text = response.text().await.unwrap_or_default();
            anyhow::bail\!("WWebJS bridge error {}: {}", status, error_text);
        }

        let result: SendResponse = response.json()
            .await
            .context("Failed to parse WWebJS response")?;

        if \!result.success {
            anyhow::bail\!("WWebJS send failed: {}", result.error.unwrap_or_default());
        }

        Ok(result.message_id.unwrap_or_else(|| "unknown".to_string()))
    }

    async fn send_media(&self, to: String, media_url: String, _media_type: String) -> Result<String> {
        let url = format\!("{}/send-media", self.bridge_url);
        
        let payload = SendMediaRequest {
            session_id: self.session_id.clone(),
            to,
            media_url,
            caption: None,
            filename: None,
        };

        let response = self.client
            .post(&url)
            .json(&payload)
            .send()
            .await
            .context("Failed to send media to WWebJS bridge")?;

        let result: SendResponse = response.json()
            .await
            .context("Failed to parse WWebJS media response")?;

        if \!result.success {
            anyhow::bail\!("WWebJS send media failed: {}", result.error.unwrap_or_default());
        }

        Ok(result.message_id.unwrap_or_else(|| "unknown".to_string()))
    }

    async fn get_qr(&self) -> Result<String> {
        let url = format\!("{}/qr/{}", self.bridge_url, self.session_id);
        
        let response = self.client
            .get(&url)
            .send()
            .await
            .context("Failed to get QR from WWebJS bridge")?;

        let result: QRResponse = response.json()
            .await
            .context("Failed to parse QR response")?;

        result.qr_code.ok_or_else(|| anyhow::anyhow\!("QR code not available yet"))
    }

    async fn get_status(&self) -> Result<String> {
        let url = format\!("{}/status/{}", self.bridge_url, self.session_id);
        
        let response = self.client
            .get(&url)
            .send()
            .await
            .context("Failed to get status from WWebJS bridge")?;

        let result: StatusResponse = response.json()
            .await
            .context("Failed to parse status response")?;

        if result.ready {
            Ok("ready".to_string())
        } else if result.authenticated {
            Ok("authenticated".to_string())
        } else if result.exists {
            Ok("initializing".to_string())
        } else {
            Ok("not_created".to_string())
        }
    }

    async fn disconnect(&self) -> Result<()> {
        let url = format\!("{}/session/{}", self.bridge_url, self.session_id);
        
        self.client
            .delete(&url)
            .send()
            .await
            .context("Failed to disconnect from WWebJS bridge")?;

        Ok(())
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_wwebjs_provider_creation() {
        let provider = WWebJSProvider::new(
            "http://localhost:3014".to_string(),
            "test_session".to_string()
        );
        assert_eq\!(provider.session_id, "test_session");
    }
}
