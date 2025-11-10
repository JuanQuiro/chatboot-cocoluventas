//\! Utility Functions

use chrono::{DateTime, Utc};

pub fn now() -> DateTime<Utc> {
    Utc::now()
}

pub fn format_timestamp(dt: &DateTime<Utc>) -> String {
    dt.format("%Y-%m-%d %H:%M:%S UTC").to_string()
}
