const { buildLibraryItems } = require("../../services/library-view");
const { listMedia, uploadMediaBase64 } = require("../../services/media-client");
const { mediaDetailUrl } = require("../../services/flow-routes");

Page({
  data: {
    deviceId: "",
    device: null,
    folder: "/",
    loading: false,
    uploading: false,
    message: "",
    error: "",
    previewPath: "",
    previewType: "",
    previewName: "",
    selectedFile: null,
    previewMode: "large",
    items: [],
  },

  onLoad(options) {
    this.setData({
      deviceId: options.deviceId || "",
      folder: options.folder || "/",
    });
  },

  onShow() {
    this.loadDevice();
    this.loadMedia();
  },

  loadDevice() {
    const devices = wx.getStorageSync("devices") || [];
    const device = devices.find((item) => item.id === this.data.deviceId) || null;

    this.setData({ device });
    return device;
  },

  loadMedia() {
    const device = this.data.device || findDevice(this.data.deviceId);

    if (!device) {
      this.setData({
        loading: false,
        items: [],
        error: "未找到电脑",
      });
      return;
    }

    this.setData({ loading: true, error: "" });

    listMedia(device.baseUrl, this.data.folder || "/")
      .then((items) => {
        this.setData({
          loading: false,
          device,
          items: buildLibraryItems(device.baseUrl, items),
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

  onChooseMedia() {
    if (!this.data.device && !findDevice(this.data.deviceId)) {
      this.setData({
        error: "请先选择在线电脑",
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
    const device = this.data.device || findDevice(this.data.deviceId);
    const file = this.data.selectedFile;

    if (!device) {
      this.setData({
        error: "请先选择在线电脑",
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

    this.uploadTempFile(device, file);
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

  uploadTempFile(device, file) {
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

        uploadMediaBase64(device.baseUrl, {
          originalName: fileName,
          mimeType,
          contentBase64: readResult.data,
          uploadedAt: new Date().toISOString(),
          targetFolder: this.data.folder || "/",
        })
          .then((record) => {
            this.setData({
              uploading: false,
              previewPath: "",
              previewType: "",
              previewName: "",
              selectedFile: null,
              message: `上传成功：${record.originalName}`,
              error: "",
            });
            this.loadMedia();
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

  onChangePreviewMode(event) {
    const mode = event.currentTarget.dataset.mode;

    if (!mode) {
      return;
    }

    this.setData({ previewMode: mode });
  },

  onOpenItem(event) {
    const id = event.currentTarget.dataset.id;

    if (!id) {
      return;
    }

    wx.navigateTo({
      url: mediaDetailUrl(id, this.data.deviceId, this.data.folder || "/"),
    });
  },
});

function findDevice(deviceId) {
  const devices = wx.getStorageSync("devices") || [];
  return devices.find((item) => item.id === deviceId) || null;
}

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
