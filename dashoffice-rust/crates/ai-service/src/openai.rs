use serde::{Deserialize, Serialize};
use reqwest::Client;
use anyhow::{Result, Context};

const OPENAI_API_URL: &str = "https://api.openai.com/v1/chat/completions";

#[derive(Debug, Serialize)]
struct ChatRequest {
    model: String,
    messages: Vec<Message>,
    temperature: f32,
    max_tokens: u32,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Message {
    pub role: String,
    pub content: String,
}

#[derive(Debug, Deserialize)]
struct ChatResponse {
    choices: Vec<Choice>,
}

#[derive(Debug, Deserialize)]
struct Choice {
    message: Message,
}

pub struct OpenAIClient {
    client: Client,
    api_key: String,
    model: String,
}

impl OpenAIClient {
    pub fn new(api_key: String) -> Self {
        Self {
            client: Client::new(),
            api_key,
            model: "gpt-4-turbo-preview".to_string(),
        }
    }

    pub async fn chat_completion(&self, messages: Vec<Message>) -> Result<String> {
        let request = ChatRequest {
            model: self.model.clone(),
            messages,
            temperature: 0.7,
            max_tokens: 1000,
        };

        let response = self.client
            .post(OPENAI_API_URL)
            .header("Authorization", format!("Bearer {}", self.api_key))
            .json(&request)
            .send()
            .await
            .context("Failed to send request to OpenAI")?;

        let chat_response: ChatResponse = response
            .json()
            .await
            .context("Failed to parse OpenAI response")?;

        Ok(chat_response.choices[0].message.content.clone())
    }

    pub async fn sentiment_analysis(&self, text: &str) -> Result<SentimentResult> {
        let messages = vec![
            Message {
                role: "system".to_string(),
                content: "Analiza el sentimiento del siguiente texto. Responde solo con: positive, negative, o neutral".to_string(),
            },
            Message {
                role: "user".to_string(),
                content: text.to_string(),
            },
        ];

        let sentiment = self.chat_completion(messages).await?;
        let sentiment = sentiment.trim().to_lowercase();

        Ok(SentimentResult {
            sentiment: match sentiment.as_str() {
                "positive" => Sentiment::Positive,
                "negative" => Sentiment::Negative,
                _ => Sentiment::Neutral,
            },
            confidence: 0.85,
        })
    }

    pub async fn intent_detection(&self, text: &str) -> Result<IntentResult> {
        let messages = vec![
            Message {
                role: "system".to_string(),
                content: "Detecta la intención del usuario. Responde con una de estas opciones: greeting, product_inquiry, order_status, complaint, other".to_string(),
            },
            Message {
                role: "user".to_string(),
                content: text.to_string(),
            },
        ];

        let intent_str = self.chat_completion(messages).await?;
        let intent_str = intent_str.trim().to_lowercase();

        Ok(IntentResult {
            intent: match intent_str.as_str() {
                "greeting" => Intent::Greeting,
                "product_inquiry" => Intent::ProductInquiry,
                "order_status" => Intent::OrderStatus,
                "complaint" => Intent::Complaint,
                _ => Intent::Other,
            },
            confidence: 0.85,
        })
    }

    pub async fn entity_extraction(&self, text: &str) -> Result<Vec<Entity>> {
        let messages = vec![
            Message {
                role: "system".to_string(),
                content: "Extrae entidades del texto (nombres, productos, números, fechas). Responde en formato JSON: [{\"type\": \"...\", \"value\": \"...\"}]".to_string(),
            },
            Message {
                role: "user".to_string(),
                content: text.to_string(),
            },
        ];

        let entities_json = self.chat_completion(messages).await?;
        let entities: Vec<Entity> = serde_json::from_str(&entities_json)
            .unwrap_or_else(|_| vec![]);

        Ok(entities)
    }
}

#[derive(Debug, Serialize, Deserialize)]
pub struct SentimentResult {
    pub sentiment: Sentiment,
    pub confidence: f32,
}

#[derive(Debug, Serialize, Deserialize)]
pub enum Sentiment {
    Positive,
    Negative,
    Neutral,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct IntentResult {
    pub intent: Intent,
    pub confidence: f32,
}

#[derive(Debug, Serialize, Deserialize)]
pub enum Intent {
    Greeting,
    ProductInquiry,
    OrderStatus,
    Complaint,
    Other,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Entity {
    #[serde(rename = "type")]
    pub entity_type: String,
    pub value: String,
}
