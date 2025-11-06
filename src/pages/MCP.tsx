import { useState } from 'react'
import styles from './MCP.module.css'
import MCPSearchDropdown from '../components/MCPSearchDropdown'
import { parseRuntimeConfig } from '../utils/mcpRegistryApi'
import type { MCPSearchResult } from '../utils/mcpRegistryApi'

type ConfigType = 'http' | 'docker' | 'local' | 'npx' | 'uvx' | 'dnx';

interface MCPConfig {
  name?: string; // Only used for encoding in URL parameters, not in the actual config
  type?: string;
  url?: string;
  command?: string;
  args?: string[];
  env?: Record<string, string>;
  headers?: Record<string, string>;
}

interface MCPInput {
  type: 'promptString';
  id: string;
  description: string;
  password?: boolean;
}

interface DynamicArgument {
  flag: string;
  value: string;
}

interface DynamicEnvVar {
  key: string;
  value: string;
  password?: boolean;
  inputName?: string;
  inputDescription?: string;
}

interface DynamicHeader {
  key: string;
  value: string;
  password?: boolean;
  inputName?: string;
  inputDescription?: string;
}

interface StandaloneInput {
  id: string;
  description: string;
  password?: boolean;
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
  
  // Dynamic arguments and environment variables (per config type)
  const [dynamicArgs, setDynamicArgs] = useState<Record<ConfigType, DynamicArgument[]>>({
    http: [],
    docker: [],
    local: [],
    npx: [],
    uvx: [],
    dnx: []
  })
  const [dynamicEnv, setDynamicEnv] = useState<Record<ConfigType, DynamicEnvVar[]>>({
    http: [],
    docker: [],
    local: [],
    npx: [],
    uvx: [],
    dnx: []
  })
  
  // HTTP headers (only for http config type)
  const [httpHeaders, setHttpHeaders] = useState<DynamicHeader[]>([])
  
  // Standalone inputs (not tied to headers or env vars)
  const [standaloneInputs, setStandaloneInputs] = useState<StandaloneInput[]>([])
  
  // Import modal state
  const [showImportModal, setShowImportModal] = useState(false)
  const [importJsonText, setImportJsonText] = useState('')
  
  // Search registry state
  const [showSearchModal, setShowSearchModal] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [showSearchDropdown, setShowSearchDropdown] = useState(false)

  const generateConfig = (): MCPConfig => {
    const config: MCPConfig = {};
    const currentDynamicArgs = dynamicArgs[configType] || [];
    const currentDynamicEnv = dynamicEnv[configType] || [];
    
    // Helper function to get input ID for password fields
    const getInputId = (key: string, customName?: string) => {
      return customName || key.toLowerCase().replace(/[^a-z0-9_]/g, '_');
    };
    
    switch (configType) {
      case 'http':
        // HTTP servers only have type, url, and headers (no env)
        config.type = 'http';
        config.url = serverUrl;
        // Add HTTP headers
        if (httpHeaders.length > 0) {
          const headers: Record<string, string> = {};
          httpHeaders.forEach(header => {
            const inputId = getInputId(header.key, header.inputName);
            const headerValue = header.password ? `\${input:${inputId}}` : header.value;
            headers[header.key] = headerValue;
          });
          if (Object.keys(headers).length > 0) {
            config.headers = headers;
          }
        }
        break;
      case 'docker':
        // STDIO servers have command, args, and env (no name or type)
        config.command = 'docker';
        config.args = ['run', '-i', '--rm'];
        // Add dynamic args before image name
        if (currentDynamicArgs.length > 0) {
          currentDynamicArgs.forEach(arg => {
            config.args!.push(arg.flag);
            if (arg.value) config.args!.push(arg.value);
          });
        }
        // Add environment variables as -e flags before image name
        if (currentDynamicEnv.length > 0) {
          currentDynamicEnv.forEach(envVar => {
            const inputId = getInputId(envVar.key, envVar.inputName);
            const envValue = envVar.password ? `\${input:${inputId}}` : envVar.value;
            config.args!.push('-e');
            config.args!.push(`${envVar.key}=${envValue}`);
          });
        }
        // Add image name last
        config.args!.push(dockerImage);
        // Docker env object should be empty
        config.env = {};
        break;
      case 'npx':
        config.command = 'npx';
        config.args = ['-y', npxPackage];
        // Add dynamic args
        if (currentDynamicArgs.length > 0) {
          currentDynamicArgs.forEach(arg => {
            config.args!.push(arg.flag);
            if (arg.value) config.args!.push(arg.value);
          });
        }
        // Add dynamic env vars
        config.env = {};
        if (currentDynamicEnv.length > 0) {
          currentDynamicEnv.forEach(envVar => {
            const inputId = getInputId(envVar.key, envVar.inputName);
            const envValue = envVar.password ? `\${input:${inputId}}` : envVar.value;
            config.env![envVar.key] = envValue;
          });
        }
        break;
      case 'uvx': {
        config.command = 'uvx';
        const uvxArgs = uvxFrom ? ['--from', uvxFrom, uvxPackage] : [uvxPackage];
        config.args = uvxArgs;
        // Add dynamic args
        if (currentDynamicArgs.length > 0) {
          currentDynamicArgs.forEach(arg => {
            config.args!.push(arg.flag);
            if (arg.value) config.args!.push(arg.value);
          });
        }
        // Add dynamic env vars
        config.env = {};
        if (currentDynamicEnv.length > 0) {
          currentDynamicEnv.forEach(envVar => {
            const inputId = getInputId(envVar.key, envVar.inputName);
            const envValue = envVar.password ? `\${input:${inputId}}` : envVar.value;
            config.env![envVar.key] = envValue;
          });
        }
        break;
      }
      case 'dnx':
        config.command = 'dnx';
        config.args = [dnxPackage, '--yes'];
        // Add dynamic args
        if (currentDynamicArgs.length > 0) {
          currentDynamicArgs.forEach(arg => {
            config.args!.push(arg.flag);
            if (arg.value) config.args!.push(arg.value);
          });
        }
        // Add dynamic env vars
        config.env = {};
        if (currentDynamicEnv.length > 0) {
          currentDynamicEnv.forEach(envVar => {
            const inputId = getInputId(envVar.key, envVar.inputName);
            const envValue = envVar.password ? `\${input:${inputId}}` : envVar.value;
            config.env![envVar.key] = envValue;
          });
        }
        break;
      case 'local':
        config.command = localCommand;
        config.args = localArgs.split(',').map(arg => arg.trim()).filter(arg => arg);
        // Add dynamic args
        if (currentDynamicArgs.length > 0) {
          currentDynamicArgs.forEach(arg => {
            config.args!.push(arg.flag);
            if (arg.value) config.args!.push(arg.value);
          });
        }
        // Add dynamic env vars
        config.env = {};
        if (currentDynamicEnv.length > 0) {
          currentDynamicEnv.forEach(envVar => {
            const inputId = getInputId(envVar.key, envVar.inputName);
            const envValue = envVar.password ? `\${input:${inputId}}` : envVar.value;
            config.env![envVar.key] = envValue;
          });
        }
        break;
    }
    
    return config;
  }

