import { useState } from 'react'
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
  const [includeCursor, setIncludeCursor] = useState(true)
  const [includeGoose, setIncludeGoose] = useState(true)
  const [includeLMStudio, setIncludeLMStudio] = useState(true)
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

    if (includeVSCode) {
      const vscodeUrl = `https://vscode.dev/redirect/mcp/install?name=${encodeURIComponent(serverName)}&config=${encodedConfig}`;
      badges.push(`[![Install in VS Code](https://img.shields.io/badge/VS_Code-Install_Server-0098FF?style=flat-square&logo=visualstudiocode&logoColor=white)](${vscodeUrl})`);
    }

    if (includeVSCodeInsiders) {
      const vscodeInsidersUrl = `https://insiders.vscode.dev/redirect/mcp/install?name=${encodeURIComponent(serverName)}&config=${encodedConfig}&quality=insiders`;
      badges.push(`[![Install in VS Code Insiders](https://img.shields.io/badge/VS_Code_Insiders-Install_Server-24bfa5?style=flat-square&logo=visualstudiocode&logoColor=white)](${vscodeInsidersUrl})`);
    }

    if (includeVisualStudio) {
      const vsUrl = `https://vs-open.link/mcp-install?${encodedConfig}`;
      badges.push(`[![Install in Visual Studio](https://img.shields.io/badge/Visual_Studio-Install_Server-C16FDE?logo=visualstudio&logoColor=white)](${vsUrl})`);
    }

    if (includeCursor) {
      const cursorUrl = `cursor://anysphere.cursor-deeplink/mcp/install?name=${encodeURIComponent(serverName)}&config=${encodedConfig}`;
      badges.push(`[![Install in Cursor](https://img.shields.io/badge/Cursor-Install_Server-8B5CF6?style=flat-square&logo=cursor&logoColor=white)](${cursorUrl})`);
    }

    if (includeGoose) {
      // Goose uses similar format as VSCode
      const gooseUrl = `goose://install-mcp?name=${encodeURIComponent(serverName)}&config=${encodedConfig}`;
      badges.push(`[![Install in Goose](https://img.shields.io/badge/Goose-Install_Server-10B981?style=flat-square&logo=goose&logoColor=white)](${gooseUrl})`);
    }

    if (includeLMStudio) {
      // LM Studio uses base64 encoding instead of URL encoding
      const configWithName = { name: serverName, ...config };
      const base64Config = btoa(JSON.stringify(configWithName));
      const lmstudioUrl = `lmstudio://add_mcp?name=${encodeURIComponent(serverName)}&config=${base64Config}`;
      badges.push(`[![Install in LM Studio](https://img.shields.io/badge/LM_Studio-Install_Server-3B82F6?style=flat-square&logo=lmstudio&logoColor=white)](${lmstudioUrl})`);
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
    
    // VS Code section
    if (includeVSCode || includeVSCodeInsiders) {
      readmeContent += `#### VS Code / VS Code Insiders\n\n`;
      readmeContent += `1. Open VS Code or VS Code Insiders\n`;
      readmeContent += `2. Open the Command Palette (Ctrl+Shift+P / Cmd+Shift+P)\n`;
      readmeContent += `3. Search for "MCP: Add Server"\n`;
      readmeContent += `4. Enter the following configuration:\n\n`;
      readmeContent += `\`\`\`json\n${jsonConfig}\n\`\`\`\n\n`;
      
      if (includeVSCode) {
        const cliCommand = generateCliCommand(false);
        readmeContent += `**Or use the CLI:**\n\n\`\`\`bash\n${cliCommand}\n\`\`\`\n\n`;
      }
    }
    
    // Visual Studio section
    if (includeVisualStudio) {
      readmeContent += `#### Visual Studio\n\n`;
      readmeContent += `1. Open Visual Studio\n`;
      readmeContent += `2. Navigate to Tools > Options > MCP Servers\n`;
      readmeContent += `3. Click "Add Server" and enter the configuration:\n\n`;
      readmeContent += `\`\`\`json\n${jsonConfig}\n\`\`\`\n\n`;
    }
    
    // Cursor section
    if (includeCursor) {
      readmeContent += `#### Cursor\n\n`;
      readmeContent += `1. Open Cursor Settings (Ctrl+, / Cmd+,)\n`;
      readmeContent += `2. Navigate to "MCP" section\n`;
      readmeContent += `3. Add the following server configuration:\n\n`;
      readmeContent += `\`\`\`json\n${jsonConfig}\n\`\`\`\n\n`;
    }
    
    // Goose section
    if (includeGoose) {
      readmeContent += `#### Goose\n\n`;
      readmeContent += `To install via npx:\n\n`;
      readmeContent += `\`\`\`bash\nnpx --yes -p @dylibso/mcpx@latest install --client goose --url "${configType === 'http' ? serverUrl : 'local'}"\n\`\`\`\n\n`;
      readmeContent += `Or add to your Goose configuration file:\n\n`;
      readmeContent += `\`\`\`json\n${jsonConfig}\n\`\`\`\n\n`;
    }
    
    // LM Studio section
    if (includeLMStudio) {
      readmeContent += `#### LM Studio\n\n`;
      readmeContent += `1. Open LM Studio\n`;
      readmeContent += `2. Navigate to the "Program" tab in the sidebar\n`;
      readmeContent += `3. Edit the \`mcp.json\` file\n`;
      readmeContent += `4. Add the following configuration:\n\n`;
      readmeContent += `\`\`\`json\n${jsonConfig}\n\`\`\`\n\n`;
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
            <label>Target IDEs</label>
            <div className="ide-cards">
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
                  <p>Visual Studio Code</p>
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
                  <p>Preview builds</p>
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
                  <p>Full IDE experience</p>
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
                  <p>AI-powered IDE</p>
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
                  <p>AI coding assistant</p>
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
                  <p>Local LLM platform</p>
                </div>
                <div className={`ide-card-toggle ${includeLMStudio ? 'checked' : ''}`}>
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
