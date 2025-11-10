//\! Order Models

use super::*;

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct Order {
    pub id: Id,
    pub order_number: String,
    pub customer_id: Id,
    pub seller_id: Option<Id>,
    pub bot_id: Option<Id>,
    pub status: OrderStatus,
    pub total: f64,
    pub subtotal: f64,
    pub tax: f64,
    pub discount: f64,
    pub shipping_address: Option<String>,
    pub payment_method: Option<String>,
    pub notes: Option<String>,
    pub created_at: Timestamp,
    pub updated_at: Timestamp,
}

#[derive(Debug, Clone, Serialize, Deserialize, sqlx::Type)]
#[sqlx(type_name = "text")]
#[serde(rename_all = "lowercase")]
pub enum OrderStatus {
    Pending,
    Confirmed,
    Processing,
    Shipped,
    Delivered,
    Cancelled,
    Refunded,
}

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct OrderItem {
    pub id: Id,
    pub order_id: Id,
    pub product_id: Id,
    pub quantity: i32,
    pub unit_price: f64,
    pub subtotal: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CreateOrderRequest {
    pub customer_id: Id,
    pub items: Vec<OrderItemRequest>,
    pub shipping_address: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct OrderItemRequest {
    pub product_id: Id,
    pub quantity: i32,
}
