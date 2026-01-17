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

console.log("🔧 ARREGLANDO CORS DUPLICADO...");

const conn = new Client();
conn.on("ready", () => {
    const cmd = `
# Crear config de Nginx SIN headers CORS (dejar que Express los maneje)
cat > /etc/nginx/sites-enabled/api.emberdrago.com << 'ENDCONFIG'
server {
    server_name api.emberdrago.com;
    
    location / {
        proxy_pass http://localhost:3009;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
    
    listen 443 ssl;
    ssl_certificate /etc/letsencrypt/live/api.emberdrago.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.emberdrago.com/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;
}

server {
    if ($host = api.emberdrago.com) {
        return 301 https://$host$request_uri;
    }
    server_name api.emberdrago.com;
    listen 80;
    return 404;
}
ENDCONFIG

echo "✅ Config Nginx actualizada (sin CORS duplicado)"

# Verificar sintaxis
nginx -t 2>&1

# Recargar nginx
nginx -s reload 2>&1 || service nginx reload 2>&1

echo ""
echo "✅ NGINX RECARGADO"
echo ""
echo "Probando login..."
curl -s -X POST http://127.0.0.1:3009/api/login -H "Content-Type: application/json" -d '{"username":"admin@cocolu.com","password":"password123"}' | head -c 200

echo ""
echo ""
echo "🎉 LISTO - PRUEBA EL LOGIN AHORA"
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
