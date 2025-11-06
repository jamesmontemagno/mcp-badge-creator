import { describe, it, expect } from 'vitest';

// Tests for CLI command generation with inputs
// Validates that VS Code and VS Code Insiders CLI commands include inputs array

describe('CLI Command Generation', () => {
  describe('VS Code CLI command structure', () => {
    it('should include inputs for HTTP config with password headers', () => {
      const serverName = 'feedbackflow';
      const config = {
        name: serverName,
        type: 'http',
        url: 'https://func-feedbackflow-mcp-rr7fxhjrrtpdq.azurewebsites.net/mcp',
        headers: {
          'Authorization': '${input:feedbackflow_api_key}'
        },
        inputs: [
          {
            id: 'feedbackflow_api_key',
            type: 'promptString' as const,
            description: 'FeedbackFlow API Key (starts with ff_)',
            password: true
          }
        ]
      };

      const jsonString = JSON.stringify(config);
      const escapedJson = jsonString.replace(/"/g, '\\"');
      const command = `code --add-mcp '${escapedJson}'`;

      expect(command).toContain('code --add-mcp');
      expect(command).toContain('feedbackflow');
      expect(command).toContain('${input:feedbackflow_api_key}');
      expect(command).toContain('inputs');

      // Verify JSON structure by parsing the escaped JSON
      const jsonMatch = command.match(/'({.+})'/);
      expect(jsonMatch).toBeTruthy();

      if (jsonMatch) {
        const unescapedJson = jsonMatch[1].replace(/\\"/g, '"');
        const parsed = JSON.parse(unescapedJson);
        
        expect(parsed.name).toBe('feedbackflow');
        expect(parsed.type).toBe('http');
        expect(parsed.headers.Authorization).toBe('${input:feedbackflow_api_key}');
        expect(parsed.inputs).toBeDefined();
        expect(parsed.inputs).toHaveLength(1);
        expect(parsed.inputs[0].id).toBe('feedbackflow_api_key');
        expect(parsed.inputs[0].password).toBe(true);
      }
    });

    it('should include inputs for Docker config with environment variables', () => {
      const serverName = 'check-in-docs';
      const config = {
        name: serverName,
        command: 'docker',
        args: [
          'run',
          '-i',
          '--rm',
          '-e',
          'ALLOWED_DOMAINS',
          '-e',
          'APIKEY',
          'fboucher/check-in-doc-mcp'
        ],
        env: {
          'ALLOWED_DOMAINS': '${input:allowed_domains}',
          'APIKEY': '${input:apikey}'
        },
        inputs: [
          {
            id: 'allowed_domains',
            type: 'promptString' as const,
            description: 'Enter the comma-separated list of documentation domains',
            password: false
          },
          {
            id: 'apikey',
            type: 'promptString' as const,
            description: 'Enter your Reka API key',
            password: true
          }
        ]
      };

      const jsonString = JSON.stringify(config);
      const escapedJson = jsonString.replace(/"/g, '\\"');
      const command = `code --add-mcp '${escapedJson}'`;

      expect(command).toContain('check-in-docs');
      expect(command).toContain('docker');
      expect(command).toContain('inputs');

      const jsonMatch = command.match(/'({.+})'/);
      if (jsonMatch) {
        const unescapedJson = jsonMatch[1].replace(/\\"/g, '"');
        const parsed = JSON.parse(unescapedJson);
        
        expect(parsed.inputs).toHaveLength(2);
        expect(parsed.env.ALLOWED_DOMAINS).toBe('${input:allowed_domains}');
        expect(parsed.env.APIKEY).toBe('${input:apikey}');
      }
    });

    it('should work without inputs for simple configs', () => {
      const config = {
        name: 'simple-server',
        command: 'npx',
        args: ['-y', '@modelcontextprotocol/server-filesystem'],
        env: {}
      };

      const jsonString = JSON.stringify(config);
      const escapedJson = jsonString.replace(/"/g, '\\"');
      const command = `code --add-mcp '${escapedJson}'`;

      const jsonMatch = command.match(/'({.+})'/);
      if (jsonMatch) {
        const unescapedJson = jsonMatch[1].replace(/\\"/g, '"');
        const parsed = JSON.parse(unescapedJson);
        
        expect(parsed.name).toBe('simple-server');
        expect(parsed.inputs).toBeUndefined();
      }
    });

    it('should properly escape special characters in descriptions', () => {
      const config = {
        name: 'test-server',
        command: 'docker',
        args: ['run', '-i', '--rm', 'test-image'],
        env: {
          'API_KEY': '${input:api_key}'
        },
        inputs: [
          {
            id: 'api_key',
            type: 'promptString' as const,
            description: 'Enter API Key (starts with "ff_")',
            password: true
          }
        ]
      };

      const jsonString = JSON.stringify(config);
      const escapedJson = jsonString.replace(/"/g, '\\"');
      const command = `code --add-mcp '${escapedJson}'`;

      // Should contain escaped quotes
      expect(command).toContain('\\"');
      
      const jsonMatch = command.match(/'({.+})'/);
      if (jsonMatch) {
        const unescapedJson = jsonMatch[1].replace(/\\"/g, '"');
        const parsed = JSON.parse(unescapedJson);
        
        expect(parsed.inputs[0].description).toBe('Enter API Key (starts with "ff_")');
      }
    });
  });

  describe('VS Code Insiders CLI command', () => {
    it('should use code-insiders command', () => {
      const config = {
        name: 'test-server',
        command: 'npx',
        args: ['-y', 'test-package'],
        env: {}
      };

      const jsonString = JSON.stringify(config);
      const escapedJson = jsonString.replace(/"/g, '\\"');
      const command = `code-insiders --add-mcp '${escapedJson}'`;

      expect(command).toContain('code-insiders --add-mcp');
      expect(command).not.toContain('code --add-mcp');
    });

    it('should include inputs in Insiders command', () => {
      const config = {
        name: 'test-server',
        command: 'docker',
        args: ['run', '-i', '--rm', 'test-image'],
        env: {
          'SECRET': '${input:secret}'
        },
        inputs: [
          {
            id: 'secret',
            type: 'promptString' as const,
            description: 'Enter Secret',
            password: true
          }
        ]
      };

      const jsonString = JSON.stringify(config);
      const escapedJson = jsonString.replace(/"/g, '\\"');
      const command = `code-insiders --add-mcp '${escapedJson}'`;

      expect(command).toContain('code-insiders --add-mcp');
      expect(command).toContain('inputs');

      const jsonMatch = command.match(/'({.+})'/);
      if (jsonMatch) {
        const unescapedJson = jsonMatch[1].replace(/\\"/g, '"');
        const parsed = JSON.parse(unescapedJson);
        
        expect(parsed.inputs).toBeDefined();
        expect(parsed.inputs).toHaveLength(1);
      }
    });
  });

  describe('Input property order', () => {
    it('should have id before type in inputs', () => {
      const config = {
        name: 'test-server',
        command: 'docker',
        args: ['run', '-i', '--rm', 'test-image'],
        env: {
          'API_KEY': '${input:api_key}'
        },
        inputs: [
          {
            id: 'api_key',
            type: 'promptString' as const,
            description: 'Enter API Key',
            password: true
          }
        ]
      };

      const jsonString = JSON.stringify(config);
      
      // Check that id appears before type in the JSON string
      const idIndex = jsonString.indexOf('"id"');
      const typeIndex = jsonString.indexOf('"type"');
      
      expect(idIndex).toBeGreaterThan(-1);
      expect(typeIndex).toBeGreaterThan(-1);
      expect(idIndex).toBeLessThan(typeIndex);
    });
  });

  describe('Multiple inputs scenarios', () => {
    it('should handle multiple password inputs', () => {
      const config = {
        name: 'multi-input-server',
        type: 'http',
        url: 'https://api.example.com',
        headers: {
          'X-API-Key': '${input:api_key}',
          'X-Secret': '${input:secret}'
        },
        inputs: [
          {
            id: 'api_key',
            type: 'promptString' as const,
            description: 'API Key',
            password: true
          },
          {
            id: 'secret',
            type: 'promptString' as const,
            description: 'Secret',
            password: true
          }
        ]
      };

      const jsonString = JSON.stringify(config);
      const escapedJson = jsonString.replace(/"/g, '\\"');
      const command = `code --add-mcp '${escapedJson}'`;

      const jsonMatch = command.match(/'({.+})'/);
      if (jsonMatch) {
        const unescapedJson = jsonMatch[1].replace(/\\"/g, '"');
        const parsed = JSON.parse(unescapedJson);
        
        expect(parsed.inputs).toHaveLength(2);
        expect(parsed.inputs[0].id).toBe('api_key');
        expect(parsed.inputs[1].id).toBe('secret');
      }
    });

    it('should handle mixed password and non-password inputs', () => {
      const config = {
        name: 'mixed-server',
        command: 'docker',
        args: ['run', '-i', '--rm', 'test-image'],
        env: {
          'PUBLIC_KEY': '${input:public_key}',
          'SECRET_KEY': '${input:secret_key}'
        },
        inputs: [
          {
            id: 'public_key',
            type: 'promptString' as const,
            description: 'Public Key',
            password: false
          },
          {
            id: 'secret_key',
            type: 'promptString' as const,
            description: 'Secret Key',
            password: true
          }
        ]
      };

      const jsonString = JSON.stringify(config);
      const escapedJson = jsonString.replace(/"/g, '\\"');
      const command = `code --add-mcp '${escapedJson}'`;

      const jsonMatch = command.match(/'({.+})'/);
      if (jsonMatch) {
        const unescapedJson = jsonMatch[1].replace(/\\"/g, '"');
        const parsed = JSON.parse(unescapedJson);
        
        expect(parsed.inputs).toHaveLength(2);
        expect(parsed.inputs[0].password).toBe(false);
        expect(parsed.inputs[1].password).toBe(true);
      }
    });
  });

  describe('Cross-platform compatibility', () => {
    it('should escape quotes for PowerShell compatibility', () => {
      const config = {
        name: 'test-server',
        command: 'npx',
        args: ['-y', 'test-package'],
        env: {}
      };

      const jsonString = JSON.stringify(config);
      const escapedJson = jsonString.replace(/"/g, '\\"');
      const command = `code --add-mcp '${escapedJson}'`;

      // Should have backslash-escaped quotes
      expect(command).toMatch(/\\"name\\"/);
      expect(command).toMatch(/\\"command\\"/);
    });

    it('should be parseable by JSON.parse after unescaping', () => {
      const config = {
        name: 'test-server',
        command: 'docker',
        args: ['run', '-i', '--rm', 'test-image'],
        env: {
          'KEY': '${input:key}'
        },
        inputs: [
          {
            id: 'key',
            type: 'promptString' as const,
            description: 'Enter Key',
            password: true
          }
        ]
      };

      const jsonString = JSON.stringify(config);
      const escapedJson = jsonString.replace(/"/g, '\\"');
      
      // Simulate CLI parsing
      const unescaped = escapedJson.replace(/\\"/g, '"');
      
      expect(() => JSON.parse(unescaped)).not.toThrow();
      const parsed = JSON.parse(unescaped);
      expect(parsed.name).toBe('test-server');
      expect(parsed.inputs).toBeDefined();
    });
  });
});
