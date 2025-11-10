//\! DashOffice Shared Library
//\! 
//\! Biblioteca compartida con:
//\! - Modelos de datos
//\! - Error handling robusto
//\! - Logging avanzado con persistencia
//\! - Sistema de resiliencia (Circuit Breaker, Retry)
//\! - Error tracking automático
//\! - Config management
//\! - Database helpers

pub mod models;
pub mod error;
pub mod config;
pub mod database;
pub mod utils;
pub mod logging;
pub mod resilience;
pub mod error_tracking;

// Re-exports
pub use models::*;
pub use error::*;
pub use config::*;
pub use logging::*;
pub use resilience::*;
pub use error_tracking::*;

// Prelude para imports convenientes
pub mod prelude {
    pub use crate::models::*;
    pub use crate::error::*;
    pub use crate::logging::*;
    pub use crate::resilience::*;
    pub use crate::error_tracking::*;
}
