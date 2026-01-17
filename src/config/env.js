/**
 * Environment Configuration with Validation
 */

import { cleanEnv, str, port, bool, num } from 'envalid';
import dotenv from 'dotenv';

// Load .env file
dotenv.config();

export const config = cleanEnv(process.env, {
    // Node environment
    NODE_ENV: str({
        choices: ['development', 'production', 'test'],
        default: 'development'
    }),

    // Server configuration
    PORT: port({ default: 3008 }),
    API_PORT: port({ default: 3008 }),

    // Database
    DB_PATH: str({ default: './data/cocolu.db' }),

    // Bot configuration
    BOT_NAME: str({ default: 'Bot Principal Cocolu' }),
    BOT_ADAPTER: str({
        choices: ['meta', 'baileys', 'venom', 'wppconnect', 'twilio'],
        default: 'baileys'
    }),
    TENANT_ID: str({ default: 'cocolu' }),

    // Meta/WhatsApp Business API
    META_PHONE_ID: str({ default: '' }),
    META_TOKEN: str({ default: '' }),
    META_VERIFY_TOKEN: str({ default: 'cocolu_webhook_verify_2025_secure_token_meta' }),
    META_BUSINESS_ACCOUNT_ID: str({ default: '' }),

    // Twilio
    TWILIO_ACCOUNT_SID: str({ default: '' }),
    TWILIO_AUTH_TOKEN: str({ default: '' }),
    TWILIO_PHONE_NUMBER: str({ default: '' }),

    // Pairing code
    USE_PAIRING_CODE: bool({ default: false }),
    PHONE_NUMBER: str({ default: '' }),

    // Logging
    LOG_LEVEL: str({
        choices: ['debug', 'info', 'warn', 'error'],
        default: 'info'
    }),

    // Rate limiting
    RATE_LIMIT_WINDOW_MS: num({ default: 15 * 60 * 1000 }), // 15 minutes
    RATE_LIMIT_MAX_REQUESTS: num({ default: 100 })
});

// Export individual config values for convenience
export const {
    NODE_ENV,
    PORT,
    API_PORT,
    DB_PATH,
    BOT_NAME,
    BOT_ADAPTER,
    TENANT_ID,
    META_PHONE_ID,
    META_TOKEN,
    META_VERIFY_TOKEN,
    USE_PAIRING_CODE,
    PHONE_NUMBER,
    LOG_LEVEL
} = config;

export const isProduction = NODE_ENV === 'production';
export const isDevelopment = NODE_ENV === 'development';
export const isTest = NODE_ENV === 'test';
