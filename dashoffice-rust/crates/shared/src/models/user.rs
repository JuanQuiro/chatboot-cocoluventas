//\! User Models

use super::*;

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct User {
    pub id: Id,
    pub email: String,
    pub password_hash: String,
    pub name: String,
    pub role: UserRole,
    pub tenant_id: String,
    pub avatar_url: Option<String>,
    pub is_active: bool,
    pub last_login_at: Option<Timestamp>,
    pub created_at: Timestamp,
    pub updated_at: Timestamp,
}

#[derive(Debug, Clone, Serialize, Deserialize, sqlx::Type)]
#[sqlx(type_name = "text")]
#[serde(rename_all = "lowercase")]
pub enum UserRole {
    Admin,
    Manager,
    Seller,
    Support,
    Viewer,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CreateUserRequest {
    pub email: String,
    pub password: String,
    pub name: String,
    pub role: UserRole,
    pub tenant_id: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LoginRequest {
    pub email: String,
    pub password: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LoginResponse {
    pub token: String,
    pub user: UserInfo,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UserInfo {
    pub id: Id,
    pub email: String,
    pub name: String,
    pub role: UserRole,
    pub tenant_id: String,
}
