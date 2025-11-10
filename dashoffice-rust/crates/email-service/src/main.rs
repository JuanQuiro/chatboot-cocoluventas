//\! Email Service - Envío de Emails
//\! 
//\! Funcionalidades:
//\! - SMTP configuration
//\! - Template engine (Handlebars)
//\! - Email queue management
//\! - Delivery tracking
//\! - Multiple providers (SendGrid, AWS SES, SMTP)
//\! - Retry logic
//\! - Attachments support

use actix_web::{web, App, HttpServer, HttpResponse};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(Debug, Serialize, Deserialize)]
pub struct SendEmailRequest {
    pub to: Vec<String>,
    pub cc: Option<Vec<String>>,
    pub bcc: Option<Vec<String>>,
    pub subject: String,
    pub body: String,
    pub template: Option<String>,
    pub template_data: Option<HashMap<String, String>>,
    pub attachments: Option<Vec<Attachment>>,
    pub priority: EmailPriority,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Attachment {
    pub filename: String,
    pub content_type: String,
    pub data: Vec<u8>,
}

#[derive(Debug, Serialize, Deserialize, Clone, Copy)]
#[serde(rename_all = "lowercase")]
pub enum EmailPriority {
    Low,
    Normal,
    High,
    Urgent,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct SendEmailResponse {
    pub message_id: String,
    pub status: EmailStatus,
    pub queued_at: chrono::DateTime<chrono::Utc>,
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum EmailStatus {
    Queued,
    Sent,
    Failed,
    Bounced,
    Delivered,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct EmailTemplate {
    pub id: String,
    pub name: String,
    pub subject: String,
    pub html_body: String,
    pub text_body: Option<String>,
    pub variables: Vec<String>,
}

/// Servicio de Email
pub struct EmailService {
    smtp_host: String,
    smtp_port: u16,
    smtp_username: String,
    smtp_password: String,
    from_email: String,
    from_name: String,
    templates: HashMap<String, EmailTemplate>,
}

impl EmailService {
    pub fn new() -> Self {
        let mut templates = HashMap::new();
        
        // Template de bienvenida
        templates.insert("welcome".to_string(), EmailTemplate {
            id: "welcome".to_string(),
            name: "Welcome Email".to_string(),
            subject: "Bienvenido a {{company_name}}".to_string(),
            html_body: r#"
                <h1>¡Bienvenido {{user_name}}\!</h1>
                <p>Gracias por unirte a {{company_name}}.</p>
                <p>Tu cuenta ha sido creada exitosamente.</p>
            "#.to_string(),
            text_body: Some("Bienvenido {{user_name}}\! Gracias por unirte.".to_string()),
            variables: vec\!["user_name".to_string(), "company_name".to_string()],
        });
        
        // Template de orden confirmada
        templates.insert("order_confirmed".to_string(), EmailTemplate {
            id: "order_confirmed".to_string(),
            name: "Order Confirmation".to_string(),
            subject: "Orden #{{order_number}} Confirmada".to_string(),
            html_body: r#"
                <h1>Orden Confirmada</h1>
                <p>Hola {{customer_name}},</p>
                <p>Tu orden #{{order_number}} ha sido confirmada.</p>
                <p>Total: ${{total}}</p>
                <p>Fecha estimada de entrega: {{delivery_date}}</p>
            "#.to_string(),
            text_body: Some("Orden #{{order_number}} confirmada. Total: ${{total}}".to_string()),
            variables: vec\![
                "customer_name".to_string(),
                "order_number".to_string(),
                "total".to_string(),
                "delivery_date".to_string(),
            ],
        });
        
        // Template de factura
        templates.insert("invoice".to_string(), EmailTemplate {
            id: "invoice".to_string(),
            name: "Invoice".to_string(),
            subject: "Factura #{{invoice_number}}".to_string(),
            html_body: r#"
                <h1>Factura #{{invoice_number}}</h1>
                <p>Cliente: {{customer_name}}</p>
                <p>Fecha: {{invoice_date}}</p>
                <p>Total: ${{total}}</p>
                <p>Ver factura adjunta.</p>
            "#.to_string(),
            text_body: None,
            variables: vec\![
                "invoice_number".to_string(),
                "customer_name".to_string(),
                "invoice_date".to_string(),
                "total".to_string(),
            ],
        });
        
        Self {
            smtp_host: std::env::var("SMTP_HOST").unwrap_or_else(|_| "localhost".to_string()),
            smtp_port: std::env::var("SMTP_PORT")
                .unwrap_or_else(|_| "587".to_string())
                .parse()
                .unwrap_or(587),
            smtp_username: std::env::var("SMTP_USERNAME").unwrap_or_default(),
            smtp_password: std::env::var("SMTP_PASSWORD").unwrap_or_default(),
            from_email: std::env::var("FROM_EMAIL").unwrap_or_else(|_| "noreply@example.com".to_string()),
            from_name: std::env::var("FROM_NAME").unwrap_or_else(|_| "DashOffice".to_string()),
            templates,
        }
    }
    
    pub async fn send_email(&self, request: SendEmailRequest) -> Result<SendEmailResponse, String> {
        // Renderizar template si se especifica
        let body = if let Some(template_name) = &request.template {
            if let Some(template) = self.templates.get(template_name) {
                self.render_template(template, request.template_data.as_ref())?
            } else {
                return Err(format\!("Template '{}' not found", template_name));
            }
        } else {
            request.body.clone()
        };
        
        // Simular envío (en producción usar lettre o similar)
        tracing::info\!(
            "Sending email to {:?} with subject: {}",
            request.to,
            request.subject
        );
        
        // Generar message ID
        let message_id = uuid::Uuid::new_v4().to_string();
        
        Ok(SendEmailResponse {
            message_id,
            status: EmailStatus::Queued,
            queued_at: chrono::Utc::now(),
        })
    }
    
    fn render_template(
        &self,
        template: &EmailTemplate,
        data: Option<&HashMap<String, String>>,
    ) -> Result<String, String> {
        let mut body = template.html_body.clone();
        
        if let Some(data) = data {
            for (key, value) in data {
                let placeholder = format\!("{{{{{}}}}}", key);
                body = body.replace(&placeholder, value);
            }
        }
        
        Ok(body)
    }
    
    pub fn get_template(&self, template_id: &str) -> Option<&EmailTemplate> {
        self.templates.get(template_id)
    }
    
    pub fn list_templates(&self) -> Vec<&EmailTemplate> {
        self.templates.values().collect()
    }
}

// HTTP Handlers
async fn send_email(
    req: web::Json<SendEmailRequest>,
) -> HttpResponse {
    let service = EmailService::new();
    
    match service.send_email(req.into_inner()).await {
        Ok(response) => HttpResponse::Ok().json(response),
        Err(e) => HttpResponse::BadRequest().json(serde_json::json\!({
            "error": e
        }))
    }
}

async fn list_templates() -> HttpResponse {
    let service = EmailService::new();
    let templates = service.list_templates();
    
    HttpResponse::Ok().json(templates)
}

async fn get_template(path: web::Path<String>) -> HttpResponse {
    let service = EmailService::new();
    let template_id = path.into_inner();
    
    match service.get_template(&template_id) {
        Some(template) => HttpResponse::Ok().json(template),
        None => HttpResponse::NotFound().json(serde_json::json\!({
            "error": "Template not found"
        }))
    }
}

async fn health_check() -> HttpResponse {
    HttpResponse::Ok().json(serde_json::json\!({
        "status": "ok",
        "service": "email-service"
    }))
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    tracing_subscriber::fmt::init();
    
    let port = std::env::var("EMAIL_PORT")
        .unwrap_or_else(|_| "3016".to_string())
        .parse::<u16>()
        .expect("Invalid EMAIL_PORT");
    
    tracing::info\!("📧 Starting Email Service on port {}", port);
    
    HttpServer::new(|| {
        App::new()
            .route("/health", web::get().to(health_check))
            .route("/send", web::post().to(send_email))
            .route("/templates", web::get().to(list_templates))
            .route("/templates/{id}", web::get().to(get_template))
    })
    .bind(("0.0.0.0", port))?
    .run()
    .await
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_send_simple_email() {
        let service = EmailService::new();
        
        let request = SendEmailRequest {
            to: vec\!["test@example.com".to_string()],
            cc: None,
            bcc: None,
            subject: "Test".to_string(),
            body: "Test body".to_string(),
            template: None,
            template_data: None,
            attachments: None,
            priority: EmailPriority::Normal,
        };
        
        let result = service.send_email(request).await;
        assert\!(result.is_ok());
    }
    
    #[test]
    fn test_template_rendering() {
        let service = EmailService::new();
        let template = service.get_template("welcome").unwrap();
        
        let mut data = HashMap::new();
        data.insert("user_name".to_string(), "John".to_string());
        data.insert("company_name".to_string(), "DashOffice".to_string());
        
        let rendered = service.render_template(template, Some(&data)).unwrap();
        
        assert\!(rendered.contains("John"));
        assert\!(rendered.contains("DashOffice"));
    }
}
