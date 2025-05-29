import { ModuleInfo, ModuleExports, PluginInterface } from '../types';

// Tool function
function addNumbers(a: number, b: number): number {
  return a + b;
}

// Plugin metadata
export const moduleInfo: ModuleInfo = {
  name: 'Simple Calculator',
  description: 'Basic arithmetic operations',
  author: 'ld-agent Team',
  version: '1.0.0',
  platform: 'any',
  nodeRequires: '>=18.0.0',
  dependencies: [],
  environmentVariables: {},
};

// Plugin exports
export const moduleExports: ModuleExports = {
  tools: [
    {
      name: 'add_numbers',
      description: 'Add two numbers together and return the result',
      function: addNumbers,
      parameters: {
        a: {
          type: 'number',
          description: 'First number to add',
          required: true,
        },
        b: {
          type: 'number',
          description: 'Second number to add',
          required: true,
        },
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

// Optional initialization function
export async function init(): Promise<void> {
  // Any initialization logic here
  console.log('Calculator plugin initialized');
}

// Export as plugin interface (for CommonJS compatibility)
module.exports = {
  moduleInfo,
  moduleExports,
  init,
} as PluginInterface; 
