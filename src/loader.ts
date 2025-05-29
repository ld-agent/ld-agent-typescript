import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import {
  ModuleInfo,
  ModuleExports,
  Plugin,
  Tool,
  ToolRegistry,
  PluginInterface,
  PluginLoadError,
  IncompatiblePluginError,
  MissingMetadataError,
  ToolNotFoundError,
  ModuleInfoSchema,
  ModuleExportsSchema,
} from './types';

export class PluginLoader {
  private pluginsDir: string;
  private silent: boolean;
  private registry: ToolRegistry;

  constructor(pluginsDir: string = 'plugins', silent: boolean = false) {
    this.pluginsDir = pluginsDir;
    this.silent = silent;
    this.registry = {
      tools: new Map(),
      plugins: new Map(),
      metadata: new Map(),
    };
  }

  private log(message: string): void {
    if (!this.silent) {
      console.log(`🔌 ${message}`);
    }
  }

  private isCompatible(info: ModuleInfo): boolean {
    // Check platform
    if (info.platform !== 'any') {
      const currentPlatform = os.platform();
      if (info.platform !== currentPlatform) {
        return false;
      }
    }

    // Check Node.js version (basic check)
    if (info.nodeRequires) {
      const currentVersion = process.version;
      // Simple version check - in production you'd want proper semver comparison
      if (info.nodeRequires.startsWith('>=')) {
        const requiredVersion = info.nodeRequires.slice(2);
        if (currentVersion < `v${requiredVersion}`) {
          return false;
        }
      }
    }

    return true;
  }

  private async loadPluginFile(pluginPath: string): Promise<Plugin | null> {
    try {
      // Clear require cache to allow reloading
      delete require.cache[require.resolve(pluginPath)];
      
      // Load the module
      const module = require(pluginPath) as PluginInterface;

      // Validate module info
      if (!module.moduleInfo) {
        this.log(`⚠️  ${path.basename(pluginPath)} missing moduleInfo`);
        throw new MissingMetadataError(pluginPath, 'moduleInfo');
      }

      // Validate module exports
      if (!module.moduleExports) {
        this.log(`⚠️  ${path.basename(pluginPath)} missing moduleExports`);
        throw new MissingMetadataError(pluginPath, 'moduleExports');
      }

      // Validate with Zod schemas
      const moduleInfo = ModuleInfoSchema.parse(module.moduleInfo);
      const moduleExports = ModuleExportsSchema.parse(module.moduleExports);

      // Check compatibility
      if (!this.isCompatible(moduleInfo)) {
        this.log(`⚠️  ${path.basename(pluginPath)} not compatible`);
        throw new IncompatiblePluginError(path.basename(pluginPath), 'platform/version mismatch');
      }

      // Create plugin object
      const pluginName = path.basename(pluginPath, path.extname(pluginPath));
      const plugin: Plugin = {
        name: pluginName,
        info: moduleInfo,
        exports: moduleExports,
        filePath: pluginPath,
        module,
      };

      // Register the plugin
      this.registry.plugins.set(pluginName, plugin);
      this.registry.metadata.set(pluginName, moduleInfo);

      // Register tools
      for (const tool of moduleExports.tools) {
        this.registerTool(pluginName, tool);
      }

      // Call initialization function if provided
      if (module.init) {
        try {
          await module.init();
          this.log(`🔧 Initialized ${pluginName}`);
        } catch (error) {
          this.log(`⚠️  Failed to initialize ${pluginName}: ${error}`);
        }
      }

      this.log(`✅ Loaded ${moduleInfo.name} ${moduleInfo.version}`);
      return plugin;

    } catch (error) {
      if (error instanceof MissingMetadataError || error instanceof IncompatiblePluginError) {
        throw error;
      }
      this.log(`❌ Failed to load ${path.basename(pluginPath)}: ${error}`);
      throw new PluginLoadError(pluginPath, String(error));
    }
  }

  private registerTool(pluginName: string, tool: Tool): void {
    const toolName = `${pluginName}.${tool.name}`;
    this.registry.tools.set(toolName, tool);
  }

  async loadPlugin(pluginPath: string): Promise<boolean> {
    try {
      await this.loadPluginFile(pluginPath);
      return true;
    } catch (error) {
      return false;
    }
  }

  async loadAll(): Promise<number> {
    if (!fs.existsSync(this.pluginsDir)) {
      return 0;
    }

    let loaded = 0;
    const files = fs.readdirSync(this.pluginsDir);

    for (const file of files) {
      const filePath = path.join(this.pluginsDir, file);
      const stat = fs.statSync(filePath);

      if (stat.isFile() && (file.endsWith('.js') || file.endsWith('.ts'))) {
        if (await this.loadPlugin(path.resolve(filePath))) {
          loaded++;
        }
      } else if (stat.isDirectory() && !file.startsWith('.')) {
        // Try to load as a package plugin
        const packagePath = path.join(filePath, 'index.js');
        const packageTsPath = path.join(filePath, 'index.ts');
        
        if (fs.existsSync(packagePath)) {
          if (await this.loadPlugin(path.resolve(packagePath))) {
            loaded++;
          }
        } else if (fs.existsSync(packageTsPath)) {
          if (await this.loadPlugin(path.resolve(packageTsPath))) {
            loaded++;
          }
        }
      }
    }

    if (!this.silent && loaded > 0) {
      this.log(`Loaded ${loaded} plugins`);
    }

    return loaded;
  }

  getTool(name: string): Tool | undefined {
    return this.registry.tools.get(name);
  }

  listTools(): string[] {
    return Array.from(this.registry.tools.keys());
  }

  listPlugins(): Map<string, ModuleInfo> {
    return new Map(this.registry.metadata);
  }

  async callTool(name: string, args: Record<string, any> = {}): Promise<any> {
    const tool = this.registry.tools.get(name);
    if (!tool) {
      throw new ToolNotFoundError(name);
    }

    try {
      // Convert args object to array based on parameter order
      const paramNames = Object.keys(tool.parameters);
      const argArray = paramNames.map(paramName => args[paramName]);

      // Call the function
      const result = tool.function(...argArray);

      // Handle async functions
      if (result instanceof Promise) {
        return await result;
      }

      return result;
    } catch (error) {
      throw new Error(`Error calling tool ${name}: ${error}`);
    }
  }

  getRegistry(): ToolRegistry {
    return this.registry;
  }
}

// Convenience function for simple usage
export function createLoader(pluginsDir: string = 'plugins', silent: boolean = false): PluginLoader {
  return new PluginLoader(pluginsDir, silent);
} 
