import type { MediaItem } from "./media-client.js";
import { mediaFileUrl } from "./media-client.js";

export type LibraryItem = MediaItem & {
  isPhoto: boolean;
  previewUrl: string;
};

export function buildLibraryItems(baseUrl: string, items: MediaItem[]): LibraryItem[] {
  return items.map((item) => ({
    ...item,
    isPhoto: item.fileType === "photo",
    previewUrl: item.fileType === "photo" ? mediaFileUrl(baseUrl, item.id) : "",
  }));
}
