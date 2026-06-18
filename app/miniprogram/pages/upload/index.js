const { uploadMediaBase64 } = require("../../services/media-client");

Page({
  data: {
    agentBaseUrl: "",
    uploading: false,
    message: "",
    error: "",
  },

  onShow() {
    this.setData({
      agentBaseUrl: wx.getStorageSync("agentBaseUrl") || "",
    });
  },

  onChooseAndUpload() {
    const agentBaseUrl = this.data.agentBaseUrl;

    if (!agentBaseUrl) {
      this.setData({
        error: "请先在“设备”页检测连接。",
        message: "",
      });
      return;
    }

    wx.chooseMedia({
      count: 1,
      mediaType: ["image", "video"],
      sourceType: ["album", "camera"],
      success: (chooseResult) => {
        const file = chooseResult.tempFiles && chooseResult.tempFiles[0];

        if (!file) {
          return;
        }

        this.uploadTempFile(agentBaseUrl, file);
      },
      fail: (error) => {
        this.setData({
          error: error.errMsg || "选择文件失败",
          message: "",
        });
      },
    });
  },

  uploadTempFile(agentBaseUrl, file) {
    this.setData({
      uploading: true,
      error: "",
      message: "正在读取文件...",
    });

    const filePath = file.tempFilePath;
    const fileName = filePath.split(/[\\/]/).pop() || "media";

    wx.getFileSystemManager().readFile({
      filePath,
      encoding: "base64",
      success: (readResult) => {
        const mimeType = detectMimeType(filePath, file.fileType);

        uploadMediaBase64(agentBaseUrl, {
          originalName: fileName,
          mimeType,
          contentBase64: readResult.data,
          uploadedAt: new Date().toISOString(),
        })
          .then((record) => {
            this.setData({
              uploading: false,
              message: `上传成功：${record.originalName}`,
              error: "",
            });
          })
          .catch((error) => {
            this.setData({
              uploading: false,
              message: "",
              error: error.message || "上传失败",
            });
          });
      },
      fail: (error) => {
        this.setData({
          uploading: false,
          message: "",
          error: error.errMsg || "读取文件失败",
        });
      },
    });
  },
});

function detectMimeType(filePath, fileType) {
  const lower = filePath.toLowerCase();

  if (fileType === "video" || lower.endsWith(".mp4")) {
    return "video/mp4";
  }

  if (lower.endsWith(".png")) {
    return "image/png";
  }

  return "image/jpeg";
}
