//\! Seller Models

use super::*;

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct Seller {
    pub id: Id,
    pub user_id: Id,
    pub phone_number: String,
    pub commission_rate: f64,
    pub total_sales: f64,
    pub total_commission: f64,
    pub active_clients: i32,
    pub is_active: bool,
    pub metadata: Option<Metadata>,
    pub created_at: Timestamp,
    pub updated_at: Timestamp,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SellerStats {
    pub total_sales: f64,
    pub total_commission: f64,
    pub active_clients: i32,
    pub sales_this_month: f64,
    pub commission_this_month: f64,
}
