
import { BASE_URL, DEFAULT_ACCESS_TOKEN } from "../vercel-mcp-server/src/config/constants.js";

async function updateEnv() {
    const key = "REACT_APP_API_URL";
    const value = "https://api.emberdrago.com/api";
    const targets = ["production", "preview", "development"];

    console.log(`Updating ${key} to ${value}...`);

    try {
        const projectRes = await fetch(`${BASE_URL}/v9/projects/chatboot-cocoluventas`, {
            headers: { Authorization: `Bearer ${DEFAULT_ACCESS_TOKEN}` },
        });
        const project = await projectRes.json();

        // We might need to delete old one first if it exists, or just POST (Vercel allows multiple with same key for different targets, but usually we want one)
        // Actually Vercel API is often POST to create, PATCH to edit?
        // Easiest is to POST with type 'encrypted' or 'plain'.

        const body = {
            key,
            value,
            type: "plain",
            target: targets
        };

        const res = await fetch(`${BASE_URL}/v10/projects/${project.id}/env`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${DEFAULT_ACCESS_TOKEN}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(body)
        });

        if (res.ok) {
            console.log("✅ Environment variable updated.");
            const data = await res.json();
            console.log(data);
        } else {
            console.error(`Failed to update env: ${res.status}`);
            console.error(await res.text());
        }

        // Trigger redeployment? 
        // Changing env var usually requires a redeploy.
        // We can trigger a redeploy of the latest deployment or just tell user to redeploy.
        // Asking user to redeploy is safer/easier.

    } catch (error) {
        console.error("Error:", error);
    }
}

updateEnv();
