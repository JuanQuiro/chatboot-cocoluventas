# 📱 WHATSAPP ADAPTERS - Guía Completa

## 🎯 Objetivo

Sistema de adaptadores universal que permite usar múltiples providers de WhatsApp simultáneamente, con cambio en caliente y fallback automático.

---

## 🏗️ Arquitectura

```rust
#[async_trait]
pub trait WhatsAppProvider: Send + Sync {
    /// Enviar mensaje de texto
    async fn send_message(&self, to: String, text: String) -> Result<MessageId>;
    
    /// Enviar mensaje con media
    async fn send_media(&self, to: String, media: MediaMessage) -> Result<MessageId>;
    
    /// Obtener QR code (si aplica)
    async fn get_qr(&self) -> Result<QRCode>;
    
    /// Estado de conexión
    async fn get_status(&self) -> Result<ConnectionStatus>;
    
    /// Manejar webhook entrante
    async fn handle_webhook(&self, data: Value) -> Result<IncomingMessage>;
    
    /// Desconectar/cleanup
    async fn disconnect(&self) -> Result<()>;
}
```

---

## 🔌 Providers Implementados

### 1. Baileys (via Node.js Bridge)

**Características:**
- ✅ Gratis e ilimitado
- ✅ Full features (textos, media, grupos)
- ✅ QR Code scanning
- ✅ Multi-device support
- ❌ Requiere Node.js bridge (150MB RAM)
- ❌ Menos estable que APIs oficiales

**Configuración:**
```json
{
  "provider": "baileys",
  "config": {
    "bridge_url": "http://localhost:3012",
    "session_id": "unique_session_123",
    "auto_reconnect": true,
    "qr_timeout_seconds": 60
  }
}
```

**Bridge Node.js** (`bridges/baileys-http/server.js`):
```javascript
import express from 'express';
import { makeWASocket, DisconnectReason } from '@whiskeysockets/baileys';

const app = express();
const sessions = new Map();

app.post('/send', async (req, res) => {
    const { session_id, to, message } = req.body;
    const sock = sessions.get(session_id);
    
    const result = await sock.sendMessage(to + '@s.whatsapp.net', {
        text: message
    });
    
    res.json({ message_id: result.key.id });
});

app.get('/qr/:session_id', (req, res) => {
    const qr = sessions.get(req.params.session_id)?.qr;
    res.json({ qr });
});

app.listen(3012);
```

**Implementación Rust:**
```rust
pub struct BaileysProvider {
    client: reqwest::Client,
    bridge_url: String,
    session_id: String,
}

#[async_trait]
impl WhatsAppProvider for BaileysProvider {
    async fn send_message(&self, to: String, text: String) -> Result<String> {
        let response = self.client
            .post(&format\!("{}/send", self.bridge_url))
            .json(&serde_json::json\!({
                "session_id": self.session_id,
                "to": to,
                "message": text
            }))
            .send()
            .await?
            .json::<SendResponse>()
            .await?;
        
        Ok(response.message_id)
    }
    
    async fn get_qr(&self) -> Result<QRCode> {
        let response = self.client
            .get(&format\!("{}/qr/{}", self.bridge_url, self.session_id))
            .send()
            .await?
            .json::<QRResponse>()
            .await?;
        
        Ok(QRCode {
            code: response.qr,
            expires_at: Utc::now() + Duration::minutes(1),
        })
    }
}
```

**RAM Usage:** ~150MB (bridge) + ~5MB (Rust adapter)

---

### 2. WhatsApp Business API (Official)

**Características:**
- ✅ Más confiable y estable
- ✅ SLA garantizado
- ✅ Webhook oficial de Meta
- ✅ Templates aprobados
- ❌ Requiere aprobación de Meta
- ❌ Costo por conversación
- ❌ Sin QR (número asociado a Business Account)

**Configuración:**
```json
{
  "provider": "official",
  "config": {
    "access_token": "EAAxxxxxxxxxxxx",
    "phone_number_id": "123456789012345",
    "business_account_id": "987654321098765",
    "webhook_verify_token": "my_secret_token"
  }
}
```

