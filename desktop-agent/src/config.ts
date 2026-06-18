import path from "node:path";

export type AgentConfig = {
  projectRoot: string;
  dataDir: string;
  metadataDir: string;
  port: number;
};

export type CreateAgentConfigOptions = {
  projectRoot: string;
  port?: number;
};

export function resolveProjectRoot(desktopAgentDir: string): string {
  return path.resolve(desktopAgentDir, "..");
}

export function createAgentConfig(options: CreateAgentConfigOptions): AgentConfig {
  const projectRoot = path.resolve(options.projectRoot);
  const dataDir = path.join(projectRoot, "data");

  return {
    projectRoot,
    dataDir,
    metadataDir: path.join(dataDir, ".mininas"),
    port: options.port ?? 48731,
  };
}

export function resolveStoragePath(config: AgentConfig, relativePath: string): string {
  const resolved = path.resolve(config.dataDir, relativePath);
  const relative = path.relative(config.dataDir, resolved);

  if (relative.startsWith("..") || path.isAbsolute(relative)) {
    throw new Error("Resolved path is outside the MiniNAS data directory");
  }

  return resolved;
}
