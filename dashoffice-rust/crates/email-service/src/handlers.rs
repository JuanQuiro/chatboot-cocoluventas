use actix_web::{web, HttpResponse, Result};
use serde::{Deserialize, Serialize};
use crate::queue::EmailQueue;
use crate::templates::TemplateEngine;

#[derive(Deserialize)]
pub struct SendEmailRequest {
    pub to: String,
    pub subject: String,
    pub body: String,
    pub urgent: Option<bool>,
}

#[derive(Serialize)]
pub struct SendEmailResponse {
    pub success: bool,
    pub message: String,
}

pub async fn send_email(
    req: web::Json<SendEmailRequest>,
    queue: web::Data<EmailQueue>,
) -> Result<HttpResponse> {
    let result = if req.urgent.unwrap_or(false) {
        queue.send_urgent(&req.to, &req.subject, &req.body)
    } else {
        queue.send_now(&req.to, &req.subject, &req.body)
    };

    match result {
        Ok(_) => Ok(HttpResponse::Ok().json(SendEmailResponse {
            success: true,
            message: "Email enqueued".to_string(),
        })),
        Err(e) => Ok(HttpResponse::InternalServerError().json(SendEmailResponse {
            success: false,
            message: e.to_string(),
        })),
    }
}

#[derive(Deserialize)]
pub struct SendTemplateRequest {
    pub to: String,
    pub template: String,
    pub data: serde_json::Value,
}

pub async fn send_template_email(
    req: web::Json<SendTemplateRequest>,
    queue: web::Data<EmailQueue>,
    templates: web::Data<TemplateEngine>,
) -> Result<HttpResponse> {
    let body = templates.render(&req.template, &req.data)
        .map_err(|e| actix_web::error::ErrorInternalServerError(e))?;

    queue.send_now(&req.to, "Email from DashOffice", &body)
        .map_err(|e| actix_web::error::ErrorInternalServerError(e))?;

    Ok(HttpResponse::Ok().json(SendEmailResponse {
        success: true,
        message: "Template email enqueued".to_string(),
    }))
}

pub async fn health_check() -> HttpResponse {
    HttpResponse::Ok().json(serde_json::json!({
        "status": "ok",
        "service": "email-service"
    }))
}
