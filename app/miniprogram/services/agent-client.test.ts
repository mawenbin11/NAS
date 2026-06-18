import assert from "node:assert/strict";
import { createServer } from "node:http";
import type { AddressInfo } from "node:net";
import test from "node:test";

import { checkAgentHealth, normalizeAgentBaseUrl } from "./agent-client.js";

test("normalizeAgentBaseUrl adds http scheme and removes trailing slash", () => {
  assert.equal(normalizeAgentBaseUrl("127.0.0.1:48731/"), "http://127.0.0.1:48731");
  assert.equal(normalizeAgentBaseUrl(" http://192.168.1.10:48731/// "), "http://192.168.1.10:48731");
});

test("checkAgentHealth returns online status from /health", async () => {
  const server = createServer((request, response) => {
    assert.equal(request.url, "/health");
    response.writeHead(200, { "content-type": "application/json" });
    response.end(
      JSON.stringify({
        status: "ok",
        dataDir: "E:\\MiniNAS\\data",
        metadataDir: "E:\\MiniNAS\\data\\.mininas",
      }),
    );
  });

  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));

  try {
    const address = server.address();
    assert.equal(typeof address, "object");
    assert.ok(address);

    const { port } = address as AddressInfo;
    const result = await checkAgentHealth(`127.0.0.1:${port}`);

    assert.equal(result.online, true);
    assert.equal(result.baseUrl, `http://127.0.0.1:${port}`);
    assert.equal(result.dataDir, "E:\\MiniNAS\\data");
  } finally {
    await new Promise<void>((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    });
  }
});

test("checkAgentHealth returns offline status when the agent is unreachable", async () => {
  const result = await checkAgentHealth("127.0.0.1:1");

  assert.equal(result.online, false);
  assert.match(result.error ?? "", /fetch failed|bad port|ECONNREFUSED/i);
});