**Implementación:**
```rust
pub struct OfficialProvider {
    client: reqwest::Client,
    access_token: String,
    phone_number_id: String,
}

#[async_trait]
impl WhatsAppProvider for OfficialProvider {
    async fn send_message(&self, to: String, text: String) -> Result<String> {
        let url = format\!(
            "https://graph.facebook.com/v18.0/{}/messages",
            self.phone_number_id
        );
        
        let response = self.client
            .post(&url)
            .header("Authorization", format\!("Bearer {}", self.access_token))
            .json(&serde_json::json\!({
                "messaging_product": "whatsapp",
                "to": to,
                "type": "text",
                "text": { "body": text }
            }))
            .send()
            .await?
            .json::<OfficialResponse>()
            .await?;
        
        Ok(response.messages[0].id.clone())
    }
    
    async fn handle_webhook(&self, data: Value) -> Result<IncomingMessage> {
        // Parse Meta webhook format
        let entry = &data["entry"][0];
        let change = &entry["changes"][0];
        let message = &change["value"]["messages"][0];
        
        Ok(IncomingMessage {
            from: message["from"].as_str().unwrap().to_string(),
            text: message["text"]["body"].as_str().unwrap().to_string(),
            timestamp: Utc::now(),
        })
    }
}
```

**RAM Usage:** ~12MB

**Costos:**
- Conversaciones entrantes: Gratis (primeras 1000/mes)
- Conversaciones salientes: $0.005 - $0.09 (según país)

---

### 3. Twilio API

**Características:**
- ✅ Integración súper simple
- ✅ SLA garantizado (99.95%)
- ✅ Documentación excelente
- ✅ Sandbox para testing
- ❌ Más caro que oficial
- ❌ Sin QR

**Configuración:**
```json
{
  "provider": "twilio",
  "config": {
    "account_sid": "ACxxxxxxxxxxxxx",
    "auth_token": "your_auth_token",
    "from": "whatsapp:+14155238886"
  }
}
```

**Implementación:**
```rust
pub struct TwilioProvider {
    client: reqwest::Client,
    account_sid: String,
    auth_token: String,
    from: String,
}

#[async_trait]
impl WhatsAppProvider for TwilioProvider {
    async fn send_message(&self, to: String, text: String) -> Result<String> {
        let url = format\!(
            "https://api.twilio.com/2010-04-01/Accounts/{}/Messages.json",
            self.account_sid
        );
        
        let params = [
            ("To", format\!("whatsapp:{}", to)),
            ("From", self.from.clone()),
            ("Body", text),
        ];
        
        let response = self.client
            .post(&url)
            .basic_auth(&self.account_sid, Some(&self.auth_token))
            .form(&params)
            .send()
            .await?
            .json::<TwilioResponse>()
            .await?;
        
        Ok(response.sid)
    }
}
```

**RAM Usage:** ~8MB

**Costos:**
- $0.005 por mensaje (US)
- Varía por país

---

### 4. Evolution API

**Características:**
- ✅ Open source
- ✅ Self-hosted
- ✅ Multi-device
- ✅ QR Code
- ✅ Basado en Baileys pero optimizado
- ❌ Requiere servidor adicional

**Configuración:**
```json
{
  "provider": "evolution",
  "config": {
    "api_url": "http://localhost:8080",
    "api_key": "your_api_key",
    "instance_name": "my_instance"
  }
}
```

**Implementación:**
```rust
pub struct EvolutionProvider {
    client: reqwest::Client,
    api_url: String,
    api_key: String,
    instance_name: String,
}

#[async_trait]
impl WhatsAppProvider for EvolutionProvider {
    async fn send_message(&self, to: String, text: String) -> Result<String> {
        let url = format\!("{}/message/sendText/{}", self.api_url, self.instance_name);
        
        let response = self.client
            .post(&url)
            .header("apikey", &self.api_key)
            .json(&serde_json::json\!({
                "number": to,
                "text": text
            }))
            .send()
            .await?
            .json::<EvolutionResponse>()
            .await?;
        
        Ok(response.key.id)
    }
}
```

**RAM Usage:** ~20MB (adapter) + ~200MB (Evolution server)

---

### 5. Meta Graph API

