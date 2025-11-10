//\! Flow Engine - Motor de flows conversacionales
//\! 
//\! Ejecuta flows de conversación con:
//\! - Steps (mensaje, pregunta, decisión, acción)
//\! - Variables y contexto
//\! - Condiciones y bifurcaciones
//\! - Integración con APIs
//\! - Persistencia de estado

use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use uuid::Uuid;
use anyhow::Result;

use super::state_machine::ConversationState;

/// Flow conversacional completo
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Flow {
    pub id: Uuid,
    pub name: String,
    pub description: String,
    pub steps: Vec<FlowStep>,
    pub variables: HashMap<String, serde_json::Value>,
}

/// Step de un flow
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(tag = "type")]
pub enum FlowStep {
    /// Enviar mensaje
    Message {
        id: String,
        text: String,
        next_step: Option<String>,
    },
    
    /// Hacer pregunta y esperar respuesta
    Question {
        id: String,
        text: String,
        variable_name: String,
        validation: Option<Validation>,
        next_step: Option<String>,
    },
    
    /// Decisión basada en condición
    Decision {
        id: String,
        condition: String,
        true_step: String,
        false_step: String,
    },
    
    /// Ejecutar acción (API call, DB query, etc.)
    Action {
        id: String,
        action_type: ActionType,
        parameters: HashMap<String, serde_json::Value>,
        next_step: Option<String>,
    },
    
    /// Mostrar menú de opciones
    Menu {
        id: String,
        text: String,
        options: Vec<MenuOption>,
    },
    
