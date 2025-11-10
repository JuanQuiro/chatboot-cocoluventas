use leptos::*;

#[component]
pub fn Products() -> impl IntoView {
    let (products, set_products) = create_signal(vec![]);
    let (loading, set_loading) = create_signal(true);
    
    view! {
        <div class="space-y-6">
            <div class="flex justify-between items-center">
                <h1 class="text-3xl font-bold text-gray-900">"Productos"</h1>
                <button class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    "+ Nuevo Producto"
                </button>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div class="bg-white p-6 rounded-lg shadow">
                    <p class="text-gray-600">"Total Productos"</p>
                    <p class="text-3xl font-bold">"1,234"</p>
                </div>
            </div>
        </div>
    }
}