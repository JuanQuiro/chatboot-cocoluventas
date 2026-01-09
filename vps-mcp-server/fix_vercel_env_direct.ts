
import fetch from "node-fetch";

const TOKEN = "iRkQvh4zXkhDlAuJhIXFjuXh";
const PROJECT_NAME = "chatboot-cocoluventas";
const TARGET_URL = "https://api.emberdrago.com/api";
const KEY = "REACT_APP_API_URL";

async function main() {
    console.log(`Checking Env Vars for ${PROJECT_NAME}...`);

    // 1. Get Envs
    const listRes = await fetch(`https://api.vercel.com/v9/projects/${PROJECT_NAME}/env`, {
        headers: { "Authorization": `Bearer ${TOKEN}` }
    });

    if (!listRes.ok) {
        console.error("Failed to list envs:", await listRes.text());
        return;
    }

    const data = await listRes.json();
    const existing = data.envs.find((e: any) => e.key === KEY);

    if (existing) {
        console.log(`Found existing ${KEY} (ID: ${existing.id}). Deleting...`);
        const delRes = await fetch(`https://api.vercel.com/v9/projects/${PROJECT_NAME}/env/${existing.id}`, {
            method: "DELETE",
            headers: { "Authorization": `Bearer ${TOKEN}` }
        });
        if (!delRes.ok) console.error("Failed to delete:", await delRes.text());
        else console.log("Deleted successfully.");
    } else {
        console.log(`${KEY} not found.`);
    }

    // 2. Add New Env
    console.log(`Adding new ${KEY}=${TARGET_URL}...`);
    const addRes = await fetch(`https://api.vercel.com/v9/projects/${PROJECT_NAME}/env`, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${TOKEN}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            key: KEY,
            value: TARGET_URL,
            type: "plain",
            target: ["production", "preview", "development"]
        })
    });

    if (!addRes.ok) {
        console.error("Failed to add env:", await addRes.text());
    } else {
        console.log("Environment variable updated successfully!");
    }
}

main();
