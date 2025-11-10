use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct Invoice {
    pub id: String,
    pub total: f64,
}

pub struct InvoiceGenerator;

impl InvoiceGenerator {
    pub fn new() -> Self {
        Self
    }
    
    pub async fn generate(&self) -> anyhow::Result<Invoice> {
        Ok(Invoice {
            id: "INV-001".to_string(),
            total: 1000.0,
        })
    }
}