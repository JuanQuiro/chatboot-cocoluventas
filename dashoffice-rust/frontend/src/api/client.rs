use gloo_net::http::Request;
use serde::{Deserialize, Serialize};
use std::rc::Rc;

const API_BASE: &str = "http://localhost:3009/api";

#[derive(Clone)]
pub struct ApiClient {
    base_url: String,
    token: Rc<Option<String>>,
}

impl ApiClient {
    pub fn new() -> Self {
        let token = web_sys::window()
            .and_then(|w| w.local_storage().ok().flatten())
            .and_then(|storage| storage.get_item("auth_token").ok().flatten());

        Self {
            base_url: API_BASE.to_string(),
            token: Rc::new(token),
        }
    }

    pub fn set_token(&mut self, token: String) {
        if let Some(storage) = web_sys::window()
            .and_then(|w| w.local_storage().ok().flatten())
        {
            let _ = storage.set_item("auth_token", &token);
        }
        self.token = Rc::new(Some(token));
    }

    pub fn clear_token(&mut self) {
        if let Some(storage) = web_sys::window()
            .and_then(|w| w.local_storage().ok().flatten())
        {
            let _ = storage.remove_item("auth_token");
        }
        self.token = Rc::new(None);
    }

    async fn request<T: for<'de> Deserialize<'de>>(
        &self,
        method: &str,
        path: &str,
        body: Option<serde_json::Value>,
    ) -> Result<T, String> {
        let url = format!("{}{}", self.base_url, path);
        let mut request = Request::new(&url).method(method.parse().unwrap());

        if let Some(token) = self.token.as_ref() {
            request = request.header("Authorization", &format!("Bearer {}", token));
        }

        if let Some(body) = body {
            request = request
                .header("Content-Type", "application/json")
                .body(serde_json::to_string(&body).map_err(|e| e.to_string())?);
        }

        let response = request
            .send()
            .await
            .map_err(|e| format!("Network error: {}", e))?;

        if response.ok() {
            response
                .json()
                .await
                .map_err(|e| format!("Parse error: {}", e))
        } else {
            Err(format!("HTTP {}: {}", response.status(), response.status_text()))
        }
    }

    pub async fn get<T: for<'de> Deserialize<'de>>(&self, path: &str) -> Result<T, String> {
        self.request("GET", path, None).await
    }

    pub async fn post<T: for<'de> Deserialize<'de>>(
        &self,
        path: &str,
        body: serde_json::Value,
    ) -> Result<T, String> {
        self.request("POST", path, Some(body)).await
    }

    pub async fn put<T: for<'de> Deserialize<'de>>(
        &self,
        path: &str,
        body: serde_json::Value,
    ) -> Result<T, String> {
        self.request("PUT", path, Some(body)).await
    }

    pub async fn delete<T: for<'de> Deserialize<'de>>(&self, path: &str) -> Result<T, String> {
        self.request("DELETE", path, None).await
    }
}

// WebSocket para real-time
pub struct WebSocketClient {
    ws: web_sys::WebSocket,
}

impl WebSocketClient {
    pub fn new(url: &str) -> Result<Self, String> {
        let ws = web_sys::WebSocket::new(url).map_err(|e| format!("WS error: {:?}", e))?;
        ws.set_binary_type(web_sys::BinaryType::Arraybuffer);
        Ok(Self { ws })
    }

    pub fn send(&self, data: &str) -> Result<(), String> {
        self.ws
            .send_with_str(data)
            .map_err(|e| format!("Send error: {:?}", e))
    }

    pub fn close(&self) {
        let _ = self.ws.close();
    }
}
