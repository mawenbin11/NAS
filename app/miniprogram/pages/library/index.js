const { listMedia } = require("../../services/media-client");

Page({
  data: {
    agentBaseUrl: "",
    loading: false,
    items: [],
    error: "",
  },

  onShow() {
    const agentBaseUrl = wx.getStorageSync("agentBaseUrl") || "";

    this.setData({ agentBaseUrl });

    if (agentBaseUrl) {
      this.loadMedia();
    }
  },

  loadMedia() {
    const agentBaseUrl = this.data.agentBaseUrl;

    if (!agentBaseUrl) {
      this.setData({
        error: "请先在“设备”页检测连接。",
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
          items,
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

  onOpenItem(event) {
    const id = event.currentTarget.dataset.id;

    if (!id) {
      return;
    }

    wx.navigateTo({
      url: `/pages/media-detail/index?id=${encodeURIComponent(id)}`,
    });
  },
});
