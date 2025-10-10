import { useState, useEffect } from 'react'
import './App.css'

type ConfigType = 'http' | 'docker' | 'local' | 'npx' | 'uvx' | 'dnx';

interface MCPConfig {
  name?: string; // Only used for encoding in URL parameters, not in the actual config
  type?: string;
  url?: string;
  command?: string;
  args?: string[];
  env?: Record<string, string>;
}

function App() {
  const [serverName, setServerName] = useState('')
  const [configType, setConfigType] = useState<ConfigType>('http')
  const [serverUrl, setServerUrl] = useState('')
  const [dockerImage, setDockerImage] = useState('')
  const [localCommand, setLocalCommand] = useState('node')
  const [localArgs, setLocalArgs] = useState('')
  const [npxPackage, setNpxPackage] = useState('')
  const [uvxPackage, setUvxPackage] = useState('')
  const [uvxFrom, setUvxFrom] = useState('')
  const [dnxPackage, setDnxPackage] = useState('')
  const [includeVSCode, setIncludeVSCode] = useState(true)
  const [includeVSCodeInsiders, setIncludeVSCodeInsiders] = useState(true)
  const [includeVisualStudio, setIncludeVisualStudio] = useState(true)
  const [includeCursor, setIncludeCursor] = useState(false)
  const [includeGoose, setIncludeGoose] = useState(false)
  const [includeLMStudio, setIncludeLMStudio] = useState(false)
  // Additional platforms for README inclusion
  const [includeAmp, setIncludeAmp] = useState(false)
  const [includeClaudeCode, setIncludeClaudeCode] = useState(false)
  const [includeClaudeDesktop, setIncludeClaudeDesktop] = useState(false)
  const [includeCodex, setIncludeCodex] = useState(false)
  const [includeGeminiCLI, setIncludeGeminiCLI] = useState(false)
  const [includeOpenCode, setIncludeOpenCode] = useState(false)
  const [includeQodoGen, setIncludeQodoGen] = useState(false)
  const [includeWarp, setIncludeWarp] = useState(false)
  const [includeWindsurf, setIncludeWindsurf] = useState(false)
  // Badge text customization
  const [badgeText, setBadgeText] = useState('Install Server')
  // Select all functionality
  const [selectAllBadges, setSelectAllBadges] = useState(false)
  const [selectAllReadme, setSelectAllReadme] = useState(false)
  const [copied, setCopied] = useState(false)
  const [copiedJson, setCopiedJson] = useState(false)
  const [copiedCli, setCopiedCli] = useState(false)
  const [copiedCliInsiders, setCopiedCliInsiders] = useState(false)
  const [copiedReadme, setCopiedReadme] = useState(false)
  const [activeTab, setActiveTab] = useState<'badges' | 'readme'>('badges')

  const generateConfig = (): MCPConfig => {
    const config: MCPConfig = {};
    
    switch (configType) {
      case 'http':
        // HTTP servers only have type and url (no name in the actual config)
        config.type = 'http';
        config.url = serverUrl;
        break;
      case 'docker':
        // STDIO servers have command, args, and env (no name or type)
        config.command = 'docker';
        config.args = ['run', '-i', '--rm', dockerImage];
        config.env = {};
        break;
      case 'npx':
        config.command = 'npx';
        config.args = ['-y', npxPackage];
        config.env = {};
        break;
      case 'uvx': {
        config.command = 'uvx';
        const uvxArgs = uvxFrom ? ['--from', uvxFrom, uvxPackage] : [uvxPackage];
        config.args = uvxArgs;
        config.env = {};
        break;
      }
      case 'dnx':
        config.command = 'dnx';
        config.args = [dnxPackage, '--yes'];
        config.env = {};
        break;
      case 'local':
        config.command = localCommand;
        config.args = localArgs.split(',').map(arg => arg.trim()).filter(arg => arg);
        config.env = {};
        break;
    }
    
    return config;
  }

  const encodeConfig = (config: MCPConfig): string => {
    return encodeURIComponent(JSON.stringify(config));
  }

  const generateCliCommand = (isInsiders: boolean = false): string => {
    const config = generateConfig();
    // CLI command requires name property inside the config JSON
    const cliConfig = { name: serverName, ...config };
    const jsonString = JSON.stringify(cliConfig);
    // Escape with backslashes for cross-platform compatibility (works in PowerShell, Bash, Zsh)
    const escapedJson = jsonString.replace(/"/g, '\\"');
    const command = isInsiders ? 'code-insiders' : 'code';
    return `${command} --add-mcp '${escapedJson}'`;
  }

  const generateFullConfig = () => {
    const config = generateConfig();
    return {
      servers: {
        [serverName]: config
      }
    };
  }

  const copyToClipboardWithState = async (text: string, setStateFn: (value: boolean) => void) => {
    if (text) {
      await navigator.clipboard.writeText(text);
      setStateFn(true);
      setTimeout(() => setStateFn(false), 2000);
    }
  }

  const handleSelectAllBadges = (checked: boolean) => {
    setSelectAllBadges(checked);
    setIncludeVSCode(checked);
    setIncludeVSCodeInsiders(checked);
    setIncludeVisualStudio(checked);
    setIncludeCursor(checked);
    setIncludeGoose(checked);
    setIncludeLMStudio(checked);
  }

  const handleSelectAllReadme = (checked: boolean) => {
    setSelectAllReadme(checked);
    setIncludeVSCode(checked);
    setIncludeVSCodeInsiders(checked);
    setIncludeVisualStudio(checked);
    setIncludeCursor(checked);
    setIncludeGoose(checked);
    setIncludeLMStudio(checked);
    setIncludeAmp(checked);
    setIncludeClaudeCode(checked);
    setIncludeClaudeDesktop(checked);
    setIncludeCodex(checked);
    setIncludeGeminiCLI(checked);
    setIncludeOpenCode(checked);
    setIncludeQodoGen(checked);
    setIncludeWarp(checked);
    setIncludeWindsurf(checked);
  }

  // Sync select all badges state with individual badge states
  useEffect(() => {
    const allBadgesSelected = includeVSCode && includeVSCodeInsiders && includeVisualStudio && includeCursor && includeGoose && includeLMStudio;
    setSelectAllBadges(allBadgesSelected);
  }, [includeVSCode, includeVSCodeInsiders, includeVisualStudio, includeCursor, includeGoose, includeLMStudio]);

  // Sync select all readme state with individual readme states
  useEffect(() => {
    const allReadmeSelected = includeVSCode && includeVSCodeInsiders && includeVisualStudio && includeCursor && includeGoose && includeLMStudio && includeAmp && includeClaudeCode && includeClaudeDesktop && includeCodex && includeGeminiCLI && includeOpenCode && includeQodoGen && includeWarp && includeWindsurf;
    setSelectAllReadme(allReadmeSelected);
  }, [includeVSCode, includeVSCodeInsiders, includeVisualStudio, includeCursor, includeGoose, includeLMStudio, includeAmp, includeClaudeCode, includeClaudeDesktop, includeCodex, includeGeminiCLI, includeOpenCode, includeQodoGen, includeWarp, includeWindsurf]);

  const generateMarkdown = (): string => {
    if (!serverName) return '';
    
    const config = generateConfig();
    const encodedConfig = encodeConfig(config);
    const badges: string[] = [];

    const customBadgeText = badgeText.replace(/\s/g, '_');

    if (includeVSCode) {
      const vscodeUrl = `https://vscode.dev/redirect/mcp/install?name=${encodeURIComponent(serverName)}&config=${encodedConfig}`;
      badges.push(`[![Install in VS Code](https://img.shields.io/badge/VS_Code-${customBadgeText}-0098FF?style=flat-square&logo=visualstudiocode&logoColor=white)](${vscodeUrl})`);
    }

    if (includeVSCodeInsiders) {
      const vscodeInsidersUrl = `https://insiders.vscode.dev/redirect/mcp/install?name=${encodeURIComponent(serverName)}&config=${encodedConfig}&quality=insiders`;
      badges.push(`[![Install in VS Code Insiders](https://img.shields.io/badge/VS_Code_Insiders-${customBadgeText}-24bfa5?style=flat-square&logo=visualstudiocode&logoColor=white)](${vscodeInsidersUrl})`);
    }

    if (includeVisualStudio) {
      const vsUrl = `https://vs-open.link/mcp-install?${encodedConfig}`;
      badges.push(`[![Install in Visual Studio](https://img.shields.io/badge/Visual_Studio-${customBadgeText}-C16FDE?logo=visualstudio&logoColor=white)](${vsUrl})`);
    }

    if (includeCursor) {
      // Use Cursor's official badge from their repository
      const configWithName = { name: serverName, ...config };
      const base64Config = btoa(JSON.stringify(configWithName));
      const cursorUrl = `https://cursor.com/en/install-mcp?name=${encodeURIComponent(serverName)}&config=${base64Config}`;
      badges.push(`[<img src="https://cursor.com/deeplink/mcp-install-dark.svg" alt="Install in Cursor">](${cursorUrl})`);
    }

    if (includeGoose) {
      // Use Goose's official badge format from Playwright repository
      const configWithName = { name: serverName, ...config };
      const args = configWithName.args ? configWithName.args.join('%20') : '';
      const cmd = configWithName.command || '';
      const gooseUrl = `https://block.github.io/goose/extension?cmd=${encodeURIComponent(cmd)}&arg=${encodeURIComponent(args)}&id=${encodeURIComponent(serverName)}&name=${encodeURIComponent(serverName)}&description=MCP%20Server%20for%20${encodeURIComponent(serverName)}`;
      badges.push(`[![Install in Goose](https://block.github.io/goose/img/extension-install-dark.svg)](${gooseUrl})`);
    }

    if (includeLMStudio) {
      // Use LM Studio's official badge format from Playwright repository
      const configWithName = { name: serverName, ...config };
      const base64Config = btoa(JSON.stringify(configWithName));
      const lmstudioUrl = `https://lmstudio.ai/install-mcp?name=${encodeURIComponent(serverName)}&config=${base64Config}`;
      badges.push(`[![Add MCP Server ${serverName} to LM Studio](https://files.lmstudio.ai/deeplink/mcp-install-light.svg)](${lmstudioUrl})`);
    }

    return badges.join('\n');
  }

  const copyToClipboard = async () => {
    const markdown = generateMarkdown();
    if (markdown) {
      await navigator.clipboard.writeText(markdown);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  const generateReadmeContent = (): string => {
    if (!serverName) return '';
    
    const fullConfig = generateFullConfig();
    const jsonConfig = JSON.stringify(fullConfig, null, 2);
    
    let readmeContent = `## Getting Started\n\n`;
    readmeContent += `### Quick Install\n\n`;
    readmeContent += `Click one of the buttons below to install the MCP server in your preferred IDE:\n\n`;
    
    // Add badges
    readmeContent += generateMarkdown() + '\n\n';
    
    // Add manual installation section
    readmeContent += `### Manual Installation\n\n`;
    readmeContent += `**Standard config** works in most tools:\n\n`;
    readmeContent += `\`\`\`js\n${jsonConfig}\n\`\`\`\n\n`;
    
    // VS Code section
    if (includeVSCode) {
      readmeContent += `<details>\n<summary>VS Code</summary>\n\n`;
      readmeContent += `#### Click the button to install:\n\n`;
      const vscodeUrl = `https://vscode.dev/redirect/mcp/install?name=${encodeURIComponent(serverName)}&config=${encodeConfig(generateConfig())}`;
      readmeContent += `[![Install in VS Code](https://img.shields.io/badge/VS_Code-${badgeText.replace(/\\s/g, '_')}-0098FF?style=flat-square&logo=visualstudiocode&logoColor=white)](${vscodeUrl})\n\n`;
      readmeContent += `#### Or install manually:\n\n`;
      readmeContent += `Follow the MCP install [guide](https://code.visualstudio.com/docs/copilot/chat/mcp-servers#_add-an-mcp-server), use the standard config above. You can also install the ${serverName} MCP server using the VS Code CLI:\n\n`;
      readmeContent += `\`\`\`bash\n${generateCliCommand(false)}\n\`\`\`\n\n`;
      readmeContent += `After installation, the ${serverName} MCP server will be available for use with your GitHub Copilot agent in VS Code.\n</details>\n\n`;
    }
    
    // VS Code Insiders section
    if (includeVSCodeInsiders) {
      readmeContent += `<details>\n<summary>VS Code Insiders</summary>\n\n`;
      readmeContent += `#### Click the button to install:\n\n`;
      const vscodeInsidersUrl = `https://insiders.vscode.dev/redirect/mcp/install?name=${encodeURIComponent(serverName)}&config=${encodeConfig(generateConfig())}&quality=insiders`;
      readmeContent += `[![Install in VS Code Insiders](https://img.shields.io/badge/VS_Code_Insiders-${badgeText.replace(/\\s/g, '_')}-24bfa5?style=flat-square&logo=visualstudiocode&logoColor=white)](${vscodeInsidersUrl})\n\n`;
      readmeContent += `#### Or install manually:\n\n`;
      readmeContent += `Follow the MCP install [guide](https://code.visualstudio.com/docs/copilot/chat/mcp-servers#_add-an-mcp-server), use the standard config above. You can also install the ${serverName} MCP server using the VS Code Insiders CLI:\n\n`;
      readmeContent += `\`\`\`bash\n${generateCliCommand(true)}\n\`\`\`\n\n`;
      readmeContent += `After installation, the ${serverName} MCP server will be available for use with your GitHub Copilot agent in VS Code Insiders.\n</details>\n\n`;
    }
    
    // Visual Studio section
    if (includeVisualStudio) {
      readmeContent += `<details>\n<summary>Visual Studio</summary>\n\n`;
      readmeContent += `#### Click the button to install:\n\n`;
      const vsUrl = `https://vs-open.link/mcp-install?${encodeConfig(generateConfig())}`;
      readmeContent += `[![Install in Visual Studio](https://img.shields.io/badge/Visual_Studio-${badgeText.replace(/\\s/g, '_')}-C16FDE?logo=visualstudio&logoColor=white)](${vsUrl})\n\n`;
      readmeContent += `#### Or install manually:\n\n`;
      readmeContent += `1. Open Visual Studio\n`;
      readmeContent += `2. Navigate to Tools > Options > MCP Servers\n`;
      readmeContent += `3. Click "Add Server" and enter the configuration:\n\n`;
      readmeContent += `\`\`\`json\n${jsonConfig}\n\`\`\`\n</details>\n\n`;
    }
    
    // Cursor section
    if (includeCursor) {
      readmeContent += `<details>\n<summary>Cursor</summary>\n\n`;
      readmeContent += `#### Click the button to install:\n\n`;
      const configWithName = { name: serverName, ...generateConfig() };
      const base64Config = btoa(JSON.stringify(configWithName));
      const cursorUrl = `https://cursor.com/en/install-mcp?name=${encodeURIComponent(serverName)}&config=${base64Config}`;
      readmeContent += `[<img src="https://cursor.com/deeplink/mcp-install-dark.svg" alt="Install in Cursor">](${cursorUrl})\n\n`;
      readmeContent += `#### Or install manually:\n\n`;
      readmeContent += `Go to \`Cursor Settings\` -> \`MCP\` -> \`Add new MCP Server\`. Name to your liking, use \`command\` type with the command from the standard config above. You can also verify config or add command like arguments via clicking \`Edit\`.\n</details>\n\n`;
    }
    
    // Goose section
    if (includeGoose) {
      readmeContent += `<details>\n<summary>Goose</summary>\n\n`;
      readmeContent += `#### Click the button to install:\n\n`;
      const configWithName = { name: serverName, ...generateConfig() };
      const args = configWithName.args ? configWithName.args.join('%20') : '';
      const cmd = configWithName.command || '';
      const gooseUrl = `https://block.github.io/goose/extension?cmd=${encodeURIComponent(cmd)}&arg=${encodeURIComponent(args)}&id=${encodeURIComponent(serverName)}&name=${encodeURIComponent(serverName)}&description=MCP%20Server%20for%20${encodeURIComponent(serverName)}`;
      readmeContent += `[![Install in Goose](https://block.github.io/goose/img/extension-install-dark.svg)](${gooseUrl})\n\n`;
      readmeContent += `#### Or install manually:\n\n`;
      readmeContent += `Go to \`Advanced settings\` -> \`Extensions\` -> \`Add custom extension\`. Name to your liking, use type \`STDIO\`, and set the \`command\` from the standard config above. Click "Add Extension".\n</details>\n\n`;
    }
    
    // LM Studio section
    if (includeLMStudio) {
      readmeContent += `<details>\n<summary>LM Studio</summary>\n\n`;
      readmeContent += `#### Click the button to install:\n\n`;
      const configWithName = { name: serverName, ...generateConfig() };
      const base64Config = btoa(JSON.stringify(configWithName));
      const lmstudioUrl = `https://lmstudio.ai/install-mcp?name=${encodeURIComponent(serverName)}&config=${base64Config}`;
      readmeContent += `[![Add MCP Server ${serverName} to LM Studio](https://files.lmstudio.ai/deeplink/mcp-install-light.svg)](${lmstudioUrl})\n\n`;
      readmeContent += `#### Or install manually:\n\n`;
      readmeContent += `Go to \`Program\` in the right sidebar -> \`Install\` -> \`Edit mcp.json\`. Use the standard config above.\n</details>\n\n`;
    }

    // Additional platform sections
    if (includeAmp) {
      readmeContent += `<details>\n<summary>Amp</summary>\n\n`;
      readmeContent += `Add via the Amp VS Code extension settings screen or by updating your settings.json file:\n\n`;
      readmeContent += `\`\`\`json\n"amp.mcpServers": ${JSON.stringify({ [serverName]: generateConfig() }, null, 2).replace(/^{/, '').replace(/}$/, '')}\n\`\`\`\n\n`;
      readmeContent += `**Amp CLI Setup:**\n\n`;
      const config = generateConfig();
      if (config.command && config.args) {
        readmeContent += `Add via the \`amp mcp add\` command below:\n\n\`\`\`bash\namp mcp add ${serverName} -- ${config.command} ${config.args.join(' ')}\n\`\`\`\n`;
      }
      readmeContent += `</details>\n\n`;
    }

    if (includeClaudeCode) {
      readmeContent += `<details>\n<summary>Claude Code</summary>\n\n`;
      readmeContent += `Use the Claude Code CLI to add the ${serverName} MCP server:\n\n`;
      const config = generateConfig();
      if (config.command && config.args) {
        readmeContent += `\`\`\`bash\nclaude mcp add ${serverName} ${config.command} ${config.args.join(' ')}\n\`\`\`\n`;
      } else if (config.url) {
        readmeContent += `\`\`\`bash\nclaude mcp add ${serverName} --url ${config.url}\n\`\`\`\n`;
      }
      readmeContent += `</details>\n\n`;
    }

    if (includeClaudeDesktop) {
      readmeContent += `<details>\n<summary>Claude Desktop</summary>\n\n`;
      readmeContent += `Follow the MCP install [guide](https://modelcontextprotocol.io/quickstart/user), use the standard config above.\n</details>\n\n`;
    }

    if (includeCodex) {
      readmeContent += `<details>\n<summary>Codex</summary>\n\n`;
      readmeContent += `Create or edit the configuration file \`~/.codex/config.toml\` and add:\n\n`;
      const config = generateConfig();
      readmeContent += `\`\`\`toml\n[mcp_servers.${serverName}]\n`;
      if (config.command) {
        readmeContent += `command = "${config.command}"\n`;
        if (config.args && config.args.length > 0) {
          readmeContent += `args = [${config.args.map(arg => `"${arg}"`).join(', ')}]\n`;
        }
      } else if (config.url) {
        readmeContent += `url = "${config.url}"\n`;
      }
      readmeContent += `\`\`\`\n\n`;
      readmeContent += `For more information, see the [Codex MCP documentation](https://github.com/openai/codex/blob/main/codex-rs/config.md#mcp_servers).\n</details>\n\n`;
    }

    if (includeGeminiCLI) {
      readmeContent += `<details>\n<summary>Gemini CLI</summary>\n\n`;
      readmeContent += `Follow the MCP install [guide](https://github.com/google-gemini/gemini-cli/blob/main/docs/tools/mcp-server.md#configure-the-mcp-server-in-settingsjson), use the standard config above.\n</details>\n\n`;
    }

    if (includeOpenCode) {
      readmeContent += `<details>\n<summary>OpenCode</summary>\n\n`;
      readmeContent += `Follow the MCP Servers [documentation](https://opencode.ai/docs/mcp-servers/). For example in \`~/.config/opencode/opencode.json\`:\n\n`;
      readmeContent += `\`\`\`json\n{\n  "$schema": "https://opencode.ai/config.json",\n  "mcp": {\n    "${serverName}": {\n      "type": "local",\n      "command": [\n`;
      const config = generateConfig();
      if (config.command) {
        readmeContent += `        "${config.command}"`;
        if (config.args && config.args.length > 0) {
          config.args.forEach(arg => {
            readmeContent += `,\n        "${arg}"`;
          });
        }
      }
      readmeContent += `\n      ],\n      "enabled": true\n    }\n  }\n}\n\`\`\`\n</details>\n\n`;
    }

    if (includeQodoGen) {
      readmeContent += `<details>\n<summary>Qodo Gen</summary>\n\n`;
      readmeContent += `Open [Qodo Gen](https://docs.qodo.ai/qodo-documentation/qodo-gen) chat panel in VSCode or IntelliJ → Connect more tools → + Add new MCP → Paste the standard config above.\n\nClick Save.\n</details>\n\n`;
    }

    if (includeWarp) {
      readmeContent += `<details>\n<summary>Warp</summary>\n\n`;
      readmeContent += `Go to \`Settings\` -> \`AI\` -> \`Manage MCP Servers\` -> \`+ Add\` to [add an MCP Server](https://docs.warp.dev/knowledge-and-collaboration/mcp#adding-an-mcp-server). Use the standard config above.\n\n`;
      readmeContent += `Alternatively, use the slash command \`/add-mcp\` in the Warp prompt and paste the standard config from above.\n</details>\n\n`;
    }

    if (includeWindsurf) {
      readmeContent += `<details>\n<summary>Windsurf</summary>\n\n`;
      readmeContent += `Follow Windsurf MCP [documentation](https://docs.windsurf.com/windsurf/cascade/mcp). Use the standard config above.\n</details>\n\n`;
    }
    
    // Additional notes
    readmeContent += `### Configuration Details\n\n`;
    readmeContent += `- **Server Name:** \`${serverName}\`\n`;
    
    switch (configType) {
      case 'http':
        readmeContent += `- **Type:** Remote HTTP Server\n`;
        readmeContent += `- **URL:** \`${serverUrl}\`\n`;
        break;
      case 'npx':
        readmeContent += `- **Type:** NPX Package\n`;
        readmeContent += `- **Package:** \`${npxPackage}\`\n`;
        break;
      case 'uvx':
        readmeContent += `- **Type:** UVX Package\n`;
        readmeContent += `- **Package:** \`${uvxPackage}\`\n`;
        if (uvxFrom) readmeContent += `- **From:** \`${uvxFrom}\`\n`;
        break;
      case 'dnx':
        readmeContent += `- **Type:** DNX Package\n`;
        readmeContent += `- **Package:** \`${dnxPackage}\`\n`;
        break;
      case 'docker':
        readmeContent += `- **Type:** Docker Container\n`;
        readmeContent += `- **Image:** \`${dockerImage}\`\n`;
        break;
      case 'local':
        readmeContent += `- **Type:** Local Binary\n`;
        readmeContent += `- **Command:** \`${localCommand}\`\n`;
        if (localArgs) readmeContent += `- **Arguments:** \`${localArgs}\`\n`;
        break;
    }
    
    readmeContent += `\n### Need Help?\n\n`;
    readmeContent += `For more information about the Model Context Protocol, visit [modelcontextprotocol.io](https://modelcontextprotocol.io).\n`;
    
    return readmeContent;
  }

  const copyReadmeToClipboard = async () => {
    const readme = generateReadmeContent();
    if (readme) {
      await navigator.clipboard.writeText(readme);
      setCopiedReadme(true);
      setTimeout(() => setCopiedReadme(false), 2000);
    }
  }

  const markdown = generateMarkdown();

  return (
    <div className="container">
      <header>
        <h1>🎖️ MCP Badge Creator</h1>
        <p className="subtitle">
          Generate one-click install badges for your Model Context Protocol servers
        </p>
      </header>

      <div className="content">
        <div className="form-section">
          <h2>Configure Your MCP Server</h2>
          
          <div className="form-group">
            <label htmlFor="serverName">Server Name *</label>
            <input
              id="serverName"
              type="text"
              placeholder="my-awesome-mcp-server"
              value={serverName}
              onChange={(e) => setServerName(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label htmlFor="configType">Configuration Type *</label>
            <select
              id="configType"
              value={configType}
              onChange={(e) => setConfigType(e.target.value as ConfigType)}
            >
              <option value="http">Remote HTTP Server</option>
              <option value="npx">NPX Package (Node.js)</option>
              <option value="uvx">UVX Package (Python)</option>
              <option value="dnx">DNX Package (.NET)</option>
              <option value="docker">Docker Container</option>
              <option value="local">Local Binary</option>
            </select>
          </div>

          {configType === 'http' && (
            <div className="form-group">
              <label htmlFor="serverUrl">Server URL *</label>
              <input
                id="serverUrl"
                type="text"
                placeholder="https://your-server-url.com/"
                value={serverUrl}
                onChange={(e) => setServerUrl(e.target.value)}
              />
              <small className="field-hint">For remotely hosted MCP servers using HTTP/SSE transport</small>
            </div>
          )}

          {configType === 'npx' && (
            <div className="form-group">
              <label htmlFor="npxPackage">NPM Package Name *</label>
              <input
                id="npxPackage"
                type="text"
                placeholder="@modelcontextprotocol/server-filesystem"
                value={npxPackage}
                onChange={(e) => setNpxPackage(e.target.value)}
              />
              <small className="field-hint">Example: @modelcontextprotocol/server-filesystem</small>
            </div>
          )}

          {configType === 'uvx' && (
            <>
              <div className="form-group">
                <label htmlFor="uvxPackage">Package/Script Name *</label>
                <input
                  id="uvxPackage"
                  type="text"
                  placeholder="mcp-server-git"
                  value={uvxPackage}
                  onChange={(e) => setUvxPackage(e.target.value)}
                />
                <small className="field-hint">The script or entry point to run</small>
              </div>
              <div className="form-group">
                <label htmlFor="uvxFrom">From Package (optional)</label>
                <input
                  id="uvxFrom"
                  type="text"
                  placeholder="mcp-server-git"
                  value={uvxFrom}
                  onChange={(e) => setUvxFrom(e.target.value)}
                />
                <small className="field-hint">Use --from flag for PyPI package name if different</small>
              </div>
            </>
          )}

          {configType === 'dnx' && (
            <div className="form-group">
              <label htmlFor="dnxPackage">DNX Package *</label>
              <input
                id="dnxPackage"
                type="text"
                placeholder="Contoso.SampleMcpServer@0.0.1-beta"
                value={dnxPackage}
                onChange={(e) => setDnxPackage(e.target.value)}
              />
              <small className="field-hint">Example: Contoso.SampleMcpServer@0.0.1-beta or your-package@version</small>
            </div>
          )}

          {configType === 'docker' && (
            <div className="form-group">
              <label htmlFor="dockerImage">Docker Image *</label>
              <input
                id="dockerImage"
                type="text"
                placeholder="your-username/your-image"
                value={dockerImage}
                onChange={(e) => setDockerImage(e.target.value)}
              />
              <small className="field-hint">Full image name including tag (e.g., username/image:latest)</small>
            </div>
          )}

          {configType === 'local' && (
            <>
              <div className="form-group">
                <label htmlFor="localCommand">Command *</label>
                <input
                  id="localCommand"
                  type="text"
                  placeholder="node"
                  value={localCommand}
                  onChange={(e) => setLocalCommand(e.target.value)}
                />
                <small className="field-hint">The executable command (node, python, uv, etc.)</small>
              </div>
              <div className="form-group">
                <label htmlFor="localArgs">Arguments (comma-separated)</label>
                <input
                  id="localArgs"
                  type="text"
                  placeholder="path/to/server.js, --option"
                  value={localArgs}
                  onChange={(e) => setLocalArgs(e.target.value)}
                />
                <small className="field-hint">Command arguments separated by commas</small>
              </div>
            </>
          )}

          <div className="form-group">
            <label htmlFor="badgeText">Badge Text</label>
            <input
              id="badgeText"
              type="text"
              placeholder="Install Server"
              value={badgeText}
              onChange={(e) => setBadgeText(e.target.value)}
            />
            <small className="field-hint">Customize the text that appears on the right side of badges</small>
          </div>

          <div className="form-group">
            <div className="section-header">
              <label>Badge Generation</label>
              <label className="select-all-toggle">
                <input
                  type="checkbox"
                  checked={selectAllBadges}
                  onChange={(e) => handleSelectAllBadges(e.target.checked)}
                />
                <span>Select All</span>
              </label>
            </div>
            <p className="section-description">Select which platforms to generate one-click install badges for:</p>
            <div className="ide-cards-grid">
              <div 
                className={`ide-card ${includeVSCode ? 'active' : ''}`}
                onClick={() => setIncludeVSCode(!includeVSCode)}
              >
                <div className="ide-card-icon" style={{ backgroundColor: '#0098FF' }}>
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.5 0l-11 11-4.5-4.5-2 2 6.5 6.5 13-13z"/>
                  </svg>
                </div>
                <div className="ide-card-content">
                  <h4>VS Code</h4>
                </div>
                <div className={`ide-card-toggle ${includeVSCode ? 'checked' : ''}`}>
                  <div className="toggle-dot"></div>
                </div>
              </div>

              <div 
                className={`ide-card ${includeVSCodeInsiders ? 'active' : ''}`}
                onClick={() => setIncludeVSCodeInsiders(!includeVSCodeInsiders)}
              >
                <div className="ide-card-icon" style={{ backgroundColor: '#24bfa5' }}>
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.5 0l-11 11-4.5-4.5-2 2 6.5 6.5 13-13z"/>
                  </svg>
                </div>
                <div className="ide-card-content">
                  <h4>VS Code Insiders</h4>
                </div>
                <div className={`ide-card-toggle ${includeVSCodeInsiders ? 'checked' : ''}`}>
                  <div className="toggle-dot"></div>
                </div>
              </div>

              <div 
                className={`ide-card ${includeVisualStudio ? 'active' : ''}`}
                onClick={() => setIncludeVisualStudio(!includeVisualStudio)}
              >
                <div className="ide-card-icon" style={{ backgroundColor: '#C16FDE' }}>
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.5 0l-11 11-4.5-4.5-2 2 6.5 6.5 13-13z"/>
                  </svg>
                </div>
                <div className="ide-card-content">
                  <h4>Visual Studio</h4>
                </div>
                <div className={`ide-card-toggle ${includeVisualStudio ? 'checked' : ''}`}>
                  <div className="toggle-dot"></div>
                </div>
              </div>

              <div 
                className={`ide-card ${includeCursor ? 'active' : ''}`}
                onClick={() => setIncludeCursor(!includeCursor)}
              >
                <div className="ide-card-icon" style={{ backgroundColor: '#8B5CF6' }}>
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.5 0l-11 11-4.5-4.5-2 2 6.5 6.5 13-13z"/>
                  </svg>
                </div>
                <div className="ide-card-content">
                  <h4>Cursor</h4>
                </div>
                <div className={`ide-card-toggle ${includeCursor ? 'checked' : ''}`}>
                  <div className="toggle-dot"></div>
                </div>
              </div>

              <div 
                className={`ide-card ${includeGoose ? 'active' : ''}`}
                onClick={() => setIncludeGoose(!includeGoose)}
              >
                <div className="ide-card-icon" style={{ backgroundColor: '#10B981' }}>
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.5 0l-11 11-4.5-4.5-2 2 6.5 6.5 13-13z"/>
                  </svg>
                </div>
                <div className="ide-card-content">
                  <h4>Goose</h4>
                </div>
                <div className={`ide-card-toggle ${includeGoose ? 'checked' : ''}`}>
                  <div className="toggle-dot"></div>
                </div>
              </div>

              <div 
                className={`ide-card ${includeLMStudio ? 'active' : ''}`}
                onClick={() => setIncludeLMStudio(!includeLMStudio)}
              >
                <div className="ide-card-icon" style={{ backgroundColor: '#3B82F6' }}>
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.5 0l-11 11-4.5-4.5-2 2 6.5 6.5 13-13z"/>
                  </svg>
                </div>
                <div className="ide-card-content">
                  <h4>LM Studio</h4>
                </div>
                <div className={`ide-card-toggle ${includeLMStudio ? 'checked' : ''}`}>
                  <div className="toggle-dot"></div>
                </div>
              </div>
            </div>
          </div>

          <div className="form-group">
            <div className="section-header">
              <label>Include in README</label>
              <label className="select-all-toggle">
                <input
                  type="checkbox"
                  checked={selectAllReadme}
                  onChange={(e) => handleSelectAllReadme(e.target.checked)}
                />
                <span>Select All</span>
              </label>
            </div>
            <p className="section-description">Select platforms to include manual installation instructions in the README:</p>
            <div className="readme-platforms-grid">
              <label className="platform-checkbox">
                <input type="checkbox" checked={includeVSCode} onChange={(e) => setIncludeVSCode(e.target.checked)} />
                <span>VS Code</span>
              </label>
              <label className="platform-checkbox">
                <input type="checkbox" checked={includeVSCodeInsiders} onChange={(e) => setIncludeVSCodeInsiders(e.target.checked)} />
                <span>VS Code Insiders</span>
              </label>
              <label className="platform-checkbox">
                <input type="checkbox" checked={includeVisualStudio} onChange={(e) => setIncludeVisualStudio(e.target.checked)} />
                <span>Visual Studio</span>
              </label>
              <label className="platform-checkbox">
                <input type="checkbox" checked={includeCursor} onChange={(e) => setIncludeCursor(e.target.checked)} />
                <span>Cursor</span>
              </label>
              <label className="platform-checkbox">
                <input type="checkbox" checked={includeGoose} onChange={(e) => setIncludeGoose(e.target.checked)} />
                <span>Goose</span>
              </label>
              <label className="platform-checkbox">
                <input type="checkbox" checked={includeLMStudio} onChange={(e) => setIncludeLMStudio(e.target.checked)} />
                <span>LM Studio</span>
              </label>
              <label className="platform-checkbox">
                <input type="checkbox" checked={includeAmp} onChange={(e) => setIncludeAmp(e.target.checked)} />
                <span>Amp</span>
              </label>
              <label className="platform-checkbox">
                <input type="checkbox" checked={includeClaudeCode} onChange={(e) => setIncludeClaudeCode(e.target.checked)} />
                <span>Claude Code</span>
              </label>
              <label className="platform-checkbox">
                <input type="checkbox" checked={includeClaudeDesktop} onChange={(e) => setIncludeClaudeDesktop(e.target.checked)} />
                <span>Claude Desktop</span>
              </label>
              <label className="platform-checkbox">
                <input type="checkbox" checked={includeCodex} onChange={(e) => setIncludeCodex(e.target.checked)} />
                <span>Codex</span>
              </label>
              <label className="platform-checkbox">
                <input type="checkbox" checked={includeGeminiCLI} onChange={(e) => setIncludeGeminiCLI(e.target.checked)} />
                <span>Gemini CLI</span>
              </label>
              <label className="platform-checkbox">
                <input type="checkbox" checked={includeOpenCode} onChange={(e) => setIncludeOpenCode(e.target.checked)} />
                <span>OpenCode</span>
              </label>
              <label className="platform-checkbox">
                <input type="checkbox" checked={includeQodoGen} onChange={(e) => setIncludeQodoGen(e.target.checked)} />
                <span>Qodo Gen</span>
              </label>
              <label className="platform-checkbox">
                <input type="checkbox" checked={includeWarp} onChange={(e) => setIncludeWarp(e.target.checked)} />
                <span>Warp</span>
              </label>
              <label className="platform-checkbox">
                <input type="checkbox" checked={includeWindsurf} onChange={(e) => setIncludeWindsurf(e.target.checked)} />
                <span>Windsurf</span>
              </label>
            </div>
          </div>
        </div>

        <div className="output-section">
          <h2>Generated Output</h2>
          
          {markdown ? (
            <>
              <div className="tabs">
                <button 
                  className={`tab ${activeTab === 'badges' ? 'active' : ''}`}
                  onClick={() => setActiveTab('badges')}
                >
                  Badges & Config
                </button>
                <button 
                  className={`tab ${activeTab === 'readme' ? 'active' : ''}`}
                  onClick={() => setActiveTab('readme')}
                >
                  Getting Started README
                </button>
              </div>

              {activeTab === 'badges' ? (
                <>
                  <div className="preview">
                    <h3>Preview</h3>
                    <div className="badge-preview" dangerouslySetInnerHTML={{ 
                      __html: markdown
                        .split('\n')
                        .map(line => {
                          const match = line.match(/\[!\[.*?\]\((.*?)\)\]\((.*?)\)/);
                          if (match) {
                            return `<a href="${match[2]}" target="_blank"><img src="${match[1]}" alt="badge"></a>`;
                          }
                          return '';
                        })
                        .join(' ')
                    }} />
                  </div>

                  <div className="markdown-output">
                    <div className="output-header">
                      <h3>Markdown</h3>
                      <button className="copy-btn" onClick={copyToClipboard}>
                        {copied ? '✓ Copied!' : '📋 Copy'}
                      </button>
                    </div>
                    <pre><code>{markdown}</code></pre>
                  </div>

                  <div className="config-output">
                    <div className="output-header">
                      <h3>mcp.json Configuration</h3>
                      <button 
                        className="copy-btn" 
                        onClick={() => copyToClipboardWithState(JSON.stringify(generateFullConfig(), null, 2), setCopiedJson)}
                      >
                        {copiedJson ? '✓ Copied!' : '📋 Copy'}
                      </button>
                    </div>
                    <pre><code>{JSON.stringify(generateFullConfig(), null, 2)}</code></pre>
                    <small className="field-hint">Add this to your workspace or user mcp.json file</small>
                  </div>

                  {includeVSCode && (
                    <div className="config-output">
                      <div className="output-header">
                        <h3>VS Code CLI Command</h3>
                        <button 
                          className="copy-btn" 
                          onClick={() => copyToClipboardWithState(generateCliCommand(false), setCopiedCli)}
                        >
                          {copiedCli ? '✓ Copied!' : '📋 Copy'}
                        </button>
                      </div>
                      <pre><code>{generateCliCommand(false)}</code></pre>
                      <small className="field-hint">Works in PowerShell, Bash, and Zsh</small>
                    </div>
                  )}

                  {includeVSCodeInsiders && (
                    <div className="config-output">
                      <div className="output-header">
                        <h3>VS Code Insiders CLI Command</h3>
                        <button 
                          className="copy-btn" 
                          onClick={() => copyToClipboardWithState(generateCliCommand(true), setCopiedCliInsiders)}
                        >
                          {copiedCliInsiders ? '✓ Copied!' : '📋 Copy'}
                        </button>
                      </div>
                      <pre><code>{generateCliCommand(true)}</code></pre>
                      <small className="field-hint">Works in PowerShell, Bash, and Zsh</small>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div className="readme-preview">
                    <div className="output-header">
                      <h3>README Getting Started Section</h3>
                      <button className="copy-btn" onClick={copyReadmeToClipboard}>
                        {copiedReadme ? '✓ Copied!' : '📋 Copy'}
                      </button>
                    </div>
                    <pre><code>{generateReadmeContent()}</code></pre>
                    <small className="field-hint">Copy this section into your README.md file</small>
                  </div>
                </>
              )}
            </>
          ) : (
            <p className="placeholder">Fill in the form to generate your badges</p>
          )}
        </div>
      </div>

      <footer>
        <p>
          Learn more about <a href="https://modelcontextprotocol.io" target="_blank" rel="noopener noreferrer">Model Context Protocol</a>
        </p>
        <p className="small">
          Based on <a href="https://github.com/jamesmontemagno/MonkeyMCP/blob/main/.github/prompts/add-mcp-install-badges.md" target="_blank" rel="noopener noreferrer">MCP Badge Documentation</a>
        </p>
        <p className="small">
          Created with <a href="https://code.visualstudio.com/" target="_blank" rel="noopener noreferrer">VS Code</a> and <a href="https://github.com/features/copilot" target="_blank" rel="noopener noreferrer">GitHub Copilot</a> • <a href="https://github.com/jamesmontemagno/mcp-badge-creator" target="_blank" rel="noopener noreferrer">View on GitHub</a>
        </p>
      </footer>
    </div>
  )
}

export default App
