
import { spawn } from "child_process";

// Curl from THIS machine (Agent/User local) to the VPS
console.log("Testing connection from Local Agent to VPS URL...");

const url = "https://api.emberdrago.com/api/login";
// const url = "http://173.249.205.142:3009/api/login"; // Fallback to raw IP if domain fails

const curl = spawn("curl", ["-v", "-X", "POST", url, "--connect-timeout", "10"]);

curl.stdout.on("data", (data) => console.log(data.toString()));
curl.stderr.on("data", (data) => console.error(data.toString()));

curl.on("close", (code) => {
    console.log(`Curl exited with code ${code}`);
});
