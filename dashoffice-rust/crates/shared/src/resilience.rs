//\! Sistema de Resiliencia
//\! 
//\! Características:
//\! - Circuit Breaker pattern
//\! - Retry logic con backoff exponencial
//\! - Timeout handling
//\! - Fallback strategies
//\! - Health checks

use std::sync::Arc;
use std::time::Duration;
use tokio::sync::RwLock;
use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};

/// Estados del Circuit Breaker
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum CircuitState {
    Closed,      // Todo funciona normal
    Open,        // Demasiados errores, rechazar requests
    HalfOpen,    // Probando si ya se recuperó
}

/// Configuración del Circuit Breaker
#[derive(Debug, Clone)]
pub struct CircuitBreakerConfig {
    pub failure_threshold: u32,      // Cuántos errores antes de abrir
    pub success_threshold: u32,      // Cuántos éxitos para cerrar
    pub timeout_duration: Duration,  // Cuánto tiempo abierto
    pub half_open_max_calls: u32,   // Máx calls en half-open
}

impl Default for CircuitBreakerConfig {
    fn default() -> Self {
        Self {
            failure_threshold: 5,
            success_threshold: 2,
            timeout_duration: Duration::from_secs(60),
            half_open_max_calls: 3,
        }
    }
}

/// Circuit Breaker
pub struct CircuitBreaker {
    state: Arc<RwLock<CircuitState>>,
    config: CircuitBreakerConfig,
    failure_count: Arc<RwLock<u32>>,
    success_count: Arc<RwLock<u32>>,
    last_failure_time: Arc<RwLock<Option<DateTime<Utc>>>>,
    half_open_calls: Arc<RwLock<u32>>,
}

impl CircuitBreaker {
    pub fn new(config: CircuitBreakerConfig) -> Self {
        Self {
            state: Arc::new(RwLock::new(CircuitState::Closed)),
            config,
            failure_count: Arc::new(RwLock::new(0)),
            success_count: Arc::new(RwLock::new(0)),
            last_failure_time: Arc::new(RwLock::new(None)),
            half_open_calls: Arc::new(RwLock::new(0)),
        }
    }
    
    /// Ejecutar operación con circuit breaker
    pub async fn call<F, T, E>(&self, operation: F) -> Result<T, CircuitBreakerError<E>>
    where
        F: std::future::Future<Output = Result<T, E>>,
    {
        // Verificar estado
        let state = *self.state.read().await;
        
        match state {
            CircuitState::Open => {
                // Verificar si debemos intentar half-open
                if self.should_attempt_reset().await {
                    self.transition_to_half_open().await;
                } else {
                    return Err(CircuitBreakerError::CircuitOpen);
                }
            }
            CircuitState::HalfOpen => {
                let calls = *self.half_open_calls.read().await;
                if calls >= self.config.half_open_max_calls {
                    return Err(CircuitBreakerError::CircuitOpen);
                }
            }
            CircuitState::Closed => {}
        }
        
        // Incrementar contador en half-open
        if state == CircuitState::HalfOpen {
            let mut calls = self.half_open_calls.write().await;
            *calls += 1;
        }
        
        // Ejecutar operación
        match operation.await {
            Ok(result) => {
                self.on_success().await;
                Ok(result)
            }
            Err(e) => {
                self.on_failure().await;
                Err(CircuitBreakerError::OperationFailed(e))
            }
        }
    }
    
    async fn on_success(&self) {
        let state = *self.state.read().await;
        
        if state == CircuitState::HalfOpen {
            let mut success_count = self.success_count.write().await;
            *success_count += 1;
            
            if *success_count >= self.config.success_threshold {
                self.transition_to_closed().await;
            }
        }
        
        // Reset failure count en estado closed
        if state == CircuitState::Closed {
            let mut failure_count = self.failure_count.write().await;
            *failure_count = 0;
        }
    }
    
    async fn on_failure(&self) {
        let mut failure_count = self.failure_count.write().await;
        *failure_count += 1;
        
        let mut last_failure = self.last_failure_time.write().await;
        *last_failure = Some(Utc::now());
        
        if *failure_count >= self.config.failure_threshold {
            self.transition_to_open().await;
        }
    }
    
