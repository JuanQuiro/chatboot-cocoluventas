use leptos::*;

#[component]
pub fn Spinner(
    #[prop(optional, into)] size: String,
    #[prop(optional, into)] color: String,
) -> impl IntoView {
    let size_class = if size.is_empty() { "h-8 w-8" } else { &size };
    let color_class = if color.is_empty() { "border-blue-600" } else { &color };

    view! {
        <div class=format!(
            "animate-spin rounded-full border-2 border-t-transparent {} {}",
            size_class, color_class
        )></div>
    }
}

#[component]
pub fn LoadingOverlay(
    #[prop(into)] show: Signal<bool>,
    #[prop(optional, into)] message: String,
) -> impl IntoView {
    view! {
        <Show when=move || show()>
            <div class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 transition-all">
                <div class="bg-white rounded-xl shadow-2xl p-8 flex flex-col items-center max-w-sm">
                    <Spinner size="h-16 w-16".to_string() color="border-blue-600".to_string()/>
                    <p class="mt-6 text-gray-700 font-semibold text-lg">{
                        if message.is_empty() { "Cargando..." } else { &message }
                    }</p>
                    <div class="mt-4 flex space-x-2">
                        <div class="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style="animation-delay: 0s"></div>
                        <div class="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style="animation-delay: 0.1s"></div>
                        <div class="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
                    </div>
                </div>
            </div>
        </Show>
    }
}

#[component]
pub fn InlineLoader() -> impl IntoView {
    view! {
        <div class="flex items-center justify-center p-8">
            <Spinner size="h-12 w-12".to_string() color="border-blue-600".to_string()/>
        </div>
    }
}

#[component]
pub fn ButtonSpinner() -> impl IntoView {
    view! {
        <Spinner size="h-4 w-4".to_string() color="border-white".to_string()/>
    }
}
