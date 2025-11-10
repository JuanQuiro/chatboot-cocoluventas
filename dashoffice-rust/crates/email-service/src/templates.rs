use handlebars::Handlebars;
use serde_json::Value;
use std::collections::HashMap;

pub struct TemplateEngine {
    handlebars: Handlebars<'static>,
}

impl TemplateEngine {
    pub fn new() -> Self {
        let mut handlebars = Handlebars::new();
        
        handlebars.register_template_string("welcome", WELCOME_TEMPLATE).unwrap();
        handlebars.register_template_string("order_confirmation", ORDER_CONFIRMATION_TEMPLATE).unwrap();
        handlebars.register_template_string("password_reset", PASSWORD_RESET_TEMPLATE).unwrap();
        
        Self { handlebars }
    }

    pub fn render(&self, template_name: &str, data: &Value) -> anyhow::Result<String> {
        Ok(self.handlebars.render(template_name, data)?)
    }

    pub fn render_welcome(&self, name: &str, company: &str) -> anyhow::Result<String> {
        let mut data = HashMap::new();
        data.insert("name", name);
        data.insert("company", company);
        self.render("welcome", &serde_json::to_value(data)?)
    }

    pub fn render_order_confirmation(
        &self,
        name: &str,
        order_id: &str,
        total: f64,
    ) -> anyhow::Result<String> {
        let mut data = HashMap::new();
        data.insert("name", name.to_string());
        data.insert("order_id", order_id.to_string());
        data.insert("total", format!("${:.2}", total));
        self.render("order_confirmation", &serde_json::to_value(data)?)
    }
}

const WELCOME_TEMPLATE: &str = r#"
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; }
        .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>¡Bienvenido a {{company}}!</h1>
        </div>
        <div class="content">
            <h2>Hola {{name}},</h2>
            <p>Gracias por unirte a nuestra plataforma. Estamos emocionados de tenerte con nosotros.</p>
            <p>Con DashOffice puedes gestionar toda tu operación desde un solo lugar:</p>
            <ul>
                <li>✅ Gestión de bots de WhatsApp</li>
                <li>✅ CRM completo</li>
                <li>✅ Control de inventario</li>
                <li>✅ Analytics en tiempo real</li>
            </ul>
            <a href="#" class="button">Comenzar Ahora</a>
        </div>
    </div>
</body>
</html>
"#;

const ORDER_CONFIRMATION_TEMPLATE: &str = r#"
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .order-box { background: #f0f0f0; padding: 20px; border-radius: 8px; margin: 20px 0; }
    </style>
</head>
<body>
    <div class="container">
        <h1>Confirmación de Orden</h1>
        <p>Hola {{name}},</p>
        <p>Tu orden ha sido confirmada exitosamente.</p>
        <div class="order-box">
            <h3>Detalles de la Orden</h3>
            <p><strong>ID:</strong> {{order_id}}</p>
            <p><strong>Total:</strong> {{total}}</p>
        </div>
        <p>Gracias por tu compra.</p>
    </div>
</body>
</html>
"#;

const PASSWORD_RESET_TEMPLATE: &str = r#"
<!DOCTYPE html>
<html>
<body>
    <h2>Restablecer Contraseña</h2>
    <p>Haz clic en el siguiente enlace para restablecer tu contraseña:</p>
    <a href="{{reset_link}}">Restablecer Contraseña</a>
</body>
</html>
"#;
