//\! Invoice Service - Sistema de Facturación
//\! 
//\! Funcionalidades:
//\! - Generación de facturas
//\! - PDF generation
//\! - Numeración automática
//\! - Tax calculation
//\! - Payment tracking
//\! - Invoice templates
//\! - Multi-currency support

use actix_web::{web, App, HttpServer, HttpResponse};
use serde::{Deserialize, Serialize};
use chrono::{DateTime, Utc};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Invoice {
    pub id: uuid::Uuid,
    pub invoice_number: String,
    pub tenant_id: String,
    pub customer_id: String,
    pub customer_name: String,
    pub customer_email: String,
    pub customer_address: Option<String>,
    pub issue_date: DateTime<Utc>,
    pub due_date: DateTime<Utc>,
    pub items: Vec<InvoiceItem>,
    pub subtotal: f64,
    pub tax_rate: f64,
    pub tax_amount: f64,
    pub discount: f64,
    pub total: f64,
    pub currency: String,
    pub status: InvoiceStatus,
    pub payment_method: Option<String>,
    pub paid_at: Option<DateTime<Utc>>,
    pub notes: Option<String>,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct InvoiceItem {
    pub id: uuid::Uuid,
    pub description: String,
    pub quantity: f64,
    pub unit_price: f64,
    pub tax_rate: f64,
    pub discount: f64,
    pub total: f64,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "lowercase")]
