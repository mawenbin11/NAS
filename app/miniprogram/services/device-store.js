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

module.exports = {
  addOrUpdateDevice,
  createDevice,
  selectDevice,
};
