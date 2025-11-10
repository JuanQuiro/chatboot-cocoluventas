//\! Error Handling
//\! 
//\! Sistema centralizado de manejo de errores.

use thiserror::Error;

/// Result type del sistema
pub type Result<T> = std::result::Result<T, Error>;

/// Errores del sistema
#[derive(Debug, Error)]
pub enum Error {
    #[error("Database error: {0}")]
    Database(#[from] sqlx::Error),

    #[error("MongoDB error: {0}")]
    MongoDB(#[from] mongodb::error::Error),

    #[error("Redis error: {0}")]
    Redis(String),

    #[error("Serialization error: {0}")]
    Serialization(#[from] serde_json::Error),

    #[error("Not found: {0}")]
    NotFound(String),

    #[error("Unauthorized: {0}")]
    Unauthorized(String),

    #[error("Forbidden: {0}")]
    Forbidden(String),

    #[error("Validation error: {0}")]
    Validation(String),

    #[error("Configuration error: {0}")]
    Config(String),

    #[error("WhatsApp error: {0}")]
    WhatsApp(String),

    #[error("Internal error: {0}")]
    Internal(String),
}

impl From<redis::RedisError> for Error {
    fn from(err: redis::RedisError) -> Self {
        Error::Redis(err.to_string())
    }
}

// HTTP Status mapping
impl Error {
    pub fn status_code(&self) -> u16 {
        match self {
            Error::NotFound(_) => 404,
            Error::Unauthorized(_) => 401,
            Error::Forbidden(_) => 403,
            Error::Validation(_) => 400,
            _ => 500,
        }
    }
}
