//\! AI Service - Inteligencia Artificial
//\! 
//\! Funcionalidades:
//\! - Sentiment analysis
//\! - Intent detection
//\! - Entity extraction
//\! - NLP processing
//\! - OpenAI integration
//\! - Language detection

use actix_web::{web, App, HttpServer, HttpResponse};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(Debug, Serialize, Deserialize)]
pub struct SentimentAnalysisRequest {
    pub message: String,
    pub language: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct SentimentAnalysisResponse {
    pub sentiment: Sentiment,
    pub score: f32,
    pub confidence: f32,
    pub needs_attention: bool,
    pub keywords: Vec<String>,
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum Sentiment {
    Positive,
    Neutral,
    Negative,
    Mixed,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct IntentDetectionRequest {
    pub message: String,
    pub context: Option<HashMap<String, String>>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct IntentDetectionResponse {
    pub intent: String,
    pub confidence: f32,
    pub entities: Vec<Entity>,
    pub suggested_response: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Entity {
    pub entity_type: String,
    pub value: String,
    pub start: usize,
    pub end: usize,
    pub confidence: f32,
}

/// Servicio de análisis de sentimiento
pub struct SentimentAnalyzer {
    positive_words: Vec<String>,
    negative_words: Vec<String>,
    neutral_words: Vec<String>,
}

impl SentimentAnalyzer {
    pub fn new() -> Self {
        Self {
            positive_words: vec\![
                "gracias", "excelente", "perfecto", "genial", "feliz",
                "amor", "bueno", "increíble", "maravilloso", "fantástico",
                "gracias", "agradecido", "contento", "satisfecho",
            ].iter().map(|s| s.to_string()).collect(),
            
            negative_words: vec\![
                "mal", "terrible", "horrible", "enojado", "problema",
                "odio", "malo", "pésimo", "molesto", "furioso",
                "decepcionado", "frustrado", "triste", "queja",
            ].iter().map(|s| s.to_string()).collect(),
            
            neutral_words: vec\![
                "hola", "información", "pregunta", "ayuda", "gracias",
            ].iter().map(|s| s.to_string()).collect(),
        }
    }
    
    pub fn analyze(&self, message: &str) -> SentimentAnalysisResponse {
        let lower_message = message.to_lowercase();
        let words: Vec<&str> = lower_message.split_whitespace().collect();
        
        let mut score = 0.0;
        let mut keywords = Vec::new();
        
        // Contar palabras positivas
        for word in &self.positive_words {
            if lower_message.contains(word) {
                score += 1.0;
                keywords.push(word.clone());
            }
        }
        
        // Contar palabras negativas
        for word in &self.negative_words {
            if lower_message.contains(word) {
                score -= 1.0;
                keywords.push(word.clone());
            }
        }
        
        // Determinar sentimiento
        let sentiment = if score > 0.5 {
            Sentiment::Positive
        } else if score < -0.5 {
            Sentiment::Negative
        } else if score.abs() < 0.1 {
            Sentiment::Neutral
        } else {
            Sentiment::Mixed
        };
        
        let confidence = (score.abs() / words.len() as f32).min(1.0);
        let needs_attention = matches\!(sentiment, Sentiment::Negative) && score < -2.0;
        
        SentimentAnalysisResponse {
            sentiment,
            score,
            confidence,
            needs_attention,
            keywords,
        }
    }
}

/// Detector de intenciones
pub struct IntentDetector {
    intents: HashMap<String, Vec<String>>,
}

impl IntentDetector {
    pub fn new() -> Self {
        let mut intents = HashMap::new();
        
        // Intent: Compra
        intents.insert("purchase".to_string(), vec\![
            "comprar", "quiero", "precio", "costo", "cuanto",
            "adquirir", "necesito", "vender", "pagar",
        ].iter().map(|s| s.to_string()).collect());
        
        // Intent: Consulta
        intents.insert("inquiry".to_string(), vec\![
            "información", "qué", "cómo", "dónde", "cuándo",
            "preguntar", "consultar", "saber",
        ].iter().map(|s| s.to_string()).collect());
        
        // Intent: Soporte
        intents.insert("support".to_string(), vec\![
            "problema", "ayuda", "error", "falla", "no funciona",
            "roto", "mal", "soporte", "asistencia",
        ].iter().map(|s| s.to_string()).collect());
        
        // Intent: Cancelación
        intents.insert("cancellation".to_string(), vec\![
            "cancelar", "devolver", "reembolso", "anular",
            "eliminar", "borrar",
        ].iter().map(|s| s.to_string()).collect());
        
        // Intent: Saludo
        intents.insert("greeting".to_string(), vec\![
            "hola", "buenos días", "buenas tardes", "buenas noches",
            "saludos", "qué tal", "hey",
        ].iter().map(|s| s.to_string()).collect());
        
        Self { intents }
    }
    
    pub fn detect(&self, message: &str) -> IntentDetectionResponse {
        let lower_message = message.to_lowercase();
        let mut scores: HashMap<String, f32> = HashMap::new();
        
        // Calcular score para cada intent
        for (intent, keywords) in &self.intents {
            let mut score = 0.0;
            for keyword in keywords {
                if lower_message.contains(keyword) {
                    score += 1.0;
                }
            }
            scores.insert(intent.clone(), score);
        }
        
        // Encontrar intent con mayor score
        let (intent, confidence) = scores
            .iter()
            .max_by(|a, b| a.1.partial_cmp(b.1).unwrap())
            .map(|(k, v)| (k.clone(), *v / 10.0))
            .unwrap_or_else(|| ("unknown".to_string(), 0.0));
        
        // Extraer entidades básicas
        let entities = self.extract_entities(&lower_message);
        
        IntentDetectionResponse {
            intent,
            confidence: confidence.min(1.0),
            entities,
            suggested_response: None,
        }
    }
    
    fn extract_entities(&self, message: &str) -> Vec<Entity> {
        let mut entities = Vec::new();
        
        // Detectar números (precios, cantidades)
        let number_regex = regex::Regex::new(r"\d+").unwrap();
        for mat in number_regex.find_iter(message) {
            entities.push(Entity {
                entity_type: "number".to_string(),
                value: mat.as_str().to_string(),
                start: mat.start(),
                end: mat.end(),
                confidence: 0.9,
            });
        }
        
        // Detectar emails
        let email_regex = regex::Regex::new(r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b").unwrap();
        for mat in email_regex.find_iter(message) {
            entities.push(Entity {
                entity_type: "email".to_string(),
                value: mat.as_str().to_string(),
                start: mat.start(),
                end: mat.end(),
                confidence: 0.95,
            });
        }
        
        // Detectar teléfonos
        let phone_regex = regex::Regex::new(r"\+?\d{1,3}[-.\s]?\(?\d{1,4}\)?[-.\s]?\d{1,4}[-.\s]?\d{1,9}").unwrap();
        for mat in phone_regex.find_iter(message) {
            entities.push(Entity {
                entity_type: "phone".to_string(),
                value: mat.as_str().to_string(),
                start: mat.start(),
                end: mat.end(),
                confidence: 0.85,
            });
        }
        
        entities
    }
}

// Handlers HTTP
async fn analyze_sentiment(
    req: web::Json<SentimentAnalysisRequest>,
) -> HttpResponse {
    let analyzer = SentimentAnalyzer::new();
    let result = analyzer.analyze(&req.message);
    
    HttpResponse::Ok().json(result)
}

async fn detect_intent(
    req: web::Json<IntentDetectionRequest>,
) -> HttpResponse {
    let detector = IntentDetector::new();
    let result = detector.detect(&req.message);
    
    HttpResponse::Ok().json(result)
}

async fn health_check() -> HttpResponse {
    HttpResponse::Ok().json(serde_json::json!({
        "status": "ok",
        "service": "ai-service"
    }))
}

            .route("/analyze-sentiment", web::post().to(analyze_sentiment))
            .route("/detect-intent", web::post().to(detect_intent))
    })
    .bind(("0.0.0.0", port))?
    .run()
    .await
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_sentiment_positive() {
        let analyzer = SentimentAnalyzer::new();
        let result = analyzer.analyze("Excelente servicio, gracias");
        
        assert\!(matches\!(result.sentiment, Sentiment::Positive));
        assert\!(result.score > 0.0);
    }
    
    #[test]
    fn test_sentiment_negative() {
        let analyzer = SentimentAnalyzer::new();
        let result = analyzer.analyze("Terrible, muy mal servicio");
        
        assert\!(matches\!(result.sentiment, Sentiment::Negative));
        assert\!(result.score < 0.0);
        assert\!(result.needs_attention);
    }
    
    #[test]
    fn test_intent_purchase() {
        let detector = IntentDetector::new();
        let result = detector.detect("Quiero comprar 3 productos");
        
        assert_eq\!(result.intent, "purchase");
        assert\!(result.confidence > 0.0);
    }
}
