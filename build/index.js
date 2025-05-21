import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import fetch from "node-fetch";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import path from "path";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Load .env from root, even after build
dotenv.config({ path: path.resolve(__dirname, "../.env") });
// GitHub API base
const GITHUB_API = "https://api.github.com";
console.log("GITHUB_TOKEN:", process.env.GITHUB_TOKEN);
// Server definition
const server = new McpServer({
    name: "github",
    version: "1.0.0",
    capabilities: {
        resources: {},
        tools: {},
    },
});
// Tool: List public repos for a given username
server.tool("list-public-repos", "List public repositories for a GitHub user", {
    username: z.string().min(1).describe("GitHub username (e.g., 'octocat')"),
}, async ({ username }) => {
    const url = `${GITHUB_API}/users/${username}/repos`;
    try {
        const res = await fetch(url);
        if (!res.ok)
            throw new Error(`GitHub error: ${res.status}`);
        const repos = await res.json();
        if (!Array.isArray(repos) || repos.length === 0) {
            return {
                content: [{ type: "text", text: `No public repos found for user "${username}".` }],
            };
        }
        const names = repos.map((repo) => `- ${repo.name} (${repo.html_url})`).join("\n");
        return {
            content: [{ type: "text", text: `Public Repositories for "${username}":\n\n${names}` }],
        };
    }
    catch (err) {
        return {
            content: [{ type: "text", text: `Failed to fetch repos: ${err.message}` }],
        };
    }
});
server.tool("create-github-issue", "Create a GitHub issue in a specified repository", {
    username: z.string().min(1).describe("GitHub username or organization (e.g., 'guptarajiv535')"),
    repo: z.string().min(1).describe("Repository name (e.g., 'guptarajiv535/sample-repo')"),
    title: z.string().min(1).describe("Issue title"),
    body: z.string().describe("Issue body"),
}, async ({ username, repo, title, body }) => {
    const url = `${GITHUB_API}/repos/${username}/${repo}/issues`;
    const token = process.env.GITHUB_TOKEN?.trim();
    // TODO: uncomment this to see the token for debugging
    console.error("GITHUB_TOKEN:", token);
    const headers = {
        "Authorization": `Bearer ${token}`,
        "Accept": "application/vnd.github+json",
        "Content-Type": "application/json",
        // "User-Agent": "curl/7.68.0",
        "X-GitHub-Api-Version": "2022-11-28",
    };
    const payload = { title, body, labels: ["bug"] };
    // TODO: uncomment this to see the request for debugging
    console.error("DEBUG REQUEST:", { url, headers, payload });
    try {
        const res = await fetch(url, {
            method: "POST",
            headers,
            body: JSON.stringify(payload),
        });
        if (!res.ok) {
            const errorData = await res.json();
            throw new Error(`GitHub API error: ${res.status} ${errorData.message}`);
        }
        const data = await res.json();
        return {
            content: [{ type: "text", text: `Issue created: ${data.html_url}` }],
        };
    }
    catch (err) {
        return {
            content: [{ type: "text", text: `Failed to create issue: ${err.message}` }],
        };
    }
});
server.tool("list-issues", "List issues from a GitHub repository", {
    repo: z.string().min(1).describe("Repository name (e.g., 'guptarajiv535/sample-repo')"),
    username: z.string().min(1).describe("GitHub username or organization (e.g., 'guptarajiv535')"),
    state: z.enum(["open", "closed", "all"]).default("open").describe("State of issues to list (open, closed, all)"),
}, async ({ repo, username, state }) => {
    const url = `${GITHUB_API}/repos/${username}/${repo}/issues?state=${state}`;
    try {
        const res = await fetch(url, {
            headers: {
                "Accept": "application/vnd.github.v3+json",
                "User-Agent": "mcp-server-poc/1.0",
            },
        });
        if (!res.ok)
            throw new Error(`GitHub error: ${res.status}`);
        const issues = await res.json();
        if (!Array.isArray(issues) || issues.length === 0) {
            return {
                content: [{ type: "text", text: `No open issues found for repo \"${repo}\".` }],
            };
        }
        const list = issues.map((issue) => `- ${issue.title} (${issue.html_url})`).join("\n");
        return {
            content: [{ type: "text", text: `Open Issues for \"${repo}\":\n\n${list}` }],
        };
    }
    catch (err) {
        return {
            content: [{ type: "text", text: `Failed to fetch issues: ${err.message}` }],
        };
    }
});
// Main function
async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("GitHub MCP Server running on stdio");
}
main().catch((error) => {
    console.error("Fatal error in main():", error);
    process.exit(1);
});
