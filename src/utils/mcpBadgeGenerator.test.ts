import { describe, it, expect } from 'vitest';
import {
  encodeConfig,
  generateVSCodeBadge,
  generateVSCodeInsidersBadge,
  generateVisualStudioBadge,
  generateCursorBadge,
  generateVSCodeCLICommand,
  mergeConfigWithInputs,
  createFullMCPConfig,
  generateAllBadges,
  type MCPConfig,
  type MCPInput,
  type ConfigWithInputs
} from '../utils/mcpBadgeGenerator';

describe('mcpBadgeGenerator', () => {
  describe('encodeConfig', () => {
    it('should encode a simple HTTP config', () => {
      const config: MCPConfig = {
        type: 'http',
        url: 'https://example.com/mcp'
      };
      
      const encoded = encodeConfig(config);
      const decoded = JSON.parse(decodeURIComponent(encoded));
      
      expect(decoded).toEqual(config);
    });
    
    it('should encode a Docker config with environment variables', () => {
      const config: MCPConfig = {
        command: 'docker',
        args: ['run', '-i', '--rm', 'test-image'],
        env: {
          'API_KEY': '${input:api_key}'
        }
      };
      
      const encoded = encodeConfig(config);
      const decoded = JSON.parse(decodeURIComponent(encoded));
      
      expect(decoded).toEqual(config);
    });
    
    it('should encode a config with inputs array', () => {
      const config: ConfigWithInputs = {
        command: 'docker',
        args: ['run', '-i', '--rm', 'test-image'],
        env: {
          'API_KEY': '${input:api_key}'
        },
        inputs: [
          {
            type: 'promptString',
            id: 'api_key',
            description: 'Enter API Key',
            password: true
          }
        ]
      };
      
      const encoded = encodeConfig(config);
      const decoded = JSON.parse(decodeURIComponent(encoded));
      
      expect(decoded).toEqual(config);
      expect(decoded.inputs).toBeDefined();
      expect(decoded.inputs).toHaveLength(1);
      expect(decoded.inputs[0].id).toBe('api_key');
    });
  });
  
  describe('generateVSCodeBadge', () => {
    it('should generate a VS Code badge without inputs', () => {
      const config: MCPConfig = {
        command: 'npx',
        args: ['-y', 'test-package'],
        env: {}
      };
      
      const badge = generateVSCodeBadge('test-server', config);
      
      expect(badge).toContain('[![Install in VS Code]');
      expect(badge).toContain('https://vscode.dev/redirect/mcp/install');
      expect(badge).toContain('name=test-server');
      expect(badge).toContain('0098FF');
    });
    
    it('should generate a VS Code badge with inputs', () => {
      const config: ConfigWithInputs = {
        command: 'docker',
        args: ['run', '-i', '--rm', 'test-image'],
        env: {
          'API_KEY': '${input:api_key}'
        },
        inputs: [
          {
            type: 'promptString',
            id: 'api_key',
            description: 'Enter API Key',
            password: true
          }
        ]
      };
      
      const badge = generateVSCodeBadge('test-server', config);
      
      expect(badge).toContain('[![Install in VS Code]');
      expect(badge).toContain('https://vscode.dev/redirect/mcp/install');
      
      // Verify inputs are encoded in the URL
      const urlMatch = badge.match(/config=([^)]+)\)/);
      expect(urlMatch).toBeTruthy();
      
      if (urlMatch) {
        const encodedConfig = urlMatch[1];
        const decodedConfig = JSON.parse(decodeURIComponent(encodedConfig));
        expect(decodedConfig.inputs).toBeDefined();
        expect(decodedConfig.inputs).toHaveLength(1);
      }
    });
    
    it('should use custom badge text', () => {
      const config: MCPConfig = {
        command: 'npx',
        args: ['-y', 'test-package'],
        env: {}
      };
      
      const badge = generateVSCodeBadge('test-server', config, 'Get Started');
      
      expect(badge).toContain('Get_Started-VS_Code');
    });
  });
  
  describe('generateVSCodeInsidersBadge', () => {
    it('should generate a VS Code Insiders badge', () => {
      const config: MCPConfig = {
        command: 'npx',
        args: ['-y', 'test-package'],
        env: {}
      };
      
      const badge = generateVSCodeInsidersBadge('test-server', config);
      
      expect(badge).toContain('[![Install in VS Code Insiders]');
      expect(badge).toContain('https://insiders.vscode.dev/redirect/mcp/install');
      expect(badge).toContain('quality=insiders');
      expect(badge).toContain('24bfa5');
    });
    
    it('should include inputs in VS Code Insiders badge', () => {
      const config: ConfigWithInputs = {
        command: 'docker',
        args: ['run', '-i', '--rm', 'test-image'],
        env: {
          'TOKEN': '${input:token}'
        },
        inputs: [
          {
            type: 'promptString',
            id: 'token',
            description: 'Enter Token',
            password: true
          }
        ]
      };
      
      const badge = generateVSCodeInsidersBadge('test-server', config);
      
      const urlMatch = badge.match(/config=([^&]+)&/);
      expect(urlMatch).toBeTruthy();
      
      if (urlMatch) {
        const encodedConfig = urlMatch[1];
        const decodedConfig = JSON.parse(decodeURIComponent(encodedConfig));
        expect(decodedConfig.inputs).toBeDefined();
        expect(decodedConfig.inputs[0].id).toBe('token');
      }
    });
  });
  
  describe('generateVisualStudioBadge', () => {
    it('should generate a Visual Studio badge', () => {
      const config: MCPConfig = {
        command: 'npx',
        args: ['-y', 'test-package'],
        env: {}
      };
      
      const badge = generateVisualStudioBadge('test-server', config);
      
      expect(badge).toContain('[![Install in Visual Studio]');
      expect(badge).toContain('https://vs-open.link/mcp-install?');
      expect(badge).toContain('C16FDE');
    });
    
    it('should include inputs in Visual Studio badge', () => {
      const config: ConfigWithInputs = {
        command: 'uvx',
        args: ['test-package'],
        env: {
          'SECRET': '${input:secret}'
        },
        inputs: [
          {
            type: 'promptString',
            id: 'secret',
            description: 'Enter Secret',
            password: true
          }
        ]
      };
      
      const badge = generateVisualStudioBadge('test-server', config);
      
      const urlMatch = badge.match(/mcp-install\?([^)]+)\)/);
      expect(urlMatch).toBeTruthy();
      
      if (urlMatch) {
        const encodedConfig = urlMatch[1];
        const decodedConfig = JSON.parse(decodeURIComponent(encodedConfig));
        expect(decodedConfig.inputs).toBeDefined();
      }
    });
  });
  
  describe('generateCursorBadge', () => {
    it('should generate a Cursor badge with base64 encoding', () => {
      const config: ConfigWithInputs = {
        command: 'npx',
        args: ['-y', 'test-package'],
        env: {}
      };
      
      const badge = generateCursorBadge('test-server', config);
      
      expect(badge).toContain('[![Install in Cursor]');
      expect(badge).toContain('https://cursor.com/en/install-mcp');
      expect(badge).toContain('000000');
    });
    
    it('should include inputs in Cursor badge with base64 encoding', () => {
      const config: ConfigWithInputs = {
        command: 'docker',
        args: ['run', '-i', '--rm', 'test-image'],
        env: {
          'KEY': '${input:key}'
        },
        inputs: [
          {
            type: 'promptString',
            id: 'key',
            description: 'Enter Key',
            password: true
          }
        ]
      };
      
      const badge = generateCursorBadge('test-server', config);
      
      const urlMatch = badge.match(/config=([^)]+)\)/);
      expect(urlMatch).toBeTruthy();
      
      if (urlMatch) {
        const base64Config = urlMatch[1];
        const decodedConfig = JSON.parse(atob(base64Config));
        expect(decodedConfig.inputs).toBeDefined();
        expect(decodedConfig.inputs).toHaveLength(1);
      }
    });
  });
  
  describe('generateVSCodeCLICommand', () => {
    it('should generate a VS Code CLI command without inputs', () => {
      const config: ConfigWithInputs = {
        command: 'npx',
        args: ['-y', 'test-package'],
        env: {}
      };
      
      const command = generateVSCodeCLICommand('test-server', config);
      
      expect(command).toContain('code --add-mcp');
      expect(command).toContain('test-server');
      expect(command).toContain('npx');
    });
    
    it('should generate a VS Code Insiders CLI command', () => {
      const config: ConfigWithInputs = {
        command: 'npx',
        args: ['-y', 'test-package'],
        env: {}
      };
      
      const command = generateVSCodeCLICommand('test-server', config, true);
      
      expect(command).toContain('code-insiders --add-mcp');
    });
    
    it('should include inputs in CLI command', () => {
      const config: ConfigWithInputs = {
        command: 'docker',
        args: ['run', '-i', '--rm', 'test-image'],
        env: {
          'API_KEY': '${input:api_key}'
        },
        inputs: [
          {
            type: 'promptString',
            id: 'api_key',
            description: 'Enter API Key',
            password: true
          }
        ]
      };
      
      const command = generateVSCodeCLICommand('test-server', config);
      
      expect(command).toContain('code --add-mcp');
      expect(command).toContain('${input:api_key}');
      expect(command).toContain('inputs');
      
      // Verify JSON structure
      const jsonMatch = command.match(/'({.+})'/);
      expect(jsonMatch).toBeTruthy();
      
      if (jsonMatch) {
        const unescapedJson = jsonMatch[1].replace(/\\"/g, '"');
        const parsedConfig = JSON.parse(unescapedJson);
        expect(parsedConfig.name).toBe('test-server');
        expect(parsedConfig.inputs).toBeDefined();
        expect(parsedConfig.inputs).toHaveLength(1);
      }
    });
    
    it('should properly escape quotes in JSON', () => {
      const config: ConfigWithInputs = {
        command: 'npx',
        args: ['-y', 'test-package'],
        env: {}
      };
      
      const command = generateVSCodeCLICommand('test-server', config);
      
      expect(command).toContain('\\"command\\"');
      expect(command).toContain('\\"npx\\"');
    });
  });
  
  describe('mergeConfigWithInputs', () => {
    it('should merge config with inputs when inputs exist', () => {
      const config: MCPConfig = {
        command: 'npx',
        args: ['-y', 'test-package'],
        env: {}
      };
      
      const inputs: MCPInput[] = [
        {
          type: 'promptString',
          id: 'test',
          description: 'Test Input',
          password: false
        }
      ];
      
      const merged = mergeConfigWithInputs(config, inputs);
      
      expect(merged.inputs).toBeDefined();
      expect(merged.inputs).toHaveLength(1);
      expect(merged.command).toBe('npx');
    });
    
    it('should return config without inputs when inputs array is empty', () => {
      const config: MCPConfig = {
        command: 'npx',
        args: ['-y', 'test-package'],
        env: {}
      };
      
      const merged = mergeConfigWithInputs(config, []);
      
      expect(merged.inputs).toBeUndefined();
    });
    
    it('should return config without inputs when inputs is undefined', () => {
      const config: MCPConfig = {
        command: 'npx',
        args: ['-y', 'test-package'],
        env: {}
      };
      
      const merged = mergeConfigWithInputs(config);
      
      expect(merged.inputs).toBeUndefined();
    });
  });
  
  describe('createFullMCPConfig', () => {
    it('should create full config with inputs', () => {
      const config: MCPConfig = {
        command: 'docker',
        args: ['run', '-i', '--rm', 'test-image'],
        env: {
          'API_KEY': '${input:api_key}'
        }
      };
      
      const inputs: MCPInput[] = [
        {
          type: 'promptString',
          id: 'api_key',
          description: 'Enter API Key',
          password: true
        }
      ];
      
      const fullConfig = createFullMCPConfig('test-server', config, inputs);
      
      expect(fullConfig.servers).toBeDefined();
      expect(fullConfig.servers['test-server']).toBeDefined();
      expect(fullConfig.servers['test-server'].command).toBe('docker');
      expect(fullConfig.inputs).toBeDefined();
      expect(fullConfig.inputs).toHaveLength(1);
    });
    
    it('should create full config without inputs when not provided', () => {
      const config: MCPConfig = {
        command: 'npx',
        args: ['-y', 'test-package'],
        env: {}
      };
      
      const fullConfig = createFullMCPConfig('test-server', config);
      
      expect(fullConfig.servers).toBeDefined();
      expect(fullConfig.servers['test-server']).toBeDefined();
      expect(fullConfig.inputs).toBeUndefined();
    });
  });
  
  describe('generateAllBadges', () => {
    it('should generate all default badges', () => {
      const config: ConfigWithInputs = {
        command: 'npx',
        args: ['-y', 'test-package'],
        env: {}
      };
      
      const badges = generateAllBadges('test-server', config);
      
      expect(badges).toContain('VS Code');
      expect(badges).toContain('VS Code Insiders');
      expect(badges).toContain('Visual Studio');
      expect(badges.split('\n')).toHaveLength(3);
    });
    
    it('should generate only selected badges', () => {
      const config: ConfigWithInputs = {
        command: 'npx',
        args: ['-y', 'test-package'],
        env: {}
      };
      
      const badges = generateAllBadges('test-server', config, {
        includeVSCode: true,
        includeVSCodeInsiders: false,
        includeVisualStudio: false,
        includeCursor: false
      });
      
      expect(badges).toContain('VS Code');
      expect(badges).not.toContain('VS Code Insiders');
      expect(badges).not.toContain('Visual Studio');
      expect(badges.split('\n')).toHaveLength(1);
    });
    
    it('should include Cursor badge when enabled', () => {
      const config: ConfigWithInputs = {
        command: 'npx',
        args: ['-y', 'test-package'],
        env: {}
      };
      
      const badges = generateAllBadges('test-server', config, {
        includeCursor: true
      });
      
      expect(badges).toContain('Cursor');
      expect(badges.split('\n')).toHaveLength(4);
    });
    
    it('should use custom badge text', () => {
      const config: ConfigWithInputs = {
        command: 'npx',
        args: ['-y', 'test-package'],
        env: {}
      };
      
      const badges = generateAllBadges('test-server', config, {
        badgeText: 'Download'
      });
      
      expect(badges).toContain('Download-VS_Code');
      expect(badges).toContain('Download-VS_Code_Insiders');
      expect(badges).toContain('Download-Visual_Studio');
    });
    
    it('should preserve inputs in all badges', () => {
      const config: ConfigWithInputs = {
        command: 'docker',
        args: ['run', '-i', '--rm', 'test-image'],
        env: {
          'API_KEY': '${input:api_key}',
          'SECRET': '${input:secret}'
        },
        inputs: [
          {
            type: 'promptString',
            id: 'api_key',
            description: 'Enter API Key',
            password: true
          },
          {
            type: 'promptString',
            id: 'secret',
            description: 'Enter Secret',
            password: true
          }
        ]
      };
      
      const badges = generateAllBadges('test-server', config);
      
      // Check VS Code badge
      const vscodeMatch = badges.match(/vscode\.dev[^)]+/);
      expect(vscodeMatch).toBeTruthy();
      if (vscodeMatch) {
        const configMatch = vscodeMatch[0].match(/config=([^&]+)/);
        if (configMatch) {
          const decoded = JSON.parse(decodeURIComponent(configMatch[1]));
          expect(decoded.inputs).toBeDefined();
          expect(decoded.inputs).toHaveLength(2);
        }
      }
    });
  });
  
  describe('Common MCP Server Scenarios', () => {
    it('should handle HTTP server with headers', () => {
      const config: ConfigWithInputs = {
        type: 'http',
        url: 'https://api.example.com/mcp',
        headers: {
          'Authorization': 'Bearer ${input:token}'
        },
        inputs: [
          {
            type: 'promptString',
            id: 'token',
            description: 'Enter API Token',
            password: true
          }
        ]
      };
      
      const badges = generateAllBadges('api-server', config);
      
      expect(badges).toContain('api-server');
      expect(badges).toContain('https://vscode.dev/redirect/mcp/install');
      
      // Verify inputs are preserved
      const urlMatch = badges.match(/config=([^)&]+)/);
      expect(urlMatch).toBeTruthy();
      if (urlMatch) {
        const decoded = JSON.parse(decodeURIComponent(urlMatch[1]));
        expect(decoded.inputs).toBeDefined();
        expect(decoded.headers.Authorization).toContain('${input:token}');
      }
    });
    
    it('should handle Docker container with multiple environment variables', () => {
      const config: ConfigWithInputs = {
        command: 'docker',
        args: ['run', '-i', '--rm', 'fboucher/check-in-doc-mcp'],
        env: {
          'ALLOWED_DOMAINS': '${input:allowed_domains}',
          'APIKEY': '${input:apikey}'
        },
        inputs: [
          {
            type: 'promptString',
            id: 'allowed_domains',
            description: 'Enter the comma-separated list of documentation domains',
            password: false
          },
          {
            type: 'promptString',
            id: 'apikey',
            description: 'Enter your API key',
            password: true
          }
        ]
      };
      
      const cliCommand = generateVSCodeCLICommand('check-in-docs', config);
      
      expect(cliCommand).toContain('check-in-docs');
      expect(cliCommand).toContain('fboucher/check-in-doc-mcp');
      expect(cliCommand).toContain('${input:allowed_domains}');
      expect(cliCommand).toContain('${input:apikey}');
      
      // Verify JSON structure
      const jsonMatch = cliCommand.match(/'({.+})'/);
      if (jsonMatch) {
        const unescapedJson = jsonMatch[1].replace(/\\"/g, '"');
        const parsed = JSON.parse(unescapedJson);
        expect(parsed.inputs).toHaveLength(2);
        expect(parsed.env.ALLOWED_DOMAINS).toBe('${input:allowed_domains}');
        expect(parsed.env.APIKEY).toBe('${input:apikey}');
      }
    });
    
    it('should handle NPX package without inputs', () => {
      const config: ConfigWithInputs = {
        command: 'npx',
        args: ['-y', '@modelcontextprotocol/server-filesystem'],
        env: {}
      };
      
      const badges = generateAllBadges('filesystem-server', config);
      
      expect(badges).toContain('filesystem-server');
      
      // Verify no inputs are added
      const urlMatch = badges.match(/config=([^)&]+)/);
      if (urlMatch) {
        const decoded = JSON.parse(decodeURIComponent(urlMatch[1]));
        expect(decoded.inputs).toBeUndefined();
      }
    });
    
    it('should handle UVX Python package', () => {
      const config: ConfigWithInputs = {
        command: 'uvx',
        args: ['--from', 'mcp-server-git', 'mcp-server-git'],
        env: {}
      };
      
      const badge = generateVSCodeBadge('git-server', config);
      
      expect(badge).toContain('git-server');
      expect(badge).toContain('uvx');
    });
  });
});
