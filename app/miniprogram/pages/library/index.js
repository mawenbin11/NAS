const { listMedia } = require("../../services/media-client");
const { buildLibraryItems } = require("../../services/library-view");

Page({
  data: {
    agentBaseUrl: "",
    loading: false,
    items: [],
    previewMode: "large",
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
      url: `/pages/media-detail/index?id=${encodeURIComponent(id)}`,
    });
  },
});
