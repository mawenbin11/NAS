import type { MediaItem } from "./media-client.js";
import { mediaFileUrl } from "./media-client.js";

export type LibraryItem = MediaItem & {
  isPhoto: boolean;
  previewUrl: string;
};

export type LibrarySortMode = "time-desc" | "time-asc" | "size-desc" | "size-asc";

export function buildLibraryItems(baseUrl: string, items: MediaItem[]): LibraryItem[] {
  return items.map((item) => ({
    ...item,
    isPhoto: item.fileType === "photo",
    previewUrl: item.fileType === "photo" ? mediaFileUrl(baseUrl, item.id) : "",
  }));
}

export function sortLibraryItems(items: LibraryItem[], sortMode: LibrarySortMode): LibraryItem[] {
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
