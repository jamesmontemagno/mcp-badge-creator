import { useState } from 'react'
import styles from './MCP.module.css'

type ConfigType = 'http' | 'docker' | 'local' | 'npx' | 'uvx' | 'dnx';

interface MCPConfig {
  name?: string; // Only used for encoding in URL parameters, not in the actual config
  type?: string;
  url?: string;
  command?: string;
  args?: string[];
  env?: Record<string, string>;
}

function MCP() {
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
  // Badge generation platforms
  const [includeVSCode, setIncludeVSCode] = useState(true)
  const [includeVSCodeInsiders, setIncludeVSCodeInsiders] = useState(true)
  const [includeVisualStudio, setIncludeVisualStudio] = useState(true)
  const [includeCursor, setIncludeCursor] = useState(false)
  const [includeGoose, setIncludeGoose] = useState(false)
  const [includeLMStudio, setIncludeLMStudio] = useState(false)
  // README inclusion platforms (separate from badge generation)
  const [readmeVSCode, setReadmeVSCode] = useState(true)
  const [readmeVSCodeInsiders, setReadmeVSCodeInsiders] = useState(true)
  const [readmeVisualStudio, setReadmeVisualStudio] = useState(true)
  const [readmeCursor, setReadmeCursor] = useState(false)
  const [readmeGoose, setReadmeGoose] = useState(false)
  const [readmeLMStudio, setReadmeLMStudio] = useState(false)
  const [readmeAmp, setReadmeAmp] = useState(false)
  const [readmeClaudeCode, setReadmeClaudeCode] = useState(false)
  const [readmeClaudeDesktop, setReadmeClaudeDesktop] = useState(false)
  const [readmeCodex, setReadmeCodex] = useState(false)
  const [readmeGeminiCLI, setReadmeGeminiCLI] = useState(false)
  const [readmeOpenCode, setReadmeOpenCode] = useState(false)
  const [readmeQodoGen, setReadmeQodoGen] = useState(false)
  const [readmeWarp, setReadmeWarp] = useState(false)
  const [readmeWindsurf, setReadmeWindsurf] = useState(false)
  // Badge text customization
  const [badgeText, setBadgeText] = useState('Install in')
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

  const generateMarkdown = (): string => {
    if (!serverName) return '';
    
    const config = generateConfig();
    const encodedConfig = encodeConfig(config);
    const badges: string[] = [];

    const customBadgeText = badgeText.replace(/\s/g, '_');

    if (includeVSCode) {
      const vscodeUrl = `https://vscode.dev/redirect/mcp/install?name=${encodeURIComponent(serverName)}&config=${encodedConfig}`;
      badges.push(`[![Install in VS Code](https://img.shields.io/badge/${customBadgeText}-VS_Code-0098FF?style=flat-square&logo=visualstudiocode&logoColor=white)](${vscodeUrl})`);
    }

    if (includeVSCodeInsiders) {
      const vscodeInsidersUrl = `https://insiders.vscode.dev/redirect/mcp/install?name=${encodeURIComponent(serverName)}&config=${encodedConfig}&quality=insiders`;
      badges.push(`[![Install in VS Code Insiders](https://img.shields.io/badge/${customBadgeText}-VS_Code_Insiders-24bfa5?style=flat-square&logo=visualstudiocode&logoColor=white)](${vscodeInsidersUrl})`);
    }

    if (includeVisualStudio) {
      const vsUrl = `https://vs-open.link/mcp-install?${encodedConfig}`;
      badges.push(`[![Install in Visual Studio](https://img.shields.io/badge/${customBadgeText}-Visual_Studio-C16FDE?style=flat-square&logo=visualstudio&logoColor=white)](${vsUrl})`);
    }

    if (includeCursor) {
      // Use Cursor badge with same style as VS Code badges but black background
      const configWithName = { name: serverName, ...config };
      const base64Config = btoa(JSON.stringify(configWithName));
      const cursorUrl = `https://cursor.com/en/install-mcp?name=${encodeURIComponent(serverName)}&config=${base64Config}`;
      badges.push(`[![Install in Cursor](https://img.shields.io/badge/${customBadgeText}-Cursor-000000?style=flat-square&logoColor=white)](${cursorUrl})`);
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
    if (readmeVSCode) {
      readmeContent += `<details>\n<summary>VS Code</summary>\n\n`;
      readmeContent += `#### Click the button to install:\n\n`;
      const vscodeUrl = `https://vscode.dev/redirect/mcp/install?name=${encodeURIComponent(serverName)}&config=${encodeConfig(generateConfig())}`;
      readmeContent += `[![Install in VS Code](https://img.shields.io/badge/${badgeText.replace(/\s/g, '_')}-VS_Code-0098FF?style=flat-square&logo=visualstudiocode&logoColor=white)](${vscodeUrl})\n\n`;
      readmeContent += `#### Or install manually:\n\n`;
      readmeContent += `Follow the MCP install [guide](https://code.visualstudio.com/docs/copilot/chat/mcp-servers#_add-an-mcp-server), use the standard config above. You can also install the ${serverName} MCP server using the VS Code CLI:\n\n`;
      readmeContent += `\`\`\`bash\n${generateCliCommand(false)}\n\`\`\`\n\n`;
      readmeContent += `After installation, the ${serverName} MCP server will be available for use with your GitHub Copilot agent in VS Code.\n</details>\n\n`;
    }
    
    // VS Code Insiders section
    if (readmeVSCodeInsiders) {
      readmeContent += `<details>\n<summary>VS Code Insiders</summary>\n\n`;
      readmeContent += `#### Click the button to install:\n\n`;
      const vscodeInsidersUrl = `https://insiders.vscode.dev/redirect/mcp/install?name=${encodeURIComponent(serverName)}&config=${encodeConfig(generateConfig())}&quality=insiders`;
      readmeContent += `[![Install in VS Code Insiders](https://img.shields.io/badge/${badgeText.replace(/\s/g, '_')}-VS_Code_Insiders-24bfa5?style=flat-square&logo=visualstudiocode&logoColor=white)](${vscodeInsidersUrl})\n\n`;
      readmeContent += `#### Or install manually:\n\n`;
      readmeContent += `Follow the MCP install [guide](https://code.visualstudio.com/docs/copilot/chat/mcp-servers#_add-an-mcp-server), use the standard config above. You can also install the ${serverName} MCP server using the VS Code Insiders CLI:\n\n`;
      readmeContent += `\`\`\`bash\n${generateCliCommand(true)}\n\`\`\`\n\n`;
      readmeContent += `After installation, the ${serverName} MCP server will be available for use with your GitHub Copilot agent in VS Code Insiders.\n</details>\n\n`;
    }
    
    // Visual Studio section
    if (readmeVisualStudio) {
      readmeContent += `<details>\n<summary>Visual Studio</summary>\n\n`;
      readmeContent += `#### Click the button to install:\n\n`;
      const vsUrl = `https://vs-open.link/mcp-install?${encodeConfig(generateConfig())}`;
      readmeContent += `[![Install in Visual Studio](https://img.shields.io/badge/${badgeText.replace(/\s/g, '_')}-Visual_Studio-C16FDE?style=flat-square&logo=visualstudio&logoColor=white)](${vsUrl})\n\n`;
      readmeContent += `#### Or install manually:\n\n`;
      readmeContent += `1. Open Visual Studio\n`;
      readmeContent += `2. Navigate to the GitHub Copilot Chat window\n`;
      readmeContent += `3. Click the tools icon (🛠️) in the chat toolbar\n`;
      readmeContent += `4. Click the + "Add Server" button to open the "Configure MCP server" dialog\n`;
      readmeContent += `5. Fill in the configuration:\n`;
      readmeContent += `   - **Server ID**: \`${serverName}\`\n`;
      const config = generateConfig();
      if (config.type === 'http') {
        readmeContent += `   - **Type**: Select \`http/sse\` from the dropdown\n`;
        readmeContent += `   - **URL**: \`${config.url || ''}\`\n`;
      } else {
        readmeContent += `   - **Type**: Select \`stdio\` from the dropdown\n`;
        readmeContent += `   - **Command**: \`${config.command || ''}\`\n`;
        if (config.args && config.args.length > 0) {
          readmeContent += `   - **Arguments**: \`${config.args.join(' ')}\`\n`;
        }
      }
      readmeContent += `6. Click "Save" to add the server\n\n`;
      readmeContent += `For detailed instructions, see the [Visual Studio MCP documentation](https://learn.microsoft.com/visualstudio/ide/mcp-servers).\n</details>\n\n`;
    }
    
    // Cursor section
    if (readmeCursor) {
      readmeContent += `<details>\n<summary>Cursor</summary>\n\n`;
      readmeContent += `#### Click the button to install:\n\n`;
      const configWithName = { name: serverName, ...generateConfig() };
      const base64Config = btoa(JSON.stringify(configWithName));
      const cursorUrl = `https://cursor.com/en/install-mcp?name=${encodeURIComponent(serverName)}&config=${base64Config}`;
      // Use Cursor badge with same style as VS Code badges (no icon)
      readmeContent += `[![Install in Cursor](https://img.shields.io/badge/${badgeText.replace(/\s/g, '_')}-Cursor-000000?style=flat-square&logoColor=white)](${cursorUrl})\n\n`;
      readmeContent += `#### Or install manually:\n\n`;
      readmeContent += `Go to \`Cursor Settings\` -> \`MCP\` -> \`Add new MCP Server\`. Name to your liking, use \`command\` type with the command from the standard config above. You can also verify config or add command like arguments via clicking \`Edit\`.\n</details>\n\n`;
    }
    
    // Goose section
    if (readmeGoose) {
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
    if (readmeLMStudio) {
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
    if (readmeAmp) {
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

    if (readmeClaudeCode) {
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

    if (readmeClaudeDesktop) {
      readmeContent += `<details>\n<summary>Claude Desktop</summary>\n\n`;
      readmeContent += `Follow the MCP install [guide](https://modelcontextprotocol.io/quickstart/user), use the standard config above.\n</details>\n\n`;
    }

    if (readmeCodex) {
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

    if (readmeGeminiCLI) {
      readmeContent += `<details>\n<summary>Gemini CLI</summary>\n\n`;
      readmeContent += `Follow the MCP install [guide](https://github.com/google-gemini/gemini-cli/blob/main/docs/tools/mcp-server.md#configure-the-mcp-server-in-settingsjson), use the standard config above.\n</details>\n\n`;
    }

    if (readmeOpenCode) {
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

    if (readmeQodoGen) {
      readmeContent += `<details>\n<summary>Qodo Gen</summary>\n\n`;
      readmeContent += `Open [Qodo Gen](https://docs.qodo.ai/qodo-documentation/qodo-gen) chat panel in VSCode or IntelliJ → Connect more tools → + Add new MCP → Paste the standard config above.\n\nClick Save.\n</details>\n\n`;
    }

    if (readmeWarp) {
      readmeContent += `<details>\n<summary>Warp</summary>\n\n`;
      readmeContent += `Go to \`Settings\` -> \`AI\` -> \`Manage MCP Servers\` -> \`+ Add\` to [add an MCP Server](https://docs.warp.dev/knowledge-and-collaboration/mcp#adding-an-mcp-server). Use the standard config above.\n\n`;
      readmeContent += `Alternatively, use the slash command \`/add-mcp\` in the Warp prompt and paste the standard config from above.\n</details>\n\n`;
    }

    if (readmeWindsurf) {
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
    <>
      <header className={`${styles.mcpHeader} mcp-header`}>
        <p className={`${styles.eyebrow} eyebrow`}>Model Context Protocol</p>
        <h1>MCP Badge Creator</h1>
        <p className={`${styles.subtitle} subtitle`}>
          Generate one-click install badges for your Model Context Protocol servers
        </p>
      </header>

      <div className={`${styles.mcpPage} mcp-page container`}>

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
              placeholder="Install in"
              value={badgeText}
              onChange={(e) => setBadgeText(e.target.value)}
            />
            <small className="field-hint">Customize the text that appears on the left side of badges</small>
          </div>

          <div className="form-group">
            <div className={styles.sectionHeader}>
              <label>Badge Generation</label>
              <button 
                type="button"
                className="copy-btn"
                onClick={() => {
                  const allSelected = includeVSCode && includeVSCodeInsiders && includeVisualStudio && 
                                      includeCursor && includeGoose && includeLMStudio
                  const newValue = !allSelected
                  setIncludeVSCode(newValue)
                  setIncludeVSCodeInsiders(newValue)
                  setIncludeVisualStudio(newValue)
                  setIncludeCursor(newValue)
                  setIncludeGoose(newValue)
                  setIncludeLMStudio(newValue)
                }}
              >
                {includeVSCode && includeVSCodeInsiders && includeVisualStudio && 
                 includeCursor && includeGoose && includeLMStudio ? 'Deselect All' : 'Select All'}
              </button>
            </div>
            <p className="section-description">Select which platforms to generate one-click install badges for:</p>
            <div className={`${styles.ideCardsGrid} ide-cards-grid`}>
              <div 
                className={`${styles.ideCard} ide-card ${includeVSCode ? 'active' : ''}`}
                onClick={() => setIncludeVSCode(!includeVSCode)}
              >
                <div className="ide-card-content">
                  <h4>VS Code</h4>
                </div>
                <div className={`${styles.ideCardToggle} ide-card-toggle ${includeVSCode ? 'checked' : ''}`}>
                  <div className="toggle-dot"></div>
                </div>
              </div>

              <div 
                className={`${styles.ideCard} ide-card ${includeVSCodeInsiders ? 'active' : ''}`}
                onClick={() => setIncludeVSCodeInsiders(!includeVSCodeInsiders)}
              >
                <div className="ide-card-content">
                  <h4>VS Code Insiders</h4>
                </div>
                <div className={`${styles.ideCardToggle} ide-card-toggle ${includeVSCodeInsiders ? 'checked' : ''}`}>
                  <div className="toggle-dot"></div>
                </div>
              </div>

              <div 
                className={`${styles.ideCard} ide-card ${includeVisualStudio ? 'active' : ''}`}
                onClick={() => setIncludeVisualStudio(!includeVisualStudio)}
              >
                <div className="ide-card-content">
                  <h4>Visual Studio</h4>
                </div>
                <div className={`${styles.ideCardToggle} ide-card-toggle ${includeVisualStudio ? 'checked' : ''}`}>
                  <div className="toggle-dot"></div>
                </div>
              </div>

              <div 
                className={`${styles.ideCard} ide-card ${includeCursor ? 'active' : ''}`}
                onClick={() => setIncludeCursor(!includeCursor)}
              >
                <div className="ide-card-content">
                  <h4>Cursor</h4>
                </div>
                <div className={`${styles.ideCardToggle} ide-card-toggle ${includeCursor ? 'checked' : ''}`}>
                  <div className="toggle-dot"></div>
                </div>
              </div>

              <div 
                className={`${styles.ideCard} ide-card ${includeGoose ? 'active' : ''}`}
                onClick={() => setIncludeGoose(!includeGoose)}
              >
                <div className="ide-card-content">
                  <h4>Goose</h4>
                </div>
                <div className={`${styles.ideCardToggle} ide-card-toggle ${includeGoose ? 'checked' : ''}`}>
                  <div className="toggle-dot"></div>
                </div>
              </div>

              <div 
                className={`${styles.ideCard} ide-card ${includeLMStudio ? 'active' : ''}`}
                onClick={() => setIncludeLMStudio(!includeLMStudio)}
              >
                <div className="ide-card-content">
                  <h4>LM Studio</h4>
                </div>
                <div className={`${styles.ideCardToggle} ide-card-toggle ${includeLMStudio ? 'checked' : ''}`}>
                  <div className="toggle-dot"></div>
                </div>
              </div>
            </div>
          </div>

          <div className="form-group">
            <div className={styles.sectionHeader}>
              <label>Include in README</label>
              <button 
                type="button"
                className="copy-btn"
                onClick={() => {
                  const allSelected = readmeVSCode && readmeVSCodeInsiders && readmeVisualStudio && 
                                      readmeCursor && readmeGoose && readmeLMStudio &&
                                      readmeAmp && readmeClaudeCode && readmeClaudeDesktop &&
                                      readmeCodex && readmeGeminiCLI && readmeOpenCode &&
                                      readmeQodoGen && readmeWarp && readmeWindsurf
                  const newValue = !allSelected
                  setReadmeVSCode(newValue)
                  setReadmeVSCodeInsiders(newValue)
                  setReadmeVisualStudio(newValue)
                  setReadmeCursor(newValue)
                  setReadmeGoose(newValue)
                  setReadmeLMStudio(newValue)
                  setReadmeAmp(newValue)
                  setReadmeClaudeCode(newValue)
                  setReadmeClaudeDesktop(newValue)
                  setReadmeCodex(newValue)
                  setReadmeGeminiCLI(newValue)
                  setReadmeOpenCode(newValue)
                  setReadmeQodoGen(newValue)
                  setReadmeWarp(newValue)
                  setReadmeWindsurf(newValue)
                }}
              >
                {readmeVSCode && readmeVSCodeInsiders && readmeVisualStudio && 
                 readmeCursor && readmeGoose && readmeLMStudio &&
                 readmeAmp && readmeClaudeCode && readmeClaudeDesktop &&
                 readmeCodex && readmeGeminiCLI && readmeOpenCode &&
                 readmeQodoGen && readmeWarp && readmeWindsurf ? 'Deselect All' : 'Select All'}
              </button>
            </div>
            <p className="section-description">Select platforms to include manual installation instructions in the README:</p>
            <div className={`${styles.ideCardsGrid} ide-cards-grid`}>
              <div 
                className={`${styles.ideCard} ide-card ${readmeVSCode ? 'active' : ''}`}
                onClick={() => setReadmeVSCode(!readmeVSCode)}
              >
                <div className="ide-card-content">
                  <h4>VS Code</h4>
                </div>
                <div className={`${styles.ideCardToggle} ide-card-toggle ${readmeVSCode ? 'checked' : ''}`}>
                  <div className="toggle-dot"></div>
                </div>
              </div>

              <div 
                className={`${styles.ideCard} ide-card ${readmeVSCodeInsiders ? 'active' : ''}`}
                onClick={() => setReadmeVSCodeInsiders(!readmeVSCodeInsiders)}
              >
                <div className="ide-card-content">
                  <h4>VS Code Insiders</h4>
                </div>
                <div className={`${styles.ideCardToggle} ide-card-toggle ${readmeVSCodeInsiders ? 'checked' : ''}`}>
                  <div className="toggle-dot"></div>
                </div>
              </div>

              <div 
                className={`${styles.ideCard} ide-card ${readmeVisualStudio ? 'active' : ''}`}
                onClick={() => setReadmeVisualStudio(!readmeVisualStudio)}
              >
                <div className="ide-card-content">
                  <h4>Visual Studio</h4>
                </div>
                <div className={`${styles.ideCardToggle} ide-card-toggle ${readmeVisualStudio ? 'checked' : ''}`}>
                  <div className="toggle-dot"></div>
                </div>
              </div>

              <div 
                className={`${styles.ideCard} ide-card ${readmeCursor ? 'active' : ''}`}
                onClick={() => setReadmeCursor(!readmeCursor)}
              >
                <div className="ide-card-content">
                  <h4>Cursor</h4>
                </div>
                <div className={`${styles.ideCardToggle} ide-card-toggle ${readmeCursor ? 'checked' : ''}`}>
                  <div className="toggle-dot"></div>
                </div>
              </div>

              <div 
                className={`${styles.ideCard} ide-card ${readmeGoose ? 'active' : ''}`}
                onClick={() => setReadmeGoose(!readmeGoose)}
              >
                <div className="ide-card-content">
                  <h4>Goose</h4>
                </div>
                <div className={`${styles.ideCardToggle} ide-card-toggle ${readmeGoose ? 'checked' : ''}`}>
                  <div className="toggle-dot"></div>
                </div>
              </div>

              <div 
                className={`${styles.ideCard} ide-card ${readmeLMStudio ? 'active' : ''}`}
                onClick={() => setReadmeLMStudio(!readmeLMStudio)}
              >
                <div className="ide-card-content">
                  <h4>LM Studio</h4>
                </div>
                <div className={`${styles.ideCardToggle} ide-card-toggle ${readmeLMStudio ? 'checked' : ''}`}>
                  <div className="toggle-dot"></div>
                </div>
              </div>

              <div 
                className={`${styles.ideCard} ide-card ${readmeAmp ? 'active' : ''}`}
                onClick={() => setReadmeAmp(!readmeAmp)}
              >
                <div className="ide-card-content">
                  <h4>Amp</h4>
                </div>
                <div className={`${styles.ideCardToggle} ide-card-toggle ${readmeAmp ? 'checked' : ''}`}>
                  <div className="toggle-dot"></div>
                </div>
              </div>

              <div 
                className={`${styles.ideCard} ide-card ${readmeClaudeCode ? 'active' : ''}`}
                onClick={() => setReadmeClaudeCode(!readmeClaudeCode)}
              >
                <div className="ide-card-content">
                  <h4>Claude Code</h4>
                </div>
                <div className={`${styles.ideCardToggle} ide-card-toggle ${readmeClaudeCode ? 'checked' : ''}`}>
                  <div className="toggle-dot"></div>
                </div>
              </div>

              <div 
                className={`${styles.ideCard} ide-card ${readmeClaudeDesktop ? 'active' : ''}`}
                onClick={() => setReadmeClaudeDesktop(!readmeClaudeDesktop)}
              >
                <div className="ide-card-content">
                  <h4>Claude Desktop</h4>
                </div>
                <div className={`${styles.ideCardToggle} ide-card-toggle ${readmeClaudeDesktop ? 'checked' : ''}`}>
                  <div className="toggle-dot"></div>
                </div>
              </div>

              <div 
                className={`${styles.ideCard} ide-card ${readmeCodex ? 'active' : ''}`}
                onClick={() => setReadmeCodex(!readmeCodex)}
              >
                <div className="ide-card-content">
                  <h4>Codex</h4>
                </div>
                <div className={`${styles.ideCardToggle} ide-card-toggle ${readmeCodex ? 'checked' : ''}`}>
                  <div className="toggle-dot"></div>
                </div>
              </div>

              <div 
                className={`${styles.ideCard} ide-card ${readmeGeminiCLI ? 'active' : ''}`}
                onClick={() => setReadmeGeminiCLI(!readmeGeminiCLI)}
              >
                <div className="ide-card-content">
                  <h4>Gemini CLI</h4>
                </div>
                <div className={`${styles.ideCardToggle} ide-card-toggle ${readmeGeminiCLI ? 'checked' : ''}`}>
                  <div className="toggle-dot"></div>
                </div>
              </div>

              <div 
                className={`${styles.ideCard} ide-card ${readmeOpenCode ? 'active' : ''}`}
                onClick={() => setReadmeOpenCode(!readmeOpenCode)}
              >
                <div className="ide-card-content">
                  <h4>OpenCode</h4>
                </div>
                <div className={`${styles.ideCardToggle} ide-card-toggle ${readmeOpenCode ? 'checked' : ''}`}>
                  <div className="toggle-dot"></div>
                </div>
              </div>

              <div 
                className={`${styles.ideCard} ide-card ${readmeQodoGen ? 'active' : ''}`}
                onClick={() => setReadmeQodoGen(!readmeQodoGen)}
              >
                <div className="ide-card-content">
                  <h4>Qodo Gen</h4>
                </div>
                <div className={`${styles.ideCardToggle} ide-card-toggle ${readmeQodoGen ? 'checked' : ''}`}>
                  <div className="toggle-dot"></div>
                </div>
              </div>

              <div 
                className={`${styles.ideCard} ide-card ${readmeWarp ? 'active' : ''}`}
                onClick={() => setReadmeWarp(!readmeWarp)}
              >
                <div className="ide-card-content">
                  <h4>Warp</h4>
                </div>
                <div className={`${styles.ideCardToggle} ide-card-toggle ${readmeWarp ? 'checked' : ''}`}>
                  <div className="toggle-dot"></div>
                </div>
              </div>

              <div 
                className={`${styles.ideCard} ide-card ${readmeWindsurf ? 'active' : ''}`}
                onClick={() => setReadmeWindsurf(!readmeWindsurf)}
              >
                <div className="ide-card-content">
                  <h4>Windsurf</h4>
                </div>
                <div className={`${styles.ideCardToggle} ide-card-toggle ${readmeWindsurf ? 'checked' : ''}`}>
                  <div className="toggle-dot"></div>
                </div>
              </div>
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
      </div>
    </>
  )
}

export default MCP
