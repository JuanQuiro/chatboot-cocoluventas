import fs from 'fs';
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log("🔧 MODIFICANDO APP-INTEGRATED.JS LOCALMENTE...\n");

// Leer archivo descargado
const filePath = join(__dirname, "app-integrated-current.js");
let content = fs.readFileSync(filePath, 'utf8');

const lines = content.split('\n');

// 1. Buscar la línea de import de sellersRoutes
let sellersImportLine = -1;
for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes("import sellersRoutes from")) {
        sellersImportLine = i;
        break;
    }
}

if (sellersImportLine === -1) {
    console.error("❌ No se encontró import de sellersRoutes");
    process.exit(1);
}

console.log("✅ Import de sellers encontrado en línea:", sellersImportLine + 1);

// 2. Insertar los nuevos imports DESPUÉS de sellersRoutes
const newImports = [
    "import accountsReceivableRoutes from './src/api/accounts-receivable.routes.js';",
    "import installmentsRoutes from './src/api/installments.routes.js';"
];

// Insertar después de sellersRoutes
lines.splice(sellersImportLine + 1, 0, ...newImports);

console.log("✅ Imports agregados");

// 3. Buscar donde se registra apiApp.use('/api/sellers'
let sellersUseLine = -1;
for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes("apiApp.use('/api/sellers'")) {
        sellersUseLine = i;
        break;
    }
}

if (sellersUseLine === -1) {
    console.error("❌ No se encontró registro de sellers");
    process.exit(1);
}

console.log("✅ Registro de sellers encontrado en línea:", sellersUseLine + 1);

// 4. Insertar los nuevos registros DESPUÉS de sellers
const newRegistrations = [
    "apiApp.use('/api/accounts-receivable', accountsReceivableRoutes);",
    "apiApp.use('/api/installments', installmentsRoutes);"
];

// Insertar después de sellers
lines.splice(sellersUseLine + 1, 0, ...newRegistrations);

console.log("✅ Registros agregados");

// 5. Guardar archivo modificado
const modifiedContent = lines.join('\n');
fs.writeFileSync(join(__dirname, "app-integrated-patched.js"), modifiedContent, 'utf8');

console.log("\n✅ Archivo modificado guardado como app-integrated-patched.js");
console.log("📊 Tamaño original:", content.length, "bytes");
console.log("📊 Tamaño modificado:", modifiedContent.length, "bytes");
console.log("📊 Diferencia:", modifiedContent.length - content.length, "bytes");
