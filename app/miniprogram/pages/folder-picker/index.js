Page({
  data: {
    deviceId: "",
    device: null,
    currentPath: "/",
    folders: [],
    error: "",
  },

  onLoad(options) {
    this.setData({
      deviceId: options.deviceId || "",
      currentPath: options.path || "/",
    });
  },

  onShow() {
    this.loadDeviceAndFolders();
  },

  loadDeviceAndFolders() {
    const devices = wx.getStorageSync("devices") || [];
    const device = devices.find((item) => item.id === this.data.deviceId) || null;

    this.setData({ device });

    if (!device) {
      this.setData({ error: "未找到电脑" });
      return;
    }

    wx.request({
      url: `${device.baseUrl}/folders?path=${encodeURIComponent(this.data.currentPath)}`,
      method: "GET",
      success: (response) => {
        if (response.statusCode !== 200) {
          this.setData({ error: `加载失败：HTTP ${response.statusCode}` });
          return;
        }

        this.setData({
          folders: (response.data && response.data.folders) || [],
          error: "",
        });
      },
      fail: (error) => {
        this.setData({ error: error.errMsg });
      },
    });
  },

  onOpenFolder(event) {
    const path = event.currentTarget.dataset.path;

    if (!path) {
      return;
    }

    this.setData({ currentPath: path });
    this.loadDeviceAndFolders();
  },

  onGoParent() {
    const parts = this.data.currentPath.split("/").filter(Boolean);
    parts.pop();
    this.setData({ currentPath: parts.length ? `/${parts.join("/")}` : "/" });
    this.loadDeviceAndFolders();
  },

  onSelectCurrent() {
    const devices = wx.getStorageSync("devices") || [];
    const updatedDevices = devices.map((device) =>
      device.id === this.data.deviceId ? { ...device, targetFolder: this.data.currentPath } : device,
    );
    const selected = updatedDevices.find((device) => device.id === this.data.deviceId);

    wx.setStorageSync("devices", updatedDevices);
    wx.setStorageSync("currentDeviceId", this.data.deviceId);

    if (selected) {
      wx.setStorageSync("agentBaseUrl", selected.baseUrl);
      wx.setStorageSync("targetFolder", selected.targetFolder);
    }

    wx.navigateBack();
  },
});