  const encodeConfig = (config: MCPConfig): string => {
    return encodeURIComponent(JSON.stringify(config));
  }

  // Helper function to get config with inputs for badge URLs
  const getConfigForBadge = () => {
    const config = generateConfig();
    const fullConfig = generateFullConfig();
    
    // If we have inputs, return the full config structure with inputs
    if (fullConfig.inputs && fullConfig.inputs.length > 0) {
      return {
        ...config,
        inputs: fullConfig.inputs
      };
    }
    
    // Otherwise, return just the server config
    return config;
  }

  const generateCliCommand = (isInsiders: boolean = false): string => {
    const fullConfig = generateFullConfig();
    
    // CLI command requires the full config structure with inputs
    const cliConfig = {
      name: serverName,
      ...generateConfig(),
      ...(fullConfig.inputs && fullConfig.inputs.length > 0 ? { inputs: fullConfig.inputs } : {})
    };
    
    const jsonString = JSON.stringify(cliConfig);
    // Escape with backslashes for cross-platform compatibility (works in PowerShell, Bash, Zsh)
    const escapedJson = jsonString.replace(/"/g, '\\"');
    const command = isInsiders ? 'code-insiders' : 'code';
    return `${command} --add-mcp '${escapedJson}'`;
  }

  const generateFullConfig = () => {
    const config = generateConfig();
    const currentDynamicEnv = dynamicEnv[configType] || [];
    
    // Helper function to get input ID for password fields
    const getInputId = (key: string, customName?: string) => {
      return customName || key.toLowerCase().replace(/[^a-z0-9_]/g, '_');
    };
    
    // Check if any env vars or HTTP headers have password flag
    const envPasswordInputs = currentDynamicEnv.filter(env => env.password);
    const headerPasswordInputs = configType === 'http' ? httpHeaders.filter(header => header.password) : [];
    const hasPasswordInputs = envPasswordInputs.length > 0 || headerPasswordInputs.length > 0 || standaloneInputs.length > 0;
    
    if (hasPasswordInputs) {
      // Build full config with inputs array
      const inputs: MCPInput[] = [
        ...envPasswordInputs.map(env => ({
          type: 'promptString' as const,
          id: getInputId(env.key, env.inputName),
          description: env.inputDescription || `Enter ${env.key}`,
          password: true
        })),
        ...headerPasswordInputs.map(header => ({
          type: 'promptString' as const,
          id: getInputId(header.key, header.inputName),
          description: header.inputDescription || `Enter ${header.key}`,
          password: true
        })),
        ...standaloneInputs.map(input => ({
          type: 'promptString' as const,
          id: input.id,
          description: input.description,
          password: input.password
        }))
      ];
      
      return {
        inputs,
        servers: {
          [serverName]: config
        }
      };
    } else {
      // Standard config without inputs
      return {
        servers: {
          [serverName]: config
        }
      };
    }
  }

  const addDynamicArg = () => {
    setDynamicArgs(prev => ({
      ...prev,
      [configType]: [...(prev[configType] || []), { flag: '', value: '' }]
    }));
  }

  const removeDynamicArg = (index: number) => {
    setDynamicArgs(prev => ({
      ...prev,
      [configType]: (prev[configType] || []).filter((_, i) => i !== index)
    }));
  }

  const updateDynamicArg = (index: number, flag: string, value: string) => {
    setDynamicArgs(prev => ({
      ...prev,
      [configType]: (prev[configType] || []).map((arg, i) =>
        i === index ? { flag, value } : arg
      )
    }));
  }

  const addDynamicEnvVar = () => {
    setDynamicEnv(prev => ({
      ...prev,
      [configType]: [...(prev[configType] || []), { key: '', value: '', password: false }]
    }));
  }

  const removeDynamicEnvVar = (index: number) => {
    setDynamicEnv(prev => ({
      ...prev,
      [configType]: (prev[configType] || []).filter((_, i) => i !== index)
    }));
  }

  const updateDynamicEnvVar = (index: number, key: string, value: string, password: boolean, inputName?: string, inputDescription?: string) => {
    setDynamicEnv(prev => ({
      ...prev,
      [configType]: (prev[configType] || []).map((env, i) =>
        i === index ? { key, value, password, inputName, inputDescription } : env
      )
    }));
  }

  const addHttpHeader = () => {
    setHttpHeaders(prev => [...prev, { key: '', value: '', password: false }]);
  }

  const removeHttpHeader = (index: number) => {
    setHttpHeaders(prev => prev.filter((_, i) => i !== index));
  }

  const updateHttpHeader = (index: number, key: string, value: string, password: boolean, inputName?: string, inputDescription?: string) => {
    setHttpHeaders(prev =>
      prev.map((header, i) =>
        i === index ? { key, value, password, inputName, inputDescription } : header
      )
    );
  }

  const addStandaloneInput = () => {
    setStandaloneInputs(prev => [...prev, { id: '', description: '', password: true }]);
  }

  const removeStandaloneInput = (index: number) => {
    setStandaloneInputs(prev => prev.filter((_, i) => i !== index));
  }

  const updateStandaloneInput = (index: number, id: string, description: string, password: boolean) => {
    setStandaloneInputs(prev =>
      prev.map((input, i) =>
        i === index ? { id, description, password } : input
      )
    );
  }

  const resetForm = () => {
    if (!confirm('Are you sure you want to reset all fields? This action cannot be undone.')) {
      return;
    }

    // Reset basic fields
    setServerName('');
    setConfigType('http');
    setServerUrl('');
    setDockerImage('');
    setLocalCommand('node');
    setLocalArgs('');
    setNpxPackage('');
    setUvxPackage('');
    setUvxFrom('');
    setDnxPackage('');
    setBadgeText('Install in');

    // Reset dynamic arguments and env vars
    setDynamicArgs({
      http: [],
      docker: [],
      local: [],
      npx: [],
      uvx: [],
      dnx: []
    });
    setDynamicEnv({
      http: [],
      docker: [],
      local: [],
      npx: [],
      uvx: [],
      dnx: []
    });

    // Reset HTTP headers and standalone inputs
    setHttpHeaders([]);
    setStandaloneInputs([]);

    // Reset badge generation platforms
    setIncludeVSCode(true);
    setIncludeVSCodeInsiders(true);
    setIncludeVisualStudio(true);
    setIncludeCursor(false);
    setIncludeGoose(false);
    setIncludeLMStudio(false);

    // Reset README platforms
    setReadmeVSCode(true);
    setReadmeVSCodeInsiders(true);
    setReadmeVisualStudio(true);
    setReadmeCursor(false);
    setReadmeGoose(false);
    setReadmeLMStudio(false);
    setReadmeAmp(false);
    setReadmeClaudeCode(false);
    setReadmeClaudeDesktop(false);
    setReadmeCodex(false);
    setReadmeGeminiCLI(false);
    setReadmeOpenCode(false);
    setReadmeQodoGen(false);
    setReadmeWarp(false);
    setReadmeWindsurf(false);
  }

  const parseAndImportConfig = (content: string) => {
    try {
      const parsed = JSON.parse(content);
      
      // Extract server configuration
      let serverConfig: MCPConfig | null = null;
      let extractedServerName = '';
      let inputs: MCPInput[] = [];
      
      // Handle different formats
      if (parsed.mcpServers) {
        // Format: { "mcpServers": { "server-name": {...} } }
        const firstServer = Object.keys(parsed.mcpServers)[0];
        extractedServerName = firstServer;
        serverConfig = parsed.mcpServers[firstServer];
      } else if (parsed.servers) {
        // Format: { "servers": { "server-name": {...} }, "inputs": [...] }
        const firstServer = Object.keys(parsed.servers)[0];
        extractedServerName = firstServer;
        serverConfig = parsed.servers[firstServer];
        inputs = parsed.inputs || [];
      } else {
        // Direct server config
        serverConfig = parsed;
      }

      if (!serverConfig) {
        alert('Could not parse configuration. Please check the file format.');
        return false;
      }

      // Set server name
      setServerName(extractedServerName || 'imported-server');

      // Detect configuration type and populate fields
      if (serverConfig.type === 'http') {
        setConfigType('http');
        setServerUrl(serverConfig.url || '');
        
        // Parse headers
        if (serverConfig.headers) {
          const headersList: DynamicHeader[] = [];
          Object.entries(serverConfig.headers).forEach(([key, value]) => {
            const isPassword = typeof value === 'string' && value.includes('${input:');
            const inputMatch = isPassword ? (value as string).match(/\$\{input:([^}]+)\}/) : null;
            const inputId = inputMatch ? inputMatch[1] : '';
            const inputObj = inputs.find(inp => inp.id === inputId);
            
            headersList.push({
              key,
              value: isPassword ? '' : value as string,
              password: isPassword,
              inputName: inputId,
              inputDescription: inputObj?.description || ''
            });
          });
          setHttpHeaders(headersList);
        }
      } else if (serverConfig.command) {
        // STDIO server
        const cmd = serverConfig.command;
        
        // Detect type based on command
        if (cmd === 'npx') {
          setConfigType('npx');
          setNpxPackage(serverConfig.args?.[1] || '');
        } else if (cmd === 'uvx') {
          setConfigType('uvx');
          const args = serverConfig.args || [];
          const fromIndex = args.indexOf('--from');
          if (fromIndex !== -1 && args[fromIndex + 1]) {
            setUvxFrom(args[fromIndex + 1]);
            setUvxPackage(args[fromIndex + 2] || '');
          } else {
            setUvxPackage(args[0] || '');
          }
        } else if (cmd === 'dnx') {
          setConfigType('dnx');
          setDnxPackage(serverConfig.args?.[0] || '');
        } else if (cmd === 'docker') {
          setConfigType('docker');
          const args = serverConfig.args || [];
          
          // Find Docker image - it's the last non-flag argument
          // Skip 'run', '-i', '--rm', and any '-e' flags with their values
          let imageIndex = -1;
          for (let i = args.length - 1; i >= 0; i--) {
            const arg = args[i];
            // Skip if it's a flag or common docker run args
            if (arg.startsWith('-') || arg === 'run' || arg === '-i' || arg === '--rm') {
              continue;
            }
            // Skip if previous arg was -e (this is an env var value)
            if (i > 0 && args[i - 1] === '-e') {
              continue;
            }
            // This must be the image name
            imageIndex = i;
            break;
          }
          setDockerImage(imageIndex >= 0 ? args[imageIndex] : '');
          
          // Parse environment variables from -e flags in args
          const envList: DynamicEnvVar[] = [];
          for (let i = 0; i < args.length; i++) {
            if (args[i] === '-e' && i + 1 < args.length) {
              const envPair = args[i + 1];
              const [key, ...valueParts] = envPair.split('=');
              const value = valueParts.join('='); // Handle values with = in them
              
              const isPassword = value.includes('${input:');
              const inputMatch = isPassword ? value.match(/\$\{input:([^}]+)\}/) : null;
              const inputId = inputMatch ? inputMatch[1] : '';
              const inputObj = inputs.find(inp => inp.id === inputId);
              
              envList.push({
                key,
                value: isPassword ? '' : value,
                password: isPassword,
                inputName: inputId,
                inputDescription: inputObj?.description || ''
              });
              i++; // Skip next arg since we consumed it
            }
          }
          
          if (envList.length > 0) {
            setDynamicEnv(prev => ({
              ...prev,
              docker: envList
            }));
          }
        } else {
          setConfigType('local');
          setLocalCommand(cmd);
          setLocalArgs(serverConfig.args?.join(', ') || '');
        }
        
        // Parse environment variables from env object (for non-Docker configs)
        // Docker env vars are already parsed from -e flags above
        if (serverConfig.env && cmd !== 'docker') {
          const envList: DynamicEnvVar[] = [];
          Object.entries(serverConfig.env).forEach(([key, value]) => {
            const isPassword = typeof value === 'string' && value.includes('${input:');
            const inputMatch = isPassword ? (value as string).match(/\$\{input:([^}]+)\}/) : null;
            const inputId = inputMatch ? inputMatch[1] : '';
            const inputObj = inputs.find(inp => inp.id === inputId);
            
            envList.push({
              key,
              value: isPassword ? '' : value as string,
              password: isPassword,
              inputName: inputId,
              inputDescription: inputObj?.description || ''
            });
          });
          setDynamicEnv(prev => ({
            ...prev,
            [configType]: envList
          }));
        }
      }
      
