/**
 * Resilience Module - Sistema Inquebrantable
 * Export all resilience components
 */

export { default as CircuitBreaker } from './CircuitBreaker.js';
export { default as RetryStrategy } from './RetryStrategy.js';
export { default as HealthMonitor } from './HealthMonitor.js';
export { default as FallbackManager } from './FallbackManager.js';
export { default as AdvancedRateLimiter } from './RateLimiter.advanced.js';

// Re-export for convenience
import CircuitBreaker from './CircuitBreaker.js';
import RetryStrategy from './RetryStrategy.js';
import healthMonitor from './HealthMonitor.js';
import fallbackManager from './FallbackManager.js';
import advancedRateLimiter from './RateLimiter.advanced.js';

export const resilience = {
    CircuitBreaker,
    RetryStrategy,
    healthMonitor,
    fallbackManager,
    advancedRateLimiter
};

export default resilience;
