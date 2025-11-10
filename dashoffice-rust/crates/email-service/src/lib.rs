pub mod smtp;
pub mod templates;
pub mod queue;
pub mod handlers;

pub use smtp::{SmtpClient, SmtpConfig};
pub use templates::TemplateEngine;
pub use queue::{EmailQueue, EmailJob, Priority};
