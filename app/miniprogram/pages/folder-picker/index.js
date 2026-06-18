const { folderActionsUrl } = require("../../services/flow-routes");

Page({
  data: {
    deviceId: "",
    device: null,
    currentPath: "/",
    folders: [],
    error: "",
    loading: false,
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
      this.setData({ error: "未找到电脑", folders: [], loading: false });
      return;
    }

    this.setData({ loading: true, error: "" });

    wx.request({
      url: `${device.baseUrl}/folders?path=${encodeURIComponent(this.data.currentPath)}`,
      method: "GET",
      success: (response) => {
        if (response.statusCode !== 200) {
          this.setData({
            loading: false,
            folders: [],
            error: `加载失败：HTTP ${response.statusCode}`,
          });
          return;
        }

        this.setData({
          loading: false,
          folders: (response.data && response.data.folders) || [],
          error: "",
        });
      },
      fail: (error) => {
        this.setData({
          loading: false,
          folders: [],
          error: error.errMsg,
        });
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

  onUseCurrentFolder() {
    const device = this.data.device;

    if (!device) {
      return;
    }

    const devices = wx.getStorageSync("devices") || [];
    const updatedDevices = devices.map((item) =>
      item.id === this.data.deviceId ? { ...item, targetFolder: this.data.currentPath } : item,
    );

    wx.setStorageSync("devices", updatedDevices);
    wx.setStorageSync("currentDeviceId", this.data.deviceId);
    wx.setStorageSync("agentBaseUrl", device.baseUrl);
    wx.setStorageSync("targetFolder", this.data.currentPath);

    wx.navigateTo({
      url: folderActionsUrl(this.data.deviceId, this.data.currentPath),
    });
  },
});
