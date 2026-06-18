import { normalizeAgentBaseUrl } from "./agent-client.js";

export type MiniNasDevice = {
  id: string;
  name: string;
  baseUrl: string;
  targetFolder: string;
};

export type CreateDeviceInput = {
  name: string;
  baseUrl: string;
};

export function createDevice(input: CreateDeviceInput): MiniNasDevice {
  const baseUrl = normalizeAgentBaseUrl(input.baseUrl);

  return {
    id: baseUrl,
    name: input.name.trim() || baseUrl,
    baseUrl,
    targetFolder: "/",
  };
}

export function addOrUpdateDevice(devices: MiniNasDevice[], device: MiniNasDevice): MiniNasDevice[] {
  const existing = devices.filter((item) => item.id !== device.id);

  return [...existing, device];
}

export function selectDevice(
  devices: MiniNasDevice[],
  deviceId: string,
  targetFolder?: string,
): { devices: MiniNasDevice[]; currentDevice: MiniNasDevice | null } {
  let currentDevice: MiniNasDevice | null = null;
  const updatedDevices = devices.map((device) => {
    if (device.id !== deviceId) {
      return device;
    }

    currentDevice = {
      ...device,
      targetFolder: targetFolder ?? device.targetFolder,
    };
    return currentDevice;
  });

  return { devices: updatedDevices, currentDevice };
}

export function findDeviceById(devices: MiniNasDevice[], deviceId: string): MiniNasDevice | null {
  const candidates = new Set([deviceId]);

  try {
    candidates.add(decodeURIComponent(deviceId));
  } catch {
    // Keep the original id if it is not URL-encoded.
  }

  return devices.find((device) => candidates.has(device.id) || candidates.has(device.baseUrl)) ?? null;
}
