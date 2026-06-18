import assert from "node:assert/strict";
import test from "node:test";

import { addOrUpdateDevice, createDevice, findDeviceById, selectDevice } from "./device-store.js";

test("createDevice normalizes base URL and defaults target folder", () => {
  const device = createDevice({
    name: "Home PC",
    baseUrl: "127.0.0.1:48731/",
  });

  assert.equal(device.name, "Home PC");
  assert.equal(device.baseUrl, "http://127.0.0.1:48731");
  assert.equal(device.targetFolder, "/");
});

test("addOrUpdateDevice replaces devices with the same id", () => {
  const first = createDevice({ name: "Home", baseUrl: "127.0.0.1:48731" });
  const updated = { ...first, name: "Home PC", targetFolder: "/Photos" };

  const devices = addOrUpdateDevice([first], updated);

  assert.equal(devices.length, 1);
  assert.equal(devices[0]?.name, "Home PC");
  assert.equal(devices[0]?.targetFolder, "/Photos");
});

test("selectDevice updates only the selected device target folder", () => {
  const first = createDevice({ name: "Home", baseUrl: "127.0.0.1:48731" });
  const second = createDevice({ name: "Office", baseUrl: "192.168.1.2:48731" });

  const selected = selectDevice([first, second], second.id, "/Work");

  assert.equal(selected.currentDevice?.id, second.id);
  assert.equal(selected.devices[0]?.targetFolder, "/");
  assert.equal(selected.devices[1]?.targetFolder, "/Work");
});

test("findDeviceById resolves encoded device URL ids", () => {
  const device = createDevice({ name: "Home", baseUrl: "127.0.0.1:48731" });

  assert.equal(findDeviceById([device], "http%3A%2F%2F127.0.0.1%3A48731")?.id, device.id);
});
