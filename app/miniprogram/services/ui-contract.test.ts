import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

test("folder actions page exposes folder switching and preview mode tabs", () => {
  const wxml = readFileSync("miniprogram/pages/folder-actions/index.wxml", "utf8");

  assert.match(wxml, /选择\/切换文件夹/);
  assert.match(wxml, /wx:if="\{\{loading\}\}"/);
  assert.match(wxml, /class="mode-tab/);
  assert.match(wxml, /data-mode="small"[^>]*>小/);
  assert.match(wxml, /data-mode="medium"[^>]*>中/);
  assert.match(wxml, /data-mode="large"[^>]*>大/);
});

test("library page exposes preview mode tabs", () => {
  const wxml = readFileSync("miniprogram/pages/library/index.wxml", "utf8");

  assert.match(wxml, /class="mode-tab/);
  assert.match(wxml, /data-mode="small"[^>]*>小/);
  assert.match(wxml, /data-mode="medium"[^>]*>中/);
  assert.match(wxml, /data-mode="large"[^>]*>大/);
});

test("folder picker gives feedback while opening the selected folder", () => {
  const wxml = readFileSync("miniprogram/pages/folder-picker/index.wxml", "utf8");
  const js = readFileSync("miniprogram/pages/folder-picker/index.js", "utf8");

  assert.match(wxml, /class="folder-action/);
  assert.match(wxml, /bindtap="onUseCurrentFolder"/);
  assert.doesNotMatch(wxml, /<button[^>]*bindtap="onUseCurrentFolder"/);
  assert.match(js, /findDeviceById/);
  assert.match(js, /wx\.redirectTo/);
});

test("device page opens an online computer workspace directly", () => {
  const js = readFileSync("miniprogram/pages/device/index.js", "utf8");

  assert.match(js, /folderActionsUrl/);
  assert.doesNotMatch(js, /folderPickerUrl/);
});
