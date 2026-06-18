import { createHash, randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import { DatabaseSync } from "node:sqlite";
import path from "node:path";

import type { AgentConfig } from "./config.js";
import { resolveStoragePath } from "./config.js";

export type MediaFileType = "photo" | "video";

export type SaveMediaInput = {
  originalName: string;
  mimeType: string;
  content: Buffer;
  uploadedAt: Date;
  sourceDevice: string;
};

export type MediaRecord = {
  id: string;
  originalName: string;
  relativePath: string;
  fileType: MediaFileType;
  mimeType: string;
  size: number;
  hash: string;
  uploadedAt: string;
  sourceDevice: string;
};

export type MediaStore = {
  saveMedia: (input: SaveMediaInput) => Promise<MediaRecord>;
  listMedia: () => Promise<MediaRecord[]>;
  getMedia: (id: string) => Promise<MediaRecord | null>;
};

export function createMediaStore(config: AgentConfig): MediaStore {
  return {
    saveMedia: (input) => saveMedia(config, input),
    listMedia: () => listMedia(config),
    getMedia: (id) => getMedia(config, id),
  };
}

async function saveMedia(config: AgentConfig, input: SaveMediaInput): Promise<MediaRecord> {
  const fileType = detectFileType(input.mimeType);
  const relativeDir = dateDirectory(input.uploadedAt);
  const extension = safeExtension(input.originalName, input.mimeType);
  const fileName = `${input.uploadedAt.toISOString().replace(/[:.]/g, "-")}-${randomUUID()}${extension}`;
  const relativePath = path.join(relativeDir, fileName);
  const targetPath = resolveStoragePath(config, relativePath);
  const record: MediaRecord = {
    id: randomUUID(),
    originalName: input.originalName,
    relativePath,
    fileType,
    mimeType: input.mimeType,
    size: input.content.byteLength,
    hash: createHash("sha256").update(input.content).digest("hex"),
    uploadedAt: input.uploadedAt.toISOString(),
    sourceDevice: input.sourceDevice,
  };

  await mkdir(path.dirname(targetPath), { recursive: true });
  await mkdir(config.metadataDir, { recursive: true });
  await writeFile(targetPath, input.content);

  const database = openDatabase(config);
  try {
    insertMediaRecord(database, record);
  } finally {
    database.close();
  }

  return record;
}

async function listMedia(config: AgentConfig): Promise<MediaRecord[]> {
  await mkdir(config.metadataDir, { recursive: true });
  const database = openDatabase(config);

  try {
    const rows = database
      .prepare(
        `SELECT id,
                original_name AS originalName,
                relative_path AS relativePath,
                file_type AS fileType,
                mime_type AS mimeType,
                size,
                hash,
                uploaded_at AS uploadedAt,
                source_device AS sourceDevice
           FROM media_files
          ORDER BY uploaded_at DESC`,
      )
      .all() as MediaRecord[];

    return rows;
  } finally {
    database.close();
  }
}

async function getMedia(config: AgentConfig, id: string): Promise<MediaRecord | null> {
  await mkdir(config.metadataDir, { recursive: true });
  const database = openDatabase(config);

  try {
    const row = database
      .prepare(
        `SELECT id,
                original_name AS originalName,
                relative_path AS relativePath,
                file_type AS fileType,
                mime_type AS mimeType,
                size,
                hash,
                uploaded_at AS uploadedAt,
                source_device AS sourceDevice
           FROM media_files
          WHERE id = ?`,
      )
      .get(id) as MediaRecord | undefined;

    return row ?? null;
  } finally {
    database.close();
  }
}

function openDatabase(config: AgentConfig): DatabaseSync {
  const database = new DatabaseSync(path.join(config.metadataDir, "index.sqlite"));

  database.exec(`
    CREATE TABLE IF NOT EXISTS media_files (
      id TEXT PRIMARY KEY,
      original_name TEXT NOT NULL,
      relative_path TEXT NOT NULL,
      file_type TEXT NOT NULL,
      mime_type TEXT NOT NULL,
      size INTEGER NOT NULL,
      hash TEXT NOT NULL,
      uploaded_at TEXT NOT NULL,
      source_device TEXT NOT NULL
    );
  `);

  return database;
}

function insertMediaRecord(database: DatabaseSync, record: MediaRecord): void {
  database
    .prepare(
      `INSERT INTO media_files (
        id,
        original_name,
        relative_path,
        file_type,
        mime_type,
        size,
        hash,
        uploaded_at,
        source_device
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .run(
      record.id,
      record.originalName,
      record.relativePath,
      record.fileType,
      record.mimeType,
      record.size,
      record.hash,
      record.uploadedAt,
      record.sourceDevice,
    );
}

function detectFileType(mimeType: string): MediaFileType {
  if (mimeType.startsWith("image/")) {
    return "photo";
  }

  if (mimeType.startsWith("video/")) {
    return "video";
  }

  throw new Error("Only photo and video uploads are supported");
}

function dateDirectory(date: Date): string {
  const year = String(date.getFullYear());
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return path.join(year, month, day);
}

function safeExtension(originalName: string, mimeType: string): string {
  const extension = path.extname(originalName).toLowerCase();

  if (extension && /^[a-z0-9.]+$/.test(extension)) {
    return extension;
  }

  if (mimeType === "image/jpeg") {
    return ".jpg";
  }

  if (mimeType === "image/png") {
    return ".png";
  }

  if (mimeType === "video/mp4") {
    return ".mp4";
  }

  return "";
}
