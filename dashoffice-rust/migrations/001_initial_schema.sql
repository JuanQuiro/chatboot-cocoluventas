-- Initial Database Schema for DashOffice
-- PostgreSQL

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL,
    tenant_id VARCHAR(255) NOT NULL,
    avatar_url TEXT,
    is_active BOOLEAN DEFAULT true,
    last_login_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_tenant ON users(tenant_id);
CREATE INDEX idx_users_role ON users(role);

-- Bots table
CREATE TABLE bots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    phone_number VARCHAR(50),
    provider VARCHAR(50) NOT NULL,
    status VARCHAR(50) DEFAULT 'initializing',
    config JSONB NOT NULL DEFAULT '{}',
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_bots_tenant ON bots(tenant_id);
CREATE INDEX idx_bots_provider ON bots(provider);
CREATE INDEX idx_bots_status ON bots(status);
CREATE INDEX idx_bots_phone ON bots(phone_number);

-- Products table
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sku VARCHAR(100) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    cost DECIMAL(10, 2),
    stock INTEGER DEFAULT 0,
    min_stock INTEGER DEFAULT 0,
    max_stock INTEGER,
    unit VARCHAR(50) DEFAULT 'unit',
    image_url TEXT,
    is_active BOOLEAN DEFAULT true,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_products_sku ON products(sku);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_active ON products(is_active);

-- Customers table
CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    phone_number VARCHAR(50) NOT NULL,
    name VARCHAR(255),
    email VARCHAR(255),
    address TEXT,
    city VARCHAR(100),
    country VARCHAR(100),
    notes TEXT,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_customers_phone ON customers(phone_number);
CREATE INDEX idx_customers_email ON customers(email);

-- Orders table
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number VARCHAR(50) NOT NULL UNIQUE,
    customer_id UUID REFERENCES customers(id),
    seller_id UUID REFERENCES users(id),
    bot_id UUID REFERENCES bots(id),
    status VARCHAR(50) DEFAULT 'pending',
    total DECIMAL(10, 2) NOT NULL,
    subtotal DECIMAL(10, 2) NOT NULL,
    tax DECIMAL(10, 2) DEFAULT 0,
    discount DECIMAL(10, 2) DEFAULT 0,
    shipping_address TEXT,
    payment_method VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_orders_number ON orders(order_number);
CREATE INDEX idx_orders_customer ON orders(customer_id);
CREATE INDEX idx_orders_seller ON orders(seller_id);
CREATE INDEX idx_orders_bot ON orders(bot_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created ON orders(created_at DESC);

-- Order items table
CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id),
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(10, 2) NOT NULL,
    subtotal DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_order_items_product ON order_items(product_id);

-- Sellers table
CREATE TABLE sellers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    phone_number VARCHAR(50) NOT NULL UNIQUE,
    commission_rate DECIMAL(5, 2) DEFAULT 0,
    total_sales DECIMAL(12, 2) DEFAULT 0,
    total_commission DECIMAL(12, 2) DEFAULT 0,
    active_clients INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_sellers_user ON sellers(user_id);
CREATE INDEX idx_sellers_phone ON sellers(phone_number);
CREATE INDEX idx_sellers_active ON sellers(is_active);

-- Conversations table (MongoDB alternative in PostgreSQL)
CREATE TABLE conversations (
    id VARCHAR(255) PRIMARY KEY,
    bot_id UUID REFERENCES bots(id),
    user_phone VARCHAR(50) NOT NULL,
    status VARCHAR(50) DEFAULT 'active',
    message_count INTEGER DEFAULT 0,
    context JSONB DEFAULT '{}',
    metadata JSONB,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ended_at TIMESTAMP WITH TIME ZONE,
    last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_conversations_bot ON conversations(bot_id);
CREATE INDEX idx_conversations_user ON conversations(user_phone);
CREATE INDEX idx_conversations_status ON conversations(status);
CREATE INDEX idx_conversations_activity ON conversations(last_activity DESC);

-- Messages table
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id VARCHAR(255) REFERENCES conversations(id),
    bot_id UUID REFERENCES bots(id),
    direction VARCHAR(20) NOT NULL, -- 'inbound' or 'outbound'
    from_number VARCHAR(50),
    to_number VARCHAR(50),
    content TEXT NOT NULL,
    message_type VARCHAR(50) DEFAULT 'text',
    status VARCHAR(50) DEFAULT 'sent',
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_messages_conversation ON messages(conversation_id);
CREATE INDEX idx_messages_bot ON messages(bot_id);
CREATE INDEX idx_messages_created ON messages(created_at DESC);

-- Analytics events table
CREATE TABLE analytics_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_type VARCHAR(100) NOT NULL,
    bot_id UUID REFERENCES bots(id),
    user_id UUID REFERENCES users(id),
    data JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_analytics_type ON analytics_events(event_type);
CREATE INDEX idx_analytics_bot ON analytics_events(bot_id);
CREATE INDEX idx_analytics_created ON analytics_events(created_at DESC);

-- System logs table
CREATE TABLE system_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    log_type VARCHAR(50) NOT NULL,
    severity VARCHAR(20) NOT NULL,
    message TEXT NOT NULL,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_logs_type ON system_logs(log_type);
CREATE INDEX idx_logs_severity ON system_logs(severity);
CREATE INDEX idx_logs_created ON system_logs(created_at DESC);

-- TTL cleanup: Delete old logs after 30 days
-- This would be handled by a cron job or background worker

-- Triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bots_updated_at BEFORE UPDATE ON bots
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sellers_updated_at BEFORE UPDATE ON sellers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
