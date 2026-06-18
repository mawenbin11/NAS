const { normalizeAgentBaseUrl } = require("./agent-client");

function createDevice(input) {
  const baseUrl = normalizeAgentBaseUrl(input.baseUrl);

  return {
    id: baseUrl,
    name: input.name.trim() || baseUrl,
    baseUrl,
    targetFolder: "/",
  };
}

function addOrUpdateDevice(devices, device) {
  const existing = devices.filter((item) => item.id !== device.id);

  return [...existing, device];
}

function selectDevice(devices, deviceId, targetFolder) {
  let currentDevice = null;
  const updatedDevices = devices.map((device) => {
    if (device.id !== deviceId) {
      return device;
    }

    currentDevice = {
      ...device,
      targetFolder: targetFolder || device.targetFolder,
    };
    return currentDevice;
  });

  return { devices: updatedDevices, currentDevice };
}

function findDeviceById(devices, deviceId) {
  const candidates = new Set([deviceId]);

  try {
    candidates.add(decodeURIComponent(deviceId));
  } catch {
    // Keep the original id if it is not URL-encoded.
  }

  return devices.find((device) => candidates.has(device.id) || candidates.has(device.baseUrl)) || null;
}

module.exports = {
  addOrUpdateDevice,
  createDevice,
  findDeviceById,
  selectDevice,
};
