export function folderPickerUrl(deviceId: string, path = "/"): string {
  return `/pages/folder-picker/index?deviceId=${encodeURIComponent(deviceId)}&path=${encodeURIComponent(path)}`;
}

export function folderActionsUrl(deviceId: string, folder = "/"): string {
  return `/pages/folder-actions/index?deviceId=${encodeURIComponent(deviceId)}&folder=${encodeURIComponent(folder)}`;
}

export function mediaDetailUrl(id: string, deviceId?: string, folder?: string): string {
  const params = [`id=${encodeURIComponent(id)}`];

  if (deviceId) {
    params.push(`deviceId=${encodeURIComponent(deviceId)}`);
  }

  if (folder) {
    params.push(`folder=${encodeURIComponent(folder)}`);
  }

  return `/pages/media-detail/index?${params.join("&")}`;
}
