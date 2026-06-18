const { addOrUpdateDevice, createDevice } = require("../../services/device-store");

Page({
  data: {
    devices: [],
    currentDeviceId: "",
    name: "当前电脑",
    baseUrl: "127.0.0.1:48731",
    error: "",
  },

  onShow() {
    this.loadDevices();
  },

  loadDevices() {
    this.setData({
      devices: wx.getStorageSync("devices") || [],
      currentDeviceId: wx.getStorageSync("currentDeviceId") || "",
    });
  },

  onNameInput(event) {
    this.setData({ name: String((event.detail && event.detail.value) || "") });
  },

  onBaseUrlInput(event) {
    this.setData({ baseUrl: String((event.detail && event.detail.value) || "") });
  },

  onAddDevice() {
    try {
      const device = createDevice({
        name: this.data.name,
        baseUrl: this.data.baseUrl,
      });
      const devices = addOrUpdateDevice(this.data.devices, device);

      wx.setStorageSync("devices", devices);
      wx.setStorageSync("currentDeviceId", device.id);
      wx.setStorageSync("agentBaseUrl", device.baseUrl);
      wx.setStorageSync("targetFolder", device.targetFolder);

      this.setData({
        devices,
        currentDeviceId: device.id,
        error: "",
      });
    } catch (error) {
      this.setData({
        error: error.message || "添加失败",
      });
    }
  },

  onOpenDevice(event) {
    const id = event.currentTarget.dataset.id;

    if (!id) {
      return;
    }

    wx.navigateTo({
      url: `/pages/device-detail/index?id=${encodeURIComponent(id)}`,
    });
  },
});
