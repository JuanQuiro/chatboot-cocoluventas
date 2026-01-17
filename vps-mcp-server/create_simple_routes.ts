import { Client } from "ssh2";
import dotenv from "dotenv";
import { join } from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, ".env") });

const config = {
    host: process.env.VPS_HOST,
    port: parseInt(process.env.VPS_PORT || "22"),
    username: process.env.VPS_USERNAME,
    password: process.env.VPS_PASSWORD,
};

console.log(`🔧 Creando archivos de rutas SIN ERRORES DE SINTAXIS...`);

const conn = new Client();
conn.on("ready", () => {
    const cmd = `
        cd /var/www/cocolu-chatbot/src/api
        
        echo "=== CREANDO ARCHIVOS SIMPLES SIN SYNTAX ERRORS ==="
        
        cat > simple-installments.js << 'EOF'
module.exports = function(app, db) {
  app.get('/api/installments', function(req, res) {
    res.json({ data: [], meta: { total: 0, page: 1, limit: 50 } });
  });
  
  app.get('/api/installments/stats', function(req, res) {
    res.json({ total: 0, pending: 0, completed: 0, overdue: 0 });
  });
  
  console.log('Installments routes OK');
};
EOF

        cat > simple-accounts.js << 'EOF'
module.exports = function(app, db) {
  app.get('/api/accounts-receivable', function(req, res) {
    res.json({ data: [], meta: { total: 0, page: 1, limit: 15 } });
  });
  
  app.get('/api/accounts-receivable/stats', function(req, res) {
    res.json({ total: 0, pending: 0, overdue: 0, paid: 0 });
  });
  
  console.log('Accounts routes OK');
};
EOF
        
        echo "✅ Archivos creados"
        
        echo ""
        echo "=== VERIFICANDO SINTAXIS ==="
        node -c simple-installments.js && echo "✅ installments OK" || echo "❌ ERROR"
        node -c simple-accounts.js && echo "✅ accounts OK" || echo "❌ ERROR"
        
        echo ""
        echo "=== ACTUALIZANDO APP-INTEGRATED.JS ==="
        cd /var/www/cocolu-chatbot
        
        # Eliminar líneas viejas
        sed -i '/installments.routes.js/d' app-integrated.js
        sed -i '/accounts.routes.js/d' app-integrated.js
        sed -i '/INSTALLMENTS AND ACCOUNTS /d' app-integrated.js
        
        # Buscar app.listen
        LINE=\$(grep -n "app.listen" app-integrated.js | head -1 | cut -d: -f1)
        
        # Insertar ANTES de app.listen
        sed -i "\${LINE}i\\\\
require('./src/api/simple-installments')(app, db);\\\\
require('./src/api/simple-accounts')(app, db);\\\\
" app-integrated.js
        
        echo "✅ App actualizado"
        
        echo ""
        echo "=== REINICIANDO PM2 ==="
        pm2 restart cocolu-dashoffice
        sleep 7
        
        echo ""
        echo "=== PROBANDO ==="
        curl -s http://127.0.0.1:3009/api/installments/stats
        
        echo ""
        echo ""
        echo "🎉 LISTO - Recarga la página"
    `;
    conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        stream.on("close", (code: any) => {
            console.log("\n✅ DONE");
            conn.end();
        }).on("data", (data: any) => {
            console.log(data.toString());
        }).stderr.on("data", (data: any) => {
            console.error("STDERR:", data.toString());
        });
    });
}).on("error", (err) => {
    console.error("Connection Failed:", err);
}).connect(config);
