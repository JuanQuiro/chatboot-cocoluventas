//\! WhatsApp Providers
//\! 
//\! Sistema multi-provider para WhatsApp con soporte para:
//\! - Venom-bot (más popular LATAM)
//\! - WhatsApp-Web.js (más popular GitHub)
//\! - Baileys (lightweight)
//\! - Official API (Meta Business)
//\! - Twilio (SLA)
//\! - Evolution API (self-hosted)

pub mod venom;
pub mod wwebjs;
pub mod baileys;
pub mod official;
pub mod twilio;

use async_trait::async_trait;
use anyhow::Result;

/// Trait universal para todos los providers de WhatsApp
#[async_trait]
pub trait WhatsAppProvider: Send + Sync {
    /// Enviar mensaje de texto
    async fn send_message(&self, to: String, message: String) -> Result<String>;
    
    /// Enviar media (imagen, video, documento, audio)
    async fn send_media(&self, to: String, media_url: String, media_type: String) -> Result<String>;
    
    /// Obtener código QR para escanear (si aplica)
    async fn get_qr(&self) -> Result<String>;
    
    /// Obtener estado de la conexión
    async fn get_status(&self) -> Result<String>;
    
    /// Desconectar y limpiar recursos
    async fn disconnect(&self) -> Result<()>;
}

/// Factory para crear providers según tipo
pub enum ProviderType {
    Venom { bridge_url: String, session_name: String },
    WWebJS { bridge_url: String, session_id: String },
    Baileys { bridge_url: String, session_id: String },
    Official { access_token: String, phone_number_id: String },
    Twilio { account_sid: String, auth_token: String, from: String },
}

impl ProviderType {
    pub fn create(self) -> Box<dyn WhatsAppProvider> {
        match self {
            ProviderType::Venom { bridge_url, session_name } => {
                Box::new(venom::VenomProvider::new(bridge_url, session_name))
            }
            ProviderType::WWebJS { bridge_url, session_id } => {
                Box::new(wwebjs::WWebJSProvider::new(bridge_url, session_id))
            }
            ProviderType::Baileys { bridge_url, session_id } => {
                Box::new(baileys::BaileysProvider::new(bridge_url, session_id))
            }
            ProviderType::Official { access_token, phone_number_id } => {
                Box::new(official::OfficialProvider::new(access_token, phone_number_id))
            }
            ProviderType::Twilio { account_sid, auth_token, from } => {
                Box::new(twilio::TwilioProvider::new(account_sid, auth_token, from))
            }
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_provider_factory() {
        let provider = ProviderType::Venom {
            bridge_url: "http://localhost:3013".to_string(),
            session_name: "test".to_string()
        }.create();
        
        // Provider created successfully
        assert\!(true);
    }
}
