Page({
  data: {
    id: "",
    device: null,
    checking: false,
    statusText: "未检测",
    error: "",
  },

  onLoad(options) {
    this.setData({ id: options.id || "" });
  },

  onShow() {
    this.loadDevice();
  },

  loadDevice() {
    const devices = wx.getStorageSync("devices") || [];
    const device = devices.find((item) => item.id === this.data.id) || null;

    this.setData({ device });
  },

  onCheckConnection() {
    const device = this.data.device;

    if (!device) {
      return;
    }

    this.setData({ checking: true, error: "" });

    wx.request({
      url: `${device.baseUrl}/health`,
      method: "GET",
      success: (response) => {
        const online = response.statusCode === 200 && response.data && response.data.status === "ok";
        this.setData({
          checking: false,
          statusText: online ? "电脑端在线" : `检测失败：HTTP ${response.statusCode}`,
        });
      },
      fail: (error) => {
        this.setData({
          checking: false,
          statusText: "电脑端离线",
          error: error.errMsg,
        });
      },
    });
  },

  onSetCurrent() {
    const device = this.data.device;

    if (!device) {
      return;
    }

    wx.setStorageSync("currentDeviceId", device.id);
    wx.setStorageSync("agentBaseUrl", device.baseUrl);
    wx.setStorageSync("targetFolder", device.targetFolder);
    this.setData({ statusText: "已设为当前电脑" });
  },

  onChooseFolder() {
    const device = this.data.device;

    if (!device) {
      return;
    }

    wx.navigateTo({
      url: `/pages/folder-picker/index?deviceId=${encodeURIComponent(device.id)}&path=${encodeURIComponent(device.targetFolder || "/")}`,
    });
  },
});
