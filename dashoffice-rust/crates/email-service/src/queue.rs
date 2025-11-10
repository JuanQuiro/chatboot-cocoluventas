use tokio::sync::mpsc;
use serde::{Deserialize, Serialize};
use chrono::{DateTime, Utc};
use uuid::Uuid;
use std::sync::Arc;
use tracing::{info, error};
use crate::smtp::SmtpClient;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EmailJob {
    pub id: Uuid,
    pub to: String,
    pub subject: String,
    pub body: String,
    pub priority: Priority,
    pub created_at: DateTime<Utc>,
    pub retry_count: u32,
    pub max_retries: u32,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, PartialOrd, Ord)]
pub enum Priority {
    Low = 0,
    Normal = 1,
    High = 2,
    Urgent = 3,
}

pub struct EmailQueue {
    sender: mpsc::UnboundedSender<EmailJob>,
    smtp_client: Arc<SmtpClient>,
}

impl EmailQueue {
    pub fn new(smtp_client: SmtpClient) -> Self {
        let (sender, mut receiver) = mpsc::unbounded_channel::<EmailJob>();
        let smtp_client = Arc::new(smtp_client);
        let client_clone = smtp_client.clone();

        tokio::spawn(async move {
            info!("Email queue worker started");
            
            while let Some(job) = receiver.recv().await {
                info!("Processing email job: {} to {}", job.id, job.to);
                
                match client_clone.send_email(&job.to, &job.subject, &job.body) {
                    Ok(_) => {
                        info!("✅ Email sent successfully: {}", job.id);
                    }
                    Err(e) => {
                        error!("❌ Failed to send email {}: {}", job.id, e);
                        
                        if job.retry_count < job.max_retries {
                            let mut retry_job = job.clone();
                            retry_job.retry_count += 1;
                            
                            let sender_clone = sender.clone();
                            tokio::spawn(async move {
                                tokio::time::sleep(tokio::time::Duration::from_secs(30)).await;
                                let _ = sender_clone.send(retry_job);
                            });
                        }
                    }
                }
            }
        });

        Self {
            sender,
            smtp_client,
        }
    }

    pub fn enqueue(&self, job: EmailJob) -> anyhow::Result<()> {
        self.sender.send(job)?;
        Ok(())
    }

    pub fn send_now(&self, to: &str, subject: &str, body: &str) -> anyhow::Result<()> {
        let job = EmailJob {
            id: Uuid::new_v4(),
            to: to.to_string(),
            subject: subject.to_string(),
            body: body.to_string(),
            priority: Priority::Normal,
            created_at: Utc::now(),
            retry_count: 0,
            max_retries: 3,
        };
        
        self.enqueue(job)
    }

    pub fn send_urgent(&self, to: &str, subject: &str, body: &str) -> anyhow::Result<()> {
        let job = EmailJob {
            id: Uuid::new_v4(),
            to: to.to_string(),
            subject: subject.to_string(),
            body: body.to_string(),
            priority: Priority::Urgent,
            created_at: Utc::now(),
            retry_count: 0,
            max_retries: 5,
        };
        
        self.enqueue(job)
    }
}
