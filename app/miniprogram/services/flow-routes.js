function folderPickerUrl(deviceId, path) {
  return `/pages/folder-picker/index?deviceId=${encodeURIComponent(deviceId)}&path=${encodeURIComponent(path || "/")}`;
}

function folderActionsUrl(deviceId, folder) {
  return `/pages/folder-actions/index?deviceId=${encodeURIComponent(deviceId)}&folder=${encodeURIComponent(folder || "/")}`;
}

function mediaDetailUrl(id, deviceId, folder) {
  const params = [`id=${encodeURIComponent(id)}`];

  if (deviceId) {
    params.push(`deviceId=${encodeURIComponent(deviceId)}`);
  }

  if (folder) {
    params.push(`folder=${encodeURIComponent(folder)}`);
  }

  return `/pages/media-detail/index?${params.join("&")}`;
}

module.exports = {
  folderActionsUrl,
  folderPickerUrl,
  mediaDetailUrl,
};
