function normalizeAgentBaseUrl(input) {
  const trimmed = input.trim().replace(/\/+$/g, "");
  const withScheme = /^https?:\/\//i.test(trimmed) ? trimmed : `http://${trimmed}`;

  return withScheme.replace(/\/+$/g, "");
}

module.exports = {
  normalizeAgentBaseUrl,
};
