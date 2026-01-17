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

console.log("🔧 FIX FINAL CON DYNAMIC IMPORT CORRECTO...");

const conn = new Client();
conn.on("ready", () => {
    const cmd = `
cd /var/www/cocolu-chatbot

echo "=== ELIMINAR RUTA AUTH ANTERIOR ==="
sed -i '/\\/api\\/auth\\/login/,+50d' app-integrated.js

echo "=== CREAR RUTA CON DYNAMIC IMPORT ==="
cat > /tmp/auth_final.txt << 'ENDAUTH'

        // ==========================================
        // AUTH LOGIN (ES MODULE DYNAMIC IMPORT)
        // ==========================================
        apiApp.post('/api/auth/login', async (req, res) => {
            const email = req.body.email || req.body.username;
            const password = req.body.password;
            
            if (!email || !password) {
                return res.status(400).json({ 
                    success: false, 
                    error: 'Email y contraseña son requeridos' 
                });
            }
            
            let db = null;
            try {
                // Dynamic import en ES module
                const { default: Database } = await import('better-sqlite3');
                db = new Database('./data/cocolu.db');
                
                const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
                
                if (!user) {
                    db.close();
                    return res.status(401).json({ 
                        success: false, 
                        error: 'Usuario no encontrado' 
                    });
                }
                
                if (user.password !== password) {
                    db.close();
                    return res.status(401).json({ 
                        success: false, 
                        error: 'Contraseña incorrecta' 
                    });
                }
                
                db.close();
                
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
                console.error('[AUTH] Login error:', error);
                res.status(500).json({ 
                    success: false, 
                    error: error.message 
                });
            }
        });
        
        apiApp.post('/api/auth/logout', (req, res) => {
            res.json({ success: true });
        });

ENDAUTH

# Insertar
LINE=\$(grep -n "WEBHOOK META" app-integrated.js | head -1 | cut -d: -f1)
head -n \$((LINE - 1)) app-integrated.js > /tmp/app.js
cat /tmp/auth_final.txt >> /tmp/app.js
tail -n +\$LINE app-integrated.js >> /tmp/app.js
mv /tmp/app.js app-integrated.js

echo "✅ Ruta insertada"

echo ""
echo "=== VERIFICAR ==="
grep -A 3 "AUTH LOGIN" app-integrated.js | head -5

echo ""
echo "=== SINTAXIS ==="
node --check app-integrated.js && echo "✅ OK" || echo "❌ ERROR"

echo ""
echo "=== RESTART PM2 ==="
pm2 restart cocolu-dashoffice
sleep 12

echo ""
echo "=== TEST ==="
curl -s -X POST http://127.0.0.1:3009/api/auth/login -H "Content-Type: application/json" -d '{"email":"admin@cocolu.com","password":"password123"}'

echo ""
echo ""
echo "🎯 FIN"
    `;
    conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        stream.on("data", (d: Buffer) => console.log(d.toString()));
        stream.stderr.on("data", (d: Buffer) => console.error(d.toString()));
        stream.on("close", () => {
            console.log("\n✅ Fix aplicado");
            conn.end();
        });
    });
}).connect(config);
