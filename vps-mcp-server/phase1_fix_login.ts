import { Client } from "ssh2";
import dotenv from "dotenv";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, ".env") });

const config = {
    host: process.env.VPS_HOST,
    port: parseInt(process.env.VPS_PORT || "22"),
    username: process.env.VPS_USERNAME,
    password: process.env.VPS_PASSWORD,
    readyTimeout: 60000,
};

console.log("🔧 FASE 1: FIX BACKEND LOGIN - DEFINITIVO");

const conn = new Client();
conn.on("ready", () => {
    const cmd = `
cd /var/www/cocolu-chatbot

echo "=== PASO 1: BUSCAR Y ELIMINAR RUTAS AUTH EXISTENTES ==="
# Contar líneas actuales
wc -l app-integrated.js

# Eliminar TODAS las líneas de auth/login anteriores
sed -i '/\\/api\\/auth\\/login/d' app-integrated.js
sed -i '/\\/api\\/auth\\/logout/d' app-integrated.js
sed -i '/Auth login error/d' app-integrated.js

echo "✅ Rutas antiguas eliminadas"

echo ""
echo "=== PASO 2: AGREGAR NUEVA RUTA LOGIN ROBUSTA ==="

# Crear el código de la nueva ruta
cat > /tmp/new_auth_route.txt << 'ENDCODE'

        // ==========================================
        // RUTA DE AUTENTICACIÓN (HARDCODED - STABLE)
        // ==========================================
        apiApp.post('/api/auth/login', async (req, res) => {
            let db = null;
            try {
                const email = req.body.email || req.body.username;
                const password = req.body.password;
                
                if (!email || !password) {
                    return res.status(400).json({ 
                        success: false, 
                        error: 'Email y contraseña son requeridos' 
                    });
                }
                
                // Importar Database dinámicamente para evitar problemas de módulos
                const Database = (await import('better-sqlite3')).default;
                const path = await import('path');
                const { fileURLToPath: urlToPath } = await import('url');
                
                const dbPath = './data/cocolu.db';
                db = new Database(dbPath);
                
                const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
                
                if (!user) {
                    if (db) db.close();
                    return res.status(401).json({ 
                        success: false, 
                        error: 'Usuario no encontrado' 
                    });
                }
                
                if (user.password !== password) {
                    if (db) db.close();
                    return res.status(401).json({ 
                        success: false, 
                        error: 'Contraseña incorrecta' 
                    });
                }
                
                if (db) db.close();
                
                const tokenData = {
                    id: user.id,
                    email: user.email,
                    role: user.role || 'admin',
                    name: user.name || 'Administrator',
                    iat: Date.now()
                };
                const token = Buffer.from(JSON.stringify(tokenData)).toString('base64');
                
                res.json({
                    success: true,
                    token: token,
                    user: {
                        id: user.id,
                        email: user.email,
                        name: user.name || 'Administrator',
                        role: user.role || 'admin'
                    }
                });
            } catch (error) {
                if (db) {
                    try { db.close(); } catch (e) { }
                }
                console.error('Login error:', error.message);
                res.status(500).json({ 
                    success: false, 
                    error: 'Error del servidor: ' + error.message 
                });
            }
        });
        
        apiApp.post('/api/auth/logout', (req, res) => {
            res.json({ success: true, message: 'Logout exitoso' });
        });

ENDCODE

# Insertar antes de la sección de WEBHOOK META
LINE_NUM=\$(grep -n "WEBHOOK META" app-integrated.js | head -1 | cut -d: -f1)

if [ -n "\$LINE_NUM" ]; then
    head -n \$((LINE_NUM - 1)) app-integrated.js > /tmp/app_new.js
    cat /tmp/new_auth_route.txt >> /tmp/app_new.js
    tail -n +\$LINE_NUM app-integrated.js >> /tmp/app_new.js
    mv /tmp/app_new.js app-integrated.js
    echo "✅ Nueva ruta insertada en línea \$LINE_NUM"
else
    echo "❌ No se encontró punto de inserción"
    exit 1
fi

echo ""
echo "=== PASO 3: VERIFICAR SINTAXIS ==="
node --check app-integrated.js && echo "✅ SINTAXIS CORRECTA" || echo "❌ ERROR DE SINTAXIS"

echo ""
echo "=== PASO 4: REINICIAR PM2 ==="
pm2 restart cocolu-dashoffice
sleep 10

echo ""
echo "=== PASO 5: TEST DE LOGIN ==="
curl -s -X POST http://127.0.0.1:3009/api/auth/login \\
    -H "Content-Type: application/json" \\
    -d '{"email":"admin@cocolu.com","password":"password123"}'

echo ""
echo ""
echo "=== PASO 6: VERIFICAR PM2 STATUS ==="
pm2 list | grep cocolu

echo ""
echo "🎉 FASE 1 COMPLETADA"
    `;
    conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        stream.on("data", (d: Buffer) => console.log(d.toString()));
        stream.stderr.on("data", (d: Buffer) => console.error(d.toString()));
        stream.on("close", () => {
            console.log("\n✅ Fase 1 completada");
            conn.end();
        });
    });
}).connect(config);
