import assert from "node:assert/strict";
import test from "node:test";

import { buildLibraryItems } from "./library-view.js";

test("buildLibraryItems marks photos and adds preview URLs", () => {
  const items = buildLibraryItems("http://127.0.0.1:48731", [
    {
      id: "photo 1",
      originalName: "photo.jpg",
      relativePath: "2026/06/18/photo.jpg",
      fileType: "photo",
      mimeType: "image/jpeg",
      size: 100,
      uploadedAt: "2026-06-18T03:04:05.000Z",
    },
    {
      id: "video-1",
      originalName: "clip.mp4",
      relativePath: "2026/06/18/clip.mp4",
      fileType: "video",
      mimeType: "video/mp4",
      size: 200,
      uploadedAt: "2026-06-18T03:05:05.000Z",
    },
  ]);

  assert.equal(items[0]?.isPhoto, true);
  assert.equal(items[0]?.previewUrl, "http://127.0.0.1:48731/media/photo%201/file");
  assert.equal(items[1]?.isPhoto, false);
  assert.equal(items[1]?.previewUrl, "");
});
