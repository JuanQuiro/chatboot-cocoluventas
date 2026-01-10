import { exec } from "child_process";

console.log("🚀 DEPLOYING FRONTEND...");

const cmd = `
cd c:\\Users\\grana\\chatboot-cocoluventas
git add .
git commit -m "Fix: Update auth endpoint to /api/auth/login matching backend"
git push origin master
`;

exec(cmd, { 'shell': 'powershell.exe' }, (error, stdout, stderr) => {
    if (error) {
        console.error(`exec error: ${error}`);
        // Check for specific git errors
        if (stderr.includes("Could not resolve host")) {
            console.log("❌ DNS Error - Retrying with different approach...");
        }
        return;
    }
    console.log(`stdout: ${stdout}`);
    console.error(`stderr: ${stderr}`);

    if (stderr.includes("Everything up-to-date")) {
        console.log("✅ Changes already up to date or empty commit");
    } else {
        console.log("✅ Push successful");
    }
});
