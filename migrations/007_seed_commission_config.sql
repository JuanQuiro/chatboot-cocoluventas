-- MIGRATION: 007_seed_commission_config.sql
-- DATE: 2026-01-12
-- PURPOSE: Seed configuration for Smart Commission Logic to make it user-adjustable

-- 1. Max Profit Share Cap (Percentage)
-- Defines the maximum % of gross profit that can be paid as commission.
-- Default: 50% (If profit is $10, max commission is $5)
INSERT OR IGNORE INTO meta_config (key, value) VALUES ('COMMISSION_MAX_PROFIT_SHARE', '50');

-- 2. Commission Logic Mode
-- 'smart' = Enforce Profit Cap
-- 'standard' = Ignore Profit Cap (Classic revenue-based)
INSERT OR IGNORE INTO meta_config (key, value) VALUES ('COMMISSION_MODE', 'smart');

-- 3. Default Seller Rate (Global Fallback)
INSERT OR IGNORE INTO meta_config (key, value) VALUES ('DEFAULT_SELLER_RATE', '10');
