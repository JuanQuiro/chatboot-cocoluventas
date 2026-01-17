
import { BASE_URL, DEFAULT_ACCESS_TOKEN } from "../vercel-mcp-server/src/config/constants.js";

async function addDomain() {
    const domain = "cocolu.emberdrago.com";
    console.log(`Adding domain ${domain}...`);

    try {
        const projectRes = await fetch(`${BASE_URL}/v9/projects/chatboot-cocoluventas`, {
            headers: { Authorization: `Bearer ${DEFAULT_ACCESS_TOKEN}` },
        });
        const project = await projectRes.json();

        const addRes = await fetch(`${BASE_URL}/v10/projects/${project.id}/domains`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${DEFAULT_ACCESS_TOKEN}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ name: domain })
        });

        if (addRes.ok) {
            console.log(`✅ Should be added. Status: ${addRes.status}`);
            const data = await addRes.json();
            console.log(data);
        } else {
            console.error(`Failed to add domain: ${addRes.status}`);
            console.error(await addRes.text());
        }

    } catch (error) {
        console.error("Error:", error);
    }
}

addDomain();
