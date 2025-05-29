import { createLoader } from '../loader';

async function main() {
  console.log('🔗 ld-agent TypeScript Example');
  console.log('Dynamic linking for agentic systems');
  console.log();

  // Create a new loader - look in dist/plugins for compiled JS files
  const loader = createLoader('dist/plugins', false);

  // Load all plugins
  const loaded = await loader.loadAll();
  console.log(`📦 Loaded ${loaded} plugins\n`);

  // List available tools
  const tools = loader.listTools();
  console.log(`🔧 Available tools (${tools.length}):`);
  for (const tool of tools) {
    console.log(`   • ${tool}`);
  }
  console.log();

  // List loaded plugins
  const plugins = loader.listPlugins();
  console.log(`🔌 Loaded plugins (${plugins.size}):`);
  for (const [name, info] of plugins) {
    console.log(`   • ${info.name} v${info.version} - ${info.description}`);
  }
  console.log();

  // Test the calculator tool
  if (tools.length > 0) {
    console.log('🧮 Testing calculator.add_numbers:');

    try {
      // Call the add_numbers tool
      const result1 = await loader.callTool('calculator.add_numbers', {
        a: 15.5,
        b: 24.3,
      });
      console.log(`   15.5 + 24.3 = ${result1}`);

      // Test with different numbers
      const result2 = await loader.callTool('calculator.add_numbers', {
        a: 100,
        b: 200,
      });
      console.log(`   100 + 200 = ${result2}`);

    } catch (error) {
      console.error(`❌ Error calling tool: ${error}`);
    }
  }

  console.log();
  console.log('✅ ld-agent TypeScript example completed!');
}

// Run the example
if (require.main === module) {
  main().catch(console.error);
} 
