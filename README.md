# ld-agent TypeScript

**Dynamic linking for agentic systems in TypeScript/JavaScript**

ld-agent-ts is the TypeScript/JavaScript implementation of ld-agent, a dynamic linker for AI capabilities. Just like `ld-so` discovers and links shared libraries at runtime, ld-agent discovers and links agentic capabilities to create composable AI systems.

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Build and Run the Example

```bash
npm run example
```

This will:
- Build the TypeScript code
- Load the calculator plugin
- Run the example, which tests the `add_numbers` tool

### 3. Expected Output

```
🔗 ld-agent TypeScript Example
Dynamic linking for agentic systems

🔌 Calculator plugin initialized
🔌 ✅ Loaded Simple Calculator 1.0.0
🔌 Loaded 1 plugins
📦 Loaded 1 plugins

🔧 Available tools (1):
   • calculator.add_numbers

🔌 Loaded plugins (1):
   • Simple Calculator v1.0.0 - Basic arithmetic operations

🧮 Testing calculator.add_numbers:
   15.5 + 24.3 = 39.8
   100 + 200 = 300

✅ ld-agent TypeScript example completed!
```

## Creating Plugins

### Plugin Structure

TypeScript/JavaScript plugins must export specific objects:

```typescript
import { ModuleInfo, ModuleExports, PluginInterface } from 'ld-agent';

// Your tool function
function addNumbers(a: number, b: number): number {
  return a + b;
}

// Required: Plugin metadata
export const moduleInfo: ModuleInfo = {
  name: 'Simple Calculator',
  description: 'Basic arithmetic operations',
  author: 'Your Name',
  version: '1.0.0',
  platform: 'any',
  nodeRequires: '>=18.0.0',
  dependencies: [],
  environmentVariables: {},
};

// Required: Plugin exports
export const moduleExports: ModuleExports = {
  tools: [
    {
      name: 'add_numbers',
      description: 'Add two numbers together',
      function: addNumbers,
      parameters: {
        a: { type: 'number', description: 'First number', required: true },
        b: { type: 'number', description: 'Second number', required: true },
      },
      returnType: 'number',
      async: false,
    },
  ],
};

// Optional: Initialization function
export async function init(): Promise<void> {
  console.log('Plugin initialized');
}

// Export as CommonJS module for compatibility
module.exports = { moduleInfo, moduleExports, init } as PluginInterface;
```

### Async Tools

ld-agent-ts supports both synchronous and asynchronous tools:

```typescript
// Async tool example
async function fetchData(url: string): Promise<any> {
  const response = await fetch(url);
  return response.json();
}

export const moduleExports: ModuleExports = {
  tools: [
    {
      name: 'fetch_data',
      description: 'Fetch data from a URL',
      function: fetchData,
      parameters: {
        url: { type: 'string', description: 'URL to fetch', required: true },
      },
      returnType: 'any',
      async: true, // Mark as async
    },
  ],
};
```

## Using ld-agent in Your Code

```typescript
import { createLoader } from 'ld-agent';

async function main() {
  // Create loader
  const loader = createLoader('plugins', false);
  
  // Load all plugins
  const loaded = await loader.loadAll();
  console.log(`Loaded ${loaded} plugins`);
  
  // List available tools
  const tools = loader.listTools();
  for (const tool of tools) {
    console.log(`Tool: ${tool}`);
  }
  
  // Call a tool
  const result = await loader.callTool('calculator.add_numbers', {
    a: 10,
    b: 20,
  });
  console.log(`Result: ${result}`);
}

main().catch(console.error);
```

## API Reference

### Core Classes

- `PluginLoader` - Main plugin loader and registry
- `createLoader(pluginsDir, silent)` - Convenience function to create a loader

### Core Types

- `ModuleInfo` - Plugin metadata (name, version, dependencies, etc.)
- `ModuleExports` - What the plugin exports (tools, agents, resources)
- `Tool` - A callable function with metadata
- `Parameter` - Function parameter definition
- `PluginInterface` - Interface that plugins must implement

### Key Methods

- `loadAll()` - Load all plugins from directory
- `loadPlugin(path)` - Load a specific plugin
- `getTool(name)` - Get a tool by name
- `callTool(name, args)` - Call a tool with arguments
- `listTools()` - List all available tools
- `listPlugins()` - List all loaded plugins

## Build Commands

```bash
# Install dependencies
npm install

# Build TypeScript
npm run build

# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Run the example
npm run example

# Clean build artifacts
npm run clean

# Lint code
npm run lint

# Format code
npm run format
```

## Plugin Discovery

ld-agent-ts discovers plugins in the following ways:

1. **Single-file plugins** - `.js` or `.ts` files in the plugins directory
2. **Package plugins** - Directories with `index.js` or `index.ts` files
3. **npm packages** - Installed packages that follow the ld-agent plugin interface

## Environment Variables

Plugins can declare environment variables they need:

```typescript
export const moduleInfo: ModuleInfo = {
  // ... other fields
  environmentVariables: {
    API_KEY: {
      description: 'API key for external service',
      required: true,
    },
    TIMEOUT: {
      description: 'Request timeout in milliseconds',
      default: '5000',
      required: false,
    },
  },
};
```

## Error Handling

ld-agent-ts provides specific error types:

- `ToolNotFoundError` - When a requested tool doesn't exist
- `PluginLoadError` - When a plugin fails to load
- `IncompatiblePluginError` - When a plugin is not compatible
- `MissingMetadataError` - When required plugin metadata is missing

## Browser Support

While primarily designed for Node.js, ld-agent-ts can be adapted for browser use:

```typescript
// Browser-compatible plugin loader (simplified)
class BrowserPluginLoader {
  private plugins = new Map();
  
  registerPlugin(name: string, plugin: PluginInterface) {
    // Register pre-loaded plugins
    this.plugins.set(name, plugin);
  }
  
  // ... other methods
}
```

## TypeScript Support

Full TypeScript support with:
- Strict type checking
- IntelliSense support
- Type-safe plugin interfaces
- Zod schema validation

## Requirements

- Node.js 18.0.0 or later
- TypeScript 5.0 or later (for development)

## Architecture

ld-agent-ts follows the same conceptual model as Python and Go versions:

1. **Discovery** - Scans plugins directory for `.js`/`.ts` files
2. **Loading** - Uses Node.js `require()` to load modules
3. **Validation** - Uses Zod schemas to validate plugin structure
4. **Registration** - Builds a registry of available capabilities
5. **Execution** - Calls plugin functions with proper argument mapping

This enables truly modular AI systems where capabilities can be mixed and matched at runtime.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Add tests for new functionality
4. Run `npm test` to ensure tests pass
5. Submit a pull request

## License

Same as the main ld-agent project. 
