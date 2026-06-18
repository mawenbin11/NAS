const { listMedia } = require("../../services/media-client");
const { buildLibraryItems } = require("../../services/library-view");
const { mediaDetailUrl } = require("../../services/flow-routes");

Page({
  data: {
    agentBaseUrl: "",
    deviceId: "",
    loading: false,
    items: [],
    previewMode: "large",
    error: "",
  },

  onShow() {
    const currentDeviceId = wx.getStorageSync("currentDeviceId") || "";
    const devices = wx.getStorageSync("devices") || [];
    const currentDevice = devices.find((device) => device.id === currentDeviceId);
    const agentBaseUrl = currentDevice ? currentDevice.baseUrl : wx.getStorageSync("agentBaseUrl") || "";

    this.setData({ agentBaseUrl, deviceId: currentDeviceId });

    if (agentBaseUrl) {
      this.loadMedia();
    }
  },

  loadMedia() {
    const agentBaseUrl = this.data.agentBaseUrl;

    if (!agentBaseUrl) {
      this.setData({
        error: "请先在首页选择在线电脑。",
        items: [],
      });
      return;
    }

    this.setData({
      loading: true,
      error: "",
    });

    listMedia(agentBaseUrl)
      .then((items) => {
        this.setData({
          loading: false,
          items: buildLibraryItems(agentBaseUrl, items),
          error: "",
        });
      })
      .catch((error) => {
        this.setData({
          loading: false,
          items: [],
          error: error.message || "加载失败",
        });
      });
  },

  onChangePreviewMode(event) {
    const mode = event.currentTarget.dataset.mode;

    if (!mode) {
      return;
    }

    this.setData({
      previewMode: mode,
    });
  },

  onOpenItem(event) {
    const id = event.currentTarget.dataset.id;

    if (!id) {
      return;
    }

    wx.navigateTo({
      url: mediaDetailUrl(id, this.data.deviceId),
    });
  },
});
