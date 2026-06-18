# MiniNAS Desktop Agent

Windows background agent for the MiniNAS project.

## Current MVP Status

This first slice provides:

- Config derived from the `E:\MiniNAS` project root.
- Safe path resolution restricted to the `data` directory.
- Local HTTP server.
- `GET /health`
- `GET /devices/current`

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

