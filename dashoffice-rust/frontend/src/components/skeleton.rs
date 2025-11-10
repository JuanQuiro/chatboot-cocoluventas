use leptos::*;

#[component]
pub fn SkeletonCard() -> impl IntoView {
    view! {
        <div class="bg-white p-6 rounded-lg shadow animate-pulse">
            <div class="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div class="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
    }
}