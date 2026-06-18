# MiniNAS Desktop Agent

Windows background agent for the MiniNAS project.

## Current MVP Status

This first slice provides:

- Config derived from the `E:\MiniNAS` project root.
- Safe path resolution restricted to the `data` directory.
- Local HTTP server.
- `GET /health`
- `GET /devices/current`
- `POST /media` for photo/video upload.
- `GET /media` for indexed media listing.

## Development

```powershell
npm install
npm test
npm run dev
```

Default local URL:

```text
http://127.0.0.1:48731
```

Health check:

```text
http://127.0.0.1:48731/health
```

Upload a photo/video:

```http
POST http://127.0.0.1:48731/media
Content-Type: application/json

{
  "originalName": "phone.jpg",
  "mimeType": "image/jpeg",
  "contentBase64": "...",
  "sourceDevice": "iphone"
}
```

List uploads:

```text
http://127.0.0.1:48731/media
```
