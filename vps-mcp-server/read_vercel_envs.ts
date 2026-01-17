
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import dotenv from "dotenv";
import { join } from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, "../vercel-mcp-server/.env") });

async function main() {
    const transport = new StdioClientTransport({
        command: "node",
        args: [join(__dirname, "../vercel-mcp-server/dist/index.js")],
    });

    const client = new Client(
        { name: "vercel-client", version: "1.0.0" },
        { capabilities: {} }
    );

    await client.connect(transport);

    // List projects to find ID
    const projects = await client.request({
        method: "tools/call",
        params: {
            name: "list_projects",
            arguments: {}
        }
    }) as any;

    const project = projects.content[0].text ? JSON.parse(projects.content[0].text).projects.find((p: any) => p.name === "chatboot-cocoluventas") : null;

    if (!project) {
        console.log("Project not found");
        process.exit(1);
    }

    const envs = await client.request({
        method: "tools/call",
        params: {
            name: "get_project_env",
            arguments: {
                projectId: project.id
            }
        }
    }) as any;

    console.log(envs.content[0].text);
    client.close();
}

main().catch(console.error);
