const { normalizeAgentBaseUrl } = require("../../services/agent-client");

Page({
  data: {
    agentBaseUrl: "127.0.0.1:48731",
    normalizedBaseUrl: "",
    checking: false,
    online: false,
    statusText: "未检测",
    dataDir: "",
    error: "",
  },

  onAgentBaseUrlInput(event) {
    this.setData({
      agentBaseUrl: String((event.detail && event.detail.value) || ""),
    });
  },

  onCheckConnection() {
    const baseUrl = normalizeAgentBaseUrl(this.data.agentBaseUrl);

    this.setData({
      checking: true,
      normalizedBaseUrl: baseUrl,
      error: "",
    });

    requestAgentHealth(baseUrl).then((result) => {
      this.setData({
        checking: false,
        online: result.online,
        statusText: result.online ? "电脑端在线" : "电脑端离线",
        dataDir: result.dataDir || "",
        error: result.error || "",
      });
      if (result.online) {
        wx.setStorageSync("agentBaseUrl", baseUrl);
      }
    });
  },
});

function requestAgentHealth(baseUrl) {
  return new Promise((resolve) => {
    wx.request({
      url: `${baseUrl}/health`,
      method: "GET",
      success(response) {
        if (response.statusCode !== 200) {
          resolve({
            online: false,
            baseUrl,
            error: `HTTP ${response.statusCode}`,
          });
          return;
        }

        const body = response.data || {};

        resolve({
          online: body.status === "ok",
          baseUrl,
          dataDir: body.dataDir,
          metadataDir: body.metadataDir,
        });
      },
      fail(error) {
        resolve({
          online: false,
          baseUrl,
          error: error.errMsg,
        });
      },
    });
  });
}
