import assert from "node:assert/strict";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";

import { createAgentConfig } from "./config.js";
import { createAgentServer } from "./server.js";

test("GET /health returns agent status and data directory", async () => {
  const projectRoot = mkdtempSync(path.join(tmpdir(), "mininas-"));
  const config = createAgentConfig({ projectRoot, port: 0 });
  const server = await createAgentServer(config).start();

  try {
    const response = await fetch(`${server.url}/health`);
    const body = await response.json();

    assert.equal(response.status, 200);
    assert.equal(body.status, "ok");
    assert.equal(body.dataDir, config.dataDir);
    assert.equal(body.metadataDir, config.metadataDir);
  } finally {
    await server.stop();
  }
});

test("GET /devices/current returns the local device profile", async () => {
  const projectRoot = mkdtempSync(path.join(tmpdir(), "mininas-"));
  const config = createAgentConfig({ projectRoot, port: 0 });
  const server = await createAgentServer(config, {
    deviceId: "device-test",
    deviceName: "Test PC",
  }).start();

  try {
    const response = await fetch(`${server.url}/devices/current`);
    const body = await response.json();

    assert.equal(response.status, 200);
    assert.equal(body.deviceId, "device-test");
    assert.equal(body.deviceName, "Test PC");
    assert.equal(body.alias, "Test PC");
  } finally {
    await server.stop();
  }
});

test("unknown routes return 404 JSON", async () => {
  const projectRoot = mkdtempSync(path.join(tmpdir(), "mininas-"));
  const config = createAgentConfig({ projectRoot, port: 0 });
  const server = await createAgentServer(config).start();

  try {
    const response = await fetch(`${server.url}/missing`);
    const body = await response.json();

    assert.equal(response.status, 404);
    assert.equal(body.error, "Not found");
  } finally {
    await server.stop();
  }
});

test("POST /media saves an uploaded photo and returns the indexed record", async () => {
  const projectRoot = mkdtempSync(path.join(tmpdir(), "mininas-"));
  const config = createAgentConfig({ projectRoot, port: 0 });
  const server = await createAgentServer(config).start();

  try {
    const response = await fetch(`${server.url}/media`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        originalName: "phone.jpg",
        mimeType: "image/jpeg",
        contentBase64: Buffer.from("fake image bytes").toString("base64"),
        sourceDevice: "iphone",
        uploadedAt: "2026-06-18T03:04:05.000Z",
      }),
    });
    const body = await response.json();

    assert.equal(response.status, 201);
    assert.equal(body.originalName, "phone.jpg");
    assert.equal(body.fileType, "photo");
    assert.match(body.relativePath, /^2026[\\/]06[\\/]18[\\/].+\.jpg$/);
  } finally {
    await server.stop();
  }
});

test("GET /media returns indexed uploads", async () => {
  const projectRoot = mkdtempSync(path.join(tmpdir(), "mininas-"));
  const config = createAgentConfig({ projectRoot, port: 0 });
  const server = await createAgentServer(config).start();

  try {
    await fetch(`${server.url}/media`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        originalName: "phone.jpg",
        mimeType: "image/jpeg",
        contentBase64: Buffer.from("fake image bytes").toString("base64"),
        sourceDevice: "iphone",
        uploadedAt: "2026-06-18T03:04:05.000Z",
      }),
    });

    const response = await fetch(`${server.url}/media`);
    const body = await response.json();

    assert.equal(response.status, 200);
    assert.equal(body.items.length, 1);
    assert.equal(body.items[0].originalName, "phone.jpg");
  } finally {
    await server.stop();
  }
});

test("POST /media rejects non-media uploads with 400", async () => {
  const projectRoot = mkdtempSync(path.join(tmpdir(), "mininas-"));
  const config = createAgentConfig({ projectRoot, port: 0 });
  const server = await createAgentServer(config).start();

  try {
    const response = await fetch(`${server.url}/media`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        originalName: "notes.txt",
        mimeType: "text/plain",
        contentBase64: Buffer.from("not media").toString("base64"),
        sourceDevice: "iphone",
        uploadedAt: "2026-06-18T03:04:05.000Z",
      }),
    });
    const body = await response.json();

    assert.equal(response.status, 400);
    assert.match(body.error, /Only photo and video uploads are supported/);
  } finally {
    await server.stop();
  }
});

test("POST /media rejects missing upload fields with 400", async () => {
  const projectRoot = mkdtempSync(path.join(tmpdir(), "mininas-"));
  const config = createAgentConfig({ projectRoot, port: 0 });
  const server = await createAgentServer(config).start();

  try {
    const response = await fetch(`${server.url}/media`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        originalName: "phone.jpg",
      }),
    });
    const body = await response.json();

    assert.equal(response.status, 400);
    assert.match(body.error, /mimeType is required/);
  } finally {
    await server.stop();
  }
});
