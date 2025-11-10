use leptos::*;

#[component]
pub fn Logo(#[prop(optional)] size: u32) -> impl IntoView {
    let size = if size == 0 { 48 } else { size };
    
    view! {
        <div class="flex items-center space-x-3">
            <svg 
                width=size 
                height=size 
                viewBox="0 0 100 100" 
                class="drop-shadow-2xl transform hover:scale-110 transition-transform duration-300"
            >
                <defs>
                    <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
                        <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
                    </linearGradient>
                </defs>
                
                // Círculo exterior con efecto 3D
                <circle cx="50" cy="50" r="45" fill="url(#logoGradient)" opacity="0.1"/>
                <circle cx="50" cy="50" r="40" fill="url(#logoGradient)" opacity="0.3"/>
                
                // "D" estilizada
                <path 
                    d="M 35 30 L 45 30 Q 65 30 65 50 Q 65 70 45 70 L 35 70 Z" 
                    fill="white" 
                    opacity="0.95"
                />
                
                // Detalle central
                <circle cx="55" cy="50" r="8" fill="white" opacity="0.9"/>
                
                // Anillo exterior decorativo
                <circle cx="50" cy="50" r="42" fill="none" stroke="white" stroke-width="2" opacity="0.4"/>
            </svg>
            
            <div class="flex flex-col">
                <span class="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    "DashOffice"
                </span>
                <span class="text-xs text-gray-500 font-medium tracking-wider">
                    "ENTERPRISE SYSTEM"
                </span>
            </div>
        </div>
    }
}

#[component]
pub fn AnimatedLogo() -> impl IntoView {
    view! {
        <div class="relative group">
            <div class="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full blur-xl opacity-50 group-hover:opacity-75 transition-opacity animate-pulse"></div>
            <Logo size=64/>
        </div>
    }
}

#[component]
pub fn FloatingLogo() -> impl IntoView {
    view! {
        <div class="relative animate-float">
            <style>
                "@keyframes float {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-20px); }
                }"
                ".animate-float { animation: float 3s ease-in-out infinite; }"
            </style>
            <Logo size=96/>
        </div>
    }
}
