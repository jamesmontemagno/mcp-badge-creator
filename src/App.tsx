import { useState } from 'react'
import './App.css'

type ConfigType = 'http' | 'docker' | 'local';

interface MCPConfig {
  name: string;
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
  const [includeVSCode, setIncludeVSCode] = useState(true)
  const [includeVSCodeInsiders, setIncludeVSCodeInsiders] = useState(true)
  const [includeVisualStudio, setIncludeVisualStudio] = useState(true)
  const [copied, setCopied] = useState(false)

  const generateConfig = (): MCPConfig => {
    const config: MCPConfig = { name: serverName };
    
    switch (configType) {
      case 'http':
        config.type = 'http';
        config.url = serverUrl;
        break;
      case 'docker':
        config.command = 'docker';
        config.args = ['run', '-i', '--rm', dockerImage];
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

  const generateMarkdown = (): string => {
    if (!serverName) return '';
    
    const config = generateConfig();
    const encodedConfig = encodeConfig(config);
    const badges: string[] = [];

    if (includeVSCode) {
      const vscodeUrl = `https://insiders.vscode.dev/redirect/mcp/install?name=${encodeURIComponent(serverName)}&config=${encodedConfig}`;
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
              </div>
            </>
          )}

          <div className="form-group">
            <label>Target IDEs</label>
            <div className="checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={includeVSCode}
                  onChange={(e) => setIncludeVSCode(e.target.checked)}
                />
                VS Code
              </label>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={includeVSCodeInsiders}
                  onChange={(e) => setIncludeVSCodeInsiders(e.target.checked)}
                />
                VS Code Insiders
              </label>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={includeVisualStudio}
                  onChange={(e) => setIncludeVisualStudio(e.target.checked)}
                />
                Visual Studio
              </label>
            </div>
          </div>
        </div>

        <div className="output-section">
          <h2>Generated Badges</h2>
          
          {markdown ? (
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
                <h3>JSON Configuration</h3>
                <pre><code>{JSON.stringify(generateConfig(), null, 2)}</code></pre>
              </div>
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
      </footer>
    </div>
  )
}

export default App
