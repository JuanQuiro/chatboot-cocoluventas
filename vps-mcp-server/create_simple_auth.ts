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

console.log("🔧 CREANDO RUTA DE LOGIN SIMPLE...");

const conn = new Client();
conn.on("ready", () => {
    const cmd = `
cd /var/www/cocolu-chatbot

# Crear un archivo con la ruta de login simple
cat > /tmp/simple_auth_route.js << 'ENDAUTH'
// Ruta de autenticación simple sin dependencias
import Database from 'better-sqlite3';

export function setupSimpleAuth(app) {
    app.post('/api/auth/login', async (req, res) => {
        try {
            const email = req.body.email || req.body.username;
            const password = req.body.password;
            
            if (!email || !password) {
                return res.status(400).json({ 
                    success: false, 
                    error: 'Email y contraseña son requeridos' 
                });
            }
            
            // Acceso directo a SQLite
            let db;
            try {
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
                
                // Token simple
                const token = Buffer.from(JSON.stringify({
                    id: user.id,
                    email: user.email,
                    role: user.role || 'admin',
                    name: user.name || 'Administrator',
                    iat: Date.now()
                })).toString('base64');
                
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
            } catch (dbError) {
                if (db) db.close();
                console.error('DB Error:', dbError);
                return res.status(500).json({ 
                    success: false, 
                    error: 'Error de base de datos: ' + dbError.message 
                });
            }
        } catch (error) {
            console.error('Auth error:', error);
            res.status(500).json({ 
                success: false, 
                error: 'Error del servidor: ' + error.message 
            });
        }
    });
    
    app.post('/api/auth/logout', (req, res) => {
        res.json({ success: true, message: 'Logout exitoso' });
    });
    
    console.log('✅ Simple auth routes configured');
}
ENDAUTH

# Subir el archivo a src/api
mv /tmp/simple_auth_route.js ./src/api/simple-auth.routes.js

echo "✅ Archivo de ruta simple creado"

echo ""
echo "=== VERIFICAR SINTAXIS ==="
node --check ./src/api/simple-auth.routes.js && echo "✅ OK" || echo "❌ ERROR"

echo ""
echo "=== REINICIAR PM2 ==="
pm2 restart cocolu-dashoffice
sleep 10

echo ""
echo "=== TEST LOGIN ==="
curl -s -X POST http://127.0.0.1:3009/api/auth/login -H "Content-Type: application/json" -d '{"email":"admin@cocolu.com","password":"password123"}'

echo ""
echo ""
echo "🎉 SI VES TOKEN = ¡FUNCIONA!"
    `;
    conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        stream.on("data", (d: Buffer) => console.log(d.toString()));
        stream.stderr.on("data", (d: Buffer) => console.error(d.toString()));
        stream.on("close", () => {
            console.log("\n✅ Completado");
            conn.end();
        });
    });
}).connect(config);