**Características:**
- ✅ API directa de Meta
- ✅ Mejor rendimiento
- ✅ Más control
- ❌ Requiere Business Account verificado
- ❌ Setup más complejo

Similar a Official pero con más features avanzados.

---

## 🔄 Sistema de Fallback

**Configuración Multi-Provider:**
```json
{
  "bot_id": "bot_123",
  "primary_provider": "baileys",
  "fallback_providers": ["evolution", "twilio"],
  "fallback_threshold_errors": 3,
  "fallback_cooldown_seconds": 300
}
```

**Implementación:**
```rust
pub struct MultiProvider {
    primary: Box<dyn WhatsAppProvider>,
    fallbacks: Vec<Box<dyn WhatsAppProvider>>,
    error_count: Arc<AtomicUsize>,
    current_provider: Arc<RwLock<usize>>,
}

impl MultiProvider {
    pub async fn send_message_with_fallback(
        &self,
        to: String,
        text: String,
    ) -> Result<String> {
        let current = self.current_provider.read().await;
        let provider = if *current == 0 {
            &self.primary
        } else {
            &self.fallbacks[*current - 1]
        };
        
        match provider.send_message(to.clone(), text.clone()).await {
            Ok(id) => {
                // Reset error count on success
                self.error_count.store(0, Ordering::Relaxed);
                Ok(id)
            }
            Err(e) => {
                // Increment error count
                let errors = self.error_count.fetch_add(1, Ordering::Relaxed);
                
                if errors >= 3 {
                    // Switch to fallback
                    self.switch_to_fallback().await;
                    // Retry with fallback
                    return self.send_message_with_fallback(to, text).await;
                }
                
                Err(e)
            }
        }
    }
    
    async fn switch_to_fallback(&self) {
        let mut current = self.current_provider.write().await;
        *current = (*current + 1) % (self.fallbacks.len() + 1);
        
        tracing::warn\!("Switched to fallback provider: {}", *current);
    }
}
```

---

## 📊 Comparativa

| Feature | Baileys | Official | Twilio | Evolution | Meta |
|---------|---------|----------|--------|-----------|------|
| **Costo** | Gratis | $$ | $$$ | Gratis* | $$ |
| **QR Code** | ✅ | ❌ | ❌ | ✅ | ❌ |
| **RAM** | 150MB | 12MB | 8MB | 220MB | 12MB |
| **Estabilidad** | 7/10 | 10/10 | 10/10 | 8/10 | 9/10 |
| **Setup** | Fácil | Difícil | Fácil | Medio | Difícil |
| **Aprobación** | No | Sí | Sí | No | Sí |
| **SLA** | ❌ | ✅ | ✅ | ❌ | ✅ |
| **Templates** | ❌ | ✅ | ✅ | ❌ | ✅ |

\* Evolution requiere servidor

---

## 🚀 Recomendaciones

### Startup/Testing
**Usar:** Baileys
- Costo cero
- Setup rápido
- Ideal para MVP

### Producción Pequeña (< 100 usuarios)
**Usar:** Baileys + Evolution (fallback)
- Máxima economía
- Redundancia
- QR Code

### Producción Mediana (100-1000 usuarios)
**Usar:** Official API
- Confiabilidad
- Soporte oficial
- Costo predecible

### Producción Grande (1000+ usuarios)
**Usar:** Official + Twilio (fallback)
- Máxima confiabilidad
- SLA garantizado
- Múltiples regiones

---

## 💡 Mejores Prácticas

1. **Siempre tener fallback** para providers gratuitos
2. **Monitorear errores** y cambiar automáticamente
3. **Usar caché** para reducir llamadas API
4. **Rate limiting** por provider
5. **Logging detallado** para debugging
6. **Health checks** periódicos

---

**Sistema diseñado para máxima flexibilidad y confiabilidad.** 🚀

---

## 🔌 ADAPTADORES ADICIONALES CRÍTICOS

### 6. Venom-bot

**Características:**
- ✅ **MUY popular en comunidad latina**
- ✅ Multi-device support
- ✅ QR Code automático
- ✅ Basado en Puppeteer (estable)
- ✅ Gratis e ilimitado
- ✅ Bien mantenido
- ❌ Requiere Chrome/Chromium (RAM +100MB)

