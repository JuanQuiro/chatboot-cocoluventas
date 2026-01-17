import fs from 'fs';
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Read the raw file
let content = fs.readFileSync(join(__dirname, "app_downloaded.js"), "utf16le"); // Try utf16le based on previous output hints
if (!content.includes('import')) {
    // Fallback to utf8 if utf16le fails to read correct text
    content = fs.readFileSync(join(__dirname, "app_downloaded.js"), "utf8");
}

// Clean header logs
const startIdx = content.indexOf('/**');
if (startIdx > -1) {
    content = content.substring(startIdx);
}

// 1. Add Import
if (!content.includes('import sellersRoutes')) {
    content = content.replace(
        "import bcvRoutes from './src/api/bcv.routes.js';",
        "import bcvRoutes from './src/api/bcv.routes.js';\nimport sellersRoutes from './src/api/sellers.routes.js';"
    );
}

// 2. Add Route Mount
if (!content.includes("apiApp.use('/api/sellers'")) {
    // Try to find a good place to insert
    const insertPoint = "apiApp.use('/api/bcv', bcvRoutes);";
    if (content.includes(insertPoint)) {
        content = content.replace(
            insertPoint,
            insertPoint + "\n    apiApp.use('/api/sellers', sellersRoutes);"
        );
    } else {
        // Fallback: search for apiApp creation and add generic mount
        console.log("Could not find bcv route mount point, searching for alternative...");
        const altPoint = "apiApp.use(express.json());";
        if (content.includes(altPoint)) {
            content = content.replace(altPoint, altPoint + "\n    apiApp.use('/api/sellers', sellersRoutes);");
        }
    }
}

// 3. Fix CORS to ensure cocolu.emberdrago.com is present
if (!content.includes("'https://cocolu.emberdrago.com'")) {
    const corsMarker = "origin: [";
    const corsStart = content.indexOf(corsMarker);
    if (corsStart > -1) {
        const corsEnd = content.indexOf("]", corsStart);
        if (corsEnd > -1) {
            const currentOrigins = content.substring(corsStart + corsMarker.length, corsEnd);
            content = content.substring(0, corsEnd) + ", 'https://cocolu.emberdrago.com'" + content.substring(corsEnd);
        }
    }
}

// 4. Remove any previous bad injections (sed artifacts)
// Look for the dynamic import line I added earlier and remove it if present
const badLine = "apiApp.use('/api/sellers', (await import('./src/api/sellers.routes.js')).default);";
if (content.includes(badLine)) {
    content = content.replace(badLine, "");
}

fs.writeFileSync(join(__dirname, "app-integrated-fixed.js"), content);
console.log("✅ Fixed app file created");
