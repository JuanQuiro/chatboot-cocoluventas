//\! Twilio Provider

use super::WhatsAppProvider;
use async_trait::async_trait;

pub struct TwilioProvider;

#[async_trait]
impl WhatsAppProvider for TwilioProvider {
    async fn send_message(&self, _phone: String, _message: String) -> anyhow::Result<String> {
        Ok("msg_123".to_string())
    }

    async fn get_qr(&self) -> anyhow::Result<String> {
        Ok("qr_code_data".to_string())
    }

    async fn get_status(&self) -> anyhow::Result<String> {
        Ok("connected".to_string())
    }
}