      // Parse standalone inputs (inputs not referenced in headers or env)
      if (inputs.length > 0) {
        const referencedInputIds = new Set<string>();
        
        // Collect all referenced input IDs from headers and env vars
        if (serverConfig.headers) {
          Object.values(serverConfig.headers).forEach(value => {
            const match = typeof value === 'string' ? value.match(/\$\{input:([^}]+)\}/) : null;
            if (match) referencedInputIds.add(match[1]);
          });
        }
        if (serverConfig.env) {
          Object.values(serverConfig.env).forEach(value => {
            const match = typeof value === 'string' ? value.match(/\$\{input:([^}]+)\}/) : null;
            if (match) referencedInputIds.add(match[1]);
          });
        }
        // For Docker, also check args for -e flags
        if (serverConfig.command === 'docker' && serverConfig.args) {
          serverConfig.args.forEach((arg: string) => {
            const match = arg.match(/\$\{input:([^}]+)\}/);
            if (match) referencedInputIds.add(match[1]);
          });
        }
        
        // Add unreferenced inputs as standalone
        const standalone = inputs
          .filter(input => !referencedInputIds.has(input.id))
          .map(input => ({
            id: input.id,
            description: input.description,
            password: input.password !== false
          }));
        
        if (standalone.length > 0) {
          setStandaloneInputs(standalone);
        }
      }

      return true;
      
    } catch (error) {
      console.error('Error parsing config:', error);
      alert('Error parsing configuration. Please check the JSON format.');
      return false;
    }
  }

  const handleImportConfig = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      if (parseAndImportConfig(content)) {
        alert('Configuration imported successfully!');
      }
    };

    reader.readAsText(file);
    event.target.value = ''; // Reset input
  }

  const handleImportFromText = () => {
    if (!importJsonText.trim()) {
      alert('Please paste your JSON configuration.');
      return;
    }

    if (parseAndImportConfig(importJsonText)) {
      alert('Configuration imported successfully!');
      setShowImportModal(false);
      setImportJsonText('');
    }
  }

  const handleSelectMCPServer = (server: MCPSearchResult) => {
    // Set server name
    setServerName(server.name || server.id)
    
    // Parse runtime config
    const parsed = parseRuntimeConfig(server.runtime)
    
    if (parsed) {
      // Set config type
      setConfigType(parsed.configType)
      
      // Set type-specific fields
      if (parsed.configType === 'http') {
        setServerUrl(parsed.serverUrl || '')
        
        // Set headers if available
        if (parsed.headers) {
          const headersList: DynamicHeader[] = Object.entries(parsed.headers).map(([key, value]) => ({
            key,
            value: value as string,
            password: false
          }))
          setHttpHeaders(headersList)
        }
      } else if (parsed.configType === 'npx') {
        setNpxPackage(parsed.npxPackage || '')
      } else if (parsed.configType === 'uvx') {
        setUvxPackage(parsed.uvxPackage || '')
        setUvxFrom(parsed.uvxFrom || '')
      } else if (parsed.configType === 'dnx') {
        setDnxPackage(parsed.dnxPackage || '')
      } else if (parsed.configType === 'docker') {
        setDockerImage(parsed.dockerImage || '')
      } else if (parsed.configType === 'local') {
        setLocalCommand(parsed.localCommand || 'node')
        setLocalArgs(parsed.localArgs || '')
      }
      
      // Set environment variables
      if (parsed.env && parsed.configType !== 'http') {
        const envList: DynamicEnvVar[] = Object.entries(parsed.env).map(([key, value]) => {
          const strValue = value as string
          // Check if value is a placeholder like ${token}
          const isPasswordPlaceholder = /^\$\{[^}]+\}$/.test(strValue)
          
          return {
            key,
            value: isPasswordPlaceholder ? '' : strValue,
            password: isPasswordPlaceholder,
            inputName: isPasswordPlaceholder ? strValue.replace(/^\$\{|\}$/g, '') : undefined,
            inputDescription: isPasswordPlaceholder ? `Enter ${key}` : undefined
          }
        })
        setDynamicEnv(prev => ({
          ...prev,
          [parsed.configType]: envList
        }))
      }
    }
    
    // Close search modal
    setShowSearchModal(false)
    setSearchQuery('')
    
    alert(`Configuration from "${server.name}" imported successfully! You can now customize it before generating badges.`)
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
    
    const configForBadge = getConfigForBadge();
    const encodedConfig = encodeConfig(configForBadge);
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
      const fullConfig = generateFullConfig();
      const configWithName = { 
        name: serverName, 
        ...generateConfig(),
        ...(fullConfig.inputs && fullConfig.inputs.length > 0 ? { inputs: fullConfig.inputs } : {})
      };
      const base64Config = btoa(JSON.stringify(configWithName));
      const cursorUrl = `https://cursor.com/en/install-mcp?name=${encodeURIComponent(serverName)}&config=${base64Config}`;
      badges.push(`[![Install in Cursor](https://img.shields.io/badge/${customBadgeText}-Cursor-000000?style=flat-square&logoColor=white)](${cursorUrl})`);
    }

    if (includeGoose) {
      // Use Goose's official badge format from Playwright repository
      const fullConfig = generateFullConfig();
      const configWithName = { 
        name: serverName, 
        ...generateConfig(),
        ...(fullConfig.inputs && fullConfig.inputs.length > 0 ? { inputs: fullConfig.inputs } : {})
      };
      const args = configWithName.args ? configWithName.args.join('%20') : '';
      const cmd = configWithName.command || '';
      const gooseUrl = `https://block.github.io/goose/extension?cmd=${encodeURIComponent(cmd)}&arg=${encodeURIComponent(args)}&id=${encodeURIComponent(serverName)}&name=${encodeURIComponent(serverName)}&description=MCP%20Server%20for%20${encodeURIComponent(serverName)}`;
      badges.push(`[![Install in Goose](https://block.github.io/goose/img/extension-install-dark.svg)](${gooseUrl})`);
    }

    if (includeLMStudio) {
      // Use LM Studio's official badge format from Playwright repository
      const fullConfig = generateFullConfig();
      const configWithName = { 
        name: serverName, 
        ...generateConfig(),
        ...(fullConfig.inputs && fullConfig.inputs.length > 0 ? { inputs: fullConfig.inputs } : {})
      };
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
    
    // Check if we have password inputs
    const hasPasswordInputs = fullConfig.inputs && fullConfig.inputs.length > 0;
    
    let readmeContent = `## Getting Started\n\n`;
    readmeContent += `### Quick Install\n\n`;
    readmeContent += `Click one of the buttons below to install the MCP server in your preferred IDE:\n\n`;
    
    // Add badges
    readmeContent += generateMarkdown() + '\n\n';
    
    // Add manual installation section
    readmeContent += `### Manual Installation\n\n`;
    
    // Add note about password inputs if present
    if (hasPasswordInputs) {
      readmeContent += `> **Note:** This configuration includes secure password prompts. When you install the MCP server, you'll be prompted to enter the following:\n`;
      fullConfig.inputs?.forEach(input => {
        readmeContent += `> - **${input.id}**: ${input.description}\n`;
      });
      readmeContent += `>\n`;
      readmeContent += `> These values are stored securely and never hardcoded in your configuration.\n\n`;
    }
    
    readmeContent += `**Standard config** works in most tools:\n\n`;
    readmeContent += `\`\`\`js\n${jsonConfig}\n\`\`\`\n\n`;
    
    // VS Code section
    if (readmeVSCode) {
      readmeContent += `<details>\n<summary>VS Code</summary>\n\n`;
      readmeContent += `#### Click the button to install:\n\n`;
      const vscodeUrl = `https://vscode.dev/redirect/mcp/install?name=${encodeURIComponent(serverName)}&config=${encodeConfig(getConfigForBadge())}`;
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
      const vscodeInsidersUrl = `https://insiders.vscode.dev/redirect/mcp/install?name=${encodeURIComponent(serverName)}&config=${encodeConfig(getConfigForBadge())}&quality=insiders`;
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
      const vsUrl = `https://vs-open.link/mcp-install?${encodeConfig(getConfigForBadge())}`;
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
        if (config.headers && Object.keys(config.headers).length > 0) {
          readmeContent += `   - **Headers**: Configure custom headers as needed\n`;
        }
      } else {
        readmeContent += `   - **Type**: Select \`stdio\` from the dropdown\n`;
        readmeContent += `   - **Command**: \`${config.command || ''}\`\n`;
        if (config.args && config.args.length > 0) {
          readmeContent += `   - **Arguments**: \`${config.args.join(' ')}\`\n`;
        }
        if (config.env && Object.keys(config.env).length > 0) {
          readmeContent += `   - **Environment Variables**: Configure as needed\n`;
        }
      }
      if (hasPasswordInputs) {
        readmeContent += `   - **Note**: You'll be prompted for secure values during installation\n`;
      }
      readmeContent += `6. Click "Save" to add the server\n\n`;
      readmeContent += `For detailed instructions, see the [Visual Studio MCP documentation](https://learn.microsoft.com/visualstudio/ide/mcp-servers).\n</details>\n\n`;
    }
    
    // Cursor section
    if (readmeCursor) {
      readmeContent += `<details>\n<summary>Cursor</summary>\n\n`;
      readmeContent += `#### Click the button to install:\n\n`;
      const configWithName = { 
        name: serverName, 
        ...generateConfig(),
        ...(fullConfig.inputs && fullConfig.inputs.length > 0 ? { inputs: fullConfig.inputs } : {})
      };
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
      const configWithName = { 
        name: serverName, 
        ...generateConfig(),
        ...(fullConfig.inputs && fullConfig.inputs.length > 0 ? { inputs: fullConfig.inputs } : {})
      };
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
      const configWithName = { 
        name: serverName, 
        ...generateConfig(),
        ...(fullConfig.inputs && fullConfig.inputs.length > 0 ? { inputs: fullConfig.inputs } : {})
      };
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
          
          <div className={styles.sectionSpacer}></div>
          
          <div className="form-group">
            <div className={styles.sectionHeader}>
              <label>Import Configuration</label>
            </div>
            <p className="section-description">Have an existing mcp.json? Import it to auto-fill the form:</p>
            <div className={styles.importButtonsGrid}>
              <button
                type="button"
                className={styles.importBtn}
                onClick={() => setShowSearchModal(true)}
              >
                <span>🔍</span> Search Registry
              </button>
              <label htmlFor="import-config" className={styles.importBtn}>
                <span>📄</span> Upload File
                <input
                  id="import-config"
                  type="file"
                  accept=".json,application/json"
                  onChange={handleImportConfig}
                  style={{ display: 'none' }}
                />
              </label>
              <button
                type="button"
                className={styles.importBtn}
                onClick={() => setShowImportModal(true)}
              >
                <span>📋</span> Paste JSON
              </button>
              <button
                type="button"
                className={styles.resetBtn}
                onClick={resetForm}
              >
                <span>🔄</span> Reset Form
              </button>
            </div>
            <small className="field-hint">Supports standard MCP configuration formats</small>
          </div>
          
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

          {configType === 'http' && (
            <div className="form-group">
              <div className={styles.sectionHeader}>
                <label>HTTP Headers</label>
              </div>
              <p className="section-description">Add custom HTTP headers for your server (e.g., Authorization, Custom-Header):</p>
              {httpHeaders.map((header, index) => (
                <div key={index} className={styles.headerCard}>
                  <div className={styles.dynamicEnvRow}>
                    <input
                      type="text"
                      placeholder="Header-Name"
                      value={header.key}
                      onChange={(e) => updateHttpHeader(index, e.target.value, header.value, header.password || false, header.inputName, header.inputDescription)}
                      className={styles.keyInput}
                    />
                    <input
                      type={header.password ? 'password' : 'text'}
                      placeholder="value or leave empty if using password"
                      value={header.value}
                      onChange={(e) => updateHttpHeader(index, header.key, e.target.value, header.password || false, header.inputName, header.inputDescription)}
                      className={styles.valueInput}
                      disabled={header.password}
                    />
                    <label className={`${styles.passwordToggle} password-toggle`}>
                      <input
                        type="checkbox"
                        checked={header.password}
                        onChange={(e) => updateHttpHeader(index, header.key, header.value, e.target.checked, header.inputName, header.inputDescription)}
                      />
                      <span>Password</span>
                    </label>
                    <button
                      type="button"
                      className={styles.deleteBtn}
                      onClick={() => removeHttpHeader(index)}
                      aria-label="Remove header"
                    >
                      ✕
                    </button>
                  </div>
                  {header.password && (
                    <div className={styles.inputDetailsRow}>
                      <input
                        type="text"
                        placeholder="Input ID (optional, e.g., github_token)"
                        value={header.inputName || ''}
                        onChange={(e) => updateHttpHeader(index, header.key, header.value, header.password || false, e.target.value, header.inputDescription)}
                        className={styles.inputNameField}
                      />
                      <input
                        type="text"
                        placeholder="Input Description (optional, e.g., GitHub Personal Access Token)"
                        value={header.inputDescription || ''}
                        onChange={(e) => updateHttpHeader(index, header.key, header.value, header.password || false, header.inputName, e.target.value)}
                        className={styles.inputDescField}
                      />
                    </div>
                  )}
                </div>
              ))}
              <button
                type="button"
                className={styles.addBtn}
                onClick={addHttpHeader}
              >
                <span>+</span> Add Header
              </button>
              <small className="field-hint">Headers marked as "Password" will prompt users during installation.</small>
            </div>
          )}

          {configType !== 'http' && (
            <div className="form-group">
              <div className={styles.sectionHeader}>
                <label>Custom Command Arguments</label>
              </div>
              <p className="section-description">Add additional arguments for your configuration (e.g., --token, -v):</p>
              {(dynamicArgs[configType] || []).map((arg, index) => (
                <div key={index} className={`${styles.dynamicItemRow} dynamic-item-row`}>
                  <input
                    type="text"
                    placeholder="--flag or -f"
                    value={arg.flag}
                    onChange={(e) => updateDynamicArg(index, e.target.value, arg.value)}
                    className={styles.flagInput}
                  />
                  <input
                    type="text"
                    placeholder="value (optional)"
                    value={arg.value}
                    onChange={(e) => updateDynamicArg(index, arg.flag, e.target.value)}
                    className={styles.valueInput}
                  />
                  <button
                    type="button"
                    className={styles.deleteBtn}
                    onClick={() => removeDynamicArg(index)}
                    aria-label="Remove argument"
                  >
                    ✕
                  </button>
                </div>
              ))}
              <button
                type="button"
                className={styles.addBtn}
                onClick={addDynamicArg}
              >
                <span>+</span> Add Argument
              </button>
            </div>
          )}

          {configType !== 'http' && (
            <div className="form-group">
              <div className={styles.sectionHeader}>
                <label>Environment Variables</label>
              </div>
              <p className="section-description">Add environment variables (mark as password for secure prompts):</p>
              {(dynamicEnv[configType] || []).map((env, index) => (
                <div key={index} className={styles.headerCard}>
                  <div className={styles.dynamicEnvRow}>
                    <input
                      type="text"
                      placeholder="VARIABLE_NAME"
                      value={env.key}
                      onChange={(e) => updateDynamicEnvVar(index, e.target.value, env.value, env.password || false, env.inputName, env.inputDescription)}
                      className={styles.keyInput}
                    />
                    <input
                      type={env.password ? 'password' : 'text'}
                      placeholder="value or leave empty if using password"
                      value={env.value}
                      onChange={(e) => updateDynamicEnvVar(index, env.key, e.target.value, env.password || false, env.inputName, env.inputDescription)}
                      className={styles.valueInput}
                      disabled={env.password}
                    />
                    <label className={`${styles.passwordToggle} password-toggle`}>
                      <input
                        type="checkbox"
                        checked={env.password}
                        onChange={(e) => updateDynamicEnvVar(index, env.key, env.value, e.target.checked, env.inputName, env.inputDescription)}
                      />
                      <span>Password</span>
                    </label>
                    <button
                      type="button"
                      className={styles.deleteBtn}
                      onClick={() => removeDynamicEnvVar(index)}
                      aria-label="Remove environment variable"
                    >
                      ✕
                    </button>
                  </div>
                  {env.password && (
                    <div className={styles.inputDetailsRow}>
                      <input
                        type="text"
                        placeholder="Input ID (optional, e.g., api_key)"
                        value={env.inputName || ''}
                        onChange={(e) => updateDynamicEnvVar(index, env.key, env.value, env.password || false, e.target.value, env.inputDescription)}
                        className={styles.inputNameField}
                      />
                      <input
                        type="text"
                        placeholder="Input Description (optional, e.g., API Key for service)"
                        value={env.inputDescription || ''}
                        onChange={(e) => updateDynamicEnvVar(index, env.key, env.value, env.password || false, env.inputName, e.target.value)}
                        className={styles.inputDescField}
                      />
                    </div>
                  )}
                </div>
              ))}
              <button
                type="button"
                className={styles.addBtn}
                onClick={addDynamicEnvVar}
              >
                <span>+</span> Add Environment Variable
              </button>
              <small className="field-hint">Variables marked as "Password" will prompt users during installation and won't be hardcoded in config.</small>
            </div>
          )}

          <div className="form-group">
            <div className={styles.sectionHeader}>
              <label>Additional Inputs</label>
            </div>
            <p className="section-description">Add standalone password prompts that can be referenced in your configuration with ${'{'}input:id{'}'}:</p>
            {standaloneInputs.map((input, index) => (
              <div key={index} className={styles.headerCard}>
                <div className={styles.dynamicEnvRow}>
                  <input
                    type="text"
                    placeholder="Input ID (e.g., api_token)"
                    value={input.id}
                    onChange={(e) => updateStandaloneInput(index, e.target.value, input.description, input.password || true)}
                    className={styles.inputNameField}
                    style={{ flex: '0 0 35%' }}
                  />
                  <input
                    type="text"
                    placeholder="Description (e.g., API Token for authentication)"
                    value={input.description}
                    onChange={(e) => updateStandaloneInput(index, input.id, e.target.value, input.password || true)}
                    className={styles.inputDescField}
                  />
                  <label className={`${styles.passwordToggle} password-toggle`}>
                    <input
                      type="checkbox"
                      checked={input.password !== false}
                      onChange={(e) => updateStandaloneInput(index, input.id, input.description, e.target.checked)}
                    />
                    <span>Password</span>
                  </label>
                  <button
                    type="button"
                    className={styles.deleteBtn}
                    onClick={() => removeStandaloneInput(index)}
                    aria-label="Remove input"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
            <button
              type="button"
              className={styles.addBtn}
              onClick={addStandaloneInput}
            >
              <span>+</span> Add Input
            </button>
            <small className="field-hint">These inputs will be included in the root inputs array and can be referenced anywhere in your config.</small>
          </div>

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
          
          <div className={styles.outputSectionSpacer}></div>
          
          {markdown ? (
            <>
              <div className={styles.tabs}>
                <button 
                  className={`${styles.tab} ${activeTab === 'badges' ? styles.active : ''}`}
                  onClick={() => setActiveTab('badges')}
                >
                  Badges & Config
                </button>
                <button 
                  className={`${styles.tab} ${activeTab === 'readme' ? styles.active : ''}`}
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
      
      {/* Import JSON Modal */}
      {showImportModal && (
        <div className={styles.modalOverlay} onClick={() => setShowImportModal(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>Import Configuration</h3>
              <button 
                className={styles.modalCloseBtn}
                onClick={() => setShowImportModal(false)}
                aria-label="Close"
              >
                ✕
              </button>
            </div>
            <div className={styles.modalBody}>
              <p>Paste your MCP JSON configuration below:</p>
              <textarea
                className={styles.jsonTextarea}
                value={importJsonText}
                onChange={(e) => setImportJsonText(e.target.value)}
                placeholder={`{\n  "servers": {\n    "my-server": {\n      "command": "npx",\n      "args": ["-y", "package-name"]\n    }\n  }\n}`}
                rows={12}
              />
            </div>
            <div className={styles.modalFooter}>
              <button
                type="button"
                className={styles.modalCancelBtn}
                onClick={() => {
                  setShowImportModal(false);
                  setImportJsonText('');
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                className={styles.modalImportBtn}
                onClick={handleImportFromText}
              >
                Import
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Search Registry Modal */}
      {showSearchModal && (
        <div className={styles.modalOverlay} onClick={() => setShowSearchModal(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>Search MCP Registry</h3>
              <button 
                className={styles.modalCloseBtn}
                onClick={() => setShowSearchModal(false)}
                aria-label="Close"
              >
                ✕
              </button>
            </div>
            <div className={styles.modalBody}>
              <p>Search for MCP servers from the official registry:</p>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  className={styles.searchInput}
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value)
                    setShowSearchDropdown(e.target.value.length >= 2)
                  }}
                  onFocus={() => {
                    if (searchQuery.length >= 2) {
                      setShowSearchDropdown(true)
                    }
                  }}
                  placeholder="Search by server name (e.g., filesystem, git, postgres)"
                  autoFocus
                />
                <MCPSearchDropdown
                  searchQuery={searchQuery}
                  onSelectServer={handleSelectMCPServer}
                  isVisible={showSearchDropdown}
                  onClose={() => setShowSearchDropdown(false)}
                />
              </div>
              <small className="field-hint">
                Searches the official MCP registry at registry.modelcontextprotocol.io
              </small>
            </div>
            <div className={styles.modalFooter}>
              <button
                type="button"
                className={styles.modalCancelBtn}
                onClick={() => {
                  setShowSearchModal(false)
                  setSearchQuery('')
                  setShowSearchDropdown(false)
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default MCP
