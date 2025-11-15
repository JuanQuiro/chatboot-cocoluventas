//! Dashboard Leptos - Versión optimizada para producción
//! HTML embebido con JavaScript reactivo (estilo Leptos)

use axum::response::Html;

pub async fn dashboard() -> Html<&'static str> {
    Html(include_str!("../dashboard_leptos.html"))
}

