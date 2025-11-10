use leptos::*;

#[component]
pub fn Toast(#[prop(into)] message: String, #[prop(into)] show: Signal<bool>) -> impl IntoView {
    view! {
        <Show when=move || show()>
            <div class="fixed top-4 right-4 bg-white shadow-lg rounded-lg p-4 z-50 animate-slide-in">
                <p class="text-gray-800">{message}</p>
            </div>
        </Show>
    }
}
