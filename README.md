# MCP GitHub PoC

A Node.js server implementing the Model Context Protocol (MCP) to connect Cursor AI to GitHub. This server enables listing public repositories, creating issues, and fetching open issues from GitHub repositories via simple tool commands.

## Features

- **List Public Repos**: List all public repositories for a given GitHub user.
- **Create GitHub Issue**: Create a new issue in a specified GitHub repository.
- **List Open Issues**: List all open issues in a specified GitHub repository.

## Setup

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd mcp-server-poc
   ```
2. **Install dependencies**
   ```bash
   npm install
   ```
3. **Set up environment variables**
   - Create a `.env` file in the root directory.
   - Add your GitHub personal access token:
     ```env
     GITHUB_TOKEN=your_github_token_here
     ```
4. **Build the project**
   ```bash
   npm run build
   ```
5. **Run the server**
   ```bash
   node build/index.js
   ```

## Usage

You can use this server with Cursor AI or any MCP-compatible client. Example tool prompts:

- **List public repos for a user**
  > List repos for octocat

- **Create an issue in a repo**
  > Create issue in guptarajiv535/sample-repo with title "Bug report" and body "There is a bug."

- **List open issues in a repo**
  > List open issues in guptarajiv535/sample-repo

### Tool Reference

- `list-public-repos`: Lists public repos for a user.
- `create-github-issue`: Creates an issue in a repo.
- `list-open-issues`: Lists open issues in a repo.

## Development

- **TypeScript compilation**: The source code is in `src/`. Compiled output is in `build/`.
- **Build**: `npm run build`
- **Run**: `node build/index.js`

## Requirements

- Node.js (v16+ recommended)
- A GitHub personal access token with `repo` permissions

## License

ISC