//\! # Modelos de Datos
//\! 
//\! Definiciones de todas las estructuras de datos del sistema.

use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use uuid::Uuid;
use validator::Validate;

pub mod bot;
pub mod user;
pub mod order;
pub mod product;
pub mod seller;
pub mod conversation;
pub mod analytics;

// Re-exports
pub use bot::*;
pub use user::*;
pub use order::*;
pub use product::*;
pub use seller::*;
pub use conversation::*;
pub use analytics::*;

/// ID único universal
pub type Id = Uuid;

/// Timestamp UTC
pub type Timestamp = DateTime<Utc>;

/// Metadata genérica en JSON
pub type Metadata = serde_json::Value;

/// Estado genérico
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "lowercase")]
pub enum Status {
    Active,
    Inactive,
    Pending,
    Suspended,
    Deleted,
}

impl Default for Status {
    fn default() -> Self {
        Self::Active
    }
}

/// Prioridad
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, PartialOrd, Ord)]
#[serde(rename_all = "lowercase")]
pub enum Priority {
    Low,
    Medium,
    High,
    Critical,
}

impl Default for Priority {
    fn default() -> Self {
        Self::Medium
    }
}

/// Timestamps comunes
#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct Timestamps {
    pub created_at: Timestamp,
    pub updated_at: Timestamp,
}

impl Default for Timestamps {
    fn default() -> Self {
        let now = Utc::now();
        Self {
            created_at: now,
            updated_at: now,
        }
    }
}

/// Paginación
#[derive(Debug, Clone, Serialize, Deserialize, Validate)]
pub struct Pagination {
    #[validate(range(min = 1, max = 1000))]
    pub page: i64,
    
    #[validate(range(min = 1, max = 100))]
    pub per_page: i64,
}

impl Default for Pagination {
    fn default() -> Self {
        Self {
            page: 1,
            per_page: 20,
        }
    }
}

impl Pagination {
    pub fn offset(&self) -> i64 {
        (self.page - 1) * self.per_page
    }

    pub fn limit(&self) -> i64 {
        self.per_page
    }
}

/// Respuesta paginada
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PaginatedResponse<T> {
    pub data: Vec<T>,
    pub total: i64,
    pub page: i64,
    pub per_page: i64,
    pub total_pages: i64,
}

impl<T> PaginatedResponse<T> {
    pub fn new(data: Vec<T>, total: i64, pagination: &Pagination) -> Self {
        let total_pages = (total as f64 / pagination.per_page as f64).ceil() as i64;
        
        Self {
            data,
            total,
            page: pagination.page,
            per_page: pagination.per_page,
            total_pages,
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_pagination_offset() {
        let p = Pagination { page: 1, per_page: 20 };
        assert_eq\!(p.offset(), 0);

        let p = Pagination { page: 2, per_page: 20 };
        assert_eq\!(p.offset(), 20);

        let p = Pagination { page: 3, per_page: 10 };
        assert_eq\!(p.offset(), 20);
    }

    #[test]
    fn test_paginated_response() {
        let data = vec\![1, 2, 3];
        let pagination = Pagination { page: 1, per_page: 3 };
        let response = PaginatedResponse::new(data, 10, &pagination);

        assert_eq\!(response.total, 10);
        assert_eq\!(response.total_pages, 4);
    }
}
pub mod user;
pub mod order;
pub mod product;
pub mod seller;
pub mod conversation;
pub mod analytics;
