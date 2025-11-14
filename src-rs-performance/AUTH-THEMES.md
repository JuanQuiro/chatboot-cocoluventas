# 🔐 Autenticación Completa + Temas Avanzados

## 📋 Índice

1. [Autenticación](#autenticación)
2. [Temas](#temas)
3. [Interfaz Simple vs Avanzada](#interfaz)
4. [Implementación](#implementación)

---

## 🔐 Autenticación Completa

### Login Profesional

```rust
#[component]
fn LoginPage() -> impl IntoView {
    let (email, set_email) = create_signal(String::new());
    let (password, set_password) = create_signal(String::new());
    let (error, set_error) = create_signal(None::<String>);
    let (loading, set_loading) = create_signal(false);
    
    let login = move |_| {
        set_loading(true);
        let email_val = email();
        let password_val = password();
        
        spawn_local(async move {
            match authenticate(&email_val, &password_val).await {
                Ok(token) => {
                    // Guardar token
                    store_token(&token);
                    // Redirigir
                    navigate("/dashboard", Default::default());
                }
                Err(e) => {
                    set_error(Some(e));
                    set_loading(false);
                }
            }
        });
    };
    
    view! {
        <div class="login-container">
            <div class="login-card">
                <h1>"🤖 Cocolu Bot"</h1>
                <p>"Dashboard Profesional"</p>
                
                <form on:submit=move |ev| {
                    ev.prevent_default();
                    login(&());
                }>
                    <div class="form-group">
                        <label>"Email"</label>
                        <input 
                            type="email"
                            placeholder="tu@email.com"
                            on:change=move |ev| set_email(event_target_value(&ev))
                        />
                    </div>
                    
                    <div class="form-group">
                        <label>"Contraseña"</label>
                        <input 
                            type="password"
                            placeholder="••••••••"
                            on:change=move |ev| set_password(event_target_value(&ev))
                        />
                    </div>
                    
                    {move || error().map(|e| view! {
                        <div class="error-message">{e}</div>
                    })}
                    
                    <button 
                        type="submit"
                        disabled=loading
                        class="login-btn"
                    >
                        {move || if loading() { "Conectando..." } else { "Iniciar Sesión" }}
                    </button>
                </form>
                
                <div class="login-footer">
                    <a href="/forgot-password">"¿Olvidaste tu contraseña?"</a>
                    <a href="/register">"Crear cuenta"</a>
                </div>
            </div>
        </div>
    }
}
```

### JWT Authentication

```rust
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct Claims {
    pub sub: String,        // user_id
    pub email: String,
    pub roles: Vec<String>,
    pub exp: i64,
    pub iat: i64,
}

pub struct JwtManager {
    secret: String,
}

impl JwtManager {
    pub fn new(secret: String) -> Self {
        Self { secret }
    }
    
    pub fn generate_token(&self, user_id: &str, email: &str, roles: Vec<String>) -> Result<String> {
        let now = chrono::Local::now().timestamp();
        let exp = now + (24 * 60 * 60); // 24 horas
        
        let claims = Claims {
            sub: user_id.to_string(),
            email: email.to_string(),
            roles,
            exp,
            iat: now,
        };
        
        // Usar librería jsonwebtoken
        jsonwebtoken::encode(
            &jsonwebtoken::Header::default(),
            &claims,
            &jsonwebtoken::EncodingKey::from_secret(self.secret.as_ref()),
        ).map_err(|e| format!("JWT error: {}", e))
    }
    
    pub fn validate_token(&self, token: &str) -> Result<Claims> {
        jsonwebtoken::decode(
            token,
            &jsonwebtoken::DecodingKey::from_secret(self.secret.as_ref()),
            &jsonwebtoken::Validation::default(),
        )
        .map(|data| data.claims)
        .map_err(|e| format!("Invalid token: {}", e))
    }
}
```

### Roles y Permisos

```rust
#[derive(Clone, Debug, PartialEq)]
pub enum Role {
    Admin,
    Manager,
    User,
    Viewer,
}

impl Role {
    pub fn permissions(&self) -> Vec<&'static str> {
        match self {
            Role::Admin => vec![
                "view_dashboard",
                "edit_settings",
                "manage_users",
                "export_data",
                "delete_messages",
            ],
            Role::Manager => vec![
                "view_dashboard",
                "edit_settings",
                "export_data",
            ],
            Role::User => vec![
                "view_dashboard",
                "export_data",
            ],
            Role::Viewer => vec![
                "view_dashboard",
            ],
        }
    }
    
    pub fn can(&self, permission: &str) -> bool {
        self.permissions().contains(&permission)
    }
}

#[component]
fn ProtectedComponent(
    required_role: Role,
    children: Children,
) -> impl IntoView {
    let (user_role, _) = create_signal(Role::User);
    
    view! {
        {move || {
            if user_role().can(&format!("{:?}", required_role)) {
                view! { {children()} }.into_view()
            } else {
                view! { <div class="access-denied">"Acceso denegado"</div> }.into_view()
            }
        }}
    }
}
```

---

## 🎨 Temas Avanzados

### Temas Disponibles

```rust
#[derive(Clone, Debug, PartialEq)]
pub enum Theme {
    Light,
    Dark,
    HighContrast,
    Custom(CustomTheme),
}

#[derive(Clone, Debug)]
pub struct CustomTheme {
    pub primary: String,
    pub secondary: String,
    pub background: String,
    pub text: String,
    pub accent: String,
}

impl CustomTheme {
    pub fn to_css(&self) -> String {
        format!(
            r#"
            :root {{
                --primary: {};
                --secondary: {};
                --background: {};
                --text: {};
                --accent: {};
            }}
            "#,
            self.primary, self.secondary, self.background, self.text, self.accent
        )
    }
}
```

### Selector de Temas

```rust
#[component]
fn ThemeSelector() -> impl IntoView {
    let (theme, set_theme) = create_signal(Theme::Light);
    
    view! {
        <div class="theme-selector">
            <h3>"🎨 Tema"</h3>
            
            <div class="theme-options">
                <button 
                    on:click=move |_| set_theme(Theme::Light)
                    class=move || if theme() == Theme::Light { "active" } else { "" }
                >
                    "☀️ Claro"
                </button>
                
                <button 
                    on:click=move |_| set_theme(Theme::Dark)
                    class=move || if theme() == Theme::Dark { "active" } else { "" }
                >
                    "🌙 Oscuro"
                </button>
                
                <button 
                    on:click=move |_| set_theme(Theme::HighContrast)
                    class=move || if theme() == Theme::HighContrast { "active" } else { "" }
                >
                    "⚫ Alto Contraste"
                </button>
                
                <button 
                    on:click=move |_| set_theme(Theme::Custom(CustomTheme::default()))
                >
                    "🎨 Personalizado"
                </button>
            </div>
            
            {move || match theme() {
                Theme::Custom(_) => view! {
                    <ColorPicker on_change=move |colors| {
                        set_theme(Theme::Custom(colors));
                    }/>
                }.into_view(),
                _ => view! { <></> }.into_view(),
            }}
        </div>
    }
}
```

### Color Picker Personalizado

```rust
#[component]
fn ColorPicker(on_change: Callback<CustomTheme>) -> impl IntoView {
    let (primary, set_primary) = create_signal("#667eea".to_string());
    let (secondary, set_secondary) = create_signal("#764ba2".to_string());
    let (background, set_background) = create_signal("#ffffff".to_string());
    let (text, set_text) = create_signal("#333333".to_string());
    let (accent, set_accent) = create_signal("#10b981".to_string());
    
    let update = move |_| {
        on_change(CustomTheme {
            primary: primary(),
            secondary: secondary(),
            background: background(),
            text: text(),
            accent: accent(),
        });
    };
    
    view! {
        <div class="color-picker">
            <div class="color-input">
                <label>"Color Primario"</label>
                <input 
                    type="color"
                    value=primary
                    on:change=move |ev| {
                        set_primary(event_target_value(&ev));
                        update(&());
                    }
                />
            </div>
            
            <div class="color-input">
                <label>"Color Secundario"</label>
                <input 
                    type="color"
                    value=secondary
                    on:change=move |ev| {
                        set_secondary(event_target_value(&ev));
                        update(&());
                    }
                />
            </div>
            
            <div class="color-input">
                <label>"Fondo"</label>
                <input 
                    type="color"
                    value=background
                    on:change=move |ev| {
                        set_background(event_target_value(&ev));
                        update(&());
                    }
                />
            </div>
            
            <div class="color-input">
                <label>"Texto"</label>
                <input 
                    type="color"
                    value=text
                    on:change=move |ev| {
                        set_text(event_target_value(&ev));
                        update(&());
                    }
                />
            </div>
            
            <div class="color-input">
                <label>"Acento"</label>
                <input 
                    type="color"
                    value=accent
                    on:change=move |ev| {
                        set_accent(event_target_value(&ev));
                        update(&());
                    }
                />
            </div>
        </div>
    }
}
```

---

## 🎯 Interfaz Simple vs Avanzada

### Modo Simple

```rust
#[component]
fn SimpleDashboard() -> impl IntoView {
    view! {
        <div class="simple-mode">
            <h1>"Dashboard"</h1>
            
            <div class="simple-grid">
                <Card title="Estado" value="Conectado"/>
                <Card title="Mensajes" value="150"/>
                <Card title="Usuarios" value="45"/>
            </div>
            
            <MessagesSimple/>
        </div>
    }
}
```

### Modo Avanzado

```rust
#[component]
fn AdvancedDashboard() -> impl IntoView {
    view! {
        <div class="advanced-mode">
            <AdvancedFilters/>
            
            <div class="advanced-grid">
                <LineChart/>
                <BarChart/>
                <PieChart/>
                <HeatMap/>
            </div>
            
            <AdvancedAnalytics/>
            <MLPredictions/>
            <ExportPanel/>
        </div>
    }
}
```

### Toggle Simple/Avanzado

```rust
#[component]
fn ModeToggle() -> impl IntoView {
    let (advanced_mode, set_advanced_mode) = create_signal(false);
    
    view! {
        <div class="mode-toggle">
            <button 
                on:click=move |_| set_advanced_mode(false)
                class=move || if !advanced_mode() { "active" } else { "" }
            >
                "📊 Simple"
            </button>
            
            <button 
                on:click=move |_| set_advanced_mode(true)
                class=move || if advanced_mode() { "active" } else { "" }
            >
                "🔧 Avanzado"
            </button>
        </div>
    }
}
```

---

## 🔧 Implementación

### Backend (Axum)

```rust
// Endpoint de login
#[post("/auth/login")]
async fn login(
    Json(credentials): Json<LoginRequest>,
) -> Result<Json<LoginResponse>> {
    let user = validate_credentials(&credentials.email, &credentials.password).await?;
    let token = jwt_manager.generate_token(&user.id, &user.email, user.roles)?;
    
    Ok(Json(LoginResponse { token }))
}

// Middleware de autenticación
#[derive(Clone)]
pub struct AuthMiddleware;

#[async_trait]
impl<S> Middleware<S> for AuthMiddleware
where
    S: Clone + Send + Sync + 'static,
{
    async fn handle(
        &self,
        req: Request,
        next: Next,
    ) -> Result<Response> {
        let token = extract_token(&req)?;
        let claims = jwt_manager.validate_token(&token)?;
        
        req.extensions_mut().insert(claims);
        Ok(next.run(req).await)
    }
}
```

### Frontend (Leptos)

```rust
// Proveedor de contexto de autenticación
#[component]
fn AuthProvider(children: Children) -> impl IntoView {
    let (user, set_user) = create_signal(None::<User>);
    let (token, set_token) = create_signal(None::<String>);
    
    provide_context(AuthContext { user, token });
    
    view! { {children()} }
}

// Hook de autenticación
pub fn use_auth() -> AuthContext {
    use_context::<AuthContext>()
        .expect("use_auth must be used within AuthProvider")
}
```

---

## 📊 Flujo de Autenticación

```
1. Usuario accede a /login
   ↓
2. Ingresa email y contraseña
   ↓
3. Frontend envía POST /auth/login
   ↓
4. Backend valida credenciales
   ↓
5. Backend genera JWT token
   ↓
6. Frontend almacena token en localStorage
   ↓
7. Frontend redirige a /dashboard
   ↓
8. Cada request incluye token en header Authorization
   ↓
9. Backend valida token con middleware
   ↓
10. Usuario accede a recursos protegidos
```

---

## 🎨 Temas CSS

### Light Theme

```css
:root {
    --primary: #667eea;
    --secondary: #764ba2;
    --background: #ffffff;
    --text: #333333;
    --accent: #10b981;
}
```

### Dark Theme

```css
:root {
    --primary: #667eea;
    --secondary: #764ba2;
    --background: #1e1e1e;
    --text: #ffffff;
    --accent: #10b981;
}
```

### High Contrast

```css
:root {
    --primary: #000000;
    --secondary: #ffffff;
    --background: #ffffff;
    --text: #000000;
    --accent: #ffff00;
}
```

---

**Versión:** 5.2.0  
**Estado:** ✅ Auth + Temas Completos
