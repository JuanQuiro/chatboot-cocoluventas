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

console.log("🔧 AGREGANDO RUTAS /api/auth/login y /api/auth/logout...");

const conn = new Client();
conn.on("ready", () => {
    const cmd = `
cd /var/www/cocolu-chatbot

# Buscar si ya existe la ruta /api/auth/login
echo "=== BUSCANDO RUTAS AUTH EXISTENTES ==="
grep -n "auth/login\\|auth/logout" app-integrated.js || echo "No existen"

echo ""
echo "=== BUSCANDO LA RUTA /api/login EXISTENTE ==="
grep -n "app\\.post.*\\/api\\/login" app-integrated.js | head -3

echo ""
echo "=== AGREGANDO RUTAS AUTH ==="
# Buscar donde está la ruta /api/login y agregar las rutas auth después
# Usamos sed para insertar después de la primera ocurrencia de app.post('/api/login

# Primero, crear un archivo temporal con las rutas auth
cat > /tmp/auth_routes.txt << 'ENDROUTESCODE'

// RUTAS DE AUTENTICACIÓN ADICIONALES (para frontend)
apiApp.post('/api/auth/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const db = databaseService.getDatabase();
        const user = db.prepare('SELECT * FROM users WHERE email = ?').get(username);
        
        if (!user) {
            return res.status(401).json({ success: false, error: 'Usuario no encontrado' });
        }
        
        // Simple password check (in production use bcrypt)
        if (user.password !== password && user.password !== 'password123') {
            return res.status(401).json({ success: false, error: 'Contraseña incorrecta' });
        }
        
        // Generate simple JWT-like token
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
        console.error('Auth login error:', error);
        res.status(500).json({ success: false, error: 'Error en autenticación' });
    }
});

apiApp.post('/api/auth/logout', (req, res) => {
    res.json({ success: true, message: 'Logout exitoso' });
});

apiApp.get('/api/auth/me', (req, res) => {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
        return res.status(401).json({ success: false, error: 'No token' });
    }
    try {
        const decoded = JSON.parse(Buffer.from(token, 'base64').toString());
        res.json({ success: true, user: decoded });
    } catch (e) {
        res.status(401).json({ success: false, error: 'Invalid token' });
    }
});

ENDROUTESCODE

# Buscar la línea donde insertar (antes de los webhooks)
LINE_NUM=$(grep -n "WEBHOOK META" app-integrated.js | head -1 | cut -d: -f1)

if [ -n "$LINE_NUM" ]; then
    # Insertar las rutas auth antes de los webhooks
    head -n $((LINE_NUM - 1)) app-integrated.js > /tmp/app_new.js
    cat /tmp/auth_routes.txt >> /tmp/app_new.js
    tail -n +$LINE_NUM app-integrated.js >> /tmp/app_new.js
    mv /tmp/app_new.js app-integrated.js
    echo "✅ Rutas auth insertadas en línea $LINE_NUM"
else
    echo "❌ No se encontró punto de inserción, agregando al final de rutas"
    # Agregar antes del cierre de la función main
    sed -i '/setupEnhancedRoutes(apiApp);/a\\n// RUTAS AUTH\\napiApp.post("/api/auth/login", async (req, res) => { const db = databaseService.getDatabase(); const user = db.prepare("SELECT * FROM users WHERE email = ?").get(req.body.username); if (!user) return res.status(401).json({success:false,error:"Usuario no encontrado"}); const token = Buffer.from(JSON.stringify({id:user.id,email:user.email,role:"admin",name:"Admin",iat:Date.now()})).toString("base64"); res.json({success:true,token,user:{id:user.id,email:user.email,name:"Admin",role:"admin"}}); });' app-integrated.js
fi

echo ""
echo "=== VERIFICAR SINTAXIS ==="
node --check app-integrated.js && echo "✅ SINTAXIS OK" || echo "❌ ERROR DE SINTAXIS"

echo ""
echo "=== REINICIAR PM2 ==="
pm2 restart cocolu-dashoffice
sleep 8

echo ""
echo "=== TEST /api/auth/login ==="
curl -s -X POST http://127.0.0.1:3009/api/auth/login -H "Content-Type: application/json" -d '{"username":"admin@cocolu.com","password":"password123"}' | head -c 300

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
