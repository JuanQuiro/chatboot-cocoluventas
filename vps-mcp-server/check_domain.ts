
import { BASE_URL, DEFAULT_ACCESS_TOKEN } from "../vercel-mcp-server/src/config/constants.js";

async function checkDomain() {
    const domain = "cocolu.emberdrago.com";
    console.log(`Checking domain ${domain}...`);

    try {
        // List domains for the project (assuming project name is 'chatboot-cocoluventas')
        // We need to know the project ID first, or just list all domains and filter
        const projectRes = await fetch(`${BASE_URL}/v9/projects/chatboot-cocoluventas`, {
            headers: { Authorization: `Bearer ${DEFAULT_ACCESS_TOKEN}` },
        });

        if (!projectRes.ok) throw new Error("Failed to get project");
        const project = await projectRes.json();

        const domainsRes = await fetch(`${BASE_URL}/v9/projects/${project.id}/domains`, {
            headers: { Authorization: `Bearer ${DEFAULT_ACCESS_TOKEN}` },
        });

        if (domainsRes.ok) {
            const data = await domainsRes.json();
            const found = data.domains.find((d: any) => d.name === domain);
            if (found) {
                console.log(`✅ Domain ${domain} is configured.`);
                console.log(`Status: ${found.verified ? "Verified" : "Not Verified"}`);
            } else {
                console.log(`❌ Domain ${domain} is NOT configured for this project.`);
                console.log("Configured domains:", data.domains.map((d: any) => d.name).join(", "));
            }
        }

    } catch (error) {
        console.error("Error:", error);
    }
}

checkDomain();
