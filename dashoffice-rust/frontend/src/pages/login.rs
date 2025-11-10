use leptos::*;

#[component]
pub fn Login() -> impl IntoView {
    view! {
        <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 to-purple-600">
            <div class="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
                <h1 class="text-3xl font-bold text-center mb-8">"DashOffice"</h1>
                <form class="space-y-6">
                    <input type="email" placeholder="Email" class="w-full px-4 py-3 border rounded-lg"/>
                    <input type="password" placeholder="Password" class="w-full px-4 py-3 border rounded-lg"/>
                    <button class="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700">
                        "Iniciar Sesión"
                    </button>
                </form>
            </div>
        </div>
    }
}