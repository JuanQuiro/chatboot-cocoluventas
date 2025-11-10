use leptos::*;

#[component]
pub fn NotFound() -> impl IntoView {
    view! {
        <div class="text-center py-20">
            <h1 class="text-6xl font-bold">"404"</h1>
            <p class="text-2xl text-gray-600 mt-4">"Página no encontrada"</p>
        </div>
    }
}