const { folderActionsUrl } = require("../../services/flow-routes");
const { findDeviceById } = require("../../services/device-store");

Page({
  data: {
    deviceId: "",
    device: null,
    currentPath: "/",
    folders: [],
    error: "",
    loading: false,
    opening: false,
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
    const device = findDevice(this.data.deviceId);

    this.setData({ device });

    if (!device) {
      this.setData({ error: "未找到电脑，请返回首页重新选择。", folders: [], loading: false });
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
    const device = findDevice(this.data.deviceId);

    if (this.data.opening) {
      return;
    }

    if (!device) {
      this.setData({ error: "未找到电脑，请返回首页重新选择。" });
      wx.showToast({
        title: "未找到电脑",
        icon: "none",
      });
      return;
    }

    this.setData({ opening: true, device, error: "" });

    const devices = wx.getStorageSync("devices") || [];
    const updatedDevices = devices.map((item) =>
      item.id === this.data.deviceId ? { ...item, targetFolder: this.data.currentPath } : item,
    );

    wx.setStorageSync("devices", updatedDevices);
    wx.setStorageSync("currentDeviceId", this.data.deviceId);
    wx.setStorageSync("agentBaseUrl", device.baseUrl);
    wx.setStorageSync("targetFolder", this.data.currentPath);

    wx.redirectTo({
      url: folderActionsUrl(this.data.deviceId, this.data.currentPath),
      fail: (error) => {
        this.setData({
          opening: false,
          error: error.errMsg || "进入文件夹失败",
        });
        wx.showToast({
          title: "进入失败",
          icon: "none",
        });
      },
    });
  },
});

function findDevice(deviceId) {
  const devices = wx.getStorageSync("devices") || [];
  return findDeviceById(devices, deviceId);
}