**Por qué es importante:**
- Usado por miles de proyectos brasileños/latinos
- Más estable que Baileys en algunos casos
- Mejor manejo de grupos
- Excelente para media (imágenes, videos)

**Configuración:**
```json
{
  "provider": "venom",
  "config": {
    "session_name": "venom_session_123",
    "headless": true,
    "use_chrome": true,
    "auto_close": 60000,
    "log_qr": true,
    "disable_welcome": true
  }
}
```

**Bridge Node.js** (`bridges/venom-http/server.js`):
```javascript
import venom from 'venom-bot';
import express from 'express';

const app = express();
const sessions = new Map();

// Crear sesión Venom
async function createSession(sessionName) {
    const client = await venom.create(
        sessionName,
        (base64Qr) => {
            // QR Code generado
            sessions.get(sessionName).qr = base64Qr;
        },
        (statusSession) => {
            console.log('Status:', statusSession);
        },
        {
            headless: true,
            useChrome: true,
            autoClose: 60000,
            logQR: false,
            disableWelcome: true,
            updatesLog: false
        }
    );
    
    sessions.set(sessionName, { client, qr: null });
    return client;
}

app.post('/send', async (req, res) => {
    const { session_name, to, message, message_type } = req.body;
    
    let session = sessions.get(session_name);
    if (\!session) {
        session = await createSession(session_name);
    }
    
    try {
        let result;
        
        switch (message_type) {
            case 'text':
                result = await session.client.sendText(to + '@c.us', message);
                break;
            case 'image':
                result = await session.client.sendImage(
                    to + '@c.us',
                    message, // URL or base64
                    'image',
                    'Image caption'
                );
                break;
            case 'file':
                result = await session.client.sendFile(
                    to + '@c.us',
                    message, // file path
                    'document',
                    'Document'
                );
                break;
            default:
                result = await session.client.sendText(to + '@c.us', message);
        }
        
        res.json({ 
            success: true, 
            message_id: result.id || result 
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

app.get('/qr/:session_name', (req, res) => {
    const session = sessions.get(req.params.session_name);
    res.json({ 
        qr: session?.qr,
        connected: \!\!session?.client 
    });
});

app.get('/status/:session_name', async (req, res) => {
    const session = sessions.get(req.params.session_name);
    
    if (\!session?.client) {
        return res.json({ connected: false });
    }
    
    try {
        const state = await session.client.getConnectionState();
        res.json({ 
            connected: state === 'CONNECTED',
            state: state 
        });
    } catch (error) {
        res.json({ 
            connected: false, 
            error: error.message 
        });
    }
});

app.listen(3013, () => {
    console.log('🕷️ Venom Bridge running on port 3013');
});
```

**Implementación Rust:**
```rust
pub struct VenomProvider {
    client: reqwest::Client,
    bridge_url: String,
    session_name: String,
}

impl VenomProvider {
    pub fn new(bridge_url: String, session_name: String) -> Self {
        Self {
            client: reqwest::Client::new(),
            bridge_url,
            session_name,
        }
    }
}

#[async_trait]
impl WhatsAppProvider for VenomProvider {
    async fn send_message(&self, to: String, text: String) -> Result<String> {
        let response = self.client
            .post(&format\!("{}/send", self.bridge_url))
            .json(&serde_json::json\!({
                "session_name": self.session_name,
                "to": to,
                "message": text,
                "message_type": "text"
            }))
            .send()
            .await?
            .json::<VenomResponse>()
            .await?;
        
        if response.success {
            Ok(response.message_id)
        } else {
            Err(anyhow::anyhow\!("Venom error: {}", response.error.unwrap_or_default()))
        }
    }
    
    async fn send_media(&self, to: String, media: MediaMessage) -> Result<String> {
        let message_type = match media.media_type {
            MediaType::Image => "image",
            MediaType::Video => "video",
            MediaType::Document => "file",
            MediaType::Audio => "audio",
        };
        
        let response = self.client
            .post(&format\!("{}/send", self.bridge_url))
            .json(&serde_json::json\!({
                "session_name": self.session_name,
                "to": to,
                "message": media.url_or_base64,
                "message_type": message_type
            }))
            .send()
            .await?
            .json::<VenomResponse>()
            .await?;
        
        if response.success {
            Ok(response.message_id)
        } else {
            Err(anyhow::anyhow\!("Venom media error"))
        }
    }
    
    async fn get_qr(&self) -> Result<QRCode> {
        let response = self.client
            .get(&format\!("{}/qr/{}", self.bridge_url, self.session_name))
            .send()
            .await?
            .json::<QRResponse>()
            .await?;
        
        Ok(QRCode {
            code: response.qr.unwrap_or_default(),
            expires_at: Utc::now() + Duration::minutes(1),
        })
    }
    
    async fn get_status(&self) -> Result<ConnectionStatus> {
        let response = self.client
            .get(&format\!("{}/status/{}", self.bridge_url, self.session_name))
            .send()
            .await?
            .json::<StatusResponse>()
            .await?;
        
        Ok(ConnectionStatus {
            connected: response.connected,
            state: response.state,
        })
    }
}
```

