use leptos::*;

#[component]
pub fn Spinner() -> impl IntoView {
    view! {
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    }
}

#[component]
pub fn ProgressBar(#[prop(into)] progress: Signal<f64>) -> impl IntoView {
    view! {
        <div class="w-full bg-gray-200 rounded-full h-2">
            <div 
                class="bg-blue-600 h-2 rounded-full transition-all"
                style:width=move || format!("{}%", progress())
            ></div>
        </div>
    }
}
