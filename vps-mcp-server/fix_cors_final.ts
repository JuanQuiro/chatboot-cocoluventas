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

console.log("🔧 ARREGLANDO CORS EN NGINX Y BACKEND...");

const conn = new Client();
conn.on("ready", () => {
    const cmd = `
# Reconfiguramos Nginx con CORS correctamente
cat > /etc/nginx/sites-enabled/api.emberdrago.com << 'ENDCONFIG'
server {
    server_name api.emberdrago.com;
    
    location / {
        # Handle preflight OPTIONS
        if ($request_method = 'OPTIONS') {
            add_header 'Access-Control-Allow-Origin' 'https://cocolu.emberdrago.com' always;
            add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS' always;
            add_header 'Access-Control-Allow-Headers' 'Authorization, Content-Type, Accept, Origin, X-Requested-With' always;
            add_header 'Access-Control-Allow-Credentials' 'true' always;
            add_header 'Access-Control-Max-Age' 1728000;
            add_header 'Content-Type' 'text/plain charset=UTF-8';
            add_header 'Content-Length' 0;
            return 204;
        }
        
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

echo "✅ Nginx config actualizada"

# Verificar sintaxis
nginx -t 2>&1

# Recargar nginx
nginx -s reload 2>&1 || service nginx reload 2>&1

echo ""
echo "✅ NGINX RECARGADO"
echo ""
echo "=== TEST CORS (OPTIONS) ==="
curl -sI -X OPTIONS http://127.0.0.1:3009/api/auth/login -H "Origin: https://cocolu.emberdrago.com" 2>&1 | grep -i "access-control" || echo "No hay headers CORS desde backend"

echo ""
echo "=== TEST LOGIN ==="
curl -s -X POST http://127.0.0.1:3009/api/auth/login -H "Content-Type: application/json" -d '{"email":"admin@cocolu.com","password":"password123"}' | head -c 200

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
