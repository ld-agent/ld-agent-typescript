import { z } from 'zod';

// Environment variable configuration schema
export const EnvVarSchema = z.object({
  description: z.string(),
  default: z.string().optional().default(''),
  required: z.boolean().default(false),
});

export type EnvVar = z.infer<typeof EnvVarSchema>;

// Module metadata schema
export const ModuleInfoSchema = z.object({
  name: z.string(),
  description: z.string(),
  author: z.string(),
  version: z.string(),
  platform: z.string().default('any'),
  nodeRequires: z.string().optional(),
  dependencies: z.array(z.string()).default([]),
  environmentVariables: z.record(z.string(), EnvVarSchema).default({}),
});

export type ModuleInfo = z.infer<typeof ModuleInfoSchema>;

// Function parameter schema
export const ParameterSchema = z.object({
  type: z.string(),
  description: z.string(),
  required: z.boolean().default(true),
  default: z.any().optional(),
});

export type Parameter = z.infer<typeof ParameterSchema>;

// Tool function type
export type ToolFunction = (...args: any[]) => any | Promise<any>;

// Tool schema
export const ToolSchema = z.object({
  name: z.string(),
  description: z.string(),
  function: z.function() as z.ZodType<ToolFunction>,
  parameters: z.record(z.string(), ParameterSchema).default({}),
  returnType: z.string().default('any'),
  async: z.boolean().default(false),
});

export type Tool = z.infer<typeof ToolSchema>;

// Module exports schema
export const ModuleExportsSchema = z.object({
  tools: z.array(ToolSchema).default([]),
  agents: z.array(z.any()).default([]),
  resources: z.array(z.any()).default([]),
  models: z.array(z.any()).default([]),
  utilities: z.array(ToolSchema).default([]),
});

export type ModuleExports = z.infer<typeof ModuleExportsSchema>;

// Plugin schema
export const PluginSchema = z.object({
  name: z.string(),
  info: ModuleInfoSchema,
  exports: ModuleExportsSchema,
  filePath: z.string(),
  module: z.any(), // The actual loaded module
});

export type Plugin = z.infer<typeof PluginSchema>;

// Tool registry interface
export interface ToolRegistry {
  tools: Map<string, Tool>;
  plugins: Map<string, Plugin>;
  metadata: Map<string, ModuleInfo>;
}

// Plugin interface that plugins must implement
export interface PluginInterface {
  moduleInfo: ModuleInfo;
  moduleExports: ModuleExports;
  init?(): Promise<void> | void;
}

// Error types
export class PluginError extends Error {
  constructor(message: string, public code: string) {
    super(message);
    this.name = 'PluginError';
  }
}

export class ToolNotFoundError extends PluginError {
  constructor(toolName: string) {
    super(`Tool not found: ${toolName}`, 'TOOL_NOT_FOUND');
  }
}

export class PluginLoadError extends PluginError {
  constructor(pluginPath: string, cause: string) {
    super(`Failed to load plugin ${pluginPath}: ${cause}`, 'PLUGIN_LOAD_FAILED');
  }
}

export class IncompatiblePluginError extends PluginError {
  constructor(pluginName: string, reason: string) {
    super(`Plugin ${pluginName} is not compatible: ${reason}`, 'INCOMPATIBLE_PLUGIN');
  }
}

export class MissingMetadataError extends PluginError {
  constructor(pluginPath: string, missing: string) {
    super(`Plugin ${pluginPath} missing required metadata: ${missing}`, 'MISSING_METADATA');
  }
} 
