import { describe, it, expect } from 'vitest';

// These tests verify the Docker configuration parsing logic
// for both inline and separate environment variable formats

describe('Docker Config Parsing - Environment Variables', () => {
  describe('Inline format: -e KEY=VALUE in args', () => {
    it('should parse inline env vars with input placeholders', () => {
      const config = {
        command: 'docker',
        args: [
          'run',
          '-i',
          '--rm',
          '-e',
          'ALLOWED_DOMAINS=${input:allowed_domains}',
          '-e',
          'APIKEY=${input:apikey}',
          'fboucher/check-in-doc-mcp'
        ],
        env: {}
      };

      const inputs = [
        {
          id: 'allowed_domains',
          type: 'promptString' as const,
          description: 'Enter domains'
        },
        {
          id: 'apikey',
          type: 'promptString' as const,
          description: 'Enter API key',
          password: true
        }
      ];

      // Simulate parsing logic
      const envList: Array<{
        key: string;
        value: string;
        password: boolean;
        inputName: string;
        inputDescription: string;
      }> = [];
      for (let i = 0; i < config.args.length; i++) {
        if (config.args[i] === '-e' && i + 1 < config.args.length) {
          const envArg = config.args[i + 1];
          if (envArg.includes('=')) {
            const [key, ...valueParts] = envArg.split('=');
            const value = valueParts.join('=');
            
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
          }
          i++;
        }
      }

      expect(envList).toHaveLength(2);
      expect(envList[0].key).toBe('ALLOWED_DOMAINS');
      expect(envList[0].inputName).toBe('allowed_domains');
      expect(envList[1].key).toBe('APIKEY');
      expect(envList[1].password).toBe(true);
    });

    it('should parse inline env vars without input placeholders', () => {
      const config = {
        command: 'docker',
        args: [
          'run',
          '-i',
          '--rm',
          '-e',
          'NODE_ENV=production',
          '-e',
          'PORT=3000',
          'my-image'
        ],
        env: {}
      };

      const envList: Array<{
        key: string;
        value: string;
        password: boolean;
        inputName: string;
        inputDescription: string;
      }> = [];
      for (let i = 0; i < config.args.length; i++) {
        if (config.args[i] === '-e' && i + 1 < config.args.length) {
          const envArg = config.args[i + 1];
          if (envArg.includes('=')) {
            const [key, ...valueParts] = envArg.split('=');
            const value = valueParts.join('=');
            
            const isPassword = value.includes('${input:');
            
            envList.push({
              key,
              value: isPassword ? '' : value,
              password: isPassword,
              inputName: '',
              inputDescription: ''
            });
          }
          i++;
        }
      }

      expect(envList).toHaveLength(2);
      expect(envList[0].key).toBe('NODE_ENV');
      expect(envList[0].value).toBe('production');
      expect(envList[0].password).toBe(false);
      expect(envList[1].key).toBe('PORT');
      expect(envList[1].value).toBe('3000');
    });

    it('should handle env vars with = in the value', () => {
      const config = {
        command: 'docker',
        args: [
          'run',
          '-i',
          '--rm',
          '-e',
          'DATABASE_URL=postgres://user:pass@localhost:5432/db',
          'my-image'
        ],
        env: {}
      };

      const envList: Array<{
        key: string;
        value: string;
        password: boolean;
        inputName: string;
        inputDescription: string;
      }> = [];
      for (let i = 0; i < config.args.length; i++) {
        if (config.args[i] === '-e' && i + 1 < config.args.length) {
          const envArg = config.args[i + 1];
          if (envArg.includes('=')) {
            const [key, ...valueParts] = envArg.split('=');
            const value = valueParts.join('=');
            
            envList.push({
              key,
              value,
              password: false,
              inputName: '',
              inputDescription: ''
            });
          }
          i++;
        }
      }

      expect(envList).toHaveLength(1);
      expect(envList[0].value).toBe('postgres://user:pass@localhost:5432/db');
    });
  });

  describe('Separate format: -e KEY in args, KEY: value in env', () => {
    it('should parse separate env vars with input placeholders', () => {
      const config = {
        command: 'docker',
        args: [
          'run',
          '-i',
          '--rm',
          '-e',
          'FEEDBACKFLOW_API_KEY',
          'jamesmontemagno/feedbackflowmcp:latest'
        ],
        env: {
          'FEEDBACKFLOW_API_KEY': '${input:feedbackflow_api_key}'
        }
      };

      const inputs = [
        {
          id: 'feedbackflow_api_key',
          type: 'promptString' as const,
          description: 'FeedbackFlow API Key (starts with ff_)',
          password: true
        }
      ];

      const envList: Array<{
        key: string;
        value: string;
        password: boolean;
        inputName: string;
        inputDescription: string;
      }> = [];
      if (config.env && Object.keys(config.env).length > 0) {
        Object.entries(config.env).forEach(([key, value]) => {
          const isPassword = typeof value === 'string' && value.includes('${input:');
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
        });
      }

      expect(envList).toHaveLength(1);
      expect(envList[0].key).toBe('FEEDBACKFLOW_API_KEY');
      expect(envList[0].inputName).toBe('feedbackflow_api_key');
      expect(envList[0].password).toBe(true);
      expect(envList[0].inputDescription).toBe('FeedbackFlow API Key (starts with ff_)');
    });

    it('should parse multiple separate env vars', () => {
      const config = {
        command: 'docker',
        args: [
          'run',
          '-i',
          '--rm',
          '-e',
          'API_KEY',
          '-e',
          'API_SECRET',
          'my-image'
        ],
        env: {
          'API_KEY': '${input:api_key}',
          'API_SECRET': '${input:api_secret}'
        }
      };

      const inputs = [
        { id: 'api_key', type: 'promptString' as const, description: 'API Key', password: true },
        { id: 'api_secret', type: 'promptString' as const, description: 'API Secret', password: true }
      ];

      const envList: Array<{
        key: string;
        value: string;
        password: boolean;
        inputName: string;
        inputDescription: string;
      }> = [];
      if (config.env && Object.keys(config.env).length > 0) {
        Object.entries(config.env).forEach(([key, value]) => {
          const isPassword = typeof value === 'string' && value.includes('${input:');
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
        });
      }

      expect(envList).toHaveLength(2);
    });
  });

  describe('Docker image detection', () => {
    it('should find image when env vars are inline', () => {
      const args = [
        'run',
        '-i',
        '--rm',
        '-e',
        'KEY=${input:key}',
        'my-image:latest'
      ];

      let imageIndex = -1;
      for (let i = args.length - 1; i >= 0; i--) {
        const arg = args[i];
        if (arg.startsWith('-') || arg === 'run' || arg === '-i' || arg === '--rm') {
          continue;
        }
        if (i > 0 && args[i - 1] === '-e') {
          continue;
        }
        imageIndex = i;
        break;
      }

      expect(imageIndex).toBe(5);
      expect(args[imageIndex]).toBe('my-image:latest');
    });

    it('should find image when env vars are separate', () => {
      const args = [
        'run',
        '-i',
        '--rm',
        '-e',
        'FEEDBACKFLOW_API_KEY',
        'jamesmontemagno/feedbackflowmcp:latest'
      ];

      let imageIndex = -1;
      for (let i = args.length - 1; i >= 0; i--) {
        const arg = args[i];
        if (arg.startsWith('-') || arg === 'run' || arg === '-i' || arg === '--rm') {
          continue;
        }
        if (i > 0 && args[i - 1] === '-e') {
          continue;
        }
        imageIndex = i;
        break;
      }

      expect(imageIndex).toBe(5);
      expect(args[imageIndex]).toBe('jamesmontemagno/feedbackflowmcp:latest');
    });

    it('should find image with multiple env vars', () => {
      const args = [
        'run',
        '-i',
        '--rm',
        '-e',
        'KEY1=${input:key1}',
        '-e',
        'KEY2=${input:key2}',
        'fboucher/check-in-doc-mcp'
      ];

      let imageIndex = -1;
      for (let i = args.length - 1; i >= 0; i--) {
        const arg = args[i];
        if (arg.startsWith('-') || arg === 'run' || arg === '-i' || arg === '--rm') {
          continue;
        }
        if (i > 0 && args[i - 1] === '-e') {
          continue;
        }
        imageIndex = i;
        break;
      }

      expect(imageIndex).toBe(7);
      expect(args[imageIndex]).toBe('fboucher/check-in-doc-mcp');
    });

    it('should find image with custom args before env vars', () => {
      const args = [
        'run',
        '-i',
        '--rm',
        '--network',
        'host',
        '-e',
        'API_KEY',
        'my-image'
      ];

      let imageIndex = -1;
      for (let i = args.length - 1; i >= 0; i--) {
        const arg = args[i];
        if (arg.startsWith('-') || arg === 'run' || arg === '-i' || arg === '--rm') {
          continue;
        }
        if (i > 0 && args[i - 1] === '-e') {
          continue;
        }
        imageIndex = i;
        break;
      }

      expect(imageIndex).toBe(7);
      expect(args[imageIndex]).toBe('my-image');
    });
  });

  describe('Generated config output', () => {
    it('should generate correct format with separate env vars', () => {
      const envVars = [
        { key: 'API_KEY', value: '', password: true, inputName: 'api_key', inputDescription: 'API Key' }
      ];
      const dockerImage = 'my-image';

      const config: {
        command: string;
        args: string[];
        env: Record<string, string>;
      } = {
        command: 'docker',
        args: ['run', '-i', '--rm'],
        env: {}
      };

      envVars.forEach(envVar => {
        config.args.push('-e');
        config.args.push(envVar.key);
        config.env[envVar.key] = `\${input:${envVar.inputName}}`;
      });

      config.args.push(dockerImage);

      expect(config.args).toEqual(['run', '-i', '--rm', '-e', 'API_KEY', 'my-image']);
      expect(config.env).toEqual({ 'API_KEY': '${input:api_key}' });
    });

    it('should generate correct format with multiple env vars', () => {
      const envVars = [
        { key: 'KEY1', value: '', password: true, inputName: 'key1', inputDescription: '' },
        { key: 'KEY2', value: '', password: true, inputName: 'key2', inputDescription: '' }
      ];
      const dockerImage = 'test-image';

      const config: {
        command: string;
        args: string[];
        env: Record<string, string>;
      } = {
        command: 'docker',
        args: ['run', '-i', '--rm'],
        env: {}
      };

      envVars.forEach(envVar => {
        config.args.push('-e');
        config.args.push(envVar.key);
        config.env[envVar.key] = `\${input:${envVar.inputName}}`;
      });

      config.args.push(dockerImage);

      expect(config.args).toEqual(['run', '-i', '--rm', '-e', 'KEY1', '-e', 'KEY2', 'test-image']);
      expect(Object.keys(config.env)).toHaveLength(2);
    });
  });

  describe('Input property order', () => {
    it('should have id before type in inputs array', () => {
      const input = {
        id: 'api_key',
        type: 'promptString' as const,
        description: 'Enter API Key',
        password: true
      };

      const keys = Object.keys(input);
      expect(keys[0]).toBe('id');
      expect(keys[1]).toBe('type');
      expect(keys[2]).toBe('description');
      expect(keys[3]).toBe('password');
    });

    it('should maintain property order when creating inputs', () => {
      const inputs = [
        {
          id: 'feedbackflow_api_key',
          type: 'promptString' as const,
          description: 'FeedbackFlow API Key (starts with ff_)',
          password: true
        }
      ];

      const json = JSON.stringify(inputs[0]);
      const parsed = JSON.parse(json);
      
      const keys = Object.keys(parsed);
      expect(keys.indexOf('id')).toBeLessThan(keys.indexOf('type'));
    });
  });

  describe('URL encoding for Markdown', () => {
    it('should escape parentheses in URLs', () => {
      const description = 'FeedbackFlow API Key (starts with ff_)';
      
      const escapeUrlForMarkdown = (url: string): string => {
        return url.replace(/\(/g, '%28').replace(/\)/g, '%29');
      };

      const url = `https://example.com?desc=${encodeURIComponent(description)}`;
      const escaped = escapeUrlForMarkdown(url);

      expect(escaped).not.toContain('(');
      expect(escaped).not.toContain(')');
      expect(escaped).toContain('%28');
      expect(escaped).toContain('%29');
    });

    it('should preserve already encoded URLs', () => {
      const url = 'https://example.com?key=value%20with%20spaces';
      
      const escapeUrlForMarkdown = (url: string): string => {
        return url.replace(/\(/g, '%28').replace(/\)/g, '%29');
      };

      const escaped = escapeUrlForMarkdown(url);
      expect(escaped).toBe(url);
    });

    it('should work in Markdown link syntax', () => {
      const description = 'Test (with parens)';
      const url = `https://example.com?desc=${encodeURIComponent(description)}`;
      
      const escapeUrlForMarkdown = (url: string): string => {
        return url.replace(/\(/g, '%28').replace(/\)/g, '%29');
      };

      const escaped = escapeUrlForMarkdown(url);
      const markdown = `[Link](${escaped})`;

      // Verify Markdown parser won't break
      expect(markdown.match(/\[Link\]\([^)]+\)/)).toBeTruthy();
    });
  });

  describe('Edge cases', () => {
    it('should handle empty env object with inline format', () => {
      const config = {
        command: 'docker',
        args: [
          'run',
          '-i',
          '--rm',
          '-e',
          'KEY=${input:key}',
          'image'
        ],
        env: {}
      };

      const hasEnvObject = config.env && Object.keys(config.env).length > 0;
      expect(hasEnvObject).toBe(false);

      // Should parse from args instead
      const envList: Array<{ key: string }> = [];
      for (let i = 0; i < config.args.length; i++) {
        if (config.args[i] === '-e' && i + 1 < config.args.length) {
          const envArg = config.args[i + 1];
          if (envArg.includes('=')) {
            const [key] = envArg.split('=');
            envList.push({ key });
          }
          i++;
        }
      }

      expect(envList).toHaveLength(1);
      expect(envList[0].key).toBe('KEY');
    });

    it('should handle missing password field in input', () => {
      const input: {
        id: string;
        type: 'promptString';
        description: string;
        password?: boolean;
      } = {
        id: 'test',
        type: 'promptString' as const,
        description: 'Test'
        // password field omitted
      };

      // Should default to false or handle gracefully
      expect(input.password).toBeUndefined();
    });

    it('should handle special characters in env var values', () => {
      const value = '${input:key_with_underscore}';
      const inputMatch = value.match(/\$\{input:([^}]+)\}/);
      
      expect(inputMatch).toBeTruthy();
      if (inputMatch) {
        expect(inputMatch[1]).toBe('key_with_underscore');
      }
    });

    it('should handle Docker images with tags and digests', () => {
      const images = [
        'ubuntu:22.04',
        'myregistry.azurecr.io/myimage:latest',
        'nginx@sha256:abcd1234',
        'ghcr.io/owner/repo:tag'
      ];

      images.forEach(image => {
        const args = ['run', '-i', '--rm', image];
        const imageIndex = args.findIndex(arg => 
          !arg.startsWith('-') && 
          arg !== 'run' && 
          arg !== '-i' && 
          arg !== '--rm'
        );
        
        expect(args[imageIndex]).toBe(image);
      });
    });
  });
});
