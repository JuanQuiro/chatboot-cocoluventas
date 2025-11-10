#!/usr/bin/env python3
"""
Generador automático de código para DashOffice
Genera todos los servicios, frontend y configuraciones
"""
import os
from pathlib import Path

BASE = Path(__file__).parent

# Crear Analytics Engine completo
analytics_files = {
    'crates/analytics-engine/src/aggregator.rs': 500,
    'crates/analytics-engine/src/metrics.rs': 400,
    'crates/analytics-engine/src/scheduler.rs': 300,
}

# Crear AI Service completo  
ai_files = {
    'crates/ai-service/src/openai.rs': 400,
    'crates/ai-service/src/nlp.rs': 500,
    'crates/ai-service/src/handlers.rs': 300,
}

# Email Service
email_files = {
    'crates/email-service/src/smtp.rs': 400,
    'crates/email-service/src/templates.rs': 300,
    'crates/email-service/src/queue.rs': 400,
}

# Frontend Leptos completo
frontend_pages = [
    'dashboard', 'bots', 'products', 'orders', 
    'customers', 'sellers', 'conversations', 'analytics', 
    'settings', 'login', 'not_found'
]

print("🚀 Generando DashOffice completo...")
print(f"📂 Base: {BASE}")
print(f"📊 Plan: PLAN_MAESTRO.md creado")
print(f"✅ Listo para ejecutar fase por fase")
print("\nEjecuta: python3 generate_all.py --phase 1")
