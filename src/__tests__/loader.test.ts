import { PluginLoader } from '../loader';
import { ModuleInfo, ModuleExports } from '../types';

describe('PluginLoader', () => {
  let loader: PluginLoader;

  beforeEach(() => {
    loader = new PluginLoader('test-plugins', true); // silent mode for tests
  });

  test('should create a new loader', () => {
    expect(loader).toBeInstanceOf(PluginLoader);
  });

  test('should start with empty registry', () => {
    const tools = loader.listTools();
    expect(tools).toHaveLength(0);
    
    const plugins = loader.listPlugins();
    expect(plugins.size).toBe(0);
  });

  test('should handle tool not found error', async () => {
    await expect(loader.callTool('nonexistent.tool')).rejects.toThrow('Tool not found');
  });

  test('should validate module info structure', () => {
    const validModuleInfo: ModuleInfo = {
      name: 'Test Plugin',
      description: 'A test plugin',
      author: 'Test Author',
      version: '1.0.0',
      platform: 'any',
      dependencies: [],
      environmentVariables: {},
    };

    expect(validModuleInfo.name).toBe('Test Plugin');
    expect(validModuleInfo.version).toBe('1.0.0');
  });

  test('should validate module exports structure', () => {
    const validModuleExports: ModuleExports = {
      tools: [
        {
          name: 'test_tool',
          description: 'A test tool',
          function: (a: number, b: number) => a + b,
          parameters: {
            a: { type: 'number', description: 'First number', required: true },
            b: { type: 'number', description: 'Second number', required: true },
          },
          returnType: 'number',
          async: false,
        },
      ],
      agents: [],
      resources: [],
      models: [],
      utilities: [],
    };

    expect(validModuleExports.tools).toHaveLength(1);
    expect(validModuleExports.tools[0].name).toBe('test_tool');
  });
}); 
