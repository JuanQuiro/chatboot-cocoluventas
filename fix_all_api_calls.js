const fs = require('fs');
const path = require('path');

const pagesDir = path.join(__dirname, '..', 'dashboard', 'src', 'pages');

const files = fs.readdirSync(pagesDir).filter(f => f.endsWith('.jsx') || f.endsWith('.js'));

let totalFixed = 0;

files.forEach(file => {
    const filePath = path.join(pagesDir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // Pattern 1: fetch('/api/...')
    if (content.includes("fetch('/api/")) {
        const lines = content.split('\n');
        const newLines = [];
        let inFetchBlock = false;

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];

            // Check if this line has fetch('/api/
            if (line.includes("fetch('/api/")) {
                // Replace fetch('/api/xxx') with proper baseURL usage
                const newLine = line.replace(
                    /fetch\('\/api\/([\w\-\/]+)'/g,
                    "fetch(`\${process.env.REACT_APP_API_URL || '/api'}/$1`"
                );

                // If there's a headers object, we need to add Authorization
                newLines.push(newLine);
                modified = true;
            } else {
                newLines.push(line);
            }
        }

        if (modified) {
            content = newLines.join('\n');
            fs.writeFileSync(filePath, content, 'utf8');
            console.log(`✅ Fixed: ${file}`);
            totalFixed++;
        }
    }
});

console.log(`\n🎉 Total files fixed: ${totalFixed}`);
