//\! Configuration Management

use serde::Deserialize;

#[derive(Debug, Clone, Deserialize)]
pub struct Config {
    pub database: DatabaseConfig,
    pub redis: RedisConfig,
    pub server: ServerConfig,
}

#[derive(Debug, Clone, Deserialize)]
pub struct DatabaseConfig {
    pub url: String,
    pub max_connections: u32,
}

#[derive(Debug, Clone, Deserialize)]
pub struct RedisConfig {
    pub url: String,
}

#[derive(Debug, Clone, Deserialize)]
pub struct ServerConfig {
    pub host: String,
    pub port: u16,
}

impl Config {
    pub fn from_env() -> Result<Self, Box<dyn std::error::Error>> {
        dotenvy::dotenv().ok();
        
        let database = DatabaseConfig {
            url: std::env::var("DATABASE_URL")?,
            max_connections: std::env::var("DB_MAX_CONN")
                .unwrap_or_else(|_| "10".to_string())
                .parse()?,
        };

        let redis = RedisConfig {
            url: std::env::var("REDIS_URL")
                .unwrap_or_else(|_| "redis://localhost:6379".to_string()),
        };

        let server = ServerConfig {
            host: std::env::var("HOST")
                .unwrap_or_else(|_| "0.0.0.0".to_string()),
            port: std::env::var("PORT")
                .unwrap_or_else(|_| "3009".to_string())
                .parse()?,
        };

        Ok(Self {
            database,
            redis,
            server,
        })
    }
}
