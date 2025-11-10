//\! Sistema de Logging Avanzado
//\! 
//\! Características:
//\! - Structured logging (JSON)
//\! - Multiple outputs (console, file, database)
//\! - Log levels (trace, debug, info, warn, error)
//\! - Context propagation
//\! - Performance metrics
//\! - Error tracking

use serde::{Deserialize, Serialize};
use tracing::{error, warn, info, debug, trace};
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};
use std::sync::Arc;
use sqlx::PgPool;
use chrono::{DateTime, Utc};
use uuid::Uuid;

/// Niveles de log
#[derive(Debug, Clone, Copy, Serialize, Deserialize, sqlx::Type)]
#[sqlx(type_name = "text")]
#[serde(rename_all = "lowercase")]
pub enum LogLevel {
    Trace,
    Debug,
    Info,
    Warn,
    Error,
    Fatal,
}

/// Entrada de log estructurada
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LogEntry {
    pub id: Uuid,
    pub timestamp: DateTime<Utc>,
    pub level: LogLevel,
    pub message: String,
    pub module: String,
    pub file: Option<String>,
    pub line: Option<u32>,
    pub service: String,
    pub request_id: Option<String>,
    pub user_id: Option<String>,
    pub tenant_id: Option<String>,
    pub metadata: serde_json::Value,
    pub error_details: Option<ErrorDetails>,
}

/// Detalles de error
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ErrorDetails {
    pub error_type: String,
    pub error_message: String,
    pub stack_trace: Option<String>,
    pub context: serde_json::Value,
}

/// Logger que persiste en base de datos
pub struct DatabaseLogger {
    pool: Arc<PgPool>,
    buffer: Arc<tokio::sync::Mutex<Vec<LogEntry>>>,
    batch_size: usize,
}

impl DatabaseLogger {
    pub fn new(pool: Arc<PgPool>, batch_size: usize) -> Self {
        Self {
            pool,
            buffer: Arc::new(tokio::sync::Mutex::new(Vec::new())),
            batch_size,
        }
    }
    
    /// Agregar log al buffer
    pub async fn log(&self, entry: LogEntry) {
        let mut buffer = self.buffer.lock().await;
        buffer.push(entry);
        
        // Si el buffer está lleno, flush
        if buffer.len() >= self.batch_size {
            self.flush_internal(&mut buffer).await;
        }
    }
    
    /// Flush manual del buffer
    pub async fn flush(&self) {
        let mut buffer = self.buffer.lock().await;
        self.flush_internal(&mut buffer).await;
    }
    
    /// Flush interno
    async fn flush_internal(&self, buffer: &mut Vec<LogEntry>) {
        if buffer.is_empty() {
            return;
        }
        
        // Insertar en batch en la base de datos
        for entry in buffer.drain(..) {
            let result = sqlx::query\!(
                r#"
                INSERT INTO system_logs 
                (id, timestamp, log_type, severity, message, metadata)
                VALUES ($1, $2, $3, $4, $5, $6)
                "#,
                entry.id,
                entry.timestamp,
                entry.module,
                format\!("{:?}", entry.level).to_lowercase(),
                entry.message,
                entry.metadata
            )
            .execute(self.pool.as_ref())
            .await;
            
            if let Err(e) = result {
                eprintln\!("Failed to insert log into database: {}", e);
            }
        }
    }
}

/// Inicializar sistema de logging
pub fn init_logging(service_name: &str, db_pool: Option<Arc<PgPool>>) {
    // Console layer con formato bonito
    let console_layer = tracing_subscriber::fmt::layer()
        .with_target(true)
        .with_thread_ids(true)
        .with_thread_names(true)
        .with_file(true)
        .with_line_number(true)
        .with_ansi(true);
    
    // JSON layer para producción
    let json_layer = tracing_subscriber::fmt::layer()
        .json()
        .with_current_span(true)
        .with_span_list(true);
    
    // File layer
    let file_appender = tracing_appender::rolling::daily("./logs", format\!("{}.log", service_name));
    let (non_blocking, _guard) = tracing_appender::non_blocking(file_appender);
    let file_layer = tracing_subscriber::fmt::layer()
        .with_writer(non_blocking)
        .with_ansi(false)
        .json();
    
    // Registry con todos los layers
    tracing_subscriber::registry()
        .with(
            tracing_subscriber::EnvFilter::try_from_default_env()
                .unwrap_or_else(|_| "info,sqlx=warn,actix_web=info".into())
        )
        .with(console_layer)
        .with(file_layer)
        .init();
    
    info\!(service = service_name, "Logging system initialized");
    
    // Spawn background task para flush periódico si tenemos DB
    if let Some(pool) = db_pool {
        let logger = Arc::new(DatabaseLogger::new(pool, 50));
        
        tokio::spawn(async move {
            let mut interval = tokio::time::interval(tokio::time::Duration::from_secs(30));
            loop {
                interval.tick().await;
                logger.flush().await;
            }
        });
    }
}

/// Macro para logging con contexto
#[macro_export]
macro_rules\! log_with_context {
    ($level:ident, $msg:expr, $($key:ident = $value:expr),*) => {
        tracing::$level\!(
            message = $msg,
            $($key = ?$value,)*
        );
    };
}

/// Trait para objetos que pueden ser loggeados
pub trait Loggable {
    fn to_log_metadata(&self) -> serde_json::Value;
}

/// Helper para crear log entry
pub fn create_log_entry(
    level: LogLevel,
    message: String,
    module: String,
    service: String,
) -> LogEntry {
    LogEntry {
        id: Uuid::new_v4(),
        timestamp: Utc::now(),
        level,
        message,
        module,
        file: None,
        line: None,
        service,
        request_id: None,
        user_id: None,
        tenant_id: None,
        metadata: serde_json::json\!({}),
        error_details: None,
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_log_entry_creation() {
        let entry = create_log_entry(
            LogLevel::Info,
            "Test message".to_string(),
            "test_module".to_string(),
            "test_service".to_string(),
        );
        
        assert_eq\!(entry.message, "Test message");
        assert_eq\!(entry.module, "test_module");
    }
}
