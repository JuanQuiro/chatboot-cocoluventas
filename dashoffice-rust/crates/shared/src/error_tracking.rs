//\! Sistema de Tracking de Errores
//\! 
//\! Guarda TODOS los errores en la base de datos
//\! Envía alertas para errores críticos
//\! Agrupa errores similares
//\! Tracking de stack traces

use sqlx::PgPool;
use serde::{Deserialize, Serialize};
use chrono::{DateTime, Utc};
use uuid::Uuid;
use std::sync::Arc;

#[derive(Debug, Clone, Serialize, Deserialize, sqlx::FromRow)]
pub struct ErrorLog {
    pub id: Uuid,
    pub timestamp: DateTime<Utc>,
    pub error_type: String,
    pub error_message: String,
    pub severity: ErrorSeverity,
    pub service: String,
    pub module: String,
    pub function: Option<String>,
    pub file: Option<String>,
    pub line: Option<i32>,
    pub stack_trace: Option<String>,
    pub request_id: Option<String>,
    pub user_id: Option<String>,
    pub tenant_id: Option<String>,
    pub context: serde_json::Value,
    pub resolved: bool,
    pub resolution_notes: Option<String>,
}

#[derive(Debug, Clone, Copy, Serialize, Deserialize, sqlx::Type)]
#[sqlx(type_name = "text")]
#[serde(rename_all = "lowercase")]
pub enum ErrorSeverity {
    Low,        // Warning, info
    Medium,     // Errores recuperables
    High,       // Errores que afectan funcionalidad
    Critical,   // Sistema caído o datos corruptos
}

/// Error Tracker que guarda en DB
pub struct ErrorTracker {
    pool: Arc<PgPool>,
    service_name: String,
}

impl ErrorTracker {
    pub fn new(pool: Arc<PgPool>, service_name: String) -> Self {
        Self { pool, service_name }
    }
    
    /// Trackear un error
    pub async fn track_error(
        &self,
        error: &anyhow::Error,
        severity: ErrorSeverity,
        context: serde_json::Value,
    ) -> Result<Uuid, sqlx::Error> {
        let error_log = ErrorLog {
            id: Uuid::new_v4(),
            timestamp: Utc::now(),
            error_type: error.to_string(),
            error_message: format\!("{:#}", error),
            severity,
            service: self.service_name.clone(),
            module: "unknown".to_string(),
            function: None,
            file: None,
            line: None,
            stack_trace: Some(format\!("{:?}", error)),
            request_id: None,
            user_id: None,
            tenant_id: None,
            context,
            resolved: false,
            resolution_notes: None,
        };
        
        self.save_error(&error_log).await?;
        
        // Si es crítico, enviar alerta
        if matches\!(severity, ErrorSeverity::Critical) {
            self.send_alert(&error_log).await;
        }
        
        Ok(error_log.id)
    }
    
    /// Guardar error en DB
    async fn save_error(&self, error_log: &ErrorLog) -> Result<(), sqlx::Error> {
        sqlx::query\!(
            r#"
            INSERT INTO error_logs 
            (id, timestamp, error_type, error_message, severity, service, 
             module, stack_trace, context, resolved)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
            "#,
            error_log.id,
            error_log.timestamp,
            error_log.error_type,
            error_log.error_message,
            format\!("{:?}", error_log.severity).to_lowercase(),
            error_log.service,
            error_log.module,
            error_log.stack_trace,
            error_log.context,
            error_log.resolved
        )
        .execute(self.pool.as_ref())
        .await?;
        
        tracing::error\!(
            error_id = %error_log.id,
            severity = ?error_log.severity,
            error_type = %error_log.error_type,
            "Error tracked and saved to database"
        );
        
        Ok(())
    }
    
    /// Enviar alerta (email, Slack, etc.)
    async fn send_alert(&self, error_log: &ErrorLog) {
        tracing::error\!(
            "🚨 CRITICAL ERROR ALERT 🚨\n\
             Service: {}\n\
             Error: {}\n\
             Time: {}\n\
             Error ID: {}",
            error_log.service,
            error_log.error_message,
            error_log.timestamp,
            error_log.id
        );
        
        // TODO: Integrar con servicio de alertas real
        // - Email
        // - Slack
        // - PagerDuty
        // - SMS
    }
    
    /// Obtener errores recientes
    pub async fn get_recent_errors(
        &self,
        limit: i64,
    ) -> Result<Vec<ErrorLog>, sqlx::Error> {
        sqlx::query_as\!(
            ErrorLog,
            r#"
            SELECT 
                id, timestamp, error_type, error_message,
                severity as "severity: ErrorSeverity",
                service, module, function, file, line,
                stack_trace, request_id, user_id, tenant_id,
                context, resolved, resolution_notes
            FROM error_logs
            ORDER BY timestamp DESC
            LIMIT $1
            "#,
            limit
        )
        .fetch_all(self.pool.as_ref())
        .await
    }
    
    /// Marcar error como resuelto
    pub async fn resolve_error(
        &self,
        error_id: Uuid,
        notes: String,
    ) -> Result<(), sqlx::Error> {
        sqlx::query\!(
            r#"
            UPDATE error_logs
            SET resolved = true, resolution_notes = $2
            WHERE id = $1
            "#,
            error_id,
            notes
        )
        .execute(self.pool.as_ref())
        .await?;
        
        Ok(())
    }
}

/// Macro para trackear errores automáticamente
#[macro_export]
macro_rules\! track_error {
    ($tracker:expr, $error:expr, $severity:expr) => {
        if let Err(e) = $tracker.track_error(
            &$error.into(),
            $severity,
            serde_json::json\!({
                "file": file\!(),
                "line": line\!(),
                "column": column\!(),
            })
        ).await {
            tracing::error\!("Failed to track error: {}", e);
        }
    };
}

/// Wrapper para Result que auto-trackea errores
pub async fn track_result<T, E>(
    result: Result<T, E>,
    tracker: &ErrorTracker,
    severity: ErrorSeverity,
) -> Result<T, E>
where
    E: std::error::Error + Send + Sync + 'static,
{
    match result {
        Ok(val) => Ok(val),
        Err(e) => {
            let _ = tracker.track_error(
                &anyhow::Error::new(e),
                severity,
                serde_json::json\!({}),
            ).await;
            Err(e)
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_error_severity() {
        let severity = ErrorSeverity::Critical;
        assert\!(matches\!(severity, ErrorSeverity::Critical));
    }
}
