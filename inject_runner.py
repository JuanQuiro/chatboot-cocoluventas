
import os
import re

index_path = '/var/www/cocolu-chatbot/dashboard/build/index.html'
css_to_inject = """/* ========================================  GLOBAL OVERRIDE CSS - CREAR VENTA  ======================================== */ /* Page Wrapper */ .crear-venta-page {  min-height: 100vh !important;  background: #f9fafb !important; /* var(--bg-page) hardcoded just in case */  padding: 32px 0 !important;  display: block !important; } /* Container */ .crear-venta-container {  max-width: 1200px !important;  margin: 0 auto !important;  padding: 0 24px !important;  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Inter', sans-serif !important; } /* Header */ div.page-header {  text-align: center !important;  margin-bottom: 48px !important;  padding: 32px 24px !important;  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%) !important;  border-radius: 12px !important; /* var(--radius-lg) hardcoded */  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1) !important;  color: white !important;  display: block !important;  width: auto !important; } .page-header h1 {  font-size: 32px !important;  font-weight: 700 !important;  margin: 0 0 12px 0 !important;  display: flex !important;  align-items: center !important;  justify-content: center !important;  gap: 12px !important;  color: white !important; } .page-header p {  font-size: 15px !important;  margin: 0 !important;  opacity: 0.95 !important;  max-width: 600px !important;  margin: 0 auto !important;  color: rgba(255, 255, 255, 0.9) !important; } /* Form Layout */ .venta-form {  display: grid !important;  gap: 24px !important; } /* Form Sections */ .form-section {  background: white !important;  border-radius: 12px !important;  padding: 28px !important;  border: 1px solid #e5e7eb !important;  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05) !important;  transition: all 0.2s !important;  max-width: 100% !important;  margin: 0 auto !important;  display: block !important; } .form-section:hover {  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1) !important;  border-color: #6366f1 !important; } .form-section h2 {  font-size: 20px !important;  font-weight: 600 !important;  color: #111827 !important;  margin: 0 0 24px 0 !important;  display: flex !important;  align-items: center !important;  gap: 10px !important;  padding-bottom: 16px !important;  border-bottom: 2px solid #f3f4f6 !important; } """

with open(index_path, 'r', encoding='utf-8') as f:
    html = f.read()

# Remove any previous injected style block if exists (simple heuristic)
html = re.sub(r'<style id="override-css">.*?</style>', '', html, flags=re.DOTALL)

# Inject new style block before </head>
style_block = f'<style id="override-css">{css_to_inject}</style>'
new_html = html.replace('</head>', style_block + '</head>')

with open(index_path, 'w', encoding='utf-8') as f:
    f.write(new_html)

print("✅ INJECTED INLINE CSS SUCCESSFULLY")
