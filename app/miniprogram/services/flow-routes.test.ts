import assert from "node:assert/strict";
import test from "node:test";

import { folderActionsUrl, folderPickerUrl, mediaDetailUrl } from "./flow-routes.js";

test("folderPickerUrl opens a device at a folder path", () => {
  assert.equal(
    folderPickerUrl("http://127.0.0.1:48731", "/Photos/Trip"),
    "/pages/folder-picker/index?deviceId=http%3A%2F%2F127.0.0.1%3A48731&path=%2FPhotos%2FTrip",
  );
});

test("folderActionsUrl opens the selected folder workspace", () => {
  assert.equal(
    folderActionsUrl("device 1", "/Photos/Trip"),
    "/pages/folder-actions/index?deviceId=device%201&folder=%2FPhotos%2FTrip",
  );
});

test("mediaDetailUrl preserves selected device and folder context", () => {
  assert.equal(
    mediaDetailUrl("file 1", "device 1", "/Photos/Trip"),
    "/pages/media-detail/index?id=file%201&deviceId=device%201&folder=%2FPhotos%2FTrip",
  );
});
