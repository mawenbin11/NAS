import { createServer, type IncomingMessage, type Server, type ServerResponse } from "node:http";
import os from "node:os";

import type { AgentConfig } from "./config.js";

export type DeviceProfile = {
  deviceId: string;
  deviceName: string;
  alias: string;
};

export type CreateAgentServerOptions = {
  deviceId?: string;
  deviceName?: string;
  alias?: string;
};

export type RunningAgentServer = {
  url: string;
  stop: () => Promise<void>;
};

export type AgentServer = {
  start: () => Promise<RunningAgentServer>;
};

export function createAgentServer(
  config: AgentConfig,
  options: CreateAgentServerOptions = {},
): AgentServer {
  const deviceName = options.deviceName ?? os.hostname();
  const deviceProfile: DeviceProfile = {
    deviceId: options.deviceId ?? `local-${deviceName}`,
    deviceName,
    alias: options.alias ?? deviceName,
  };

  const httpServer = createServer((request, response) => {
    handleRequest(config, deviceProfile, request, response);
  });

  return {
    start: () =>
      new Promise((resolve, reject) => {
        httpServer.once("error", reject);
        httpServer.listen(config.port, "127.0.0.1", () => {
          httpServer.off("error", reject);
          const address = httpServer.address();
          const port = typeof address === "object" && address ? address.port : config.port;

          resolve({
            url: `http://127.0.0.1:${port}`,
            stop: () => stopServer(httpServer),
          });
        });
      }),
  };
}

function handleRequest(
  config: AgentConfig,
  deviceProfile: DeviceProfile,
  request: IncomingMessage,
  response: ServerResponse,
): void {
  const url = new URL(request.url ?? "/", "http://127.0.0.1");

  if (request.method === "GET" && url.pathname === "/health") {
    sendJson(response, 200, {
      status: "ok",
      dataDir: config.dataDir,
      metadataDir: config.metadataDir,
    });
    return;
  }

  if (request.method === "GET" && url.pathname === "/devices/current") {
    sendJson(response, 200, deviceProfile);
    return;
  }

  sendJson(response, 404, { error: "Not found" });
}

function sendJson(response: ServerResponse, statusCode: number, body: unknown): void {
  response.writeHead(statusCode, {
    "content-type": "application/json; charset=utf-8",
  });
  response.end(JSON.stringify(body));
}

function stopServer(server: Server): Promise<void> {
  return new Promise((resolve, reject) => {
    server.close((error) => {
      if (error) {
        reject(error);
        return;
      }

      resolve();
    });
  });
}
