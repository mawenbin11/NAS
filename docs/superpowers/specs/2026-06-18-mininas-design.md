# MiniNAS WeChat Mini Program Design

## Goal

Build a private MiniNAS system that lets a phone upload photos and videos to a Windows computer through a WeChat mini program, then browse those files by timeline and file type. The first version focuses on LAN usage. Remote access will be added later without changing the local storage model.

## Project Layout

```text
E:\MiniNAS\
  app\                 WeChat mini program source
  desktop-agent\       Windows background agent source, config, and logs
  data\                User photos and videos
  data\.mininas\       Internal index database, thumbnails, metadata
  docs\                Design and planning documents
```

The mini program can only access whitelisted storage directories. For MVP, the only exposed directory is `E:\MiniNAS\data`.

## Scope

### MVP

- Single-user private NAS flow.
- Bind one or more computers to the mini program.
- Use Windows computer name as default device name and allow custom aliases.
- Upload photos and videos from phone albums.
- Save uploaded files into date-based folders.
- Browse files by upload timeline.
- Browse files by type: photos and videos.
- Preview/download files from the mini program.
- Run a Windows desktop agent as a background service with startup support.
- Keep a local SQLite index for metadata and browsing.
- Use binding tokens and short-lived access tokens for LAN requests.
- No delete, rename, or move operations in the first version.

### Later Phases

- Add a second user, then expand to shared-family or team permissions.
- Add arbitrary file upload from chat files or phone file picker.
- Add remote access through a cloud gateway.
- Add optional version history for same-name documents if needed.
- Add richer file operations after permission and audit logs are stable.

## Architecture

### WeChat Mini Program

The mini program is the phone UI. It handles device binding, current-device selection, media upload, timeline browsing, type browsing, preview, and save/download actions.

Core pages:

- Device page: bound computers, online/offline status, LAN address, alias editing, scan-to-bind.
- Upload page: select photos/videos, upload queue, per-file progress, success/failure summary.
- Timeline page: browse photos/videos grouped by day and month.
- Type page: browse by photos and videos.

### Windows Desktop Agent

The desktop agent runs on the computer and exposes a local HTTP API over the LAN. It owns storage, indexing, thumbnails, binding, startup behavior, and logs.

Core responsibilities:

- Serve only whitelisted directories.
- Receive uploads from bound mini program clients.
- Save files under date-based folders.
- Maintain SQLite metadata.
- Generate image thumbnails and video covers.
- Provide list, preview, and download APIs.
- Show local control panel with service status, data directory, binding QR code, startup toggle, and logs.
- Support manual startup for development and auto-start for daily use.

### Local Index

The desktop agent stores metadata in SQLite under `E:\MiniNAS\data\.mininas`.

Initial metadata fields:

- File ID
- Original filename
- Stored relative path
- File type
- MIME type
- Size
- Hash
- Upload time
- Capture time if available
- Source device
- Thumbnail path
- Duration for videos

Mini program APIs use file IDs and relative metadata. They do not expose raw Windows disk paths.

## Data Flow

### LAN Upload

1. Desktop agent starts and loads the configured data directory.
2. Mini program selects the current bound computer.
3. User selects photos/videos from the phone album.
4. Mini program uploads files to the desktop agent over LAN.
5. Desktop agent validates the binding token, access token, file type, and size.
6. Desktop agent saves files under `E:\MiniNAS\data\YYYY\MM\DD\`.
7. Desktop agent inserts or updates SQLite metadata.
8. Desktop agent generates thumbnails/video covers.
9. Mini program refreshes the timeline and type views.

### LAN Browsing

1. Mini program requests timeline or type lists.
2. Desktop agent reads metadata from SQLite and verifies files still exist.
3. Mini program displays grouped results.
4. User taps an item to preview or download.
5. Desktop agent streams the file or preview by file ID.

## Binding And Multi-Computer Support

Each desktop agent has a device ID and device secret. During binding, the desktop agent displays a QR code or pairing code. The mini program scans it and stores the device profile.

Device profile fields:

- Device ID
- Default computer name
- Custom alias
- LAN address
- Last seen time
- Online/offline status
- Binding token

Multiple computers appear in the device list. The mini program can switch the current target computer before upload or browsing.

## Security

- First version only exposes `E:\MiniNAS\data`.
- All requests require a valid binding.
- Each desktop agent has an independent device secret.
- Mini program requests use short-lived access tokens.
- Files are referenced by internal file IDs, not absolute paths.
- Upload allowlist is limited to photos and videos.
- No delete, rename, or move operations in MVP.
- Desktop agent writes upload and access logs.
- Path traversal attempts and unrecognized file IDs are rejected.

## Remote Access Phase

Remote access should be added after the LAN MVP is stable.

Planned model:

- Add a cloud gateway service.
- Mini program connects to the gateway when not on the same LAN.
- Desktop agent keeps an outbound connection to the gateway, avoiding router port forwarding.
- Gateway handles authentication, device online discovery, and request forwarding.
- User files remain stored on the computer by default.
- Optional remote cache or end-to-end encryption can be added later.

## Technology Direction

Recommended first implementation:

- Mini program: native WeChat mini program with TypeScript.
- Desktop agent: Node.js service with TypeScript.
- Local API: HTTP on LAN, later WebSocket or tunnel for remote access.
- Index: SQLite.
- Media processing: image thumbnails first; video cover generation can use ffmpeg if available or be staged later.
- Version control: Git repository rooted at `E:\MiniNAS`.
- GitHub: private repository recommended until the MVP is stable.

## Testing Plan

MVP verification should include:

- Bind the test Windows computer.
- Upload one photo and one video from the mini program.
- Confirm files appear under `E:\MiniNAS\data\YYYY\MM\DD\`.
- Confirm metadata appears in SQLite.
- Confirm timeline list returns uploaded files.
- Confirm type list separates photos and videos.
- Confirm preview/download works by file ID.
- Confirm requests outside the whitelist are rejected.
- Confirm unbound requests are rejected.
- Confirm desktop agent can start manually and after system startup.

