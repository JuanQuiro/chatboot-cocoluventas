use actix_web::{web, HttpResponse, Result};
use serde::{Deserialize, Serialize};
use crate::openai::OpenAIClient;
use crate::nlp::NLPProcessor;

#[derive(Deserialize)]
pub struct AnalyzeRequest {
    text: String,
}

#[derive(Serialize)]
pub struct AnalyzeResponse {
    sentiment: String,
    intent: String,
    keywords: Vec<String>,
    entities: Vec<String>,
}

pub async fn analyze_text(
    req: web::Json<AnalyzeRequest>,
    openai: web::Data<OpenAIClient>,
    nlp: web::Data<NLPProcessor>,
) -> Result<HttpResponse> {
    let text = &req.text;

    let sentiment = openai.sentiment_analysis(text).await
        .map(|s| format!("{:?}", s.sentiment))
        .unwrap_or_else(|_| "unknown".to_string());

    let intent = openai.intent_detection(text).await
        .map(|i| format!("{:?}", i.intent))
        .unwrap_or_else(|_| "unknown".to_string());

    let keywords = nlp.extract_keywords(text);

    Ok(HttpResponse::Ok().json(AnalyzeResponse {
        sentiment,
        intent,
        keywords,
        entities: vec![],
    }))
}

pub async fn health_check() -> HttpResponse {
    HttpResponse::Ok().json(serde_json::json!({
        "status": "ok",
        "service": "ai-service"
    }))
}
