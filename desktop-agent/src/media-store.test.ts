import assert from "node:assert/strict";
import { existsSync, mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";

import { createAgentConfig } from "./config.js";
import { createMediaStore } from "./media-store.js";

test("saveMedia stores an image under the upload date and records it in the index", async () => {
  const projectRoot = mkdtempSync(path.join(tmpdir(), "mininas-"));
  const config = createAgentConfig({ projectRoot });
  const store = createMediaStore(config);
  const uploadedAt = new Date("2026-06-18T03:04:05.000Z");
  const content = Buffer.from("fake image bytes");

  const file = await store.saveMedia({
    originalName: "phone photo.jpg",
    mimeType: "image/jpeg",
    content,
    uploadedAt,
    sourceDevice: "iphone",
  });

  assert.equal(file.originalName, "phone photo.jpg");
  assert.equal(file.fileType, "photo");
  assert.equal(file.mimeType, "image/jpeg");
  assert.equal(file.size, content.length);
  assert.match(file.relativePath, /^2026[\\/]06[\\/]18[\\/].+\.jpg$/);
  assert.equal(readFileSync(path.join(config.dataDir, file.relativePath)).toString(), "fake image bytes");

  const listed = await store.listMedia();
  assert.equal(listed.length, 1);
  assert.equal(listed[0]?.id, file.id);
  assert.equal(listed[0]?.sourceDevice, "iphone");
});

test("saveMedia stores a video with video file type", async () => {
  const projectRoot = mkdtempSync(path.join(tmpdir(), "mininas-"));
  const config = createAgentConfig({ projectRoot });
  const store = createMediaStore(config);

  const file = await store.saveMedia({
    originalName: "clip.mp4",
    mimeType: "video/mp4",
    content: Buffer.from("fake video bytes"),
    uploadedAt: new Date("2026-06-18T03:04:05.000Z"),
    sourceDevice: "iphone",
  });

  assert.equal(file.fileType, "video");
  assert.match(file.relativePath, /^2026[\\/]06[\\/]18[\\/].+\.mp4$/);
  assert.equal(existsSync(path.join(config.dataDir, file.relativePath)), true);
});

test("saveMedia rejects non photo or video uploads", async () => {
  const projectRoot = mkdtempSync(path.join(tmpdir(), "mininas-"));
  const config = createAgentConfig({ projectRoot });
  const store = createMediaStore(config);

  await assert.rejects(
    () =>
      store.saveMedia({
        originalName: "notes.txt",
        mimeType: "text/plain",
        content: Buffer.from("not allowed"),
        uploadedAt: new Date("2026-06-18T03:04:05.000Z"),
        sourceDevice: "iphone",
      }),
    /Only photo and video uploads are supported/,
  );
});