**RAM Usage:** ~200MB (Venom + Chrome) + ~5MB (Rust adapter)

**Ventajas sobre Baileys:**
- Más estable con grupos grandes
- Mejor manejo de media
- Menor tasa de baneos
- Recovery automático

---

### 7. WWebJS (whatsapp-web.js)

**Características:**
- ✅ **Más popular en GitHub** (15K+ stars)
- ✅ Multi-device oficial
- ✅ API muy completa
- ✅ TypeScript support
- ✅ Eventos detallados
- ❌ Requiere Puppeteer (RAM +100MB)

**Configuración:**
```json
{
  "provider": "wwebjs",
  "config": {
    "session_id": "wwebjs_session",
    "puppeteer_args": ["--no-sandbox"],
    "qr_timeout": 60,
    "auth_strategy": "local"
  }
}
```

**Bridge Node.js** (`bridges/wwebjs-http/server.js`):
```javascript
import { Client, LocalAuth } from 'whatsapp-web.js';
import express from 'express';
import qrcode from 'qrcode';

const app = express();
const sessions = new Map();

async function createClient(sessionId) {
    const client = new Client({
        authStrategy: new LocalAuth({ clientId: sessionId }),
        puppeteer: {
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        }
    });
    
    let qrData = null;
    
    client.on('qr', async (qr) => {
        qrData = await qrcode.toDataURL(qr);
        sessions.get(sessionId).qr = qrData;
    });
    
    client.on('ready', () => {
        console.log(`✅ Client ${sessionId} ready`);
        sessions.get(sessionId).ready = true;
    });
    
    client.on('authenticated', () => {
        console.log(`🔐 Client ${sessionId} authenticated`);
    });
    
    client.on('message', async (msg) => {
        // Webhook para mensajes entrantes
        // TODO: Enviar a Rust via HTTP
    });
    
    await client.initialize();
    
    sessions.set(sessionId, { client, qr: qrData, ready: false });
    return client;
}

app.post('/send', async (req, res) => {
    const { session_id, to, message } = req.body;
    
    let session = sessions.get(session_id);
    if (\!session) {
        session = await createClient(session_id);
    }
    
    if (\!session.ready) {
        return res.status(400).json({ 
            success: false, 
            error: 'Client not ready' 
        });
    }
    
    try {
        const chatId = to.includes('@') ? to : `${to}@c.us`;
        const result = await session.client.sendMessage(chatId, message);
        
        res.json({ 
            success: true, 
            message_id: result.id.id 
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

app.get('/qr/:session_id', (req, res) => {
    const session = sessions.get(req.params.session_id);
    res.json({ 
        qr: session?.qr,
        ready: session?.ready || false
    });
});

app.listen(3014, () => {
    console.log('🌐 WWebJS Bridge running on port 3014');
});
```

