use lettre::{
    message::{header, MultiPart, SinglePart},
    transport::smtp::authentication::Credentials,
    Message, SmtpTransport, Transport,
};
use anyhow::{Result, Context};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SmtpConfig {
    pub host: String,
    pub port: u16,
    pub username: String,
    pub password: String,
    pub from_email: String,
    pub from_name: String,
}

pub struct SmtpClient {
    config: SmtpConfig,
    transport: SmtpTransport,
}

impl SmtpClient {
    pub fn new(config: SmtpConfig) -> Result<Self> {
        let creds = Credentials::new(
            config.username.clone(),
            config.password.clone(),
        );

        let transport = SmtpTransport::relay(&config.host)?
            .port(config.port)
            .credentials(creds)
            .build();

        Ok(Self { config, transport })
    }

    pub fn send_email(&self, to: &str, subject: &str, html_body: &str) -> Result<()> {
        let email = Message::builder()
            .from(format!("{} <{}>", self.config.from_name, self.config.from_email).parse()?)
            .to(to.parse()?)
            .subject(subject)
            .multipart(
                MultiPart::alternative()
                    .singlepart(
                        SinglePart::builder()
                            .header(header::ContentType::TEXT_PLAIN)
                            .body(html_body.to_string()),
                    )
                    .singlepart(
                        SinglePart::builder()
                            .header(header::ContentType::TEXT_HTML)
                            .body(html_body.to_string()),
                    ),
            )
            .context("Failed to build email")?;

        self.transport
            .send(&email)
            .context("Failed to send email")?;

        Ok(())
    }

    pub fn send_with_attachment(
        &self,
        to: &str,
        subject: &str,
        html_body: &str,
        attachment_data: Vec<u8>,
        attachment_name: &str,
    ) -> Result<()> {
        let email = Message::builder()
            .from(format!("{} <{}>", self.config.from_name, self.config.from_email).parse()?)
            .to(to.parse()?)
            .subject(subject)
            .multipart(
                MultiPart::mixed()
                    .singlepart(
                        SinglePart::builder()
                            .header(header::ContentType::TEXT_HTML)
                            .body(html_body.to_string()),
                    )
                    .singlepart(
                        SinglePart::builder()
                            .header(header::ContentType::parse("application/octet-stream")?)
                            .header(header::ContentDisposition::attachment(attachment_name))
                            .body(attachment_data),
                    ),
            )?;

        self.transport.send(&email)?;
        Ok(())
    }
}
