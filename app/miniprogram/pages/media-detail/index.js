const { listMedia, mediaFileUrl } = require("../../services/media-client");

Page({
  data: {
    loading: true,
    error: "",
    item: null,
    fileUrl: "",
  },

  onLoad(options) {
    const id = options && options.id;
    const folder = (options && options.folder) || "";
    const deviceId = (options && options.deviceId) || wx.getStorageSync("currentDeviceId") || "";
    const devices = wx.getStorageSync("devices") || [];
    const device = devices.find((entry) => entry.id === deviceId) || null;
    const agentBaseUrl = device ? device.baseUrl : wx.getStorageSync("agentBaseUrl") || "";

    if (!id || !agentBaseUrl) {
      this.setData({
        loading: false,
        error: "缺少文件或电脑端连接信息。",
      });
      return;
    }

    listMedia(agentBaseUrl, folder || undefined)
      .then((items) => {
        const item = items.find((entry) => entry.id === id);

        if (!item) {
          this.setData({
            loading: false,
            error: "未找到文件记录。",
          });
          return;
        }

        this.setData({
          loading: false,
          item,
          fileUrl: mediaFileUrl(agentBaseUrl, item.id),
          error: "",
        });
      })
      .catch((error) => {
        this.setData({
          loading: false,
          error: error.message || "加载失败",
        });
      });
  },
});
