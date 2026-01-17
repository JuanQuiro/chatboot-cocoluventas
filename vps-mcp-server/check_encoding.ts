import fs from 'fs';
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const buffer = fs.readFileSync(join(__dirname, "enhanced_routes_local.js"));
console.log("First 20 bytes HEX:", buffer.subarray(0, 20).toString('hex'));
console.log("First 50 chars as UTF8:", buffer.subarray(0, 50).toString('utf8'));
console.log("First 50 chars as UTF16LE:", buffer.subarray(0, 50).toString('utf16le'));
