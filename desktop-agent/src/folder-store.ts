import { mkdir, readdir } from "node:fs/promises";
import path from "node:path";

import type { AgentConfig } from "./config.js";
import { resolveStoragePath } from "./config.js";

export type FolderEntry = {
  name: string;
  path: string;
};

export async function listFolders(config: AgentConfig, folderPath: string): Promise<FolderEntry[]> {
  const relativePath = normalizeFolderPath(folderPath);
  const targetPath = resolveStoragePath(config, relativePath);
  await mkdir(targetPath, { recursive: true });
  const entries = await readdir(targetPath, { withFileTypes: true });

  return entries
    .filter((entry) => entry.isDirectory() && entry.name !== ".mininas")
    .map((entry) => ({
      name: entry.name,
      path: toDisplayPath(path.join(relativePath, entry.name)),
    }))
    .sort((left, right) => left.name.localeCompare(right.name));
}

export async function createFolder(config: AgentConfig, folderPath: string): Promise<FolderEntry> {
  const relativePath = normalizeFolderPath(folderPath);
  const targetPath = resolveStoragePath(config, relativePath);
  await mkdir(targetPath, { recursive: true });

  return {
    name: path.basename(relativePath) || "/",
    path: toDisplayPath(relativePath),
  };
}

export function normalizeFolderPath(folderPath: string): string {
  const normalized = (folderPath || "/").replace(/\\/g, "/").replace(/^\/+|\/+$/g, "");

  if (!normalized) {
    return "";
  }

  return normalized.split("/").filter(Boolean).join(path.sep);
}

function toDisplayPath(relativePath: string): string {
  const normalized = relativePath.replace(/\\/g, "/").replace(/^\/+|\/+$/g, "");

  return normalized ? `/${normalized}` : "/";
}
