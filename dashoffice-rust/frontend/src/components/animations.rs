use leptos::*;

#[component]
pub fn Card3D(children: Children) -> impl IntoView {
    view! {
        <div class="card-3d group perspective-1000">
            <div class="relative transform-gpu transition-all duration-500 group-hover:scale-105 group-hover:rotate-y-2 bg-white rounded-xl shadow-2xl overflow-hidden">
                // Efecto de brillo 3D
                <div class="absolute inset-0 bg-gradient-to-br from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                
                // Borde brillante
                <div class="absolute inset-0 rounded-xl ring-1 ring-inset ring-white/10"></div>
                
                // Contenido
                <div class="relative z-10 p-6">
                    {children()}
                </div>
                
                // Sombra 3D
                <div class="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl blur-lg opacity-0 group-hover:opacity-20 transition-opacity -z-10"></div>
            </div>
        </div>
    }
}

#[component]
pub fn GlowingButton(
    children: Children,
    #[prop(optional)] on_click: Option<Box<dyn Fn()>>,
) -> impl IntoView {
    view! {
        <button 
            on:click=move |_| { if let Some(ref cb) = on_click { cb() } }
            class="relative group px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-lg overflow-hidden transform transition-all duration-300 hover:scale-105 hover:shadow-2xl"
        >
            // Efecto de brillo animado
            <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-30 transform -skew-x-12 group-hover:translate-x-full transition-all duration-700"></div>
            
            // Partículas flotantes
            <div class="absolute top-0 left-1/4 w-2 h-2 bg-white rounded-full opacity-0 group-hover:opacity-100 group-hover:-translate-y-8 transition-all duration-500"></div>
            <div class="absolute top-0 left-2/4 w-2 h-2 bg-white rounded-full opacity-0 group-hover:opacity-100 group-hover:-translate-y-10 transition-all duration-700 delay-100"></div>
            <div class="absolute top-0 left-3/4 w-2 h-2 bg-white rounded-full opacity-0 group-hover:opacity-100 group-hover:-translate-y-8 transition-all duration-500 delay-200"></div>
            
            <span class="relative z-10">{children()}</span>
        </button>
    }
}

#[component]
pub fn StatCard3D(
    title: &'static str,
    value: String,
    icon: &'static str,
    trend: &'static str,
) -> impl IntoView {
    view! {
        <Card3D>
            <div class="flex items-start justify-between">
                <div class="flex-1">
                    <p class="text-sm font-medium text-gray-600 mb-2">{title}</p>
                    <p class="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        {value}
                    </p>
                    <p class="text-sm text-green-600 font-semibold mt-2">
                        "↗ " {trend}
                    </p>
                </div>
                <div class="text-5xl opacity-20 transform group-hover:scale-125 transition-transform">
                    {icon}
                </div>
            </div>
        </Card3D>
    }
}

#[component]
pub fn PulsingDot(#[prop(optional)] color: &'static str) -> impl IntoView {
    let color_class = if color.is_empty() { "bg-green-500" } else { color };
    
    view! {
        <div class="relative flex h-3 w-3">
            <span class=format!("animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 {}", color_class)></span>
            <span class=format!("relative inline-flex rounded-full h-3 w-3 {}", color_class)></span>
        </div>
    }
}

#[component]
pub fn RippleEffect() -> impl IntoView {
    view! {
        <div class="absolute inset-0 overflow-hidden pointer-events-none">
            <div class="ripple absolute w-4 h-4 bg-blue-500 rounded-full opacity-0 animate-ripple"></div>
            <style>
                "@keyframes ripple {
                    0% { transform: scale(1); opacity: 0.5; }
                    100% { transform: scale(20); opacity: 0; }
                }"
                ".animate-ripple { animation: ripple 1.5s ease-out infinite; }"
            </style>
        </div>
    }
}
