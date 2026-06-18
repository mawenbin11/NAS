const { checkAgentHealth } = require("../../services/agent-client");
const { addOrUpdateDevice, createDevice } = require("../../services/device-store");
const { folderActionsUrl } = require("../../services/flow-routes");

Page({
  data: {
    devices: [],
    onlineById: {},
    checking: false,
    name: "当前电脑",
    baseUrl: "127.0.0.1:48731",
    error: "",
  },

  onShow() {
    this.loadDevices();
    this.refreshDeviceStatuses();
  },

  loadDevices() {
    this.setData({
      devices: wx.getStorageSync("devices") || [],
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

      this.setData({
        devices,
        error: "",
      });
      this.refreshDeviceStatuses();
    } catch (error) {
      this.setData({
        error: error.message || "添加失败",
      });
    }
  },

  refreshDeviceStatuses() {
    const devices = this.data.devices || [];

    if (devices.length === 0) {
      this.setData({ onlineById: {}, checking: false });
      return;
    }

    this.setData({ checking: true });

    Promise.all(
      devices.map((device) =>
        checkAgentHealth(device.baseUrl).then((result) => ({
          id: device.id,
          online: result.online,
        })),
      ),
    )
      .then((results) => {
        const onlineById = {};
        results.forEach((result) => {
          onlineById[result.id] = result.online;
        });
        this.setData({ onlineById, checking: false });
      })
      .catch(() => {
        this.setData({ checking: false });
      });
  },

  onOpenDevice(event) {
    const id = event.currentTarget.dataset.id;

    if (!id) {
      return;
    }

    if (!this.data.onlineById[id]) {
      wx.showToast({
        title: "电脑离线",
        icon: "none",
      });
      return;
    }

    const device = (this.data.devices || []).find((item) => item.id === id);

    wx.setStorageSync("currentDeviceId", id);
    if (device) {
      wx.setStorageSync("agentBaseUrl", device.baseUrl);
      wx.setStorageSync("targetFolder", device.targetFolder || "/");
    }

    wx.navigateTo({
      url: folderActionsUrl(id, device ? device.targetFolder || "/" : "/"),
    });
  },
});
