function listMedia(baseUrl, folder) {
  const url = folder ? `${baseUrl}/media?folder=${encodeURIComponent(folder)}` : `${baseUrl}/media`;

  return requestJson({
    url,
    method: "GET",
  }).then((body) => body.items || []);
}

function uploadMediaBase64(baseUrl, input) {
  return requestJson({
    url: `${baseUrl}/media`,
    method: "POST",
    data: Object.assign({}, input, {
      sourceDevice: "wechat-mini-program",
    }),
  });
}

function mediaFileUrl(baseUrl, mediaId) {
  return `${baseUrl}/media/${encodeURIComponent(mediaId)}/file`;
}

function requestJson(options) {
  return new Promise((resolve, reject) => {
    wx.request({
      url: options.url,
      method: options.method,
      data: options.data,
      header: {
        "content-type": "application/json",
      },
      success(response) {
        if (response.statusCode < 200 || response.statusCode >= 300) {
          reject(new Error(`HTTP ${response.statusCode}`));
          return;
        }

        resolve(response.data || {});
      },
      fail(error) {
        reject(new Error(error.errMsg || "request failed"));
      },
    });
  });
}

module.exports = {
  listMedia,
  mediaFileUrl,
  uploadMediaBase64,
};
