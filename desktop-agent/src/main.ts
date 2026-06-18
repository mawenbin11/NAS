import { fileURLToPath } from "node:url";
import path from "node:path";

import { createAgentConfig, resolveProjectRoot } from "./config.js";
import { createAgentServer } from "./server.js";

const desktopAgentDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const projectRoot = resolveProjectRoot(desktopAgentDir);
const config = createAgentConfig({
  projectRoot,
  port: Number(process.env.MININAS_PORT ?? 48731),
});

const server = await createAgentServer(config).start();

console.log(`MiniNAS desktop agent listening at ${server.url}`);
console.log(`MiniNAS data directory: ${config.dataDir}`);
