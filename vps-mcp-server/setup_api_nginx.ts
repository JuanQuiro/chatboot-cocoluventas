
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

console.log(`Configuring Nginx/API on ${config.host}...`);

const nginxConfig = `
server {
    server_name api.emberdrago.com;

    location / {
        proxy_pass http://localhost:3009;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
`;

const conn = new Client();
conn.on("ready", () => {
    // 1. Delete frontend files
    // 2. Remove old configs (assuming they contain 'cocolu')
    // 3. Write new config
    // 4. Link and reload
    const cmd = `
        rm -rf /var/www/cocolu-frontend* && \
        rm -f /etc/nginx/sites-enabled/*cocolu* && \
        rm -f /etc/nginx/sites-available/*cocolu* && \
        echo '${nginxConfig}' > /etc/nginx/sites-available/api.emberdrago.com && \
        ln -sf /etc/nginx/sites-available/api.emberdrago.com /etc/nginx/sites-enabled/ && \
        nginx -t && \
        systemctl reload nginx
    `;

    conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        stream.on("close", (code: any, signal: any) => {
            conn.end();
        }).on("data", (data: any) => {
            console.log(data.toString());
        }).stderr.on("data", (data: any) => {
            console.log("STDERR: " + data);
        });
    });
}).on("error", (err) => {
    console.error("Connection Failed:", err);
}).connect(config);
