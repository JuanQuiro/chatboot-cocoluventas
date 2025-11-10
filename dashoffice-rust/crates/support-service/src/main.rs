//\! Support Service - Sistema de Soporte y Tickets
//\! 
//\! Funcionalidades:
//\! - Ticket system
//\! - Priority queue
//\! - Assignment automation
//\! - SLA tracking
//\! - Canned responses
//\! - Ticket history

use actix_web::{web, App, HttpServer, HttpResponse};
use serde::{Deserialize, Serialize};
use chrono::{DateTime, Utc};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Ticket {
    pub id: uuid::Uuid,
    pub ticket_number: String,
    pub tenant_id: String,
    pub customer_id: String,
    pub customer_name: String,
    pub customer_email: String,
    pub subject: String,
    pub description: String,
    pub category: TicketCategory,
    pub priority: TicketPriority,
    pub status: TicketStatus,
    pub assigned_to: Option<String>,
    pub assigned_at: Option<DateTime<Utc>>,
    pub resolved_at: Option<DateTime<Utc>>,
    pub closed_at: Option<DateTime<Utc>>,
    pub tags: Vec<String>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
    pub sla_due_at: DateTime<Utc>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "snake_case")]
pub enum TicketCategory {
    Technical,
    Billing,
    Sales,
    General,
    Complaint,
    FeatureRequest,
}

#[derive(Debug, Serialize, Deserialize, Clone, Copy, PartialEq, Eq, PartialOrd, Ord)]
#[serde(rename_all = "lowercase")]
pub enum TicketPriority {
    Low,
    Normal,
    High,
    Urgent,
    Critical,
}

