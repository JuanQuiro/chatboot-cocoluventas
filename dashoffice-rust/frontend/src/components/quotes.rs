use leptos::*;

#[component]
pub fn QuoteBanner() -> impl IntoView {
    view! {
        <div class="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-8 text-white">
            <p class="text-2xl font-bold">"Innovación que transforma negocios"</p>
            <p class="text-sm mt-2">"DashOffice Enterprise System"</p>
        </div>
    }
}