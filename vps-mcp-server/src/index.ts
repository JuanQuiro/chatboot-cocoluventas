#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { Client } from "ssh2";
import dotenv from "dotenv";
import { join } from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, "../.env") });

const VPS_HOST = process.env.VPS_HOST;
const VPS_PORT = parseInt(process.env.VPS_PORT || "22");
const VPS_USERNAME = process.env.VPS_USERNAME;
const VPS_PASSWORD = process.env.VPS_PASSWORD;

if (!VPS_HOST || !VPS_USERNAME || !VPS_PASSWORD) {
    console.error("Missing required environment variables (VPS_HOST, VPS_USERNAME, VPS_PASSWORD)");
    process.exit(1);
}

// Create MCP server
const server = new McpServer({
    name: "vps-mcp-server",
    version: "1.0.0"
});

// Helper function to execute SSH command
async function executeCommand(command: string): Promise<{ stdout: string; stderr: string; code: number }> {
    return new Promise((resolve, reject) => {
        const conn = new Client();
        conn.on("ready", () => {
            conn.exec(command, (err, stream) => {
                if (err) {
                    conn.end();
                    return reject(err);
                }
                let stdout = "";
                let stderr = "";
                stream.on("close", (code: number, signal: any) => {
                    conn.end();
                    resolve({ stdout, stderr, code });
                }).on("data", (data: any) => {
                    stdout += data;
                }).stderr.on("data", (data: any) => {
                    stderr += data;
                });
            });
        }).on("error", (err) => {
            reject(err);
        }).connect({
            host: VPS_HOST,
            port: VPS_PORT,
            username: VPS_USERNAME,
            password: VPS_PASSWORD,
        });
    });
}

// Helper function to list files (SFTP)
async function listFiles(path: string): Promise<any[]> {
    return new Promise((resolve, reject) => {
        const conn = new Client();
        conn.on("ready", () => {
            conn.sftp((err, sftp) => {
                if (err) {
                    conn.end();
                    return reject(err);
                }
                sftp.readdir(path, (err, list) => {
                    conn.end();
                    if (err) return reject(err);
                    resolve(list);
                });
            });
        }).on("error", (err) => {
            reject(err);
        }).connect({
            host: VPS_HOST,
            port: VPS_PORT,
            username: VPS_USERNAME,
            password: VPS_PASSWORD,
        });
    });
}

// Register tools
server.tool(
    "vps_run_command",
    "Execute a shell command on the VPS",
    {
        command: z.string().describe("The command to execute (e.g., 'ls -la', 'systemctl status nginx')"),
    },
    async ({ command }) => {
        try {
            const result = await executeCommand(command);
            return {
                content: [
                    {
                        type: "text",
                        text: `Output:\n${result.stdout}\n\nErrors:\n${result.stderr}\n\nExit Code: ${result.code}`,
                    },
                ],
            };
        } catch (error: any) {
            return {
                content: [{ type: "text", text: `SSH Error: ${error.message}` }],
                isError: true,
            };
        }
    }
);

server.tool(
    "vps_list_files",
    "List files in a directory on the VPS",
    {
        path: z.string().describe("The remote path to list (e.g., '/var/www')"),
    },
    async ({ path }) => {
        try {
            const list = await listFiles(path);
            const formatted = list.map(item => ({
                name: item.filename,
                longname: item.longname,
                attrs: item.attrs
            }));
            return {
                content: [{ type: "text", text: JSON.stringify(formatted, null, 2) }],
            };
        } catch (error: any) {
            return {
                content: [{ type: "text", text: `SFTP Error: ${error.message}` }],
                isError: true,
            };
        }
    }
);

async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("VPS MCP Server running on stdio");
}

main().catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
});