    /// Fin del flow
    End {
        id: String,
        message: Option<String>,
    },
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MenuOption {
    pub key: String,
    pub label: String,
    pub next_step: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Validation {
    pub validation_type: ValidationType,
    pub error_message: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum ValidationType {
    Phone,
    Email,
    Number,
    Text,
    Date,
    Regex(String),
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum ActionType {
    ApiCall { url: String, method: String },
    DatabaseQuery { query: String },
    SendEmail { to: String, template: String },
    CreateOrder,
    UpdateCustomer,
    Custom(String),
}

/// Motor de flows
pub struct FlowEngine {
    flows: HashMap<Uuid, Flow>,
}

impl FlowEngine {
    pub fn new() -> Self {
        Self {
            flows: HashMap::new(),
        }
    }
    
    /// Registrar un flow
    pub fn register_flow(&mut self, flow: Flow) {
        self.flows.insert(flow.id, flow);
    }
    
    /// Procesar mensaje del usuario
    pub async fn process(
        &self,
        conversation: &mut ConversationState,
        user_message: &str,
    ) -> Result<Option<String>> {
        // Si no hay flow activo, iniciar welcome flow
        if conversation.current_flow_id.is_none() {
            return Ok(Some(self.start_welcome_flow(conversation)?));
        }
        
        // Obtener flow actual
        let flow_id = conversation.current_flow_id.unwrap();
        let flow = self.flows.get(&flow_id)
            .ok_or_else(|| anyhow::anyhow\!("Flow not found"))?;
        
        // Obtener step actual
        let current_step_id = conversation.current_step_id.as_ref()
            .ok_or_else(|| anyhow::anyhow\!("No current step"))?;
        
        let current_step = flow.steps.iter()
            .find(|s| s.id() == current_step_id)
            .ok_or_else(|| anyhow::anyhow\!("Step not found"))?;
        
        // Procesar según tipo de step
        match current_step {
            FlowStep::Question { variable_name, validation, next_step, .. } => {
                // Validar respuesta
                if let Some(val) = validation {
                    if \!self.validate_input(user_message, val) {
                        return Ok(Some(val.error_message.clone()));
                    }
                }
                
                // Guardar respuesta en contexto
                conversation.set_variable(variable_name, serde_json::json\!(user_message));
                
                // Avanzar al siguiente step
                if let Some(next) = next_step {
                    return self.execute_step(conversation, flow, next).await;
                }
            }
            
            FlowStep::Menu { options, .. } => {
                // Buscar opción seleccionada
                if let Some(option) = options.iter().find(|o| o.key == user_message || o.label.to_lowercase() == user_message.to_lowercase()) {
                    return self.execute_step(conversation, flow, &option.next_step).await;
                } else {
                    return Ok(Some("Opción inválida. Por favor selecciona una opción válida.".to_string()));
                }
            }
            
            _ => {
                // Para otros types, continuar normalmente
                if let Some(next) = current_step.next_step() {
                    return self.execute_step(conversation, flow, next).await;
                }
            }
        }
        
        Ok(None)
    }
    
    /// Ejecutar un step específico
    async fn execute_step(
        &self,
        conversation: &mut ConversationState,
        flow: &Flow,
        step_id: &str,
    ) -> Result<Option<String>> {
        let step = flow.steps.iter()
            .find(|s| s.id() == step_id)
            .ok_or_else(|| anyhow::anyhow\!("Step not found: {}", step_id))?;
        
        conversation.current_step_id = Some(step_id.to_string());
        
        match step {
            FlowStep::Message { text, next_step, .. } => {
                let rendered_text = self.render_template(text, conversation);
                
                if let Some(next) = next_step {
                    conversation.current_step_id = Some(next.clone());
                }
                
                Ok(Some(rendered_text))
            }
            
            FlowStep::Question { text, .. } => {
                let rendered_text = self.render_template(text, conversation);
                Ok(Some(rendered_text))
            }
            
            FlowStep::Decision { condition, true_step, false_step, .. } => {
                let result = self.evaluate_condition(condition, conversation)?;
                let next_step = if result { true_step } else { false_step };
                self.execute_step(conversation, flow, next_step).await
            }
            
            FlowStep::Action { action_type, parameters, next_step, .. } => {
                // Ejecutar acción
                self.execute_action(action_type, parameters, conversation).await?;
                
                if let Some(next) = next_step {
                    self.execute_step(conversation, flow, next).await
                } else {
                    Ok(None)
                }
            }
            
            FlowStep::Menu { text, options, .. } => {
                let mut message = self.render_template(text, conversation);
                message.push_str("\n\n");
                
                for option in options {
                    message.push_str(&format\!("{} - {}\n", option.key, option.label));
                }
                
                Ok(Some(message))
            }
            
            FlowStep::End { message, .. } => {
                if let Some(msg) = message {
                    Ok(Some(self.render_template(msg, conversation)))
                } else {
                    Ok(Some("Gracias por tu tiempo. ¡Hasta pronto\!".to_string()))
                }
            }
        }
    }
    
    /// Iniciar welcome flow
    fn start_welcome_flow(&self, conversation: &mut ConversationState) -> Result<String> {
        // TODO: Obtener welcome flow del bot
        Ok("¡Hola\! Bienvenido a nuestro servicio. ¿En qué puedo ayudarte?".to_string())
    }
    
    /// Validar input del usuario
    fn validate_input(&self, input: &str, validation: &Validation) -> bool {
        match &validation.validation_type {
            ValidationType::Phone => {
                // Validar que sea un número de teléfono
                input.chars().filter(|c| c.is_numeric()).count() >= 7
            }
            ValidationType::Email => {
                // Validar email simple
                input.contains('@') && input.contains('.')
            }
            ValidationType::Number => {
                input.parse::<f64>().is_ok()
            }
            ValidationType::Text => {
                \!input.trim().is_empty()
            }
            ValidationType::Date => {
                // TODO: Validar formato de fecha
                true
            }
            ValidationType::Regex(pattern) => {
                // TODO: Validar con regex
                true
            }
        }
    }
    
    /// Renderizar template con variables
    fn render_template(&self, template: &str, conversation: &ConversationState) -> String {
        let mut result = template.to_string();
        
        // Reemplazar variables {{variable_name}}
        for (key, value) in &conversation.context {
            let placeholder = format\!("{{{{{}}}}}", key);
            if let Some(val_str) = value.as_str() {
                result = result.replace(&placeholder, val_str);
            }
        }
        
        result
    }
    
    /// Evaluar condición
    fn evaluate_condition(&self, condition: &str, conversation: &ConversationState) -> Result<bool> {
        // TODO: Implementar evaluador de expresiones
        // Por ahora: condiciones simples tipo "variable == value"
        
        if let Some((var, value)) = condition.split_once("==") {
            let var = var.trim();
            let value = value.trim().trim_matches('"');
            
            if let Some(ctx_value) = conversation.context.get(var) {
                if let Some(ctx_str) = ctx_value.as_str() {
                    return Ok(ctx_str == value);
                }
            }
        }
        
        Ok(false)
    }
    
    /// Ejecutar acción
    async fn execute_action(
        &self,
        action_type: &ActionType,
        parameters: &HashMap<String, serde_json::Value>,
        conversation: &mut ConversationState,
    ) -> Result<()> {
        match action_type {
            ActionType::ApiCall { url, method } => {
                // TODO: Llamar API externa
                tracing::info\!("API Call: {} {}", method, url);
            }
            ActionType::DatabaseQuery { query } => {
                // TODO: Ejecutar query
                tracing::info\!("DB Query: {}", query);
            }
            ActionType::SendEmail { to, template } => {
                // TODO: Enviar email
                tracing::info\!("Send email to: {}", to);
            }
            ActionType::CreateOrder => {
                // TODO: Crear orden
                tracing::info\!("Create order");
            }
            ActionType::UpdateCustomer => {
                // TODO: Actualizar cliente
                tracing::info\!("Update customer");
            }
            ActionType::Custom(action) => {
                tracing::info\!("Custom action: {}", action);
            }
        }
        
        Ok(())
    }
}

impl FlowStep {
    pub fn id(&self) -> &str {
        match self {
            FlowStep::Message { id, .. } => id,
            FlowStep::Question { id, .. } => id,
            FlowStep::Decision { id, .. } => id,
            FlowStep::Action { id, .. } => id,
            FlowStep::Menu { id, .. } => id,
            FlowStep::End { id, .. } => id,
        }
    }
    
    pub fn next_step(&self) -> Option<&str> {
        match self {
            FlowStep::Message { next_step, .. } => next_step.as_deref(),
            FlowStep::Question { next_step, .. } => next_step.as_deref(),
            FlowStep::Action { next_step, .. } => next_step.as_deref(),
            _ => None,
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_flow_step_id() {
        let step = FlowStep::Message {
            id: "step1".to_string(),
            text: "Hello".to_string(),
            next_step: None,
        };
        
        assert_eq\!(step.id(), "step1");
    }
}
