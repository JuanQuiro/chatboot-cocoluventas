use leptos::*;

#[derive(Clone, Debug)]
pub struct AuthState {
    pub token: Option<String>,
    pub user: Option<String>,
}