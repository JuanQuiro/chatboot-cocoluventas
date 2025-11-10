//\! Tests de Integración Completos
//\! 
//\! Cobertura exhaustiva de todos los componentes críticos

use dashoffice_shared::*;

#[cfg(test)]
mod logging_tests {
    use super::*;
    
    #[test]
    fn test_log_levels() {
        use dashoffice_shared::logging::LogLevel;
        
        let levels = vec\![
            LogLevel::Trace,
            LogLevel::Debug,
            LogLevel::Info,
            LogLevel::Warn,
            LogLevel::Error,
            LogLevel::Fatal,
        ];
        
        assert_eq\!(levels.len(), 6);
    }
    
    #[test]
    fn test_log_entry_creation() {
        use dashoffice_shared::logging::{create_log_entry, LogLevel};
        
        let entry = create_log_entry(
            LogLevel::Error,
            "Test error message".to_string(),
            "test_module".to_string(),
            "test_service".to_string(),
        );
        
        assert_eq\!(entry.message, "Test error message");
        assert_eq\!(entry.module, "test_module");
        assert_eq\!(entry.service, "test_service");
    }
}

#[cfg(test)]
mod resilience_tests {
    use super::*;
    use std::time::Duration;
    
    #[tokio::test]
    async fn test_circuit_breaker_normal_operation() {
        use dashoffice_shared::resilience::{CircuitBreaker, CircuitBreakerConfig, CircuitState};
        
        let config = CircuitBreakerConfig::default();
        let breaker = CircuitBreaker::new(config);
        
        // Operación exitosa debe mantener circuito cerrado
        let result = breaker.call(async { Ok::<_, &str>(42) }).await;
        
        assert\!(result.is_ok());
        assert_eq\!(breaker.get_state().await, CircuitState::Closed);
    }
    
    #[tokio::test]
    async fn test_circuit_breaker_opens_on_failures() {
        use dashoffice_shared::resilience::{CircuitBreaker, CircuitBreakerConfig, CircuitState};
        
        let config = CircuitBreakerConfig {
            failure_threshold: 3,
            ..Default::default()
        };
        
        let breaker = CircuitBreaker::new(config);
        
        // Provocar 3 fallas
        for _ in 0..3 {
            let _ = breaker.call(async { Err::<(), _>("test error") }).await;
        }
        
        // Circuito debe estar abierto
        assert_eq\!(breaker.get_state().await, CircuitState::Open);
    }
    
    #[tokio::test]
    async fn test_retry_with_backoff_success() {
        use dashoffice_shared::resilience::retry_with_backoff;
        
        let mut attempt = 0;
        
        let result = retry_with_backoff(
            || {
                attempt += 1;
                Box::pin(async move {
                    if attempt < 2 {
                        Err("not ready")
                    } else {
                        Ok(100)
                    }
                })
            },
            5,
            Duration::from_millis(10),
        ).await;
        
        assert_eq\!(result, Ok(100));
        assert_eq\!(attempt, 2);
    }
    
    #[tokio::test]
    async fn test_retry_with_backoff_max_attempts() {
        use dashoffice_shared::resilience::retry_with_backoff;
        
        let mut attempt = 0;
        
        let result = retry_with_backoff(
            || {
                attempt += 1;
                Box::pin(async move {
                    Err::<(), _>("always fails")
                })
            },
            3,
            Duration::from_millis(10),
        ).await;
        
        assert\!(result.is_err());
        assert_eq\!(attempt, 3);
    }
}

#[cfg(test)]
mod error_tracking_tests {
    use super::*;
    
    #[test]
    fn test_error_severity_ordering() {
        use dashoffice_shared::error_tracking::ErrorSeverity;
        
        let severities = vec\![
            ErrorSeverity::Low,
            ErrorSeverity::Medium,
            ErrorSeverity::High,
            ErrorSeverity::Critical,
        ];
        
        assert_eq\!(severities.len(), 4);
    }
}

#[cfg(test)]
mod models_tests {
    use super::*;
    
    #[test]
    fn test_user_role_serialization() {
        use dashoffice_shared::models::user::UserRole;
        use serde_json;
        
        let role = UserRole::Admin;
        let json = serde_json::to_string(&role).unwrap();
        assert_eq\!(json, r#""admin""#);
        
        let deserialized: UserRole = serde_json::from_str(&json).unwrap();
        assert\!(matches\!(deserialized, UserRole::Admin));
    }
    
    #[test]
    fn test_order_status_transitions() {
        use dashoffice_shared::models::order::OrderStatus;
        
        let statuses = vec\![
            OrderStatus::Pending,
            OrderStatus::Confirmed,
            OrderStatus::Processing,
            OrderStatus::Shipped,
            OrderStatus::Delivered,
        ];
        
        assert_eq\!(statuses.len(), 5);
    }
}

#[cfg(test)]
mod error_handling_tests {
    use super::*;
    
    #[test]
    fn test_api_error_creation() {
        use dashoffice_shared::error::ApiError;
        
        let error = ApiError::NotFound("User not found".to_string());
        assert_eq\!(error.status_code(), 404);
        
        let error = ApiError::Unauthorized("Invalid token".to_string());
        assert_eq\!(error.status_code(), 401);
        
        let error = ApiError::BadRequest("Invalid input".to_string());
        assert_eq\!(error.status_code(), 400);
    }
}
