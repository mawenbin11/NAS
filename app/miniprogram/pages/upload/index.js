const { uploadMediaBase64 } = require("../../services/media-client");

Page({
  data: {
    agentBaseUrl: "",
    uploading: false,
    message: "",
    error: "",
    previewPath: "",
    previewType: "",
    previewName: "",
    selectedFile: null,
  },

  onShow() {
    this.setData({
      agentBaseUrl: wx.getStorageSync("agentBaseUrl") || "",
    });
  },

  onChooseMedia() {
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

        const filePath = file.tempFilePath;
        const fileName = filePath.split(/[\\/]/).pop() || "media";
        const previewType = file.fileType === "video" ? "video" : "image";

        this.setData({
          previewPath: filePath,
          previewType,
          previewName: fileName,
          selectedFile: file,
          message: "已选择文件，请确认上传。",
          error: "",
        });
      },
      fail: (error) => {
        this.setData({
          error: error.errMsg || "选择文件失败",
          message: "",
        });
      },
    });
  },

  onConfirmUpload() {
    const agentBaseUrl = this.data.agentBaseUrl;
    const file = this.data.selectedFile;

    if (!agentBaseUrl) {
      this.setData({
        error: "请先在“设备”页检测连接。",
        message: "",
      });
      return;
    }

    if (!file) {
      this.setData({
        error: "请先选择照片或视频。",
        message: "",
      });
      return;
    }

    this.uploadTempFile(agentBaseUrl, file);
  },

  onCancelSelection() {
    this.setData({
      previewPath: "",
      previewType: "",
      previewName: "",
      selectedFile: null,
      message: "已取消选择。",
      error: "",
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
