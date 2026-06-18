const { mediaFileUrl } = require("./media-client");

function buildLibraryItems(baseUrl, items) {
  return items.map((item) => ({
    ...item,
    isPhoto: item.fileType === "photo",
    previewUrl: item.fileType === "photo" ? mediaFileUrl(baseUrl, item.id) : "",
  }));
}

function sortLibraryItems(items, sortMode) {
  return [...items].sort((left, right) => {
    if (sortMode === "time-asc") {
      return Date.parse(left.uploadedAt) - Date.parse(right.uploadedAt);
    }

    if (sortMode === "size-desc") {
      return right.size - left.size;
    }

    if (sortMode === "size-asc") {
      return left.size - right.size;
    }

    return Date.parse(right.uploadedAt) - Date.parse(left.uploadedAt);
  });
}

module.exports = {
  buildLibraryItems,
  sortLibraryItems,
};
