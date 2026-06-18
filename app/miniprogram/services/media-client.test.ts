import assert from "node:assert/strict";
import { createServer } from "node:http";
import type { AddressInfo } from "node:net";
import test from "node:test";

import { listMedia, mediaFileUrl, uploadMediaBase64 } from "./media-client.js";

test("listMedia returns media items from the desktop agent", async () => {
  const server = createServer((request, response) => {
    assert.equal(request.url, "/media");
    response.writeHead(200, { "content-type": "application/json" });
    response.end(
      JSON.stringify({
        items: [
          {
            id: "file-1",
            originalName: "photo.jpg",
            relativePath: "2026/06/18/photo.jpg",
            fileType: "photo",
            mimeType: "image/jpeg",
            size: 12,
            uploadedAt: "2026-06-18T03:04:05.000Z",
          },
        ],
      }),
    );
  });
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));

  try {
    const { port } = server.address() as AddressInfo;
    const items = await listMedia(`http://127.0.0.1:${port}`);

    assert.equal(items.length, 1);
    assert.equal(items[0]?.originalName, "photo.jpg");
    assert.equal(items[0]?.fileType, "photo");
  } finally {
    await new Promise<void>((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    });
  }
});

test("listMedia requests media inside a selected folder", async () => {
  const server = createServer((request, response) => {
    assert.equal(request.url, "/media?folder=%2FPhotos%2FTrip");
    response.writeHead(200, { "content-type": "application/json" });
    response.end(JSON.stringify({ items: [] }));
  });
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));

  try {
    const { port } = server.address() as AddressInfo;
    const items = await listMedia(`http://127.0.0.1:${port}`, "/Photos/Trip");

    assert.deepEqual(items, []);
  } finally {
    await new Promise<void>((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    });
  }
});

test("uploadMediaBase64 posts a photo payload and returns the created record", async () => {
  const server = createServer((request, response) => {
    assert.equal(request.method, "POST");
    assert.equal(request.url, "/media");

    const chunks: Buffer[] = [];
    request.on("data", (chunk: Buffer) => chunks.push(chunk));
    request.on("end", () => {
      const body = JSON.parse(Buffer.concat(chunks).toString("utf8"));

      assert.equal(body.originalName, "phone.jpg");
      assert.equal(body.mimeType, "image/jpeg");
      assert.equal(body.contentBase64, "YWJj");
      assert.equal(body.sourceDevice, "wechat-mini-program");

      response.writeHead(201, { "content-type": "application/json" });
      response.end(
        JSON.stringify({
          id: "file-1",
          originalName: "phone.jpg",
          relativePath: "2026/06/18/photo.jpg",
          fileType: "photo",
          mimeType: "image/jpeg",
          size: 3,
          uploadedAt: "2026-06-18T03:04:05.000Z",
        }),
      );
    });
  });
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));

  try {
    const { port } = server.address() as AddressInfo;
    const item = await uploadMediaBase64(`http://127.0.0.1:${port}`, {
      originalName: "phone.jpg",
      mimeType: "image/jpeg",
      contentBase64: "YWJj",
    });

    assert.equal(item.id, "file-1");
    assert.equal(item.originalName, "phone.jpg");
  } finally {
    await new Promise<void>((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    });
  }
});

test("listMedia throws when the desktop agent returns an error", async () => {
  const server = createServer((_request, response) => {
    response.writeHead(500, { "content-type": "application/json" });
    response.end(JSON.stringify({ error: "boom" }));
  });
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));

  try {
    const { port } = server.address() as AddressInfo;

    await assert.rejects(() => listMedia(`http://127.0.0.1:${port}`), /HTTP 500/);
  } finally {
    await new Promise<void>((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    });
  }
});

test("mediaFileUrl returns the preview URL for a media item", () => {
  assert.equal(
    mediaFileUrl("http://127.0.0.1:48731", "file 1"),
    "http://127.0.0.1:48731/media/file%201/file",
  );
});
