export type AgentHealthResult = {
  online: boolean;
  baseUrl: string;
  dataDir?: string;
  metadataDir?: string;
  error?: string;
};

type AgentHealthResponse = {
  status: string;
  dataDir: string;
  metadataDir: string;
};

export function normalizeAgentBaseUrl(input: string): string {
  const trimmed = input.trim().replace(/\/+$/g, "");
  const withScheme = /^https?:\/\//i.test(trimmed) ? trimmed : `http://${trimmed}`;

  return withScheme.replace(/\/+$/g, "");
}

export async function checkAgentHealth(input: string): Promise<AgentHealthResult> {
  const baseUrl = normalizeAgentBaseUrl(input);

  try {
    const response = await fetch(`${baseUrl}/health`);

    if (!response.ok) {
      return {
        online: false,
        baseUrl,
        error: `Agent returned HTTP ${response.status}`,
      };
    }

    const body = (await response.json()) as AgentHealthResponse;

    return {
      online: body.status === "ok",
      baseUrl,
      dataDir: body.dataDir,
      metadataDir: body.metadataDir,
    };
  } catch (error) {
    return {
      online: false,
      baseUrl,
      error: error instanceof Error ? error.message : "Unable to reach agent",
    };
  }
}