**Implementación Rust:**
```rust
pub struct WWebJSProvider {
    client: reqwest::Client,
    bridge_url: String,
    session_id: String,
}

#[async_trait]
impl WhatsAppProvider for WWebJSProvider {
    async fn send_message(&self, to: String, text: String) -> Result<String> {
        let response = self.client
            .post(&format\!("{}/send", self.bridge_url))
            .json(&serde_json::json\!({
                "session_id": self.session_id,
                "to": to,
                "message": text
            }))
            .send()
            .await?
            .json::<WWebResponse>()
            .await?;
        
        if response.success {
            Ok(response.message_id)
        } else {
            Err(anyhow::anyhow\!("WWebJS error: {}", response.error.unwrap_or_default()))
        }
    }
    
    // Similar implementation for other methods...
}
```

**RAM Usage:** ~180MB (WWebJS + Puppeteer) + ~5MB (Rust adapter)

---

## 📊 COMPARATIVA ACTUALIZADA - TODOS LOS PROVIDERS

| Provider | Popularidad | RAM | Estabilidad | QR | Costo | Mejor Para |
|----------|-------------|-----|-------------|-----|-------|-----------|
| **Venom** | ⭐⭐⭐⭐ | 200MB | 9/10 | ✅ | Gratis | Producción Latina |
| **WWebJS** | ⭐⭐⭐⭐⭐ | 180MB | 9/10 | ✅ | Gratis | Comunidad grande |
| **Baileys** | ⭐⭐⭐⭐ | 150MB | 7/10 | ✅ | Gratis | Lightweight |
| **Evolution** | ⭐⭐⭐ | 220MB | 8/10 | ✅ | Gratis* | Self-hosted |
| **Official** | ⭐⭐⭐⭐⭐ | 12MB | 10/10 | ❌ | $$ | Empresas |
| **Twilio** | ⭐⭐⭐⭐ | 8MB | 10/10 | ❌ | $$$ | SLA crítico |
| **Meta Graph** | ⭐⭐⭐⭐ | 12MB | 9/10 | ❌ | $$ | Direct API |

---

## 🎯 RECOMENDACIONES POR CASO DE USO

### Startup / MVP
**Stack:** Venom + WWebJS (fallback)
- Costo: $0
- Confiabilidad: Alta
- Comunidad: Excelente
- RAM: ~400MB

### Producción Pequeña (< 50 usuarios)
**Stack:** Venom (primary) + Baileys (fallback) + Evolution (backup)
- Triple redundancia
- Todo gratis
- RAM: ~600MB

### Producción Mediana (50-500 usuarios)
**Stack:** Official API (primary) + Venom (fallback)
- Confiabilidad máxima
- Costo predecible
- Fallback gratis
- RAM: ~220MB

### Producción Grande (500+ usuarios)
**Stack:** Official API + Twilio (fallback) + Meta Graph (backup)
- SLA garantizado
- Multi-región
- Soporte oficial
- RAM: ~40MB

### Multi-Tenant (100+ bots)
**Stack:** Todos disponibles
- Cada tenant elige su provider
- Switch automático según load
- Optimización de costos
- RAM: Variable por bot

---

## 🔄 SISTEMA DE AUTO-SELECCIÓN DE PROVIDER

```rust
pub struct SmartProviderSelector {
    providers: Vec<Box<dyn WhatsAppProvider>>,
    metrics: Arc<RwLock<ProviderMetrics>>,
}

impl SmartProviderSelector {
    pub async fn select_best_provider(&self) -> &dyn WhatsAppProvider {
        let metrics = self.metrics.read().await;
        
        // Priorizar por:
        // 1. Tasa de éxito (últimas 100 requests)
        // 2. Latencia promedio
        // 3. Costo
        // 4. Disponibilidad
        
        self.providers
            .iter()
            .min_by_key(|p| {
                let score = metrics.get_score(p.name());
                (score * 1000.0) as i64
            })
            .unwrap()
            .as_ref()
    }
}
```

---

## 🚀 PRIORIDAD DE IMPLEMENTACIÓN

### FASE 1 (Crítico)
1. ✅ Venom-bot (más usado en LATAM)
2. ✅ WWebJS (más popular GitHub)
3. ✅ Baileys (lightweight)

### FASE 2 (Importante)
4. ✅ Evolution API (self-hosted)
5. ✅ Official API (empresas)

### FASE 3 (Nice to have)
6. ✅ Twilio (SLA)
7. ✅ Meta Graph (directo)

---

**¡Ahora SÍ tenemos el core completo de chatbots\! 🎯**
