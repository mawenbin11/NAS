import { normalizeAgentBaseUrl, type AgentHealthResult } from "../../services/agent-client.js";

type DevicePageData = {
  agentBaseUrl: string;
  normalizedBaseUrl: string;
  checking: boolean;
  online: boolean;
  statusText: string;
  dataDir: string;
  error: string;
};

Page<DevicePageData, WechatMiniprogram.IAnyObject>({
  data: {
    agentBaseUrl: "127.0.0.1:48731",
    normalizedBaseUrl: "",
    checking: false,
    online: false,
    statusText: "未检测",
    dataDir: "",
    error: "",
  },

  onAgentBaseUrlInput(event: WechatMiniprogram.InputEvent) {
    this.setData({
      agentBaseUrl: String(event.detail.value ?? ""),
    });
  },

  async onCheckConnection() {
    const baseUrl = normalizeAgentBaseUrl(this.data.agentBaseUrl);

    this.setData({
      checking: true,
      normalizedBaseUrl: baseUrl,
      error: "",
    });

    try {
      const result = await requestAgentHealth(baseUrl);

      this.setData({
        checking: false,
        online: result.online,
        statusText: result.online ? "电脑端在线" : "电脑端离线",
        dataDir: result.dataDir ?? "",
        error: result.error ?? "",
      });
    } catch (error) {
      this.setData({
        checking: false,
        online: false,
        statusText: "电脑端离线",
        dataDir: "",
        error: error instanceof Error ? error.message : "连接失败",
      });
    }
  },
});

function requestAgentHealth(baseUrl: string): Promise<AgentHealthResult> {
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

        const body = response.data as { status?: string; dataDir?: string; metadataDir?: string };

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
