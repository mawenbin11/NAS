export type MediaItem = {
  id: string;
  originalName: string;
  relativePath: string;
  fileType: "photo" | "video";
  mimeType: string;
  size: number;
  uploadedAt: string;
};

export type UploadMediaBase64Input = {
  originalName: string;
  mimeType: string;
  contentBase64: string;
  uploadedAt?: string;
};

export async function listMedia(baseUrl: string): Promise<MediaItem[]> {
  const response = await fetch(`${baseUrl}/media`);

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  const body = (await response.json()) as { items?: MediaItem[] };

  return body.items ?? [];
}

export async function uploadMediaBase64(
  baseUrl: string,
  input: UploadMediaBase64Input,
): Promise<MediaItem> {
  const response = await fetch(`${baseUrl}/media`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({
      ...input,
      sourceDevice: "wechat-mini-program",
    }),
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  return (await response.json()) as MediaItem;
}
