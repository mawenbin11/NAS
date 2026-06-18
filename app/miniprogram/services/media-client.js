function listMedia(baseUrl) {
  return requestJson({
    url: `${baseUrl}/media`,
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
  uploadMediaBase64,
};
