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
    readyTimeout: 90000,
};

console.log("🔧 FIXING BCV SERVICE...");

const bcvServiceCode = `import fs from 'fs';
import path from 'path';

// Fix path to be absolute based on process.cwd()
const CACHE_FILE = path.join(process.cwd(), 'data', 'bcv_rate.json');

class BcvService {
    constructor() {
        this.rate = this.loadRate();
        // Auto-sync on startup
        this.fetchCurrentRate().catch(err => console.error('Startup sync failed:', err.message));
    }

    loadRate() {
        try {
            if (fs.existsSync(CACHE_FILE)) {
                const data = fs.readFileSync(CACHE_FILE, 'utf8');
                return JSON.parse(data);
            }
        } catch (error) {
            console.error('Error loading stored rate:', error.message);
        }
        return { dollar: 0, date: null, last_updated: null };
    }

    saveRate(rateData) {
        try {
            const dir = path.dirname(CACHE_FILE);
            if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
            
            fs.writeFileSync(CACHE_FILE, JSON.stringify(rateData, null, 2));
            this.rate = rateData; // IMPORTANT: Update the in-memory rate
            console.log('✅ Rate saved to cache:', rateData.dollar);
        } catch (error) {
            console.error('Error saving rate:', error.message);
        }
    }

    async fetchCurrentRate() {
        try {
            console.log('🔄 Fetching current BCV rate from API...');
            // Using a reliable BCV API (rafnixg is common in Venezuela dev community)
            const response = await fetch('https://pydolarvenezuela-api.vercel.app/api/v1/dollar/page?page=bcv');
            
            if (!response.ok) throw new Error(\`API returned \${response.status}\`);
            
            const data = await response.json();
            // Expected format depends on API, but let's handle the one used or a generic one
            // Trying pydolarvenezuela which is reliable
            
            let price = 0;
            let date = new Date().toISOString().split('T')[0];

            if (data && data.monitors && data.monitors.usd) {
                 price = data.monitors.usd.price || 0;
                 date = data.monitors.usd.last_update || date;
            } else {
                 // Fallback to the other API seen in previous code
                 const resp2 = await fetch('https://bcv-api.rafnixg.dev/rates/usd');
                 const data2 = await resp2.json();
                 price = data2.price || data2.rate || 0;
            }

            if (price > 0) {
                const rateData = {
                    dollar: parseFloat(price),
                    date: date,
                    last_updated: new Date().toISOString(),
                    source: 'API',
                    manual: false
                };
                this.saveRate(rateData);
                return rateData;
            }
            
            return this.rate;
        } catch (error) {
            console.error('❌ Error fetching BCV rate:', error.message);
            return this.rate;
        }
    }

    async fetchHistory() {
        try {
            // Using rafnixg for history as seen in original code
            const response = await fetch('https://bcv-api.rafnixg.dev/rates/history');
            if (response.ok) {
                return await response.json();
            }
            return [];
        } catch (error) {
            console.error('Error fetching history:', error.message);
            return [];
        }
    }

    setRate(newRate) {
        const rateData = {
            dollar: parseFloat(newRate),
            date: new Date().toISOString().split('T')[0],
            last_updated: new Date().toISOString(),
            manual: true
        };
        this.saveRate(rateData);
        return rateData;
    }

    getRate() {
        return this.rate;
    }
}

export default new BcvService();
`;

const conn = new Client();
conn.on("ready", () => {
    // 1. Write the new service file
    // 2. Restart PM2
    // 3. Trigger a sync

    // We'll write to a temp file first then move it
    const writeCmd = \`cat > /var/www/cocolu-chatbot/src/services/bcv.service.js << 'EOF'
\${bcvServiceCode}
EOF
\`;

    const cmd = \`
\${writeCmd}

echo "✅ Service updated. Restarting PM2..."
pm2 restart cocolu-dashoffice

echo "⏳ Waiting for restart..."
sleep 5

echo "🔄 Triggering Sync..."
curl -X POST http://localhost:3009/api/bcv/sync

echo ""
echo "🔍 Verifying Rate..."
curl http://localhost:3009/api/bcv/rate
    \`;
    
    conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        stream.on('data', d => console.log(d.toString()));
        stream.stderr.on('data', d => console.error(d.toString()));
        stream.on('close', () => conn.end());
    });
}).connect(config);
