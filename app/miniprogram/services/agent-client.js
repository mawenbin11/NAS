function normalizeAgentBaseUrl(input) {
  const trimmed = input.trim().replace(/\/+$/g, "");
  const withScheme = /^https?:\/\//i.test(trimmed) ? trimmed : `http://${trimmed}`;

  return withScheme.replace(/\/+$/g, "");
}

function checkAgentHealth(input) {
  const baseUrl = normalizeAgentBaseUrl(input);

  return requestJson(`${baseUrl}/health`)
    .then((body) => ({
      online: body.status === "ok",
      baseUrl,
      dataDir: body.dataDir,
      metadataDir: body.metadataDir,
    }))
    .catch((error) => ({
      online: false,
      baseUrl,
      error: error.message || "Unable to reach agent",
    }));
}

function requestJson(url) {
  return new Promise((resolve, reject) => {
    wx.request({
      url,
      method: "GET",
      success(response) {
        if (response.statusCode < 200 || response.statusCode >= 300) {
          reject(new Error(`Agent returned HTTP ${response.statusCode}`));
          return;
        }

        resolve(response.data || {});
      },
      fail(error) {
        reject(new Error(error.errMsg || "Unable to reach agent"));
      },
    });
  });
}

module.exports = {
  checkAgentHealth,
  normalizeAgentBaseUrl,
};
