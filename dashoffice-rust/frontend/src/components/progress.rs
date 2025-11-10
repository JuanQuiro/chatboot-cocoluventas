use leptos::*;

#[component]
pub fn ProgressBar(#[prop(into)] progress: Signal<f64>) -> impl IntoView {
    view! {
        <div class="w-full bg-gray-200 rounded-full h-2.5">
            <div 
                class="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                style:width=move || format!("{}%", progress())
            ></div>
        </div>
    }
}