#[derive(Debug, Serialize, Deserialize, Clone, PartialEq)]
#[serde(rename_all = "lowercase")]
pub enum TicketStatus {
    New,
    Open,
    InProgress,
    Waiting,
    Resolved,
    Closed,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct CreateTicketRequest {
    pub tenant_id: String,
    pub customer_id: String,
    pub customer_name: String,
    pub customer_email: String,
    pub subject: String,
    pub description: String,
    pub category: TicketCategory,
    pub priority: TicketPriority,
    pub tags: Vec<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct TicketComment {
    pub id: uuid::Uuid,
    pub ticket_id: uuid::Uuid,
    pub author_id: String,
    pub author_name: String,
    pub content: String,
    pub is_internal: bool,
    pub created_at: DateTime<Utc>,
}

/// Servicio de Soporte
pub struct SupportService {
    ticket_counter: std::sync::Arc<std::sync::Mutex<u32>>,
}

impl SupportService {
    pub fn new() -> Self {
        Self {
            ticket_counter: std::sync::Arc::new(std::sync::Mutex::new(10000)),
        }
    }
    
    pub fn generate_ticket_number(&self) -> String {
        let mut counter = self.ticket_counter.lock().unwrap();
        *counter += 1;
        format\!("TKT-{:08}", *counter)
    }
    
    pub fn calculate_sla_due(&self, priority: TicketPriority) -> DateTime<Utc> {
        let hours = match priority {
            TicketPriority::Critical => 2,
            TicketPriority::Urgent => 4,
            TicketPriority::High => 8,
            TicketPriority::Normal => 24,
            TicketPriority::Low => 72,
        };
        
        Utc::now() + chrono::Duration::hours(hours)
    }
    
    pub fn create_ticket(
        &self,
        request: CreateTicketRequest,
    ) -> Result<Ticket, String> {
        let ticket_number = self.generate_ticket_number();
        let sla_due_at = self.calculate_sla_due(request.priority);
        
        let ticket = Ticket {
            id: uuid::Uuid::new_v4(),
            ticket_number,
            tenant_id: request.tenant_id,
            customer_id: request.customer_id,
            customer_name: request.customer_name,
            customer_email: request.customer_email,
            subject: request.subject,
            description: request.description,
            category: request.category,
            priority: request.priority,
            status: TicketStatus::New,
            assigned_to: None,
            assigned_at: None,
            resolved_at: None,
            closed_at: None,
            tags: request.tags,
            created_at: Utc::now(),
            updated_at: Utc::now(),
            sla_due_at,
        };
        
        tracing::info\!(
            "Ticket {} created - Priority: {:?}, SLA: {}",
            ticket.ticket_number,
            ticket.priority,
            ticket.sla_due_at.format("%Y-%m-%d %H:%M")
        );
        
        Ok(ticket)
    }
    
    pub fn assign_ticket(
        &self,
        ticket: &mut Ticket,
        agent_id: String,
    ) -> Result<(), String> {
        if ticket.status == TicketStatus::Closed {
            return Err("Cannot assign closed ticket".to_string());
        }
        
        ticket.assigned_to = Some(agent_id.clone());
        ticket.assigned_at = Some(Utc::now());
        ticket.status = TicketStatus::InProgress;
        ticket.updated_at = Utc::now();
        
        tracing::info\!(
            "Ticket {} assigned to agent {}",
            ticket.ticket_number,
            agent_id
        );
        
        Ok(())
    }
    
    pub fn resolve_ticket(&self, ticket: &mut Ticket) -> Result<(), String> {
        if ticket.status == TicketStatus::Resolved || ticket.status == TicketStatus::Closed {
            return Err("Ticket already resolved/closed".to_string());
        }
        
        ticket.status = TicketStatus::Resolved;
        ticket.resolved_at = Some(Utc::now());
        ticket.updated_at = Utc::now();
        
        tracing::info\!("Ticket {} resolved", ticket.ticket_number);
        
        Ok(())
    }
    
    pub fn close_ticket(&self, ticket: &mut Ticket) -> Result<(), String> {
        if ticket.status \!= TicketStatus::Resolved {
            return Err("Can only close resolved tickets".to_string());
        }
        
        ticket.status = TicketStatus::Closed;
        ticket.closed_at = Some(Utc::now());
        ticket.updated_at = Utc::now();
        
        tracing::info\!("Ticket {} closed", ticket.ticket_number);
        
        Ok(())
    }
    
    pub fn check_sla_breach(&self, tickets: &[Ticket]) -> Vec<&Ticket> {
        let now = Utc::now();
        
        tickets
            .iter()
            .filter(|t| {
                t.status \!= TicketStatus::Resolved
                    && t.status \!= TicketStatus::Closed
                    && t.sla_due_at < now
            })
            .collect()
    }
    
    pub fn get_canned_responses(&self, category: &TicketCategory) -> Vec<String> {
        match category {
            TicketCategory::Technical => vec\![
                "Hemos recibido tu reporte técnico y estamos investigando.".to_string(),
                "Por favor intenta reiniciar la aplicación.".to_string(),
            ],
            TicketCategory::Billing => vec\![
                "Tu consulta de facturación ha sido recibida.".to_string(),
                "Procesaremos tu reembolso en 3-5 días hábiles.".to_string(),
            ],
            _ => vec\!["Gracias por contactarnos.".to_string()],
        }
    }
}

// HTTP Handlers
async fn create_ticket(
    req: web::Json<CreateTicketRequest>,
) -> HttpResponse {
    let service = SupportService::new();
    
    match service.create_ticket(req.into_inner()) {
        Ok(ticket) => HttpResponse::Ok().json(ticket),
        Err(e) => HttpResponse::BadRequest().json(serde_json::json\!({
            "error": e
        }))
    }
}

async fn assign_ticket(
    path: web::Path<uuid::Uuid>,
    req: web::Json<serde_json::Value>,
) -> HttpResponse {
    let ticket_id = path.into_inner();
    let agent_id = req
        .get("agent_id")
        .and_then(|v| v.as_str())
        .unwrap_or("")
        .to_string();
    
    // TODO: Actualizar en DB
    tracing::info\!("Assigning ticket {} to agent {}", ticket_id, agent_id);
    
    HttpResponse::Ok().json(serde_json::json\!({
        "ticket_id": ticket_id,
        "assigned_to": agent_id
    }))
}

async fn health_check() -> HttpResponse {
    HttpResponse::Ok().json(serde_json::json\!({
        "status": "ok",
        "service": "support-service"
    }))
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    tracing_subscriber::fmt::init();
    
    let port = std::env::var("SUPPORT_PORT")
        .unwrap_or_else(|_| "3019".to_string())
        .parse::<u16>()
        .expect("Invalid SUPPORT_PORT");
    
    tracing::info\!("🎫 Starting Support Service on port {}", port);
    
    HttpServer::new(|| {
        App::new()
            .route("/health", web::get().to(health_check))
            .route("/tickets", web::post().to(create_ticket))
            .route("/tickets/{ticket_id}/assign", web::post().to(assign_ticket))
    })
    .bind(("0.0.0.0", port))?
    .run()
    .await
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_create_ticket() {
        let service = SupportService::new();
        
        let request = CreateTicketRequest {
            tenant_id: "tenant1".to_string(),
            customer_id: "cust123".to_string(),
            customer_name: "John Doe".to_string(),
            customer_email: "john@example.com".to_string(),
            subject: "Login issue".to_string(),
            description: "Cannot login to dashboard".to_string(),
            category: TicketCategory::Technical,
            priority: TicketPriority::High,
            tags: vec\!["login".to_string()],
        };
        
        let ticket = service.create_ticket(request).unwrap();
        
        assert_eq\!(ticket.status, TicketStatus::New);
        assert\!(ticket.ticket_number.starts_with("TKT-"));
    }
}
