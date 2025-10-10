# 🎖️ MCP Badge Creator

> Create beautiful one-click install badges for your Model Context Protocol (MCP) servers that work with VS Code, VS Code Insiders, and Visual Studio.

## 🌟 Features

- ✅ **Easy to Use**: Simple form-based interface to generate badges
- 🎨 **Multiple IDEs**: Support for VS Code, VS Code Insiders, and Visual Studio
- 🔧 **Six Configuration Types**: 
  - Remote HTTP Server (HTTP/SSE transport)
  - NPX Package (Node.js packages)
  - UVX Package (Python packages with uv)
  - DNX Package (.NET packages)
  - Docker Container
  - Local Binary (custom commands)
- 📋 **Copy to Clipboard**: One-click copy of generated markdown
- 🖥️ **CLI Commands**: Generate cross-platform `code --add-mcp` commands for terminal installation
- � **Live Preview**: See your badges before copying
- 🎨 **Beautiful Design**: Modern, responsive UI with VS Code Insiders green theme

## 🚀 Live Demo

Visit the live application: [MCP Badge Creator](https://jamesmontemagno.github.io/mcp-badge-creator/)

## 📖 About MCP Badges

MCP badges provide a seamless way for users to install your Model Context Protocol servers directly into their IDE with a single click. These badges:

- Generate proper install URLs for each IDE
- Handle URL encoding of JSON configurations
- Follow official badge styling guidelines
- Support all MCP server deployment methods

## 🛠️ Supported Configuration Types

### 1. Remote HTTP Server
For MCP servers hosted remotely and accessible via HTTP/HTTPS with SSE transport.

```json

{
  "servers": {
    "server-name": {
      "type": "http",
      "url": "https://your-server-url.com"
    }
  }
}
```

### 2. NPX Package (Node.js)
For MCP servers distributed as NPM packages, commonly used in the MCP ecosystem.

```json
{
  "command": "npx",
  "args": ["-y", "@modelcontextprotocol/server-filesystem"],
  "env": {}
}
```

**Common Examples:**
- `@modelcontextprotocol/server-filesystem` - File system operations
- `@modelcontextprotocol/server-github` - GitHub API integration
- `@modelcontextprotocol/server-postgres` - PostgreSQL database access

### 3. UVX Package (Python)
For Python-based MCP servers using uv/uvx for fast, reliable Python package execution.

```json
{
  "command": "uvx",
  "args": ["--from", "mcp-server-git", "mcp-server-git"],
  "env": {}
}
```

**Alternative without --from:**
```json
{
  "command": "uvx",
  "args": ["mcp-server-git"],
  "env": {}
}
```

### 4. DNX Package (.NET)
For .NET-based MCP servers using DNX package manager.

```json
{
  "command": "dnx",
  "args": ["Contoso.SampleMcpServer@0.0.1-beta", "--yes"],
  "env": {}
}
```

### 5. Docker Container
For MCP servers packaged as Docker images.

```json
{
  "command": "docker",
  "args": ["run", "-i", "--rm", "your-username/your-image"],
  "env": {}
}
```

### 6. Local Binary
For MCP servers running as local executables with custom commands.

```json
{
  "command": "node",
  "args": ["path/to/server.js"],
  "env": {}
}
```

**Other common commands:**
- `python` - For Python scripts
- `uv` - For uv-managed Python projects
- Custom binaries in your PATH

## 🎯 How It Works

1. **Fill in Server Details**: Enter your MCP server name and configuration
2. **Choose Configuration Type**: Select between HTTP, NPX, UVX, Docker, or Local
3. **Select Target IDEs**: Choose which IDEs to generate badges for
4. **Copy & Use**: 
   - Copy the generated markdown badges for your README
   - Copy the JSON configuration for manual setup
   - Copy the CLI commands for terminal installation

### 🖥️ CLI Command Installation

The badge creator also generates ready-to-use CLI commands for installing MCP servers:

```bash
# For VS Code
code --add-mcp '{\"name\":\"server-name\",\"command\":\"npx\",\"args\":[\"-y\",\"package\"],\"env\":{}}'

# For VS Code Insiders
code-insiders --add-mcp '{\"name\":\"server-name\",\"command\":\"npx\",\"args\":[\"-y\",\"package\"],\"env\":{}}'
```

These commands work cross-platform in:
- ✅ PowerShell (Windows)
- ✅ Bash (Linux/macOS)
- ✅ Zsh (macOS default)

See [CLI-COMMANDS.md](CLI-COMMANDS.md) for detailed documentation and examples.

## 💻 Development

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Setup

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/mcp-badge-creator.git
cd mcp-badge-creator

# Install dependencies
npm install

# Start development server
npm run dev
```

### Build

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

## 🚀 Deployment to GitHub Pages

This project is configured to automatically deploy to GitHub Pages using GitHub Actions.

### Setup Instructions

1. Push your code to GitHub
2. Go to your repository Settings > Pages
3. Under "Build and deployment", select "GitHub Actions" as the source
4. The site will automatically deploy on every push to the main branch

### Manual Deployment

Alternatively, you can use gh-pages:

```bash
# Install gh-pages
npm install --save-dev gh-pages

# Deploy
npm run deploy
```

## 📚 Resources

- [Model Context Protocol Documentation](https://modelcontextprotocol.io)
- [MCP Badge Documentation](https://github.com/jamesmontemagno/MonkeyMCP/blob/main/.github/prompts/add-mcp-install-badges.md)
- [MonkeyMCP Example](https://github.com/jamesmontemagno/monkeymcp)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT License - feel free to use this tool for your projects!

## 🙏 Acknowledgments

- Badge documentation based on [MonkeyMCP](https://github.com/jamesmontemagno/MonkeyMCP) by James Montemagno
- Built with [Vite](https://vite.dev) and [React](https://react.dev)
- Badges powered by [Shields.io](https://shields.io)

---

Made with ❤️ for the MCP community

