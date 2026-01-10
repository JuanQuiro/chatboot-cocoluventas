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

console.log("🔧 FIX FINAL: Usando CommonJS require...");

const conn = new Client();
conn.on("ready", () => {
    const cmd = `
cd /var/www/cocolu-chatbot

echo "=== ELIMINAR RUTA AUTH PROBLEMÁTICA ==="
sed -i '/\\/api\\/auth\\/login/,/\\/api\\/auth\\/logout/d' app-integrated.js

echo "=== AGREGAR RUTA NUEVA CON REQUIRE ==="
cat > /tmp/final_auth_route.txt << 'ENDCODE'

        // ==========================================
        // AUTH LOGIN (COMMONJS - NO IMPORTS)
        // ==========================================
        apiApp.post('/api/auth/login', (req, res) => {
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
                const Database = require('better-sqlite3');
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
                console.error('Login error:', error);
                res.status(500).json({ 
                    success: false, 
                    error: error.message 
                });
            }
        });
        
        apiApp.post('/api/auth/logout', (req, res) => {
            res.json({ success: true });
        });

ENDCODE

# Insertar antes de WEBHOOK
LINE_NUM=\$(grep -n "WEBHOOK META" app-integrated.js | head -1 | cut -d: -f1)
head -n \$((LINE_NUM - 1)) app-integrated.js > /tmp/app.js
cat /tmp/final_auth_route.txt >> /tmp/app.js
tail -n +\$LINE_NUM app-integrated.js >> /tmp/app.js
mv /tmp/app.js app-integrated.js

echo "✅ Ruta insertada"

echo ""
echo "=== VER RUTA ==="
grep -A 5 "AUTH LOGIN" app-integrated.js | head -10

echo ""
echo "=== VERIFICAR SINTAXIS ==="
node --check app-integrated.js && echo "✅ OK" || echo "❌ ERROR"

echo ""
echo "=== REINICIAR PM2 ==="
pm2 restart cocolu-dashoffice
sleep 10

echo ""
echo "=== TEST LOGIN ==="
curl -s -X POST http://127.0.0.1:3009/api/auth/login -H "Content-Type: application/json" -d '{"email":"admin@cocolu.com","password":"password123"}'

echo ""
echo ""
echo "🎉 TEST COMPLETADO"
    `;
    conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        stream.on("data", (d: Buffer) => console.log(d.toString()));
        stream.stderr.on("data", (d: Buffer) => console.error(d.toString()));
        stream.on("close", () => {
            console.log("\n✅ Fix completado");
            conn.end();
        });
    });
}).connect(config);
