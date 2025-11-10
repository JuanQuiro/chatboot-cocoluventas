use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct Ticket {
    pub id: String,
    pub subject: String,
    pub status: String,
}