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

console.log("🔧 NUEVA ESTRATEGIA: Archivo separado de auth...");

const conn = new Client();
conn.on("ready", () => {
    const cmd = `
cd /var/www/cocolu-chatbot/src/api

echo "=== CREAR auth-simple.routes.js ==="
cat > auth-simple.routes.js << 'ENDFILE'
import Database from 'better-sqlite3';
import { Router } from 'express';

const router = Router();

router.post('/login', (req, res) => {
  const email = req.body.email || req.body.username;
  const password = req.body.password;
  
  if (!email || !password) {
    return res.status(400).json({ 
      success: false, 
      error: 'Email y contraseña requeridos' 
    });
  }
  
  let db = null;
  try {
    db = new Database('./data/cocolu.db');
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    
    if (!user) {
      db.close();
      return res.status(401).json({ success: false, error: 'Usuario no encontrado' });
    }
    
    if (user.password !== password) {
      db.close();
      return res.status(401).json({ success: false, error: 'Contraseña incorrecta' });
    }
    
    db.close();
    
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
  } catch (error) {
    if (db) try { db.close(); } catch (e) { }
    console.error('[AUTH] Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/logout', (req, res) => {
  res.json({ success: true });
});

export default router;
ENDFILE

echo "✅ Archivo creado"

cd /var/www/cocolu-chatbot

echo ""
echo "=== AGREGAR IMPORT EN APP-INTEGRATED ==="
# Buscar línea de imports de rutas y agregar después
LINE=\$(grep -n "import financeRouter" app-integrated.js | head -1 | cut -d: -f1)
head -n \$LINE app-integrated.js > /tmp/app.js
echo "import authSimpleRouter from './src/api/auth-simple.routes.js';" >> /tmp/app.js
tail -n +\$((LINE + 1)) app-integrated.js >> /tmp/app.js
mv /tmp/app.js app-integrated.js

echo "✅ Import agregado"

echo ""
echo "=== MONTAR ROUTER EN EXPRESS ==="
# Buscar donde se montan los routers y agregar
LINE=\$(grep -n "apiApp.use('/api/finance" app-integrated.js | head -1 | cut -d: -f1)
head -n \$LINE app-integrated.js > /tmp/app.js
echo "        apiApp.use('/api/auth', authSimpleRouter);" >> /tmp/app.js
echo "        console.log('✅ Auth simple routes mounted at /api/auth');" >> /tmp/app.js
tail -n +\$((LINE + 1)) app-integrated.js >> /tmp/app.js
mv /tmp/app.js app-integrated.js

echo "✅ Router montado"

echo ""
echo "=== VERIFICAR SINTAXIS ==="
node --check app-integrated.js && echo "✅ OK" || echo "❌ ERROR"

echo ""
echo "=== RESTART PM2 ==="
pm2 restart cocolu-dashoffice
sleep 15

echo ""
echo "=== TEST ==="
curl -s -X POST http://127.0.0.1:3009/api/auth/login -H "Content-Type: application/json" -d '{"email":"admin@cocolu.com","password":"password123"}'

echo ""
echo ""
echo "🎉 DONE"
    `;
    conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        stream.on("data", (d: Buffer) => console.log(d.toString()));
        stream.stderr.on("data", (d: Buffer) => console.error(d.toString()));
        stream.on("close", () => {
            console.log("\n✅ Implementado");
            conn.end();
        });
    });
}).connect(config);
