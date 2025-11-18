/**
 * Retry Strategy with Exponential Backoff
 * RESILIENCIA: Reintentar operaciones fallidas inteligentemente
 */

import logger from '../utils/logger.js';

class RetryStrategy {
    constructor(options = {}) {
        this.maxRetries = options.maxRetries || 3;
        this.initialDelay = options.initialDelay || 1000; // 1 second
        this.maxDelay = options.maxDelay || 30000; // 30 seconds
        this.factor = options.factor || 2; // Exponential factor
        this.jitter = options.jitter || true; // Add randomness
        this.retryableErrors = options.retryableErrors || [
            'ECONNREFUSED',
            'ETIMEDOUT',
            'ENOTFOUND',
            'ENETUNREACH',
            'EAI_AGAIN'
        ];
    }

    async execute(fn, context = 'operation') {
        let lastError;
        
        for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
            try {
                const result = await fn();
                
                if (attempt > 0) {
                    logger.info(`${context} succeeded after ${attempt} retries`);
                }
                
                return result;
            } catch (error) {
                lastError = error;
                
                if (!this.shouldRetry(error, attempt)) {
                    logger.error(`${context} failed, not retrying`, {
                        error: error.message,
                        attempt,
                        code: error.code
                    });
                    throw error;
                }

                const delay = this.calculateDelay(attempt);
                
                logger.warn(`${context} failed, retrying in ${delay}ms`, {
                    attempt: attempt + 1,
                    maxRetries: this.maxRetries,
                    error: error.message
                });

                await this.sleep(delay);
            }
        }

        logger.error(`${context} failed after ${this.maxRetries} retries`);
        throw lastError;
    }

    shouldRetry(error, attempt) {
        if (attempt >= this.maxRetries) {
            return false;
        }

        // Check if error code is retryable
        if (error.code && this.retryableErrors.includes(error.code)) {
            return true;
        }

        // Check HTTP status codes
        if (error.response) {
            const status = error.response.status;
            // Retry on 5xx and 429 (rate limit)
            return status >= 500 || status === 429;
        }

        // Retry on timeout
        if (error.message && error.message.includes('timeout')) {
            return true;
        }

        return false;
    }

    calculateDelay(attempt) {
        // Exponential backoff: delay = initialDelay * (factor ^ attempt)
        let delay = this.initialDelay * Math.pow(this.factor, attempt);
        
        // Cap at max delay
        delay = Math.min(delay, this.maxDelay);
        
        // Add jitter to prevent thundering herd
        if (this.jitter) {
            delay = delay * (0.5 + Math.random() * 0.5);
        }
        
        return Math.floor(delay);
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

export default RetryStrategy;
