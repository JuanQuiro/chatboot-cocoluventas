//\! Database Utilities

use sqlx::PgPool;
use crate::error::Result;

pub async fn create_pool(database_url: &str, max_connections: u32) -> Result<PgPool> {
    let pool = PgPool::connect(database_url).await?;
    Ok(pool)
}
