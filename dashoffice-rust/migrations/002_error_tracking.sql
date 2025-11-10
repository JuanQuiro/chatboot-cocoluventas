-- Migration para Error Tracking y Logs Avanzados

-- Tabla de error logs
CREATE TABLE IF NOT EXISTS error_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    error_type VARCHAR(255) NOT NULL,
    error_message TEXT NOT NULL,
    severity VARCHAR(50) NOT NULL,
    service VARCHAR(100) NOT NULL,
    module VARCHAR(255) NOT NULL,
    function VARCHAR(255),
    file VARCHAR(500),
    line INTEGER,
    stack_trace TEXT,
    request_id VARCHAR(100),
    user_id UUID REFERENCES users(id),
    tenant_id VARCHAR(255),
    context JSONB DEFAULT '{}',
    resolved BOOLEAN DEFAULT false,
    resolution_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_error_logs_timestamp ON error_logs(timestamp DESC);
CREATE INDEX idx_error_logs_severity ON error_logs(severity);
CREATE INDEX idx_error_logs_service ON error_logs(service);
CREATE INDEX idx_error_logs_resolved ON error_logs(resolved);
CREATE INDEX idx_error_logs_tenant ON error_logs(tenant_id);
CREATE INDEX idx_error_logs_user ON error_logs(user_id);

-- Tabla de métricas de performance
CREATE TABLE IF NOT EXISTS performance_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    service VARCHAR(100) NOT NULL,
    endpoint VARCHAR(500),
    method VARCHAR(10),
    status_code INTEGER,
    latency_ms INTEGER NOT NULL,
    request_size_bytes INTEGER,
    response_size_bytes INTEGER,
    user_id UUID REFERENCES users(id),
    tenant_id VARCHAR(255),
    metadata JSONB DEFAULT '{}'
);

CREATE INDEX idx_perf_metrics_timestamp ON performance_metrics(timestamp DESC);
CREATE INDEX idx_perf_metrics_service ON performance_metrics(service);
CREATE INDEX idx_perf_metrics_endpoint ON performance_metrics(endpoint);
CREATE INDEX idx_perf_metrics_latency ON performance_metrics(latency_ms);

-- Tabla de health checks
CREATE TABLE IF NOT EXISTS health_checks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    service VARCHAR(100) NOT NULL,
    component VARCHAR(100) NOT NULL,
    healthy BOOLEAN NOT NULL,
    message TEXT,
    latency_ms INTEGER,
    metadata JSONB DEFAULT '{}'
);

CREATE INDEX idx_health_checks_timestamp ON health_checks(timestamp DESC);
CREATE INDEX idx_health_checks_service ON health_checks(service);
CREATE INDEX idx_health_checks_healthy ON health_checks(healthy);

-- Vista para errores críticos recientes
CREATE OR REPLACE VIEW critical_errors_last_24h AS
SELECT 
    id,
    timestamp,
    error_type,
    error_message,
    service,
    module,
    resolved
FROM error_logs
WHERE 
    severity = 'critical'
    AND timestamp > NOW() - INTERVAL '24 hours'
    AND resolved = false
ORDER BY timestamp DESC;

-- Vista para estadísticas de errores por servicio
CREATE OR REPLACE VIEW error_stats_by_service AS
SELECT 
    service,
    severity,
    COUNT(*) as error_count,
    COUNT(CASE WHEN resolved THEN 1 END) as resolved_count,
    MAX(timestamp) as last_error
FROM error_logs
WHERE timestamp > NOW() - INTERVAL '7 days'
GROUP BY service, severity
ORDER BY error_count DESC;

-- Vista para performance promedio por endpoint
CREATE OR REPLACE VIEW avg_performance_by_endpoint AS
SELECT 
    service,
    endpoint,
    COUNT(*) as request_count,
    AVG(latency_ms) as avg_latency_ms,
    PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY latency_ms) as p95_latency_ms,
    PERCENTILE_CONT(0.99) WITHIN GROUP (ORDER BY latency_ms) as p99_latency_ms,
    MAX(latency_ms) as max_latency_ms
FROM performance_metrics
WHERE timestamp > NOW() - INTERVAL '1 hour'
GROUP BY service, endpoint
ORDER BY avg_latency_ms DESC;

-- Función para limpiar logs antiguos
CREATE OR REPLACE FUNCTION cleanup_old_logs()
RETURNS void AS $$
BEGIN
    -- Eliminar error logs resueltos mayores a 90 días
    DELETE FROM error_logs
    WHERE resolved = true
    AND timestamp < NOW() - INTERVAL '90 days';
    
    -- Eliminar performance metrics mayores a 30 días
    DELETE FROM performance_metrics
    WHERE timestamp < NOW() - INTERVAL '30 days';
    
    -- Eliminar health checks mayores a 7 días
    DELETE FROM health_checks
    WHERE timestamp < NOW() - INTERVAL '7 days';
    
    RAISE NOTICE 'Old logs cleaned up successfully';
END;
$$ LANGUAGE plpgsql;

-- Trigger para auto-alertas en errores críticos
CREATE OR REPLACE FUNCTION notify_critical_error()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.severity = 'critical' THEN
        -- Aquí podrías enviar notificación
        RAISE WARNING 'CRITICAL ERROR: % in service %', NEW.error_message, NEW.service;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_critical_error_alert
AFTER INSERT ON error_logs
FOR EACH ROW
WHEN (NEW.severity = 'critical')
EXECUTE FUNCTION notify_critical_error();

-- Comentarios
COMMENT ON TABLE error_logs IS 'Registro completo de todos los errores del sistema';
COMMENT ON TABLE performance_metrics IS 'Métricas de performance de cada request';
COMMENT ON TABLE health_checks IS 'Resultados de health checks periódicos';
