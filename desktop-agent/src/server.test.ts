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
