//\! Product Models

use super::*;

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct Product {
    pub id: Id,
    pub sku: String,
    pub name: String,
    pub description: Option<String>,
    pub category: String,
    pub price: f64,
    pub cost: Option<f64>,
    pub stock: i32,
    pub min_stock: i32,
    pub max_stock: Option<i32>,
    pub unit: String,
    pub image_url: Option<String>,
    pub is_active: bool,
    pub metadata: Option<Metadata>,
    pub created_at: Timestamp,
    pub updated_at: Timestamp,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CreateProductRequest {
    pub sku: String,
    pub name: String,
    pub description: Option<String>,
    pub category: String,
    pub price: f64,
    pub stock: i32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UpdateProductRequest {
    pub name: Option<String>,
    pub description: Option<String>,
    pub price: Option<f64>,
    pub stock: Option<i32>,
    pub is_active: Option<bool>,
}
