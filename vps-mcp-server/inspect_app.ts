import fs from 'fs';
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const content = fs.readFileSync(join(__dirname, "app_downloaded.js"), "utf8"); // binaries might create utf16

// Print first 500 chars to see what we have
console.log(content.substring(0, 500));
