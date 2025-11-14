# 🚀 Dashboard Leptos - Framework Rust Full-Stack

## 📋 Índice

1. [Introducción](#introducción)
2. [Por qué Leptos](#por-qué-leptos)
3. [Arquitectura](#arquitectura)
4. [Características](#características)
5. [Instalación](#instalación)
6. [Desarrollo](#desarrollo)
7. [Componentes](#componentes)

---

## 🎯 Introducción

Dashboard profesional construido con **Leptos** - framework Rust full-stack reactivo.

**Leptos vs Alternativas:**

| Aspecto | Leptos | Yew | HTML/JS |
|--------|--------|-----|---------|
| Lenguaje | Rust | Rust | HTML/JS |
| Type-safe | ✅ Sí | ✅ Sí | ❌ No |
| Performance | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ |
| Reactividad | ✅ Automática | ✅ Manual | ❌ Manual |
| Bundle size | 50KB | 100KB | 500KB |
| SSR | ✅ Sí | ❌ No | ✅ Sí |
| Curva aprendizaje | Media | Media | Baja |

---

## ✨ Por qué Leptos

### 1. **Rust Puro**
```rust
// Todo es Rust - sin mezclar lenguajes
#[component]
fn Dashboard() -> impl IntoView {
    let (messages, set_messages) = create_signal(vec![]);
    
    view! {
        <div>
            <For each=messages key=|msg| msg.id let:msg>
                <MessageCard message=msg/>
            </For>
        </div>
    }
}
```

### 2. **Reactividad Automática**
```rust
// Cambios automáticos sin refrescar
let (count, set_count) = create_signal(0);

view! {
    <button on:click=move |_| set_count(count() + 1)>
        "Contador: " {count}
    </button>
}
```

### 3. **Type-Safe**
```rust
// Errores en compilación, no en runtime
#[derive(Serialize, Deserialize, Clone)]
struct Message {
    id: String,
    from: String,
    body: String,
}

// Compiler verifica tipos automáticamente
```

### 4. **Performance**
- Bundle: 50KB (vs 500KB HTML/JS)
- Startup: 100ms (vs 1s HTML/JS)
- Memory: 10MB (vs 50MB HTML/JS)

### 5. **SSR (Server-Side Rendering)**
```rust
// Renderizar en servidor, hidratar en cliente
#[cfg(feature = "ssr")]
#[get("/")]
async fn dashboard() -> impl Responder {
    render_to_string(|| view! { <Dashboard/> })
}
```

---

## 🏗️ Arquitectura

```
dashboard-leptos/
├── src/
│   ├── main.rs                 (App root)
│   ├── components/
│   │   ├── mod.rs
│   │   ├── sidebar.rs
│   │   ├── header.rs
│   │   ├── status_card.rs
│   │   ├── metrics_card.rs
│   │   ├── performance_card.rs
│   │   ├── messages_widget.rs
│   │   └── logs_widget.rs
│   ├── pages/
│   │   ├── mod.rs
│   │   ├── dashboard.rs
│   │   ├── messages.rs
│   │   ├── analytics.rs
│   │   ├── settings.rs
│   │   └── logs.rs
│   ├── api/
│   │   ├── mod.rs
│   │   ├── client.rs
│   │   └── websocket.rs
│   └── state/
│       ├── mod.rs
│       ├── app_state.rs
│       └── store.rs
├── Cargo.toml
└── style/
    └── main.css
```

---

## 🎨 Características Principales

### 1. **Componentes Reactivos**

```rust
#[component]
fn StatusCard() -> impl IntoView {
    let (status, set_status) = create_signal("Conectando...");
    
    // Efecto que se ejecuta cuando cambia status
    create_effect(move |_| {
        let s = status();
        logging::log!("Status changed: {}", s);
    });
    
    view! {
        <div class="card">
            <h2>"Estado"</h2>
            <p>{status}</p>
        </div>
    }
}
```

### 2. **WebSocket en Tiempo Real**

```rust
#[component]
fn MessagesWidget() -> impl IntoView {
    let (messages, set_messages) = create_signal(vec![]);
    
    // Conectar WebSocket al montar
    create_effect(move |_| {
        spawn_local(async move {
            let ws = connect_websocket("/ws/messages").await;
            ws.on_message(|msg| {
                set_messages.update(|msgs| msgs.push(msg));
            });
        });
    });
    
    view! {
        <div class="messages">
            <For each=messages key=|msg| msg.id let:msg>
                <Message message=msg/>
            </For>
        </div>
    }
}
```

### 3. **Gráficos y Estadísticas**

```rust
#[component]
fn AnalyticsPage() -> impl IntoView {
    let (data, set_data) = create_signal(vec![]);
    
    // Cargar datos del API
    create_effect(move |_| {
        spawn_local(async move {
            let stats = fetch_analytics().await;
            set_data(stats);
        });
    });
    
    view! {
        <div class="analytics">
            <Chart data=data/>
            <StatsList data=data/>
        </div>
    }
}
```

### 4. **Filtros Avanzados**

```rust
#[component]
fn MessagesPage() -> impl IntoView {
    let (filter, set_filter) = create_signal(MessageFilter::default());
    let (messages, set_messages) = create_signal(vec![]);
    
    // Filtrar automáticamente cuando cambia el filtro
    create_effect(move |_| {
        spawn_local(async move {
            let f = filter();
            let msgs = fetch_messages_filtered(f).await;
            set_messages(msgs);
        });
    });
    
    view! {
        <div>
            <FilterBar on_change=set_filter/>
            <MessagesList messages=messages/>
        </div>
    }
}
```

### 5. **Exportación de Datos**

```rust
#[component]
fn ExportButton() -> impl IntoView {
    let export = move |_| {
        spawn_local(async move {
            let data = fetch_all_data().await;
            let csv = convert_to_csv(data);
            download_file("messages.csv", csv);
        });
    };
    
    view! {
        <button on:click=export>
            "📥 Exportar CSV"
        </button>
    }
}
```

---

## 📦 Instalación

### 1. Instalar Leptos CLI

```bash
cargo install leptos_cli
```

### 2. Crear proyecto

```bash
cd src-rs-performance
leptos new --ssr dashboard-leptos
cd dashboard-leptos
```

### 3. Instalar dependencias

```bash
cargo build
```

### 4. Desarrollo

```bash
leptos watch
```

### 5. Producción

```bash
leptos build --release
```

---

## 🛠️ Desarrollo

### Estructura de Componentes

```rust
// Componente simple
#[component]
fn MyComponent(
    #[prop(default = "Default".to_string())]
    title: String,
) -> impl IntoView {
    view! {
        <div>
            <h1>{title}</h1>
        </div>
    }
}

// Componente con estado
#[component]
fn Counter() -> impl IntoView {
    let (count, set_count) = create_signal(0);
    
    view! {
        <button on:click=move |_| set_count(count() + 1)>
            "Count: " {count}
        </button>
    }
}

// Componente con efectos
#[component]
fn DataFetcher() -> impl IntoView {
    let (data, set_data) = create_signal(None);
    
    create_effect(move |_| {
        spawn_local(async move {
            let result = fetch_data().await;
            set_data(Some(result));
        });
    });
    
    view! {
        <Suspense fallback=move || view! { <p>"Cargando..."</p> }>
            {move || data().map(|d| view! { <div>{d}</div> })}
        </Suspense>
    }
}
```

### API Client

```rust
// src/api/client.rs
use leptos::*;

#[derive(Clone)]
pub struct ApiClient {
    base_url: String,
}

impl ApiClient {
    pub fn new(base_url: String) -> Self {
        Self { base_url }
    }
    
    pub async fn get_health(&self) -> Result<HealthResponse, String> {
        let url = format!("{}/health", self.base_url);
        let response = gloo_net::http::Request::get(&url)
            .send()
            .await
            .map_err(|e| e.to_string())?;
        
        response.json().await.map_err(|e| e.to_string())
    }
    
    pub async fn send_message(&self, to: String, text: String) -> Result<(), String> {
        let url = format!("{}/send", self.base_url);
        gloo_net::http::Request::post(&url)
            .json(&SendRequest { to, text })
            .map_err(|e| e.to_string())?
            .send()
            .await
            .map_err(|e| e.to_string())?;
        
        Ok(())
    }
}

// Proporcionar globalmente
pub fn provide_api_client() {
    let client = ApiClient::new("http://localhost:3009".to_string());
    provide_context(client);
}
```

### WebSocket

```rust
// src/api/websocket.rs
use leptos::*;

pub async fn connect_websocket(url: &str) -> Result<WebSocket, String> {
    let ws = gloo_net::websocket::futures::WebSocket::open(url)
        .map_err(|e| format!("WebSocket error: {:?}", e))?;
    
    Ok(ws)
}

#[component]
fn RealtimeMessages() -> impl IntoView {
    let (messages, set_messages) = create_signal(vec![]);
    
    create_effect(move |_| {
        spawn_local(async move {
            match connect_websocket("ws://localhost:3009/ws/messages").await {
                Ok(ws) => {
                    let (mut read, _write) = ws.split();
                    while let Some(msg) = read.next().await {
                        if let Ok(msg) = msg {
                            if let Ok(text) = msg.to_string() {
                                if let Ok(parsed) = serde_json::from_str(&text) {
                                    set_messages.update(|msgs| msgs.push(parsed));
                                }
                            }
                        }
                    }
                }
                Err(e) => logging::error!("WebSocket error: {}", e),
            }
        });
    });
    
    view! {
        <div class="messages">
            <For each=messages key=|msg| msg.id let:msg>
                <MessageCard message=msg/>
            </For>
        </div>
    }
}
```

---

## 📊 Páginas Principales

### 1. Dashboard (Home)
- Estado del bot
- Métricas en tiempo real
- Gráficos de performance
- Últimos mensajes

### 2. Mensajes
- Lista completa de mensajes
- Filtros avanzados
- Búsqueda
- Exportación CSV

### 3. Analytics
- Gráficos de estadísticas
- Tendencias
- Reportes
- Comparativas

### 4. Logs
- Logs del sistema
- Filtros por nivel
- Búsqueda
- Exportación

### 5. Settings
- Configuración del bot
- Adaptador activo
- Variables de entorno
- Preferencias

---

## 🎓 Próximos Pasos

1. **Instalar Leptos CLI**
   ```bash
   cargo install leptos_cli
   ```

2. **Crear proyecto**
   ```bash
   leptos new --ssr dashboard-leptos
   ```

3. **Desarrollar componentes**
   - Sidebar
   - Header
   - Cards
   - Widgets

4. **Integrar API**
   - Client HTTP
   - WebSocket
   - Manejo de errores

5. **Estilos**
   - CSS/SCSS
   - Responsive
   - Temas

6. **Deploy**
   - Build release
   - Servir con Axum
   - Monitoreo

---

**Versión:** 5.2.0  
**Framework:** Leptos 0.5  
**Última actualización:** 2025-11-14
