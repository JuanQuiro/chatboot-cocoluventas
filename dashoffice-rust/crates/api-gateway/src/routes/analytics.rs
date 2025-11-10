//! Analytics Routes

use actix_web::{web, HttpResponse, Responder};

pub fn config(cfg: &mut web::ServiceConfig) {
    cfg.service(
        web::scope("/analytics")
            .route("", web::get().to(list))
    );
}

async fn list() -> impl Responder {
    HttpResponse::Ok().json(serde_json::json!({
        "data": [],
        "total": 0
    }))
}
