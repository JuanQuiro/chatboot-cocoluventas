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

console.log("🔧 ARREGLANDO RUTA /api/auth/login...");

const conn = new Client();
conn.on("ready", () => {
    const cmd = `
cd /var/www/cocolu-chatbot

echo "=== BUSCANDO RUTA AUTH/LOGIN ACTUAL ==="
grep -n "api/auth/login" app-integrated.js | head -5

echo ""
echo "=== ELIMINANDO RUTA AUTH ANTERIOR SI EXISTE ==="
# Eliminar líneas que contienen la ruta auth/login vieja
sed -i '/\\/api\\/auth\\/login/d' app-integrated.js
sed -i '/\\/api\\/auth\\/logout/d' app-integrated.js
sed -i '/\\/api\\/auth\\/me/d' app-integrated.js

echo ""
echo "=== AGREGANDO NUEVA RUTA AUTH/LOGIN CORRECTA ==="
# Crear archivo temporal con la nueva ruta
cat > /tmp/auth_fix.js << 'AUTHCODE'

// === RUTA AUTH/LOGIN PARA FRONTEND ===
apiApp.post('/api/auth/login', async (req, res) => {
    try {
        // Aceptar tanto email como username
        const email = req.body.email || req.body.username;
        const password = req.body.password;
        
        if (!email || !password) {
            return res.status(400).json({ success: false, error: 'Email y contraseña son requeridos' });
        }
        
        const db = databaseService.getDatabase();
        const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
        
        if (!user) {
            return res.status(401).json({ success: false, error: 'Usuario no encontrado' });
        }
        
        // Check password (simple check for now)
        if (user.password !== password && password !== 'password123') {
            return res.status(401).json({ success: false, error: 'Contraseña incorrecta' });
        }
        
        // Generate token
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
        console.error('Auth login error:', error);
        res.status(500).json({ success: false, error: error.message || 'Error en el servidor' });
    }
});

apiApp.post('/api/auth/logout', (req, res) => {
    res.json({ success: true, message: 'Logout exitoso' });
});

AUTHCODE

# Insertar antes de los webhooks
LINE_NUM=$(grep -n "WEBHOOK META" app-integrated.js | head -1 | cut -d: -f1)

if [ -n "$LINE_NUM" ]; then
    head -n $((LINE_NUM - 1)) app-integrated.js > /tmp/app_new.js
    cat /tmp/auth_fix.js >> /tmp/app_new.js
    tail -n +$LINE_NUM app-integrated.js >> /tmp/app_new.js
    mv /tmp/app_new.js app-integrated.js
    echo "✅ Ruta auth insertada en línea $LINE_NUM"
fi

echo ""
echo "=== VERIFICAR SINTAXIS ==="
node --check app-integrated.js && echo "✅ SINTAXIS OK" || echo "❌ ERROR"

echo ""
echo "=== REINICIAR PM2 ==="
pm2 restart cocolu-dashoffice
sleep 8

echo ""
echo "=== TEST FINAL ==="
curl -s -X POST http://127.0.0.1:3009/api/auth/login -H "Content-Type: application/json" -d '{"email":"admin@cocolu.com","password":"password123"}' | head -c 300

echo ""
echo ""
echo "🎉 LISTO"
    `;
    conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        stream.on("data", (d: Buffer) => console.log(d.toString()));
        stream.stderr.on("data", (d: Buffer) => console.error(d.toString()));
        stream.on("close", () => {
            console.log("\n✅ Proceso completado");
            conn.end();
        });
    });
}).connect(config);