    async fn should_attempt_reset(&self) -> bool {
        let last_failure = self.last_failure_time.read().await;
        
        if let Some(time) = *last_failure {
            let elapsed = Utc::now() - time;
            elapsed.num_seconds() >= self.config.timeout_duration.as_secs() as i64
        } else {
            false
        }
    }
    
    async fn transition_to_closed(&self) {
        tracing::info\!("Circuit breaker transitioning to CLOSED");
        let mut state = self.state.write().await;
        *state = CircuitState::Closed;
        
        let mut failure_count = self.failure_count.write().await;
        *failure_count = 0;
        
        let mut success_count = self.success_count.write().await;
        *success_count = 0;
        
        let mut half_open_calls = self.half_open_calls.write().await;
        *half_open_calls = 0;
    }
    
    async fn transition_to_open(&self) {
        tracing::warn\!("Circuit breaker transitioning to OPEN");
        let mut state = self.state.write().await;
        *state = CircuitState::Open;
    }
    
    async fn transition_to_half_open(&self) {
        tracing::info\!("Circuit breaker transitioning to HALF_OPEN");
        let mut state = self.state.write().await;
        *state = CircuitState::HalfOpen;
        
        let mut success_count = self.success_count.write().await;
        *success_count = 0;
        
        let mut half_open_calls = self.half_open_calls.write().await;
        *half_open_calls = 0;
    }
    
    pub async fn get_state(&self) -> CircuitState {
        *self.state.read().await
    }
}

#[derive(Debug, thiserror::Error)]
pub enum CircuitBreakerError<E> {
    #[error("Circuit breaker is open")]
    CircuitOpen,
    
    #[error("Operation failed: {0}")]
    OperationFailed(E),
}

/// Retry con backoff exponencial
pub async fn retry_with_backoff<F, T, E>(
    mut operation: F,
    max_attempts: u32,
    initial_delay: Duration,
) -> Result<T, E>
where
    F: FnMut() -> std::pin::Pin<Box<dyn std::future::Future<Output = Result<T, E>> + Send>>,
{
    let mut attempt = 0;
    let mut delay = initial_delay;
    
    loop {
        attempt += 1;
        
        match operation().await {
            Ok(result) => return Ok(result),
            Err(e) if attempt >= max_attempts => return Err(e),
            Err(_) => {
                tracing::warn\!(
                    attempt = attempt,
                    max_attempts = max_attempts,
                    delay_ms = delay.as_millis(),
                    "Operation failed, retrying..."
                );
                
                tokio::time::sleep(delay).await;
                delay = delay * 2; // Backoff exponencial
            }
        }
    }
}

/// Health check result
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HealthCheckResult {
    pub healthy: bool,
    pub checks: Vec<ComponentHealth>,
    pub timestamp: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ComponentHealth {
    pub name: String,
    pub healthy: bool,
    pub message: Option<String>,
    pub latency_ms: Option<u64>,
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_circuit_breaker_opens_after_failures() {
        let config = CircuitBreakerConfig {
            failure_threshold: 3,
            ..Default::default()
        };
        
        let breaker = CircuitBreaker::new(config);
        
        // Simular 3 errores
        for _ in 0..3 {
            let result = breaker.call(async { Err::<(), &str>("error") }).await;
            assert\!(result.is_err());
        }
        
        // El circuito debe estar abierto
        assert_eq\!(breaker.get_state().await, CircuitState::Open);
        
        // La siguiente llamada debe fallar inmediatamente
        let result = breaker.call(async { Ok::<(), &str>(()) }).await;
        assert\!(matches\!(result, Err(CircuitBreakerError::CircuitOpen)));
    }
    
    #[tokio::test]
    async fn test_retry_with_backoff() {
        let mut attempts = 0;
        
        let result = retry_with_backoff(
            || {
                attempts += 1;
                Box::pin(async move {
                    if attempts < 3 {
                        Err("not yet")
                    } else {
                        Ok(42)
                    }
                })
            },
            5,
            Duration::from_millis(10),
        ).await;
        
        assert_eq\!(result, Ok(42));
        assert_eq\!(attempts, 3);
    }
}
