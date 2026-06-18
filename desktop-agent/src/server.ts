import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { createServer, type IncomingMessage, type Server, type ServerResponse } from "node:http";
import os from "node:os";
import path from "node:path";

import type { AgentConfig } from "./config.js";
import { resolveStoragePath } from "./config.js";
import { createMediaStore } from "./media-store.js";
import { createFolder, listFolders, normalizeFolderPath } from "./folder-store.js";

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
    void handleRequest(config, deviceProfile, request, response);
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

async function handleRequest(
  config: AgentConfig,
  deviceProfile: DeviceProfile,
  request: IncomingMessage,
  response: ServerResponse,
): Promise<void> {
  const url = new URL(request.url ?? "/", "http://127.0.0.1");
  const mediaStore = createMediaStore(config);

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

  if (request.method === "GET" && url.pathname === "/media") {
    const items = filterMediaByFolder(await mediaStore.listMedia(), url.searchParams.get("folder") ?? "/");
    sendJson(response, 200, { items });
    return;
  }

  if (request.method === "GET" && url.pathname === "/folders") {
    try {
      const folders = await listFolders(config, url.searchParams.get("path") ?? "/");
      sendJson(response, 200, { folders });
    } catch (error) {
      sendJson(response, 400, {
        error: error instanceof Error ? error.message : "Invalid folder path",
      });
    }
    return;
  }

  if (request.method === "POST" && url.pathname === "/folders") {
    try {
      const body = await readJsonBody<{ path?: string }>(request);
      const folder = await createFolder(config, body.path ?? "/");
      sendJson(response, 201, folder);
    } catch (error) {
      sendJson(response, 400, {
        error: error instanceof Error ? error.message : "Invalid folder path",
      });
    }
    return;
  }

  const fileRouteMatch = url.pathname.match(/^\/media\/([^/]+)\/file$/);
  if (request.method === "GET" && fileRouteMatch) {
    const media = await mediaStore.getMedia(decodeURIComponent(fileRouteMatch[1] ?? ""));

    if (!media) {
      sendJson(response, 404, { error: "Media not found" });
      return;
    }

    const filePath = resolveStoragePath(config, media.relativePath);

    try {
      await stat(filePath);
    } catch {
      sendJson(response, 404, { error: "Media file missing" });
      return;
    }

    response.writeHead(200, {
      "content-type": media.mimeType,
      "content-disposition": `inline; filename="${path.basename(media.originalName).replace(/"/g, "")}"`,
    });
    createReadStream(filePath).pipe(response);
    return;
  }

  if (request.method === "POST" && url.pathname === "/media") {
    try {
      const upload = await readJsonBody<MediaUploadRequest>(request);
      validateMediaUpload(upload);
      const record = await mediaStore.saveMedia({
        originalName: upload.originalName,
        mimeType: upload.mimeType,
        content: Buffer.from(upload.contentBase64, "base64"),
        uploadedAt: upload.uploadedAt ? new Date(upload.uploadedAt) : new Date(),
        sourceDevice: upload.sourceDevice,
        targetFolder: upload.targetFolder,
      });

      sendJson(response, 201, record);
    } catch (error) {
      sendJson(response, 400, {
        error: error instanceof Error ? error.message : "Invalid media upload",
      });
    }
    return;
  }

  sendJson(response, 404, { error: "Not found" });
}

type MediaUploadRequest = {
  originalName: string;
  mimeType: string;
  contentBase64: string;
  sourceDevice: string;
  uploadedAt?: string;
  targetFolder?: string;
};

function validateMediaUpload(upload: Partial<MediaUploadRequest>): asserts upload is MediaUploadRequest {
  if (!upload.originalName) {
    throw new Error("originalName is required");
  }

  if (!upload.mimeType) {
    throw new Error("mimeType is required");
  }

  if (!upload.contentBase64) {
    throw new Error("contentBase64 is required");
  }

  if (!upload.sourceDevice) {
    throw new Error("sourceDevice is required");
  }
}

function filterMediaByFolder<T extends { relativePath: string }>(items: T[], folderPath: string): T[] {
  const normalizedFolder = normalizeFolderPath(folderPath).replace(/\\/g, "/");

  if (!normalizedFolder) {
    return items;
  }

  return items.filter((item) => item.relativePath.replace(/\\/g, "/").startsWith(`${normalizedFolder}/`));
}

function sendJson(response: ServerResponse, statusCode: number, body: unknown): void {
  response.writeHead(statusCode, {
    "content-type": "application/json; charset=utf-8",
  });
  response.end(JSON.stringify(body));
}

function readJsonBody<T>(request: IncomingMessage): Promise<T> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];

    request.on("data", (chunk: Buffer) => {
      chunks.push(chunk);
    });
    request.on("end", () => {
      try {
        resolve(JSON.parse(Buffer.concat(chunks).toString("utf8")) as T);
      } catch (error) {
        reject(error);
      }
    });
    request.on("error", reject);
  });
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
