import assert from "node:assert/strict";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";

import { createAgentConfig, resolveProjectRoot, resolveStoragePath } from "./config.js";

test("createAgentConfig derives data and metadata directories from a project root", () => {
  const root = mkdtempSync(path.join(tmpdir(), "mininas-"));

  const config = createAgentConfig({ projectRoot: root });

  assert.equal(config.projectRoot, root);
  assert.equal(config.dataDir, path.join(root, "data"));
  assert.equal(config.metadataDir, path.join(root, "data", ".mininas"));
  assert.equal(config.port, 48731);
});

test("resolveStoragePath allows paths inside the data directory", () => {
  const root = mkdtempSync(path.join(tmpdir(), "mininas-"));
  const config = createAgentConfig({ projectRoot: root });

  const resolved = resolveStoragePath(config, "2026/06/18/photo.jpg");

  assert.equal(resolved, path.join(config.dataDir, "2026", "06", "18", "photo.jpg"));
});

test("resolveStoragePath rejects traversal outside the data directory", () => {
  const root = mkdtempSync(path.join(tmpdir(), "mininas-"));
  const config = createAgentConfig({ projectRoot: root });

  assert.throws(
    () => resolveStoragePath(config, "../secret.txt"),
    /outside the MiniNAS data directory/,
  );
});

test("resolveProjectRoot returns the MiniNAS root from the desktop-agent directory", () => {
  const root = mkdtempSync(path.join(tmpdir(), "mininas-"));
  const desktopAgentDir = path.join(root, "desktop-agent");

  assert.equal(resolveProjectRoot(desktopAgentDir), root);
});