pub enum InvoiceStatus {
    Draft,
    Sent,
    Paid,
    Overdue,
    Cancelled,
    Refunded,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct CreateInvoiceRequest {
    pub tenant_id: String,
    pub customer_id: String,
    pub customer_name: String,
    pub customer_email: String,
    pub customer_address: Option<String>,
    pub due_days: i64,
    pub items: Vec<InvoiceItemRequest>,
    pub tax_rate: f64,
    pub discount: f64,
    pub currency: String,
    pub notes: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct InvoiceItemRequest {
    pub description: String,
    pub quantity: f64,
    pub unit_price: f64,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct InvoiceResponse {
    pub invoice: Invoice,
    pub pdf_url: Option<String>,
}

/// Servicio de Facturación
pub struct InvoiceService {
    current_invoice_number: std::sync::Arc<std::sync::Mutex<u32>>,
}

impl InvoiceService {
    pub fn new() -> Self {
        Self {
            current_invoice_number: std::sync::Arc::new(std::sync::Mutex::new(1000)),
        }
    }
    
    pub fn generate_invoice_number(&self, tenant_id: &str) -> String {
        let mut number = self.current_invoice_number.lock().unwrap();
        *number += 1;
        
        let year = chrono::Utc::now().format("%Y");
        format\!("INV-{}-{}-{:06}", tenant_id, year, *number)
    }
    
    pub fn create_invoice(
        &self,
        request: CreateInvoiceRequest,
    ) -> Result<Invoice, String> {
        let invoice_number = self.generate_invoice_number(&request.tenant_id);
        let issue_date = Utc::now();
        let due_date = issue_date + chrono::Duration::days(request.due_days);
        
        // Calcular items con impuestos
        let mut items = Vec::new();
        let mut subtotal = 0.0;
        
        for item_req in request.items {
            let item_subtotal = item_req.quantity * item_req.unit_price;
            let tax_amount = item_subtotal * (request.tax_rate / 100.0);
            let item_total = item_subtotal + tax_amount;
            
            items.push(InvoiceItem {
                id: uuid::Uuid::new_v4(),
                description: item_req.description,
                quantity: item_req.quantity,
                unit_price: item_req.unit_price,
                tax_rate: request.tax_rate,
                discount: 0.0,
                total: item_total,
            });
            
            subtotal += item_subtotal;
        }
        
        // Calcular totales
        let tax_amount = subtotal * (request.tax_rate / 100.0);
        let total = subtotal + tax_amount - request.discount;
        
        let invoice = Invoice {
            id: uuid::Uuid::new_v4(),
            invoice_number,
            tenant_id: request.tenant_id,
            customer_id: request.customer_id,
            customer_name: request.customer_name,
            customer_email: request.customer_email,
            customer_address: request.customer_address,
            issue_date,
            due_date,
            items,
            subtotal,
            tax_rate: request.tax_rate,
            tax_amount,
            discount: request.discount,
            total,
            currency: request.currency,
            status: InvoiceStatus::Draft,
            payment_method: None,
            paid_at: None,
            notes: request.notes,
            created_at: Utc::now(),
        };
        
        tracing::info\!(
            "Invoice {} created for customer {} - Total: {:.2} {}",
            invoice.invoice_number,
            invoice.customer_name,
            invoice.total,
            invoice.currency
        );
        
        Ok(invoice)
    }
    
    pub async fn generate_pdf(&self, invoice: &Invoice) -> Result<Vec<u8>, String> {
        // Generar PDF (usando printpdf o similar)
        tracing::info\!("Generating PDF for invoice {}", invoice.invoice_number);
        
        // TODO: Implementar generación real de PDF
        // Por ahora retornar vacío
        Ok(Vec::new())
    }
    
    pub fn mark_as_paid(
        &self,
        invoice: &mut Invoice,
        payment_method: String,
    ) -> Result<(), String> {
        if invoice.status == InvoiceStatus::Paid {
            return Err("Invoice already paid".to_string());
        }
        
        invoice.status = InvoiceStatus::Paid;
        invoice.payment_method = Some(payment_method);
        invoice.paid_at = Some(Utc::now());
        
        tracing::info\!("Invoice {} marked as paid", invoice.invoice_number);
        
        Ok(())
    }
    
    pub fn cancel_invoice(&self, invoice: &mut Invoice) -> Result<(), String> {
        if invoice.status == InvoiceStatus::Paid {
            return Err("Cannot cancel paid invoice".to_string());
        }
        
        invoice.status = InvoiceStatus::Cancelled;
        
        tracing::info\!("Invoice {} cancelled", invoice.invoice_number);
        
        Ok(())
    }
    
    pub fn check_overdue_invoices(&self, invoices: &mut [Invoice]) {
        let now = Utc::now();
        
        for invoice in invoices {
            if invoice.status == InvoiceStatus::Sent && invoice.due_date < now {
                invoice.status = InvoiceStatus::Overdue;
                tracing::warn\!("Invoice {} is overdue", invoice.invoice_number);
            }
        }
    }
}

// HTTP Handlers
async fn create_invoice(
    req: web::Json<CreateInvoiceRequest>,
) -> HttpResponse {
    let service = InvoiceService::new();
    
    match service.create_invoice(req.into_inner()) {
        Ok(invoice) => HttpResponse::Ok().json(InvoiceResponse {
            invoice,
            pdf_url: None,
        }),
        Err(e) => HttpResponse::BadRequest().json(serde_json::json\!({
            "error": e
        }))
    }
}

async fn get_invoice(
    path: web::Path<uuid::Uuid>,
) -> HttpResponse {
    let invoice_id = path.into_inner();
    
    // TODO: Consultar DB
    tracing::info\!("Getting invoice: {}", invoice_id);
    
    HttpResponse::NotFound().json(serde_json::json\!({
        "error": "Invoice not found"
    }))
}

async fn generate_pdf(
    path: web::Path<uuid::Uuid>,
) -> HttpResponse {
    let invoice_id = path.into_inner();
    
    // TODO: Generar PDF real
    tracing::info\!("Generating PDF for invoice: {}", invoice_id);
    
    HttpResponse::Ok()
        .content_type("application/pdf")
        .body(vec\![])
}

async fn mark_as_paid(
    path: web::Path<uuid::Uuid>,
    req: web::Json<serde_json::Value>,
) -> HttpResponse {
    let invoice_id = path.into_inner();
    let payment_method = req
        .get("payment_method")
        .and_then(|v| v.as_str())
        .unwrap_or("unknown")
        .to_string();
    
    // TODO: Actualizar en DB
    tracing::info\!("Marking invoice {} as paid via {}", invoice_id, payment_method);
    
    HttpResponse::Ok().json(serde_json::json\!({
        "invoice_id": invoice_id,
        "status": "paid"
    }))
}

async fn health_check() -> HttpResponse {
    HttpResponse::Ok().json(serde_json::json\!({
        "status": "ok",
        "service": "invoice-service"
    }))
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    tracing_subscriber::fmt::init();
    
    let port = std::env::var("INVOICE_PORT")
        .unwrap_or_else(|_| "3018".to_string())
        .parse::<u16>()
        .expect("Invalid INVOICE_PORT");
    
    tracing::info\!("💰 Starting Invoice Service on port {}", port);
    
    HttpServer::new(|| {
        App::new()
            .route("/health", web::get().to(health_check))
            .route("/create", web::post().to(create_invoice))
            .route("/{invoice_id}", web::get().to(get_invoice))
            .route("/{invoice_id}/pdf", web::get().to(generate_pdf))
            .route("/{invoice_id}/pay", web::post().to(mark_as_paid))
    })
    .bind(("0.0.0.0", port))?
    .run()
    .await
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_create_invoice() {
        let service = InvoiceService::new();
        
        let request = CreateInvoiceRequest {
            tenant_id: "tenant1".to_string(),
            customer_id: "cust123".to_string(),
            customer_name: "John Doe".to_string(),
            customer_email: "john@example.com".to_string(),
            customer_address: None,
            due_days: 30,
            items: vec\![
                InvoiceItemRequest {
                    description: "Product A".to_string(),
                    quantity: 2.0,
                    unit_price: 100.0,
                },
            ],
            tax_rate: 16.0,
            discount: 0.0,
            currency: "USD".to_string(),
            notes: None,
        };
        
        let invoice = service.create_invoice(request).unwrap();
        
        assert_eq\!(invoice.subtotal, 200.0);
        assert_eq\!(invoice.tax_amount, 32.0);
        assert_eq\!(invoice.total, 232.0);
    }
    
    #[test]
    fn test_invoice_number_generation() {
        let service = InvoiceService::new();
        
        let num1 = service.generate_invoice_number("tenant1");
        let num2 = service.generate_invoice_number("tenant1");
        
        assert_ne\!(num1, num2);
        assert\!(num1.starts_with("INV-tenant1-"));
    }
}
