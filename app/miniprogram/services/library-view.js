const { mediaFileUrl } = require("./media-client");

function buildLibraryItems(baseUrl, items) {
  return items.map((item) => ({
    ...item,
    isPhoto: item.fileType === "photo",
    previewUrl: item.fileType === "photo" ? mediaFileUrl(baseUrl, item.id) : "",
  }));
}

module.exports = {
  buildLibraryItems,
};
