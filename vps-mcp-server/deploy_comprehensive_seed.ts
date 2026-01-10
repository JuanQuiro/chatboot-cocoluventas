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

console.log(`Creating Comprehensive Seed on ${config.host}...`);
console.log("This will populate the database with realistic test data...\n");

const conn = new Client();
conn.on("ready", () => {
    const cmd = `
        cd /var/www/cocolu-chatbot
        
        cat > comprehensive_seed.js << 'SEEDSCRIPT'
const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const db = new Database('./data/cocolu.db');

console.log('🌱 Starting comprehensive seed...');

// HELPER: Generate random date
function randomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

// HELPER: Random from array
function randomFrom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// ====================================
// 1. USERS - Multiple roles and types
// ====================================
console.log('👥 Seeding users...');

const users = [
  { id: 'admin-' + Date.now(), email: 'admin@cocolu.com', password: 'password123', name: 'Admin Principal', role: 'admin', active: 1 },
  { id: 'user-manager-1', email: 'manager@cocolu.com', password: 'password123', name: 'Carlos Gerente', role: 'manager', active: 1 },
  { id: 'user-seller-1', email: 'vendedor1@cocolu.com', password: 'password123', name: 'María Vendedora', role: 'seller', active: 1 },
  { id: 'user-seller-2', email: 'vendedor2@cocolu.com', password: 'password123', name: 'Juan Vendedor', role: 'seller', active: 1 },
  { id: 'user-viewer-1', email: 'consultor@cocolu.com', password: 'password123', name: 'Ana Consultora', role: 'viewer', active: 1 },
  { id: 'user-inactive-1', email: 'inactivo@cocolu.com', password: 'password123', name: 'Pedro Inactivo', role: 'user', active: 0 },
];

const insertUser = db.prepare('INSERT OR IGNORE INTO users (id, email, password_hash, name, role, active, created_at) VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)');

users.forEach(user => {
  const hash = bcrypt.hashSync(user.password, 12);
  insertUser.run(user.id, user.email, hash, user.name, user.role, user.active);
});

console.log(\`✅ Created \${users.length} users\`);

// ====================================
// 2. SELLERS - Sales representatives
// ====================================
console.log('👔 Seeding sellers...');

const sellers = [
  { id: 1, name: 'Roberto Chávez', phone: '04241234567', commission_rate: 0.05, active: 1, availability_status: 'online' },
  { id: 2, name: 'Luisa Fernández', phone: '04142345678', commission_rate: 0.06, active: 1, availability_status: 'online' },
  { id: 3, name: 'Miguel Torres', phone: '04263456789', commission_rate: 0.04, active: 1, availability_status: 'offline' },
  { id: 4, name: 'Carmen Rodríguez', phone: '04124567890', commission_rate: 0.055, active: 1, availability_status: 'busy' },
  { id: 5, name: 'Diego Morales (Inactivo)', phone: '04145678901', commission_rate: 0.05, active: 0, availability_status: 'offline' },
];

const insertSeller = db.prepare('INSERT OR IGNORE INTO sellers (id, name, phone, commission_rate, active, availability_status) VALUES (?, ?, ?, ?, ?, ?)');

sellers.forEach(s => {
  insertSeller.run(s.id, s.name, s.phone, s.commission_rate, s.active, s.availability_status);
});

console.log(\`✅ Created \${sellers.length} sellers\`);

// ====================================
// 3. CLIENTS - Diverse customer base
// ====================================
console.log('👤 Seeding clients...');

const clientNames = [
  'María González', 'José Pérez', 'Ana Martínez', 'Carlos López', 'Laura Rodríguez',
  'Pedro Sánchez', 'Carmen Díaz', 'Miguel Torres', 'Isabel Ramírez', 'Diego Morales',
  'Sofía Castro', 'Andrés Vargas', 'Valentina Ruiz', 'Javier Fernández', 'Camila Gómez',
  'Leonardo Silva', 'Gabriela Mendoza', 'Ricardo Herrera', 'Daniela Navarro', 'Sebastián Cruz',
  'Cliente Sin Teléfono', 'Cliente Con Deuda Alta', 'VIP Premium', 'Cliente Moroso', 'Nuevo Cliente'
];

const insertClient = db.prepare('INSERT INTO clientes (nombre, telefono, direccion, notas, created_at) VALUES (?, ?, ?, ?, ?)');

const clients = [];
clientNames.forEach((name, i) => {
  const phone = i < 20 ? \`0424\${1000000 + i}\` : (i === 20 ? null : \`0414\${2000000 + i}\`);
  const address = i % 3 === 0 ? \`Av. Principal #\${i+1}, Caracas\` : (i % 3 === 1 ? \`Calle \${i+1}, Valencia\` : null);
  const notes = i === 21 ? 'Cliente con deuda alta, verificar pagos' : (i === 22 ? 'VIP - Descuento especial' : (i === 23 ? 'MOROSO - No vender hasta saldar deuda' : null));
  const created = randomDate(new Date(2024, 0, 1), new Date());
  
  const result = insertClient.run(name, phone, address, notes, created.toISOString());
  clients.push({ id: result.lastInsertRowid, name, phone });
});

console.log(\`✅ Created \${clients.length} clients\`);

// ====================================
// 4. PRODUCTS - Jewelry inventory
// ====================================
console.log('💍 Seeding products...');

const productTypes = ['RELICARIO', 'DIJE', 'CADENA', 'PULSERA', 'ANILLO', 'ARETES', 'COLLAR'];
const materials = ['Oro 18k', 'Plata 925', 'Acero Inoxidable', 'Oro Blanco', 'Platino'];

const insertProduct = db.prepare('INSERT INTO productos (codigo, nombre, precio, stock, fabricante, descripcion, categoria, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');

const products = [];
for (let i = 0; i < 40; i++) {
  const type = randomFrom(productTypes);
  const material = randomFrom(materials);
  const code = \`PROD-\${String(i + 1).padStart(4, '0')}\`;
  const name = \`\${type} \${material} \${i % 5 === 0 ? 'Premium' : ''}\`;
  const price = Math.floor(Math.random() * 5000) + 500; // $500-$5500
  const stock = i % 7 === 0 ? 0 : Math.floor(Math.random() * 50) + 1; // Some out of stock
  const manufacturer = randomFrom(['Fabricante A', 'Fabricante B', 'Importado Italia', 'Nacional']);
  const description = i % 3 === 0 ? \`\${type} de alta calidad con detalles en \${material}\` : null;
  const created = randomDate(new Date(2023, 6, 1), new Date());
  
  const result = insertProduct.run(code, name, price, stock, manufacturer, description, type, created.toISOString());
  products.push({ id: result.lastInsertRowid, code, name, price, stock });
}

console.log(\`✅ Created \${products.length} products (including \${products.filter(p => p.stock === 0).length} out of stock)\`);

// ====================================
// 5. INGRESOS - Orders/Sales
// ====================================
console.log('💰 Seeding sales/income...');

const paymentMethods = ['efectivo', 'transferencia', 'zelle', 'pago_movil', 'punto_venta'];
const categories = ['venta', 'servicio', 'reparacion', 'consignacion'];

const insertIngreso = db.prepare('INSERT INTO ingresos_varios (descripcion, monto, fecha, categoria, notas, metodo_pago, referencia, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');

for (let i = 0; i < 60; i++) {
  const client = randomFrom(clients);
  const product = randomFrom(products);
  const quantity = Math.floor(Math.random() * 5) + 1;
  const amount = product.price * quantity;
  const method = randomFrom(paymentMethods);
  const category = i % 10 === 0 ? randomFrom(categories.slice(1)) : 'venta';
  const date = randomDate(new Date(2024, 0, 1), new Date());
  const description = \`Venta \${product.name} x\${quantity} - Cliente: \${client.name}\`;
  const notes = i % 15 === 0 ? 'PAGO PENDIENTE - 50% anticipo' : (i % 20 === 0 ? 'URGENTE - Cliente VIP' : null);
  const reference = method !== 'efectivo' ? \`REF-\${Date.now()}-\${i}\` : null;
  
  insertIngreso.run(description, amount, date.toISOString(), category, notes, method, reference, date.toISOString());
}

console.log(\`✅ Created 60 sales/income records\`);

// ====================================
// 6. ABONOS - Partial payments
// ====================================
console.log('📝 Seeding partial payments...');

const insertAbono = db.prepare('INSERT INTO abonos (ingreso_id, monto, fecha, metodo_pago, referencia, notas) VALUES (?, ?, ?, ?, ?, ?)');

// Create some partial payments for random orders
for (let i = 0; i < 20; i++) {
  const ingresoId = Math.floor(Math.random() * 60) + 1;
  const amount = Math.floor(Math.random() * 1000) + 100;
  const method = randomFrom(paymentMethods);
  const date = randomDate(new Date(2024, 2, 1), new Date());
  const reference = method !== 'efectivo' ? \`ABONO-\${Date.now()}-\${i}\` : null;
  const notes = i % 5 === 0 ? 'Abono parcial acordado' : null;
  
  insertAbono.run(ingresoId, amount, date.toISOString(), method, reference, notes);
}

console.log(\`✅ Created 20 partial payment records\`);

// ====================================
// 7. SELLER ASSIGNMENTS - Chat assignments
// ====================================
console.log('💬 Seeding seller assignments...');

const insertAssignment = db.prepare('INSERT INTO seller_assignments (user_id, seller_id, status, assigned_at, closed_at) VALUES (?, ?, ?, ?, ?)');

const statuses = ['active', 'closed'];
for (let i = 0; i < 30; i++) {
  const client = randomFrom(clients);
  const seller = randomFrom(sellers.filter(s => s.active));
  const status = i < 5 ? 'active' : 'closed'; // 5 active conversations
  const assignedDate = randomDate(new Date(2024, 0, 1), new Date());
  const closedDate = status === 'closed' ? randomDate(assignedDate, new Date()) : null;
  
  insertAssignment.run(client.phone || \`user-\${i}\`, seller.id, status, assignedDate.toISOString(), closedDate ? closedDate.toISOString() : null);
}

console.log(\`✅ Created 30 seller assignments (5 active conversations)\`);

// ====================================
// FINAL STATS
// ====================================
console.log('\\n📊 SEED SUMMARY:');
console.log(\`   👥 Users: \${db.prepare('SELECT COUNT(*) as count FROM users').get().count}\`);
console.log(\`   👔 Sellers: \${db.prepare('SELECT COUNT(*) as count FROM sellers').get().count}\`);
console.log(\`   👤 Clients: \${db.prepare('SELECT COUNT(*) as count FROM clientes').get().count}\`);
console.log(\`   💍 Products: \${db.prepare('SELECT COUNT(*) as count FROM productos').get().count}\`);
console.log(\`   💰 Sales: \${db.prepare('SELECT COUNT(*) as count FROM ingresos_varios').get().count}\`);
console.log(\`   📝 Payments: \${db.prepare('SELECT COUNT(*) as count FROM abonos').get().count}\`);
console.log(\`   💬 Assignments: \${db.prepare('SELECT COUNT(*) as count FROM seller_assignments').get().count}\`);

console.log('\\n✅ Seed completed successfully!');
db.close();
SEEDSCRIPT

        echo "=== RUNNING SEED SCRIPT ==="
        node comprehensive_seed.js
        
        echo ""
        echo "=== VERIFICATION ==="
        echo "Users count:"
        sqlite3 data/cocolu.db "SELECT COUNT(*) FROM users;"
        
        echo "Clients count:"
        sqlite3 data/cocolu.db "SELECT COUNT(*) FROM clientes;"
        
        echo "Products count:"
        sqlite3 data/cocolu.db "SELECT COUNT(*) FROM productos;"
        
        echo "Sales count:"
        sqlite3 data/cocolu.db "SELECT COUNT(*) FROM ingresos_varios;"
        
        echo ""
        echo "=== CLEANUP ==="
        rm comprehensive_seed.js
        
        echo ""
        echo "=== RESTARTING BACKEND ==="
        pm2 restart cocolu-dashoffice
    `;
    conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        stream.on("close", (code: any) => {
            console.log("\n✅ Seed deployment complete");
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
